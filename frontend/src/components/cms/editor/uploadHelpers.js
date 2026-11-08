// Ayudas para subir archivos desde el editor y mostrar sus errores.
import { cmsApi } from '../../../lib/cmsApi';

export function getUploadErrorMessage(error, fallbackMessage) {
    return error?.details?.message || error?.message || fallbackMessage;
}

export async function uploadAudioFile(file, token) {
    const uploaded = await cmsApi.uploadAudio(token, file);
    return uploaded.url;
}
