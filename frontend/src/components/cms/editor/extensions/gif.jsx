import { Node, Extension, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { useRef, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { cmsApi } from '../../../../lib/cmsApi';
import GifPicker from '../GifPicker';
import { validateImageFile } from '../../../../lib/mediaUploadPolicy';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';
import { joinClassNames } from './classNames';

// GIF Extension

function GifView({ node, updateAttributes, selected, deleteNode }) {
    const { isAuthenticated } = useAuth();
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);

    const src = node.attrs.src || '';
    const alt = node.attrs.alt || '';
    const caption = node.attrs.caption || '';
    const width = node.attrs.width || 400;
    const autoplay = node.attrs.autoplay !== false;

    async function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateImageFile(file);
        if (!validation.isValid) {
            alert(validation.error);
            return;
        }

        if (!file.type.includes('gif')) {
            alert('Solo se permiten archivos GIF');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const result = await cmsApi.uploadImage(formData);
            updateAttributes({ src: result.url, alt: alt || 'GIF animado' });
        } catch (err) {
            console.error(err);
            alert('Error al subir el GIF');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    }

    function openFilePicker() {
        if (!isAuthenticated) return;
        fileRef.current?.click();
    }

    function handleGifSelect(gifUrl, gifTitle) {
        updateAttributes({ src: gifUrl, alt: gifTitle || 'GIF animado' });
        setShowGifPicker(false);
    }

    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            wrapperClassName="my-4"
            frameClassName="inline-block"
        >
            <div
                className={joinClassNames('group relative rounded-xl overflow-hidden', selected ? 'ring-2 ring-fuchsia-500' : '')}
                style={{ maxWidth: `${width}px` }}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
            >
                {src ? (
                    <img
                        src={src}
                        alt={alt}
                        className="block w-full rounded-xl"
                        style={{ imageRendering: autoplay ? 'auto' : 'pixelated' }}
                    />
                ) : (
                    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-surface)]/50 p-8">
                        <svg className="h-16 w-16 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                        </svg>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowGifPicker(true)}
                                className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition-colors hover:bg-cyan-500/20"
                            >
                                🎬 Buscar GIF
                            </button>
                            <button
                                type="button"
                                onClick={openFilePicker}
                                disabled={uploading}
                                className="rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-4 py-2 text-sm font-medium text-fuchsia-200 transition-colors hover:bg-fuchsia-500/20 disabled:opacity-50"
                            >
                                {uploading ? 'Subiendo...' : '📁 Subir GIF'}
                            </button>
                        </div>
                    </div>
                )}

                {src && (selected || showControls) && (
                    <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                            type="button"
                            onClick={openFilePicker}
                            className="rounded-lg border border-[var(--border-color)] bg-black/70 px-2 py-1 text-xs text-white backdrop-blur"
                        >
                            Cambiar
                        </button>
                    </div>
                )}

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {selected && src && (
                <div className="mt-3 space-y-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)]/65 p-3" onMouseDown={e => e.stopPropagation()}>
                    {/* Alineación */}
                    <div onMouseDown={e => e.stopPropagation()}>
                        <span className="mb-1 block text-xs text-[var(--text-muted)]">Alineación</span>
                        <div className="flex gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/60 p-1">
                            <button
                                type="button"
                                onClick={() => updateAttributes({ textAlign: 'left' })}
                                className={`flex-1 rounded px-2 py-1 text-xs ${(node.attrs.textAlign === 'left' || !node.attrs.textAlign) ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            >
                                ← Izquierda
                            </button>
                            <button
                                type="button"
                                onClick={() => updateAttributes({ textAlign: 'center' })}
                                className={`flex-1 rounded px-2 py-1 text-xs ${node.attrs.textAlign === 'center' ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            >
                                Centro
                            </button>
                            <button
                                type="button"
                                onClick={() => updateAttributes({ textAlign: 'right' })}
                                className={`flex-1 rounded px-2 py-1 text-xs ${node.attrs.textAlign === 'right' ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            >
                                Derecha →
                            </button>
                        </div>
                    </div>
                    <input
                        type="text"
                        value={alt}
                        onChange={(e) => updateAttributes({ alt: e.target.value })}
                        placeholder="Texto alternativo del GIF"
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                    />
                    <input
                        type="text"
                        value={caption}
                        onChange={(e) => updateAttributes({ caption: e.target.value })}
                        placeholder="Caption (opcional)"
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                    />
                    <div className="flex items-end gap-2" onMouseDown={e => e.stopPropagation()}>
                        <label className="flex-1" onMouseDown={e => e.stopPropagation()}>
                            <span className="mb-1 block text-xs text-[var(--text-muted)]">Ancho (px)</span>
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newWidth = Math.max(100, width - 50);
                                        updateAttributes({ width: newWidth });
                                    }}
                                    className="flex h-9 w-8 items-center justify-center rounded-l-lg border border-r-0 border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]"
                                >
                                    −
                                </button>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={width}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        if (val === '') {
                                            updateAttributes({ width: 400 });
                                        } else {
                                            const num = parseInt(val, 10);
                                            if (!isNaN(num)) {
                                                const clamped = Math.max(100, Math.min(800, num));
                                                updateAttributes({ width: clamped });
                                            }
                                        }
                                    }}
                                    onMouseDown={e => e.stopPropagation()}
                                    className="w-16 rounded-none border-y border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-2 py-2 text-center text-sm text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newWidth = Math.min(800, width + 50);
                                        updateAttributes({ width: newWidth });
                                    }}
                                    className="flex h-9 w-8 items-center justify-center rounded-r-lg border border-l-0 border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]"
                                >
                                    +
                                </button>
                            </div>
                        </label>
                        <label className="flex items-end gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/70 px-3 py-2" onMouseDown={e => e.stopPropagation()}>
                            <input
                                type="checkbox"
                                checked={autoplay}
                                onChange={(e) => updateAttributes({ autoplay: e.target.checked })}
                                className="h-4 w-4"
                            />
                            <span className="text-sm text-[var(--text-secondary)]">Autoplay</span>
                        </label>
                    </div>
                </div>
            )}

            {caption && (
                <p className="mt-2 text-center text-sm italic text-[var(--text-muted)]">{caption}</p>
            )}

            {showGifPicker && (
                <GifPicker
                    onSelect={handleGifSelect}
                    onClose={() => setShowGifPicker(false)}
                />
            )}
        </RichBlockFrame>
    );
}

export const GifExtension = Node.create({
    name: 'gif',
    group: 'block',
    atom: true,
    defining: true,
    addAttributes() {
        return {
            src: {
                default: null,
                parseHTML: el => el.querySelector('img')?.getAttribute('src') || null,
                renderHTML: attrs => attrs.src,
            },
            alt: {
                default: '',
                parseHTML: el => el.querySelector('img')?.getAttribute('alt') || '',
                renderHTML: attrs => attrs.alt,
            },
            caption: {
                default: '',
                parseHTML: el => el.querySelector('figcaption')?.textContent || '',
                renderHTML: attrs => attrs.caption,
            },
            width: {
                default: 400,
                parseHTML: el => parseInt(el.getAttribute('data-width')) || 400,
                renderHTML: attrs => attrs.width,
            },
            autoplay: {
                default: true,
                parseHTML: el => el.getAttribute('data-autoplay') !== 'false',
                renderHTML: attrs => attrs.autoplay,
            },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    parseHTML() { return [{ tag: 'figure[data-gif]' }, { tag: 'div[data-block="gif"]' }]; },
    renderHTML({ node, HTMLAttributes }) {
        const { src, alt, caption, width, autoplay } = node.attrs;
        
        if (!src) return ['div', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, { 'data-block': 'gif' }))];
        
        // Obtener alineación del atributo
        const alignment = node.attrs.textAlign || 'center';
        const marginMap = {
            left: '1em 0',
            center: '1em auto',
            right: '1em 0 1em auto',
        };
        
        const figureAttrs = mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
            'data-block': 'gif',
            'data-gif': '',
            'data-width': width,
            'data-autoplay': autoplay ? 'true' : 'false',
            style: `max-width:${width}px;margin:${marginMap[alignment] || '1em auto'};`,
        }));
        
        const children = [
            ['img', { src, alt: alt || '', style: `width:100%;border-radius:12px;${autoplay ? '' : 'image-rendering:pixelated;'}` }],
        ];
        
        if (caption) {
            children.push(['figcaption', { style: 'text-align:center;font-size:0.875rem;font-style:italic;color:var(--text-muted,#94a3b8);margin-top:0.5rem;' }, caption]);
        }
        
        return ['figure', figureAttrs, ...children];
    },
    addNodeView() { return ReactNodeViewRenderer(GifView); },
    addCommands() {
        return {
            insertGif: () => ({ commands }) => commands.insertContent({
                type: this.name,
                attrs: { src: null, alt: '', caption: '', width: 400, autoplay: true },
            }),
        };
    },
});
