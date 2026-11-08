import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { normalizeContentLinkHref, resolveContentLinkAttributes } from '../../../../lib/contentLinkUtils';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';

// ContentButton: botones CTA dentro del contenido
const VARIANT_STYLES = {
    primary:   'bg-blue-600 text-white shadow-lg shadow-blue-500/25',
    secondary: 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/25',
    fuchsia:   'bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/25',
    outline:   'border-2 border-blue-500 text-blue-400',
    dark:      'bg-zinc-900 text-white shadow-lg shadow-zinc-900/25',
};

const DEFAULT_CTA_COLORS = [
    { label: 'Fuchsia',  bg: '#c026d3', text: '#ffffff' },
    { label: 'Cyan',     bg: '#0891b2', text: '#ffffff' },
    { label: 'Azul',     bg: '#2563eb', text: '#ffffff' },
    { label: 'Verde',    bg: '#16a34a', text: '#ffffff' },
    { label: 'Naranja',  bg: '#ea580c', text: '#ffffff' },
    { label: 'Rojo',     bg: '#dc2626', text: '#ffffff' },
    { label: 'Negro',    bg: '#18181b', text: '#ffffff' },
    { label: 'Blanco',   bg: '#ffffff', text: '#18181b' },
];

const CTA_PRESETS_KEY = 'cta_custom_presets';
const CTA_BUTTON_CONFIGS_KEY = 'cta_button_configs';

function loadCustomPresets() {
    try {
        return JSON.parse(localStorage.getItem(CTA_PRESETS_KEY)) || [];
    } catch { return []; }
}

function saveCustomPresets(presets) {
    localStorage.setItem(CTA_PRESETS_KEY, JSON.stringify(presets));
}

function loadButtonConfigs() {
    try {
        return JSON.parse(localStorage.getItem(CTA_BUTTON_CONFIGS_KEY)) || [];
    } catch { return []; }
}

function saveButtonConfigs(configs) {
    localStorage.setItem(CTA_BUTTON_CONFIGS_KEY, JSON.stringify(configs));
}

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
    const [customPresets, setCustomPresets] = useState(loadCustomPresets);
    const [savedConfigs, setSavedConfigs] = useState(loadButtonConfigs);
    const [showSaveConfig, setShowSaveConfig] = useState(false);
    const [configName, setConfigName] = useState('');
    const allColorPresets = [...DEFAULT_CTA_COLORS, ...customPresets];
    const { token } = useAuth();
    const ctaDocRef = useRef(null);
    const [docUploading, setDocUploading] = useState(false);
    const [isCustomizationOpen, setIsCustomizationOpen] = useState(true);

    useEffect(() => {
        if (selected) {
            setIsCustomizationOpen(true);
        }
    }, [selected]);

    async function handleCtaDocUpload(e) {
        const file = e.target.files?.[0];
        if (!file || !token) return;
        setDocUploading(true);
        try {
            const fd = new FormData();
            fd.append('document', file);
            const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bitacora/upload-document`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            if (!res.ok) throw new Error('Error uploading document');
            const data = await res.json();
            updateAttributes({ documentUrl: data.url, documentFilename: data.filename });
        } catch (err) { console.error(err); }
        finally { setDocUploading(false); e.target.value = ''; }
    }

    function handleSaveColorPreset() {
        if (!node.attrs.bgColor) return;
        const existing = customPresets.find(p => p.bg === node.attrs.bgColor);
        if (existing) return;
        const name = `Custom ${customPresets.length + 1}`;
        const updated = [...customPresets, { label: name, bg: node.attrs.bgColor, text: node.attrs.textColor || '#ffffff', custom: true }];
        setCustomPresets(updated);
        saveCustomPresets(updated);
    }

    function handleDeletePreset(bg) {
        const updated = customPresets.filter(p => p.bg !== bg);
        setCustomPresets(updated);
        saveCustomPresets(updated);
    }

    function handleSaveButtonConfig() {
        const name = configName.trim() || `Preset ${savedConfigs.length + 1}`;
        const config = {
            name,
            bgColor: node.attrs.bgColor,
            textColor: node.attrs.textColor,
            variant: node.attrs.variant,
            bold: node.attrs.bold,
            italic: node.attrs.italic,
            underline: node.attrs.underline,
            uppercase: node.attrs.uppercase,
            fontSize: node.attrs.fontSize,
            rounded: node.attrs.rounded,
        };
        const updated = [...savedConfigs, config];
        setSavedConfigs(updated);
        saveButtonConfigs(updated);
        setShowSaveConfig(false);
        setConfigName('');
    }

    function handleLoadConfig(config) {
        updateAttributes({
            bgColor: config.bgColor || '',
            textColor: config.textColor || '',
            variant: config.variant || 'primary',
            bold: config.bold || false,
            italic: config.italic || false,
            underline: config.underline || false,
            uppercase: config.uppercase || false,
            fontSize: config.fontSize || 14,
            rounded: config.rounded || 12,
        });
    }

    function handleDeleteConfig(idx) {
        const updated = savedConfigs.filter((_, i) => i !== idx);
        setSavedConfigs(updated);
        saveButtonConfigs(updated);
    }

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
                    <div className="mt-3 max-w-md space-y-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-4"
                         contentEditable={false}
                         onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>

                        {/* Configs guardados */}
                        {savedConfigs.length > 0 && (
                            <div>
                                <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Mis configuraciones guardadas</label>
                                <div className="flex gap-1.5 flex-wrap">
                                    {savedConfigs.map((cfg, i) => (
                                        <div key={i} className="relative group/cfg">
                                            <button
                                                type="button"
                                                onClick={() => handleLoadConfig(cfg)}
                                                className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-fuchsia-500/50 hover:text-fuchsia-400 transition-all flex items-center gap-1.5"
                                            >
                                                <span className="w-3 h-3 rounded-full shrink-0 border border-white/20" style={{ background: cfg.bgColor || '#2563eb' }} />
                                                {cfg.name}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteConfig(i)}
                                                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] leading-none flex items-center justify-center opacity-0 group-hover/cfg:opacity-100 transition-opacity shadow"
                                                title="Eliminar"
                                            >×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Texto y Enlace */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1">Texto</label>
                                <input
                                    value={node.attrs.text}
                                    onChange={e => updateAttributes({ text: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500/60"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1">Enlace</label>
                                    <input
                                        value={node.attrs.href}
                                        onChange={e => updateAttributes({ href: normalizeContentLinkHref(e.target.value) })}
                                        placeholder="https://…"
                                        className="w-full px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500/60"
                                    />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Posicion en el contenido</label>
                            <div className="flex gap-1.5">
                                {[
                                    { key: 'left', label: 'Izquierda' },
                                    { key: 'center', label: 'Centrado' },
                                    { key: 'right', label: 'Derecha' },
                                ].map(option => (
                                    <button
                                        key={option.key}
                                        type="button"
                                        onClick={() => updateAttributes({ textAlign: option.key })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                            (node.attrs.textAlign || 'left') === option.key
                                                ? 'bg-fuchsia-500 text-white'
                                                : 'bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)]'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Formato de texto */}
                        <div>
                            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Formato del texto</label>
                            <div className="flex gap-1">
                                {[
                                    { key: 'bold',      icon: 'B',  title: 'Negrita',   cls: 'font-bold' },
                                    { key: 'italic',    icon: 'I',  title: 'Cursiva',   cls: 'italic' },
                                    { key: 'underline', icon: 'U̲',  title: 'Subrayado', cls: '' },
                                    { key: 'uppercase', icon: 'AA', title: 'Mayúsculas', cls: 'text-[10px]' },
                                ].map(opt => (
                                    <button
                                        key={opt.key}
                                        type="button"
                                        title={opt.title}
                                        onClick={() => updateAttributes({ [opt.key]: !node.attrs[opt.key] })}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all ${opt.cls} ${
                                            node.attrs[opt.key]
                                                ? 'bg-fuchsia-500/20 text-fuchsia-400 ring-1 ring-fuchsia-500/40'
                                                : 'bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                        }`}
                                    >{opt.icon}</button>
                                ))}
                                <div className="mx-1 w-px bg-[var(--border-color)]" />
                                <select
                                    value={node.attrs.fontSize || 14}
                                    onChange={e => updateAttributes({ fontSize: Number(e.target.value) })}
                                    className="h-8 px-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] outline-none"
                                    title="Tamaño de fuente"
                                >
                                    {[12, 13, 14, 15, 16, 18, 20, 24].map(s => (
                                        <option key={s} value={s}>{s}px</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Colores */}
                        <div>
                            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Color del botón</label>
                            <div className="flex gap-1.5 flex-wrap items-center">
                                {allColorPresets.map(c => (
                                    <div key={c.bg + c.label} className="relative group/preset">
                                        <button
                                            type="button"
                                            title={c.label}
                                            onClick={() => updateAttributes({ bgColor: c.bg, textColor: c.text, variant: '' })}
                                            className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                                                node.attrs.bgColor === c.bg ? 'ring-2 ring-fuchsia-400 ring-offset-1 ring-offset-[var(--bg-elevated)] scale-110' : 'border-transparent'
                                            }`}
                                            style={{ background: c.bg }}
                                        />
                                        {c.custom && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleDeletePreset(c.bg); }}
                                                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] leading-none flex items-center justify-center opacity-0 group-hover/preset:opacity-100 transition-opacity shadow"
                                                title="Eliminar preset"
                                            >×</button>
                                        )}
                                    </div>
                                ))}
                                <div className="mx-0.5 w-px h-6 bg-[var(--border-color)]" />
                                <label className="relative cursor-pointer" title="Color personalizado">
                                    <input
                                        type="color"
                                        value={node.attrs.bgColor || '#2563eb'}
                                        onChange={e => updateAttributes({ bgColor: e.target.value, variant: '' })}
                                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                    />
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-dashed border-[var(--border-color)] text-[var(--text-muted)] text-xs hover:border-fuchsia-500/50">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.8 1.7-1.7 0-.4-.2-.8-.4-1.1-.2-.3-.4-.6-.4-1 0-.9.8-1.7 1.7-1.7H16c3.3 0 6-2.7 6-6 0-5.5-4.5-9.5-10-9.5z"/><circle cx="7.5" cy="11.5" r="1.5"/><circle cx="10.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="11.5" r="1.5"/><circle cx="13.5" cy="7.5" r="1.5"/></svg>
                                    </span>
                                </label>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <label className="text-[10px] text-[var(--text-muted)]">Texto:</label>
                                <input
                                    type="color"
                                    value={node.attrs.textColor || '#ffffff'}
                                    onChange={e => updateAttributes({ textColor: e.target.value })}
                                    className="w-6 h-6 rounded cursor-pointer border border-[var(--border-color)]"
                                />
                                <span className="text-[10px] text-[var(--text-muted)] font-mono">{node.attrs.textColor || '#ffffff'}</span>
                                {node.attrs.bgColor && !allColorPresets.find(p => p.bg === node.attrs.bgColor) && (
                                    <button
                                        type="button"
                                        onClick={handleSaveColorPreset}
                                        className="ml-auto text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                        title="Guardar este color como preset"
                                    >
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14"/></svg>
                                        Guardar color
                                    </button>
                                )}
                                {node.attrs.bgColor && (
                                    <button
                                        type="button"
                                        onClick={() => updateAttributes({ bgColor: '', textColor: '', variant: 'primary' })}
                                        className={`text-[10px] text-[var(--text-muted)] hover:text-red-400 underline ${allColorPresets.find(p => p.bg === node.attrs.bgColor) ? 'ml-auto' : ''}`}
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Estilo preset */}
                        {!hasCustomColor && (
                            <div>
                                <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1">Estilo preset</label>
                                <div className="flex gap-1.5 mt-1 flex-wrap">
                                    {Object.keys(VARIANT_STYLES).map(v => (
                                        <button
                                            key={v} type="button"
                                            onClick={() => updateAttributes({ variant: v })}
                                            className={`px-3 py-1 rounded-lg text-xs capitalize transition-colors ${
                                                node.attrs.variant === v
                                                    ? 'bg-fuchsia-500 text-white'
                                                    : 'bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)]'
                                            }`}
                                        >{v}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bordes y opciones */}
                        <div className="flex items-center gap-3 pt-1 border-t border-[var(--border-default)]">
                            <div className="flex items-center gap-1.5">
                                <label className="text-[10px] text-[var(--text-muted)]">Radio:</label>
                                <input
                                    type="range" min="0" max="50" step="2"
                                    value={node.attrs.rounded || 12}
                                    onChange={e => updateAttributes({ rounded: Number(e.target.value) })}
                                    className="w-20 h-1 accent-fuchsia-500"
                                />
                                <span className="text-[10px] text-[var(--text-muted)] font-mono w-6">{node.attrs.rounded || 12}</span>
                            </div>
                            <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] cursor-pointer ml-auto">
                                <input
                                    type="checkbox"
                                    checked={node.attrs.newTab}
                                    onChange={e => updateAttributes({ newTab: e.target.checked })}
                                    className="rounded accent-fuchsia-500"
                                />
                                Nueva pestaña
                            </label>
                        </div>

                        {/* Documento descargable */}
                        <div className="pt-1 border-t border-[var(--border-default)]">
                            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Documento descargable</label>
                            {node.attrs.documentUrl ? (
                                <div className="flex items-center gap-2 p-2 bg-[var(--bg-surface)] rounded-lg">
                                    <span className="text-lg">📎</span>
                                    <span className="text-xs text-[var(--text-primary)] truncate flex-1">{node.attrs.documentFilename}</span>
                                    <button type="button" onClick={() => updateAttributes({ documentUrl: '', documentFilename: '' })}
                                        className="text-xs text-red-400 hover:text-red-300 transition-colors">✕</button>
                                </div>
                            ) : (
                                <button type="button" onClick={() => ctaDocRef.current?.click()} disabled={docUploading}
                                    className="w-full py-2 rounded-xl text-xs font-medium border border-dashed border-[var(--border-color)] text-[var(--text-muted)] hover:text-fuchsia-400 hover:border-fuchsia-500/50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
                                    {docUploading ? (
                                        <div className="w-3.5 h-3.5 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
                                    ) : (
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                    )}
                                    Subir documento
                                </button>
                            )}
                            <input ref={ctaDocRef} type="file" accept=".pdf,.zip,.docx,.doc" className="hidden" onChange={handleCtaDocUpload} />
                        </div>

                        {/* Guardar configuración completa */}
                        <div className="pt-1 border-t border-[var(--border-default)]">
                            {!showSaveConfig ? (
                                <button
                                    type="button"
                                    onClick={() => setShowSaveConfig(true)}
                                    className="w-full py-2 rounded-xl text-xs font-medium bg-fuchsia-500/10 text-fuchsia-400 hover:bg-fuchsia-500/20 transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                                    Guardar esta configuración
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        value={configName}
                                        onChange={e => setConfigName(e.target.value)}
                                        placeholder="Nombre del preset…"
                                        className="flex-1 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] outline-none focus:border-fuchsia-500/60"
                                        autoFocus
                                        onKeyDown={e => { if (e.key === 'Enter') handleSaveButtonConfig(); if (e.key === 'Escape') setShowSaveConfig(false); }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSaveButtonConfig}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-fuchsia-500 text-white hover:bg-fuchsia-600 transition-colors"
                                    >Guardar</button>
                                    <button
                                        type="button"
                                        onClick={() => setShowSaveConfig(false)}
                                        className="px-2 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                    >×</button>
                                </div>
                            )}
                        </div>
                    </div>
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
