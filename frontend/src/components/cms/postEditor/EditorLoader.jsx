export default function EditorLoader() {
    return (
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6">
            <div className="mb-4 flex gap-2">
                <div className="h-8 w-8 rounded-lg bg-[var(--bg-elevated)] animate-pulse" />
                <div className="h-8 w-8 rounded-lg bg-[var(--bg-elevated)] animate-pulse" />
                <div className="h-8 w-8 rounded-lg bg-[var(--bg-elevated)] animate-pulse" />
            </div>
            <div className="h-72 rounded-xl bg-[var(--bg-elevated)] animate-pulse" />
        </div>
    );
}
