import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { resolveContentLinkAttributes } from '../../../../lib/contentLinkUtils';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';
import ContentButtonPanel from './ContentButtonPanel';
import { VARIANT_STYLES } from './contentButtonPresets';

function parseBooleanAttribute(value, fallback = false) {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'boolean') return value;

    const normalized = String(value).toLowerCase();

    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;

    return fallback;
}

function parseIntegerAttribute(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function getStyleProperty(el, propertyName) {
    return el?.style?.[propertyName] || '';
}

function buildButtonStyle(attrs) {
    const style = {};
    if (attrs.bgColor) {
        style.background = attrs.bgColor;
        style.boxShadow = `0 4px 14px ${attrs.bgColor}40`;
    }
    if (attrs.textColor) style.color = attrs.textColor;
    if (attrs.bold)      style.fontWeight = '700';
    if (attrs.italic)    style.fontStyle = 'italic';
    style.textDecoration = attrs.underline ? 'underline' : 'none';
    if (attrs.uppercase) style.textTransform = 'uppercase';
    if (attrs.fontSize)  style.fontSize = `${attrs.fontSize}px`;
    if (attrs.rounded)   style.borderRadius = `${attrs.rounded}px`;
    return style;
}

function ContentButtonView({ node, updateAttributes, selected, deleteNode }) {
    const hasCustomColor = !!node.attrs.bgColor;
    const variantClass = hasCustomColor ? '' : (VARIANT_STYLES[node.attrs.variant] || VARIANT_STYLES.primary);
    const customStyle = buildButtonStyle(node.attrs);
    const [isCustomizationOpen, setIsCustomizationOpen] = useState(true);

    useEffect(() => {
        if (selected) {
            setIsCustomizationOpen(true);
        }
    }, [selected]);


    // Los botones de variante llevan texto blanco; sin esto el color por defecto de <a> en el navegador pisa el de Tailwind
    const variantInlineStyle = !hasCustomColor ? {
        color: node.attrs.variant === 'outline' ? undefined : '#ffffff',
        textDecoration: node.attrs.underline ? 'underline' : 'none',
    } : {};

    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            onSecondaryAction={() => setIsCustomizationOpen(open => !open)}
            secondaryActionLabel={isCustomizationOpen ? 'Colapsar personalizacion' : 'Abrir personalizacion'}
            secondaryActionPressed={isCustomizationOpen}
            renderSecondaryIcon={() => (
                <svg className={`h-4 w-4 transition-transform ${isCustomizationOpen ? '' : 'rotate-180'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            )}
            dragHandle
            frameClassName="inline-block"
        >
            <div className={`group/cta relative inline-block ${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-transparent rounded-xl p-2' : ''}`} contentEditable={false}>
                {/* Asa para arrastrar */}
                <div
                    className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover/cta:opacity-60 hover:!opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
                    contentEditable={false}
                    draggable="true"
                    data-drag-handle=""
                >
                    <svg className="w-4 h-4 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
                </div>
                <a
                    {...resolveContentLinkAttributes({
                        href: node.attrs.documentUrl || node.attrs.href,
                        target: node.attrs.documentUrl ? '_self' : (node.attrs.newTab ? '_blank' : '_self'),
                        rel: 'noopener noreferrer',
                    })}
                    {...(node.attrs.documentUrl ? { download: node.attrs.documentFilename || '' } : {})}
                    className={`inline-block px-6 py-3 text-sm transition-all cursor-pointer ${variantClass} ${!hasCustomColor ? 'rounded-xl font-semibold' : ''}`}
                    style={{
                        ...customStyle,
                        ...variantInlineStyle,
                        ...(!hasCustomColor ? {} : { borderRadius: `${node.attrs.rounded || 12}px` }),
                    }}
                    onClick={e => e.preventDefault()}
                    contentEditable={false}
                >
                    {node.attrs.documentUrl && <span className="mr-1.5">📎</span>}{node.attrs.text}
                </a>


                {selected && isCustomizationOpen && (
                    <ContentButtonPanel attrs={node.attrs} updateAttributes={updateAttributes} />
                )}
                {selected && !isCustomizationOpen && (
                    <div
                        className="mt-3 flex max-w-md items-center justify-between gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--text-secondary)]"
                        contentEditable={false}
                        onClick={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <span className="font-medium text-[var(--text-primary)]">Personalizacion CTA colapsada</span>
                        <button
                            type="button"
                            onClick={() => setIsCustomizationOpen(true)}
                            className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-fuchsia-500/50 hover:text-fuchsia-400"
                        >
                            Abrir panel
                        </button>
                    </div>
                )}
            </div>
        </RichBlockFrame>
    );
}

export const ContentButtonExtension = Node.create({
    name: 'contentButton',
    group: 'block',
    atom: true,
    draggable: true,
    addAttributes() {
        return {
            text: {
                default: 'Click aquí',
                parseHTML: el => el.getAttribute('data-text') || el.textContent || 'Click aquí',
                renderHTML: attrs => ({ 'data-text': attrs.text || 'Click aquí' }),
            },
            href: {
                default: '#',
                parseHTML: el => el.getAttribute('data-href') || el.getAttribute('href') || '#',
                renderHTML: attrs => ({ 'data-href': attrs.href || '#' }),
            },
            variant: {
                default: 'primary',
                parseHTML: el => el.getAttribute('data-variant') || Array.from(el.classList).find(cls => cls.startsWith('content-button--'))?.replace('content-button--', '') || 'primary',
                renderHTML: attrs => ({ 'data-variant': attrs.variant || 'primary' }),
            },
            newTab: {
                default: true,
                parseHTML: el => parseBooleanAttribute(el.getAttribute('data-new-tab'), el.getAttribute('target') === '_blank'),
                renderHTML: attrs => ({ 'data-new-tab': String(attrs.newTab !== false) }),
            },
            bgColor: {
                default: '',
                parseHTML: el => el.getAttribute('data-bg-color') || getStyleProperty(el, 'background') || '',
                renderHTML: attrs => attrs.bgColor ? { 'data-bg-color': attrs.bgColor } : {},
            },
            textColor: {
                default: '',
                parseHTML: el => el.getAttribute('data-text-color') || getStyleProperty(el, 'color') || '',
                renderHTML: attrs => attrs.textColor ? { 'data-text-color': attrs.textColor } : {},
            },
            bold: {
                default: false,
                parseHTML: el => parseBooleanAttribute(el.getAttribute('data-bold'), ['bold', '700'].includes(getStyleProperty(el, 'fontWeight'))),
                renderHTML: attrs => attrs.bold ? { 'data-bold': 'true' } : {},
            },
            italic: {
                default: false,
                parseHTML: el => parseBooleanAttribute(el.getAttribute('data-italic'), getStyleProperty(el, 'fontStyle') === 'italic'),
                renderHTML: attrs => attrs.italic ? { 'data-italic': 'true' } : {},
            },
            underline: {
                default: false,
                parseHTML: el => parseBooleanAttribute(el.getAttribute('data-underline'), getStyleProperty(el, 'textDecoration').includes('underline')),
                renderHTML: attrs => attrs.underline ? { 'data-underline': 'true' } : {},
            },
            uppercase: {
                default: false,
                parseHTML: el => parseBooleanAttribute(el.getAttribute('data-uppercase'), getStyleProperty(el, 'textTransform') === 'uppercase'),
                renderHTML: attrs => attrs.uppercase ? { 'data-uppercase': 'true' } : {},
            },
            fontSize: {
                default: 14,
                parseHTML: el => parseIntegerAttribute(el.getAttribute('data-font-size') || getStyleProperty(el, 'fontSize'), 14),
                renderHTML: attrs => ({ 'data-font-size': String(attrs.fontSize || 14) }),
            },
            rounded: {
                default: 12,
                parseHTML: el => parseIntegerAttribute(el.getAttribute('data-rounded') || getStyleProperty(el, 'borderRadius'), 12),
                renderHTML: attrs => ({ 'data-rounded': String(attrs.rounded || 12) }),
            },
            documentUrl: {
                default: '',
                parseHTML: el => el.getAttribute('data-document-url') || '',
                renderHTML: attrs => attrs.documentUrl ? { 'data-document-url': attrs.documentUrl } : {},
            },
            documentFilename: {
                default: '',
                parseHTML: el => el.getAttribute('data-document-filename') || el.getAttribute('download') || '',
                renderHTML: attrs => attrs.documentFilename ? { 'data-document-filename': attrs.documentFilename } : {},
            },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    parseHTML() { return [{ tag: 'a[data-content-button]' }]; },
    renderHTML({ node, HTMLAttributes }) {
        const style = [];
        if (node.attrs.bgColor)   style.push(`background:${node.attrs.bgColor};box-shadow:0 4px 14px ${node.attrs.bgColor}40`);
        if (node.attrs.textColor) style.push(`color:${node.attrs.textColor}`);
        if (node.attrs.bold)      style.push('font-weight:700');
        if (node.attrs.italic)    style.push('font-style:italic');
        style.push(node.attrs.underline ? 'text-decoration:underline' : 'text-decoration:none');
        if (node.attrs.uppercase) style.push('text-transform:uppercase');
        if (node.attrs.fontSize)  style.push(`font-size:${node.attrs.fontSize}px`);
        if (node.attrs.rounded)   style.push(`border-radius:${node.attrs.rounded}px`);
        const htmlAttrs = {
            'data-content-button': '',
            class: `content-button content-button--${node.attrs.variant || 'custom'}`,
            style: style.join(';'),
            'data-text': node.attrs.text || 'Click aquí',
            'data-href': node.attrs.href || '#',
            'data-variant': node.attrs.variant || 'primary',
            'data-new-tab': String(node.attrs.newTab !== false),
            ...(node.attrs.bgColor ? { 'data-bg-color': node.attrs.bgColor } : {}),
            ...(node.attrs.textColor ? { 'data-text-color': node.attrs.textColor } : {}),
            ...(node.attrs.bold ? { 'data-bold': 'true' } : {}),
            ...(node.attrs.italic ? { 'data-italic': 'true' } : {}),
            ...(node.attrs.underline ? { 'data-underline': 'true' } : {}),
            ...(node.attrs.uppercase ? { 'data-uppercase': 'true' } : {}),
            'data-font-size': String(node.attrs.fontSize || 14),
            'data-rounded': String(node.attrs.rounded || 12),
            ...(node.attrs.documentUrl ? { 'data-document-url': node.attrs.documentUrl } : {}),
            ...(node.attrs.documentFilename ? { 'data-document-filename': node.attrs.documentFilename } : {}),
            ...resolveContentLinkAttributes({
                href: node.attrs.documentUrl || node.attrs.href,
                target: node.attrs.documentUrl ? '_self' : (node.attrs.newTab ? '_blank' : '_self'),
                rel: 'noopener noreferrer',
            }),
        };
        if (node.attrs.documentUrl) htmlAttrs.download = node.attrs.documentFilename || '';
        return ['a', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, htmlAttrs)), node.attrs.text];
    },
    addNodeView() { return ReactNodeViewRenderer(ContentButtonView); },
    addCommands() {
        return {
            insertContentButton: (attrs) => ({ commands }) => commands.insertContent({
                type: this.name,
                attrs: { text: 'Click aquí', href: '#', variant: 'primary', newTab: true, ...attrs },
            }),
        };
    },
});