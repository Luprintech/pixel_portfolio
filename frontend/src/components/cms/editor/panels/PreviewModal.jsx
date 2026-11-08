// Vista previa del post tal como lo verá el lector.
import HtmlContentRenderer from '../../../blog/renderers/HtmlContentRenderer';

export default function PreviewModal({
    editor,
    setShowPreview,
    showPreview,
}) {
    return (
        <>
            {/* Preview modal */}
            {showPreview && (
                <div 
                    className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm overflow-y-auto"
                    onClick={() => setShowPreview(false)}
                >
                    <div 
                        className="relative max-w-3xl mx-auto my-12 px-8 py-10 
                                   bg-[var(--bg-primary)] rounded-2xl shadow-2xl border border-[var(--border-color)]"
                        onClick={e => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setShowPreview(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg
                                       text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]
                                       transition-colors"
                            title="Cerrar (ESC)"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                        </button>
                        <div className="prose prose-invert max-w-none">
                            <HtmlContentRenderer content={editor?.getHTML() || ''} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
