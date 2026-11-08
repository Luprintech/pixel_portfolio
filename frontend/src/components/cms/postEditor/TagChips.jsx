import { useMemo } from 'react';
import { X } from 'lucide-react';

// Los colores de las etiquetas rotan por una paleta fija
const TAG_COLORS = [
    'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/20',
    'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    'bg-violet-500/15 text-violet-400 border-violet-500/20',
    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    'bg-amber-500/15 text-amber-400 border-amber-500/20',
    'bg-rose-500/15 text-rose-400 border-rose-500/20',
];

export default function TagChips({ tagsString, onChange }) {
    const tags = useMemo(
        () => tagsString.split(',').map(t => t.trim()).filter(Boolean),
        [tagsString]
    );

    function removeTag(index) {
        const next = tags.filter((_, i) => i !== index);
        onChange(next.join(', '));
    }

    if (tags.length === 0) return null;

    return (
        <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
                <span
                    key={`${tag}-${i}`}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}
                >
                    {tag}
                    <button
                        type="button"
                        onClick={() => removeTag(i)}
                        aria-label={`Eliminar tag ${tag}`}
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full opacity-60 hover:opacity-100 transition-opacity"
                    >
                        <X className="h-2.5 w-2.5" />
                    </button>
                </span>
            ))}
        </div>
    );
}
