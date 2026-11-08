// Editor del HTML en bruto.

export default function MarkdownSourceEditor({
    fullscreen,
    markdownMode,
    markdownSource,
    onChange,
    setMarkdownSource,
}) {
    return (
        <>
            {/* Modo markdown/source */}
            {markdownMode && (
                <div className="flex-1 bg-[var(--bg-primary)]" style={{ minHeight: fullscreen ? 'calc(100vh - 120px)' : '420px' }}>
                    <textarea
                        aria-label="Editor HTML source"
                        data-testid="cms-html-source"
                        value={markdownSource}
                        onChange={e => {
                            const nextValue = e.target.value;
                            setMarkdownSource(nextValue);
                            onChange(nextValue);
                        }}
                        className="w-full h-full min-h-[420px] p-6 bg-transparent text-[var(--text-secondary)] font-mono text-sm leading-relaxed outline-none resize-none"
                        placeholder="Edita el código fuente HTML aquí…"
                        spellCheck={false}
                    />
                </div>
            )}
        </>
    );
}
