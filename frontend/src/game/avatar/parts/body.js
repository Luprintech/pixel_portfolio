// Prendas de arriba. Cada prenda es una función que pinta sobre las columnas del torso y los
// hombros que da `stance.js` y devuelve cómo es su manga; los brazos van aparte (`arms.js`).
// Las filas cuentan desde la 13 de la figura: r0 hombros, r1 a r5 torso y r6 dobladillo. La camiseta
// es la de la base aprobada: cuello en pico con ribete y una franja de ribete en el dobladillo.
import { BODY_TOP } from '../stance.js'

export const DRESSES = ['vestido', 'vestidoTirantes', 'vestidoLargo', 'vestidoCamisero']
export const ONE_PIECE = [...DRESSES, 'peto']

// Lo que necesita cualquier prenda: las columnas del torso y atajos de pintado por filas relativas.
function brush(p, { view, g, look }) {
  const front = view === 'down'
  const side = view === 'side'
  const { l: tl, r: tr } = g.torso
  const { l: shl, r: shr } = g.shoulders
  const { l: hl, r: hr } = g.hip
  const [c0, c1] = g.centre.slice(-2)

  const row = (r, a, b, ch, left, right) => p.span(BODY_TOP + r, a, b, ch, left, right)
  const dot = (r, x, ch) => p.put(x, BODY_TOP + r, ch)
  const body = (r0, r1, ch = 'D', a = tl, b = tr) => {
    for (let r = r0; r <= r1; r++) row(r, a, b, ch, ch === 'D' ? 'L' : null, ch === 'D' ? 'M' : null)
  }
  const shoulders = (ch = 'D') => {
    row(0, shl, shr, ch, ch === 'D' && side ? 'L' : null, ch === 'D' ? 'M' : null)
    if (ch === 'D' && !side) dot(0, tl, 'L')
  }
  const skinNeck = () => view !== 'up' && [c0, c1].forEach((x) => dot(0, x, 'S'))
  // Banda de ribete en el cuello (y el pico, solo de frente).
  const trimmedCollar = () => {
    if (side) return g.centre.forEach((x) => dot(0, x, 'T'))
    row(0, 6, 9, 'T')
    if (front) row(1, 7, 8, 'T')
  }
  // Falda de un vestido: el vuelo crece en tres tramos y acaba en el dobladillo.
  // Al caminar de perfil las dos últimas filas se adelantan `g.sway` columnas: el vuelo sigue a la pierna.
  const dressSkirt = (from, to) => {
    const push = (r) => (r >= to - 1 ? g.sway : 0)
    for (let r = from; r <= to; r++) {
      const wide = r >= from + 2
      row(r, wide ? 4 : 5, (wide ? 11 : 10) + push(r), 'D', 'L', 'M')
    }
    row(to, 4, 11 + g.sway, 'M')
  }
  // Cierre central de la sudadera con cremallera y de la chaqueta: tira blanca entre dos franjas de sombra.
  const centreZip = () => {
    ;[c0, c1].forEach((x) => {
      for (let r = 0; r <= 6; r++) dot(r, x, 'W')
    })
    ;[c0 - 1, c1 + 1].forEach((x) => {
      for (let r = 1; r <= 6; r++) dot(r, x, 'M')
    })
  }

  return { front, side, emblem: look.emblem, tl, tr, shl, shr, hl, hr, c0, c1, centre: g.centre, row, dot, body, shoulders, skinNeck, trimmedCollar, dressSkirt, centreZip }
}

const sleeve = (len, cuff, color = 'D') => ({ len, cuff, color })

// Trifuerza del pecho, como la de los pendientes de Lupe: tres triángulos dorados con el hueco del centro
// y los bordes entre ellos en negro. De frente ocupa las seis columnas del
// torso, de r1 a r4, ; de perfil solo asoma su canto por delante del brazo. De espalda no hay.
// Y es el dorado fijo y X el negro del contorno.
const TRIFORCE_FRONT = ['..YY..', '.XYYX.', 'XYXXYX', 'YYXXYY']
const TRIFORCE_SIDE = [[2, 0, 'X'], [3, 0, 'Y'], [3, -1, 'X'], [4, 0, 'Y'], [4, -1, 'Y']]

function triforce(b) {
  if (b.front) TRIFORCE_FRONT.forEach((line, i) => [...line].forEach((ch, dx) => ch !== '.' && b.dot(1 + i, b.c0 - 2 + dx, ch)))
  else if (b.side) TRIFORCE_SIDE.forEach(([r, dx, ch]) => b.dot(r, b.tr - 1 + dx, ch))
}

const GARMENTS = {
  camiseta(b) {
    b.shoulders()
    b.body(1, 5)
    // Volumen del torso: la sombra sobre el dobladillo y, en la lisa, un pliegue de luz bajo el hombro.
    b.row(5, b.tl + 1, b.tr - 1, 'M')
    // La camiseta con emblema es lisa, de cuello redondo: el ribete y el pliegue de luz competirían
    // con el dibujo.
    if (b.emblem === 'trifuerza') {
      b.row(6, b.tl, b.tr, 'M')
      // El canto de luz del torso se deja del color de la tela para que no compita con el emblema.
      for (let r = 0; r <= 5; r++) b.dot(r, b.tl, 'D')
      // Tampoco lleva la sombra sobre el dobladillo: bajo el emblema ensuciaba la tela clara.
      b.row(5, b.tl + 1, b.tr - 1, 'D')
      b.skinNeck()
      triforce(b)
    } else {
      ;[1, 2].forEach((r) => b.dot(r, b.tl + 1, 'L'))
      b.row(6, b.tl, b.tr, 'T')
      b.trimmedCollar()
    }
    return sleeve(3, 'M')
  },

  // Holgada: cubre la cadera y las mangas llegan al codo.
  oversize(b) {
    b.shoulders()
    b.body(1, 6)
    b.row(7, b.hl, b.hr, 'D', 'L', 'M')
    b.row(8, b.hl, b.hr, 'M')
    b.row(4, b.tl, b.tr, 'M')
    b.skinNeck()
    return sleeve(4, 'M')
  },

  tirantes(b) {
    b.row(0, b.shl, b.shr, 'S', 'S', 's')
    b.row(1, b.tl, b.tr, 'S')
    ;[b.tl + 1, b.tr - 1].forEach((x) => {
      b.dot(0, x, 'D')
      b.dot(1, x, 'D')
    })
    b.body(2, 6)
    b.row(2, b.tl, b.tr, 'M')
    return sleeve(0, null)
  },

  sudadera(b) {
    b.shoulders()
    b.body(1, 5)
    b.row(6, b.tl, b.tr, 'M')
    if (b.front) {
      b.row(0, b.tl, b.tr, 'L')
      b.dot(1, b.tl, 'L')
      b.dot(1, b.tr, 'L')
      ;[b.c0, b.c1].forEach((x) => {
        b.dot(0, x, 'S')
        b.dot(2, x, 'W')
        b.dot(3, x, 'W')
      })
      b.row(5, b.tl + 1, b.tr - 1, 'M')
    } else {
      for (let r = 0; r <= 2; r++) b.row(r, b.tl, b.tr, 'L')
    }
    return sleeve(4, 'M')
  },

  cremallera(b) {
    b.shoulders()
    b.body(1, 5)
    b.row(6, b.tl, b.tr, 'M')
    if (b.front) {
      b.row(0, b.tl, b.tr, 'L')
      b.centreZip()
    } else {
      for (let r = 0; r <= 2; r++) b.row(r, b.tl, b.tr, 'L')
    }
    return sleeve(4, 'M')
  },

  // Punto: reflejos alternos, cuello, dobladillo y puños acanalados.
  jersey(b) {
    b.shoulders()
    b.body(1, 5)
    for (let r = 2; r <= 4; r += 2) {
      for (let x = b.tl + 1; x < b.tr; x++) if ((x + r) % 2 === 0) b.dot(r, x, 'L')
    }
    b.row(5, b.tl, b.tr, 'M')
    b.row(6, b.tl, b.tr, 'T')
    if (b.front) {
      b.row(0, b.tl + 1, b.tr - 1, 'M')
      ;[b.c0, b.c1].forEach((x) => b.dot(0, x, 'S'))
    }
    return sleeve(4, 'T')
  },

  vaquera(b) {
    b.shoulders()
    b.body(1, 5)
    b.row(6, b.tl, b.tr, 'M')
    if (b.front) {
      b.row(0, b.tl, b.tr, 'L')
      b.dot(1, b.tl + 1, 'L')
      b.dot(1, b.tr - 1, 'L')
      b.centreZip()
      // Pespuntes de contraste a los lados del cierre.
      ;[b.c0 - 1, b.c1 + 1].forEach((x) => [2, 4, 6].forEach((r) => b.dot(r, x, 'T')))
      ;[b.tl + 1, b.tr - 1].forEach((x) => {
        b.dot(3, x, 'M')
        b.dot(4, x, 'M')
      })
    } else {
      b.row(0, b.tl, b.tr, 'L')
    }
    return sleeve(4, 'M')
  },

  // Polo: cuello de ribete abierto con dos botones y mangas con puño.
  polo(b) {
    b.shoulders()
    b.body(1, 5)
    b.row(6, b.tl, b.tr, 'M')
    b.row(0, 6, 9, 'T')
    if (b.front) {
      b.dot(1, b.c0, 'T')
      b.dot(1, b.c1, 'T')
      ;[2, 3].forEach((r) => b.dot(r, b.c0, 'T'))
    } else {
      b.skinNeck()
    }
    return sleeve(3, 'T')
  },

  // Chaleco abierto sobre una camiseta blanca: dos paneles del color de la prenda y el centro blanco.
  chaleco(b) {
    b.shoulders('W')
    b.body(1, 6, 'W')
    if (b.front) [b.c0, b.c1].forEach((x) => b.dot(0, x, 'S'))
    if (b.front) {
      for (let r = 1; r <= 6; r++) {
        b.row(r, b.tl, b.c0 - 1, 'D', 'L')
        b.row(r, b.c1 + 1, b.tr, 'D', null, 'M')
      }
    } else {
      b.body(1, 6)
    }
    return sleeve(3, null, 'W')
  },

  // Cárdigan abierto: mangas y paneles de punto, con la camiseta blanca asomando por el centro.
  cardigan(b) {
    b.shoulders()
    b.body(1, 6, 'W')
    if (b.front) {
      for (let r = 1; r <= 6; r++) {
        b.row(r, b.tl, b.tl + 1, 'D', 'L')
        b.row(r, b.tr - 1, b.tr, 'D', null, 'M')
      }
      b.row(0, b.tl, b.tr, 'L')
      ;[b.c0, b.c1].forEach((x) => b.dot(0, x, 'S'))
      ;[2, 4].forEach((r) => b.dot(r, b.tl + 1, 'T'))
    } else {
      b.body(1, 6)
    }
    return sleeve(4, 'T')
  },

  vestido(b) {
    b.shoulders()
    b.body(1, 3)
    b.skinNeck()
    b.dressSkirt(4, 9)
    return sleeve(3, null)
  },

  // Pichi sobre blusa blanca: tirantes, peto y vuelo en el color de la prenda.
  vestidoTirantes(b) {
    b.shoulders('W')
    b.body(1, 3, 'W')
    ;[b.tl + 1, b.tr - 1].forEach((x) => {
      for (let r = 0; r <= 2; r++) b.dot(r, x, 'D')
    })
    if (b.front) [b.c0, b.c1].forEach((x) => b.dot(0, x, 'S'))
    for (let r = 2; r <= 4; r++) b.row(r, b.tl + 1, b.tr - 1, 'D', 'L', 'M')
    b.row(4, b.tl, b.tr, 'D', 'L', 'M')
    b.dressSkirt(5, 9)
    return sleeve(3, null, 'W')
  },

  vestidoLargo(b) {
    b.shoulders()
    b.body(1, 3)
    b.skinNeck()
    b.dressSkirt(4, 11)
    return sleeve(3, null)
  },

  vestidoCamisero(b) {
    b.shoulders()
    b.body(1, 3)
    b.dressSkirt(4, 9)
    if (b.front) {
      b.row(0, b.tl + 1, b.tr - 1, 'L')
      ;[b.c0, b.c1].forEach((x) => {
        b.dot(0, x, 'S')
        b.dot(1, x, 'S')
      })
      for (let r = 2; r <= 8; r += 2) b.dot(r, b.c0, 'T')
    }
    b.row(3, b.tl, b.tr, 'M')
    return sleeve(3, 'L')
  },

  // Camiseta blanca bajo un peto que lleva el color de la prenda de abajo.
  peto(b) {
    b.shoulders('W')
    b.body(1, 5, 'W')
    if (b.front) [b.c0, b.c1].forEach((x) => b.dot(0, x, 'S'))
    ;[b.tl + 1, b.tr - 1].forEach((x) => {
      for (let r = 0; r <= 2; r++) b.dot(r, x, 'N')
    })
    if (b.front) {
      for (let r = 3; r <= 5; r++) b.row(r, b.tl + 1, b.tr - 1, 'N', 'u', 'n')
      ;[b.tl + 1, b.tr - 1].forEach((x) => b.dot(3, x, 'Y'))
      ;[b.c0, b.c1].forEach((x) => {
        b.dot(4, x, 'n')
        b.dot(5, x, 'n')
      })
    } else {
      b.row(5, b.tl, b.tr, 'N', 'u', 'n')
    }
    b.row(6, b.hl, b.hr, 'N', null, 'n')
    return sleeve(3, null, 'W')
  },
}

// Pinta la prenda elegida y devuelve cómo es su manga: `len` en filas desde el hombro, `cuff` (letra
// de la bocamanga o null) y `color` de la tela.
export function paintTop(p, ctx) {
  const garment = GARMENTS[ctx.look.top]
  return garment ? garment(brush(p, ctx)) : sleeve(3, null)
}
