import { normalizeContentLinkHref } from '../../../../lib/contentLinkUtils';
import { moveImageGridItem } from './imageGridOrder';

const IMAGE_GRID_SELECT_OPTIONS = {
    columns: [
        { value: '1', label: '1 columna' },
        { value: '2', label: '2 columnas' },
        { value: '3', label: '3 columnas' },
        { value: '4', label: '4 columnas' },
    ],
    mobileColumns: [
        { value: '1', label: '1 columna' },
        { value: '2', label: '2 columnas' },
    ],
    gap: [
        { value: 'tight', label: 'Compacto' },
        { value: 'normal', label: 'Equilibrado' },
        { value: 'loose', label: 'Amplio' },
    ],
    aspectRatio: [
        { value: 'landscape', label: 'Panorámico 4:3' },
        { value: 'square', label: 'Cuadrado 1:1' },
        { value: 'portrait', label: 'Vertical 3:4' },
        { value: 'auto', label: 'Altura automática' },
    ],
    captionMode: [
        { value: 'below', label: 'Debajo' },
        { value: 'overlay', label: 'Superpuesta' },
        { value: 'hidden', label: 'Ocultas' },
    ],
    cornerStyle: [
        { value: 'soft', label: 'Suave' },
        { value: 'rounded', label: 'Redondeado' },
        { value: 'pill', label: 'Editorial' },
    ],
    width: [
        { value: 'content', label: 'Contenido' },
        { value: 'wide', label: 'Ancho' },
        { value: 'full', label: 'Completo' },
    ],
    imageFit: [
        { value: 'cover', label: 'Cubrir' },
        { value: 'contain', label: 'Completa' },
    ],
    layoutStyle: [
        { value: 'uniform', label: 'Uniforme' },
        { value: 'mosaic', label: 'Mosaico flexible' },
    ],
    itemSize: [
        { value: 'standard', label: 'Estandar' },
        { value: 'wide', label: 'Ancho' },
        { value: 'tall', label: 'Vertical' },
        { value: 'hero', label: 'Hero' },
    ],
    hoverEffect: [
        { value: 'none', label: 'Ninguno' },
        { value: 'zoom', label: 'Zoom' },
        { value: 'overlay', label: 'Overlay oscuro' },
        { value: 'blur', label: 'Blur suave' },
        { value: 'lift', label: 'Elevación' },
    ],
    loadingMode: [
        { value: 'lazy', label: 'Lazy (recomendado)' },
        { value: 'eager', label: 'Inmediato' },
        { value: 'progressive', label: 'Progresivo' },
    ],
};

function ImageGridSelectField({ label, value, options, onChange }) {
    return (
            <label className="grid gap-1.5 text-xs text-[var(--text-muted)]">
                <span className="text-[10px] uppercase tracking-[0.24em]">{label}</span>
                <select
                    value={value}
                    onChange={onChange}
                    className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </label>
        );
    }

    // Panel del bloque seleccionado: opciones de layout y edición de cada imagen
    export default function ImageGridPanel({ config, images, setGridAttributes, updateImageItem, openPicker, removeImage }) {
        return (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)]">
            <div className="space-y-3 rounded-[1.4rem] border border-[var(--border-color)] bg-[var(--bg-elevated)]/65 p-4">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Layout</p>
                    <h4 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Opciones del bloque</h4>
                </div>
                <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]/45 px-3 py-2 text-xs leading-5 text-[var(--text-secondary)]">
                    Usa drag & drop sobre la vista previa para reordenar. El modo mosaico activa tamanos por item sin romper grids existentes.
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <ImageGridSelectField label="Columnas desktop" value={String(config.columns)} options={IMAGE_GRID_SELECT_OPTIONS.columns} onChange={(event) => setGridAttributes({ columns: Number(event.target.value) })} />
                    <ImageGridSelectField label="Columnas mobile" value={String(config.mobileColumns)} options={IMAGE_GRID_SELECT_OPTIONS.mobileColumns} onChange={(event) => setGridAttributes({ mobileColumns: Number(event.target.value) })} />
                    <ImageGridSelectField label="Gap" value={config.gap} options={IMAGE_GRID_SELECT_OPTIONS.gap} onChange={(event) => setGridAttributes({ gap: event.target.value })} />
                    <ImageGridSelectField label="Relacion" value={config.aspectRatio} options={IMAGE_GRID_SELECT_OPTIONS.aspectRatio} onChange={(event) => setGridAttributes({ aspectRatio: event.target.value })} />
                    <ImageGridSelectField label="Captions" value={config.captionMode} options={IMAGE_GRID_SELECT_OPTIONS.captionMode} onChange={(event) => setGridAttributes({ captionMode: event.target.value })} />
                    <ImageGridSelectField label="Esquinas" value={config.cornerStyle} options={IMAGE_GRID_SELECT_OPTIONS.cornerStyle} onChange={(event) => setGridAttributes({ cornerStyle: event.target.value })} />
                    <ImageGridSelectField label="Ancho" value={config.width} options={IMAGE_GRID_SELECT_OPTIONS.width} onChange={(event) => setGridAttributes({ width: event.target.value })} />
                    <ImageGridSelectField label="Ajuste imagen" value={config.imageFit} options={IMAGE_GRID_SELECT_OPTIONS.imageFit} onChange={(event) => setGridAttributes({ imageFit: event.target.value })} />
                    <ImageGridSelectField label="Estilo del bloque" value={config.layoutStyle} options={IMAGE_GRID_SELECT_OPTIONS.layoutStyle} onChange={(event) => setGridAttributes({ layoutStyle: event.target.value })} />
                    <ImageGridSelectField label="Efecto hover" value={config.hoverEffect || 'none'} options={IMAGE_GRID_SELECT_OPTIONS.hoverEffect} onChange={(event) => setGridAttributes({ hoverEffect: event.target.value })} />
                    <ImageGridSelectField label="Modo de carga" value={config.loadingMode || 'lazy'} options={IMAGE_GRID_SELECT_OPTIONS.loadingMode} onChange={(event) => setGridAttributes({ loadingMode: event.target.value })} />
                </div>
                <label className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/70 px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:border-fuchsia-500/40">
                    <input
                        type="checkbox"
                        checked={Boolean(config.enableLightbox)}
                        onChange={(event) => setGridAttributes({ enableLightbox: event.target.checked })}
                        className="h-4 w-4 rounded border-[var(--border-color)] bg-[var(--bg-primary)] text-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/50"
                    />
                    <span>Habilitar lightbox al hacer click (solo si no tiene enlace)</span>
                </label>
            </div>

            <div className="space-y-3 rounded-[1.4rem] border border-[var(--border-color)] bg-[var(--bg-elevated)]/65 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Items</p>
                        <h4 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Contenido editable del grid</h4>
                    </div>
                    <button
                        type="button"
                        onClick={() => openPicker(null)}
                        className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-medium text-fuchsia-200 transition-colors hover:bg-fuchsia-500/20"
                    >
                        + Anadir item
                    </button>
                </div>

                {images.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)]/40 px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                        Sube al menos una imagen para empezar a maquetar la galeria.
                    </div>
                ) : images.map((image, index) => (
                    <article key={`${image.src}-meta-${index}`} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]/60 p-3">
                        <div className="flex flex-wrap items-start gap-3">
                            <img src={image.src} alt={image.alt || ''} className="h-20 w-20 rounded-xl border border-[var(--border-color)] object-cover" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Item {index + 1}</p>
                                        <p className="max-w-[280px] truncate text-sm font-medium text-[var(--text-primary)]">{image.caption || image.alt || image.src}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button type="button" onClick={() => setGridAttributes({ images: moveImageGridItem(images, index, index - 1) })} disabled={index === 0} className="rounded-lg border border-[var(--border-color)] px-2 py-1 text-xs text-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-40">←</button>
                                        <button type="button" onClick={() => setGridAttributes({ images: moveImageGridItem(images, index, index + 1) })} disabled={index === images.length - 1} className="rounded-lg border border-[var(--border-color)] px-2 py-1 text-xs text-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-40">→</button>
                                        <button type="button" onClick={() => openPicker(index)} className="rounded-lg border border-[var(--border-color)] px-2 py-1 text-xs text-[var(--text-muted)]">Reemplazar</button>
                                        <button type="button" onClick={() => removeImage(index)} className="rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs text-red-200">Eliminar</button>
                                    </div>
                                </div>

                                <div className="grid gap-2 md:grid-cols-2">
                                    <input
                                        type="text"
                                        value={image.alt || ''}
                                        onChange={(event) => updateImageItem(index, { alt: event.target.value })}
                                        placeholder={`Alt imagen ${index + 1}`}
                                        className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                                    />
                                    <input
                                        type="text"
                                        value={image.caption || ''}
                                        onChange={(event) => updateImageItem(index, { caption: event.target.value })}
                                        placeholder={`Caption imagen ${index + 1}`}
                                        className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                                    />
                                </div>

                                <div className="grid gap-2 md:grid-cols-2">
                                    <ImageGridSelectField
                                        label="Tamano del item"
                                        value={image.size || 'standard'}
                                        options={IMAGE_GRID_SELECT_OPTIONS.itemSize}
                                        onChange={(event) => updateImageItem(index, { size: event.target.value })}
                                    />
                                    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/55 px-3 py-2 text-xs leading-5 text-[var(--text-secondary)]">
                                        {config.layoutStyle === 'mosaic'
                                            ? 'Activo en mosaico: ancho y hero expanden columnas cuando el bloque lo permite.'
                                            : 'Guardado para despues: cambia el bloque a mosaico para aplicar variaciones visuales.'}
                                    </div>
                                </div>

                                <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_160px]">
                                    <input
                                        type="url"
                                        value={image.href || ''}
                                        onChange={(event) => updateImageItem(index, { href: normalizeContentLinkHref(event.target.value) })}
                                        placeholder="Enlace opcional del item"
                                        className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                                    />
                                    <label className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/70 px-3 py-2 text-xs text-[var(--text-secondary)]">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(image.openInNewTab)}
                                            disabled={!image.href}
                                            onChange={(event) => updateImageItem(index, { openInNewTab: event.target.checked })}
                                        />
                                        Nueva pestaña
                                    </label>
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        value={(image.tags || []).join(', ')}
                                        onChange={(event) => updateImageItem(index, { tags: event.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                                        placeholder="Tags separados por comas (ej: naturaleza, paisaje)"
                                        className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                                    />
                                    <p className="mt-1.5 text-[10px] leading-4 text-[var(--text-muted)]">Los tags permiten filtrar la galería desde la vista pública</p>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
