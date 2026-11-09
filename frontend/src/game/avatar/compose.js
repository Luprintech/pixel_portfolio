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
import { BOB, stance } from './stance.js'
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

// Contorno de un píxel alrededor de todo lo dibujado (también en los huecos, como el que separa las
// piernas). Se añade al final para que sea igual de regular con cualquier peinado o prenda.
function addOutline(grid) {
  const filled = (x, y) => grid[y]?.[x] !== undefined && grid[y][x] !== EMPTY
  return Array.from({ length: grid.length + 2 }, (_, row) =>
    Array.from({ length: COLS + 2 }, (_, col) => {
      const x = col - 1
      const y = row - 1
      if (filled(x, y)) return grid[y][x]
      return filled(x + 1, y) || filled(x - 1, y) || filled(x, y + 1) || filled(x, y - 1) ? 'X' : EMPTY
    }),
  )
}

// `dir` es down, up, left o right; `pose` es 0 (reposo), 1 o 2 (los dos pasos).
export function composeAvatar(look, dir = 'down', pose = 0) {
  const view = dir === 'left' || dir === 'right' ? 'side' : dir
  const ctx = { look, view, left: dir === 'left', pose, male: look.body === 'hombre' }
  ctx.g = stance(ctx)

  const grid = createGrid()
  // Las piernas se quedan en el suelo; todo lo demás se hunde un píxel al dar un paso.
  const ground = painter(grid)
  const upper = painter(grid, pose ? BOB : 0)
  const hair = dressHair(look, ctx, hairCells(look.hairStyle, view, ctx))

  upper.cells(hair.back)
  paintLegs(ground, ctx)
  paintHips(upper, ctx)
  paintArms(upper, ctx, paintTop(upper, ctx))
  paintHead(upper, ctx)
  paintFace(upper, ctx)
  paintTraits(upper, ctx)
  upper.cells(hair.front)

  let rows = addOutline(grid).map((row) => row.join(''))
  if (ctx.left) rows = rows.map((row) => [...row].reverse().join(''))
  // Los pies son el anclaje: el origen del sprite es el centro de la fila inferior.
  return { rows, width: FRAME_W, height: FRAME_H, anchor: { x: FRAME_W / 2, y: FRAME_H } }
}
