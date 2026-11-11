// Dibujo en píxeles de una paloma (10×8, mirando a la derecha: se refleja para mirar a la izquierda): de pie, picoteando y con las alas
// arriba o abajo al volar. Cada fotograma son filas de texto con la leyenda de `KEY`; así se ve la figura en el propio código.
import { makeCanvas, rect } from '../pixelKit.js'

// Gris azulado de plaza, cuello con un brillo verdoso, pico y patas anaranjados.
const KEY = {
  H: '#59607a',
  E: '#e8863a',
  K: '#e0a85c',
  N: '#7fa8a0',
  B: '#aab0be',
  C: '#c9ced9',
  W: '#7d8498',
  T: '#5f667c',
  L: '#c46f6f',
}

export const PIGEON_FRAMES = {
  stand: ['......HH..', '.....HEHK.', '....NHHH..', '..TWNNBB..', '.TWWWBBBB.', '.TWWWBBCC.', '..TWWBCC..', '....L.L...'],
  peck: ['..........', '..........', '..TWBBBN..', '.TWWBBBNN.', '.TWWBBBCNH', '..TWBCC..K', '....L.L...', '..........'],
  flyUp: ['..WW.WW...', '.WWWWWWW..', '..WWBBB.H.', 'TTWBBBBNHK', '.TBBCCBNN.', '..BCCC....', '..........', '..........'],
  flyDown: ['..........', '......HH..', 'TTBBBBNHEK', '.TWBBBBN..', 'WWWWCCC...', '.WWWW.....', '..WW......', '..........'],
}

export function pigeonCanvas(rows) {
  const canvas = makeCanvas(rows[0].length, rows.length)
  const g = canvas.getContext('2d')
  rows.forEach((row, y) => [...row].forEach((ch, x) => KEY[ch] && rect(g, x, y, 1, 1, KEY[ch])))
  return canvas
}
