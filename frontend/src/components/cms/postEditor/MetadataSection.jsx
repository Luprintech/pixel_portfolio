import CollapsibleSection from '../editor/CollapsibleSection';
import { EXCERPT_MAX, TITLE_MAX } from '../../../lib/postEditorForm';
import CoverImageField from './CoverImageField';
import PostOptions from './PostOptions';
import TagChips from './TagChips';

export default function MetadataSection({ form, isEdit, liveHeadings, cover, onTitleChange, onSlugChange, onTagsChange, onChange }) {
    const titleLen = form.title.length;
    const excerptLen = form.excerpt.length;

    return (
        <CollapsibleSection title="Metadatos" icon="📋" defaultOpen={true}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Título */}
                <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5" htmlFor="post-title">Título *</label>
                    <input
                        id="post-title"
                        type="text"
                        value={form.title}
                        onChange={onTitleChange}
                        required
                        placeholder="Título del post…"
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm shadow-sm"
                    />
                    {/* Contador de caracteres del título */}
                    <p className={`mt-1.5 text-right text-[10px] font-medium ${titleLen > TITLE_MAX ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
                        {titleLen}/{TITLE_MAX}
                        {titleLen > TITLE_MAX && <span className="ml-1">— demasiado largo</span>}
                    </p>
                </div>

                {/* Slug */}
                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5" htmlFor="post-slug">
                        Slug * <span className="text-[var(--text-muted)] opacity-70">(URL)</span>
                    </label>
                    <input
                        id="post-slug"
                        type="text"
                        value={form.slug}
                        onChange={onSlugChange}
                        required
                        placeholder="mi-primer-post"
                        disabled={isEdit}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed font-mono shadow-sm"
                    />
                </div>

                {/* Fecha */}
                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5" htmlFor="post-date">Fecha de publicación</label>
                    <input
                        id="post-date"
                        type="date"
                        value={form.date}
                        onChange={onChange('date')}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm shadow-sm"
                    />
                </div>

                {/* Tags */}
                <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5" htmlFor="post-tags">
                        Tags <span className="text-[var(--text-muted)] opacity-70">(separados por coma)</span>
                    </label>
                    <input
                        id="post-tags"
                        type="text"
                        value={form.tags}
                        onChange={onChange('tags')}
                        placeholder="React, Node.js, Docker"
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm shadow-sm"
                    />
                    {/* Etiquetas como chips */}
                    <TagChips tagsString={form.tags} onChange={onTagsChange} />
                </div>

                {/* Excerpt */}
                <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5" htmlFor="post-excerpt">Resumen / excerpt</label>
                    <textarea
                        id="post-excerpt"
                        value={form.excerpt}
                        onChange={onChange('excerpt')}
                        rows={2}
                        placeholder="Breve descripción que aparece en el listado del blog…"
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/40 transition-all text-sm resize-none shadow-sm"
                    />
                    {/* Contador de caracteres del resumen */}
                    <p className={`mt-1.5 text-right text-[10px] font-medium ${excerptLen > EXCERPT_MAX ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
                        {excerptLen}/{EXCERPT_MAX}
                        {excerptLen > EXCERPT_MAX && <span className="ml-1">— demasiado largo</span>}
                    </p>
                </div>

                <CoverImageField
                    value={form.ogImage}
                    uploading={cover.uploading}
                    error={cover.error}
                    success={cover.success}
                    onUrlChange={cover.onUrlChange}
                    onUpload={cover.onUpload}
                    onClear={cover.onClear}
                />

                <PostOptions form={form} onChange={onChange} liveHeadings={liveHeadings} />
            </div>
        </CollapsibleSection>
    );
}
