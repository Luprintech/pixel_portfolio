// Subida de imágenes, audio y documentos al editor, y la biblioteca de imágenes ya guardadas.
import { useCallback, useState } from 'react';
import { cmsApi } from '../../../../lib/cmsApi';
import { validateAudioFile, validateDocumentFile, validateImageFile } from '../../../../lib/mediaUploadPolicy';
import { getUploadErrorMessage, uploadAudioFile } from '../uploadHelpers';

export function useMediaUploads({ editor, token, closeImageMenu }) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [availableImages, setAvailableImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);

    const handleImageFile = useCallback(async (file) => {
        if (!file || !token) return;
        const validationError = validateImageFile(file);
        if (validationError) {
            setUploadError(validationError);
            return;
        }
        setUploading(true);
        setUploadError('');
        try {
            const uploaded = await cmsApi.uploadImage(token, file);
            const url = uploaded.url;
            editor?.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, '') }).run();
        } catch (err) {
            setUploadError(getUploadErrorMessage(err, 'No se ha podido subir la imagen.'));
            console.error(err);
        }
        finally { setUploading(false); }
    }, [editor, token]);

    const handleImageInputChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            await handleImageFile(file);
            closeImageMenu();
        }
        e.target.value = '';
    }, [closeImageMenu, handleImageFile]);

    const loadAvailableImages = useCallback(async () => {
        if (!token) return;
        setLoadingImages(true);
        try {
            const images = await cmsApi.getImages(token);
            setAvailableImages(Array.isArray(images) ? images : []);
        } catch (err) {
            setUploadError(getUploadErrorMessage(err, 'No se han podido cargar las imágenes guardadas.'));
            setAvailableImages([]);
        } finally {
            setLoadingImages(false);
        }
    }, [token]);

    const insertExistingImage = useCallback((image) => {
        if (!editor || !image?.url) return;
        editor.chain().focus().setImage({
            src: image.url,
            alt: (image.filename || 'imagen').replace(/\.[^.]+$/, ''),
        }).run();
        closeImageMenu();
    }, [closeImageMenu, editor]);

    async function handleAudioFile(e) {
        const file = e.target.files?.[0];
        if (!file || !token) return;
        const validationError = validateAudioFile(file);
        if (validationError) {
            setUploadError(validationError);
            e.target.value = '';
            return;
        }
        setUploading(true);
        setUploadError('');
        try {
            const url = await uploadAudioFile(file, token);
            editor?.commands.insertAudio({ src: url, title: file.name });
        } catch (err) {
            setUploadError(getUploadErrorMessage(err, 'No se ha podido subir el audio.'));
            console.error(err);
        }
        finally { setUploading(false); e.target.value = ''; }
    }

    async function handleDocumentUpload(e) {
        const file = e.target.files?.[0];
        if (!file || !token) return;
        const validationError = validateDocumentFile(file);
        if (validationError) {
            setUploadError(validationError);
            e.target.value = '';
            return;
        }
        setUploading(true);
        setUploadError('');
        try {
            const data = await cmsApi.uploadDocument(token, file);
            editor?.commands.insertDocument({
                src: data.url,
                filename: data.filename,
                fileType: data.fileType,
                fileSize: data.fileSize,
            });
        } catch (err) {
            setUploadError(getUploadErrorMessage(err, 'No se ha podido subir el documento.'));
            console.error(err);
        }
        finally { setUploading(false); e.target.value = ''; }
    }

    return {
        uploading,
        uploadError,
        availableImages,
        loadingImages,
        handleImageFile,
        handleImageInputChange,
        loadAvailableImages,
        insertExistingImage,
        handleAudioFile,
        handleDocumentUpload,
    };
}
