import { lazy, Suspense, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cmsApi } from '../../lib/cmsApi';
import { createPostContentPayload, looksLikeHtmlContent } from '../../lib/postContentSource';
import {
    getDraftIdentity,
    getDraftSnapshot,
    getLatestNewDraft,
    removeDraftSnapshot,
    saveDraftSnapshot,
} from '../../lib/postDrafts';
import { EMPTY_FORM, countWords, parseTags, postToForm, slugify } from '../../lib/postEditorForm';
import { useCoverUpload } from '../../hooks/useCoverUpload';
import { useToast } from '../../hooks/useToast';
import { extractHeadings } from '../../components/blog/markdownComponents';
import TemplatePicker from '../../components/cms/editor/TemplatePicker';
import EditorialChecklist from '../../components/cms/editor/EditorialChecklist';
import CollapsibleSection from '../../components/cms/editor/CollapsibleSection';
import EditorLoader from '../../components/cms/postEditor/EditorLoader';
import MetadataSection from '../../components/cms/postEditor/MetadataSection';
import PostHeader from '../../components/cms/postEditor/PostHeader';
import RevisionsSection from '../../components/cms/postEditor/RevisionsSection';
import SeoSection from '../../components/cms/postEditor/SeoSection';
import Toast from '../../components/cms/postEditor/Toast';

const RichEditor = lazy(() => import('../../components/cms/RichEditor'));

const AUTOSAVE_MS = 30_000;

export default function BitacoraPostEditor() {
    const { token }  = useAuth();
    const navigate   = useNavigate();
    const { slug: editSlug } = useParams();
    const isEdit = !!editSlug;

    const [form,       setForm]       = useState(EMPTY_FORM);
    const [initialForm, setInitialForm] = useState(EMPTY_FORM); // para detectar cambios sin guardar
    const [loading,    setLoading]    = useState(isEdit);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState('');
    const [slugManual, setSlugManual] = useState(false);
    const [draftSaved, setDraftSaved] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [availableDraft, setAvailableDraft] = useState(null);
    const [revision, setRevision] = useState(0);
    const [revisions, setRevisions] = useState([]);
    const [loadingRevisions, setLoadingRevisions] = useState(false);
    const [autosaveState, setAutosaveState] = useState('idle');
    const [contentFormat, setContentFormat] = useState('html');
    const [activeTemplateKey, setActiveTemplateKey] = useState('');
    const autosaveTimer = useRef(null);
    const lastAutosavedPayload = useRef('');

    const { toast, showToast } = useToast();
    const cover = useCoverUpload({ token, setForm, showToast });

    const draftIdentity = useMemo(
        () => getDraftIdentity({ isEdit, editSlug, form }),
        [editSlug, form, isEdit]
    );

    // Hay cambios sin guardar cuando el formulario difiere del original
    const isDirty = useMemo(() => {
        return JSON.stringify(form) !== JSON.stringify(initialForm);
    }, [form, initialForm]);

    const wordCount = useMemo(() => countWords(form.content), [form.content]);
    const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));

    // Títulos detectados en directo, para ver cómo quedará el índice
    const liveHeadings = useMemo(() => extractHeadings(form.content), [form.content]);

    const loadRevisions = useCallback(async (slug) => {
        if (!token || !slug) return;

        setLoadingRevisions(true);
        try {
            const items = await cmsApi.getPostRevisions(token, slug);
            setRevisions(Array.isArray(items) ? items : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingRevisions(false);
        }
    }, [token]);

    // Cargar post si es edición
    useEffect(() => {
        if (!isEdit) {
            setForm(EMPTY_FORM);
            setInitialForm(EMPTY_FORM);
            setContentFormat('html');
            setActiveTemplateKey('');
            setRevision(0);
            setRevisions([]);
            setAvailableDraft(getLatestNewDraft());
            return;
        }
        cmsApi.getPost(token, editSlug)
            .then(post => {
                const { form: loaded, format } = postToForm(post, 'published');
                const localDraft = getDraftSnapshot(`edit:${post.slug}`);
                setForm(loaded);
                setInitialForm(loaded);
                setAvailableDraft(localDraft && (localDraft.title || localDraft.content) ? localDraft : null);
                setContentFormat(format);
                setActiveTemplateKey('');
                setRevision(Number(post.revision) || 0);
                lastAutosavedPayload.current = JSON.stringify(loaded);
                setSlugManual(true);
                loadRevisions(post.slug);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [isEdit, editSlug, token, loadRevisions]);

    const buildContentPayload = useCallback(() => {
        return createPostContentPayload(form.content, contentFormat);
    }, [contentFormat, form.content]);

    // Autoguardado por post (local + remoto si edita un post existente)
    useEffect(() => {
        if (!token || !form.title.trim() || !isDirty) return;

        clearTimeout(autosaveTimer.current);
        autosaveTimer.current = setTimeout(() => {
            try {
                saveDraftSnapshot(draftIdentity, form);
                setDraftSaved(true);
                setTimeout(() => setDraftSaved(false), 2500);
            } catch {
                setDraftSaved(false);
            }

            if (!isEdit || !editSlug) {
                setAutosaveState('local');
                return;
            }

            const payload = {
                ...form,
                ...buildContentPayload(),
                revision,
                tags: parseTags(form.tags),
            };

            const serializedPayload = JSON.stringify(payload);
            if (serializedPayload === lastAutosavedPayload.current) {
                setAutosaveState('synced');
                return;
            }

            setAutosaveState('saving');
            cmsApi.autosavePost(token, editSlug, payload)
                .then(savedPost => {
                    setRevision(Number(savedPost.revision) || revision);
                    setInitialForm(form);
                    lastAutosavedPayload.current = serializedPayload;
                    setAutosaveState('synced');
                    loadRevisions(editSlug);
                })
                .catch(err => {
                    setAutosaveState('error');
                    if (err.status === 409) {
                        setError(err.message);
                    }
                });
        }, AUTOSAVE_MS);
        return () => clearTimeout(autosaveTimer.current);
    }, [buildContentPayload, draftIdentity, editSlug, form, isDirty, isEdit, loadRevisions, revision, token]);

    // El slug sigue al título hasta que se edita a mano
    const handleTitleChange = useCallback((e) => {
        const title = e.target.value;
        setForm(f => ({
            ...f,
            title,
            ...(!slugManual && { slug: slugify(title) }),
        }));
    }, [slugManual]);

    function handleChange(field) {
        return (e) => {
            const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            setForm(f => ({ ...f, [field]: value }));
        };
    }

    function handleSlugChange(e) {
        setSlugManual(true);
        setForm(f => ({ ...f, slug: e.target.value }));
    }

    function handleContentChange(html) {
        if (looksLikeHtmlContent(html)) {
            setContentFormat('html');
        }
        setForm(f => ({ ...f, content: html }));
    }

    function handleApplyTemplate(template) {
        if (!template) return;

        const hasExistingContent = Boolean(form.content.trim());
        if (hasExistingContent) {
            const confirmed = window.confirm('Este template va a reemplazar el contenido actual del editor.');
            if (!confirmed) return;
        }

        setActiveTemplateKey(template.key);
        setContentFormat('html');
        setForm(current => ({
            ...current,
            content: template.content,
        }));
        showToast(`Template "${template.label}" cargado en el editor.`);
    }

    function handleTagsChange(newTagsString) {
        setForm(f => ({ ...f, tags: newTagsString }));
    }

    // En un post nuevo el borrador pasa a ser el estado original; en uno existente
    // se queda como cambio pendiente sobre lo guardado en el servidor
    function handleRecoverDraft() {
        const draftForm = { ...availableDraft };
        delete draftForm.savedAt;
        setForm(draftForm);
        if (isEdit) {
            showToast('Se recupero el borrador local de este post.');
        } else {
            setInitialForm(draftForm);
        }
        setAvailableDraft(null);
    }

    // Vista previa en nueva pestaña
    function handlePreview() {
        try {
            sessionStorage.setItem('cms_preview', JSON.stringify({
                ...form,
                ...buildContentPayload(),
                tags: parseTags(form.tags),
            }));
        } catch {
            setError('No se ha podido preparar la vista previa en este navegador.');
        }
        window.open('/blog/preview', '_blank');
    }

    // Publicar / Actualizar
    async function handleSubmit(e, statusOverride) {
        if (e) e.preventDefault();
        setError('');
        setSaving(true);

        const payload = {
            ...form,
            ...buildContentPayload(),
            revision,
            tags: parseTags(form.tags),
            status: statusOverride || form.status || 'draft',
        };

        try {
            if (isEdit) {
                const updated = await cmsApi.updatePost(token, editSlug, payload);
                setRevision(Number(updated.revision) || revision);
                setInitialForm({ ...form, status: payload.status });
                lastAutosavedPayload.current = JSON.stringify(payload);
                removeDraftSnapshot(draftIdentity);
                await loadRevisions(editSlug);
            } else {
                const created = await cmsApi.createPost(token, payload);
                removeDraftSnapshot(draftIdentity);

                if (statusOverride === 'draft') {
                    showToast('Post guardado en borradores');
                    navigate(`/bitacora/posts/editar/${created.slug}`, { replace: true });
                    return;
                }
            }
            if (statusOverride === 'draft') {
                setForm(f => ({ ...f, status: 'draft' }));
                setInitialForm({ ...form, status: 'draft' });
                setAutosaveState('synced');
                showToast('Borrador guardado correctamente');
                return;
            }
            if (statusOverride === 'published') {
                showToast(isEdit ? 'Post actualizado y publicado' : 'Post publicado correctamente');
            }
            navigate('/bitacora/posts');
        } catch (err) {
            if (err.status === 409) {
                setError(err.message || 'Este post fue modificado en otra sesion. Recargalo antes de volver a guardar.');
            } else {
                setError(err.message);
            }
        } finally {
            setSaving(false);
        }
    }

    async function handleRestoreRevision(revisionItem) {
        if (!isEdit || !editSlug || !revisionItem) return;

        setSaving(true);
        setError('');
        try {
            const restored = await cmsApi.restorePostRevision(token, editSlug, revisionItem.id, revision);
            const { form: restoredForm, format } = postToForm(restored, 'draft');

            setForm(restoredForm);
            setInitialForm(restoredForm);
            setContentFormat(format);
            const nextRevision = Number(restored.revision) || revision;
            setRevision(nextRevision);
            lastAutosavedPayload.current = JSON.stringify({
                ...restoredForm,
                ...createPostContentPayload(restoredForm.content, format),
                revision: nextRevision,
                tags: parseTags(restoredForm.tags),
            });
            removeDraftSnapshot(`edit:${editSlug}`);
            showToast('Revision restaurada correctamente');
            await loadRevisions(editSlug);
        } catch (err) {
            setError(err.message || 'No se pudo restaurar la revision seleccionada.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
                <div className="w-8 h-8 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        // overflow-hidden solo en fullscreen; en modo normal la página puede scrollear
        // independientemente del scroll interno del editor (que tiene su propio max-h + overflow-y-auto).
        <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-3 md:p-6 transition-colors duration-300 ${fullscreen ? 'overflow-hidden' : 'overflow-auto'}`}>
            <PostHeader
                isEdit={isEdit}
                editSlug={editSlug}
                status={form.status}
                saving={saving}
                isDirty={isDirty}
                draftSaved={draftSaved}
                availableDraft={availableDraft}
                revision={revision}
                autosaveState={autosaveState}
                onRecoverDraft={handleRecoverDraft}
                onPreview={handlePreview}
                onCancel={() => navigate('/bitacora/posts')}
                onSaveDraft={() => handleSubmit(null, 'draft')}
                onPublish={e => handleSubmit(e, 'published')}
                onUnpublish={() => handleSubmit(null, 'draft')}
            />

            {error && (
                <div className="max-w-7xl mx-auto mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                    {error}
                </div>
            )}

            <form id="post-form" onSubmit={e => handleSubmit(e, 'draft')} className="max-w-7xl mx-auto space-y-5">
                <MetadataSection
                    form={form}
                    isEdit={isEdit}
                    liveHeadings={liveHeadings}
                    cover={cover}
                    onTitleChange={handleTitleChange}
                    onSlugChange={handleSlugChange}
                    onTagsChange={handleTagsChange}
                    onChange={handleChange}
                />

                <div>
                    <div className="flex items-baseline justify-between mb-2">
                        <label className="text-xs font-medium text-[var(--text-secondary)]">Contenido *</label>
                        {wordCount > 0 && (
                            <span className="text-[10px] text-[var(--text-muted)]">
                                ~{wordCount.toLocaleString('es-ES')} palabras · {readingMinutes} min de lectura
                            </span>
                        )}
                    </div>
                    <Suspense fallback={<EditorLoader />}>
                        <RichEditor
                            value={form.content}
                            onChange={handleContentChange}
                            token={token}
                            fullscreen={fullscreen}
                            onToggleFullscreen={() => setFullscreen(f => !f)}
                        />
                    </Suspense>
                </div>

                <CollapsibleSection title="Templates Editoriales" icon="📄" defaultOpen={false}>
                    <TemplatePicker activeTemplateKey={activeTemplateKey} onApplyTemplate={handleApplyTemplate} />
                </CollapsibleSection>

                <CollapsibleSection title="Checklist Editorial" icon="✅" badge={wordCount > 0 ? `${Math.min(100, Math.round((wordCount / 1500) * 100))}%` : '0%'} badgeColor="emerald" defaultOpen={false}>
                    <EditorialChecklist form={form} wordCount={wordCount} />
                </CollapsibleSection>

                {isEdit && (
                    <RevisionsSection
                        revisions={revisions}
                        loading={loadingRevisions}
                        saving={saving}
                        currentRevision={revision}
                        onReload={() => loadRevisions(editSlug)}
                        onRestore={handleRestoreRevision}
                    />
                )}

                <SeoSection form={form} onChange={handleChange} />
            </form>

            <Toast toast={toast} />
        </div>
    );
}
