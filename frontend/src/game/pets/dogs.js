// Razas de perro. Cada una tiene su tamaño de lienzo, su cuerpo, la forma de las orejas y la
// postura de la cola, y se tiñe con el color principal y el de detalles que elige quien juega.
import { contrast, lum, noseOn, readable } from './colors.js'
import { drawPet } from './engine.js'
import { ellipse } from '../pixelKit.js'
import { tint } from '../palette.js'

// c pelo, r orejas, m hocico, w mejillas, b franja de la frente, e ojos, n nariz, t lengua.
const KEYS = { c: 'base', r: 'ear', m: 'muzzle', w: 'cheek', b: 'blaze', e: 'eye', n: 'nose', t: 'tongue' }

const HEADS = {
  // Orejas caídas junto a la cara.
  floppy: [
    '.............ccccccc..',
    '...........rrcccccccrr',
    '...........rrcecccecrr',
    '...........rrcccccccrr',
    '...........rrcmmmmmcrr',
    '...........rrcmmnmmcrr',
    '...........r.cmmmmmc.r',
    '..............cmtmc...',
    '...............ccc....',
  ],
  // Orejas largas que cuelgan hasta la barbilla.
  long: [
    '.............ccccccc..',
    '...........rrcccccccrr',
    '...........rrcecccecrr',
    '...........rrcccccccrr',
    '...........rrcmmmmmcrr',
    '...........rrcmmnmmcrr',
    '...........rrcmmmmmcrr',
    '...........rr.cmtmc.rr',
    '............r..ccc..r.',
  ],
  // Orejas triangulares erguidas, mejillas que pueden ser de otro color y hocico largo.
  pointy: [
    '............rr.....rr.',
    '............rrr...rrr.',
    '............rrcccccrr.',
    '............wweccceww.',
    '............wwcccccww.',
    '............wwmmmmmww.',
    '.............wmmnmmw..',
    '..............mmtmm...',
    '...............mmm....',
  ],
  // Cara negra con franja blanca en la frente y hocico blanco largo.
  collie: [
    '.............r.....r..',
    '............rr.....rr.',
    '............rcccbcccr.',
    '............ccecbcecc.',
    '............ccccbcccc.',
    '.............cmmmmmc..',
    '.............mmmnmmm..',
    '..............mmtmm...',
    '...............mmm....',
  ],
}

// Colas, relativas al arranque en el lomo: en alto, rizada, colgando y baja.
const TAILS = {
  up: [[[0, 0], [0, -2], [1, -4], [2, -5]], [[0, 0], [1, -2], [2, -4], [3, -5]]],
  curl: [[[0, 0], [0, -2], [1, -4], [2, -4], [3, -3]], [[0, 0], [1, -2], [2, -3], [3, -3], [4, -2]]],
  down: [[[0, 1], [0, 3], [0, 5]], [[0, 1], [1, 3], [1, 5]]],
  low: [[[0, 2], [1, 1]], [[0, 2], [1, 3]]],
}

const chestPatch = (rx, ry, dx) => (g, c, spec) => {
  if (c.bib) ellipse(g, spec.body.cx + dx, spec.body.cy + 1.5, rx, ry, c.bib)
}

// El tamaño de lienzo marca el tamaño del perro: el pastor es el más alto y el teckel el más bajo.
const SPECS = {
  collie: {
    w: 30, h: 18,
    body: { cx: 12, cy: 11.3, rx: 9, ry: 4 },
    legs: { y: 14, h: 4 },
    tail: { frames: TAILS.down },
    head: { rows: HEADS.collie, x: 6, y: 3, keys: KEYS },
    details: chestPatch(2.5, 3, 7),
  },
  pastor: {
    w: 32, h: 20,
    body: { cx: 13, cy: 12.5, rx: 10, ry: 4.3 },
    legs: { y: 15, h: 5 },
    tail: { frames: TAILS.down },
    spots: [[7, 8, 9, 3]],
    head: { rows: HEADS.pointy, x: 8, y: 4, keys: KEYS },
  },
  beagle: {
    w: 26, h: 15,
    body: { cx: 10, cy: 9.5, rx: 7.2, ry: 3.5 },
    legs: { y: 12, h: 3 },
    tail: { frames: TAILS.up },
    spots: [[5, 6, 5, 3], [10, 8, 3, 2]],
    head: { rows: HEADS.long, x: 2, y: 2, keys: KEYS },
  },
  husky: {
    w: 30, h: 18,
    body: { cx: 12, cy: 11.5, rx: 8.6, ry: 4 },
    legs: { y: 14, h: 4 },
    tail: { frames: TAILS.curl },
    head: { rows: HEADS.pointy, x: 6, y: 3, keys: KEYS },
  },
  // Largo y bajo, de patas cortas.
  teckel: {
    w: 28, h: 14,
    body: { cx: 11, cy: 10.3, rx: 9.6, ry: 2.7 },
    legs: { y: 12, h: 2 },
    tail: { frames: TAILS.low },
    head: { rows: HEADS.floppy, x: 4, y: 2, keys: KEYS },
  },
  // Robusto y de un solo color, con las orejas caídas.
  labrador: {
    w: 30, h: 18,
    body: { cx: 12, cy: 11.3, rx: 9, ry: 4.3 },
    legs: { y: 14, h: 4 },
    tail: { frames: TAILS.down },
    head: { rows: HEADS.floppy, x: 6, y: 3, keys: KEYS },
    details: chestPatch(2.5, 3, 7),
  },
  // Esbelto, con el manto salpicado de motas.
  dalmata: {
    w: 30, h: 18,
    body: { cx: 12, cy: 11.3, rx: 9, ry: 3.7 },
    legs: { y: 14, h: 4 },
    tail: { frames: TAILS.up },
    spots: [[4, 9, 2, 2], [8, 8, 2, 1], [8, 12, 1, 1], [11, 10, 2, 2], [14, 8, 2, 2], [16, 12, 2, 1], [6, 11, 1, 1]],
    head: { rows: HEADS.floppy, x: 6, y: 3, keys: KEYS },
  },
  // Paticorto y alargado, de orejas grandes y erguidas.
  corgi: {
    w: 28, h: 17,
    body: { cx: 11, cy: 10.6, rx: 8.6, ry: 3.2 },
    legs: { y: 13, h: 3 },
    tail: { frames: TAILS.low },
    head: { rows: HEADS.pointy, x: 4, y: 1, keys: KEYS },
    details: chestPatch(2.5, 2.5, 7),
  },
}

// Reparto de colores común; cada raza lo ajusta (qué parte lleva los detalles).
function dogColors(coat, marks, over) {
  return {
    base: coat,
    belly: contrast(coat, 0.2),
    back: tint(coat, 0.14),
    legs: coat,
    ear: contrast(coat, 0.3),
    muzzle: tint(coat, 0.3),
    cheek: coat,
    blaze: coat,
    tail: coat,
    nose: noseOn(marks),
    tongue: '#e8828f',
    eye: '#2a1a1a',
    ...over,
  }
}

export const DOG_BREEDS = {
  // Cuerpo oscuro con blanco en la franja, el hocico, el pecho, las patas y la punta de la cola.
  collie: {
    spec: SPECS.collie,
    colors: (coat, marks) => dogColors(coat, marks, {
      belly: marks, muzzle: marks, blaze: marks, sock: marks, tip: marks, bib: marks,
      ear: coat, nose: noseOn(marks), eye: readable(coat, '#d9a441'),
    }),
  },
  // Manto de un color con la silla, las orejas y el hocico del color de detalles.
  pastor: {
    spec: SPECS.pastor,
    colors: (coat, marks) => dogColors(coat, marks, {
      back: marks, spot: marks, ear: marks, muzzle: marks, legs: tint(coat, 0.1), tip: marks,
      nose: noseOn(marks), eye: readable(coat, '#2a1a1a'),
    }),
  },
  // Tricolor: manto, silla oscura derivada del manto y blanco en hocico, pecho, patas y cola.
  beagle: {
    spec: SPECS.beagle,
    colors: (coat, marks) => dogColors(coat, marks, {
      belly: marks, muzzle: marks, sock: marks, tip: marks,
      ear: contrast(coat, 0.45), spot: contrast(coat, 0.45), eye: readable(coat, '#3a2a2a'),
    }),
  },
  // Antifaz, hocico, barriga y patas claros, y ojos azules.
  husky: {
    spec: SPECS.husky,
    colors: (coat, marks) => dogColors(coat, marks, {
      belly: marks, muzzle: marks, cheek: marks, sock: marks,
      eye: readable(marks, '#5bb4e5'), nose: lum(marks) < 80 ? '#b07080' : '#2a2430',
    }),
  },
  // Hocico y patas del color de detalles, como los "fuego" del teckel.
  teckel: {
    spec: SPECS.teckel,
    colors: (coat, marks) => dogColors(coat, marks, {
      muzzle: marks, sock: marks, eye: readable(coat, '#1e1420'), nose: noseOn(marks),
    }),
  },
  // Un solo color; los detalles tiñen el pecho y las puntas de las patas.
  labrador: {
    spec: SPECS.labrador,
    colors: (coat, marks) => dogColors(coat, marks, {
      ear: contrast(coat, 0.2), muzzle: tint(coat, 0.2), bib: marks, sock: marks, nose: noseOn(coat), eye: readable(coat, '#2a1a1a'),
    }),
  },
  // Motas y orejas del color de detalles sobre el manto.
  dalmata: {
    spec: SPECS.dalmata,
    colors: (coat, marks) => dogColors(coat, marks, {
      spot: marks, ear: marks, muzzle: coat, nose: noseOn(coat), eye: readable(coat, '#2a1a1a'),
    }),
  },
  // Hocico, mejillas, pecho, barriga y patas del color de detalles.
  corgi: {
    spec: SPECS.corgi,
    colors: (coat, marks) => dogColors(coat, marks, {
      belly: marks, muzzle: marks, cheek: marks, bib: marks, sock: marks, ear: coat, nose: noseOn(marks), eye: readable(marks, '#2a1a1a'),
    }),
  },
}

export function dogCanvas(breed, coat, marks, frame = 0, tail = 0) {
  const { spec, colors } = DOG_BREEDS[breed]
  return drawPet(spec, colors(coat, marks), frame, tail)
}
