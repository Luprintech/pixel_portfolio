import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import i18next from 'i18next'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import es from '../locales/es/common.json'
import ClasicoHome from './ClasicoHome'

// jsdom no implementa canvas: el fondo de estrellas de la línea de tiempo pinta sobre uno
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null)
  Element.prototype.scrollIntoView = vi.fn()
})

// Instancia propia con los textos reales en español: así el test comprueba las claves i18n de verdad
const i18n = i18next.createInstance()

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'es',
    fallbackLng: 'es',
    defaultNS: 'common',
    ns: ['common'],
    resources: { es: { common: es } },
    interpolation: { escapeValue: false },
  })
})

function renderClasico() {
  return render(
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/clasico']}>
          <Routes>
            <Route path="/clasico" element={<ClasicoHome />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    </HelmetProvider>,
  )
}

describe('ClasicoHome', () => {
  it('muestra el titular de la portada original dentro de su contenedor oscuro aislado', () => {
    const { container } = renderClasico()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(es.hero.greeting)
    const root = container.querySelector('.clasico-root')
    expect(root).toHaveAttribute('data-theme', 'dark')
    expect(root.querySelector('#snap-root')).not.toBeNull()
  })

  it('la barra enlaza con las páginas del sitio y ofrece salida al valle y a la portada', () => {
    const { container } = renderClasico()
    const nav = within(container.querySelector('nav'))
    expect(nav.getByRole('link', { name: es.nav.projects })).toHaveAttribute('href', '/proyectos')
    expect(nav.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog')
    expect(nav.getByRole('link', { name: es.nav.contact })).toHaveAttribute('href', '/contacto')
    expect(nav.getByRole('link', { name: es.nav.valley })).toHaveAttribute('href', '/valle')
    expect(nav.getByRole('link', { name: es.nav.title })).toHaveAttribute('href', '/')
  })

  it('activa body.home-scroll-snap mientras está montada y lo retira al salir', () => {
    const { unmount } = renderClasico()
    expect(document.body).toHaveClass('home-scroll-snap')
    unmount()
    expect(document.body).not.toHaveClass('home-scroll-snap')
  })
})
