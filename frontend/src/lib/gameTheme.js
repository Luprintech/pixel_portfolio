// Tema visual del juego (portada, creador, valle e interiores). Es independiente del tema del sitio
// (ThemeContext): ese decide el aspecto de blog, CMS y demás páginas, y este solo el de Valle del Bucle.
//
//   aventura: azul marino y azafrán, la paleta original de game/palette.js. Es el tema por defecto.
//   cozy:     el pastel (rosa, lavanda y marfil) que el juego usaba hasta ahora.

export const GAME_THEMES = ['aventura', 'cozy']
export const DEFAULT_GAME_THEME = 'aventura'
export const GAME_THEME_KEY = 'valle-del-bucle:game-theme'

// Color de la barra del navegador mientras se ve el juego: el fondo de cada tema.
export const GAME_THEME_COLOR = { aventura: '#1c1b3a', cozy: '#dccbf0' }
// El mismo color en RGB, para los fundidos de cámara de Phaser (entrar y salir de un edificio).
export const GAME_THEME_FADE = { aventura: [28, 27, 58], cozy: [220, 203, 240] }

export const isGameTheme = (value) => GAME_THEMES.includes(value)

// Lee la elección guardada. Un valor desconocido o un almacenamiento bloqueado (modo privado) dan el tema por defecto.
export function readGameTheme() {
  try {
    const saved = localStorage.getItem(GAME_THEME_KEY)
    return isGameTheme(saved) ? saved : DEFAULT_GAME_THEME
  } catch {
    return DEFAULT_GAME_THEME
  }
}

// Guarda la elección y devuelve si pudo. Sin almacenamiento el tema dura solo esta visita.
export function saveGameTheme(theme) {
  if (!isGameTheme(theme)) return false
  try {
    localStorage.setItem(GAME_THEME_KEY, theme)
    return true
  } catch {
    return false
  }
}

// Los gráficos de Phaser y de la portada distinguen solo "pastel" o no: cozy es el pastel.
export const isPastel = (theme) => theme === 'cozy'

// El nombre del tema que corresponde al booleano de los gráficos.
export const themeName = (pastel) => (pastel ? 'cozy' : 'aventura')
