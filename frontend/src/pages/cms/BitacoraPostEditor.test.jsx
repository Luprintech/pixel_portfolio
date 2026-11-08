import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BitacoraPostEditor from './BitacoraPostEditor';

const getPostMock = vi.fn();
const getPostRevisionsMock = vi.fn();

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({ token: 'token-de-prueba' }),
}));

vi.mock('../../lib/cmsApi', () => ({
    cmsApi: {
        getPost: (...args) => getPostMock(...args),
        getPostRevisions: (...args) => getPostRevisionsMock(...args),
    },
}));

// El editor rico pesa mucho y tiene su propia prueba
vi.mock('../../components/cms/RichEditor', () => ({
    default: ({ value }) => <div data-testid="rich-editor">{value}</div>,
}));

function renderEditor(path) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/bitacora/posts/nuevo" element={<BitacoraPostEditor />} />
                <Route path="/bitacora/posts/editar/:slug" element={<BitacoraPostEditor />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('BitacoraPostEditor', () => {
    beforeEach(() => {
        localStorage.clear();
        getPostMock.mockReset();
        getPostRevisionsMock.mockReset();
    });

    it('muestra el formulario de un post nuevo con todas sus secciones', async () => {
        renderEditor('/bitacora/posts/nuevo');

        expect(screen.getByText('Nuevo post')).toBeTruthy();
        expect(screen.getByLabelText(/Título/)).toBeTruthy();
        expect(screen.getByText('Portada')).toBeTruthy();
        expect(screen.getByText('Marcar como artículo destacado')).toBeTruthy();
        expect(screen.getByText('SEO Profesional')).toBeTruthy();
        expect(await screen.findByTestId('rich-editor')).toBeTruthy();
        expect(screen.queryByText('Revisiones')).toBeNull();
        expect(screen.queryByText('Despublicar')).toBeNull();
    });

    it('el slug sigue al título hasta que se edita a mano', () => {
        renderEditor('/bitacora/posts/nuevo');

        fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Mi Primer Post' } });
        expect(screen.getByLabelText(/Slug/).value).toBe('mi-primer-post');

        fireEvent.change(screen.getByLabelText(/Slug/), { target: { value: 'otro-slug' } });
        fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Título nuevo' } });
        expect(screen.getByLabelText(/Slug/).value).toBe('otro-slug');
    });

    it('carga un post publicado con sus revisiones y la opción de despublicar', async () => {
        getPostMock.mockResolvedValue({
            title: 'Post publicado', slug: 'post-publicado', date: '2026-01-01', status: 'published',
            tags: ['react', 'node'], content: '<h2>Hola</h2>', revision: 3,
        });
        getPostRevisionsMock.mockResolvedValue([
            { id: 1, revision: 2, source: 'autosave', createdAt: '2026-01-01T10:00:00Z' },
        ]);

        renderEditor('/bitacora/posts/editar/post-publicado');

        expect(await screen.findByText('Editar post')).toBeTruthy();
        expect(screen.getByDisplayValue('Post publicado')).toBeTruthy();
        expect(screen.getByLabelText(/Slug/).disabled).toBe(true);
        expect(screen.getByText('Despublicar')).toBeTruthy();
        expect(screen.getByText('Actualizar')).toBeTruthy();
        expect(screen.getByText('react')).toBeTruthy();
        expect(await screen.findByText('Revisiones')).toBeTruthy();
    });
});
