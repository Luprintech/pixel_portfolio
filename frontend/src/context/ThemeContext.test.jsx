import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeProvider, useThemeContext } from './ThemeContext'

const KEY = 'valle-del-bucle:theme'

function Probe() {
  const { theme, toggleTheme } = useThemeContext()
  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.classList.remove('dark')
  })

  it('arranca en el tema del valle aunque el navegador guarde la clave antigua', () => {
    localStorage.setItem('theme', 'dark')
    render(<ThemeProvider><Probe /></ThemeProvider>)
    expect(screen.getByRole('button').textContent).toBe('valle')
    expect(document.documentElement.getAttribute('data-theme')).toBe('valle')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('el botón alterna con el modo noche y recuerda solo esa elección', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    expect(localStorage.getItem(KEY)).toBeNull()
    act(() => screen.getByRole('button').click())
    expect(screen.getByRole('button').textContent).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem(KEY)).toBe('dark')
    act(() => screen.getByRole('button').click())
    expect(screen.getByRole('button').textContent).toBe('valle')
    expect(localStorage.getItem(KEY)).toBe('valle')
  })

  it('respeta un tema guardado válido e ignora uno desconocido', () => {
    localStorage.setItem(KEY, 'dark')
    const { unmount } = render(<ThemeProvider><Probe /></ThemeProvider>)
    expect(screen.getByRole('button').textContent).toBe('dark')
    unmount()
    localStorage.setItem(KEY, 'rosa')
    render(<ThemeProvider><Probe /></ThemeProvider>)
    expect(screen.getByRole('button').textContent).toBe('valle')
  })
})
