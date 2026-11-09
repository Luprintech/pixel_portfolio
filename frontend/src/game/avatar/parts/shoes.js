// Calzado de una pierna. Cada tipo (`SHOES`) dice cuántas filas de pierna tapa y qué lleva en cada
// fila: caña (`shaft`), pie (`foot`) o la parte que se adelanta (`front`, la puntera de perfil). Los
// pies apuntan hacia fuera de frente y hacia donde mira de perfil. Al levantar un pie (`lift`) el
// calzado sube con él; la pierna de atrás, de perfil, lleva el calzado en sombra.
//
// Cada fila lleva una letra o una función `(t, n)` con `t` contado desde la puntera (0 es la columna
// de más fuera, o la de más delante de perfil) sobre `n` columnas; devolver `null` deja ver la
// pierna. Letras: R color del calzado, r su tono claro (cordones, puños), Q suela oscura, W suela
// blanca, Y suela amarilla, S piel.
import { BODY_TOP, FOOT_ROW, SOLE_ROW } from '../stance.js'

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)

// Filas del pie hacia arriba: la suela, el empeine y tres filas de caña.
const SOLE = SOLE_ROW
const INSTEP = FOOT_ROW
const ANKLE = FOOT_ROW - 1
const CALF = FOOT_ROW - 2

const only = (index, ch, otherwise = null) => (t) => (t === index ? ch : otherwise)

// `top` es la fila más alta que tapa el calzado: las piernas se pintan hasta la anterior.
export const SHOES = {
  zapatillas: { top: INSTEP, rows: [[INSTEP, 'front', 'R'], [SOLE, 'front', 'W']] },
  deportivas: { top: INSTEP, rows: [[INSTEP, 'foot', only(1, 'r', 'R')], [SOLE, 'foot', 'W']] },
  altas: { top: ANKLE, rows: [[ANKLE, 'shaft', 'R'], [INSTEP, 'foot', (t) => (t === 0 ? 'W' : 'R')], [SOLE, 'foot', 'W']] },
  lona: { top: INSTEP, rows: [[INSTEP, 'front', (t) => (t === 0 ? 'W' : 'R')], [SOLE, 'front', 'W']] },
  botines: { top: ANKLE, rows: [[ANKLE, 'shaft', 'R'], [INSTEP, 'foot', 'R'], [SOLE, 'foot', 'Q']] },
  montana: { top: ANKLE, rows: [[ANKLE, 'shaft', only(1, 'r', 'R')], [INSTEP, 'foot', only(1, 'r', 'R')], [SOLE, 'foot', 'Q']] },
  botasAltas: { top: CALF, rows: [[CALF, 'shaft', 'r'], [ANKLE, 'shaft', 'R'], [INSTEP, 'foot', 'R'], [SOLE, 'foot', 'Q']] },
  lluvia: { top: CALF, rows: [[CALF, 'shaft', 'R'], [ANKLE, 'shaft', 'R'], [INSTEP, 'foot', 'R'], [SOLE, 'foot', 'Y']] },
  clasicos: { top: INSTEP, rows: [[INSTEP, 'front', 'R'], [SOLE, 'front', 'Q']] },
  mocasines: { top: INSTEP, rows: [[INSTEP, 'front', only(1, 'r', 'R')], [SOLE, 'front', 'Q']] },
  merceditas: { top: INSTEP, rows: [[ANKLE, 'shaft', only(1, 'R')], [INSTEP, 'front', 'R'], [SOLE, 'front', 'Q']] },
  bailarinas: { top: INSTEP, rows: [[INSTEP, 'front', (t, n) => (t < n / 2 ? 'R' : 'S')], [SOLE, 'front', (t, n) => (t < n / 2 ? 'R' : null)]] },
  sandalias: { top: INSTEP, rows: [[INSTEP, 'foot', (t) => (t === 1 || t === 3 ? 'R' : 'S')], [SOLE, 'front', 'R']] },
  chanclas: { top: INSTEP, rows: [[INSTEP, 'foot', only(2, 'R', 'S')], [SOLE, 'front', 'r']] },
  tacon: { top: INSTEP, rows: [[INSTEP, 'front', 'R'], [SOLE, 'foot', (t, n) => (t <= 1 || t === n - 1 ? 'Q' : null)]] },
  aventura: { top: CALF, rows: [[CALF, 'shaft', 'r'], [ANKLE, 'shaft', only(1, 'r', 'R')], [INSTEP, 'foot', 'R'], [SOLE, 'foot', 'Q']] },
}

// Columnas de la caña y del pie de una pierna vista de frente: el pie sale hacia fuera.
function frontColumns({ cols: [a, b], out }) {
  return out < 0
    ? { shaft: [a - 1, a, b], foot: [a - 2, a - 1, a, b] }
    : { shaft: [a, b, b + 1], foot: [a, b, b + 1, b + 2] }
}

// De perfil el calzado es más largo: talón detrás de la pierna y puntera delante.
function sideColumns({ dx }) {
  return { shaft: range(6 + dx, 9 + dx), foot: range(6 + dx, 12 + dx), front: range(7 + dx, 12 + dx) }
}

// Primera fila de pierna tapada por el calzado: las piernas se pintan hasta la anterior.
export const shoeTop = (look) => SHOES[look.shoes].top

// En la pierna de atrás las piezas claras pasan a sombra y la piel a su tono oscuro.
const DIMMED = { R: 'Q', W: 'Q', r: 'Q', Y: 'Q', S: 's' }

export function paintFoot(p, { look, view }, leg) {
  const lift = leg.lift || 0
  const side = view === 'side'
  const columns = side ? sideColumns(leg) : { ...frontColumns(leg), front: frontColumns(leg).foot }
  const flip = side || leg.out > 0

  SHOES[look.shoes].rows.forEach(([row, part, pick]) => {
    const cols = columns[part]
    cols.forEach((x, i) => {
      const t = flip ? cols.length - 1 - i : i
      const ch = typeof pick === 'string' ? pick : pick(t, cols.length)
      if (!ch) return
      p.put(x, BODY_TOP + row - lift, leg.far ? (DIMMED[ch] ?? ch) : ch)
    })
  })
}
