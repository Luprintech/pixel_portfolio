// Avisos y diagramas.
import { CALLOUT_CONFIG } from '../../callout/calloutConfig';
import { Divider, ToolBtn } from '../ToolbarParts';
import { MERMAID_TEMPLATES, MERMAID_TEMPLATE_OPTIONS } from '../../diagramConfig';
import { createPortal } from 'react-dom';

export default function BlockInsertGroup({
    calloutToolRef,
    editor,
    floatingMenuPosition,
    mermaidToolRef,
    setShowCalloutMenu,
    setShowMermaidMenu,
    showCalloutMenu,
    showMermaidMenu,
    updateFloatingMenuPosition,
}) {
    return (
        <>
            {/* Callout */}
            <div ref={calloutToolRef} className="relative" onMouseDown={e => e.stopPropagation()}>
                <ToolBtn
                    onClick={() => {
                        if (!showCalloutMenu) updateFloatingMenuPosition('callout', calloutToolRef.current, 144);
                        setShowCalloutMenu(p => !p);
                    }}
                    active={editor.isActive('callout')}
                    title="Insertar callout (TIP / NOTE / WARNING / INFO)"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </ToolBtn>
                {showCalloutMenu && typeof document !== 'undefined' && createPortal(
                    <div
                        className="fixed z-[220] p-2 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl flex flex-col gap-1 w-36"
                        style={{ top: `${floatingMenuPosition.callout.top}px`, left: `${floatingMenuPosition.callout.left}px` }}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        {Object.entries(CALLOUT_CONFIG).map(([k, v]) => (
                            <button
                                key={k} type="button"
                                onClick={() => { editor.chain().focus().insertCallout(k).run(); setShowCalloutMenu(false); }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-sm text-[var(--text-secondary)] text-left"
                            >
                                <span>{v.icon}</span>
                                <span style={{ color: v.border, fontWeight: 700, fontSize: 11 }}>{v.label}</span>
                            </button>
                        ))}
                    </div>,
                    document.body,
                )}
            </div>

            {/* Mermaid / Diagrama */}
            <div ref={mermaidToolRef} className="relative" onMouseDown={e => e.stopPropagation()}>
                <ToolBtn onClick={() => {
                    if (!showMermaidMenu) updateFloatingMenuPosition('mermaid', mermaidToolRef.current, 192);
                    setShowMermaidMenu(p => !p);
                }} title="Insertar diagrama (flowchart, mapa mental, secuencia)">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="5" height="4" rx="1"/><rect x="16" y="3" width="5" height="4" rx="1"/>
                        <rect x="9" y="17" width="6" height="4" rx="1"/>
                        <line x1="5.5" y1="7" x2="5.5" y2="10"/><line x1="18.5" y1="7" x2="18.5" y2="10"/>
                        <line x1="5.5" y1="10" x2="18.5" y2="10"/><line x1="12" y1="10" x2="12" y2="17"/>
                    </svg>
                </ToolBtn>
                {showMermaidMenu && typeof document !== 'undefined' && createPortal(
                    <div
                        className="fixed z-[220] p-2 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl flex flex-col gap-1 w-48"
                        style={{ top: `${floatingMenuPosition.mermaid.top}px`, left: `${floatingMenuPosition.mermaid.left}px` }}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        {[
                            ...MERMAID_TEMPLATE_OPTIONS,
                        ].map(({ key, icon, label }) => (
                            <button key={key} type="button"
                                onClick={() => { editor.chain().focus().insertMermaid(MERMAID_TEMPLATES[key]).run(); setShowMermaidMenu(false); }}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-sm text-[var(--text-secondary)] text-left"
                            >
                                <span className="text-fuchsia-400 w-4 text-center">{icon}</span>
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>,
                    document.body,
                )}
            </div>

            <Divider />

            <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Línea horizontal"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Limpiar formato"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7l4-4 10 10-4 4L4 7z"/><path d="M14 6l4 4"/><line x1="2" y1="22" x2="22" y2="22"/></svg></ToolBtn>

            <Divider />

            <Divider />
        </>
    );
}
