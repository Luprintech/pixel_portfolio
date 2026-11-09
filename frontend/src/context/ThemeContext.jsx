import { createContext, useContext, useEffect, useState } from 'react'

// Contexto
const ThemeContext = createContext(null)

// Utilidades
// Temas: "valle" (pastel, el de siempre al entrar), "dark" (modo noche, el azul marino anterior) y "light".
// Solo se guarda la elección explícita del botón de tema, con una clave nueva: la antigua ('theme') la
// escribía cada visita con 'dark' y habría dejado a los visitantes de antes en azul marino.
const THEME_KEY = 'valle-del-bucle:theme'
const THEMES = ['valle', 'dark', 'light']

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    return THEMES.includes(saved) ? saved : 'valle'
  } catch {
    return 'valle'
  }
}

// Provider
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  // Aplica el tema al <html>: el atributo elige los tokens y la clase "dark" es la de Tailwind.
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // El botón de tema alterna entre el valle y el modo noche; desde el claro (heredado) vuelve al valle.
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'valle' : 'dark'
    setTheme(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // Sin almacenamiento: el tema dura solo esta visita.
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook de consumo
export function useThemeContext() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useThemeContext debe usarse dentro de <ThemeProvider>')
  }
  return ctx
}
