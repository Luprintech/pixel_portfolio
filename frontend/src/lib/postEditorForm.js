// Formulario del editor de posts: valores iniciales, conversiones y medidas de texto
import { inferPostContentFields } from './postContentSource';

export const TITLE_MAX = 160;
export const EXCERPT_MAX = 320;

export const EMPTY_FORM = {
    title:   '',
    slug:    '',
    date:    new Date().toISOString().split('T')[0],
    excerpt: '',
    tags:    '',
    content: '',
    seoTitle: '',
    seoDescription: '',
    ogImage: '',
    canonicalUrl: '',
    noindex: false,
    featured: false,
    showToc: true,
    status: 'draft',
};

export function slugify(str) {
    return str
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// La API guarda las etiquetas como lista; el formulario las edita como texto separado por comas
export function parseTags(tagsString) {
    return tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
}

// Convierte un post de la API en el estado del formulario. El estado por defecto
// cambia según el origen: al cargar un post ya publicado, al restaurar una revisión un borrador.
export function postToForm(post, defaultStatus) {
    const resolved = inferPostContentFields(post);
    return {
        form: {
            title:   post.title,
            slug:    post.slug,
            date:    post.date,
            excerpt: post.excerpt || '',
            tags:    Array.isArray(post.tags) ? post.tags.join(', ') : post.tags || '',
            content: resolved.sourceContent || '',
            seoTitle: post.seoTitle || '',
            seoDescription: post.seoDescription || '',
            ogImage: post.ogImage || '',
            canonicalUrl: post.canonicalUrl || '',
            noindex: post.noindex || false,
            featured: post.featured || false,
            showToc: post.showToc !== false,
            status: post.status || defaultStatus,
        },
        format: resolved.format,
    };
}

// Quita las etiquetas HTML para poder contar palabras
function stripHtml(html) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function countWords(text) {
    const clean = stripHtml(text);
    if (!clean) return 0;
    return clean.split(/\s+/).filter(Boolean).length;
}

export function formatRevisionLabel(revision) {
    if (revision.source === 'autosave') return 'Autoguardado';
    if (revision.source === 'publish') return 'Publicado';
    if (revision.source === 'restore') return 'Restauracion';
    return 'Guardado manual';
}
