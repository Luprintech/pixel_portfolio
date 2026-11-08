import { beforeEach, describe, expect, it } from 'vitest';
import {
    getDraftIdentity,
    getDraftSnapshot,
    getLatestNewDraft,
    removeDraftSnapshot,
    saveDraftSnapshot,
} from './postDrafts';
import { countWords, parseTags, postToForm, slugify } from './postEditorForm';

describe('postEditorForm', () => {
    it('slugify quita acentos y símbolos', () => {
        expect(slugify('  ¡Hola, Mundo   Ñandú! ')).toBe('hola-mundo-nandu');
    });

    it('parseTags separa por comas y descarta vacíos', () => {
        expect(parseTags('React, , Node.js ,Docker')).toEqual(['React', 'Node.js', 'Docker']);
        expect(parseTags('')).toEqual([]);
    });

    it('countWords ignora las etiquetas HTML', () => {
        expect(countWords('<p>Uno <strong>dos</strong></p><p>tres</p>')).toBe(3);
        expect(countWords('')).toBe(0);
    });

    it('postToForm usa el estado por defecto solo si el post no trae uno', () => {
        const base = { title: 'T', slug: 't', date: '2026-01-01', tags: ['a', 'b'], content: '<p>x</p>' };
        expect(postToForm(base, 'published').form.status).toBe('published');
        expect(postToForm({ ...base, status: 'draft' }, 'published').form.status).toBe('draft');
        expect(postToForm(base, 'draft').form.tags).toBe('a, b');
        expect(postToForm(base, 'draft').form.showToc).toBe(true);
    });
});

describe('postDrafts', () => {
    beforeEach(() => localStorage.clear());

    it('identifica un post existente por su slug y uno nuevo por slug o título', () => {
        expect(getDraftIdentity({ isEdit: true, editSlug: 'mi-post', form: {} })).toBe('edit:mi-post');
        expect(getDraftIdentity({ isEdit: false, form: { slug: '', title: 'Un Título' } })).toBe('new:un-titulo');
        expect(getDraftIdentity({ isEdit: false, form: { slug: '', title: '' } })).toBe('new:untitled');
    });

    it('guarda, lee y borra un borrador', () => {
        saveDraftSnapshot('edit:a', { title: 'A' });
        expect(getDraftSnapshot('edit:a').title).toBe('A');
        removeDraftSnapshot('edit:a');
        expect(getDraftSnapshot('edit:a')).toBeNull();
    });

    it('devuelve el borrador nuevo más reciente e ignora los de posts existentes', () => {
        localStorage.setItem('cms_post_drafts_v2', JSON.stringify({
            'new:viejo': { title: 'Viejo', savedAt: '2026-01-01T00:00:00Z' },
            'new:reciente': { title: 'Reciente', savedAt: '2026-02-01T00:00:00Z' },
            'edit:otro': { title: 'Otro', savedAt: '2026-03-01T00:00:00Z' },
        }));
        expect(getLatestNewDraft().title).toBe('Reciente');
    });

    it('tolera un almacenamiento corrupto', () => {
        localStorage.setItem('cms_post_drafts_v2', '{no es json');
        expect(getLatestNewDraft()).toBeNull();
    });
});
