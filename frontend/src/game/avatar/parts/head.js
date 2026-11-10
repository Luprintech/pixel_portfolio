// Cabeza sin pelo: cráneo y cuello corto, solo piel. El pelo, el rostro y el vello van en capas
// aparte, así que cambiar de peinado o de expresión no toca esta forma. De frente y de espalda es el
// mismo óvalo de 10 columnas; de perfil mira a la derecha.
// Las filas empiezan en la 3 de la figura (las tres de arriba son pelo).
import { EMPTY } from '../grid.js'

const FRONT = [
  '....SSSSSSSS....',
  ...Array(7).fill('...SSSSSSSSSS...'),
  '....SSSSSSSS....',
  '.....sSSSSs.....',
]

// De perfil la cabeza conserva su anchura (columnas 3 a 13) y redondea las esquinas con escalones
// de un píxel. El borde delantero sube sin saltos: la coronilla (columna 11), la frente (12 y 13), la
// frente a la altura del ojo y del puente (13) y la nariz (14, dos filas). Luego baja: bajo la
// nariz (13) y en el labio y el mentón (12). Antes la frente se quedaba en la 12 hasta el ojo y la
// nariz era un píxel suelto que se pegaba después del contorno; ahora va dentro de la matriz y el
// contorno automático la rodea como al resto del cráneo.
//
// El cuello es solo la fila de abajo, en las columnas 7 a 10: queda por detrás de la barbilla y no
// bajo la boca, con sombra en los extremos como el de frente. Cuando sus tres celdas de sombra
// estaban en las columnas 10 a 12, justo debajo de los labios, se leían como una barba clara aunque
// no hubiera vello facial.
const SIDE = [
  '.....SSSSSSS....',
  '....SSSSSSSSS...',
  '...SSSSSSSSSSS..',
  '...SSSSSSSSSSS..',
  '...SSSSSSSSSSS..',
  '...SSSSSSSSSSSS.',
  '...SSSSSSSSSSSS.',
  '....SSSSSSSSSS..',
  '.....SSSSSSSS...',
  '.......sSSs.....',
]

const HEAD_TOP = 3

// Con `nose: 'corta'` la punta de la nariz de perfil ocupa una sola fila en vez de dos: se quita la
// de abajo, que quedaba pegada al bigote.
const NOSE_COL = 14
const NOSE_LOWER_ROW = 9

export function paintHead(p, { view, male, look }) {
  if (view === 'side') {
    p.rows(HEAD_TOP, SIDE)
    if (look.nose === 'corta') p.put(NOSE_COL, NOSE_LOWER_ROW, EMPTY)
    return
  }
  p.rows(HEAD_TOP, FRONT)
  // La mandíbula del avatar de hombre es más ancha: la barbilla no se estrecha.
  if (male) p.span(12, 4, 11, 'S')
}
