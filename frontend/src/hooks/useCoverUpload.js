import { useState } from 'react';
import { cmsApi } from '../lib/cmsApi';
import { validateImageFile } from '../lib/mediaUploadPolicy';

// Estado y acciones de la portada (campo ogImage): escribir la URL, subir un archivo o quitarla
export function useCoverUpload({ token, setForm, showToast }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    function clearMessages() {
        setError('');
        setSuccess('');
    }

    function onUrlChange(e) {
        clearMessages();
        setForm(f => ({ ...f, ogImage: e.target.value }));
    }

    function onClear() {
        setForm(f => ({ ...f, ogImage: '' }));
        clearMessages();
    }

    async function onUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        clearMessages();
        setUploading(true);

        try {
            const validationError = validateImageFile(file);
            if (validationError) throw new Error(validationError);

            const { url } = await cmsApi.uploadImage(token, file);
            if (!url) throw new Error('La API no devolvio una URL de imagen valida.');

            setForm(f => ({ ...f, ogImage: url }));
            setSuccess('Imagen subida y asignada como portada del post.');
            showToast('Portada subida correctamente');
        } catch (err) {
            setError(err.message || 'No se pudo subir la imagen de portada.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    }

    return { uploading, error, success, onUrlChange, onUpload, onClear };
}
