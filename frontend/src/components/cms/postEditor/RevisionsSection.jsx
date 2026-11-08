import CollapsibleSection from '../editor/CollapsibleSection';
import { formatRevisionLabel } from '../../../lib/postEditorForm';

export default function RevisionsSection({ revisions, loading, saving, currentRevision, onReload, onRestore }) {
    return (
        <CollapsibleSection title="Revisiones" icon="📜" badge={revisions.length} badgeColor="violet" defaultOpen={false}>
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs text-[var(--text-muted)]">Cada guardado y autoguardado crea un snapshot por post para restaurar rapido si algo sale mal.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onReload()}
                        className="rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                        Recargar
                    </button>
                </div>

                {loading ? (
                    <p className="text-xs text-[var(--text-muted)]">Cargando revisiones...</p>
                ) : revisions.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)]">Todavia no hay revisiones persistidas para este post.</p>
                ) : (
                    <div className="grid gap-2">
                        {revisions.map(item => (
                        <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3">
                            <div>
                                <p className="text-sm font-medium text-[var(--text-primary)]">Revision {item.revision} · {formatRevisionLabel(item)}</p>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">{new Date(item.createdAt).toLocaleString('es-ES')}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => onRestore(item)}
                                disabled={saving || item.revision === currentRevision}
                                className="rounded-lg border border-fuchsia-500/30 px-3 py-1.5 text-xs font-semibold text-fuchsia-400 hover:bg-fuchsia-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Restaurar
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
                </CollapsibleSection>
    );
}
