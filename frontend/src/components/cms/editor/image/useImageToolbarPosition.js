import { useEffect, useState } from 'react';

// Ancla la barra de la imagen justo debajo de la barra principal del editor mientras la imagen está seleccionada
export function useImageToolbarPosition(selected, containerRef) {
    const [style, setStyle] = useState(null);

    useEffect(() => {
        if (!selected) {
            setStyle(null);
            return undefined;
        }

        function updatePosition() {
            const editorRoot = containerRef.current?.closest('[data-rich-editor-root="true"]');
            const toolbar = editorRoot?.querySelector('[data-rich-editor-toolbar="true"]');
            if (!toolbar) return;

            const rect = toolbar.getBoundingClientRect();
            setStyle({
                position: 'fixed',
                top: rect.bottom + 8,
                left: rect.left,
                width: rect.width,
            });
        }

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [selected, containerRef]);

    return style;
}
