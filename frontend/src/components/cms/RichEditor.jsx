import { useEditor, EditorContent } from '@tiptap/react';
import { useTheme } from '../../hooks/useTheme';
import { common, createLowlight } from 'lowlight';
import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import BubbleMenuTooltip from './editor/BubbleMenuTooltip';
import { canUseJustifyAlignment, isRichBlockNodeActive } from './editor/blockAlignment';
import { getActiveBlock, setBlock } from './editor/blockCommands';
import SlashMenu from './editor/SlashMenu';
import { filterInsertMenuItems, groupInsertMenuItems, PLUS_MENU_ITEMS, runInsertMenuEditorAction } from './editor/insertMenuConfig';
import { DOCUMENT_INPUT_ACCEPT } from '../../lib/mediaUploadPolicy';
import 'highlight.js/styles/github-dark.css';
import FormatGroup from './editor/toolbar/groups/FormatGroup';
import ColorGroup from './editor/toolbar/groups/ColorGroup';
import ParagraphGroup from './editor/toolbar/groups/ParagraphGroup';
import MediaGroup from './editor/toolbar/groups/MediaGroup';
import BlockInsertGroup from './editor/toolbar/groups/BlockInsertGroup';
import QuickToolsGroup from './editor/toolbar/groups/QuickToolsGroup';
import InsertMenu from './editor/toolbar/groups/InsertMenu';
import ViewGroup from './editor/toolbar/groups/ViewGroup';
import UploadStatus from './editor/panels/UploadStatus';
import CodeBlockToolbar from './editor/panels/CodeBlockToolbar';
import TableBubbleMenu from './editor/panels/TableBubbleMenu';
import MarkdownSourceEditor from './editor/panels/MarkdownSourceEditor';
import PreviewModal from './editor/panels/PreviewModal';
import EditorStatusBar from './editor/panels/EditorStatusBar';
import { buildEditorExtensions } from './editor/editorExtensions';
import { cleanPastedTableHtml } from './editor/pasteUtils';
import { useFloatingMenus } from './editor/hooks/useFloatingMenus';
import { useMediaUploads } from './editor/hooks/useMediaUploads';
import { usePinnedTools } from './editor/hooks/usePinnedTools';
import { useSelectionFormat } from './editor/hooks/useSelectionFormat';
import { useSlashMenu } from './editor/hooks/useSlashMenu';
import { useTextColor } from './editor/hooks/useTextColor';

const lowlight = createLowlight(common);

export default function RichEditor({ value, onChange, token, fullscreen, onToggleFullscreen }) {
    const { isDark, toggleTheme } = useTheme();
    const fileInputRef  = useRef(null);
    const audioInputRef = useRef(null);
    const docInputRef   = useRef(null);

    const [showLinkMenu,    setShowLinkMenu]    = useState(false);
    const [linkUrl,         setLinkUrl]         = useState('');
    const [showYoutubeMenu, setShowYoutubeMenu] = useState(false);
    const [youtubeUrl,      setYoutubeUrl]      = useState('');
    const [showAudioMenu,   setShowAudioMenu]   = useState(false);
    const [audioUrl,        setAudioUrl]        = useState('');
    const [showImageMenu,   setShowImageMenu]   = useState(false);
    const [showColorPick,   setShowColorPick]   = useState(false);
    const [lastTextColor,   setLastTextColor]   = useState('#000000');
    const [showHighPick,    setShowHighPick]    = useState(false);
    const [showCalloutMenu, setShowCalloutMenu] = useState(false);
    const [showMermaidMenu, setShowMermaidMenu] = useState(false);
    const [showTableColors, setShowTableColors] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showInsertMenu,  setShowInsertMenu]  = useState(false);
    const [insertMenuQuery, setInsertMenuQuery] = useState('');
    const [markdownMode,    setMarkdownMode]    = useState(false);
    const [markdownSource,  setMarkdownSource]  = useState('');
    const [showPreview,     setShowPreview]     = useState(false);

    // El editor se crea antes que los hooks que lo necesitan, y sus manejadores de arrastrar y pegar
    // necesitan subir imágenes: se conectan a través de esta referencia.
    const imageFileHandlerRef = useRef(null);

    const { slashMenu, updateSlashMenu, closeSlashMenu } = useSlashMenu();
    const { pinnedTools, handlePinTool, handleUnpinTool } = usePinnedTools();

    // Recoloca la barra flotante al hacer scroll
    const { audioToolRef, calloutToolRef, colorToolRef, editorContainerRef, editorScrollRef, emojiToolRef, floatingMenuPosition, highlightToolRef, imageToolRef, insertToolRef, linkToolRef, mermaidToolRef, toolbarFixed, toolbarPlaceholderRef, toolbarPosition, toolbarRef, updateFloatingMenuPosition, youtubeToolRef } = useFloatingMenus({ fullscreen, showAudioMenu, showCalloutMenu, showColorPick, showEmojiPicker, showHighPick, showImageMenu, showInsertMenu, showLinkMenu, showMermaidMenu, showYoutubeMenu });

    // Cerrar popups al hacer clic fuera
    useEffect(() => {
        function close() {
            setShowLinkMenu(false);
            setShowImageMenu(false);
            setShowYoutubeMenu(false);
            setShowAudioMenu(false);
            setShowColorPick(false);
            setShowHighPick(false);
            setShowCalloutMenu(false);
            setShowMermaidMenu(false);
            setShowEmojiPicker(false);
            setShowInsertMenu(false);
            setInsertMenuQuery('');
            setShowTableColors(false);
        }
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const editor = useEditor({
        extensions: buildEditorExtensions(lowlight),
        content: value || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
            updateSlashMenu(editor);
        },
        editorProps: {
            attributes: { class: 'outline-none min-h-[400px] text-gray-200 leading-relaxed' },
            transformPastedHTML: cleanPastedTableHtml,
            handleDrop(_view, event, _slice, moved) {
                if (!moved && event.dataTransfer?.files?.length) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith('image/')) {
                        event.preventDefault();
                        imageFileHandlerRef.current?.(file);
                        return true;
                    }
                }
                return false;
            },
            handlePaste(_view, event) {
                const items = event.clipboardData?.items;
                if (items) {
                    for (const item of items) {
                        if (item.type.startsWith('image/')) {
                            event.preventDefault();
                            imageFileHandlerRef.current?.(item.getAsFile());
                            return true;
                        }
                    }
                }
                return false;
            },
        },
    });

    const closeImageMenu = useCallback(() => setShowImageMenu(false), []);
    const { uploading, uploadError, availableImages, loadingImages, handleImageFile, handleImageInputChange, loadAvailableImages, insertExistingImage, handleAudioFile, handleDocumentUpload } = useMediaUploads({ editor, token, closeImageMenu });
    useEffect(() => { imageFileHandlerRef.current = handleImageFile; }, [handleImageFile]);

    const { applyTextColor, clearTextColor } = useTextColor(editor);
    const { fontSize, setFontSize, lineHeight, setLineHeight, codeBlockMeta, setCodeBlockMeta } = useSelectionFormat(editor);

    // Sincronizar value externo
    useEffect(() => {
        if (!editor) return;
        if (value !== undefined && value !== editor.getHTML()) {
            editor.commands.setContent(value || '', false);
        }
    }, [value, editor]);

    // Cerrar preview con ESC
    useEffect(() => {
        if (!showPreview) return;
        const onKey = (e) => { if (e.key === 'Escape') setShowPreview(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [showPreview]);

    const openImageMenu = useCallback(() => {
        updateFloatingMenuPosition('image', imageToolRef.current, 352);
        setShowImageMenu(true);
        setShowLinkMenu(false);
        setShowYoutubeMenu(false);
        setShowAudioMenu(false);
        setShowInsertMenu(false);
        setShowEmojiPicker(false);
        void loadAvailableImages();
    }, [imageToolRef, loadAvailableImages, updateFloatingMenuPosition]);

    function applyLink() {
        if (!linkUrl) editor?.chain().focus().unsetLink().run();
        else editor?.chain().focus().setLink({ href: linkUrl }).run();
        setShowLinkMenu(false);
        setLinkUrl('');
    }

    function applyYoutube() {
        if (youtubeUrl) editor?.commands.setYoutubeVideo({ src: youtubeUrl });
        setShowYoutubeMenu(false);
        setYoutubeUrl('');
    }

    function applyAudio() {
        if (audioUrl) editor?.commands.insertAudio({ src: audioUrl });
        setShowAudioMenu(false);
        setAudioUrl('');
    }

    function toggleMarkdownMode() {
        if (!editor) return;
        if (!markdownMode) {
            setMarkdownSource(editor.getHTML());
            setMarkdownMode(true);
        } else {
            editor.commands.setContent(markdownSource, false);
            onChange(markdownSource);
            setMarkdownMode(false);
        }
    }

    // Acciones del menú «/» que necesitan abrir una interfaz propia
    function handleSlashAction(action) {
        if (action === 'image') setTimeout(() => openImageMenu(), 0);
        else if (action === 'youtube') setShowYoutubeMenu(true);
        else if (action === 'audio') setShowAudioMenu(true);
        else if (action === 'document') setTimeout(() => docInputRef.current?.click(), 0);
        else if (action === 'emoji') setShowEmojiPicker(true);
    }

    function handleInsertAction(action) {
        if (!runInsertMenuEditorAction(editor, action)) {
            handleSlashAction(action);
        }
        setShowInsertMenu(false);
    }

    function updateCodeBlockMetadata(patch) {
        setCodeBlockMeta(prev => ({ ...prev, ...patch }));
        editor.commands.updateAttributes('codeBlock', patch);
    }

    // Debe ir ANTES del early return para respetar las reglas de hooks
    const contextHint = useMemo(() => {
        if (!editor) return '';
        if (editor.isActive('table'))
            return 'Tab: siguiente celda · Shift+Tab: anterior · Ctrl+Shift+X: eliminar tabla';
        if (editor.isActive('codeBlock'))
            return 'Shift+Enter: salir del bloque de código';
        if (editor.isActive('link'))
            return 'Ctrl+K: editar enlace · Ctrl+Shift+K: quitar enlace';
        if (editor.isActive('bold') || editor.isActive('italic'))
            return 'Ctrl+B: negrita · Ctrl+I: cursiva · Ctrl+U: subrayado';
        return 'Ctrl+B: negrita · Ctrl+K: enlace · "/" para insertar bloques';
    }, [editor]);

    if (!editor) return null;

    const wordCount = editor.storage.characterCount?.words?.() ?? 0;
    const charCount = editor.storage.characterCount?.characters?.() ?? 0;
    const readMin   = Math.max(1, Math.ceil(wordCount / 200));
    const richBlockAlignmentActive = isRichBlockNodeActive(editor);
    const justifyEnabled = canUseJustifyAlignment(editor);
    const plusMenuItems = filterInsertMenuItems(PLUS_MENU_ITEMS, insertMenuQuery);
    const plusMenuGroups = groupInsertMenuItems(plusMenuItems);

    return (
        <div 
            ref={editorContainerRef}
            data-rich-editor-root="true"
            className={`flex flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)]
            ${fullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}
        >

            {/* Placeholder para evitar saltos cuando el toolbar se hace fixed */}
            {toolbarFixed && <div ref={toolbarPlaceholderRef} style={{ height: toolbarRef.current?.offsetHeight || 0 }} />}

            {/* Toolbar */}
            <div 
                ref={toolbarRef}
                data-rich-editor-toolbar="true"
                className={`flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-[var(--border-color)] bg-[var(--bg-surface)] transition-all overflow-x-auto ${
                    toolbarFixed ? 'shadow-2xl z-[100]' : 'relative z-20 rounded-t-2xl'
                }`}
                style={{
                    position: toolbarFixed ? 'fixed' : 'relative',
                    top: toolbarFixed ? 0 : 'auto',
                    left: toolbarFixed ? toolbarPosition.left : 'auto',
                    width: toolbarFixed ? toolbarPosition.width : 'auto',
                }}
            >

                <FormatGroup
                    editor={editor}
                    fontSize={fontSize}
                    getActiveBlock={() => getActiveBlock(editor)}
                    lineHeight={lineHeight}
                    setBlock={value => setBlock(editor, value)}
                    setFontSize={setFontSize}
                    setLineHeight={setLineHeight}
                />

                <ColorGroup
                    applyTextColor={applyTextColor}
                    clearTextColor={clearTextColor}
                    colorToolRef={colorToolRef}
                    editor={editor}
                    floatingMenuPosition={floatingMenuPosition}
                    highlightToolRef={highlightToolRef}
                    lastTextColor={lastTextColor}
                    setLastTextColor={setLastTextColor}
                    setShowColorPick={setShowColorPick}
                    setShowHighPick={setShowHighPick}
                    showColorPick={showColorPick}
                    showHighPick={showHighPick}
                    updateFloatingMenuPosition={updateFloatingMenuPosition}
                />

                <ParagraphGroup editor={editor} justifyEnabled={justifyEnabled} richBlockAlignmentActive={richBlockAlignmentActive} />

                <MediaGroup
                    applyAudio={applyAudio}
                    applyLink={applyLink}
                    applyYoutube={applyYoutube}
                    audioInputRef={audioInputRef}
                    audioToolRef={audioToolRef}
                    audioUrl={audioUrl}
                    availableImages={availableImages}
                    editor={editor}
                    fileInputRef={fileInputRef}
                    floatingMenuPosition={floatingMenuPosition}
                    handleAudioFile={handleAudioFile}
                    handleImageInputChange={handleImageInputChange}
                    imageToolRef={imageToolRef}
                    insertExistingImage={insertExistingImage}
                    linkToolRef={linkToolRef}
                    linkUrl={linkUrl}
                    loadAvailableImages={loadAvailableImages}
                    loadingImages={loadingImages}
                    openImageMenu={openImageMenu}
                    setAudioUrl={setAudioUrl}
                    setLinkUrl={setLinkUrl}
                    setShowAudioMenu={setShowAudioMenu}
                    setShowImageMenu={setShowImageMenu}
                    setShowLinkMenu={setShowLinkMenu}
                    setShowYoutubeMenu={setShowYoutubeMenu}
                    setYoutubeUrl={setYoutubeUrl}
                    showAudioMenu={showAudioMenu}
                    showImageMenu={showImageMenu}
                    showLinkMenu={showLinkMenu}
                    showYoutubeMenu={showYoutubeMenu}
                    updateFloatingMenuPosition={updateFloatingMenuPosition}
                    uploading={uploading}
                    youtubeToolRef={youtubeToolRef}
                    youtubeUrl={youtubeUrl}
                />

                <BlockInsertGroup
                    calloutToolRef={calloutToolRef}
                    editor={editor}
                    floatingMenuPosition={floatingMenuPosition}
                    mermaidToolRef={mermaidToolRef}
                    setShowCalloutMenu={setShowCalloutMenu}
                    setShowMermaidMenu={setShowMermaidMenu}
                    showCalloutMenu={showCalloutMenu}
                    showMermaidMenu={showMermaidMenu}
                    updateFloatingMenuPosition={updateFloatingMenuPosition}
                />

                <QuickToolsGroup
                    editor={editor}
                    emojiToolRef={emojiToolRef}
                    floatingMenuPosition={floatingMenuPosition}
                    handleInsertAction={handleInsertAction}
                    handleUnpinTool={handleUnpinTool}
                    pinnedTools={pinnedTools}
                    setShowEmojiPicker={setShowEmojiPicker}
                    showEmojiPicker={showEmojiPicker}
                    updateFloatingMenuPosition={updateFloatingMenuPosition}
                />

                <InsertMenu
                    floatingMenuPosition={floatingMenuPosition}
                    handleInsertAction={handleInsertAction}
                    handlePinTool={handlePinTool}
                    handleUnpinTool={handleUnpinTool}
                    insertMenuQuery={insertMenuQuery}
                    insertToolRef={insertToolRef}
                    pinnedTools={pinnedTools}
                    plusMenuGroups={plusMenuGroups}
                    plusMenuItems={plusMenuItems}
                    setInsertMenuQuery={setInsertMenuQuery}
                    setShowInsertMenu={setShowInsertMenu}
                    showInsertMenu={showInsertMenu}
                    updateFloatingMenuPosition={updateFloatingMenuPosition}
                />

                <ViewGroup
                    fullscreen={fullscreen}
                    isDark={isDark}
                    markdownMode={markdownMode}
                    onToggleFullscreen={onToggleFullscreen}
                    setShowPreview={setShowPreview}
                    toggleMarkdownMode={toggleMarkdownMode}
                    toggleTheme={toggleTheme}
                />
            </div>

            {/* TOOLBAR CONTEXTUAL DE TABLA (ahora BubbleMenu flotante) */}

            <UploadStatus uploadError={uploadError} uploading={uploading} />

            {/* Área de edición */}
            {/* overflow-y-auto + max-height acotado: crea scroll interno independiente del scroll de página.
                En fullscreen: ocupa toda la pantalla disponible.
                En modo normal: altura máxima de 72 vh para que el toolbar y la barra de estado sean visibles
                y el usuario pueda seguir scrollando la página para acceder a Metadatos, SEO, Revisiones, etc. */}
            <div
                ref={editorScrollRef}
                className={`overflow-y-auto bg-[var(--bg-primary)] focus-within:outline-none ${markdownMode ? 'hidden' : ''}`}
                style={{
                    minHeight: fullscreen ? 'calc(100vh - 120px)' : '420px',
                    maxHeight: fullscreen ? 'calc(100vh - 120px)' : '72vh',
                }}
            >
                <CodeBlockToolbar codeBlockMeta={codeBlockMeta} editor={editor} updateCodeBlockMetadata={updateCodeBlockMetadata} />
                {/* Columna central tipo Medium */}
                <div className={`
                    rich-editor-content
                    mx-auto px-6 py-10
                    prose ${isDark ? 'prose-invert' : ''} max-w-none
                    [&_.tiptap]:outline-none
                    [&_.tiptap]:max-w-full [&_.tiptap]:mx-auto [&_.tiptap]:px-4
                    [&_.tiptap]:text-[17px] [&_.tiptap]:leading-[1.8] [&_.tiptap]:text-[var(--text-primary)]
                    [&_.tiptap_h1]:text-[2.1em] [&_.tiptap_h1]:font-extrabold [&_.tiptap_h1]:leading-tight [&_.tiptap_h1]:mt-10 [&_.tiptap_h1]:mb-4 [&_.tiptap_h1]:text-[var(--text-primary)]
                    [&_.tiptap_h2]:text-[1.55em] [&_.tiptap_h2]:font-bold [&_.tiptap_h2]:leading-snug [&_.tiptap_h2]:mt-9 [&_.tiptap_h2]:mb-3 [&_.tiptap_h2]:text-[var(--text-primary)]
                    [&_.tiptap_h3]:text-[1.25em] [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:mt-7 [&_.tiptap_h3]:mb-2 [&_.tiptap_h3]:text-[var(--text-primary)]
                    [&_.tiptap_h4]:text-[1.05em] [&_.tiptap_h4]:font-semibold [&_.tiptap_h4]:mt-6 [&_.tiptap_h4]:mb-2 [&_.tiptap_h4]:text-[var(--text-secondary)]
                    [&_.tiptap_p]:mb-5 [&_.tiptap_p]:text-[var(--text-secondary)]
                    [&_.tiptap_strong]:text-[var(--text-primary)] [&_.tiptap_strong]:font-bold
                    [&_.tiptap_em]:text-[var(--text-primary)]
                    [&_.tiptap_blockquote]:border-l-[3px] [&_.tiptap_blockquote]:border-fuchsia-500 [&_.tiptap_blockquote]:pl-5 [&_.tiptap_blockquote]:my-6 [&_.tiptap_blockquote]:italic [&_.tiptap_blockquote]:text-[var(--text-muted)] [&_.tiptap_blockquote]:text-[1.05em]
                    [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_ul]:mb-5 [&_.tiptap_ul]:space-y-1
                    [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.tiptap_ol]:mb-5 [&_.tiptap_ol]:space-y-1
                    [&_.tiptap_li]:text-[var(--text-secondary)]
                    [&_.tiptap_code]:text-cyan-500 [&_.tiptap_code]:bg-[var(--bg-elevated)] [&_.tiptap_code]:px-[5px] [&_.tiptap_code]:py-[2px] [&_.tiptap_code]:rounded [&_.tiptap_code]:text-[0.87em] [&_.tiptap_code]:font-mono
                    [&_.tiptap_pre]:my-6 [&_.tiptap_pre]:rounded-xl [&_.tiptap_pre]:overflow-x-auto [&_.tiptap_pre]:text-[0.88em] [&_.tiptap_pre]:leading-relaxed [&_.tiptap_pre]:p-0
                    [&_.tiptap_pre_code]:bg-transparent [&_.tiptap_pre_code]:p-0
                    [&_.tiptap_hr]:border-[var(--border-color)] [&_.tiptap_hr]:my-10
                    [&_.tiptap_a]:text-fuchsia-500 [&_.tiptap_a]:underline [&_.tiptap_a:hover]:text-fuchsia-400
                    [&_.tiptap_img]:rounded-xl [&_.tiptap_img]:shadow-2xl [&_.tiptap_img]:my-4
                    [&_.tiptap_.tableWrapper]:my-6 [&_.tiptap_.tableWrapper]:overflow-x-auto
                    [&_.tiptap_table]:w-full [&_.tiptap_table]:border-collapse [&_.tiptap_table]:my-6
                    [&_.tiptap_td]:border [&_.tiptap_td]:border-[var(--border-color)] [&_.tiptap_td]:p-3 [&_.tiptap_td]:text-[var(--text-secondary)]
                    [&_.tiptap_th]:border [&_.tiptap_th]:border-[var(--border-color)] [&_.tiptap_th]:p-3 [&_.tiptap_th]:bg-[var(--bg-elevated)] [&_.tiptap_th]:font-semibold [&_.tiptap_th]:text-[var(--text-primary)]
                    [&_.tiptap_.column-resize-handle]:w-1 [&_.tiptap_.column-resize-handle]:bg-fuchsia-500/70
                    [&_.tiptap_.selectedCell]:relative [&_.tiptap_.selectedCell]:after:absolute [&_.tiptap_.selectedCell]:after:inset-0 [&_.tiptap_.selectedCell]:after:pointer-events-none [&_.tiptap_.selectedCell]:after:ring-2 [&_.tiptap_.selectedCell]:after:ring-fuchsia-500/35
                    [&_.resize-cursor]:cursor-col-resize
                    [&_.tiptap_p.is-editor-empty:first-child::before]:text-[var(--text-muted)]
                    [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
                    [&_.tiptap_p.is-editor-empty:first-child::before]:float-left
                     [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none
                `}>
                    <EditorContent editor={editor} />
                    <BubbleMenuTooltip editor={editor} />
                    
                    <TableBubbleMenu editor={editor} setShowTableColors={setShowTableColors} showTableColors={showTableColors} />
                </div>
            </div>

            <MarkdownSourceEditor
                fullscreen={fullscreen}
                markdownMode={markdownMode}
                markdownSource={markdownSource}
                onChange={onChange}
                setMarkdownSource={setMarkdownSource}
            />

            <PreviewModal editor={editor} setShowPreview={setShowPreview} showPreview={showPreview} />

            {/* Slash menu */}
            {slashMenu.open && (
                <SlashMenu
                    editor={editor}
                    coords={slashMenu.coords}
                    query={slashMenu.query}
                    onClose={closeSlashMenu}
                    onAction={handleSlashAction}
                />
            )}

            {/* Hidden inputs */}
            <input ref={docInputRef} type="file" accept={DOCUMENT_INPUT_ACCEPT} className="hidden" onChange={handleDocumentUpload} />

            <EditorStatusBar
                charCount={charCount}
                contextHint={contextHint}
                markdownMode={markdownMode}
                readMin={readMin}
                wordCount={wordCount}
            />
        </div>
    );
}
