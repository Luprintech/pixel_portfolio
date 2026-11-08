// Menú de comandos "/": se abre al escribir una barra al final de un párrafo y sigue al cursor.
import { useState } from 'react';

const CLOSED = { open: false, query: '', coords: { top: 0, left: 0 } };

export function useSlashMenu() {
    const [slashMenu, setSlashMenu] = useState(CLOSED);

    function closeSlashMenu() {
        setSlashMenu(m => (m.open ? { ...m, open: false } : m));
    }

    // Se llama en cada actualización del editor para abrir, mover o cerrar el menú
    function updateSlashMenu(editor) {
        try {
            const { $from } = editor.state.selection;
            const textBefore = $from.parent.textBetween(0, $from.parentOffset);
            const slashMatch = textBefore.match(/\/(\w*)$/);
            if (slashMatch && $from.parent.type.name === 'paragraph') {
                const coords = editor.view.coordsAtPos(editor.state.selection.from);
                setSlashMenu({ open: true, query: slashMatch[1], coords: { top: coords.bottom + 8, left: coords.left } });
            } else {
                closeSlashMenu();
            }
        } catch {
            closeSlashMenu();
        }
    }

    return { slashMenu, updateSlashMenu, closeSlashMenu };
}
