// Borradores locales del editor de posts, guardados en localStorage por identidad
import { slugify } from './postEditorForm';

const DRAFTS_STORAGE_KEY = 'cms_post_drafts_v2';

// Un post existente se identifica por su slug; uno nuevo, por el slug o título que lleve escrito
export function getDraftIdentity({ isEdit, editSlug, form }) {
    if (isEdit && editSlug) return `edit:${editSlug}`;

    const candidate = slugify(form.slug || form.title || 'untitled');
    return `new:${candidate || 'untitled'}`;
}

function readDraftMap() {
    try {
        const parsed = JSON.parse(localStorage.getItem(DRAFTS_STORAGE_KEY) || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function writeDraftMap(nextDrafts) {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(nextDrafts));
}

export function saveDraftSnapshot(identity, form) {
    const drafts = readDraftMap();
    drafts[identity] = {
        ...form,
        savedAt: new Date().toISOString(),
    };
    writeDraftMap(drafts);
}

export function removeDraftSnapshot(identity) {
    const drafts = readDraftMap();
    delete drafts[identity];
    writeDraftMap(drafts);
}

export function getDraftSnapshot(identity) {
    return readDraftMap()[identity] || null;
}

export function getLatestNewDraft() {
    return Object.entries(readDraftMap())
        .filter(([identity, draft]) => identity.startsWith('new:') && draft?.savedAt)
        .map(([, draft]) => draft)
        .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))[0] || null;
}
