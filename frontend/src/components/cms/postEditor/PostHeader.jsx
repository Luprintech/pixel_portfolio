const AUTOSAVE_LABELS = {
    saving: 'autoguardando...',
    synced: 'autoguardado sincronizado',
    local: 'borrador local listo',
    error: 'autoguardado con error',
};

const BUTTON_BASE = 'px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all';

export default function PostHeader({
    isEdit, editSlug, status, saving, isDirty,
    draftSaved, availableDraft, revision, autosaveState,
    onRecoverDraft, onPreview, onCancel, onSaveDraft, onPublish, onUnpublish,
}) {
    const publishLabel = isEdit && status !== 'draft' ? 'Actualizar' : 'Publicar';

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">{isEdit ? 'Editar post' : 'Nuevo post'}</h1>
                {isEdit && <p className="text-sm text-[var(--text-muted)] mt-0.5">/{editSlug}</p>}
                {!isEdit && draftSaved && !availableDraft && (
                    <p className="text-xs text-cyan-400/80 mt-0.5 animate-pulse">Borrador guardado localmente</p>
                )}
                {availableDraft && (
                    <button
                        type="button"
                        onClick={onRecoverDraft}
                        className="text-xs text-fuchsia-400 mt-1 hover:text-fuchsia-300 underline"
                    >
                        {isEdit ? 'Recuperar borrador local de esta entrada' : 'Recuperar borrador anterior'}
                    </button>
                )}
                {isEdit && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                        Revision {revision || 0} · {AUTOSAVE_LABELS[autosaveState] || 'sin cambios pendientes'}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
                <button type="button" onClick={onPreview} className={`${BUTTON_BASE} flex items-center gap-1.5`}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    Vista previa
                </button>
                <button type="button" onClick={onCancel} className={BUTTON_BASE}>
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={onSaveDraft}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl text-sm font-medium border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {saving && <div className="w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />}
                    Guardar borrador
                    {isDirty && !saving && (
                        <span
                            className="h-2 w-2 rounded-full bg-orange-400 shrink-0"
                            title="Hay cambios sin guardar"
                            aria-label="Cambios sin guardar"
                        />
                    )}
                </button>
                <button
                    type="button"
                    onClick={onPublish}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-md"
                >
                    {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {saving ? 'Guardando…' : publishLabel}
                </button>
                {isEdit && status === 'published' && (
                    <button
                        type="button"
                        onClick={onUnpublish}
                        disabled={saving}
                        className="px-3 py-2 rounded-xl text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                    >
                        Despublicar
                    </button>
                )}
            </div>
        </div>
    );
}
