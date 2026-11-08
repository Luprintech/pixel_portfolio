// Vista del diagrama Mermaid: render, edición del código y opciones de aspecto.
import mermaid from 'mermaid';
import { useRef, useEffect, useState } from 'react';
import RichBlockFrame from '../RichBlockFrame';
import { MERMAID_BG_COLORS, MERMAID_PADDING_OPTIONS, MERMAID_SIZE_OPTIONS, MERMAID_TEMPLATE_OPTIONS, MERMAID_TEMPLATES, MERMAID_THEMES } from '../diagramConfig';

mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });

let mermaidCounter = 0;

export function MermaidView({ node, updateAttributes, selected, deleteNode }) {
    const [editing, setEditing]     = useState(false);
    const [settings, setSettings]   = useState(false);
    const [localCode, setLocalCode] = useState(node.attrs.code || '');
    const [svg, setSvg]             = useState('');
    const [error, setError]         = useState('');
    const idRef = useRef(`mermaid-${++mermaidCounter}`);

    const theme = node.attrs.theme || 'dark';
    const bgColor = node.attrs.bgColor || '#0f172a';
    const borderColor = node.attrs.borderColor || '';
    const title = node.attrs.title || '';
    const caption = node.attrs.caption || '';
    const size = node.attrs.size || 'standard';
    const padding = node.attrs.padding || 'md';
    const sizeConfig = MERMAID_SIZE_OPTIONS.find(option => option.value === size) || MERMAID_SIZE_OPTIONS[1];
    const paddingConfig = MERMAID_PADDING_OPTIONS.find(option => option.value === padding) || MERMAID_PADDING_OPTIONS[1];

    useEffect(() => {
        renderDiagram(node.attrs.code || '', node.attrs.theme || 'dark');
    }, [node.attrs.code, node.attrs.theme]);

    async function renderDiagram(code, themeVal) {
        if (!code.trim()) return;
        try {
            mermaid.initialize({ startOnLoad: false, theme: themeVal || 'dark', securityLevel: 'loose' });
            idRef.current = `mermaid-${++mermaidCounter}`;
            const { svg: result } = await mermaid.render(idRef.current, code);
            setSvg(result);
            setError('');
        } catch {
            setError('Error de sintaxis en el diagrama');
            setSvg('');
        }
    }

    function saveCode() {
        updateAttributes({ code: localCode });
        setEditing(false);
    }

    function insertTemplate(key) {
        const tpl = MERMAID_TEMPLATES[key];
        if (tpl) {
            setLocalCode(tpl);
            updateAttributes({ code: tpl });
        }
    }

    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            wrapperClassName="my-4"
            frameClassName="w-full"
        >
            <div className={`mx-auto border rounded-xl overflow-hidden ${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-transparent' : ''}`}
                 contentEditable={false}
                 style={{ borderColor: borderColor || 'var(--border-color)', width: '100%', maxWidth: sizeConfig.maxWidth }}>

                {/* Header bar */}
                <div className="flex items-center justify-between px-4 py-2" style={{ background: bgColor, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-fuchsia-400 font-mono font-semibold tracking-wide">DIAGRAM</span>
                        {title && <span className="text-xs text-[var(--text-muted)] ml-1">— {title}</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button type="button"
                            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setSettings(v => !v); setEditing(false); }}
                            className={`text-[11px] px-2.5 py-1 rounded-md cursor-pointer transition-all ${settings ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-white/5 border border-white/10 text-[#94a3b8] hover:text-white'}`}>
                            ⚙ Personalizar
                        </button>
                        <button type="button"
                            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setLocalCode(node.attrs.code); setEditing(v => !v); setSettings(false); }}
                            className={`text-[11px] px-2.5 py-1 rounded-md cursor-pointer transition-all ${editing ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 border border-white/10 text-[#94a3b8] hover:text-white'}`}>
                            {editing ? '✕ Cerrar' : '✏ Editar'}
                        </button>
                    </div>
                </div>

                {/* Settings panel */}
                {settings && (
                    <div className="p-4 space-y-3 border-b border-white/8" style={{ background: bgColor }}
                         contentEditable={false}
                         onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>

                        {/* Title */}
                        <div>
                            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1">Título del diagrama</label>
                            <input
                                value={title}
                                onChange={e => updateAttributes({ title: e.target.value })}
                                placeholder="Ej: Arquitectura del sistema"
                                className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500/60"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1">Caption</label>
                            <input
                                value={caption}
                                onChange={e => updateAttributes({ caption: e.target.value })}
                                placeholder="Texto de apoyo o contexto breve"
                                className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500/60"
                            />
                        </div>

                        {/* Theme */}
                        <div>
                            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Tema Mermaid</label>
                            <div className="flex gap-1.5 flex-wrap">
                                {MERMAID_THEMES.map(t => (
                                    <button key={t.value} type="button"
                                        onClick={() => updateAttributes({ theme: t.value })}
                                        className={`px-3 py-1 rounded-lg text-xs capitalize transition-colors ${
                                            theme === t.value
                                                ? 'bg-fuchsia-500 text-white'
                                                : 'bg-white/5 border border-white/10 text-[var(--text-secondary)]'
                                        }`}>{t.label}</button>
                                ))}
                            </div>
                        </div>

                        {/* Background color */}
                        <div>
                            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Color de fondo</label>
                            <div className="flex gap-1.5 items-center flex-wrap">
                                {MERMAID_BG_COLORS.map(c => (
                                    <button key={c.value} type="button" title={c.label}
                                        onClick={() => updateAttributes({ bgColor: c.value })}
                                        className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                                            bgColor === c.value ? 'ring-2 ring-fuchsia-400 ring-offset-1 ring-offset-transparent scale-110' : 'border-white/20'
                                        }`} style={{ background: c.value }} />
                                ))}
                                <div className="mx-0.5 w-px h-6 bg-white/10" />
                                <label className="relative cursor-pointer" title="Color personalizado">
                                    <input type="color" value={bgColor}
                                        onChange={e => updateAttributes({ bgColor: e.target.value })}
                                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-dashed border-white/20 text-[var(--text-muted)] text-xs hover:border-fuchsia-500/50">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.8 1.7-1.7 0-.4-.2-.8-.4-1.1-.2-.3-.4-.6-.4-1 0-.9.8-1.7 1.7-1.7H16c3.3 0 6-2.7 6-6 0-5.5-4.5-9.5-10-9.5z"/><circle cx="7.5" cy="11.5" r="1.5"/><circle cx="10.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="11.5" r="1.5"/><circle cx="13.5" cy="7.5" r="1.5"/></svg>
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Border color */}
                        <div className="flex items-center gap-3">
                            <label className="text-[10px] text-[var(--text-muted)]">Borde:</label>
                            <input type="color" value={borderColor || '#334155'}
                                onChange={e => updateAttributes({ borderColor: e.target.value })}
                                className="w-6 h-6 rounded cursor-pointer border border-white/10" />
                            <span className="text-[10px] text-[var(--text-muted)] font-mono">{borderColor || 'default'}</span>
                            {borderColor && (
                                <button type="button" onClick={() => updateAttributes({ borderColor: '' })}
                                    className="text-[10px] text-[var(--text-muted)] hover:text-red-400 underline">Reset</button>
                            )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1">Tamano del bloque</label>
                                <select
                                    value={size}
                                    onChange={e => updateAttributes({ size: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500/60"
                                >
                                    {MERMAID_SIZE_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1">Espaciado interno</label>
                                <select
                                    value={padding}
                                    onChange={e => updateAttributes({ padding: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500/60"
                                >
                                    {MERMAID_PADDING_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Quick templates */}
                        <div>
                            <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Plantillas rápidas</label>
                            <div className="flex gap-1.5 flex-wrap">
                                {MERMAID_TEMPLATE_OPTIONS.map(t => (
                                    <button key={t.key} type="button"
                                        onClick={() => insertTemplate(t.key)}
                                        className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-[var(--text-secondary)] hover:border-fuchsia-500/50 hover:text-fuchsia-400 transition-all flex items-center gap-1.5">
                                        <span>{t.icon}</span> {t.shortLabel}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Code editor */}
                {editing && (
                    <div style={{ background: '#0d1117' }} contentEditable={false}>
                        <textarea
                            value={localCode}
                            onChange={e => setLocalCode(e.target.value)}
                            rows={8}
                            style={{ width: '100%', padding: '14px 16px', background: 'transparent', border: 'none', outline: 'none', color: '#cdd6f4', fontFamily: "'Fira Code', monospace", fontSize: 13, lineHeight: 1.65, resize: 'vertical', boxSizing: 'border-box' }}
                        />
                        <div style={{ padding: '8px 12px', display: 'flex', gap: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <button type="button" onClick={saveCode}
                                style={{ padding: '4px 18px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                                Aplicar
                            </button>
                            <button type="button" onClick={() => setEditing(false)}
                                style={{ padding: '4px 12px', background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Diagrama ya renderizado */}
                <div style={{ padding: paddingConfig.padding, background: bgColor, display: 'flex', justifyContent: 'center', minHeight: 80 }}>
                    {error
                        ? <p style={{ color: '#f87171', fontSize: 13, fontFamily: 'monospace' }}>{error}</p>
                        : svg
                            ? <div dangerouslySetInnerHTML={{ __html: svg }} style={{ maxWidth: '100%' }} />
                            : <p style={{ color: '#475569', fontSize: 12 }}>Cargando diagrama…</p>
                    }
                </div>
                {caption ? (
                    <div className="border-t border-white/8 px-4 py-3 text-sm text-[var(--text-muted)]" style={{ background: bgColor }}>
                        {caption}
                    </div>
                ) : null}
            </div>
        </RichBlockFrame>
    );
}
