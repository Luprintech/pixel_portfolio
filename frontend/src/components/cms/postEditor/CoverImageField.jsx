import { useRef } from 'react';
import { IMAGE_INPUT_ACCEPT, IMAGE_UPLOAD_LABEL } from '../../../lib/mediaUploadPolicy';

export default function CoverImageField({ value, uploading, error, success, onUrlChange, onUpload, onClear }) {
    const fileInputRef = useRef(null);

    return (
        <div className="lg:col-span-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Portada</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                Elige aqui de forma explicita la portada del post. Aunque el contenido incluya imagenes, la portada del blog se toma de este campo y se guarda en <code>ogImage</code>.
            </p>

            <label className="mt-3 block text-xs font-medium text-[var(--text-secondary)]">URL de portada</label>
            <input
                type="text"
                value={value}
                onChange={onUrlChange}
                placeholder="/images/tu-portada.webp o URL completa"
                className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 text-sm shadow-sm"
            />

            <input
                ref={fileInputRef}
                type="file"
                accept={IMAGE_INPUT_ACCEPT}
                onChange={onUpload}
                className="sr-only"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-default)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-fuchsia-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {uploading ? (
                        <>
                            <div className="w-3.5 h-3.5 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
                            Subiendo portada...
                        </>
                    ) : (
                        'Subir portada desde mi ordenador'
                    )}
                </button>

                {value && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border border-red-500/30 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        Quitar portada
                    </button>
                )}
            </div>

            <p className="mt-1 text-[10px] text-[var(--text-muted)]">{IMAGE_UPLOAD_LABEL}</p>

            {error && (
                <p className="mt-1.5 text-xs text-red-400">{error}</p>
            )}

            {success && (
                <p className="mt-1.5 text-xs text-emerald-400">{success}</p>
            )}

            {value && (
                <div className="mt-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-3">
                    <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Vista previa de portada seleccionada</p>
                    <div className="overflow-hidden rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] aspect-[16/9] min-h-[12rem]">
                        <img
                            src={value}
                            alt="Vista previa de portada del post"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
