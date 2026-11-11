import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { GAME_THEME_KEY } from '../lib/gameTheme'
import { GameThemeScope, useGameTheme } from './GameThemeContext'

function Probe() {
  const { gameTheme, pastel, setGameTheme } = useGameTheme()
  return (
    <div>
      <p data-testid="theme">{gameTheme}</p>
      <p data-testid="pastel">{String(pastel)}</p>
      <button type="button" onClick={() => setGameTheme('cozy')}>cozy</button>
      <button type="button" onClick={() => setGameTheme('aventura')}>aventura</button>
    </div>
  )
}

const renderGame = () =>
  render(
    <MemoryRouter initialEntries={['/valle']}>
      <Routes>
        <Route element={<GameThemeScope />}>
          <Route path="/valle" element={<Probe />} />
        </Route>
        <Route path="/clasico" element={<p>clasico</p>} />
      </Routes>
    </MemoryRouter>,
  )

describe('GameThemeScope', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-game-theme')
  })

  it('arranca en Aventura y lo marca en <html> mientras se ve el juego', () => {
    renderGame()
    expect(screen.getByTestId('theme').textContent).toBe('aventura')
    expect(screen.getByTestId('pastel').textContent).toBe('false')
    expect(document.documentElement.getAttribute('data-game-theme')).toBe('aventura')
  })

  it('cambiar a Cozy actualiza el atributo y se guarda', async () => {
    renderGame()
    await userEvent.click(screen.getByRole('button', { name: 'cozy' }))
    expect(screen.getByTestId('pastel').textContent).toBe('true')
    expect(document.documentElement.getAttribute('data-game-theme')).toBe('cozy')
    expect(localStorage.getItem(GAME_THEME_KEY)).toBe('cozy')
    await userEvent.click(screen.getByRole('button', { name: 'aventura' }))
    expect(document.documentElement.getAttribute('data-game-theme')).toBe('aventura')
  })

  it('conserva el tema elegido al volver a entrar', () => {
    localStorage.setItem(GAME_THEME_KEY, 'cozy')
    renderGame()
    expect(screen.getByTestId('theme').textContent).toBe('cozy')
  })

  it('quita el atributo al desmontarse: fuera del juego no queda rastro', () => {
    const { unmount } = renderGame()
    unmount()
    expect(document.documentElement.hasAttribute('data-game-theme')).toBe(false)
  })
})
