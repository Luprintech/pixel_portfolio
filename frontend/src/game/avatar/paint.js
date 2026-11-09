// Pinta la matriz compuesta en un canvas de tamaño nativo (un píxel de matriz es un píxel de canvas).
// Es lo único del generador que toca el DOM; editor, portada y juego amplían el canvas con un
// factor entero y `image-rendering: pixelated`.
import { makeCanvas, rect } from '../pixelKit.js'
import { composeAvatar } from './compose.js'
import { avatarColors } from './palette.js'

// Con `blink` los ojos se cierran (lo usa la portada). `edit` recibe las filas de la matriz y devuelve
// otras: así la portada retoca una pose sin añadir poses al generador.
export function avatarCanvas(look, dir = 'down', pose = 0, blink = false, edit = null) {
  const composed = composeAvatar(look, dir, pose)
  const { width, height } = composed
  const rows = edit ? edit(composed.rows) : composed.rows
  const colors = avatarColors(look, blink)
  const canvas = makeCanvas(width, height)
  const g = canvas.getContext('2d')
  rows.forEach((row, y) => {
    for (let x = 0; x < width; x++) if (row[x] !== '.') rect(g, x, y, 1, 1, colors[row[x]])
  })
  return canvas
}
