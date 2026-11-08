// Aplicar y quitar el color del texto. Dentro de un bloque de código el comando normal de Tiptap
// no alcanza a la selección, así que se edita la marca textStyle directamente sobre la transacción.
import { useCallback } from 'react';

export function useTextColor(editor) {
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

    return { applyTextColor, clearTextColor };
}
