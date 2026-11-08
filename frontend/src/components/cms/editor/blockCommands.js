// Tipo de bloque del selector Párrafo / Título / Cita / Código: lectura y cambio sobre el editor.

export function getActiveBlock(editor) {
    if (!editor) return 'p';
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    if (editor.isActive('heading', { level: 4 })) return 'h4';
    if (editor.isActive('blockquote')) return 'blockquote';
    if (editor.isActive('codeBlock'))  return 'codeBlock';
    return 'p';
}

export function setBlock(editor, value) {
    if (!editor) return;
    const chain = () => editor.chain().focus();
    const commands = {
        p: () => chain().setParagraph().run(),
        h1: () => chain().setHeading({ level: 1 }).run(),
        h2: () => chain().setHeading({ level: 2 }).run(),
        h3: () => chain().setHeading({ level: 3 }).run(),
        h4: () => chain().setHeading({ level: 4 }).run(),
        blockquote: () => chain().setBlockquote().run(),
        codeBlock: () => chain().setCodeBlock().run(),
    };
    commands[value]?.();
}
