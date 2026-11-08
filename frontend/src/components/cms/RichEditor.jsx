import { useEditor, EditorContent } from '@tiptap/react';
import { useTheme } from '../../hooks/useTheme';
import { common, createLowlight } from 'lowlight';
import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import BubbleMenuTooltip from './editor/BubbleMenuTooltip';
import { canUseJustifyAlignment, isRichBlockNodeActive } from './editor/blockAlignment';
import SlashMenu from './editor/SlashMenu';
import { filterInsertMenuItems, groupInsertMenuItems, PLUS_MENU_ITEMS, PINNED_TOOLS, savePinnedTools, runInsertMenuEditorAction } from './editor/insertMenuConfig';
import { DOCUMENT_INPUT_ACCEPT, validateAudioFile, validateDocumentFile, validateImageFile } from '../../lib/mediaUploadPolicy';
import { cmsApi } from '../../lib/cmsApi';
import { getUploadErrorMessage, uploadAudioFile } from './editor/uploadHelpers';
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

const lowlight = createLowlight(common);

// RichEditor
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
    const [availableImages, setAvailableImages] = useState([]);
    const [loadingImages,   setLoadingImages]   = useState(false);
    const [showColorPick,   setShowColorPick]   = useState(false);
    const [lastTextColor,   setLastTextColor]   = useState('#000000');
    const [showHighPick,    setShowHighPick]    = useState(false);
    const [showCalloutMenu, setShowCalloutMenu] = useState(false);
    const [showMermaidMenu, setShowMermaidMenu] = useState(false);
    const [showTableColors, setShowTableColors] = useState(false);
    const [uploading,       setUploading]       = useState(false);
    const [fontSize,        setFontSize]        = useState('16px');
    const [lineHeight,      setLineHeight]      = useState('1.8');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showInsertMenu,  setShowInsertMenu]  = useState(false);
    const [insertMenuQuery, setInsertMenuQuery] = useState('');
    const [markdownMode,    setMarkdownMode]    = useState(false);
    const [markdownSource,  setMarkdownSource]  = useState('');
    const [uploadError,     setUploadError]     = useState('');
    const [codeBlockMeta,   setCodeBlockMeta]   = useState({ filename: '', title: '' });
    const [showPreview,     setShowPreview]     = useState(false);

    // Slash commands
    const [slashMenu, setSlashMenu] = useState({ open: false, query: '', coords: { top: 0, left: 0 } });

    // Herramientas fijadas por el usuario
    const [pinnedTools, setPinnedTools] = useState(PINNED_TOOLS);

    // Recoloca la barra flotante al hacer scroll
    const { audioToolRef, calloutToolRef, colorToolRef, editorContainerRef, editorScrollRef, emojiToolRef, floatingMenuPosition, highlightToolRef, imageToolRef, insertToolRef, linkToolRef, mermaidToolRef, setToolbarFixed, setToolbarPosition, toolbarFixed, toolbarPlaceholderRef, toolbarPosition, toolbarRef, updateFloatingMenuPosition, youtubeToolRef } = useFloatingMenus({ showAudioMenu, showCalloutMenu, showColorPick, showEmojiPicker, showHighPick, showImageMenu, showInsertMenu, showLinkMenu, showMermaidMenu, showYoutubeMenu });

    // Función para añadir herramienta a la barra de herramientas
    const handlePinTool = (tool) => {
        if (!pinnedTools.find(t => t.action === tool.action)) {
            const newPinned = [...pinnedTools, tool];
            setPinnedTools(newPinned);
            savePinnedTools(newPinned);
        }
    };

    // Función para quitar herramienta de la barra de herramientas
    const handleUnpinTool = (action) => {
        const newPinned = pinnedTools.filter(t => t.action !== action);
        setPinnedTools(newPinned);
        savePinnedTools(newPinned);
    };

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

            // Slash command detection
            try {
                const { $from } = editor.state.selection;
                const textBefore = $from.parent.textBetween(0, $from.parentOffset);
                const slashMatch = textBefore.match(/\/(\w*)$/);
                if (slashMatch && $from.parent.type.name === 'paragraph') {
                    const coords = editor.view.coordsAtPos(editor.state.selection.from);
                    setSlashMenu({ open: true, query: slashMatch[1], coords: { top: coords.bottom + 8, left: coords.left } });
                } else if (slashMenu.open) {
                    setSlashMenu(m => ({ ...m, open: false }));
                }
            } catch {
                setSlashMenu(m => ({ ...m, open: false }));
            }
        },
        editorProps: {
            attributes: { class: 'outline-none min-h-[400px] text-gray-200 leading-relaxed' },
            transformPastedHTML: cleanPastedTableHtml,
            handleDrop(_view, event, _slice, moved) {
                if (!moved && event.dataTransfer?.files?.length) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith('image/')) {
                        event.preventDefault();
                        handleImageFile(file);
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
                            handleImageFile(item.getAsFile());
                            return true;
                        }
                    }
                }
                return false;
            },
        },
    });

    // Sincronizar value externo
    useEffect(() => {
        if (!editor) return;
        if (value !== undefined && value !== editor.getHTML()) {
            editor.commands.setContent(value || '', false);
        }
    }, [value, editor]);

    // Sincronizar selector de tamaño
    useEffect(() => {
        if (!editor) return;
        const update = () => {
            const attrs = editor.getAttributes('textStyle');
            setFontSize(attrs.fontSize || '16px');
            // Sync line-height
            const blockAttrs = editor.getAttributes('paragraph');
            const headingAttrs = editor.getAttributes('heading');
            setLineHeight(blockAttrs.lineHeight || headingAttrs.lineHeight || '1.8');
            if (editor.isActive('codeBlock')) {
                const codeAttrs = editor.getAttributes('codeBlock');
                setCodeBlockMeta({
                    filename: codeAttrs.filename || '',
                    title: codeAttrs.title || '',
                });
            }
        };
        editor.on('selectionUpdate', update);
        editor.on('transaction',     update);
        return () => { editor.off('selectionUpdate', update); editor.off('transaction', update); };
    }, [editor]);

    // Cerrar preview con ESC
    useEffect(() => {
        if (!showPreview) return;
        const onKey = (e) => { if (e.key === 'Escape') setShowPreview(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [showPreview]);

    // Recoloca la barra flotante al hacer scroll en la ventana
    useEffect(() => {
        const toolbar = toolbarRef.current;
        const container = editorContainerRef.current;
        if (!toolbar || !container || fullscreen) return;

        const handleScroll = () => {
            const containerRect = container.getBoundingClientRect();
            
            // Si el contenedor del editor está por encima del viewport
            if (containerRect.top <= 0) {
                if (!toolbarFixed) {
                    // Guardar posición y ancho exactos del toolbar
                    setToolbarPosition({
                        width: `${containerRect.width}px`,
                        left: `${containerRect.left}px`,
                    });
                    setToolbarFixed(true);
                }
            } else {
                // Si el contenedor vuelve a estar visible
                if (toolbarFixed) {
                    setToolbarFixed(false);
                    setToolbarPosition({ width: 'auto', left: 'auto' });
                }
            }
        };

        // Ejecutar al montar para setear estado inicial
        handleScroll();
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [toolbarFixed, fullscreen, editorContainerRef, setToolbarFixed, setToolbarPosition, toolbarRef]);

    const handleImageFile = useCallback(async (file) => {
        if (!file || !token) return;
        const validationError = validateImageFile(file);
        if (validationError) {
            setUploadError(validationError);
            return;
        }
        setUploading(true);
        setUploadError('');
        try {
            const uploaded = await cmsApi.uploadImage(token, file);
            const url = uploaded.url;
            editor?.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, '') }).run();
        } catch (err) {
            setUploadError(getUploadErrorMessage(err, 'No se ha podido subir la imagen.'));
            console.error(err);
        }
        finally { setUploading(false); }
    }, [editor, token]);

    const handleImageInputChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            await handleImageFile(file);
            setShowImageMenu(false);
        }
        e.target.value = '';
    }, [handleImageFile]);

    const applyTextColor = useCallback((color) => {
        if (!editor) return;

        if (!editor.isActive('codeBlock')) {
            editor.chain().focus().setColor(color).run();
            return;
        }

        const { state, view } = editor;
        const { from, to, empty } = state.selection;
        const textStyleMark = state.schema.marks.textStyle;

        if (!textStyleMark) return;
        if (empty) {
            editor.chain().focus().setColor(color).run();
            return;
        }

        const currentAttrs = editor.getAttributes('textStyle') || {};
        const nextAttrs = { ...currentAttrs, color };
        const tr = state.tr.removeMark(from, to, textStyleMark).addMark(from, to, textStyleMark.create(nextAttrs));
        view.dispatch(tr);
        view.focus();
    }, [editor]);

    const clearTextColor = useCallback(() => {
        if (!editor) return;

        if (!editor.isActive('codeBlock')) {
            editor.chain().focus().unsetColor().run();
            return;
        }

        const { state, view } = editor;
        const { from, to, empty } = state.selection;
        const textStyleMark = state.schema.marks.textStyle;

        if (!textStyleMark) return;
        if (empty) {
            editor.chain().focus().unsetColor().run();
            return;
        }

        const currentAttrs = editor.getAttributes('textStyle') || {};
        const { color: _unusedColor, ...restAttrs } = currentAttrs;
        let tr = state.tr.removeMark(from, to, textStyleMark);
        if (Object.keys(restAttrs).length > 0) {
            tr = tr.addMark(from, to, textStyleMark.create(restAttrs));
        }
        view.dispatch(tr);
        view.focus();
    }, [editor]);

    const loadAvailableImages = useCallback(async () => {
        if (!token) return;
        setLoadingImages(true);
        try {
            const images = await cmsApi.getImages(token);
            setAvailableImages(Array.isArray(images) ? images : []);
        } catch (err) {
            setUploadError(getUploadErrorMessage(err, 'No se han podido cargar las imágenes guardadas.'));
            setAvailableImages([]);
        } finally {
            setLoadingImages(false);
        }
    }, [token]);

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

    const insertExistingImage = useCallback((image) => {
        if (!editor || !image?.url) return;
        editor.chain().focus().setImage({
            src: image.url,
            alt: (image.filename || 'imagen').replace(/\.[^.]+$/, ''),
        }).run();
        setShowImageMenu(false);
    }, [editor]);

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

    async function handleAudioFile(e) {
        const file = e.target.files?.[0];
        if (!file || !token) return;
        const validationError = validateAudioFile(file);
        if (validationError) {
            setUploadError(validationError);
            e.target.value = '';
            return;
        }
        setUploading(true);
        setUploadError('');
        try {
            const url = await uploadAudioFile(file, token);
            editor?.commands.insertAudio({ src: url, title: file.name });
        } catch (err) {
            setUploadError(getUploadErrorMessage(err, 'No se ha podido subir el audio.'));
            console.error(err);
        }
        finally { setUploading(false); e.target.value = ''; }
    }

    function getActiveBlock() {
        if (!editor) return 'p';
        if (editor.isActive('heading', { level: 1 })) return 'h1';
        if (editor.isActive('heading', { level: 2 })) return 'h2';
        if (editor.isActive('heading', { level: 3 })) return 'h3';
        if (editor.isActive('heading', { level: 4 })) return 'h4';
        if (editor.isActive('blockquote')) return 'blockquote';
        if (editor.isActive('codeBlock'))  return 'codeBlock';
        return 'p';
    }

    function setBlock(v) {
        if (!editor) return;
        const map = { p: () => editor.chain().focus().setParagraph().run(),
            h1: () => editor.chain().focus().setHeading({ level: 1 }).run(),
            h2: () => editor.chain().focus().setHeading({ level: 2 }).run(),
            h3: () => editor.chain().focus().setHeading({ level: 3 }).run(),
            h4: () => editor.chain().focus().setHeading({ level: 4 }).run(),
            blockquote: () => editor.chain().focus().setBlockquote().run(),
            codeBlock:  () => editor.chain().focus().setCodeBlock().run(),
        };
        map[v]?.();
    }

    // Document upload
    async function handleDocumentUpload(e) {
        const file = e.target.files?.[0];
        if (!file || !token) return;
        const validationError = validateDocumentFile(file);
        if (validationError) {
            setUploadError(validationError);
            e.target.value = '';
            return;
        }
        setUploading(true);
        setUploadError('');
        try {
            const data = await cmsApi.uploadDocument(token, file);
            editor?.commands.insertDocument({
                src: data.url,
                filename: data.filename,
                fileType: data.fileType,
                fileSize: data.fileSize,
            });
        } catch (err) {
            setUploadError(getUploadErrorMessage(err, 'No se ha podido subir el documento.'));
            console.error(err);
        }
        finally { setUploading(false); e.target.value = ''; }
    }

    // Markdown mode toggle
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

    // Keyboard hint contextual: debe estar ANTES del early return para respetar las reglas de hooks
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
                    getActiveBlock={getActiveBlock}
                    lineHeight={lineHeight}
                    setBlock={setBlock}
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
                    onClose={() => setSlashMenu(m => ({ ...m, open: false }))}
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
