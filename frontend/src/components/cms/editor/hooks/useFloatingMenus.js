// Posición de los menús flotantes de la barra: se recalculan al abrirse y al hacer scroll o redimensionar.
import { useRef, useState, useCallback, useEffect } from 'react';

export function useFloatingMenus({
    showAudioMenu,
    showCalloutMenu,
    showColorPick,
    showEmojiPicker,
    showHighPick,
    showImageMenu,
    showInsertMenu,
    showLinkMenu,
    showMermaidMenu,
    showYoutubeMenu,
    fullscreen,
}) {
    const editorScrollRef = useRef(null);
    const toolbarRef = useRef(null);
    const toolbarPlaceholderRef = useRef(null);
    const editorContainerRef = useRef(null);
    const colorToolRef = useRef(null);
    const highlightToolRef = useRef(null);
    const linkToolRef = useRef(null);
    const imageToolRef = useRef(null);
    const youtubeToolRef = useRef(null);
    const audioToolRef = useRef(null);
    const calloutToolRef = useRef(null);
    const mermaidToolRef = useRef(null);
    const emojiToolRef = useRef(null);
    const insertToolRef = useRef(null);
    const [toolbarFixed, setToolbarFixed] = useState(false);
    const [toolbarPosition, setToolbarPosition] = useState({ width: 'auto', left: 'auto' });
    const [floatingMenuPosition, setFloatingMenuPosition] = useState({
        color: { top: 0, left: 0 },
        highlight: { top: 0, left: 0 },
        link: { top: 0, left: 0 },
        image: { top: 0, left: 0 },
        youtube: { top: 0, left: 0 },
        audio: { top: 0, left: 0 },
        callout: { top: 0, left: 0 },
        mermaid: { top: 0, left: 0 },
        emoji: { top: 0, left: 0 },
        insert: { top: 0, left: 0 },
    });

    const getFloatingPickerPosition = useCallback((anchorEl, menuWidth) => {
        if (!anchorEl || typeof window === 'undefined') return { top: 0, left: 0 };
        const rect = anchorEl.getBoundingClientRect();
        const margin = 12;
        const viewportWidth = window.innerWidth;
        const left = Math.min(
            Math.max(margin, rect.left),
            Math.max(margin, viewportWidth - menuWidth - margin),
        );

        return {
            top: rect.bottom + 8,
            left,
        };
    }, []);

    const updateFloatingMenuPosition = useCallback((key, anchorEl, menuWidth) => {
        setFloatingMenuPosition(prev => ({
            ...prev,
            [key]: getFloatingPickerPosition(anchorEl, menuWidth),
        }));
    }, [getFloatingPickerPosition]);

    const refreshOpenFloatingMenus = useCallback(() => {
        if (showColorPick) updateFloatingMenuPosition('color', colorToolRef.current, 192);
        if (showHighPick) updateFloatingMenuPosition('highlight', highlightToolRef.current, 176);
        if (showLinkMenu) updateFloatingMenuPosition('link', linkToolRef.current, 288);
        if (showImageMenu) updateFloatingMenuPosition('image', imageToolRef.current, 352);
        if (showYoutubeMenu) updateFloatingMenuPosition('youtube', youtubeToolRef.current, 320);
        if (showAudioMenu) updateFloatingMenuPosition('audio', audioToolRef.current, 320);
        if (showCalloutMenu) updateFloatingMenuPosition('callout', calloutToolRef.current, 144);
        if (showMermaidMenu) updateFloatingMenuPosition('mermaid', mermaidToolRef.current, 192);
        if (showEmojiPicker) updateFloatingMenuPosition('emoji', emojiToolRef.current, 320);
        if (showInsertMenu) updateFloatingMenuPosition('insert', insertToolRef.current, 416);
    }, [
        showColorPick,
        showHighPick,
        showLinkMenu,
        showImageMenu,
        showYoutubeMenu,
        showAudioMenu,
        showCalloutMenu,
        showMermaidMenu,
        showEmojiPicker,
        showInsertMenu,
        updateFloatingMenuPosition,
    ]);

    useEffect(() => {
        const anyFloatingMenuOpen = showColorPick
            || showHighPick
            || showLinkMenu
            || showImageMenu
            || showYoutubeMenu
            || showAudioMenu
            || showCalloutMenu
            || showMermaidMenu
            || showEmojiPicker
            || showInsertMenu;

        if (!anyFloatingMenuOpen) return;

        refreshOpenFloatingMenus();

        const toolbarEl = toolbarRef.current;
        const handleReposition = () => refreshOpenFloatingMenus();

        window.addEventListener('resize', handleReposition);
        window.addEventListener('scroll', handleReposition, true);
        toolbarEl?.addEventListener('scroll', handleReposition);

        return () => {
            window.removeEventListener('resize', handleReposition);
            window.removeEventListener('scroll', handleReposition, true);
            toolbarEl?.removeEventListener('scroll', handleReposition);
        };
    }, [
        showColorPick,
        showHighPick,
        showLinkMenu,
        showImageMenu,
        showYoutubeMenu,
        showAudioMenu,
        showCalloutMenu,
        showMermaidMenu,
        showEmojiPicker,
        showInsertMenu,
        refreshOpenFloatingMenus,
    ]);

    // La barra se fija arriba de la ventana cuando el editor sube por encima del viewport
    useEffect(() => {
        const toolbar = toolbarRef.current;
        const container = editorContainerRef.current;
        if (!toolbar || !container || fullscreen) return;

        const handleScroll = () => {
            const containerRect = container.getBoundingClientRect();

            if (containerRect.top <= 0) {
                if (!toolbarFixed) {
                    // Se guardan posición y ancho exactos para que no salte al pasar a fixed
                    setToolbarPosition({
                        width: `${containerRect.width}px`,
                        left: `${containerRect.left}px`,
                    });
                    setToolbarFixed(true);
                }
            } else if (toolbarFixed) {
                setToolbarFixed(false);
                setToolbarPosition({ width: 'auto', left: 'auto' });
            }
        };

        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [toolbarFixed, fullscreen]);

    return { audioToolRef, calloutToolRef, colorToolRef, editorContainerRef, editorScrollRef, emojiToolRef, floatingMenuPosition, highlightToolRef, imageToolRef, insertToolRef, linkToolRef, mermaidToolRef, toolbarFixed, toolbarPlaceholderRef, toolbarPosition, toolbarRef, updateFloatingMenuPosition, youtubeToolRef };
}
