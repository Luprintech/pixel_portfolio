import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { describe, expect, it, vi } from 'vitest'
import Cv from './Cv'

// El visor real carga pdf.js y su worker: aquí solo importa la cabecera de la página
vi.mock('../components/shared/PdfPreview', () => ({ default: () => <div data-testid="pdf" /> }))

function renderCv(entries, index) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={entries} initialIndex={index}>
        <Routes>
          <Route path="/" element={<p>inicio</p>} />
          <Route path="/cv" element={<Cv />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  )
}

describe('Cv', () => {
  it('muestra el visor y el enlace de descarga del PDF', () => {
    renderCv(['/cv'], 0)
    expect(screen.getByTestId('pdf')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Descargar PDF' })).toHaveAttribute('href', '/CV_Guadalupe_Cano.pdf')
  })

  it('"Volver" regresa a la página anterior', () => {
    renderCv(['/', '/cv'], 1)
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }))
    expect(screen.getByText('inicio')).toBeInTheDocument()
  })

  it('con entrada directa, sin historial, "Volver" lleva al inicio', () => {
    renderCv(['/cv'], 0)
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }))
    expect(screen.getByText('inicio')).toBeInTheDocument()
  })
})
