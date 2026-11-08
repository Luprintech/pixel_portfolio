// Opciones de visibilidad del post: destacado y tabla de contenidos
export default function PostOptions({ form, onChange, liveHeadings }) {
    return (
        <>
            <div className="lg:col-span-2 mt-1">
                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                    <div className={`relative h-5 w-10 rounded-full transition-colors ${form.featured ? 'bg-fuchsia-500' : 'bg-[var(--text-secondary)] opacity-50'}`}>
                        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${form.featured ? 'translate-x-5' : ''}`} />
                        <input
                            type="checkbox"
                            checked={form.featured}
                            onChange={onChange('featured')}
                            className="sr-only"
                        />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)] transition-colors group-hover:text-fuchsia-500">
                        Marcar como artículo destacado
                    </span>
                </label>
                <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                    El blog mostrará este post en la zona destacada de la portada. Si activas esta opción en otro artículo, sustituirá al actual.
                </p>
            </div>

            <div className="lg:col-span-2 mt-4">
                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                    <div className={`relative h-5 w-10 rounded-full transition-colors ${form.showToc ? 'bg-cyan-500' : 'bg-[var(--text-secondary)] opacity-50'}`}>
                        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${form.showToc ? 'translate-x-5' : ''}`} />
                        <input
                            type="checkbox"
                            checked={form.showToc}
                            onChange={onChange('showToc')}
                            className="sr-only"
                        />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)] transition-colors group-hover:text-cyan-500">
                        Mostrar tabla de contenidos (TOC)
                    </span>
                </label>
                <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                    Muestra un índice fijo a la derecha con los títulos del post para navegación rápida. Se genera automáticamente desde los títulos H2 y H3.
                </p>

                {/* Los títulos detectados se ven siempre, para que quien escribe vea cómo quedará el índice */}
                <div className="mt-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">Títulos detectados en el contenido</p>
                    {liveHeadings.length === 0 ? (
                        <p className="text-xs text-[var(--text-muted)] italic">No se han detectado títulos H1–H3 en el contenido todavía.</p>
                    ) : (
                        <ol className="space-y-1">
                            {liveHeadings.map((heading, i) => (
                                <li
                                    key={`${heading.id}-${i}`}
                                    className="flex items-baseline gap-2 text-xs text-[var(--text-secondary)]"
                                    style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
                                >
                                    <span className="shrink-0 rounded px-1 py-0.5 bg-[var(--bg-surface)] text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                        H{heading.level}
                                    </span>
                                    <span className="truncate">{heading.text}</span>
                                </li>
                            ))}
                        </ol>
                    )}
                    {liveHeadings.length > 0 && liveHeadings.length < 3 && (
                        <p className="mt-2 text-[10px] text-amber-400/80">
                            El TOC se mostrará cuando haya al menos 3 títulos ({liveHeadings.length}/3 detectados).
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
