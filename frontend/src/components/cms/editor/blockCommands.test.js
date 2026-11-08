import { describe, expect, it, vi } from 'vitest';
import { getActiveBlock, setBlock } from './blockCommands';

// Editor mínimo: isActive responde según el bloque activo y chain() registra los comandos
function createFakeEditor(active = {}) {
    const calls = [];
    const chain = new Proxy({}, {
        get: (_target, name) => {
            if (name === 'run') return () => calls.push('run');
            if (name === 'focus') return () => chain;
            return (...args) => { calls.push([name, ...args]); return chain; };
        },
    });
    return {
        calls,
        isActive: vi.fn((name, attrs) => active[attrs?.level ? `${name}${attrs.level}` : name] === true),
        chain: () => chain,
    };
}

describe('blockCommands', () => {
    it('detecta el tipo de bloque activo', () => {
        expect(getActiveBlock(createFakeEditor({ heading2: true }))).toBe('h2');
        expect(getActiveBlock(createFakeEditor({ blockquote: true }))).toBe('blockquote');
        expect(getActiveBlock(createFakeEditor({ codeBlock: true }))).toBe('codeBlock');
        expect(getActiveBlock(createFakeEditor())).toBe('p');
        expect(getActiveBlock(null)).toBe('p');
    });

    it('aplica el comando que corresponde a cada tipo', () => {
        const editor = createFakeEditor();
        setBlock(editor, 'h3');
        setBlock(editor, 'codeBlock');
        setBlock(editor, 'p');
        expect(editor.calls).toEqual([
            ['setHeading', { level: 3 }], 'run',
            ['setCodeBlock'], 'run',
            ['setParagraph'], 'run',
        ]);
    });

    it('ignora un tipo desconocido y un editor ausente', () => {
        const editor = createFakeEditor();
        setBlock(editor, 'nada');
        setBlock(null, 'p');
        expect(editor.calls).toEqual([]);
    });
});
