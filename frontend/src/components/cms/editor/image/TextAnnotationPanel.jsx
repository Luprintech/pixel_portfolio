// Panel flotante para editar el texto de una anotación; se puede arrastrar dentro de la imagen
export function TextAnnotationPanel({ annotations }) {
    const {
        selectedAnnotation, annotationPanelPosition, startAnnotationPanelDrag,
        removeAnnotationById, setSelectedAnnotationId, updateAnnotationById,
    } = annotations;

    return (
        <div
            contentEditable={false}
            className="absolute z-20 w-[min(92vw,420px)] rounded-2xl border border-white/10 bg-slate-950/92 p-3 text-xs text-slate-100 shadow-2xl backdrop-blur"
            style={{ left: `${annotationPanelPosition.x}px`, top: `${annotationPanelPosition.y}px` }}
            onMouseDown={e => e.stopPropagation()}
        >
            <div
                className="mb-2 flex cursor-move items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2"
                onPointerDown={startAnnotationPanelDrag}
            >
                <p className="font-semibold text-cyan-200">Editar texto anotado</p>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => removeAnnotationById(selectedAnnotation.id)}
                        className="rounded-md border border-red-400/25 bg-red-500/10 px-2 py-1 text-[11px] font-semibold text-red-200 hover:bg-red-500/20"
                    >
                        Eliminar
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedAnnotationId(null)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-sm font-bold text-slate-200 hover:bg-white/10"
                        aria-label="Cerrar editor de anotación"
                    >
                        ×
                    </button>
                </div>
            </div>
            <label className="mb-3 block">
                <span className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Texto</span>
                <input
                    type="text"
                    value={selectedAnnotation.text || ''}
                    onChange={e => updateAnnotationById(selectedAnnotation.id, { text: e.target.value || 'Texto' })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
                    placeholder="Escribe la anotación"
                />
            </label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <label className="block">
                    <span className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Tamaño</span>
                    <input
                        type="range"
                        min="3"
                        max="10"
                        step="0.5"
                        value={selectedAnnotation.fontSize || 5}
                        onChange={e => updateAnnotationById(selectedAnnotation.id, { fontSize: Number(e.target.value) })}
                        className="w-full"
                    />
                    <span className="mt-1 block text-[11px] text-slate-400">{Number(selectedAnnotation.fontSize || 5).toFixed(1)}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => updateAnnotationById(selectedAnnotation.id, { fontWeight: selectedAnnotation.fontWeight === '700' ? '400' : '700' })}
                        className={`rounded-md px-2.5 py-2 font-bold ${selectedAnnotation.fontWeight === '700' ? 'bg-cyan-500/20 text-cyan-200' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                        B
                    </button>
                    <button
                        type="button"
                        onClick={() => updateAnnotationById(selectedAnnotation.id, { fontStyle: selectedAnnotation.fontStyle === 'italic' ? 'normal' : 'italic' })}
                        className={`rounded-md px-2.5 py-2 italic ${selectedAnnotation.fontStyle === 'italic' ? 'bg-cyan-500/20 text-cyan-200' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                        I
                    </button>
                    <button
                        type="button"
                        onClick={() => updateAnnotationById(selectedAnnotation.id, { textDecoration: selectedAnnotation.textDecoration === 'underline' ? 'none' : 'underline' })}
                        className={`rounded-md px-2.5 py-2 underline ${selectedAnnotation.textDecoration === 'underline' ? 'bg-cyan-500/20 text-cyan-200' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                        U
                    </button>
                </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">Consejo: arrastra el texto directamente sobre la captura para recolocarlo.</p>
        </div>
    );
}
