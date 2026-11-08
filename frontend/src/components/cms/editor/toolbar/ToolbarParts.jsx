// Piezas pequeñas de la barra de herramientas.

export function ToolBtn({ onClick, active, disabled, title, children }) {
    return (
        <button
            type="button"
            onMouseDown={e => { e.preventDefault(); onClick(); }}
            disabled={disabled}
            title={title}
            aria-label={title}
            aria-pressed={active ? 'true' : 'false'}
            className={`flex items-center justify-center w-8 h-8 shrink-0 rounded-lg text-sm transition-all
                ${active
                    ? 'bg-fuchsia-500/20 text-fuchsia-400 ring-1 ring-fuchsia-500/50'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10'}
                ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            {children}
        </button>
    );
}
export function Divider() {
    return <div className="w-px h-6 bg-[var(--border-color)] mx-0.5 self-center shrink-0" />;
}
