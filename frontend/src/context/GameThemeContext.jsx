import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { GAME_THEME_COLOR, isGameTheme, isPastel, readGameTheme, saveGameTheme } from '../lib/gameTheme'

const GameThemeContext = createContext(null)

// Envuelve solo las rutas del juego ("/" y "/valle"). Escribe `data-game-theme` en <html> mientras se ven y lo quita
// al salir: así los tokens de Aventura y Cozy (index.css) no existen en el resto del sitio ni en /clasico.
export function GameThemeScope({ children = null }) {
  const [gameTheme, setTheme] = useState(readGameTheme)

  useLayoutEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-game-theme', gameTheme)
    return () => root.removeAttribute('data-game-theme')
  }, [gameTheme])

  // La barra del navegador sigue el fondo del tema y recupera su color al salir del juego.
  useLayoutEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) return undefined
    const previous = meta.getAttribute('content')
    meta.setAttribute('content', GAME_THEME_COLOR[gameTheme])
    return () => meta.setAttribute('content', previous)
  }, [gameTheme])

  const setGameTheme = useCallback((next) => {
    if (!isGameTheme(next)) return
    setTheme(next)
    saveGameTheme(next)
  }, [])

  const value = useMemo(() => ({ gameTheme, setGameTheme, pastel: isPastel(gameTheme) }), [gameTheme, setGameTheme])

  return <GameThemeContext.Provider value={value}>{children ?? <Outlet />}</GameThemeContext.Provider>
}

export function useGameTheme() {
  const ctx = useContext(GameThemeContext)
  if (!ctx) throw new Error('useGameTheme debe usarse dentro de <GameThemeScope>')
  return ctx
}
