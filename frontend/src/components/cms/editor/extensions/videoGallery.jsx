import { Node, Extension, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { getVideoGalleryAspectClass, getVideoGalleryColumnsClass, normalizeVideoGalleryConfig, normalizeVideoGalleryItems } from '../../../../lib/videoGallery';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';
import { joinClassNames } from './classNames';

// Video Gallery Extension

const VIDEO_GALLERY_SELECT_OPTIONS = {
    layout: [
        { value: 'grid', label: 'Cuadrícula' },
        { value: 'list', label: 'Lista' },
        { value: 'carousel', label: 'Carrusel' },
    ],
    columns: [
        { value: '1', label: '1 columna' },
        { value: '2', label: '2 columnas' },
        { value: '3', label: '3 columnas' },
        { value: '4', label: '4 columnas' },
    ],
    aspectRatio: [
        { value: '16/9', label: '16:9 (YouTube)' },
        { value: '4/3', label: '4:3 (Clásico)' },
        { value: '21/9', label: '21:9 (Cinemático)' },
        { value: 'auto', label: 'Automático' },
    ],
    provider: [
        { value: 'youtube', label: 'YouTube' },
        { value: 'vimeo', label: 'Vimeo' },
        { value: 'local', label: 'Video local' },
    ],
};

function VideoGallerySelectField({ label, value, options, onChange }) {
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

function VideoGalleryView({ node, updateAttributes, selected, deleteNode }) {
    useAuth(); // Auth context needed for form behavior
    const videos = normalizeVideoGalleryItems(node.attrs.videos || []);
    const config = normalizeVideoGalleryConfig(node.attrs);
    const [isAddingVideo, setIsAddingVideo] = useState(false);
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [newVideoTitle, setNewVideoTitle] = useState('');
    const [newVideoProvider, setNewVideoProvider] = useState('youtube');

    function setGalleryAttributes(updates) {
        updateAttributes({ ...node.attrs, ...updates });
    }

    function updateVideoItem(index, updates) {
        const next = [...videos];
        next[index] = { ...next[index], ...updates };
        setGalleryAttributes({ videos: next });
    }

    function addVideo() {
        if (!newVideoUrl.trim()) return;
        
        const newVideo = {
            src: newVideoUrl,
            title: newVideoTitle,
            provider: newVideoProvider,
        };
        
        setGalleryAttributes({ videos: [...videos, newVideo] });
        setNewVideoUrl('');
        setNewVideoTitle('');
        setIsAddingVideo(false);
    }

    function removeVideo(index) {
        const next = videos.filter((_, i) => i !== index);
        setGalleryAttributes({ videos: next });
    }

    function moveVideo(fromIndex, toIndex) {
        if (toIndex < 0 || toIndex >= videos.length || fromIndex === toIndex) return;
        const next = [...videos];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        setGalleryAttributes({ videos: next });
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
                            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Video Gallery</p>
                            <h3 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Galería multimedia</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
                            <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)]/65 px-3 py-1">{videos.length} videos</span>
                            <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)]/65 px-3 py-1">{config.layout}</span>
                        </div>
                    </div>

                    {videos.length > 0 ? (
                        <div className={joinClassNames('grid gap-4', getVideoGalleryColumnsClass(config.columns))}>
                            {videos.map((video, index) => (
                                <div
                                    key={`${video.src}-${index}`}
                                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-[var(--bg-elevated)]/80"
                                >
                                    <div className={joinClassNames('relative bg-black', getVideoGalleryAspectClass(config.aspectRatio))}>
                                        {video.thumbnail && (
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title || 'Video'}
                                                className="h-full w-full object-cover"
                                            />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90">
                                                <svg className="ml-1 h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {selected && (
                                        <div className="absolute right-2 top-2 flex gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => moveVideo(index, index - 1)}
                                                disabled={index === 0}
                                                className="rounded-lg border border-[var(--border-color)] bg-black/60 px-2 py-1 text-xs text-white backdrop-blur disabled:opacity-40"
                                            >
                                                ←
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveVideo(index, index + 1)}
                                                disabled={index === videos.length - 1}
                                                className="rounded-lg border border-[var(--border-color)] bg-black/60 px-2 py-1 text-xs text-white backdrop-blur disabled:opacity-40"
                                            >
                                                →
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeVideo(index)}
                                                className="rounded-lg border border-red-500/40 bg-red-500/20 px-2 py-1 text-xs text-red-200 backdrop-blur"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    )}

                                    {config.showTitles && video.title && (
                                        <div className="border-t border-white/10 bg-black/40 px-3 py-2 text-xs text-white backdrop-blur">
                                            {video.title}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)]/40 px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                            Añade videos desde el panel lateral
                        </div>
                    )}
                </div>

                {selected && (
                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-3 rounded-[1.4rem] border border-[var(--border-color)] bg-[var(--bg-elevated)]/65 p-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Layout</p>
                                <h4 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Opciones de visualización</h4>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <VideoGallerySelectField
                                    label="Diseño"
                                    value={config.layout}
                                    options={VIDEO_GALLERY_SELECT_OPTIONS.layout}
                                    onChange={(e) => setGalleryAttributes({ layout: e.target.value })}
                                />
                                <VideoGallerySelectField
                                    label="Columnas"
                                    value={String(config.columns)}
                                    options={VIDEO_GALLERY_SELECT_OPTIONS.columns}
                                    onChange={(e) => setGalleryAttributes({ columns: Number(e.target.value) })}
                                />
                                <VideoGallerySelectField
                                    label="Relación aspecto"
                                    value={config.aspectRatio}
                                    options={VIDEO_GALLERY_SELECT_OPTIONS.aspectRatio}
                                    onChange={(e) => setGalleryAttributes({ aspectRatio: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/70 px-3 py-2.5 text-sm text-[var(--text-secondary)]">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(config.showTitles)}
                                        onChange={(e) => setGalleryAttributes({ showTitles: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <span>Mostrar títulos</span>
                                </label>
                                <label className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/70 px-3 py-2.5 text-sm text-[var(--text-secondary)]">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(config.showDurations)}
                                        onChange={(e) => setGalleryAttributes({ showDurations: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <span>Mostrar duraciones</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-3 rounded-[1.4rem] border border-[var(--border-color)] bg-[var(--bg-elevated)]/65 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Videos</p>
                                    <h4 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Gestión de contenido</h4>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAddingVideo(!isAddingVideo)}
                                    className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-medium text-fuchsia-200 transition-colors hover:bg-fuchsia-500/20"
                                >
                                    + Añadir video
                                </button>
                            </div>

                            {isAddingVideo && (
                                <div className="space-y-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]/60 p-3">
                                    <VideoGallerySelectField
                                        label="Proveedor"
                                        value={newVideoProvider}
                                        options={VIDEO_GALLERY_SELECT_OPTIONS.provider}
                                        onChange={(e) => setNewVideoProvider(e.target.value)}
                                    />
                                    <input
                                        type="url"
                                        value={newVideoUrl}
                                        onChange={(e) => setNewVideoUrl(e.target.value)}
                                        placeholder="URL del video (ej: https://youtube.com/watch?v=...)"
                                        className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                                    />
                                    <input
                                        type="text"
                                        value={newVideoTitle}
                                        onChange={(e) => setNewVideoTitle(e.target.value)}
                                        placeholder="Título del video (opcional)"
                                        className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={addVideo}
                                            className="flex-1 rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-2 text-xs text-fuchsia-200 hover:bg-fuchsia-500/20"
                                        >
                                            Añadir
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsAddingVideo(false);
                                                setNewVideoUrl('');
                                                setNewVideoTitle('');
                                            }}
                                            className="flex-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]/60 px-3 py-2 text-xs text-[var(--text-muted)]"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {videos.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)]/40 px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                                    Haz click en "Añadir video" para empezar
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {videos.map((video, index) => (
                                        <div key={`${video.src}-edit-${index}`} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/60 p-3">
                                            <div className="mb-2 flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Video {index + 1}</p>
                                                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">{video.title || video.src}</p>
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                value={video.title || ''}
                                                onChange={(e) => updateVideoItem(index, { title: e.target.value })}
                                                placeholder="Título del video"
                                                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-fuchsia-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </RichBlockFrame>
    );
}

export const VideoGalleryExtension = Node.create({
    name: 'videoGallery',
    group: 'block',
    atom: true,
    defining: true,
    addAttributes() {
        return {
            layout: {
                default: 'grid',
                parseHTML: el => el.getAttribute('data-layout') || 'grid',
                renderHTML: attrs => ({ 'data-layout': attrs.layout }),
            },
            columns: {
                default: 2,
                parseHTML: el => parseInt(el.getAttribute('data-columns')) || 2,
                renderHTML: attrs => ({ 'data-columns': attrs.columns }),
            },
            aspectRatio: {
                default: '16/9',
                parseHTML: el => el.getAttribute('data-aspect-ratio') || '16/9',
                renderHTML: attrs => ({ 'data-aspect-ratio': attrs.aspectRatio }),
            },
            showTitles: {
                default: true,
                parseHTML: el => el.getAttribute('data-show-titles') !== 'false',
                renderHTML: attrs => ({ 'data-show-titles': attrs.showTitles ? 'true' : 'false' }),
            },
            showDurations: {
                default: false,
                parseHTML: el => el.getAttribute('data-show-durations') === 'true',
                renderHTML: attrs => ({ 'data-show-durations': attrs.showDurations ? 'true' : 'false' }),
            },
            videos: {
                default: [],
                parseHTML: el => {
                    try { return normalizeVideoGalleryItems(JSON.parse(el.getAttribute('data-videos') || '[]')); }
                    catch { return []; }
                },
                renderHTML: attrs => ({ 'data-videos': JSON.stringify(normalizeVideoGalleryItems(attrs.videos)) }),
            },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    parseHTML() { return [{ tag: 'div[data-video-gallery]' }, { tag: 'div[data-block="video-gallery"]' }]; },
    renderHTML({ node, HTMLAttributes }) {
        const config = normalizeVideoGalleryConfig(node.attrs);
        const videos = normalizeVideoGalleryItems(node.attrs.videos);
        
        return ['div', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
            'data-block': 'video-gallery',
            'data-video-gallery': '',
            'data-layout': config.layout,
            'data-columns': config.columns,
            'data-aspect-ratio': config.aspectRatio,
            'data-show-titles': config.showTitles ? 'true' : 'false',
            'data-show-durations': config.showDurations ? 'true' : 'false',
            'data-videos': JSON.stringify(videos),
        }))];
    },
    addNodeView() { return ReactNodeViewRenderer(VideoGalleryView); },
    addCommands() {
        return {
            insertVideoGallery: () => ({ commands }) => commands.insertContent({
                type: this.name,
                attrs: { layout: 'grid', columns: 2, videos: [] },
            }),
        };
    },
});
