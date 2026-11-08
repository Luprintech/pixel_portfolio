// Menú flotante con las acciones de tabla.
import { BubbleMenu } from '@tiptap/react/menus';

export default function TableBubbleMenu({
    editor,
    setShowTableColors,
    showTableColors,
}) {
    return (
        <>
            {/* BubbleMenu de tabla flotante */}
            {editor && (
                <BubbleMenu
                    editor={editor}
                    shouldShow={({ editor }) => editor.isActive('table')}
                    options={{
                        placement: 'top',
                        offset: [0, 12],
                    }}
                    className="flex flex-wrap items-center justify-center gap-1 px-3 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl text-xs z-50"
                >
                    <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mr-1">Tabla:</span>
                    <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().addRowBefore().run(); }}
                        className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors" title="Añadir fila arriba">↑ Fila</button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }}
                        className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors" title="Añadir fila abajo">↓ Fila</button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().deleteRow().run(); }}
                        className="px-2 py-1 rounded hover:bg-red-500/10 text-red-400 transition-colors" title="Eliminar fila">✕ Fila</button>
                    <div className="w-px h-4 bg-[var(--border-color)] mx-0.5 self-center" />
                    <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().addColumnBefore().run(); }}
                        className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors" title="Añadir columna izquierda">← Col</button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }}
                        className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors" title="Añadir columna derecha">→ Col</button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().deleteColumn().run(); }}
                        className="px-2 py-1 rounded hover:bg-red-500/10 text-red-400 transition-colors" title="Eliminar columna">✕ Col</button>
                    <div className="w-px h-4 bg-[var(--border-color)] mx-0.5 self-center" />
                    <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeaderRow().run(); }}
                        className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors">Cabecera</button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().mergeCells().run(); }}
                        className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors" title="Combinar celdas">Combinar</button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().splitCell().run(); }}
                        className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors" title="Dividir celda">Dividir</button>
                    <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().setCellAttribute('backgroundColor', null).setCellAttribute('borderColor', null).run(); }}
                        className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors" title="Limpiar estilos de celda">Limpiar celda</button>
                    <div className="w-px h-4 bg-[var(--border-color)] mx-0.5 self-center" />
                    {/* Color picker */}
                    <div className="relative">
                        <button type="button" onClick={() => setShowTableColors(v => !v)}
                            className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors flex items-center gap-1" title="Color de celda">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                            Color
                        </button>
                        {showTableColors && (
                            <div className="absolute top-full left-0 mt-1 p-3 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-xl z-50 w-56" onMouseDown={e => e.preventDefault()}>
                                <p className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider mb-2">Fondo de celda</p>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {[
                                        null,
                                        '#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#a5f3fc', '#bfdbfe', '#ddd6fe', '#fbcfe8',
                                        '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777',
                                        '#1e1e2e', '#2a2a3a', '#3a3a4a', '#f8fafc', '#f1f5f9', '#e2e8f0',
                                    ].map((color, i) => (
                                        <button key={i} type="button"
                                            onMouseDown={e => { e.preventDefault(); editor.chain().focus().setCellAttribute('backgroundColor', color).run(); setShowTableColors(false); }}
                                            className={`w-6 h-6 rounded border transition-transform hover:scale-110 ${!color ? 'border-dashed border-[var(--border-color)]' : 'border-transparent'}`}
                                            style={{ background: color || 'transparent' }}
                                            title={color || 'Sin color'}
                                        >
                                            {!color && <span className="text-[9px] text-[var(--text-muted)]">✕</span>}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider mb-2">Borde de celda</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        null, '#e5e7eb', '#d4d4d8',
                                        '#dc2626', '#ea580c', '#16a34a', '#2563eb', '#7c3aed', '#db2777',
                                        '#fecaca', '#bfdbfe', '#ddd6fe',
                                    ].map((color, i) => (
                                        <button key={i} type="button"
                                            onMouseDown={e => { e.preventDefault(); editor.chain().focus().setCellAttribute('borderColor', color).run(); setShowTableColors(false); }}
                                            className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${!color ? 'border-dashed border-[var(--border-color)]' : ''}`}
                                            style={{ borderColor: color || undefined, background: 'transparent' }}
                                            title={color || 'Por defecto'}
                                        >
                                            {!color && <span className="text-[9px] text-[var(--text-muted)]">✕</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().deleteTable().run(); }}
                        className="px-2 py-1 rounded hover:bg-red-500/10 text-red-400 transition-colors ml-auto">Eliminar tabla</button>
                </BubbleMenu>
            )}
        </>
    );
}
