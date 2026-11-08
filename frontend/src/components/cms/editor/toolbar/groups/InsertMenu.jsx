// Menú «+» para insertar bloques especiales.
import { INSERT_MENU_CATEGORY_STYLES, PLUS_MENU_ITEMS } from '../../insertMenuConfig';
import { ToolBtn } from '../ToolbarParts';
import { createPortal } from 'react-dom';

export default function InsertMenu({
    floatingMenuPosition,
    handleInsertAction,
    handlePinTool,
    handleUnpinTool,
    insertMenuQuery,
    insertToolRef,
    menus,
    pinnedTools,
    plusMenuGroups,
    plusMenuItems,
    setInsertMenuQuery,
    updateFloatingMenuPosition,
}) {
    return (
        <>
            {/* Insertar bloque especial */}
            <div ref={insertToolRef} className="relative" onMouseDown={e => e.stopPropagation()}>
                <ToolBtn onClick={() => {
                    if (menus.isOpen('insert')) setInsertMenuQuery('');
                    else updateFloatingMenuPosition('insert', insertToolRef.current, 416);
                    menus.toggle('insert');
                }} title="Insertar bloque especial (+)">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </ToolBtn>
                {menus.isOpen('insert') && typeof document !== 'undefined' && createPortal(
                    <div className="fixed z-[220] flex max-h-[min(78vh,36rem)] w-[min(26rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] shadow-2xl"
                         style={{ top: `${floatingMenuPosition.insert.top}px`, left: `${floatingMenuPosition.insert.left}px` }}
                         onMouseDown={e => e.stopPropagation()}>
                        <div className="border-b border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 pt-3 pb-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold text-[var(--text-primary)]">Herramientas extra</p>
                                    <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">Todo lo que no esta visible en la toolbar principal.</p>
                                </div>
                                <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] px-2 py-1 text-[10px] font-medium text-[var(--text-muted)]">
                                    {plusMenuItems.length}/{PLUS_MENU_ITEMS.length}
                                </span>
                            </div>
                            <div className="mt-3">
                                <input
                                    type="search"
                                    value={insertMenuQuery}
                                    onChange={event => setInsertMenuQuery(event.target.value)}
                                    placeholder="Buscar CTA, documento, acordeon..."
                                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-fuchsia-500/60"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 overflow-y-auto p-1.5 pr-1">
                            {plusMenuItems.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-surface)]/70 px-4 py-5 text-center">
                                    <p className="text-sm font-medium text-[var(--text-primary)]">No encontramos herramientas</p>
                                    <p className="mt-1 text-xs text-[var(--text-muted)]">Proba con CTA, documento, acordeon o diagrama.</p>
                                </div>
                            )}
                            {Object.entries(plusMenuGroups).map(([category, items]) => {
                                const categoryStyle = INSERT_MENU_CATEGORY_STYLES[category] || INSERT_MENU_CATEGORY_STYLES.Extra;
                                return (
                                    <div key={category} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)]/55 py-2">
                                        <div className="flex items-center justify-between gap-2 px-3 pb-1.5">
                                            <p className={`text-[10px] font-bold uppercase tracking-wider ${categoryStyle.color}`}>{category}</p>
                                            <span className="text-[10px] text-[var(--text-muted)]">{items.length}</span>
                                        </div>
                                        {items.map(item => {
                                            const isPinned = pinnedTools.some(t => t.action === item.action);
                                            return (
                                            <button
                                                key={item.action}
                                                type="button"
                                                onClick={() => handleInsertAction(item.action)}
                                                className="group mx-1 flex w-[calc(100%-0.5rem)] items-start gap-2 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-fuchsia-500/10"
                                            >
                                                <span className={`mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg shrink-0 text-[11px] font-semibold ${categoryStyle.bg} ${categoryStyle.color}`}>
                                                    {item.icon}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-fuchsia-400 transition-colors">{item.title}</p>
                                                    <p className="text-[11px] text-[var(--text-muted)] leading-tight mt-0.5">{item.desc}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        isPinned ? handleUnpinTool(item.action) : handlePinTool(item);
                                                    }}
                                                    className={`shrink-0 p-1 rounded-md transition-colors ${isPinned ? 'text-fuchsia-400 bg-fuchsia-500/20' : 'text-[var(--text-muted)] hover:text-fuchsia-400 hover:bg-fuchsia-500/10'}`}
                                                    title={isPinned ? 'Quitar de barra de herramientas' : 'Fijar en barra de herramientas'}
                                                >
                                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 2L9.5 9.5 2 12l6.5 2.5L12 22l2.5-7.5L22 12l-6.5-2.5L12 2z"/>
                                                    </svg>
                                                </button>
                                            </button>
                                        )})}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="border-t border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2 text-[10px] text-[var(--text-muted)]">
                            Tip: tambien podes escribir <span className="font-semibold text-[var(--text-primary)]">/</span> dentro del editor para abrir estas mismas herramientas.
                        </div>
                    </div>,
                    document.body,
                )}
            </div>
        </>
    );
}
