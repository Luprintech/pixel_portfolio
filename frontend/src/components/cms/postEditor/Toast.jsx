export default function Toast({ toast }) {
    if (!toast) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-[slideUp_0.3s_ease-out]">
            <div className={`flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-sm text-sm font-medium border ${
                toast.type === 'error'
                    ? 'bg-red-500/90 border-red-400/30 text-white'
                    : 'bg-emerald-500/90 border-emerald-400/30 text-white'
            }`}>
                {toast.type === 'error' ? (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
                    </svg>
                ) : (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M5 13l4 4L19 7"/>
                    </svg>
                )}
                {toast.message}
            </div>
        </div>
    );
}
