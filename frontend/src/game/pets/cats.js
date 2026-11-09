// Razas de gato. La forma base es la de Khalessi, la gata siamesa de Lupe (que no es una opción de
// la viajera); cada raza cambia de tamaño, de cuerpo, de orejas y de cola, y se tiñe con el
// color principal y el de detalles que elige quien juega.
// La cabeza va dibujada a mano (orejas triangulares con el interior rosa, cachetes con pelusa,
// nariz rosa, boca y bigotes) para que no se confunda con un ratón.
import { shade, tint } from '../palette.js'
import { contrast, lum, readable } from './colors.js'
import { drawPet } from './engine.js'
import { OUTLINE } from '../avatar/index.js'
import { ellipse, rect } from '../pixelKit.js'

// c pelo, s raya de la frente, p orejas, k zona central de la cara, i interior de la oreja,
// e iris, q pupila, n nariz, m boca.
const KEYS = { c: 'base', s: 'brow', p: 'point', k: 'mask', i: 'inner', e: 'iris', q: 'pupil', n: 'nose', m: 'mouth' }

const HEAD = [
  '.............p......p.',
  '.............pp....pp.',
  '.............pip..pip.',
  '.............ccsccscc.',
  '............ccckkkccc.',
  '............ccekkkecc.',
  '............ccqkkkqcc.',
  '...........ccckknkkccc',
  '.............ckkmkkc..',
  '..............ccccc...',
]
// Cara ancha y chata, de orejas pequeñas y separadas.
const HEAD_FLAT = [
  '.............pp...pp..',
  '.............picccip..',
  '............ccscccscc.',
  '............ccecccecc.',
  '............ccqcccqcc.',
  '...........ccckknkkccc',
  '.............ckkmkkc..',
  '..............ccccc...',
]
// Mechones en la punta de las orejas.
const HEAD_TUFTED = ['............p........p', ...HEAD]
// Orejas más altas y puntiagudas.
const HEAD_BIG_EARS = ['.............p......p.', ...HEAD]

// Colas, relativas al arranque en la grupa: erguida, mullida y baja, plumero grande (nace a
// media altura del cuerpo y sube en curva) y látigo.
const TAIL_UP = [
  [[0, 1], [0, -1], [0, -3], [1, -5], [2, -5]],
  [[0, 1], [1, -1], [2, -3], [3, -4], [4, -4]],
]
const TAIL_FLUFFY = [[[0, 2], [0, 0], [1, -1]], [[0, 2], [1, 0], [1, -1]]]
const TAIL_PLUME = [
  [[1, 0], [0, -2], [0, -4], [1, -6], [2, -7]],
  [[1, 0], [1, -2], [2, -4], [3, -6], [4, -7]],
]
const TAIL_WHIP = [
  [[0, 2], [0, 0], [0, -2], [1, -4], [2, -5]],
  [[0, 2], [1, 0], [2, -2], [3, -3], [4, -3]],
]

// Bigotes: tres por lado, abiertos hacia fuera, relativos a la esquina de la cabeza. Se pintan al
// final y finos, sin contorno. Los de la derecha caen sobre el fondo y van claros; los de la
// izquierda cruzan el cuerpo y llevan un tono que se vea sobre el pelaje.
const WHISKERS_RIGHT = [[[22, 6], [23, 5]], [[22, 7], [23, 7]], [[22, 8], [23, 9]]]
const WHISKERS_LEFT = [[[10, 6], [9, 5]], [[10, 7], [9, 7]], [[10, 8], [9, 9]]]

function whiskers(g, c, spec) {
  const { x: hx, y: hy } = spec.head
  const paint = (color) => (pair) => pair.forEach(([x, y]) => rect(g, hx + x, hy + y, 1, 1, color))
  WHISKERS_RIGHT.forEach(paint('#f6f0e0'))
  WHISKERS_LEFT.forEach(paint(c.whisker))
}

const chestPatch = (rx, ry, dx) => (g, c, spec) => {
  if (c.bib) ellipse(g, spec.body.cx + dx, spec.body.cy + 1.5, rx, ry, c.bib)
}

const SPECS = {
  comun: {
    w: 26, h: 16,
    body: { cx: 10, cy: 10, rx: 7.4, ry: 3.6 },
    legs: { y: 12, h: 3 },
    tail: { frames: TAIL_UP },
    stripes: [[7, 7], [10, 7], [13, 8]],
    head: { rows: HEAD, x: 2, y: 1, keys: KEYS },
    details: chestPatch(2.2, 2.2, 6),
    post: whiskers,
  },
  // Redondo y peludo, de patas cortas y cara chata.
  persa: {
    w: 26, h: 16,
    body: { cx: 10, cy: 10.8, rx: 8, ry: 4.4 },
    legs: { y: 13, h: 3 },
    tail: { frames: TAIL_FLUFFY, size: 3 },
    head: { rows: HEAD_FLAT, x: 2, y: 3, keys: KEYS },
    details: chestPatch(3, 3, 6),
    post: whiskers,
  },
  // El más grande: cuerpo largo, mechones en las orejas y un plumero de cola.
  maine: {
    w: 32, h: 20,
    body: { cx: 13, cy: 12.5, rx: 10.5, ry: 4.8 },
    legs: { y: 16, h: 4 },
    tail: { frames: TAIL_PLUME, size: 3, taper: true },
    stripes: [[8, 9], [12, 9], [16, 10]],
    head: { rows: HEAD_TUFTED, x: 8, y: 2, keys: KEYS },
    details: chestPatch(3, 3.5, 8),
    post: whiskers,
  },
  // Delgado y de piel arrugada, con las orejas enormes y la cola fina.
  sphynx: {
    w: 26, h: 17,
    body: { cx: 10, cy: 11.3, rx: 7.6, ry: 2.9 },
    legs: { y: 14, h: 3 },
    tail: { frames: TAIL_WHIP, size: 1 },
    spots: [[6, 9, 2, 1], [11, 9, 2, 1], [8, 12, 3, 1]],
    head: { rows: HEAD_BIG_EARS, x: 2, y: 1, keys: KEYS },
    post: whiskers,
  },
  // Largo y esbelto, con manchas en el cuerpo y la cola anillada.
  bengala: {
    w: 30, h: 16,
    body: { cx: 11.5, cy: 10, rx: 9.6, ry: 3.4 },
    legs: { y: 12, h: 3 },
    tail: { frames: TAIL_UP, rings: true },
    spots: [[5, 7, 2, 2], [9, 6, 2, 2], [13, 7, 2, 2], [17, 8, 2, 2], [7, 10, 2, 1], [11, 10, 2, 1], [15, 11, 2, 1]],
    head: { rows: HEAD, x: 6, y: 1, keys: KEYS },
    post: whiskers,
  },
}

// Reparto de colores común: todo sale del pelaje, y los detalles dan patas, pecho y manchas.
function catColors(coat, marks, extra = {}) {
  const dark = lum(coat) <= 110
  const point = contrast(coat, 0.12)
  return {
    base: coat,
    belly: contrast(coat, 0.18),
    back: tint(coat, 0.16),
    stripe: contrast(coat, 0.2),
    brow: contrast(coat, 0.22),
    point,
    tail: point,
    mask: coat,
    legs: marks,
    bib: marks,
    spot: marks,
    inner: dark ? '#a85a6a' : '#e89a8c',
    iris: readable(coat, extra.iris ?? '#7cc05a'),
    pupil: '#1e1420',
    nose: dark ? '#b0707e' : '#e8828f',
    mouth: dark ? '#14102a' : '#3a2a2a',
    whisker: contrast(coat, 0.45),
    ...extra.over,
  }
}

export const CAT_BREEDS = {
  comun: { spec: SPECS.comun, colors: (coat, marks) => catColors(coat, marks, { iris: '#7cc05a' }) },
  persa: { spec: SPECS.persa, colors: (coat, marks) => catColors(coat, marks, { iris: '#e8a830', over: { legs: coat, point: coat, tail: coat } }) },
  maine: { spec: SPECS.maine, colors: (coat, marks) => catColors(coat, marks, { iris: '#e8c040' }) },
  sphynx: {
    spec: SPECS.sphynx,
    colors: (coat, marks) => catColors(coat, marks, { iris: '#5bb4e5', over: { legs: coat, bib: null, stripe: contrast(coat, 0.1), point: contrast(coat, 0.2), tail: contrast(coat, 0.2), inner: shade(coat, 0.8) } }),
  },
  bengala: { spec: SPECS.bengala, colors: (coat, marks) => catColors(coat, marks, { iris: '#e8c040', over: { legs: coat, bib: null } }) },
}

// Khalessi: la gata siamesa de Lupe. No es una opción de la viajera; se usa en la portada.
const KHALESSI = {
  base: '#eadbc0', brow: '#c9a982', point: '#5a4038', tail: '#5a4038', mask: '#5a4038', legs: '#5a4038',
  inner: '#e89a8c', iris: '#5bb4e5', pupil: '#1e1420', nose: '#e8828f', mouth: '#3a2a2a',
  belly: '#cbb694', back: '#d6c19b', stripe: '#c9a982', whisker: '#9b8576',
}

export const khalessiCanvas = (frame = 0, tail = 0) => drawPet(SPECS.comun, KHALESSI, frame, tail)

// Khalessi sentada. Es la misma gata con el cuerpo erguido bajo la cabeza, las patas juntas y la cola
// tendida en el suelo. Al asearse cierra los ojos, baja la cabeza y se lleva una pata a la cara; la
// pata sube y baja entre los dos fotogramas.
const HEAD_EYES_SHUT = HEAD.map((row, i) => (i === 5 ? row.replace(/e/g, 'q') : i === 6 ? row.replace(/q/g, 'k') : row))
const TAIL_FLAT = [
  [[0, 5], [-1, 5], [-2, 5], [-3, 4]],
  [[0, 5], [-1, 5], [-2, 5], [-3, 5]],
]

const sitSpec = (washing, step) => ({
  w: 26, h: 16,
  body: { cx: 16, cy: 10, rx: 5, ry: 5.2 },
  legs: { y: 12, h: 3 },
  tail: { frames: TAIL_FLAT },
  head: { rows: washing ? HEAD_EYES_SHUT : HEAD, x: washing ? 1 : 2, y: washing ? 1 : 0, keys: KEYS },
  post: (g, c, spec) => {
    if (washing) {
      // La pata levantada, clara y con contorno para que se vea sobre la máscara oscura: sube hasta
      // los ojos y baja hasta la boca.
      const top = 10 - (step % 2) * 3
      rect(g, 17, top - 1, 4, 7, OUTLINE)
      rect(g, 18, top, 2, 5, c.base)
      rect(g, 18, top, 2, 1, c.belly)
    }
    whiskers(g, c, spec)
  },
})

// `wash` activa el aseo; `step` (0 o 1) alterna los dos fotogramas del aseo o el vaivén de la cola.
export const khalessiSitCanvas = (wash = false, step = 0) => drawPet(sitSpec(wash, step), KHALESSI, 0, step)

export function catCanvas(breed, coat, marks, frame = 0, tail = 0) {
  const { spec, colors } = CAT_BREEDS[breed]
  return drawPet(spec, colors(coat, marks), frame, tail)
}
