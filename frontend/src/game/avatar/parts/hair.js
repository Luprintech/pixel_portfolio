// Peinados. Cada uno es una forma propia (no una variante del mismo pelo) y se dibuja por separado
// para frente (`down`), espalda (`up`) y perfil derecho (`side`), en dos capas:
//   back   detrás del cuerpo y de la cabeza (melena que cae por la espalda, base de una coleta)
//   front  por encima de la cabeza (flequillo, mechas junto a la cara, coletas, trenzas, moños)
// Las celdas son `{ x, y, ch }` en la rejilla de 16 columnas; la fila 0 es la primera de la cabeza
// y las negativas sobresalen por arriba (hasta -4). El perfil izquierdo es el derecho reflejado,
// salvo en lo que no es simétrico (el rapado lateral solo se ve de un lado): `left` lo indica.
//
// Letras: H pelo, h reflejo, d sombra, T goma o lazo, z rapado (mezcla de pelo y piel).
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

const SHAPED = {
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

const STYLES = {
  // Largo liso: cae recto a los lados de la cara, tapa las orejas y llega a la cintura.
  largo(kind, B, F) {
    if (kind === 'side') {
      capSide(F)
      rect(F, 3, 5, 9, 12)
      rect(B, 2, 13, 6, 21)
      return
    }
    capDown(F)
    if (kind === 'up') {
      rect(F, 3, 5, 12, 12)
      rect(F, 4, 13, 11, 20)
      rect(F, 5, 21, 10, 21)
      return
    }
    mir(F, 3, 5, 4, 11)
    mir(F, 2, 12, 4, 12)
    mir(F, 1, 13, 2, 21)
    rect(B, 4, 6, 11, 12)
  },

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
  ondulado(kind, B, F) {
    if (kind === 'side') {
      rect(F, 5, 0, 10, 0)
      rect(F, 3, 1, 12, 1)
      rect(F, 2, 2, 13, 3)
      rect(F, 2, 4, 12, 4)
      rect(F, 2, 5, 9, 12)
      for (let y = 13; y <= 21; y++) {
        const a = WAVE[(y - 13) % 4]
        rect(B, 1 + a, y, 5 + a, y)
      }
      return
    }
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
      rect(F, 3, 4, 12, 8)
      rect(F, 7, 1, 8, 1, 'T')
      rect(F, 7, 2, 8, 2)
      rect(F, 6, 3, 9, 9)
      rect(F, 7, 10, 8, 12)
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
      capSide(F, { tight: true })
      rect(F, 3, 5, 6, 7)
      put(F, 3, 2, 'T')
      rect(F, 0, 1, 2, 1)
      rect(F, 0, 2, 2, 5)
      rect(F, 0, 6, 1, 8)
      put(F, 1, 9)
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
    if (kind === 'up') rect(F, 3, 4, 12, 8)
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
      rect(F, 3, 5, 12, 10)
      braid(F, 5, 11, 22)
      braid(F, 9, 11, 22)
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
    if (kind === 'up') rect(F, 3, 4, 12, 8)
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

  // Corto clásico: raya a un lado, flequillo corto peinado y patillas; orejas a la vista.
  cortoClasico(kind, B, F) {
    rect(F, 5, 0, 10, 0)
    rect(F, 3, 1, 12, 1)
    rect(F, 2, 2, 13, 3)
    if (kind === 'side') {
      rect(F, 3, 4, 12, 4)
      put(F, 13, 4)
      rect(F, 3, 5, 6, 8)
      rect(F, 10, 5, 10, 5)
      return
    }
    if (kind === 'up') {
      rect(F, 3, 4, 12, 7)
      rect(F, 4, 8, 11, 8)
      ;[1, 2].forEach((y) => put(F, 10, y, 'd'))
      return
    }
    rect(F, 3, 4, 7, 4)
    put(F, 12, 4)
    ;[3, 12].forEach((x) => rect(F, x, 5, x, 6))
    ;[1, 2].forEach((y) => put(F, 9, y, 'd'))
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
  largo: 'strands',
  ondulado: 'waves',
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
    else if (texture === 'curls') {
      if ((x + y) % 3 === 0) out = 'h'
      else if ((x * 2 + y) % 5 === 0) out = 'd'
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
  const F = new Map()
  if (SHAPED[style]) {
    SHAPED[style](view, B, F)
    return { back: toCells(B), front: toCells(F) }
  }
  const build = STYLES[style]
  if (!build) return { back: [], front: [] }
  build(view, B, F, left)
  const all = new Map([...B, ...F])
  finish(B, all, TEXTURE[style])
  finish(F, all, TEXTURE[style])
  return { back: toCells(B), front: toCells(F) }
}
