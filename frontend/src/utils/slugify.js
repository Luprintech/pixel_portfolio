/**
 * Convierte un texto en un slug apto para URL: quita acentos y caracteres
 * especiales y une las palabras con guiones.
 */
export function slugify(str) {
    return str
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}
