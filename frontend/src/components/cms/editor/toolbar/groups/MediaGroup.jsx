// Enlace, imagen, YouTube, audio y tabla.
import { AUDIO_INPUT_ACCEPT, IMAGE_INPUT_ACCEPT } from '../../../../../lib/mediaUploadPolicy';
import { ToolBtn } from '../ToolbarParts';
import { createPortal } from 'react-dom';

export default function MediaGroup({
    applyAudio,
    applyLink,
    applyYoutube,
    audioInputRef,
    audioToolRef,
    audioUrl,
    availableImages,
    editor,
    fileInputRef,
    floatingMenuPosition,
    handleAudioFile,
    handleImageInputChange,
    imageToolRef,
    insertExistingImage,
    linkToolRef,
    linkUrl,
    loadAvailableImages,
    loadingImages,
    openImageMenu,
    setAudioUrl,
    setLinkUrl,
    setShowAudioMenu,
    setShowImageMenu,
    setShowLinkMenu,
    setShowYoutubeMenu,
    setYoutubeUrl,
    showAudioMenu,
    showImageMenu,
    showLinkMenu,
    showYoutubeMenu,
    updateFloatingMenuPosition,
    uploading,
    youtubeToolRef,
    youtubeUrl,
}) {
    return (
        <>
            {/* Enlace */}
            <div ref={linkToolRef} className="relative" onMouseDown={e => e.stopPropagation()}>
                <ToolBtn onClick={() => {
                    if (!showLinkMenu) updateFloatingMenuPosition('link', linkToolRef.current, 288);
                    setShowLinkMenu(p => !p);
                    setLinkUrl(editor.getAttributes('link').href || '');
                    setShowImageMenu(false);
                    setShowYoutubeMenu(false);
                    setShowAudioMenu(false);
                }} active={editor.isActive('link')} title="Enlace">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </ToolBtn>
                {showLinkMenu && typeof document !== 'undefined' && createPortal(
                    <div className="fixed z-[220] p-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl flex gap-2 w-[min(18rem,calc(100vw-1.5rem))]"
                        style={{ top: `${floatingMenuPosition.link.top}px`, left: `${floatingMenuPosition.link.left}px` }}
                        onMouseDown={e => e.stopPropagation()}>
                        <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyLink()}
                            placeholder="https://…"
                            className="flex-1 px-3 py-1.5 text-sm bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-fuchsia-500/60"
                            autoFocus />
                        <button type="button" onClick={applyLink} className="px-3 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-sm rounded-lg">OK</button>
                        {editor.isActive('link') && <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setShowLinkMenu(false); }} className="px-2 py-1.5 text-red-400 text-sm">✕</button>}
                    </div>,
                    document.body,
                )}
            </div>

            {/* Imagen */}
            <div ref={imageToolRef} className="relative" onMouseDown={e => e.stopPropagation()}>
                <ToolBtn onClick={openImageMenu} disabled={uploading} title="Insertar imagen (galería o subir)">
                    {uploading ? <div className="w-4 h-4 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" /> : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
                </ToolBtn>
                {showImageMenu && typeof document !== 'undefined' && createPortal(
                    <div
                        className="fixed z-[220] w-[min(22rem,calc(100vw-1.5rem))] rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-3 shadow-2xl"
                        style={{ top: `${floatingMenuPosition.image.top}px`, left: `${floatingMenuPosition.image.left}px` }}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Insertar imagen</h4>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="rounded-md border border-[var(--border-color)] px-2 py-1 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                                >
                                    Desde tu ordenador
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void loadAvailableImages()}
                                    className="rounded-md border border-[var(--border-color)] px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                >
                                    Recargar
                                </button>
                            </div>
                        </div>

                        {loadingImages ? (
                            <div className="py-4 text-center text-xs text-[var(--text-muted)]">Cargando imágenes…</div>
                        ) : availableImages.length === 0 ? (
                            <div className="py-4 text-center text-xs text-[var(--text-muted)]">
                                No hay imágenes guardadas todavía.
                            </div>
                        ) : (
                            <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto pr-1">
                                {availableImages.map((img) => (
                                    <button
                                        key={img.filename || img.url}
                                        type="button"
                                        onClick={() => insertExistingImage(img)}
                                        className="group overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-left"
                                        title={img.filename || img.url}
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.filename || 'Imagen guardada'}
                                            className="h-20 w-full object-cover transition-transform duration-150 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <span className="block truncate px-1.5 py-1 text-[10px] text-[var(--text-muted)]">
                                            {img.filename || img.url}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>,
                    document.body,
                )}
            </div>
            <input ref={fileInputRef} type="file" accept={IMAGE_INPUT_ACCEPT} className="hidden" onChange={handleImageInputChange} />

            {/* YouTube */}
            <div ref={youtubeToolRef} className="relative" onMouseDown={e => e.stopPropagation()}>
                <ToolBtn onClick={() => {
                    if (!showYoutubeMenu) updateFloatingMenuPosition('youtube', youtubeToolRef.current, 320);
                    setShowYoutubeMenu(p => !p);
                    setShowImageMenu(false);
                    setShowLinkMenu(false);
                    setShowAudioMenu(false);
                }} title="Vídeo YouTube">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.5 2.8 12 2.8 12 2.8s-4.5 0-6.8.1c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.1.7 11.2v1.9c0 2.1.3 4.2.3 4.2s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.5 21.4 12 21.5 12 21.5s4.5 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.1.3-4.2v-1.9C23.3 9.1 23 7 23 7z" opacity=".85"/><polygon points="9.5,15.5 15.5,12 9.5,8.5" fill="white"/></svg>
                </ToolBtn>
                {showYoutubeMenu && typeof document !== 'undefined' && createPortal(
                    <div className="fixed z-[220] p-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl flex gap-2 w-[min(20rem,calc(100vw-1.5rem))]"
                        style={{ top: `${floatingMenuPosition.youtube.top}px`, left: `${floatingMenuPosition.youtube.left}px` }}
                        onMouseDown={e => e.stopPropagation()}>
                        <input type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyYoutube()}
                            placeholder="https://youtube.com/watch?v=…"
                            className="flex-1 px-3 py-1.5 text-sm bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-fuchsia-500/60"
                            autoFocus />
                        <button type="button" onClick={applyYoutube} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg">Insertar</button>
                    </div>,
                    document.body,
                )}
            </div>

            {/* Audio */}
            <div ref={audioToolRef} className="relative" onMouseDown={e => e.stopPropagation()}>
                <ToolBtn onClick={() => {
                    if (!showAudioMenu) updateFloatingMenuPosition('audio', audioToolRef.current, 320);
                    setShowAudioMenu(p => !p);
                    setShowImageMenu(false);
                    setShowLinkMenu(false);
                    setShowYoutubeMenu(false);
                }} title="Insertar audio">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
                </ToolBtn>
                {showAudioMenu && typeof document !== 'undefined' && createPortal(
                    <div className="fixed z-[220] p-3 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl w-[min(20rem,calc(100vw-1.5rem))] space-y-2"
                        style={{ top: `${floatingMenuPosition.audio.top}px`, left: `${floatingMenuPosition.audio.left}px` }}
                        onMouseDown={e => e.stopPropagation()}>
                        <div className="flex gap-2">
                            <input type="url" value={audioUrl} onChange={e => setAudioUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyAudio()}
                                placeholder="https://…/audio.mp3"
                                className="flex-1 px-3 py-1.5 text-sm bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-fuchsia-500/60"
                                autoFocus />
                            <button type="button" onClick={applyAudio} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg">OK</button>
                        </div>
                        <button type="button" onClick={() => audioInputRef.current?.click()}
                            className="w-full py-1.5 text-sm border border-dashed border-[var(--border-color)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors">
                            Subir archivo de audio
                        </button>
                        <input ref={audioInputRef} type="file" accept={AUDIO_INPUT_ACCEPT} className="hidden" onChange={handleAudioFile} />
                    </div>,
                    document.body,
                )}
            </div>

            {/* Tabla */}
            <ToolBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insertar tabla">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
            </ToolBtn>
        </>
    );
}
