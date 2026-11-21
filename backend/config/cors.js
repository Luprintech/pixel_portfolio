import './env.js';
import { logger } from '../lib/logger.js';

const isDev = process.env.NODE_ENV !== 'production';

const allowedOrigins = [
    'https://guadalupecano.es',
    'https://www.guadalupecano.es',
    process.env.FRONTEND_URL,
].filter(Boolean);

// Patrón que acepta cualquier puerto de localhost en desarrollo
const localhostPattern = /^http:\/\/localhost:\d+$/;

// En un Codespace la web se abre desde https://<codespace>-<puerto>.<dominio>, no desde
// localhost. Solo se acepta la URL del propio Codespace: FRONTEND_URL no sirve para esto
// porque el backend la usa también para regenerar sitemap.xml al arrancar.
export function isCodespaceOrigin(origin, env = process.env) {
    const name = env.CODESPACE_NAME;
    const domain = env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
    if (!name || !domain || !origin) return false;

    const prefix = `https://${name}-`;
    const suffix = `.${domain}`;
    if (!origin.startsWith(prefix) || !origin.endsWith(suffix)) return false;

    const port = origin.slice(prefix.length, origin.length - suffix.length);
    return /^\d+$/.test(port);
}

export const corsOptions = {
    origin(origin, callback) {
        // Sin origen (peticiones server-to-server, curl, etc.)
        if (!origin) {
            callback(null, true);
            return;
        }

        // En desarrollo: cualquier puerto de localhost o del Codespace en el que corre
        if (isDev && (localhostPattern.test(origin) || isCodespaceOrigin(origin))) {
            callback(null, true);
            return;
        }

        // En producción: solo orígenes explícitamente permitidos
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        logger.warn('CORS origin blocked', { origin });
        callback(new Error('Not allowed by CORS'));
    },
};
