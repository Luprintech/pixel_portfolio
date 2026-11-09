// Piernas y cadera. Las piernas (piel o pantalón) se pintan con el pincel del suelo, que no baja al
// caminar; la cadera, la falda y el pantalón corto van con el cuerpo. De perfil las piernas se
// solapan: en reposo solo se ve la de delante y al caminar aparece la de atrás en sombra.
import { DRESSES } from './body.js'
import { paintFoot, shoeTop } from './shoes.js'
import { BODY_TOP, LEG_TOP } from '../stance.js'

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
    if (leg.far) return trousers ? ['n', 'n', 'n'] : ['s', 's', 's']
    return trousers ? ['n', 'N', 'N'] : ['s', 'S', 'S']
  }
  const left = leg.out < 0
  if (trousers) {
    const base = left ? ['N', 'n'] : ['n', 'N']
    if (!wide) return base
    return left ? ['N', ...base] : [...base, 'N']
  }
  return left ? ['S', 's'] : ['s', 'S']
}

function legColumns(leg, view, letters) {
  if (view === 'side') return [7 + leg.dx, 8 + leg.dx, 9 + leg.dx]
  const [a, b] = leg.cols
  return letters.length === 3 ? (leg.out < 0 ? [a - 1, a, b] : [a, b, b + 1]) : [a, b]
}

export function paintLegs(p, ctx) {
  const { look, view, g } = ctx
  g.legs.forEach((leg) => {
    const last = shoeTop(look) - 1 - (leg.lift || 0)
    for (let r = LEG_TOP; r <= last; r++) {
      const letters = legLetters(look, leg, view, r)
      legColumns(leg, view, letters).forEach((x, i) => p.put(x, BODY_TOP + r, letters[i]))
    }
    paintFoot(p, ctx, leg)
  })
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
    row(7, l, r, 'N', null, 'n')
    row(8, l, r, 'N', null, 'n')
    const wide = bottom === 'ancho' && top !== 'peto' ? 1 : 0
    if (front) {
      row(9, l - wide, l + 2, 'N')
      row(9, r - 2, r + wide, 'N', null, 'n')
    } else {
      row(9, l, r, 'N', null, 'n')
    }
    if (bottom === 'cargo' && top !== 'peto') {
      // Bolsillos laterales de los pantalones cargo.
      ;[l + 1, r - 1].forEach((x) => {
        p.put(x, hipRow(8), 'n')
        p.put(x, hipRow(9), 'n')
      })
    }
    return
  }
  row(7, l, r, 'N', null, 'n')
  if (bottom === 'falda') {
    row(8, l, r, 'N', null, 'n')
    row(9, l - 1, r + 1, 'T')
  } else if (bottom === 'plisada') {
    // Plisada: franjas alternas claras y oscuras.
    for (let x = l; x <= r; x++) p.put(x, hipRow(8), x % 2 ? 'n' : 'N')
    for (let x = l - 1; x <= r + 1; x++) p.put(x, hipRow(9), x % 2 ? 'n' : 'u')
  } else {
    row(8, l, r, 'N', null, 'n')
    for (let n = 9; n <= 10; n++) row(n, l - 1, r + 1, 'N', 'u', 'n')
    row(11, l - 1, r + 1, 'T')
  }
}
