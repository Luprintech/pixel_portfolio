// Calzado de una pierna: botas de caña corta, zapatillas con suela blanca o sandalias. Los pies
// apuntan hacia fuera de frente y hacia donde mira de perfil. Al levantar un pie (`lift`) el calzado
// sube con él; la pierna de atrás, de perfil, lleva el calzado en sombra.
import { BODY_TOP, FOOT_ROW, SOLE_ROW } from '../stance.js'

const SHAFT_ROW = FOOT_ROW - 1

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)

// Columnas de la caña y del pie de una pierna vista de frente: el pie sale hacia fuera.
function frontColumns({ cols: [a, b], out }) {
  return out < 0
    ? { shaft: [a - 1, a, b], foot: [a - 2, a - 1, a, b] }
    : { shaft: [a, b, b + 1], foot: [a, b, b + 1, b + 2] }
}

// De perfil la bota es más larga: talón detrás de la pierna y puntera delante.
function sideColumns({ dx }) {
  return { shaft: range(6 + dx, 9 + dx), foot: range(6 + dx, 12 + dx), toe: range(7 + dx, 12 + dx) }
}

export function paintFoot(p, { look, view }, leg) {
  const lift = leg.lift || 0
  const side = view === 'side'
  const { shaft, foot, toe } = side ? sideColumns(leg) : frontColumns(leg)
  const dim = (ch) => (leg.far && (ch === 'R' || ch === 'W') ? 'Q' : ch)
  const fill = (row, cols, pick) => cols.forEach((x, i) => p.put(x, BODY_TOP + row - lift, dim(pick(i))))
  const front = side ? toe : foot

  if (look.shoes === 'botas') {
    fill(SHAFT_ROW, shaft, () => 'R')
    fill(FOOT_ROW, foot, () => 'R')
    fill(SOLE_ROW, foot, () => 'Q')
  } else if (look.shoes === 'sandalias') {
    // Piel con una tira del color del calzado y suela fina.
    fill(FOOT_ROW, front, (i) => (i === 1 ? 'R' : 'S'))
    fill(SOLE_ROW, front, () => 'R')
  } else {
    fill(FOOT_ROW, front, () => 'R')
    fill(SOLE_ROW, front, () => 'W')
  }
}
