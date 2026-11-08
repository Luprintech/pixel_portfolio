import CollapsibleSection from '../editor/CollapsibleSection';

export default function SeoSection({ form, onChange }) {
    return (
        <CollapsibleSection title="SEO Profesional" icon="🔍" badge={(form.seoTitle || form.title).length > 0 || (form.seoDescription || form.excerpt).length > 0 ? '✓' : null} badgeColor="cyan" defaultOpen={false}>
            {/* Previsualización del resultado en Google */}
            <div className="p-4 bg-[var(--bg-primary)] rounded-xl mb-6 font-sans max-w-2xl border border-[var(--border-default)]">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 font-semibold">Previsualización de Google</p>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[10px] text-[var(--text-secondary)] font-bold overflow-hidden">
                        {form.ogImage ? <img src={form.ogImage} alt="og" className="w-full h-full object-cover"/> : 'W'}
                    </div>
                    <span className="text-[#202124] text-sm truncate max-w-[200px]">tusitio.com</span>
                    <span className="text-[#5f6368] text-sm">› blog › {form.slug || 'mi-post'}</span>
                </div>
                <h3 className="text-[#1a0dab] text-[20px] leading-[1.3] font-normal hover:underline cursor-pointer truncate">
                    {form.seoTitle || form.title || 'Título de tu artículo'}
                </h3>
                <p className="text-[#4d5156] text-[14px] leading-[1.58] mt-1 line-clamp-2">
                    {form.seoDescription || form.excerpt || 'Así es como se verá la descripción de este post cuando los usuarios lo busquen en Google. Si es muy larga se cortará con puntos suspensivos...'}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-medium text-[var(--text-secondary)]">Meta Title</label>
                        <span className={`text-[10px] ${(form.seoTitle || form.title).length > 60 ? 'text-red-500 font-bold' : 'text-emerald-500'}`}>
                            {(form.seoTitle || form.title).length}/60
                        </span>
                    </div>
                    <input
                        type="text"
                        value={form.seoTitle}
                        onChange={onChange('seoTitle')}
                        placeholder="Dejar vacío para usar el título principal"
                        className={`w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border ${
                            (form.seoTitle || form.title).length > 60 ? 'border-red-500/50 focus:border-red-500/80' : 'border-[var(--border-default)] focus:border-fuchsia-500/60'
                        } text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-fuchsia-500/40 text-sm shadow-sm`}
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-medium text-[var(--text-secondary)]">Meta Description</label>
                        <span className={`text-[10px] ${(form.seoDescription || form.excerpt).length > 160 ? 'text-red-500 font-bold' : ((form.seoDescription || form.excerpt).length < 50 && (form.seoDescription || form.excerpt).length > 0) ? 'text-yellow-500' : 'text-emerald-500'}`}>
                            {(form.seoDescription || form.excerpt).length}/160
                        </span>
                    </div>
                    <input
                        type="text"
                        value={form.seoDescription}
                        onChange={onChange('seoDescription')}
                        placeholder="Dejar vacío para usar el resumen"
                        className={`w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border ${
                            (form.seoDescription || form.excerpt).length > 160 ? 'border-red-500/50 focus:border-red-500/80' : 'border-[var(--border-default)] focus:border-fuchsia-500/60'
                        } text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-fuchsia-500/40 text-sm shadow-sm`}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Canonical URL</label>
                    <input
                        type="text"
                        value={form.canonicalUrl}
                        onChange={onChange('canonicalUrl')}
                        placeholder="Dejar vacío si es el contenido original"
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 text-sm shadow-sm"
                    />
                </div>

                <div className="lg:col-span-2 flex items-center gap-2 mt-2 p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] shadow-sm">
                    <input
                        type="checkbox"
                        id="noindex"
                        checked={form.noindex}
                        onChange={onChange('noindex')}
                        className="w-4 h-4 rounded bg-[var(--bg-primary)] border-[var(--border-default)] text-fuchsia-500 focus:ring-fuchsia-500/40 cursor-pointer"
                    />
                    <div className="flex flex-col">
                        <label htmlFor="noindex" className="text-sm font-medium text-[var(--text-primary)] cursor-pointer">
                            No indexar (noindex)
                        </label>
                        <span className="text-xs text-[var(--text-muted)]">Impide que Google y otros buscadores muestren este post en sus resultados.</span>
                    </div>
                </div>
            </div>
        </CollapsibleSection>
    );
}
