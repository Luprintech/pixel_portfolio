// Barra contextual que aparece al editar un bloque de código.
import { CODE_LANGUAGES, CODE_VARIANTS } from '../toolbar/textOptions';

export default function CodeBlockToolbar({
    codeBlockMeta,
    editor,
    updateCodeBlockMetadata,
}) {
    return (
        <>
            {/* TOOLBAR CONTEXTUAL DE CODE BLOCK (sticky dentro del área de scroll) */}
            {/* Posicionado como primer hijo del contenedor con scroll, con sticky top-0,
                para que permanezca visible al hacer scroll hacia abajo dentro del editor. */}
            {editor.isActive('codeBlock') && (
                <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] text-xs sticky top-0 z-30">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mr-1">Codigo:</span>
                    <select
                        className="h-7 px-2 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs focus:outline-none focus:border-fuchsia-500/60 cursor-pointer"
                        value={editor.getAttributes('codeBlock').language || 'javascript'}
                        onChange={e => editor.chain().focus().updateAttributes('codeBlock', { language: e.target.value }).run()}
                    >
                        {CODE_LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                    <select
                        className="h-7 px-2 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs focus:outline-none focus:border-fuchsia-500/60 cursor-pointer"
                        value={editor.getAttributes('codeBlock').variant || 'plain'}
                        onChange={e => editor.chain().focus().updateAttributes('codeBlock', { variant: e.target.value }).run()}
                    >
                        {CODE_VARIANTS.map(variant => <option key={variant.value} value={variant.value}>{variant.label}</option>)}
                    </select>
                    <input
                        type="text"
                        value={codeBlockMeta.filename}
                        onChange={e => updateCodeBlockMetadata({ filename: e.target.value })}
                        placeholder="archivo.ext"
                        className="h-7 min-w-[120px] rounded border border-[var(--border-color)] bg-[var(--bg-primary)] px-2 text-xs text-[var(--text-secondary)] outline-none focus:border-fuchsia-500/60"
                    />
                    <input
                        type="text"
                        value={codeBlockMeta.title}
                        onChange={e => updateCodeBlockMetadata({ title: e.target.value })}
                        placeholder="Titulo opcional"
                        className="h-7 min-w-[160px] rounded border border-[var(--border-color)] bg-[var(--bg-primary)] px-2 text-xs text-[var(--text-secondary)] outline-none focus:border-fuchsia-500/60"
                    />
                    <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleCodeBlock().run(); }}
                        className="px-2 py-1 rounded hover:bg-red-500/10 text-red-400 transition-colors ml-auto">Quitar bloque</button>
                </div>
            )}
        </>
    );
}
