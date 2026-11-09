import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import InstallPrompt from './InstallPrompt'
import { captureInstallEvents, requestInstall, resetInstallStore } from '../lib/installStore'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }))

const UA = {
  iphoneSafari:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  iphoneChrome:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.88 Mobile/15E148 Safari/604.1',
  iphoneFirefox:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/125.0 Mobile/15E148 Safari/605.1.15',
  android:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  desktop:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
}

function renderAt(userAgent, path = '/') {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent)
  render(
    <MemoryRouter initialEntries={[path]}>
      <InstallPrompt />
    </MemoryRouter>,
  )
  act(() => vi.advanceTimersByTime(4100))
}

function fireInstallEvent(outcome = 'accepted') {
  const event = new Event('beforeinstallprompt', { cancelable: true })
  event.prompt = vi.fn()
  event.userChoice = Promise.resolve({ outcome })
  act(() => {
    window.dispatchEvent(event)
  })
  return event
}

describe('InstallPrompt', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetInstallStore()
    captureInstallEvents()
    localStorage.setItem('user_cookie_consent', JSON.stringify({ status: 'rejected' }))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('en Safari de iPhone explica los pasos y recomienda instalar', () => {
    renderAt(UA.iphoneSafari)
    expect(screen.getByText('install.recommend')).toBeInTheDocument()
    expect(screen.getByText('install.ios.share_safari')).toBeInTheDocument()
    expect(screen.getByText('install.ios.add')).toBeInTheDocument()
    expect(screen.queryByText('install.action')).not.toBeInTheDocument()
  })

  it('en Chrome de iPhone indica dónde está el botón Compartir de Chrome', () => {
    renderAt(UA.iphoneChrome)
    expect(screen.getByText('install.ios.share_chrome')).toBeInTheDocument()
  })

  it('en otros navegadores de iPhone pide abrir Safari o Chrome', () => {
    renderAt(UA.iphoneFirefox)
    expect(screen.getByText('install.ios.other')).toBeInTheDocument()
  })

  it('en Android sin aviso del navegador explica cómo instalar desde el menú', () => {
    renderAt(UA.android)
    expect(screen.getByText('install.recommend')).toBeInTheDocument()
    expect(screen.getByText('install.android.manual')).toBeInTheDocument()
    expect(screen.queryByText('install.action')).not.toBeInTheDocument()
  })

  it('en Android por HTTP explica que Chrome solo instala con botón desde HTTPS', () => {
    Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true })
    renderAt(UA.android)
    expect(screen.getByText('install.android.insecure')).toBeInTheDocument()
    delete window.isSecureContext
  })

  it('en Android con aviso del navegador ofrece el botón de instalar', () => {
    renderAt(UA.android)

    const event = fireInstallEvent()
    expect(event.defaultPrevented).toBe(true)
    // El retardo de cortesía empieza cuando el navegador da el aviso
    act(() => vi.advanceTimersByTime(4100))
    fireEvent.click(screen.getByText('install.action'))
    expect(event.prompt).toHaveBeenCalledTimes(1)
  })

  it('en escritorio no muestra nada si el navegador no ofrece instalar', () => {
    renderAt(UA.desktop)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('en escritorio, si Chrome o Edge ofrecen instalar, sale el cartel con el botón', () => {
    renderAt(UA.desktop)
    const event = fireInstallEvent()
    act(() => vi.advanceTimersByTime(4100))
    fireEvent.click(screen.getByText('install.action'))
    expect(event.prompt).toHaveBeenCalledTimes(1)
  })

  it('no pierde el evento si el navegador lo lanza antes de montar el cartel', () => {
    const event = fireInstallEvent()
    renderAt(UA.desktop)
    fireEvent.click(screen.getByText('install.action'))
    expect(event.prompt).toHaveBeenCalledTimes(1)
  })

  it('el botón de Opciones lo muestra al momento, aunque se descartara antes y estemos en el juego', () => {
    renderAt(UA.iphoneSafari, '/valle')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    act(() => {
      requestInstall()
    })
    expect(screen.getByText('install.ios.add')).toBeInTheDocument()
  })

  it('no aparece en el juego', () => {
    renderAt(UA.iphoneSafari, '/valle')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('espera a que se decida sobre las cookies', () => {
    localStorage.clear()
    renderAt(UA.iphoneSafari)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    localStorage.setItem('user_cookie_consent', '{}')
    act(() => {
      window.dispatchEvent(new Event('cookie-consent-saved'))
      vi.advanceTimersByTime(4100)
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('"Entendido" lo cierra y no vuelve a salir en la siguiente visita', () => {
    renderAt(UA.iphoneSafari)
    fireEvent.click(screen.getByText('install.close'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(localStorage.getItem('valle-del-bucle:install-dismissed')).not.toBeNull()
  })
})
