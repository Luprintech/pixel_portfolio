// Barra inferior con palabras, caracteres y tiempo de lectura.
import { DOCUMENT_UPLOAD_LABEL } from '../../../../lib/mediaUploadPolicy';

export default function EditorStatusBar({
    charCount,
    contextHint,
    markdownMode,
    readMin,
    wordCount,
}) {
    return (
        <>
            {/* Status bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border-color)] bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] rounded-b-2xl">
                <div className="flex items-center gap-3">
                    <span>{wordCount} palabras · {charCount} caracteres</span>
                    <span>~{readMin} min de lectura</span>
                </div>
                <div className="flex items-center gap-2">
                    {markdownMode && <span className="text-cyan-400 font-medium">HTML Source</span>}
                    <span className="text-[var(--text-muted)] opacity-60">Docs: {DOCUMENT_UPLOAD_LABEL}</span>
                    <span className="text-[var(--text-muted)] opacity-60 transition-opacity">{contextHint}</span>
                </div>
            </div>
        </>
    );
}
