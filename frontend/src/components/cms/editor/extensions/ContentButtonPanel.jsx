import { useRef, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { normalizeContentLinkHref } from '../../../../lib/contentLinkUtils';
import { VARIANT_STYLES, useCtaPresets } from './contentButtonPresets';

// Panel de personalización del botón CTA: texto, enlace, formato, colores y documento descargable
export default function ContentButtonPanel({ attrs, updateAttributes }) {
    const hasCustomColor = !!attrs.bgColor;
    const { token } = useAuth();
    const presets = useCtaPresets();
    const { allColorPresets, savedConfigs } = presets;
    const [showSaveConfig, setShowSaveConfig] = useState(false);
    const [configName, setConfigName] = useState('');
    const ctaDocRef = useRef(null);
    const [docUploading, setDocUploading] = useState(false);

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
            if (!res.ok) throw new Error('Error al subir el documento');
            const data = await res.json();
            updateAttributes({ documentUrl: data.url, documentFilename: data.filename });
        } catch (err) { console.error(err); }
        finally { setDocUploading(false); e.target.value = ''; }
    }

    function handleSaveColorPreset() {
        presets.saveColorPreset(attrs);
    }

    function handleSaveButtonConfig() {
        presets.saveConfig(configName, attrs);
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

    return (
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
                                onClick={() => presets.deleteConfig(i)}
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
                    value={attrs.text}
                    onChange={e => updateAttributes({ text: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500/60"
                />
            </div>
            <div>
                <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1">Enlace</label>
                    <input
                        value={attrs.href}
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
                            (attrs.textAlign || 'left') === option.key
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
                        onClick={() => updateAttributes({ [opt.key]: !attrs[opt.key] })}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all ${opt.cls} ${
                            attrs[opt.key]
                                ? 'bg-fuchsia-500/20 text-fuchsia-400 ring-1 ring-fuchsia-500/40'
                                : 'bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                    >{opt.icon}</button>
                ))}
                <div className="mx-1 w-px bg-[var(--border-color)]" />
                <select
                    value={attrs.fontSize || 14}
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
                                attrs.bgColor === c.bg ? 'ring-2 ring-fuchsia-400 ring-offset-1 ring-offset-[var(--bg-elevated)] scale-110' : 'border-transparent'
                            }`}
                            style={{ background: c.bg }}
                        />
                        {c.custom && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); presets.deleteColorPreset(c.bg); }}
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
                        value={attrs.bgColor || '#2563eb'}
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
                    value={attrs.textColor || '#ffffff'}
                    onChange={e => updateAttributes({ textColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border border-[var(--border-color)]"
                />
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{attrs.textColor || '#ffffff'}</span>
                {attrs.bgColor && !allColorPresets.find(p => p.bg === attrs.bgColor) && (
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
                {attrs.bgColor && (
                    <button
                        type="button"
                        onClick={() => updateAttributes({ bgColor: '', textColor: '', variant: 'primary' })}
                        className={`text-[10px] text-[var(--text-muted)] hover:text-red-400 underline ${allColorPresets.find(p => p.bg === attrs.bgColor) ? 'ml-auto' : ''}`}
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
                                attrs.variant === v
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
                    value={attrs.rounded || 12}
                    onChange={e => updateAttributes({ rounded: Number(e.target.value) })}
                    className="w-20 h-1 accent-fuchsia-500"
                />
                <span className="text-[10px] text-[var(--text-muted)] font-mono w-6">{attrs.rounded || 12}</span>
            </div>
            <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] cursor-pointer ml-auto">
                <input
                    type="checkbox"
                    checked={attrs.newTab}
                    onChange={e => updateAttributes({ newTab: e.target.checked })}
                    className="rounded accent-fuchsia-500"
                />
                Nueva pestaña
            </label>
        </div>

        {/* Documento descargable */}
        <div className="pt-1 border-t border-[var(--border-default)]">
            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Documento descargable</label>
            {attrs.documentUrl ? (
                <div className="flex items-center gap-2 p-2 bg-[var(--bg-surface)] rounded-lg">
                    <span className="text-lg">📎</span>
                    <span className="text-xs text-[var(--text-primary)] truncate flex-1">{attrs.documentFilename}</span>
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
    );
}
