// Piernas y cadera. Las piernas (piel o pantalón) se pintan con el pincel del suelo, que no baja al
// caminar; la cadera, la falda y el pantalón corto van con el cuerpo. De perfil hay dos piernas: se
// pinta antes la lejana, en sombra, y encima la cercana, cada una con su bota.
import { DRESSES } from './body.js'
import { paintFoot, shoeTop, sideShin } from './shoes.js'
import { BODY_TOP, LEG_TOP } from '../stance.js'

// De perfil la pierna empieza en el muslo, una fila por encima de las de frente: así cada pierna
// sale de la cadera por su lado y se puede inclinar entera al dar un paso.
const SIDE_THIGH = LEG_TOP - 1

const PANTS = ['pantalon', 'cargo', 'ancho', 'pirata']
const hipRow = (r) => BODY_TOP + r

// ¿Las piernas llevan pantalón largo? Los vestidos y las faldas las dejan a la vista; el peto es de
// pantalón largo aunque no se elija prenda de abajo.
const longTrousers = ({ top, bottom }) => !DRESSES.includes(top) && (top === 'peto' || PANTS.includes(bottom))

// Letras de una pierna: [primera columna, ..., última], con la cara interior en sombra.
function legLetters(look, leg, view, row) {
  // El pantalón pirata acaba en la rodilla: de ahí para abajo la pierna queda a la vista.
  const trousers = longTrousers(look) && !(look.bottom === 'pirata' && row > LEG_TOP)
  const wide = look.bottom === 'ancho' && look.top !== 'peto'
  if (view === 'side') {
    // La fila del muslo aún es prenda de abajo (pantalón o pantalón corto); la tapan faldas y vestidos.
    const cloth = trousers || row < LEG_TOP
    const [lit, dark] = cloth ? ['N', 'n'] : ['S', 's']
    return Array(sideColumns(leg, row).length).fill(leg.far ? dark : lit)
  }
  const left = leg.out < 0
  if (trousers) {
    const base = left ? ['N', 'n'] : ['n', 'N']
    if (!wide) return base
    return left ? ['N', ...base] : [...base, 'N']
  }
  return left ? ['S', 's'] : ['s', 'S']
}

// Columnas de una pierna de perfil en la fila `row`: el muslo (dos filas) es una columna más ancho
// por detrás que la espinilla; la parte de delante baja recta. `lean` desplaza cada fila.
function sideColumns(leg, row) {
  const i = row - SIDE_THIGH
  const shin = sideShin(leg, i)
  return i < 2 ? [shin - 1, shin, shin + 1, shin + 2] : [shin, shin + 1, shin + 2]
}

function legColumns(leg, view, letters, row) {
  if (view === 'side') return sideColumns(leg, row)
  const [a, b] = leg.cols
  return letters.length === 3 ? (leg.out < 0 ? [a - 1, a, b] : [a, b, b + 1]) : [a, b]
}

export function paintLegs(p, ctx) {
  const { look, view, g } = ctx
  g.legs.forEach((leg) => {
    const last = shoeTop(look) - 1 - (leg.lift || 0)
    for (let r = view === 'side' ? SIDE_THIGH : LEG_TOP; r <= last; r++) {
      const letters = legLetters(look, leg, view, r)
      legColumns(leg, view, letters, r).forEach((x, i) => p.put(x, BODY_TOP + r, letters[i]))
    }
    paintFoot(p, ctx, leg)
  })
}

// Cadera de perfil: dos filas y las piernas debajo. La espalda baja casi recta desde la camiseta
// (una columna hacia dentro en la segunda fila) y el muslo sigue esa misma línea, sin nalga y sin
// estrechar la prenda hacia el centro; delante, la barriga se recoge una columna hacia el muslo.
function sideSeat(p, { bottom, top }, { hip: { l, r } }) {
  p.span(hipRow(7), l, r, 'N', null, 'n')
  p.span(hipRow(8), l + 1, r - 1, 'N', null, 'n')
  // Bolsillo lateral del cargo, sobre el muslo.
  if (bottom === 'cargo' && top !== 'peto') p.put(8, hipRow(8), 'n')
}

// Cadera y prenda de abajo: r7 a r9. El pantalón y el peto se parten en dos piernas a la altura
// de r9; las faldas crecen hacia abajo y las larga llega hasta r11.
export function paintHips(p, { look, view, g }) {
  const { bottom, top } = look
  if (DRESSES.includes(top)) return
  const { l, r } = g.hip
  const row = (n, a, b, ch, left, right) => p.span(hipRow(n), a, b, ch, left, right)
  const front = view !== 'side'

  if (top === 'peto' || !['falda', 'plisada', 'faldaLarga'].includes(bottom)) {
    if (!front) return sideSeat(p, look, g)
    row(7, l, r, 'N', null, 'n')
    row(8, l, r, 'N', null, 'n')
    const wide = bottom === 'ancho' && top !== 'peto' ? 1 : 0
    row(9, l - wide, l + 2, 'N')
    row(9, r - 2, r + wide, 'N', null, 'n')
    if (bottom === 'cargo' && top !== 'peto') {
      // Bolsillos laterales de los pantalones cargo.
      ;[l + 1, r - 1].forEach((x) => {
        p.put(x, hipRow(8), 'n')
        p.put(x, hipRow(9), 'n')
      })
    }
    return
  }
  // El dobladillo (las filas de más abajo) se adelanta `sway` columnas al caminar de perfil.
  const { sway } = g
  row(7, l, r, 'N', null, 'n')
  if (bottom === 'falda') {
    row(8, l, r, 'N', null, 'n')
    row(9, l - 1, r + 1 + sway, 'T')
  } else if (bottom === 'plisada') {
    // Plisada: franjas alternas claras y oscuras.
    for (let x = l; x <= r; x++) p.put(x, hipRow(8), x % 2 ? 'n' : 'N')
    for (let x = l - 1; x <= r + 1 + sway; x++) p.put(x, hipRow(9), x % 2 ? 'n' : 'u')
  } else {
    row(8, l, r, 'N', null, 'n')
    row(9, l - 1, r + 1, 'N', 'u', 'n')
    row(10, l - 1, r + 1 + sway, 'N', 'u', 'n')
    row(11, l - 1, r + 1 + sway, 'T')
  }
}
