// CPIFP Alan Turing dibujado en píxeles, copiando la fachada que aportó la usuaria: nave con la cubierta metálica curva, la
// cristalera alta con el cielo reflejado, los paneles grises con la placa azul y sus apliques, el muro inclinado con la alarma,
// el voladizo oscuro sobre la entrada acristalada (interior de madera iluminado y la franja azul), el bloque claro con la
// rejilla y el pavimento. Son dos capas, como con el PNG: la nave y, aparte, la marquesina azul y las mesas de madera, que van
// por delante de quien pasa a su lado. Conserva las medidas (208×63), la columna de la puerta y los cuerpos sólidos.
import { PAL } from '../palette.js'
import { dot, makeCanvas, rect } from '../pixelKit.js'
import { drawText } from '../pixelFont.js'
import { litPane } from './litPane.js'

export const CPIFP_FACADE = { w: 208, h: 63 }
const CPIFP_CANVAS_H = 64
const CPIFP_TOP = CPIFP_CANVAS_H - CPIFP_FACADE.h
// Centro de las puertas acristaladas, bajo el voladizo.
export const CPIFP_DOOR_COL = 144
// Cuerpos sólidos en píxeles de la fachada: el muro de la nave y el de la entrada (los pies llegan a su base, sobre el pavimento),
// la marquesina y las mesas. Entre la marquesina y las mesas queda libre el paso hasta las puertas.
export const CPIFP_BODIES = [
  { x: 0, y: 0, w: 91, h: 56 },
  { x: 91, y: 0, w: 117, h: 55 },
  { x: 90, y: 55, w: 25, h: 7 },
  { x: 151, y: 55, w: 47, h: 5 },
]
// Zona de `E` ante las puertas, sobre el pavimento: la salida del interior deja a la viajera donde la pulsó.
export const CPIFP_DOOR_ZONE = { x: CPIFP_DOOR_COL - 14, y: 55, w: 28, h: 14 }

// Colores sacados del PNG: el metal pizarra de la cubierta, el hormigón malva y el azul de la placa no están en la paleta.
const ROOF = ['#2d2b37', '#4f5165', '#636176', '#7d8197']
const GLASS = ['#8e8f99', '#b0afb2', '#d5cabc', '#e8e2d8']
const PANEL = ['#0e1e50', '#52535e', '#6f707b', '#85868f']
const PLATE = '#1e48aa'
const PLATE_INK = '#f0f4fa'
const WALL = ['#6a5b5b', '#847171', '#9a8888']
const SOFFIT = ['#292733', '#3f3335', '#70615f']
const WOOD = ['#3f2a20', '#6c402a', '#a8683c', '#d59d60']
const BAND = '#195492'
const MULLION = '#bdb5ac'
const BLOCK = ['#a5918a', '#cfbfb2', '#e4d8cc']
const PAVE = ['#635759', '#cdb6a7', '#e1cbb7']
const LAMP = '#fce3b7'

// Borde superior de la nave curva: en cada fila, la primera columna que ocupa (de la silueta del PNG).
const NAVE_TOP = [110, 105, 101, 96, 90, 85, 81, 76, 70, 65, 60, 55, 49, 44, 39, 35, 30, 25, 20, 15, 12, 11, 9, 8, 6, 4, 3, 1, 0]
// Borde derecho de la cubierta baja de la entrada, de la fila 4 a la 21.
const RIGHT_EDGE = [193, 194, 195, 197, 198, 199, 200, 202, 203, 204, 205, 207, 207, 207, 207, 207, 207, 207]

// Canto inferior de la cubierta de la derecha: baja en diagonal, así que la chapa se ve cada vez más gruesa hacia el extremo y
// el voladizo solo asoma por debajo. Pares [primera columna, fila], sacados del PNG.
const RIGHT_BOTTOM = [[171, 11], [173, 12], [175, 13], [177, 14], [187, 15], [191, 16], [195, 17], [198, 18], [201, 19], [205, 20]]
const rightRoofBottom = (x) => RIGHT_BOTTOM.reduce((row, [from, r]) => (x >= from ? r : row), 11)

// Fila donde empieza la cubierta en la columna `x`.
function roofTop(x) {
  if (x <= 110) return NAVE_TOP.findIndex((start) => start <= x)
  if (x <= 167) return 0
  if (x <= 170) return 1
  if (x <= 172) return 2
  if (x <= 174) return 3
  if (x <= 193) return 4
  return 4 + RIGHT_EDGE.findIndex((edge) => edge >= x)
}

// Grosor de la cubierta: la de la entrada, más alta, baja hasta el voladizo; en el extremo izquierdo dobla hacia abajo hasta la fila 33.
function roofDepth(x) {
  if (x > 100 && x < 175) return 12 - roofTop(x)
  if (x <= 2) return (x === 1 ? 34 : 33) - roofTop(x)
  if (x >= 206) return 7
  // El pie de la cubierta derecha baja hasta la fila 22 en las columnas 204 y 205, como en el PNG.
  if (x >= 204) return 23 - roofTop(x)
  if (x >= 168) return rightRoofBottom(x) - roofTop(x) + 1
  return 6
}

// Cubierta de chapa: canto superior continuo, grapas verticales (una oscura, una clara y una media) y el canto oscuro de abajo.
function roof(g) {
  for (let x = 0; x < CPIFP_FACADE.w; x++) {
    const top = roofTop(x)
    const depth = roofDepth(x)
    const seam = x % 3
    rect(g, x, top, 1, depth, seam === 0 ? ROOF[0] : seam === 1 ? ROOF[3] : ROOF[2])
    // Canto oscuro dentro de la silueta: la fila de arriba y el lateral de cada escalón, para que el borde se lea como en el PNG.
    dot(g, x, top, ROOF[0])
    const next = x < CPIFP_FACADE.w - 1 ? roofTop(x + 1) : top
    const prev = x > 0 ? roofTop(x - 1) : top
    if (next > top) rect(g, x, top, 1, next - top + 1, ROOF[0])
    if (prev > top) rect(g, x, top, 1, prev - top + 1, ROOF[0])
    rect(g, x, top + depth - 1, 1, 1, ROOF[0])
  }
}

// Diagonal oscura donde acaba la cristalera de la nave y empieza el paño inclinado de hormigón: baja de (105, 13) a (88, 34).
const slopeEdge = (y) => Math.round(88 + ((34 - y) * 17) / 21)

// Facetas del extremo curvo de la nave: columnas alternas claras y oscuras que se van ensanchando hacia el frente.
const CURVE_GLASS = ['#7c7880', '#c8c0b5', '#a9a3a7', '#d8cdbc', '#b9b3ae', '#c5b9b1', '#bcb6af', '#dbd1bd']
const CURVE_PANEL = ['#3b3947', '#52505a', '#74727f', '#636370', '#6d6b78']

function naveGlass(g, lit) {
  for (let x = 3; x <= 105; x++) {
    const start = roofTop(x) + roofDepth(x)
    if (start >= 40) continue
    rect(g, x, start, 1, 40 - start, x < 3 + CURVE_GLASS.length ? CURVE_GLASS[x - 3] : GLASS[1])
    // Reflejo cálido justo bajo el alero y dos franjas de cielo más abajo.
    rect(g, x, start, 1, Math.min(2, 40 - start), GLASS[2])
    if (x >= 11) for (let y = Math.max(start + 2, 25); y < 40; y++) if (y === 33 || y === 36) dot(g, x, y, GLASS[2])
  }
  ;[13, 30, 51, 68, 85].forEach((mx) => {
    const top = roofTop(mx) + roofDepth(mx)
    rect(g, mx, top, 1, 40 - top, MULLION)
    rect(g, mx + 1, top, 1, 40 - top, GLASS[0])
  })
  rect(g, 11, 40, 81, 1, PANEL[0])
  lit.push({ x: 11, y: 30, w: 79, h: 10, holes: [13, 30, 51, 68, 85].map((mx) => ({ x: mx - 11, y: 0, w: 2, h: 10 })) })
}

// Paneles grises de la parte baja de la nave, con la placa azul del nombre y los tres apliques sobre ella.
function navePanels(g) {
  rect(g, 3, 41, 89, 17, PANEL[2])
  rect(g, 4, 58, 88, 1, PANEL[2])
  rect(g, 8, 59, 84, 1, PANEL[2])
  rect(g, 3, 50, 89, 1, PANEL[1])
  ;[13, 30, 51, 68, 85].forEach((mx) => rect(g, mx, 41, 1, 18, PANEL[1]))
  CURVE_PANEL.forEach((color, i) => rect(g, 3 + i, 41, 1, 15, color))
  rect(g, 2, 33, 1, 23, PANEL[0])
  rect(g, 6, 57, 86, 1, PANEL[1])
  rect(g, 18, 42, 71, 9, PANEL[0])
  rect(g, 19, 43, 69, 7, PLATE)
  drawText(g, 20, 44, 'CPIFP ALAN TURING', PLATE_INK)
  ;[17, 54, 86].forEach((lx) => {
    rect(g, lx - 1, 39, 3, 1, PANEL[1])
    rect(g, lx - 1, 40, 3, 1, LAMP)
  })
}

// Diagonal derecha del paño inclinado, medida en el PNG: baja de (129, 12) a (111, 35). A su derecha empieza el voladizo (hasta la
// fila 22) y, más abajo, el interior del vestíbulo visto a través del cristal.
const slabRight = (y) => Math.round(129 - ((y - 12) * 18) / 23)

// Paño inclinado de hormigón entre la nave y la entrada: un paralelogramo entre las dos diagonales, con sus cantos oscuros, la
// alarma roja y la papelera al pie. Por debajo de la fila 35 sigue recto hasta la entrada.
function slopedWall(g) {
  for (let y = 12; y < 59; y++) {
    const left = Math.max(88, slopeEdge(y))
    const right = y <= 35 ? slabRight(y) : 117
    // Bajo el paño (fila 36 en adelante) la pared es de un gris más claro, separada por su canto.
    const tone = y === 36 ? WALL[0] : y > 36 ? '#aaa2a4' : y % 6 === 0 ? WALL[0] : WALL[1]
    rect(g, left, y, right - left + 1, 1, tone)
    if (y <= 34) dot(g, left, y, ROOF[0])
    if (y <= 35) dot(g, right, y, ROOF[0])
  }
  rect(g, 88, 35, 2, 24, WALL[2])
  rect(g, 92, 38, 2, 3, '#da655d')
  rect(g, 113, 56, 5, 4, PAL.teal)
  rect(g, 113, 56, 5, 1, PAL.lagoonLight)
}

// Voladizo oscuro sobre la entrada: arranca justo en la diagonal del paño inclinado y por la derecha llega hasta la cara
// interior de la cubierta, sin pisar el paño.
function overhang(g) {
  for (let y = 12; y <= 22; y++) {
    const left = slabRight(y) + 1
    rect(g, left, y, 204 - left, 1, y === 22 ? SOFFIT[2] : y >= 19 ? SOFFIT[1] : SOFFIT[0])
  }
}

// Cristalera de la entrada: detrás del cristal se ve el vestíbulo (techo de madera con tres lámparas colgadas y su halo, la pared
// de listones, los sofás azules y el suelo con el reflejo de las luces). Encima va el cristal: un velo frío muy leve y reflejos en
// diagonal en algunas hojas, y por último los montantes y el travesaño. Las puertas correderas quedan en el centro.
const ENTRY_MULLIONS = [118, 124, 130, 136, 143, 145, 152, 158, 164, 170, 175]
const LAMPS = [126, 144, 162]

function lobby(g) {
  rect(g, 118, 23, 58, 4, WOOD[0])
  rect(g, 118, 27, 58, 21, WOOD[1])
  for (let x = 118; x < 176; x += 4) rect(g, x, 27, 1, 21, WOOD[0])
  // Halo de cada lámpara en tres tonos, del centro claro a la madera.
  LAMPS.forEach((lx) => {
    for (let y = 27; y < 48; y++) {
      for (let x = lx - 9; x <= lx + 10; x++) {
        const d = ((x - lx - 0.5) / 6) ** 2 + ((y - 31) / 7) ** 2
        if (d < 0.15) dot(g, x, y, WOOD[3])
        else if (d < 0.4) dot(g, x, y, '#c08850')
        else if (d < 0.8) dot(g, x, y, WOOD[2])
      }
    }
    rect(g, lx, 23, 1, 5, WOOD[0])
    rect(g, lx - 1, 28, 3, 1, ROOF[0])
    rect(g, lx - 1, 29, 3, 1, LAMP)
  })
  // Zócalo de madera del fondo, más claro por la luz que cae de las lámparas.
  rect(g, 118, 41, 58, 6, WOOD[2])
  LAMPS.forEach((lx) => rect(g, lx - 4, 41, 9, 6, '#c08850'))
  rect(g, 118, 47, 58, 1, WOOD[0])
  for (let x = 118; x < 176; x += 7) {
    rect(g, x, 48, 6, 4, BAND)
    rect(g, x, 48, 6, 1, '#2f6fb0')
    rect(g, x + 6, 48, 1, 4, PANEL[0])
  }
  rect(g, 118, 52, 58, 7, '#333748')
  LAMPS.forEach((lx) => rect(g, lx - 1, 53, 3, 5, '#4d3a32'))
}

function glassPanes(g) {
  rect(g, 118, 23, 58, 36, 'rgba(190,210,235,0.06)')
  const panes = ENTRY_MULLIONS.slice(0, -1).map((mx, i) => [mx + 1, ENTRY_MULLIONS[i + 1] - mx - 1]).filter(([, w]) => w > 1)
  panes.forEach(([px, pw], i) => {
    if (i % 3 === 1) return
    for (let y = 0; y < 34; y++) {
      const x = px + pw - 1 - Math.floor(y / 2) + (i % 2) * 2
      if (x >= px && x < px + pw) dot(g, x, 24 + y, 'rgba(255,255,255,0.38)')
      if (x - 2 >= px && x - 2 < px + pw && y % 3) dot(g, x - 2, 24 + y, 'rgba(255,255,255,0.2)')
    }
  })
}

// Rincón del vestíbulo entre la diagonal del paño y la cristalera: se ve el mismo interior, en penumbra.
function lobbyCorner(g) {
  for (let y = 23; y <= 35; y++) {
    const left = slabRight(y) + 1
    if (left > 117) continue
    for (let x = left; x <= 117; x++) dot(g, x, y, y < 27 ? WOOD[0] : x % 4 === 0 ? WOOD[0] : WOOD[1])
  }
  for (let y = 36; y < 59; y++) rect(g, 112, y, 6, 1, y < 41 ? WOOD[1] : y < 48 ? WOOD[2] : y < 52 ? BAND : '#333748')
}

function entrance(g, lit) {
  lobby(g)
  lobbyCorner(g)
  glassPanes(g)
  rect(g, 118, 40, 58, 1, MULLION)
  ENTRY_MULLIONS.forEach((mx) => rect(g, mx, 23, 1, 36, MULLION))
  rect(g, 136, 41, 1, 18, ROOF[0])
  rect(g, 152, 41, 1, 18, ROOF[0])
  lit.push({ x: 119, y: 23, w: 56, h: 17, holes: ENTRY_MULLIONS.filter((mx) => mx > 118 && mx < 175).map((mx) => ({ x: mx - 119, y: 0, w: 1, h: 17 })) })
}

// Bloque claro de la derecha: canto en sombra, paño de hormigón claro y la rejilla de ventilación.
function rightBlock(g) {
  rect(g, 176, 22, 28, 37, BLOCK[1])
  rect(g, 176, 22, 8, 37, BLOCK[0])
  rect(g, 184, 22, 19, 1, BLOCK[2])
  rect(g, 176, 40, 28, 19, WALL[2])
  rect(g, 183, 41, 15, 12, PANEL[1])
  for (let y = 42; y < 53; y += 2) rect(g, 184, y, 13, 1, WALL[1])
  rect(g, 203, 22, 1, 37, BLOCK[0])
}

// Zócalo y pavimento, con las filas del PNG: bajo el extremo curvo de la nave el borde baja en diagonal (una franja de piedra
// cálida que se aclara); bajo la nave queda una sola línea clara con su sombra, y bajo la entrada una fila oscura de base, dos
// claras y el canto gris.
const PLINTH = ['#584f4b', '#837374', '#9e8980', '#b9a39b']
const PLINTH_ROWS = [[56, 2], [57, 2], [58, 4], [59, 8], [60, 11], [61, 14]]
function pavement(g) {
  PLINTH_ROWS.forEach(([y, x]) => PLINTH.forEach((color, i) => dot(g, x + i, y, color)))
  rect(g, 15, 60, 77, 1, PAVE[2])
  for (let x = 24; x < 92; x += 10) dot(g, x, 60, PAVE[1])
  rect(g, 15, 61, 77, 1, PANEL[1])
  rect(g, 92, 59, 113, 1, '#4a4048')
  rect(g, 92, 60, 114, 1, PAVE[1])
  rect(g, 92, 61, 115, 1, PAVE[2])
  rect(g, 92, 62, 115, 1, '#7a6e6c')
}

function backLayer() {
  const canvas = makeCanvas(CPIFP_FACADE.w, CPIFP_CANVAS_H)
  const g = canvas.getContext('2d')
  const lit = []
  g.translate(0, CPIFP_TOP)
  naveGlass(g, lit)
  navePanels(g)
  slopedWall(g)
  overhang(g)
  entrance(g, lit)
  rightBlock(g)
  roof(g)
  pavement(g)
  g.setTransform(1, 0, 0, 1, 0, 0)
  // Sin `outline`: el contorno va dentro de la silueta (como en el PNG); uno añadido ensancharía el edificio un píxel por lado.
  return { canvas, lit }
}

// Mesa de picnic de madera: tablero, bancos y patas en tijera.
function picnicTable(g, x) {
  rect(g, x, 55, 17, 2, '#e09a40')
  rect(g, x, 56, 17, 1, '#b8742c')
  rect(g, x - 1, 58, 19, 1, '#c47a3a')
  ;[x + 2, x + 13].forEach((lx) => {
    dot(g, lx, 57, '#623a23')
    dot(g, lx - 1, 59, '#623a23')
    dot(g, lx + 1, 59, '#623a23')
    dot(g, lx - 1, 60, '#623a23')
    dot(g, lx + 1, 60, '#623a23')
  })
}

// Marquesina azul (tejadillo, postes, trasera de cristal y banco) y las dos mesas: van por delante de quien pasa.
function frontLayer() {
  const canvas = makeCanvas(CPIFP_FACADE.w, CPIFP_CANVAS_H)
  const g = canvas.getContext('2d')
  g.translate(0, CPIFP_TOP)
  rect(g, 95, 45, 17, 12, '#8a848d')
  rect(g, 96, 46, 15, 1, '#b8b2ba')
  rect(g, 91, 42, 23, 2, PLATE)
  rect(g, 91, 42, 23, 1, '#3a6fc4')
  rect(g, 91, 44, 23, 1, PANEL[0])
  ;[92, 105].forEach((px) => {
    rect(g, px, 45, 3, 17, PLATE)
    rect(g, px, 45, 1, 17, '#3a6fc4')
    rect(g, px + 2, 45, 1, 17, PANEL[0])
  })
  rect(g, 95, 56, 17, 2, '#c47a3a')
  rect(g, 95, 57, 17, 1, '#8a5428')
  picnicTable(g, 152)
  picnicTable(g, 173)
  g.setTransform(1, 0, 0, 1, 0, 0)
  return canvas
}

const cpifpShift = (r) => ({ ...r, y: r.y + CPIFP_TOP })

export function cpifpSprite() {
  const { canvas, lit } = backLayer()
  return {
    canvas,
    overlay: { x: 0, y: 0, canvas: frontLayer() },
    doorCol: CPIFP_DOOR_COL,
    // De noche se encienden la cristalera de la nave y la de la entrada.
    windows: lit.flatMap(({ x, y, w, h, holes }) => litPane(x, y + CPIFP_TOP, w, h, holes)),
    bodies: CPIFP_BODIES.map(cpifpShift),
    doorZone: cpifpShift(CPIFP_DOOR_ZONE),
    depthRows: { back: CPIFP_TOP + 58, front: CPIFP_TOP + 61 },
  }
}
