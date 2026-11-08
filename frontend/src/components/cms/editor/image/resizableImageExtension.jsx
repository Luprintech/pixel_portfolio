// Extensión de imagen de Tiptap que usa la vista redimensionable.
import { ReactNodeViewRenderer } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';
import { normalizeImageCornerRadius, normalizeImageBorderWidth, normalizeImageShadow, normalizeImageHover, parseImageAnnotations } from './imageHelpers';
import { ResizableImageView } from './ResizableImageView';

export const ResizableImageExtension = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width:  { default: null },
            height: { default: null },
            cornerRadius: {
                default: 0,
                parseHTML: element => normalizeImageCornerRadius(element.getAttribute('data-image-radius')),
                renderHTML: attributes => attributes.cornerRadius ? { 'data-image-radius': String(normalizeImageCornerRadius(attributes.cornerRadius)) } : {},
            },
            borderWidth: {
                default: 0,
                parseHTML: element => normalizeImageBorderWidth(element.getAttribute('data-border-width')),
                renderHTML: attributes => attributes.borderWidth ? { 'data-border-width': String(normalizeImageBorderWidth(attributes.borderWidth)) } : {},
            },
            borderColor: {
                default: '',
                parseHTML: element => element.getAttribute('data-border-color') || '',
                renderHTML: attributes => attributes.borderColor ? { 'data-border-color': attributes.borderColor } : {},
            },
            shadowStyle: {
                default: 'none',
                parseHTML: element => normalizeImageShadow(element.getAttribute('data-shadow-style')),
                renderHTML: attributes => normalizeImageShadow(attributes.shadowStyle) !== 'none' ? { 'data-shadow-style': normalizeImageShadow(attributes.shadowStyle) } : {},
            },
            hoverEffect: {
                default: 'none',
                parseHTML: element => normalizeImageHover(element.getAttribute('data-hover-effect')),
                renderHTML: attributes => normalizeImageHover(attributes.hoverEffect) !== 'none' ? { 'data-hover-effect': normalizeImageHover(attributes.hoverEffect) } : {},
            },
            // caption: pie de foto editable, separado de alt (que es accesibilidad).
            caption: {
                default: '',
                parseHTML: element => {
                    // Soporte para HTML nuevo (<figure><img><figcaption>) y legacy (data-caption).
                    const fig = element.closest?.('figure');
                    return fig?.querySelector('figcaption')?.textContent?.trim()
                        || element.getAttribute('data-caption')
                        || '';
                },
                renderHTML: attributes => attributes.caption
                    ? { 'data-caption': attributes.caption }
                    : {},
            },
            annotations: {
                default: [],
                parseHTML: element => parseImageAnnotations(element.getAttribute('data-annotations')),
                renderHTML: attributes => {
                    const annotations = parseImageAnnotations(attributes.annotations);
                    return annotations.length ? { 'data-annotations': JSON.stringify(annotations) } : {};
                },
            },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    renderHTML({ node, HTMLAttributes }) {
        const baseAttrs = getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign);
        const imgAttrs  = mergeAttributes(baseAttrs);

        if (node.attrs.caption) {
            // Emitir <figure> con <figcaption> cuando hay pie de foto.
            return [
                'figure',
                { class: 'image-figure', 'data-align': imgAttrs['data-align'] || '' },
                ['img', imgAttrs],
                ['figcaption', {}, node.attrs.caption],
            ];
        }

        return ['img', imgAttrs];
    },
    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageView);
    },
});
