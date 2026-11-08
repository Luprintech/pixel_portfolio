import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../context/ThemeContext';
import RichEditor from './RichEditor';

// ProseMirror calcula posiciones con getClientRects, que jsdom no implementa.
const sinRectangulos = () => ({ length: 0, item: () => null, [Symbol.iterator]: function* () {} });
const rectVacio = { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 };
for (const prototipo of [Range.prototype, Element.prototype, Text.prototype]) {
  prototipo.getClientRects ??= sinRectangulos;
  prototipo.getBoundingClientRect ??= () => rectVacio;
}

// Mermaid necesita un navegador real para dibujar; en jsdom basta con un doble inerte.
vi.mock('mermaid', () => ({
  default: { initialize: vi.fn(), render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }) },
}));

vi.mock('../../lib/cmsApi', () => ({
  cmsApi: { listImages: vi.fn().mockResolvedValue([]), uploadImage: vi.fn() },
}));

const DOCUMENTO = [
  '<h2>Título de prueba</h2>',
  '<p>Texto con <strong>negrita</strong>, <em>cursiva</em> y un <a href="https://ejemplo.dev">enlace</a>.</p>',
  '<ul><li>uno</li><li>dos</li></ul>',
  '<blockquote><p>una cita</p></blockquote>',
  '<pre><code class="language-js">const a = 1;</code></pre>',
  '<table><tbody><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></tbody></table>',
].join('');

function montar(props = {}) {
  return render(
    <ThemeProvider>
      <RichEditor value={DOCUMENTO} onChange={vi.fn()} token="token-de-prueba" {...props} />
    </ThemeProvider>
  );
}

// Esta prueba fija el comportamiento visible del editor para poder reorganizar su
// código por dentro sin cambiar lo que ve y puede hacer quien escribe un post.
describe('RichEditor', () => {
  it('carga el documento y mantiene su estructura', async () => {
    const { container } = montar();

    await waitFor(() => expect(container.querySelector('.ProseMirror h2')).not.toBeNull());

    const editor = container.querySelector('.ProseMirror');
    expect(editor).toHaveAttribute('contenteditable', 'true');
    expect(editor.querySelector('h2')).toHaveTextContent('Título de prueba');
    expect(editor.querySelector('strong')).toHaveTextContent('negrita');
    expect(editor.querySelector('a')).toHaveAttribute('href', 'https://ejemplo.dev');
    expect(editor.querySelectorAll('li')).toHaveLength(2);
    expect(editor.querySelector('blockquote')).toHaveTextContent('una cita');
    expect(editor.querySelector('pre code')).toHaveTextContent('const a = 1;');
    expect(editor.querySelectorAll('table tr')).toHaveLength(2);
  });

  it('muestra la barra de herramientas con sus acciones', async () => {
    const { container } = montar();
    await waitFor(() => expect(container.querySelector('.ProseMirror')).not.toBeNull());

    const botones = screen.getAllByRole('button');
    expect(botones.length).toBeGreaterThan(20);

    const etiquetas = botones
      .map((boton) => boton.getAttribute('title') || boton.getAttribute('aria-label') || '')
      .filter(Boolean)
      .sort();
    expect(etiquetas).toMatchSnapshot();
  });

  it('muestra el contador de palabras', async () => {
    const { container } = montar();
    await waitFor(() => expect(container.querySelector('.ProseMirror')).not.toBeNull());

    expect(container.textContent).toMatch(/palabras/i);
  });
});
