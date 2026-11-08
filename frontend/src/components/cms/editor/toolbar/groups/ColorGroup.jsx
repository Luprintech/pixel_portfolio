// Selectores de color de texto y de resaltado.
import { HIGHLIGHT_COLORS, TEXT_COLORS } from '../colorPalettes';
import { ToolBtn } from '../ToolbarParts';
import { createPortal } from 'react-dom';

export default function ColorGroup({
    applyTextColor,
    clearTextColor,
    colorToolRef,
    editor,
    floatingMenuPosition,
    highlightToolRef,
    lastTextColor,
    menus,
    setLastTextColor,
    updateFloatingMenuPosition,
}) {
    return (
        <>
            {/* Color de texto: popup sobre el toolbar */}
            <div ref={colorToolRef} className="relative" onMouseDown={e => e.stopPropagation()}>
                <div
                    className="flex h-8 shrink-0 overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)]"
                    role="group"
                    aria-label="Control de color de texto"
                >
                    <button
                        type="button"
                        title={`Aplicar color ${lastTextColor}`}
                        aria-label={`Aplicar color ${lastTextColor}`}
                        onMouseDown={e => {
                            e.preventDefault();
                            applyTextColor(lastTextColor);
                            menus.close();
                        }}
                        className="flex h-full w-8 items-center justify-center text-[var(--text-muted)] transition-colors hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/10"
                    >
                        <div className="flex flex-col items-center gap-0.5">
                            <span className="text-xs font-bold leading-none">A</span>
                            <div className="h-1 w-4 rounded-full border border-white/20" style={{ background: lastTextColor }} />
                        </div>
                    </button>

                    <button
                        type="button"
                        title="Cambiar color de texto"
                        aria-label="Cambiar color de texto"
                        aria-haspopup="menu"
                        aria-expanded={menus.isOpen('color') ? 'true' : 'false'}
                        onMouseDown={e => {
                            e.preventDefault();
                            if (!menus.isOpen('color')) updateFloatingMenuPosition('color', colorToolRef.current, 192);
                            menus.toggle('color');
                        }}
                        className="flex h-full w-5 items-center justify-center border-l border-[var(--border-color)] text-[var(--text-muted)] transition-colors hover:bg-black/5 hover:text-[var(--text-primary)] dark:hover:bg-white/10"
                    >
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                </div>

                {menus.isOpen('color') && typeof document !== 'undefined' && createPortal(
                    <div
                        className="fixed z-[220] p-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl w-48"
                        style={{ top: `${floatingMenuPosition.color.top}px`, left: `${floatingMenuPosition.color.left}px` }}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <button type="button" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-2 w-full text-left px-1"
                            onClick={() => { clearTextColor(); setLastTextColor('#000000'); menus.close('color'); }}>
                            Quitar color
                        </button>
                        <div className="grid grid-cols-5 gap-1.5 mb-2">
                            {TEXT_COLORS.map(c => (
                                <button key={c} type="button" title={c}
                                    className="w-6 h-6 rounded-md border-2 border-transparent hover:border-white/50 hover:scale-110 transition-all"
                                    style={{ background: c }}
                                    onClick={() => { applyTextColor(c); setLastTextColor(c); menus.close('color'); }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                            <input type="color"
                                value={lastTextColor}
                                onChange={e => {
                                    const nextColor = e.target.value;
                                    setLastTextColor(nextColor);
                                    applyTextColor(nextColor);
                                }}
                                className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
                            />
                            <span className="text-xs text-gray-400">Color personalizado</span>
                        </div>
                    </div>,
                    document.body,
                )}
            </div>

            {/* Resaltado */}
            <div ref={highlightToolRef} className="relative" onMouseDown={e => e.stopPropagation()}>
                <ToolBtn onClick={() => {
                    if (!menus.isOpen('highlight')) updateFloatingMenuPosition('highlight', highlightToolRef.current, 176);
                    menus.toggle('highlight');
                }} active={editor.isActive('highlight')} title="Color de fondo">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                </ToolBtn>
                {menus.isOpen('highlight') && typeof document !== 'undefined' && createPortal(
                    <div
                        className="fixed z-[220] p-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl w-44"
                        style={{ top: `${floatingMenuPosition.highlight.top}px`, left: `${floatingMenuPosition.highlight.left}px` }}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <button type="button" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-2 w-full text-left px-1"
                            onClick={() => { editor.chain().focus().unsetHighlight().run(); menus.close('highlight'); }}>
                            Quitar fondo
                        </button>
                        <div className="grid grid-cols-4 gap-1.5 mb-2">
                            {HIGHLIGHT_COLORS.map(c => (
                                <button key={c} type="button" title={c}
                                    className="w-6 h-6 rounded-md border-2 border-transparent hover:border-white/50 hover:scale-110 transition-all"
                                    style={{ background: c }}
                                    onClick={() => { editor.chain().focus().toggleHighlight({ color: c }).run(); menus.close('highlight'); }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                            <input type="color"
                                defaultValue="#fef08a"
                                onChange={e => editor.chain().focus().toggleHighlight({ color: `${e.target.value}80` }).run()}
                                className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
                            />
                            <span className="text-xs text-gray-400">Color personalizado</span>
                        </div>
                    </div>,
                    document.body,
                )}
            </div>
        </>
    );
}
