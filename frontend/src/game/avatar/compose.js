// Compone el avatar en una matriz de letras: sin canvas ni Phaser, así se puede comprobar que
// cualquier combinación de opciones da un dibujo bien formado. Editor, portada y juego piden la
// misma matriz y la pintan cada uno a su manera (`paint.js`, `sheet.js`).
//
// El dibujo sale de partes independientes (`parts/`): pelo, piernas con calzado, cadera, prenda de
// arriba, brazos, cabeza, rostro, rasgos faciales y complementos. Cada una pinta en su sitio según la
// geometría de `stance.js`, que es lo único que cambia con la vista y la pose. Frente, perfil y
// espalda tienen dibujo propio; el perfil izquierdo es el derecho reflejado, salvo en lo que no es
// simétrico (guiño, rapado, lazo y flor), que se dibuja desde el lado que enseña.
import { COLS, EMPTY, FIGURE_ROWS, MARGIN, createGrid, painter } from './grid.js'
import { stance } from './stance.js'
import { paintArms } from './parts/arms.js'
import { paintTop } from './parts/body.js'
import { dressHair } from './parts/accessories.js'
import { paintFace } from './parts/face.js'
import { paintTraits } from './parts/traits.js'
import { hairCells } from './parts/hair.js'
import { paintHead } from './parts/head.js'
import { paintHips, paintLegs } from './parts/legs.js'

export const DIRS = ['down', 'left', 'right', 'up']
export const FRAME_W = COLS + 2
export const FRAME_H = MARGIN + FIGURE_ROWS + 2

// Familias de color del dibujo: el contorno de cada celda hereda la de la forma que bordea, para
// que la figura no lleve una línea negra pegada sino el borde oscuro de su propio color.
const FAMILY = {
  H: 'y', h: 'y', d: 'y', z: 'y',
  D: 'j', L: 'j', M: 'j', T: 'j', W: 'j',
  N: 'k', u: 'k', n: 'k',
  R: 'l', Q: 'l', r: 'l',
  A: 'o', a: 'o', G: 'o', P: 'o', Y: 'o', J: 'o',
}
// Si una celda toca dos formas, manda la que va por delante en el dibujo: pelo, prenda, calzado...
const PRIORITY = ['y', 'j', 'k', 'l', 'o', 'x']

// Contorno de un píxel alrededor de todo lo dibujado (también en los huecos, como el que separa las
// piernas). Hereda el color de la forma que bordea. Una celda que toca una forma por debajo y otra
// por un lado (el escalón bajo un dobladillo, por ejemplo) toma la de abajo y la de los lados antes
// que la de arriba: así el escalón no estrena un color de la prenda que acaba justo encima.
function addOutline(grid) {
  const at = (x, y) => (grid[y]?.[x] !== undefined && grid[y][x] !== EMPTY ? grid[y][x] : null)
  const family = (ch) => FAMILY[ch] ?? 'x'
  const pick = (cells) => {
    const near = cells.filter(Boolean).map(family)
    return near.length ? PRIORITY.find((f) => near.includes(f)) : null
  }
  return Array.from({ length: grid.length + 2 }, (_, row) =>
    Array.from({ length: COLS + 2 }, (_, col) => {
      const x = col - 1
      const y = row - 1
      const here = at(x, y)
      if (here) return here
      return pick([at(x, y + 1), at(x + 1, y), at(x - 1, y)]) ?? pick([at(x, y - 1)]) ?? EMPTY
    }),
  )
}

// `dir` es down, up, left o right; `pose` es 0 (reposo), 1 o 2 (los dos pasos).
export function composeAvatar(look, dir = 'down', pose = 0) {
  const view = dir === 'left' || dir === 'right' ? 'side' : dir
  const ctx = { look, view, left: dir === 'left', pose, male: look.body === 'hombre' }
  ctx.g = stance(ctx)

  const grid = createGrid()
  // Las piernas se quedan en el suelo; todo lo demás se hunde lo que diga la pose (`bob`).
  const ground = painter(grid)
  const upper = painter(grid, ctx.g.bob)
  // La cabeza, con su pelo, su cara y sus complementos, es un bloque que de perfil se desplaza entero.
  const head = painter(grid, ctx.g.bob, ctx.g.headDx)
  const hair = dressHair(look, ctx, hairCells(look.hairStyle, view, ctx))

  head.cells(hair.back)
  paintLegs(ground, ctx)
  paintHips(upper, ctx)
  const sleeve = paintTop(upper, ctx)
  // La melena larga de perfil cae sobre la espalda: por encima del torso y por debajo del brazo.
  head.cells(hair.mid)
  paintArms(upper, ctx, sleeve)
  paintHead(head, ctx)
  paintFace(head, ctx)
  paintTraits(head, ctx)
  head.cells(hair.front)

  const outlined = addOutline(grid)
  let rows = outlined.map((row) => row.join(''))
  if (ctx.left) rows = rows.map((row) => [...row].reverse().join(''))
  // Los pies son el anclaje: el origen del sprite es el centro de la fila inferior.
  return { rows, width: FRAME_W, height: FRAME_H, anchor: { x: FRAME_W / 2, y: FRAME_H } }
}
