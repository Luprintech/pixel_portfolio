import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { useRef, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { cmsApi } from '../../../../lib/cmsApi';
import { resolveContentLinkAttributes } from '../../../../lib/contentLinkUtils';
import { getImageGridAspectClass, getImageGridColumnsClass, getImageGridCornerClass, getImageGridGapClass, getImageGridImageFitClass, getImageGridItemAspectClass, getImageGridItemSizeLabel, getImageGridItemSpanClass, getImageGridWidthClass, normalizeImageGridConfig, normalizeImageGridItems } from '../../../../lib/imageGrid';
import { validateImageFile } from '../../../../lib/mediaUploadPolicy';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';
import { joinClassNames } from './classNames';
import ImageGridPanel from './ImageGridPanel';
import { moveImageGridItem } from './imageGridOrder';

function getImageGridAspectStyle(aspectRatio) {
    if (aspectRatio === 'square') return { aspectRatio: '1 / 1' };
    if (aspectRatio === 'portrait') return { aspectRatio: '3 / 4' };
    if (aspectRatio === 'auto') return { minHeight: '180px' };
    return { aspectRatio: '4 / 3' };
}

function getImageGridGapValue(gap) {
    if (gap === 'tight') return '8px';
    if (gap === 'loose') return '20px';
    return '14px';
}

function getImageGridBorderRadiusValue(cornerStyle) {
    if (cornerStyle === 'soft') return '14px';
    if (cornerStyle === 'pill') return '28px';
    return '22px';
}

function getImageGridObjectFit(imageFit) {
    return imageFit === 'contain' ? 'contain' : 'cover';
}

function ImageGridView({ node, updateAttributes, selected, deleteNode }) {
    const config = normalizeImageGridConfig(node.attrs);
    const images = normalizeImageGridItems(node.attrs.images);
    const { token } = useAuth();
    const fileRef = useRef(null);
    const [uploadIdx, setUploadIdx] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragState, setDragState] = useState({ sourceIndex: null, targetIndex: null });

    function setGridAttributes(patch) {
        updateAttributes({ ...patch });
    }

    function updateImageItem(index, patch) {
        const next = [...images];
        next[index] = { ...next[index], ...patch };
        setGridAttributes({ images: next });
    }

    function handleDragStart(index) {
        setDragState({ sourceIndex: index, targetIndex: index });
    }

    function handleDragOver(event, index) {
        event.preventDefault();
        if (dragState.targetIndex !== index) {
            setDragState(current => ({ ...current, targetIndex: index }));
        }
    }

    function handleDrop(event, index) {
        event.preventDefault();
        if (dragState.sourceIndex === null) return;
        setGridAttributes({ images: moveImageGridItem(images, dragState.sourceIndex, index) });
        setDragState({ sourceIndex: null, targetIndex: null });
    }

    function resetDragState() {
        setDragState({ sourceIndex: null, targetIndex: null });
    }

    function openPicker(idx) {
        setUploadIdx(idx);
        setTimeout(() => fileRef.current?.click(), 0);
    }

    async function handleFile(e) {
        const file = e.target.files?.[0];
        if (!file || !token) return;
        const validationError = validateImageFile(file);
        if (validationError) {
            console.error(validationError);
            e.target.value = '';
            return;
        }
        setUploading(true);
        try {
            const { url } = await cmsApi.uploadImage(token, file);
            const next = [...images];
            if (uploadIdx !== null && uploadIdx < next.length) {
                next[uploadIdx] = { ...next[uploadIdx], src: url };
            } else {
                next.push({ src: url, alt: '', caption: '', href: '', openInNewTab: false });
            }
            setGridAttributes({ images: next });
        } catch (err) { console.error(err); }
        finally { setUploading(false); e.target.value = ''; setUploadIdx(null); }
    }

    function removeImage(idx) {
        const next = images.filter((_, i) => i !== idx);
        setGridAttributes({ images: next });
    }

    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            wrapperClassName="my-6"
            frameClassName="w-full"
        >
            <div className={joinClassNames(selected ? 'rounded-[1.75rem] ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-transparent' : '', 'space-y-4')} contentEditable={false}>
                <div className="rounded-[1.6rem] border border-[var(--border-color)] bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.72))] p-4 shadow-[0_22px_70px_rgba(15,23,42,0.18)]">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Image grid</p>
                            <h3 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Galeria estilo constructor</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
                            <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)]/65 px-3 py-1">{images.length} items</span>
                            <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)]/65 px-3 py-1">{config.columns} col desktop</span>
                            <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)]/65 px-3 py-1">{config.mobileColumns} col mobile</span>
                        </div>
                    </div>

                    <div className={joinClassNames('mx-auto', getImageGridWidthClass(config.width))}>
                        <div className={joinClassNames('grid', getImageGridColumnsClass(config), getImageGridGapClass(config.gap))} style={{ gap: getImageGridGapValue(config.gap) }}>
                    {images.map((image, i) => (
                        <div
                            key={`${image.src}-${i}`}
                            draggable={selected}
                            onDragStart={(event) => {
                                event.dataTransfer.effectAllowed = 'move';
                                handleDragStart(i);
                            }}
                            onDragOver={(event) => handleDragOver(event, i)}
                            onDrop={(event) => handleDrop(event, i)}
                            onDragEnd={resetDragState}
                            className={joinClassNames(
                                'relative group/item overflow-hidden border border-white/10 bg-[var(--bg-elevated)]/80 transition-all',
                                getImageGridCornerClass(config.cornerStyle),
                                getImageGridItemSpanClass(image, config),
                                dragState.sourceIndex === i ? 'cursor-grabbing opacity-70 ring-2 ring-fuchsia-400/40' : selected ? 'cursor-grab' : '',
                                dragState.targetIndex === i && dragState.sourceIndex !== i ? 'ring-2 ring-cyan-400/70 ring-offset-2 ring-offset-slate-950/20' : ''
                            )}
                            style={{
                                ...(getImageGridItemAspectClass(image, config) ? {} : getImageGridAspectStyle(config.aspectRatio)),
                                borderRadius: getImageGridBorderRadiusValue(config.cornerStyle),
                            }}
                            data-image-grid-item-size={image.size || 'standard'}
                        >
                            <img
                                src={image.src}
                                alt={image.alt || ''}
                                className={joinClassNames(
                                    'h-full w-full bg-[var(--bg-primary)]/70',
                                    getImageGridItemAspectClass(image, config) || getImageGridAspectClass(config.aspectRatio),
                                    getImageGridImageFitClass(config.imageFit)
                                )}
                                style={{ objectFit: getImageGridObjectFit(config.imageFit) }}
                            />
                            {selected && (
                                <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-slate-950/78 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-100 backdrop-blur">
                                    Arrastrar
                                </div>
                            )}
                            {config.layoutStyle === 'mosaic' && image.size !== 'standard' && (
                                <div className="absolute right-3 top-3 rounded-full border border-white/15 bg-slate-950/78 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-100 backdrop-blur">
                                    {getImageGridItemSizeLabel(image.size)}
                                </div>
                            )}
                            {config.captionMode === 'overlay' && (image.caption || image.alt) && (
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent px-3 pb-3 pt-10 text-xs leading-5 text-white">
                                    {image.caption || image.alt}
                                </div>
                            )}
                            {config.captionMode === 'below' && (image.caption || image.alt) && (
                                <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-slate-950/78 px-3 py-2 text-xs leading-5 text-slate-100">
                                    {image.caption || image.alt}
                                </div>
                            )}
                            {image.href && (
                                <div className={joinClassNames('absolute left-3 rounded-full bg-slate-950/75 px-2.5 py-1 text-[10px] font-medium text-slate-100 backdrop-blur', selected ? 'top-12' : 'top-3')}>
                                    Enlace {image.openInNewTab ? 'externo' : 'interno'}
                                </div>
                            )}
                            {selected && (
                                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 opacity-0 transition-opacity group-hover/item:opacity-100">
                                    <button type="button" onClick={() => openPicker(i)}
                                        className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs" title="Cambiar imagen">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                    </button>
                                    <button type="button" onClick={() => removeImage(i)}
                                        className="p-1.5 rounded-full bg-red-500/70 hover:bg-red-500 text-white text-xs" title="Eliminar imagen">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={() => openPicker(null)}
                        disabled={uploading}
                        className={joinClassNames('flex min-h-[180px] flex-col items-center justify-center gap-2 border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-elevated)]/45 text-[var(--text-muted)] transition-colors hover:border-fuchsia-500/50 hover:text-fuchsia-400', getImageGridCornerClass(config.cornerStyle))}
                        style={{ borderRadius: getImageGridBorderRadiusValue(config.cornerStyle) }}>
                        {uploading
                            ? <span className="text-xs animate-pulse">Subiendo…</span>
                            : <>
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                                <span className="text-xs">Anadir item</span>
                              </>}
                    </button>
                        </div>
                    </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />


                {selected && (
                    <ImageGridPanel
                        config={config}
                        images={images}
                        setGridAttributes={setGridAttributes}
                        updateImageItem={updateImageItem}
                        openPicker={openPicker}
                        removeImage={removeImage}
                    />
                )}
            </div>
        </RichBlockFrame>
    );
}

export const ImageGridExtension = Node.create({
    name: 'imageGrid',
    group: 'block',
    atom: true,
    defining: true,
    addAttributes() {
        return {
            columns: {
                default: 2,
                parseHTML: el => parseInt(el.getAttribute('data-columns') || el.getAttribute('data-cols')) || 2,
                renderHTML: attrs => ({ 'data-columns': attrs.columns }),
            },
            mobileColumns: {
                default: 1,
                parseHTML: el => parseInt(el.getAttribute('data-mobile-columns')) || 1,
                renderHTML: attrs => ({ 'data-mobile-columns': attrs.mobileColumns }),
            },
            gap: {
                default: 'normal',
                parseHTML: el => el.getAttribute('data-gap') || 'normal',
                renderHTML: attrs => ({ 'data-gap': attrs.gap }),
            },
            aspectRatio: {
                default: 'landscape',
                parseHTML: el => el.getAttribute('data-aspect') || 'landscape',
                renderHTML: attrs => ({ 'data-aspect': attrs.aspectRatio }),
            },
            captionMode: {
                default: 'below',
                parseHTML: el => el.getAttribute('data-caption-mode') || 'below',
                renderHTML: attrs => ({ 'data-caption-mode': attrs.captionMode }),
            },
            cornerStyle: {
                default: 'rounded',
                parseHTML: el => el.getAttribute('data-corner-style') || 'rounded',
                renderHTML: attrs => ({ 'data-corner-style': attrs.cornerStyle }),
            },
            width: {
                default: 'wide',
                parseHTML: el => el.getAttribute('data-width') || 'wide',
                renderHTML: attrs => ({ 'data-width': attrs.width }),
            },
            imageFit: {
                default: 'cover',
                parseHTML: el => el.getAttribute('data-image-fit') || 'cover',
                renderHTML: attrs => ({ 'data-image-fit': attrs.imageFit }),
            },
            layoutStyle: {
                default: 'uniform',
                parseHTML: el => el.getAttribute('data-layout') || 'uniform',
                renderHTML: attrs => ({ 'data-layout': attrs.layoutStyle }),
            },
            hoverEffect: {
                default: 'none',
                parseHTML: el => el.getAttribute('data-hover-effect') || 'none',
                renderHTML: attrs => ({ 'data-hover-effect': attrs.hoverEffect }),
            },
            enableLightbox: {
                default: false,
                parseHTML: el => el.getAttribute('data-enable-lightbox') === 'true',
                renderHTML: attrs => ({ 'data-enable-lightbox': attrs.enableLightbox ? 'true' : 'false' }),
            },
            loadingMode: {
                default: 'lazy',
                parseHTML: el => el.getAttribute('data-loading-mode') || 'lazy',
                renderHTML: attrs => ({ 'data-loading-mode': attrs.loadingMode }),
            },
            images: {
                default: [],
                parseHTML: el => {
                    try { return normalizeImageGridItems(JSON.parse(el.getAttribute('data-images') || '[]')); }
                    catch { return []; }
                },
                renderHTML: attrs => ({ 'data-images': JSON.stringify(normalizeImageGridItems(attrs.images)) }),
            },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    parseHTML() { return [{ tag: 'div[data-image-grid]' }, { tag: 'div[data-block="image-grid"]' }]; },
    renderHTML({ node, HTMLAttributes }) {
        const config = normalizeImageGridConfig(node.attrs);
        const images = normalizeImageGridItems(node.attrs.images);
        const widthStyle = config.width === 'content'
            ? 'width:100%;max-width:768px'
            : config.width === 'full'
                ? 'width:100%;max-width:none'
                : 'width:100%;max-width:1100px';
        const aspectStyle = config.aspectRatio === 'square'
            ? 'aspect-ratio:1 / 1'
            : config.aspectRatio === 'portrait'
                ? 'aspect-ratio:3 / 4'
                : config.aspectRatio === 'auto'
                    ? 'min-height:180px'
                    : 'aspect-ratio:4 / 3';
        const objectFit = config.imageFit === 'contain' ? 'contain' : 'cover';
        const gap = config.gap === 'tight' ? '8px' : config.gap === 'loose' ? '20px' : '14px';
        const radius = config.cornerStyle === 'soft' ? '14px' : config.cornerStyle === 'pill' ? '28px' : '22px';
        const gridStyle = `display:grid;grid-template-columns:repeat(${config.columns},minmax(0,1fr));gap:${gap};margin:1.5em 0;${widthStyle}`;
        const children = images.map(image => ['figure', { style: `border-radius:${radius};overflow:hidden;background:rgba(15,23,42,0.08);margin:0;border:1px solid rgba(148,163,184,0.18)` },
            image.href
                ? ['a', mergeAttributes(resolveContentLinkAttributes({ href: image.href, target: image.openInNewTab ? '_blank' : '_self', rel: image.openInNewTab ? 'noopener noreferrer' : '' }), { style: 'display:block;text-decoration:none;color:inherit' }), ['img', { src: image.src, alt: image.alt || '', style: `width:100%;height:100%;object-fit:${objectFit};${aspectStyle}`, loading: 'lazy' }]]
                : ['img', { src: image.src, alt: image.alt || '', style: `width:100%;height:100%;object-fit:${objectFit};${aspectStyle}`, loading: 'lazy' }],
            config.captionMode !== 'hidden' && (image.caption || image.alt)
                ? ['figcaption', { style: `padding:8px 10px;font-size:12px;line-height:1.5;${config.captionMode === 'overlay' ? 'background:linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,0.88));color:#fff;margin-top:-52px;position:relative' : 'color:var(--text-muted,#94a3b8);border-top:1px solid rgba(148,163,184,0.18)'}` }, image.caption || image.alt]
                : null,
        ].filter(Boolean));
        return ['div', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
            'data-block': 'image-grid',
            'data-version': '3',
            'data-image-grid': '',
            'data-columns': config.columns,
            'data-mobile-columns': config.mobileColumns,
            'data-gap': config.gap,
            'data-aspect': config.aspectRatio,
            'data-caption-mode': config.captionMode,
            'data-corner-style': config.cornerStyle,
            'data-width': config.width,
            'data-image-fit': config.imageFit,
            'data-layout': config.layoutStyle,
            'data-hover-effect': config.hoverEffect,
            'data-enable-lightbox': config.enableLightbox ? 'true' : 'false',
            'data-loading-mode': config.loadingMode,
            'data-images': JSON.stringify(images),
            style: gridStyle,
        })), ...children];
    },
    addNodeView() { return ReactNodeViewRenderer(ImageGridView); },
    addCommands() {
        return {
            insertImageGrid: (cols = 2) => ({ commands }) => commands.insertContent({
                type: this.name,
                attrs: { columns: cols, layoutStyle: 'uniform', images: [] },
            }),
        };
    },
});
