// Refleja en la barra el formato de la selección: tamaño de fuente, interlineado y metadatos del bloque de código.
import { useEffect, useState } from 'react';

export function useSelectionFormat(editor) {
    const [fontSize, setFontSize] = useState('16px');
    const [lineHeight, setLineHeight] = useState('1.8');
    const [codeBlockMeta, setCodeBlockMeta] = useState({ filename: '', title: '' });

    useEffect(() => {
        if (!editor) return;
        const update = () => {
            const attrs = editor.getAttributes('textStyle');
            setFontSize(attrs.fontSize || '16px');
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

    return { fontSize, setFontSize, lineHeight, setLineHeight, codeBlockMeta, setCodeBlockMeta };
}
