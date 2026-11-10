// Peinados. Cada uno es una forma propia (no una variante del mismo pelo) y se dibuja por separado
// para frente (`down`), espalda (`up`) y perfil derecho (`side`), en dos capas:
//   back   detrás del cuerpo y de la cabeza (melena que cae por la espalda, base de una coleta)
//   mid    sobre el torso pero bajo los brazos (solo la melena larga de perfil)
//   front  por encima de la cabeza (flequillo, mechas junto a la cara, coletas, trenzas, moños)
// Las celdas son `{ x, y, ch }` en la rejilla de 16 columnas; la fila 0 es la primera de la cabeza
// y las negativas sobresalen por arriba (hasta -4). El perfil izquierdo es el derecho reflejado,
// salvo en lo que no es simétrico (el rapado lateral solo se ve de un lado): `left` lo indica.
//
// Letras: H pelo, h reflejo, d sombra, T goma o lazo, z rapado (mezcla de pelo y piel), I raíz de
// otro color e i su transición hacia el tono del pelo (solo la melena de Lupe).
// El bob es el peinado de la base aprobada y va dibujado a mano, con su brillo y sus sombras;
// el resto reparte reflejos y sombras solos (`finish`).

const key = (x, y) => `${x},${y}`
const MID = 15

const put = (m, x, y, ch = 'H') => m.set(key(x, y), ch)

function rect(m, x0, y0, x1, y1, ch = 'H') {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) m.set(key(x, y), ch)
}

// Igual que `rect` pero también en el lado opuesto: la cabeza de frente y de espalda es simétrica.
function mir(m, x0, y0, x1, y1, ch = 'H') {
  rect(m, x0, y0, x1, y1, ch)
  rect(m, MID - x1, y0, MID - x0, y1, ch)
}

// Cráneo redondo visto de frente o de espalda (filas 0 a 4); `tight` deja la frente despejada.
function capDown(F, { tight = false } = {}) {
  rect(F, 5, 0, 10, 0)
  rect(F, 4, 1, 11, 1)
  if (tight) {
    rect(F, 3, 2, 12, 3)
    rect(F, 4, 4, 11, 4)
  } else {
    rect(F, 3, 2, 12, 4)
  }
}

// Cráneo de perfil (mira a la derecha): la nuca llega a la columna 3 y la frente a la 13.
function capSide(F, { tight = false } = {}) {
  rect(F, 5, 0, 10, 0)
  rect(F, 4, 1, 12, 1)
  rect(F, 3, 2, 13, 3)
  rect(F, 3, 4, tight ? 11 : 12, 4)
}

// Trenza segmentada: zigzag de dos columnas con una goma cada cuatro filas y punta suelta.
function braid(F, x, y0, y1) {
  for (let y = y0; y <= y1; y++) {
    if ((y - y0) % 4 === 3) {
      put(F, x, y, 'T')
      put(F, x + 1, y, 'T')
    } else if (y % 2 === 0) {
      put(F, x, y, 'H')
      put(F, x + 1, y, 'h')
    } else {
      put(F, x, y, 'h')
      put(F, x + 1, y, 'H')
    }
  }
  put(F, x, y1 + 1, 'H')
}

const WAVE = [0, 1, 2, 1]

// Nuca de un recogido vista de espalda. El pelo baja hasta su nacimiento y se estrecha en dos
// escalones: si se corta recto en la fila 8, media cabeza queda en piel y parece rapada.
function napeUp(F) {
  rect(F, 3, 4, 12, 8)
  rect(F, 4, 9, 11, 9)
  rect(F, 5, 10, 10, 10)
}


// Bob de la base aprobada: masa redonda hasta la barbilla, brillo arriba a la izquierda y sombra a
// la derecha y bajo el flequillo. De perfil lleva flequillo en cuña, patilla en la sien y la nuca
// recogida hacia dentro.
const BOB_MASS = [
  '....HHHHHHHH....',
  '..HHHHHHHHHHHH..',
  '.HHHHHHHHHHHHHH.',
  '.HHHHHHHHHHHHHH.',
  ...Array(6).fill('HHHHHHHHHHHHHHHH'),
  '.HHHHHHHHHHHHHH.',
  '..HHHHHHHHHHHH..',
]
const BOB_DETAIL = [
  '....hhh.........',
  '...hh...........',
  ...Array(7).fill('...............d'),
  '..............d.',
  '..dddddddddddd..',
]
const BOB_FRINGE = ['....HHHHHHHH....', '...HHdHHdHHdH...']
const BOB_SIDE = [
  '....HHHHHHH.....',
  '..HhhHHHHHHHH...',
  '.HhHHHHHHHHHHH..',
  '.HHHHHHHHHHHHHH.',
  '.HHHHHHHHHHdd...',
  '.HHHHHHHHd......',
  '.HHHHHHHHd......',
  '.HHHHHHHHd......',
  '.HHHHHHHHd......',
  '.HHHHHHHHd......',
  '..HHHHHHHd......',
  '...HHHHHHd......',
  '....HHHHHd......',
]

function stampRows(m, y, rows) {
  rows.forEach((row, i) => [...row].forEach((ch, x) => ch !== '.' && put(m, x, y + i, ch)))
}

// Rellena filas `desde..` con tramos [x0, x1]; `ink` decide la letra de cada celda.
function bands(m, from, spans, ink) {
  spans.forEach(([x0, x1], i) => {
    for (let x = x0; x <= x1; x++) put(m, x, from + i, ink(x, from + i, x0, x1))
  })
}

// Largo liso. La melena es una masa que cae por detrás del cuerpo y se estrecha hasta una punta; de
// frente solo dos mechones cruzan los hombros, y el rostro queda a la vista (raya al lado, frente
// despejada y mejillas libres). Los brazos van por encima de la masa de atrás.
const LONG_FRONT_CAP = [
  '.....hhHHHH.....',
  '....hhHHHHHd....',
  '...hHHHHHHHHd...',
  '...HHHd.HHHHH...',
  '...HHd....dHH...',
]
const LONG_FRONT_BACK = [...Array(7).fill([2, 13]), ...Array(5).fill([1, 14]), [2, 13], [2, 13], [3, 12], [3, 12], [4, 11]]
const LONG_SIDE_BACK = [[2, 4], [2, 5], [1, 5], [1, 5], [1, 5], [1, 5], [1, 5], [1, 5], [2, 5], [2, 4], [3, 4]]
const LONG_BACK = [...Array(12).fill([3, 12]), [4, 11], [4, 11], [4, 11], [5, 10], [5, 10], [6, 9]]

function longHair(kind, B, F, _left, M) {
  if (kind === 'side') return sideLong(B, M, F)
  if (kind === 'up') {
    capDown(F)
    bands(F, 5, LONG_BACK, (x, y, x0, x1) => {
      if (x === x1 || y === 5 + LONG_BACK.length - 1) return 'd'
      if (x === x0 && y >= 8 && y <= 14) return 'h'
      if ([5, 8, 10].includes(x) && y >= 6 && (x + y) % 5 !== 0) return 'd'
      return 'H'
    })
    ;[[6, 0], [7, 0], [5, 1], [6, 1], [7, 1], [4, 2], [5, 2], [4, 3], [5, 3]].forEach(([x, y]) => put(F, x, y, 'h'))
    return
  }
  stampRows(F, 0, LONG_FRONT_CAP)
  mir(F, 3, 5, 3, 10)
  for (let y = 5; y <= 10; y++) put(F, 12, y, 'd')
  put(F, 3, 5, 'h')
  mir(F, 3, 11, 4, 11)
  put(F, 12, 11, 'd')
  // Mechones sobre los hombros: se estrechan hasta una punta.
  ;[[2, 4], [2, 4], [3, 4], [3, 4], [3, 4], [4, 4]].forEach(([x0, x1], i) => {
    for (let x = x0; x <= x1; x++) {
      put(F, x, 12 + i, x === x0 && i < 3 ? 'h' : 'H')
      put(F, MID - x, 12 + i, x === x0 ? 'd' : 'H')
    }
  })
  bands(B, 5, LONG_FRONT_BACK, (x, y, x0, x1) => {
    if (x === x1 || y === 5 + LONG_FRONT_BACK.length - 1) return 'd'
    if (x === x0 && y >= 12 && y <= 15) return 'h'
    return x === x0 + 1 && y >= 15 && y % 2 ? 'd' : 'H'
  })
}

// Perfil de pelo largo (mira a la derecha), en tres capas para que cada mecha esté en su sitio:
//   B  detrás del cuello y de la espalda (la parte que asoma por fuera del torso)
//   M  la melena que cae por la espalda, por encima del torso y por debajo del brazo
//   F  casquete, nuca, flequillo y un mechón junto al cuello, por encima de la cabeza
// `wave` ondula el borde de la melena (largo ondulado).
const SIDE_LENGTH = [[2, 6], [2, 6], [1, 6], [1, 6], [1, 6], [1, 6], [1, 6], [2, 6], [2, 6], [2, 5], [3, 5], [3, 4]]
const BACK_OF_TORSO = 4

function sideLong(B, M, F, { wave = false } = {}) {
  capSide(F)
  rect(F, 3, 5, 8, 11)
  rect(F, 3, 12, 6, 12)
  // Flequillo barrido que apenas pasa de la sien, y un mechón suelto junto al cuello.
  ;[[9, 5], [10, 5]].forEach(([x, y]) => put(F, x, y))
  put(F, 9, 6, 'd')
  ;[[8, 12], [8, 13]].forEach(([x, y]) => put(F, x, y, 'd'))
  ;[[6, 0], [7, 0], [5, 1], [6, 1], [4, 2], [5, 2], [4, 3]].forEach(([x, y]) => put(F, x, y, 'h'))
  for (let y = 5; y <= 12; y++) put(F, 3, y, 'd')
  for (let y = 6; y <= 11; y++) if (y !== 8) put(F, 6, y, 'd')
  SIDE_LENGTH.forEach(([a, b], i) => {
    const y = 11 + i
    const shift = wave ? WAVE[i % 4] - 1 : 0
    for (let x = Math.max(1, a + shift); x <= b + shift; x++) {
      let ch = 'H'
      if (x === b + shift || y === 22) ch = 'd'
      else if (x === a + shift && y >= 13 && y <= 17) ch = 'h'
      else if (x === 5 && y >= 14 && y % 3 !== 0) ch = 'd'
      put(x < BACK_OF_TORSO ? B : M, x, y, ch === 'H' && x < BACK_OF_TORSO && y >= 14 ? 'd' : ch)
    }
  })
}

// Corto clásico, dibujado a mano: raya a un lado, flequillo en mechones sueltos que caen sobre la
// frente (de frente y de perfil), nuca recortada y sombras bajo cada mechón. Orejas y cuello a la vista.
const CLASSIC_DOWN = [
  '.....hhHHHH.....',
  '...hhHHHHHHHd...',
  '..hHHHHHHdHHHHd.',
  '..HHHHHdHHHHHHd.',
  '...HHHHdHHHHd...',
  '...H.Hd......d..',
  '...d........d...',
]
const CLASSIC_SIDE = [
  '.....hhHHHH.....',
  '...hhHHHHHHHd...',
  '..hHHHHHHHHHHd..',
  '..HHHHHdHHHHHd..',
  '...HHHHHdHHHHd..',
  '...HHHd...Hd....',
  '...HHHd.........',
  '...HHd..........',
  '...Hd...........',
]

function classicHair(kind, B, F) {
  if (kind === 'down') return stampRows(F, 0, CLASSIC_DOWN)
  if (kind === 'side') return stampRows(F, 0, CLASSIC_SIDE)
  stampRows(F, 0, [
    '.....hhHHHH.....',
    '...hhHHHHHHHd...',
    '..hHHHHHHHHHHd..',
    '..HHhHHdHHHHHd..',
  ])
  rect(F, 3, 4, 12, 7)
  ;[[7, 3], [7, 4], [8, 5], [8, 6], [11, 5], [11, 6], [12, 7]].forEach(([x, y]) => put(F, x, y, 'd'))
  rect(F, 4, 8, 11, 8)
  ;[[6, 8], [9, 8], [5, 9], [8, 9], [10, 9]].forEach(([x, y]) => put(F, x, y, y === 9 ? 'H' : 'd'))
}

const SHAPED = {
  largo: longHair,
  cortoClasico: classicHair,
  bob(kind, B, F) {
    if (kind === 'side') return stampRows(F, 0, BOB_SIDE)
    if (kind === 'up') {
      stampRows(F, 0, BOB_MASS)
      return stampRows(F, 1, BOB_DETAIL)
    }
    stampRows(B, 0, BOB_MASS)
    stampRows(B, 1, BOB_DETAIL)
    stampRows(F, 3, BOB_FRINGE)
  },
}

// Raíz oscura de la melena de Lupe, que se aclara poco a poco hasta el rubio a media melena (la
// melena acaba en la fila 21). Cada tramo alterna celdas con el siguiente, en tablero, para que el
// degradado no se lea como franjas rectas: raíz hasta la fila 3, mezcla de raíz y tono intermedio en
// la 4 y la 5, intermedio de la 6 a la 8, mezcla de intermedio y rubio de la 9 a la 11 y, más rala,
// en la 12. Se aplica a todas las capas y vistas.
function rootLetter(x, y) {
  const odd = (x + y) % 2 === 0
  if (y <= 3) return 'I'
  if (y <= 5) return odd ? 'I' : 'i'
  if (y <= 8) return 'i'
  if (y <= 11) return odd ? 'i' : null
  if (y === 12) return (x + y) % 4 === 0 ? 'i' : null
  return null
}

function darkRoots(layers) {
  layers.forEach((layer) =>
    layer.forEach((_, k) => {
      const [x, y] = k.split(',').map(Number)
      const letter = rootLetter(x, y)
      if (letter) layer.set(k, letter)
    }),
  )
}

// Borde exterior de la melena de Lupe vista de frente, de la fila 9 a la 17.
const LUPE_FRONT_EDGE = [1, 0, 0, 1, 1, 0, 0, 1, 1]

// Forma de la melena de Lupe, sin la raíz.
function lupeMane(kind, B, F, M) {
  if (kind === 'side') return sideLong(B, M, F, { wave: true })
  rect(F, 5, 0, 10, 0)
  rect(F, 3, 1, 12, 1)
  rect(F, 2, 2, 13, 3)
  if (kind === 'up') {
    // Ancha alrededor de la cabeza y sobre los hombros; más abajo se recoge para dejar ver los brazos.
    rect(F, 1, 4, 14, 11)
    rect(F, 2, 12, 13, 14)
    for (let y = 15; y <= 19; y++) {
      const a = WAVE[(y - 15) % 4] >> 1
      rect(F, 3 + a, y, 12 - a, y)
    }
    rect(F, 4, 20, 11, 20)
    rect(F, 5, 21, 6, 21)
    rect(F, 9, 21, 10, 21)
    return
  }
  // Cortina a cada lado de la raya: se abre sobre la frente y baja por fuera de las mejillas, sin
  // estrechar la cara. Sobre los hombros cae un mechón que deja a la vista la manga y la mano.
  mir(F, 2, 4, 5, 4)
  mir(F, 1, 4, 3, 5)
  mir(F, 1, 6, 2, 8)
  LUPE_FRONT_EDGE.forEach((edge, i) => {
    const y = 9 + i
    mir(F, edge, y, y === 12 || y === 13 ? 4 : 2, y)
  })
  put(F, 1, 18)
  put(F, 14, 18)
  rect(B, 2, 5, 13, 17)
}

const STYLES = {
  // Pixie: muy corto, con mechones sueltos en la frente; orejas y cuello a la vista.
  pixie(kind, B, F) {
    rect(F, 5, 0, 10, 0)
    rect(F, 3, 1, 12, 1)
    rect(F, 2, 2, 13, 3)
    if (kind === 'side') {
      rect(F, 3, 4, 12, 4)
      put(F, 13, 4)
      rect(F, 3, 5, 6, 9)
      rect(F, 10, 5, 10, 6)
      return
    }
    if (kind === 'up') {
      rect(F, 3, 4, 12, 8)
      rect(F, 4, 9, 11, 9)
      return
    }
    rect(F, 3, 4, 5, 4)
    rect(F, 7, 4, 9, 4)
    rect(F, 11, 4, 12, 4)
    ;[4, 8, 11].forEach((x) => put(F, x, 5))
    rect(B, 4, 5, 11, 9)
  },

  // Largo ondulado: más ancho que el liso y con la melena en zigzag.
  ondulado(kind, B, F, _left, M) {
    if (kind === 'side') return sideLong(B, M, F, { wave: true })
    rect(F, 5, 0, 10, 0)
    rect(F, 3, 1, 12, 1)
    rect(F, 2, 2, 13, 4)
    if (kind === 'up') {
      rect(F, 2, 5, 13, 12)
      for (let y = 13; y <= 21; y++) {
        const a = WAVE[(y - 13) % 4]
        rect(F, 3 + a, y, 12 - a, y)
      }
      return
    }
    mir(F, 2, 5, 4, 12)
    for (let y = 13; y <= 21; y++) {
      const a = WAVE[(y - 13) % 4]
      rect(F, a, y, a + 1, y)
      rect(F, 14 - a, y, 15 - a, y)
    }
    rect(B, 4, 6, 11, 12)
  },

  // Melena de Lupe: larga, abundante y ondulada, con raya al medio y la frente despejada. Solo la
  // lleva ella (no está en las listas del creador). De frente enmarca la cara y cae sobre los hombros
  // hasta la cintura sin tapar las manos; de espalda cubre la espalda hasta la cintura.
  melenaLupe(kind, B, F, _left, M) {
    lupeMane(kind, B, F, M)
    darkRoots([B, M, F])
    // La raya al medio se marca después de la raíz, que la taparía: sobre el castaño oscuro va en el
    // tono intermedio, más claro, como el cuero cabelludo que asoma. De espalda solo llega a la coronilla.
    if (kind === 'down') [1, 2, 3].forEach((y) => put(F, 8, y, 'i'))
    else if (kind === 'up') [0, 1, 2].forEach((y) => put(F, 8, y, 'i'))
  },

  // Corto rizado: casquete de bultos, rizos sobre la frente y junto a las orejas.
  rizadoCorto(kind, B, F) {
    if (kind === 'side') {
      rect(F, 5, 0, 6, 0)
      rect(F, 8, 0, 9, 0)
      rect(F, 4, 1, 12, 1)
      rect(F, 3, 2, 13, 3)
      rect(F, 3, 4, 5, 4)
      rect(F, 7, 4, 9, 4)
      rect(F, 11, 4, 13, 4)
      rect(F, 3, 5, 8, 8)
      put(F, 9, 5)
      return
    }
    ;[[4, 5], [7, 8], [10, 11]].forEach(([a, b]) => rect(F, a, 0, b, 0))
    rect(F, 3, 1, 12, 1)
    rect(F, 2, 2, 13, 3)
    if (kind === 'up') {
      rect(F, 2, 4, 13, 8)
      ;[3, 6, 9, 12].forEach((x) => put(F, x, 9))
      return
    }
    rect(F, 2, 4, 4, 4)
    rect(F, 6, 4, 9, 4)
    rect(F, 11, 4, 13, 4)
    ;[3, 4, 6, 9, 11, 12].forEach((x) => put(F, x, 5))
    mir(F, 2, 6, 3, 7)
    mir(F, 3, 8, 3, 8)
    rect(B, 4, 6, 11, 9)
  },

  // Rizado voluminoso: nube de rizos mucho más ancha que la cabeza, sin longitud.
  voluminoso(kind, B, F) {
    if (kind === 'side') {
      rect(F, 3, -1, 11, -1)
      rect(F, 2, 0, 12, 0)
      rect(F, 1, 1, 13, 4)
      rect(F, 0, 2, 0, 7)
      rect(F, 1, 5, 9, 9)
      rect(F, 2, 10, 6, 11)
      return
    }
    rect(F, 4, -1, 11, -1)
    rect(F, 2, 0, 13, 0)
    rect(F, 1, 1, 14, 1)
    rect(F, 0, 2, 15, 4)
    if (kind === 'up') {
      rect(F, 0, 5, 15, 9)
      rect(F, 1, 10, 14, 10)
      rect(F, 3, 11, 12, 11)
      return
    }
    rect(F, 0, 5, 3, 5)
    rect(F, 12, 5, 15, 5)
    rect(F, 5, 5, 10, 5)
    mir(F, 0, 6, 3, 8)
    mir(F, 1, 9, 3, 9)
    mir(F, 2, 10, 3, 10)
    mir(F, 3, 11, 3, 11)
    rect(B, 2, 3, 13, 10)
  },

  // Coleta alta: pelo tirante, orejas y cuello a la vista; la cola sube sobre la cabeza y cae a un lado.
  colaAlta(kind, B, F) {
    if (kind === 'side') {
      capSide(F, { tight: true })
      put(F, 4, 0, 'T')
      rect(F, 2, -4, 4, -4)
      rect(F, 1, -3, 5, -3)
      rect(F, 1, -2, 4, -2)
      rect(F, 1, -1, 3, -1)
      rect(F, 0, 0, 2, 1)
      rect(F, 0, 2, 1, 5)
      put(F, 0, 6)
      rect(B, 3, 5, 6, 8)
      return
    }
    capDown(F, { tight: true })
    if (kind === 'up') {
      // La cola sale de la coronilla, sube y cae por detrás hasta la fila 6, igual que de perfil. Va
      // del mismo color que el casquete, así que la recortan una sombra a cada lado y la goma.
      napeUp(F)
      rect(F, 7, -4, 8, -4)
      rect(F, 6, -3, 9, 6)
      rect(F, 7, 7, 8, 7)
      rect(F, 6, 0, 9, 0, 'T')
      for (let y = 1; y <= 6; y++) [5, 10].forEach((x) => put(F, x, y, 'd'))
      ;[6, 9].forEach((x) => put(F, x, 7, 'd'))
      return
    }
    rect(F, 7, -1, 8, -1, 'T')
    rect(F, 9, -4, 10, -4)
    rect(F, 8, -3, 11, -3)
    rect(F, 8, -2, 12, -2)
    rect(F, 9, -1, 12, -1)
    rect(F, 12, 0, 13, 0)
    rect(F, 13, 1, 14, 2)
    rect(F, 14, 3, 14, 5)
    rect(B, 4, 5, 11, 8)
  },

  // Coleta baja: recogida a la nuca, la cola cae por delante del hombro derecho.
  colaBaja(kind, B, F) {
    if (kind === 'side') {
      capSide(F, { tight: true })
      rect(F, 3, 5, 7, 9)
      put(F, 4, 9, 'T')
      rect(F, 2, 10, 5, 12)
      rect(B, 1, 13, 4, 18)
      return
    }
    capDown(F, { tight: true })
    if (kind === 'up') {
      rect(F, 3, 4, 12, 10)
      rect(F, 7, 10, 8, 10, 'T')
      rect(F, 7, 11, 8, 12)
      rect(F, 6, 13, 9, 17)
      rect(F, 7, 18, 8, 19)
      return
    }
    put(F, 4, 5)
    put(F, 11, 5)
    rect(F, 11, 9, 12, 9, 'T')
    rect(F, 12, 10, 13, 10)
    rect(F, 11, 11, 13, 12)
    rect(F, 12, 13, 14, 15)
    rect(F, 13, 16, 14, 17)
    put(F, 14, 18)
    rect(B, 4, 5, 11, 10)
  },

  // Dos coletas: dos mechones sueltos a los lados de la cabeza, separados por una goma.
  coletas(kind, B, F) {
    if (kind === 'side') {
      // De perfil se ve la coleta del lado que mira a cámara, a la misma altura que de frente (filas
      // 1 a 8). Nace tras la oreja, con la goma delante, y sobresale por la nuca para que se lea en
      // la silueta; detrás de la cabeza, como estaba, parecía una sola cola de caballo.
      capSide(F, { tight: true })
      rect(F, 3, 5, 6, 7)
      rect(F, 2, 1, 4, 1)
      rect(F, 1, 2, 5, 4)
      rect(F, 1, 5, 4, 6)
      rect(F, 2, 7, 3, 8)
      rect(F, 6, 2, 6, 3, 'T')
      ;[[5, 4], [4, 5], [4, 6], [3, 7], [3, 8]].forEach(([x, y]) => put(F, x, y, 'd'))
      return
    }
    capDown(F, { tight: true })
    mir(F, 1, 1, 2, 1)
    mir(F, 0, 2, 1, 2)
    put(F, 2, 2, 'T')
    put(F, 13, 2, 'T')
    mir(F, 0, 3, 2, 4)
    mir(F, 1, 5, 2, 6)
    mir(F, 1, 7, 1, 8)
    if (kind === 'up') napeUp(F)
    else rect(B, 4, 5, 11, 8)
  },

  // Dos trenzas segmentadas que caen por delante de los hombros.
  trenzas(kind, B, F) {
    if (kind === 'side') {
      capSide(F)
      rect(F, 3, 5, 9, 8)
      braid(F, 8, 9, 20)
      return
    }
    capDown(F)
    if (kind === 'up') {
      // Las trenzas caen por delante de los hombros: por detrás solo asoma su arranque junto
      // al cuello, en la capa trasera para que los hombros lo tapen. La raya queda en sombra.
      rect(F, 3, 5, 12, 9)
      rect(F, 4, 10, 11, 10)
      for (let y = 1; y <= 9; y++) put(F, 8, y, 'd')
      braid(B, 2, 9, 11)
      braid(B, 12, 9, 11)
      return
    }
    mir(F, 3, 5, 4, 8)
    braid(F, 2, 9, 20)
    braid(F, 12, 9, 20)
    rect(B, 4, 6, 11, 9)
  },

  // Moño alto: pelo tirante y un moño redondo sobre la cabeza, atado con una goma.
  rodete(kind, B, F) {
    if (kind === 'side') {
      capSide(F, { tight: true })
      rect(F, 4, -4, 7, -4)
      rect(F, 3, -3, 8, -2)
      rect(F, 4, -1, 7, -1, 'T')
      rect(B, 3, 5, 6, 8)
      return
    }
    capDown(F, { tight: true })
    rect(F, 6, -4, 9, -4)
    rect(F, 5, -3, 10, -2)
    rect(F, 6, -1, 9, -1, 'T')
    if (kind === 'up') napeUp(F)
    else rect(B, 4, 5, 11, 8)
  },

  // Rapado lateral: flequillo largo barrido a un lado y el otro lado rapado.
  rapado(kind, B, F, left) {
    if (kind === 'side') {
      rect(F, 5, 0, 10, 0)
      rect(F, 3, 1, 13, 1)
      rect(F, 3, 2, 14, 3)
      rect(F, 3, 4, 13, 4)
      rect(F, 3, 5, 9, 10)
      if (left) rect(F, 3, 8, 6, 10, 'z')
      return
    }
    if (kind === 'up') {
      rect(F, 5, 0, 10, 0)
      rect(F, 4, 1, 11, 1)
      rect(F, 3, 2, 12, 9)
      rect(F, 3, 4, 6, 9, 'z')
      return
    }
    rect(F, 4, 0, 8, 0)
    rect(F, 3, 1, 9, 1)
    rect(F, 2, 2, 9, 3)
    rect(F, 2, 4, 9, 4)
    rect(F, 2, 5, 6, 5)
    rect(F, 2, 6, 4, 9)
    rect(F, 3, 10, 5, 10)
    rect(F, 10, 1, 11, 1, 'z')
    rect(F, 10, 2, 12, 3, 'z')
    rect(F, 11, 4, 12, 5, 'z')
    rect(B, 4, 5, 9, 9)
    rect(B, 10, 6, 11, 9, 'z')
  },

  // Rapado: pelo a máquina, pegado al cráneo, con la línea de la frente alta y las orejas libres.
  rasurado(kind, B, F) {
    rect(F, 5, 0, 10, 0)
    rect(F, 4, 1, 11, 1)
    if (kind === 'side') {
      rect(F, 3, 2, 13, 3)
      rect(F, 3, 4, 7, 8)
      return
    }
    rect(F, 3, 2, 12, 3)
    if (kind === 'up') {
      rect(F, 3, 4, 12, 7)
      rect(F, 4, 8, 11, 8)
      return
    }
    ;[3, 12].forEach((x) => put(F, x, 4))
  },

  // De punta: pelo corto con mechones que se levantan en picos de distinta altura.
  dePunta(kind, B, F) {
    // Una base ancha y, encima, picos sueltos de dos alturas.
    const spikes = (profile) => {
      rect(F, profile ? 5 : 3, -1, 12, -1)
      ;(profile ? [5, 7, 8, 10, 12] : [4, 6, 7, 9, 11]).forEach((x) => put(F, x, -2))
      ;(profile ? [8, 12] : [7, 11]).forEach((x) => put(F, x, -3))
    }
    if (kind === 'side') {
      spikes(true)
      rect(F, 5, 0, 10, 0)
      rect(F, 3, 1, 12, 1)
      rect(F, 2, 2, 13, 3)
      rect(F, 3, 4, 12, 4)
      rect(F, 3, 5, 6, 8)
      return
    }
    spikes(false)
    rect(F, 4, 0, 11, 0)
    rect(F, 3, 1, 12, 1)
    rect(F, 2, 2, 13, 3)
    if (kind === 'up') {
      rect(F, 2, 4, 13, 8)
      rect(F, 3, 9, 12, 9)
      return
    }
    ;[3, 4, 7, 8, 11, 12].forEach((x) => put(F, x, 4))
    ;[3, 12].forEach((x) => put(F, x, 5))
  },

  // Flequillo largo: un mechón largo barrido sobre un lado de la cara que le tapa el ojo.
  flequilloLargo(kind, B, F) {
    rect(F, 5, 0, 10, 0)
    rect(F, 3, 1, 12, 1)
    rect(F, 2, 2, 13, 3)
    if (kind === 'side') {
      rect(F, 3, 4, 13, 4)
      rect(F, 3, 5, 6, 9)
      rect(F, 10, 5, 13, 6)
      return
    }
    if (kind === 'up') {
      rect(F, 2, 4, 13, 8)
      rect(F, 3, 9, 12, 9)
      return
    }
    rect(F, 2, 4, 8, 4)
    rect(F, 2, 5, 7, 5)
    rect(F, 2, 6, 6, 8)
    rect(F, 12, 4, 13, 4)
    put(F, 12, 5)
  },

  // Afro: una esfera de rizos mucho más ancha y alta que la cabeza.
  afro(kind, B, F) {
    if (kind === 'side') {
      rect(F, 3, -3, 11, -3)
      rect(F, 1, -2, 12, -2)
      rect(F, 0, -1, 13, -1)
      rect(F, 0, 0, 14, 3)
      rect(F, 0, 4, 12, 4)
      rect(F, 0, 5, 8, 9)
      rect(F, 1, 10, 7, 10)
      return
    }
    rect(F, 4, -3, 11, -3)
    rect(F, 2, -2, 13, -2)
    rect(F, 1, -1, 14, -1)
    rect(F, 0, 0, 15, 3)
    if (kind === 'up') {
      rect(F, 0, 4, 15, 9)
      rect(F, 1, 10, 14, 10)
      rect(F, 3, 11, 12, 11)
      return
    }
    mir(F, 0, 4, 3, 4)
    mir(F, 0, 5, 2, 7)
    mir(F, 1, 8, 2, 9)
    rect(B, 2, 4, 13, 10)
  },

  // Degradado: mucho volumen arriba y los lados rapados, con un tono intermedio hacia las orejas.
  degradado(kind, B, F) {
    rect(F, 4, -1, 11, -1)
    rect(F, 3, 0, 12, 3)
    if (kind === 'side') {
      rect(F, 3, 4, 12, 4)
      rect(F, 3, 5, 7, 6)
      rect(F, 3, 7, 8, 8, 'z')
      return
    }
    if (kind === 'up') {
      rect(F, 3, 4, 12, 5)
      rect(F, 3, 6, 12, 8, 'z')
      return
    }
    rect(F, 3, 4, 3, 6, 'z')
    rect(F, 12, 4, 12, 6, 'z')
    rect(F, 4, 4, 11, 4)
  },

  // Tupé: el flequillo se levanta hacia delante y se riza en la punta.
  tupe(kind, B, F) {
    if (kind === 'side') {
      rect(F, 8, -3, 13, -3)
      rect(F, 12, -4, 14, -4)
      rect(F, 6, -2, 14, -2)
      rect(F, 5, -1, 14, -1)
      rect(F, 4, 0, 13, 0)
      rect(F, 3, 1, 13, 3)
      rect(F, 3, 4, 12, 4)
      rect(F, 3, 5, 6, 8)
      return
    }
    rect(F, 7, -3, 11, -3)
    rect(F, 11, -4, 13, -4)
    rect(F, 5, -2, 13, -2)
    rect(F, 4, -1, 13, -1)
    rect(F, 3, 0, 12, 1)
    rect(F, 2, 2, 13, 3)
    if (kind === 'up') {
      rect(F, 2, 4, 13, 8)
      rect(F, 4, 9, 11, 9)
      return
    }
    rect(F, 3, 4, 4, 4)
    rect(F, 11, 4, 12, 4)
  },

  // Media melena: raya al medio y el pelo cae a los lados hasta los hombros.
  mediaMelena(kind, B, F) {
    if (kind === 'side') {
      capSide(F)
      rect(F, 3, 5, 9, 10)
      rect(B, 2, 11, 7, 14)
      return
    }
    capDown(F)
    if (kind === 'up') {
      rect(F, 3, 5, 12, 12)
      rect(F, 4, 13, 11, 14)
      return
    }
    mir(F, 3, 5, 4, 10)
    mir(F, 2, 11, 3, 14)
    rect(B, 4, 6, 11, 12)
    ;[7, 8].forEach((x) => put(F, x, 1, 'd'))
  },

  // Cresta: una franja alta de pelo en el centro y los lados rapados.
  cresta(kind, B, F) {
    if (kind === 'side') {
      rect(F, 4, -3, 12, -1)
      rect(F, 4, 0, 12, 0)
      rect(F, 3, 1, 13, 4, 'z')
      rect(F, 3, 5, 6, 8, 'z')
      return
    }
    rect(F, 7, -4, 8, -4)
    rect(F, 6, -3, 9, -1)
    rect(F, 5, 0, 10, 3)
    rect(F, 3, 2, 4, 4, 'z')
    rect(F, 11, 2, 12, 4, 'z')
    put(F, 4, 1, 'z')
    put(F, 11, 1, 'z')
    if (kind === 'up') rect(F, 3, 5, 12, 8, 'z')
  },
}

// Textura de cada peinado: cómo se reparten reflejos y sombras dentro de la masa de pelo.
const TEXTURE = {
  ondulado: 'waves',
  melenaLupe: 'locks',
  rizadoCorto: 'curls',
  voluminoso: 'curls',
  afro: 'curls',
}

export const HAIR_STYLE_IDS = [...Object.keys(SHAPED), ...Object.keys(STYLES)]

// Reflejos arriba a la izquierda, sombra en el borde derecho y un patrón según la textura. Las
// celdas que ya traen letra propia (goma, rapado) no se tocan.
function finish(m, all, texture) {
  m.forEach((ch, k) => {
    if (ch !== 'H') return
    const [x, y] = k.split(',').map(Number)
    const up = all.has(key(x, y - 1))
    const left = all.has(key(x - 1, y))
    const right = all.has(key(x + 1, y))
    let out = 'H'
    if (texture === 'strands' && y >= 5 && x % 3 === 0) out = 'd'
    else if (texture === 'waves' && y >= 2 && (x + (y >> 1)) % 3 === 0) out = 'd'
    // Mechones largos que serpentean: una línea de sombra cada cuatro columnas que sigue la onda.
    else if (texture === 'locks' && y >= 4 && (x + WAVE[y % 4]) % 4 === 0) out = 'd'
    else if (texture === 'curls') {
      // Rizos en racimos de cuatro columnas: brillo arriba de cada uno y sombra bajo él.
      const u = (x + (Math.floor(y / 3) % 2) * 2) % 4
      const v = y % 3
      if (v === 0 && u === 1) out = 'h'
      else if (v === 2 && u === 3) out = 'd'
    }
    if (out === 'H' && !up && left && x < 8 && (x + y) % 2 === 0) out = 'h'
    else if (out === 'H' && !right && left && x > 8) out = 'd'
    m.set(k, out)
  })
}

const toCells = (m) =>
  [...m].map(([k, ch]) => {
    const [x, y] = k.split(',').map(Number)
    return { x, y, ch }
  })

// Celdas del peinado en la vista `view` ('down', 'up' o 'side'): primero las traseras y luego las
// delanteras. `left` marca el perfil izquierdo, para lo que no se puede reflejar.
export function hairCells(style, view, { left = false } = {}) {
  const B = new Map()
  const M = new Map()
  const F = new Map()
  const layers = () => ({ back: toCells(B), mid: toCells(M), front: toCells(F) })
  if (SHAPED[style]) {
    SHAPED[style](view, B, F, left, M)
    return layers()
  }
  const build = STYLES[style]
  if (!build) return { back: [], mid: [], front: [] }
  build(view, B, F, left, M)
  const all = new Map([...B, ...M, ...F])
  ;[B, M, F].forEach((layer) => finish(layer, all, TEXTURE[style]))
  return layers()
}
