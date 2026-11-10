// Complementos. Se pintan por encima del pelo y, salvo los que cubren la cabeza (gorra, gorro,
// pañuelo y sombreros), se suman sin quitar nada: esos sustituyen la parte de arriba del peinado,
// también lo que sobresale, como un moño. Lo que se lleva en un solo lado de la cabeza (lazo,
// horquillas, nudo del pañuelo) solo se ve en el perfil que enseña ese lado, el izquierdo; el
// derecho lo deja en la otra cara, tapado.
//
// Cada complemento es una función de `ACCESSORIES` que recibe un pequeño pincel (`add`, `rect`) y la
// vista. Letras: A color del complemento, a su sombra, T ribete, G montura y plástico oscuro,
// W blanco, Y dorado fijo.

// Casquete de gorro, gorra y pañuelo; la última columna de cada fila va en sombra.
const DOME_SIDE = [[5, 10], [4, 12], [3, 13], [3, 13]]
const DOME_FRONT = [[5, 10], [4, 11], [3, 12], [3, 12]]

// Gafas: una montura de 4×5 por ojo, con el blanco y la pupila dentro y un puente que las une. Las
// redondas pierden las cuatro esquinas.
function glasses({ rect, add, view, round }) {
  if (view === 'up') return
  const corner = round ? 1 : 0
  if (view === 'down') {
    ;[[3, 6], [9, 12]].forEach(([a, b]) => {
      rect(a + corner, 5, b - corner, 5, 'G')
      rect(a + corner, 9, b - corner, 9, 'G')
      ;[6, 7, 8].forEach((y) => {
        add(a, y, 'G')
        add(b, y, 'G')
      })
    })
    return rect(7, 6, 8, 6, 'G')
  }
  rect(10 + corner, 4, 13 - corner, 4, 'G')
  rect(10 + corner, 8, 13 - corner, 8, 'G')
  ;[5, 6, 7].forEach((y) => {
    add(10, y, 'G')
    add(13, y, 'G')
  })
  rect(6, 5, 9, 5, 'G')
}

function sunglasses({ rect, add, view }) {
  if (view === 'up') return
  if (view === 'down') {
    rect(3, 5, 6, 8, 'G')
    rect(9, 5, 12, 8, 'G')
    rect(7, 6, 8, 6, 'G')
    add(4, 5, 'W')
    return add(10, 5, 'W')
  }
  rect(10, 4, 13, 7, 'G')
  rect(6, 5, 9, 5, 'G')
  add(11, 4, 'W')
}

function studs({ add, view, side }) {
  if (view === 'down') [[3, 9], [12, 9], [3, 10], [12, 10]].forEach(([x, y]) => add(x, y, 'A'))
  else if (side) [[9, 9], [9, 10]].forEach(([x, y]) => add(x, y, 'A'))
}

// Aros: un lazo que cuelga del lóbulo y sobresale de la cara.
function hoops({ add, view, side }) {
  if (view === 'down') [[3, 9], [2, 10], [2, 11], [3, 12], [12, 9], [13, 10], [13, 11], [12, 12]].forEach(([x, y]) => add(x, y, 'A'))
  else if (side) [[9, 9], [8, 10], [8, 11], [9, 12]].forEach(([x, y]) => add(x, y, 'A'))
}

function nosePiercing({ add, view }) {
  if (view === 'down') add(9, 9, 'Y')
  else if (view === 'side') add(13, 9, 'Y')
}

// Auriculares: arco sobre la cabeza y una almohadilla en cada oreja, con una franja de color.
function headphones({ add, rect, view }) {
  if (view !== 'side') {
    rect(5, -1, 10, -1, 'G')
    ;[3, 4, 11, 12].forEach((x) => add(x, 0, 'G'))
    ;[2, 13].forEach((x) => rect(x, 1, x, 5, 'G'))
    rect(1, 6, 3, 10, 'G')
    rect(12, 6, 14, 10, 'G')
    rect(2, 7, 2, 9, 'A')
    return rect(13, 7, 13, 9, 'A')
  }
  rect(8, -1, 9, 5, 'G')
  rect(6, 6, 10, 10, 'G')
  rect(7, 7, 9, 9, 'A')
}

// Diadema: un arco fino que sigue el borde del pelo, de oreja a oreja.
function headband({ add, rect }) {
  rect(5, 1, 10, 1, 'A')
  ;[4, 11].forEach((x) => add(x, 2, 'A'))
  ;[3, 12].forEach((x) => add(x, 3, 'A'))
}

function bow({ add, side, left }) {
  if (side && !left) return
  const x = side ? 4 : 10
  ;[[0, 1, 'A'], [1, 1, 'a'], [2, 1, 'A'], [0, 2, 'A'], [1, 2, 'a'], [2, 2, 'A']].forEach(([dx, y, ch]) => add(x + dx, y, ch))
}

// Horquillas: dos pasadores cortos y paralelos sobre la sien.
function hairClips({ add, rect, side, left }) {
  if (side && !left) return
  const x = side ? 5 : 10
  rect(x, 2, x + 1, 2, 'A')
  rect(x + 1, 3, x + 2, 3, 'A')
  add(x + 2, 2, 'a')
}

// Gorro de lana: casquete, vuelta del borde y pompón.
function beanie({ rect, dome, dropHairAbove, side }) {
  dropHairAbove()
  dome('A')
  rect(3, 4, side ? 13 : 12, 4, 'T')
  rect(side ? 6 : 7, -2, side ? 7 : 8, -1, 'T')
}

function cap({ rect, add, dome, dropHairAbove, side, view }) {
  dropHairAbove()
  dome('A')
  rect(side ? 3 : view === 'up' ? 4 : 3, 4, side ? 15 : view === 'up' ? 11 : 12, 4, 'a')
  add(7, -1, 'a')
}

// Pañuelo: casquete con lunares claros, cinta en la frente y un nudo en el lado izquierdo.
function bandana({ rect, add, dome, dropHairAbove, side, left, view }) {
  dropHairAbove()
  dome('A')
  ;[[5, 1], [8, 2], [10, 1], [6, 3], [11, 3]].forEach(([x, y]) => add(x, y, 'W'))
  rect(3, 4, side ? 13 : 12, 4, 'a')
  if (side && !left) return
  // De perfil el nudo empieza en la 3: con la cabeza una columna atrás, desde la 2 perdía dos celdas.
  const x = side ? 3 : view === 'up' ? 1 : 13
  const dir = side || view === 'up' ? -1 : 1
  ;[[0, 3], [dir, 4], [2 * dir, 4], [dir, 5], [2 * dir, 6]].forEach(([dx, y]) => add(x + dx, y, y === 3 ? 'A' : 'a'))
  add(x + dir, 3, 'A')
}

// Sombreros: copa y ala. El ala es más ancha que la cabeza y la sombra debajo tapa la frente. De
// perfil la cabeza va una columna más atrás (`headDx`) y la columna 0 queda fuera del lienzo, así que
// el ala empieza en la 1: el ala de abajo, una columna más corta por cada lado, en la 2.
function brim({ rect, side }) {
  const back = side ? 1 : 0
  rect(back, 2, 15, 2, 'A')
  rect(back + 1, 3, 14, 3, 'a')
}

function strawHat({ rect, add, dropHairAbove, side }) {
  dropHairAbove()
  rect(5, -1, 10, -1, 'A')
  rect(4, 0, 11, 0, 'A')
  rect(4, 1, 11, 1, 'a')
  brim({ rect, side })
  add(5, -1, 'a')
}

// Sombrero de bruja: cono de punta caída, con una hebilla en la cinta.
function witchHat({ rect, add, dropHairAbove, side }) {
  dropHairAbove()
  ;[[1, 4, 11], [0, 5, 10], [-1, 6, 10], [-2, 6, 9], [-3, 7, 10], [-4, 10, 12]].forEach(([y, a, b]) => {
    rect(a, y, b - 1, y, 'A')
    add(b, y, 'a')
  })
  rect(4, 1, 11, 1, 'a')
  rect(7, 1, 8, 1, 'T')
  brim({ rect, side })
}

const ACCESSORIES = {
  gafas: (api) => glasses({ ...api, round: true }),
  gafasRect: (api) => glasses({ ...api, round: false }),
  gafasSol: sunglasses,
  pendientes: studs,
  aros: hoops,
  piercing: nosePiercing,
  auriculares: headphones,
  diadema: headband,
  lazo: bow,
  horquillas: hairClips,
  panuelo: bandana,
  gorra: cap,
  gorro: beanie,
  sombreroPaja: strawHat,
  sombreroBruja: witchHat,
}

// Devuelve el pelo con el complemento aplicado: `{ back, front }` de celdas `{ x, y, ch }`.
export function dressHair(look, { view, left }, hair) {
  const paint = ACCESSORIES[look.accessory]
  if (!paint) return hair
  const side = view === 'side'
  const front = hair.front.slice()
  let back = hair.back
  const add = (x, y, ch) => front.push({ x, y, ch })
  const rect = (x0, y0, x1, y1, ch) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) add(x, y, ch)
  }
  const dome = (ch) => {
    ;(side ? DOME_SIDE : DOME_FRONT).forEach(([a, b], y) => {
      rect(a, y, b - 1, y, ch)
      add(b, y, 'a')
    })
  }
  const dropHairAbove = () => {
    front.splice(0, front.length, ...front.filter((c) => c.y > 3))
    back = back.filter((c) => c.y > 3)
  }
  paint({ add, rect, dome, dropHairAbove, view, side, left })
  return { back, mid: hair.mid, front }
}
