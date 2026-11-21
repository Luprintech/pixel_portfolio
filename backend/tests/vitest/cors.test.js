import { describe, it, expect } from 'vitest';
import { isCodespaceOrigin } from '../../config/cors.js';

const env = {
    CODESPACE_NAME: 'mi-codespace-abc123',
    GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: 'app.github.dev',
};

describe('isCodespaceOrigin', () => {
    it('acepta la URL de un puerto del propio Codespace', () => {
        expect(isCodespaceOrigin('https://mi-codespace-abc123-5173.app.github.dev', env)).toBe(true);
    });

    it('rechaza otro Codespace en el mismo dominio', () => {
        expect(isCodespaceOrigin('https://otro-codespace-5173.app.github.dev', env)).toBe(false);
    });

    it('rechaza nombres que solo empiezan como el del Codespace', () => {
        expect(isCodespaceOrigin('https://mi-codespace-abc123-evil.app.github.dev', env)).toBe(false);
        expect(isCodespaceOrigin('https://mi-codespace-abc123-5173.app.github.dev.evil.com', env)).toBe(false);
    });

    it('rechaza HTTP sin cifrar', () => {
        expect(isCodespaceOrigin('http://mi-codespace-abc123-5173.app.github.dev', env)).toBe(false);
    });

    it('no acepta nada fuera de un Codespace', () => {
        expect(isCodespaceOrigin('https://mi-codespace-abc123-5173.app.github.dev', {})).toBe(false);
    });
});
