import { beforeEach, describe, expect, it, vi } from 'vitest'
import { COPY } from './valleCopy'
import { DEFAULT_GAME_THEME, GAME_THEME_KEY, isPastel, readGameTheme, saveGameTheme, themeName } from './gameTheme'

describe('tema del juego', () => {
  beforeEach(() => localStorage.clear())

  it('arranca en Aventura si no hay preferencia guardada', () => {
    expect(DEFAULT_GAME_THEME).toBe('aventura')
    expect(readGameTheme()).toBe('aventura')
  })

  it('guarda y recupera Cozy', () => {
    expect(saveGameTheme('cozy')).toBe(true)
    expect(localStorage.getItem(GAME_THEME_KEY)).toBe('cozy')
    expect(readGameTheme()).toBe('cozy')
  })

  it('ignora un valor desconocido y no guarda temas que no existen', () => {
    localStorage.setItem(GAME_THEME_KEY, 'neon')
    expect(readGameTheme()).toBe('aventura')
    expect(saveGameTheme('neon')).toBe(false)
  })

  it('no lee la clave del tema del sitio: el valle pastel de antes no arrastra a Cozy', () => {
    localStorage.setItem('valle-del-bucle:theme', 'valle')
    expect(readGameTheme()).toBe('aventura')
  })

  it('sin almacenamiento sigue funcionando con el tema por defecto', () => {
    const blocked = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    const failed = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    expect(readGameTheme()).toBe('aventura')
    expect(saveGameTheme('cozy')).toBe(false)
    blocked.mockRestore()
    failed.mockRestore()
  })

  it('Cozy es el pastel de los gráficos', () => {
    expect(isPastel('cozy')).toBe(true)
    expect(isPastel('aventura')).toBe(false)
    expect(themeName(true)).toBe('cozy')
    expect(themeName(false)).toBe('aventura')
  })

  it('los textos del selector existen en español y en inglés', () => {
    const keys = ['themeTitle', 'themeAventura', 'themeAventuraHint', 'themeCozy', 'themeCozyHint', 'themeChangedAventura', 'themeChangedCozy']
    keys.forEach((key) => {
      expect(COPY.es.options[key]).toBeTruthy()
      expect(COPY.en.options[key]).toBeTruthy()
    })
  })
})
