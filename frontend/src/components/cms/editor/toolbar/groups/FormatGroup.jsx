// Deshacer y rehacer, tipo de bloque, tamaño, interlineado y estilos en línea.
import { Divider, ToolBtn } from '../ToolbarParts';
import { FONT_SIZES, LINE_HEIGHTS } from '../textOptions';

export default function FormatGroup({
    editor,
    fontSize,
    getActiveBlock,
    lineHeight,
    setBlock,
    setFontSize,
    setLineHeight,
}) {
    return (
        <>
            {/* Deshacer / Rehacer */}
            <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Deshacer (Ctrl+Z)">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M3 13C3 8 7.5 4 13 4s9 4 9 9-4 9-9 9c-2.5 0-4.8-1-6.4-2.6"/></svg>
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Rehacer (Ctrl+Y)">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M21 13c0-5-4.5-9-10-9S2 8 2 13s4 9 9 9c2.5 0 4.8-1 6.4-2.6"/></svg>
            </ToolBtn>

            <Divider />

            {/* Bloque */}
            <select title="Tipo de bloque"
                className="h-8 px-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs focus:outline-none focus:border-fuchsia-500/60 cursor-pointer shrink-0"
                value={getActiveBlock()} onChange={e => setBlock(e.target.value)}>
                <option value="p">Párrafo</option>
                <option value="h1">Título 1</option>
                <option value="h2">Título 2</option>
                <option value="h3">Título 3</option>
                <option value="h4">Título 4</option>
                <option value="blockquote">Cita</option>
                <option value="codeBlock">Código</option>
            </select>

            {/* Tamaño fuente */}
            <select title="Tamaño"
                className="h-8 px-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs focus:outline-none focus:border-fuchsia-500/60 cursor-pointer w-[62px] shrink-0"
                value={fontSize}
                onChange={e => { setFontSize(e.target.value); editor.chain().focus().setFontSize(e.target.value).run(); }}>
                {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Interlineado */}
            <select title="Interlineado"
                className="h-8 px-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs focus:outline-none focus:border-fuchsia-500/60 cursor-pointer w-[50px] shrink-0"
                value={lineHeight}
                onChange={e => { setLineHeight(e.target.value); editor.chain().focus().setLineHeight(e.target.value).run(); }}>
                {LINE_HEIGHTS.map(lh => <option key={lh} value={lh}>×{lh}</option>)}
            </select>

            <Divider />

            {/* Inline */}
            <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()}    active={editor.isActive('bold')}      title="Negrita (Ctrl+B)"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()}  active={editor.isActive('italic')}    title="Cursiva (Ctrl+I)"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Subrayado (Ctrl+U)"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()}  active={editor.isActive('strike')}    title="Tachado"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="12" x2="20" y2="12"/><path d="M17.5 5.5C17 4 15.5 3 14 3H10C7.8 3 6 4.8 6 7c0 1.5.8 2.8 2 3.5"/><path d="M16.5 14.5C17 16 16 18 14 19c-1 .5-2 .5-3 .5-2 0-3.5-1-4.5-2.5"/></svg></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()}    active={editor.isActive('code')}      title="Código inline"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superíndice (x²)"><span className="text-xs font-bold leading-none">x<sup>2</sup></span></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleSubscript().run()}   active={editor.isActive('subscript')}   title="Subíndice (H₂O)"><span className="text-xs font-bold leading-none">x<sub>2</sub></span></ToolBtn>

            <Divider />
        </>
    );
}
