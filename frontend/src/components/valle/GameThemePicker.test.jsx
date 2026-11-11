import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GameThemeScope } from '../../context/GameThemeContext'
import { GAME_THEME_KEY } from '../../lib/gameTheme'
import GameThemePicker from './GameThemePicker'

const language = vi.hoisted(() => ({ current: 'es' }))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ i18n: { resolvedLanguage: language.current } }) }))

const renderPicker = () =>
  render(
    <MemoryRouter>
      <GameThemeScope>
        <GameThemePicker />
      </GameThemeScope>
    </MemoryRouter>,
  )

describe('selector de tema del juego', () => {
  beforeEach(() => {
    localStorage.clear()
    language.current = 'es'
  })

  it('es un grupo de dos opciones con Aventura marcada por defecto', () => {
    renderPicker()
    expect(screen.getByRole('group', { name: 'Tema' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: /Tema Aventura/ }).checked).toBe(true)
    expect(screen.getByRole('radio', { name: /Tema Cozy/ }).checked).toBe(false)
  })

  it('elegir Cozy lo marca, lo guarda y lo anuncia a los lectores de pantalla', async () => {
    renderPicker()
    await userEvent.click(screen.getByRole('radio', { name: /Tema Cozy/ }))
    expect(screen.getByRole('radio', { name: /Tema Cozy/ }).checked).toBe(true)
    expect(localStorage.getItem(GAME_THEME_KEY)).toBe('cozy')
    expect(screen.getByRole('status').textContent).toBe('Tema Cozy activado.')
  })

  it('se maneja con el teclado: Tab entra al grupo y las flechas cambian de opción', async () => {
    renderPicker()
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: /Tema Aventura/ }))
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: /Tema Cozy/ }).checked).toBe(true)
    await userEvent.keyboard('{ArrowLeft}')
    expect(screen.getByRole('radio', { name: /Tema Aventura/ }).checked).toBe(true)
  })

  it('cada opción describe su paleta para quien no la ve', () => {
    renderPicker()
    expect(screen.getByRole('radio', { name: /Tema Aventura/ }).getAttribute('aria-describedby')).toBe('game-theme-aventura-hint')
    expect(document.getElementById('game-theme-cozy-hint').textContent).toBe('Rosa, lavanda y marfil.')
  })

  it('el texto sale en inglés con el idioma en inglés', () => {
    language.current = 'en'
    renderPicker()
    expect(screen.getByRole('radio', { name: /Adventure theme/ })).toBeTruthy()
    expect(screen.getByRole('radio', { name: /Cozy theme/ })).toBeTruthy()
  })
})
