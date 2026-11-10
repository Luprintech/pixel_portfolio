// Casas y rincones de ocio: la casa de Lupe con cubierta, escalera y telescopio, la casa de los amigos, el rincón de
// la música, las casitas de la familia y el quiosco de helados de la piscina.
import { PAL, TONE, shade, tint } from '../palette.js'
import { dot, ellipse, makeCanvas, rect } from '../pixelKit.js'
import { STAIRS } from '../terrace.js'
import { flowerPot, houseDoor, lupePlaque, sillLedge, starMobile, tallPlant, vine } from './homeFacade.js'
import { houseGlow } from './homeLight.js'
import { litPane } from './litPane.js'
import { FRONT_RAIL, STRAND, backRail, deckFloor, frontRail, parasol, strandPoints, telescope, terraceStairs } from './terraceProps.js'
import { frontRailSnow, terraceSnow } from './terraceWinter.js'
import { STONE0, STONE1, STONE2, WOOD0, WOOD1, WOOD2, WOOD3, chimney, doorAt, finish, hipRoof, iconAt, leanRoof, newSprite, signBoard, wall, windowAt } from './shared.js'

const SLATE = '#6b5b95'

function heart(g, x, y, color) {
  ;[[0, 0], [1, 0], [3, 0], [4, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [1, 2], [2, 2], [3, 2], [2, 3]].forEach(([dx, dy]) => dot(g, x + dx, y + dy, color))
}

// Guirnalda de bombillas entre el mástil de la cubierta y la pared. Las bombillas se encienden de noche.
function stringLights(s) {
  const { g } = s
  const { from } = STRAND
  rect(g, from.x - 1, from.y - 2, 2, 60, WOOD1)
  dot(g, from.x - 1, from.y - 3, PAL.saffron)
  strandPoints().forEach(({ x, y, bulb }) => {
    dot(g, x, y, WOOD0)
    if (bulb) {
      rect(g, x, y + 1, 2, 2, PAL.saffronLight)
      s.windows.push({ x, y: y + 1, w: 2, h: 2 })
    }
  })
}

// Cortinas de las ventanas grandes: se pintan después del interior para quedar por encima. Van recogidas a los
// lados y no cruzan el cristal, así que el monitor y la impresora se ven enteros.
function windowCurtains(g, x, y, w, h, curtain) {
  const fold = shade(curtain, 0.78)
  rect(g, x, y, 4, h - 6, curtain)
  rect(g, x + 3, y, 1, h - 6, fold)
  rect(g, x + w - 4, y, 4, h - 6, curtain)
  rect(g, x + w - 4, y, 1, h - 6, fold)
  rect(g, x, y, w, 2, tint(curtain, 0.2))
}

// Zonas de la ventana grande que no se encienden de noche: las cortinas y el valance, para que el cristal quede
// entre dos bandas con fondo, y los objetos del interior, que se leen como silueta contra la luz.
const CURTAIN_HOLES = (w, h) => [{ x: 0, y: 0, w: 4, h: h - 6 }, { x: w - 4, y: 0, w: 4, h: h - 6 }, { x: 0, y: 0, w, h: 2 }]
const COMPUTER_HOLES = [
  { x: 8, y: 5, w: 20, h: 15 },
  { x: 17, y: 20, w: 2, h: 4 },
  { x: 10, y: 23, w: 16, h: 2 },
  { x: 0, y: 24, w: 36, h: 6 },
  { x: 30, y: 19, w: 3, h: 5 },
  { x: 31, y: 17, w: 2, h: 2 },
]
const PRINTER_HOLES = [
  { x: 7, y: 5, w: 2, h: 19 },
  { x: 27, y: 5, w: 2, h: 19 },
  { x: 7, y: 5, w: 22, h: 4 },
  { x: 15, y: 9, w: 5, h: 4 },
  { x: 17, y: 13, w: 1, h: 3 },
  { x: 13, y: 20, w: 12, h: 4 },
  { x: 15, y: 16, w: 8, h: 4 },
  { x: 17, y: 14, w: 4, h: 2 },
  { x: 6, y: 24, w: 24, h: 3 },
  { x: 2, y: 17, w: 5, h: 5 },
]

// Ventana del ordenador: monitor con un corazón sobre la mesa y cortinas rosas.
function computerWindow(s, x, y) {
  const { g } = s
  windowAt(s, x, y, 36, 30, { screen: '#2a2250', shutters: '#b8a2e0', muntins: false, lit: false })
  rect(g, x, y + 24, 36, 6, WOOD2)
  rect(g, x, y + 24, 36, 1, WOOD3)
  rect(g, x + 8, y + 5, 20, 15, '#1c1b3a')
  rect(g, x + 9, y + 6, 18, 12, '#c46aa0')
  rect(g, x + 9, y + 6, 18, 1, '#e08ac0')
  heart(g, x + 15, y + 9, '#ffd0e4')
  rect(g, x + 17, y + 20, 2, 4, STONE1)
  rect(g, x + 10, y + 23, 16, 2, '#cfc2e8')
  rect(g, x + 30, y + 19, 3, 5, '#f4b8cc')
  dot(g, x + 31, y + 17, TONE.grass[2])
  dot(g, x + 32, y + 18, TONE.grass[2])
  rect(g, x + 5, y + 21, 3, 3, PAL.saffron)
  windowCurtains(g, x, y, 36, 30, '#e8a8c8')
  sillLedge(g, x - 3, y + 31, 42)
  s.windows.push(...litPane(x, y, 36, 30, [...CURTAIN_HOLES(36, 30), ...COMPUTER_HOLES]))
}

// Ventana de la impresora 3D: bastidor, cabezal sobre el pórtico y la pieza morada a medio imprimir.
function printerWindow(s, x, y) {
  const { g } = s
  windowAt(s, x, y, 36, 30, { screen: '#2a2250', shutters: '#b8a2e0', muntins: false, lit: false })
  rect(g, x + 6, y + 24, 24, 3, STONE1)
  rect(g, x + 6, y + 24, 24, 1, STONE2)
  rect(g, x + 7, y + 5, 2, 19, STONE1)
  rect(g, x + 27, y + 5, 2, 19, STONE1)
  rect(g, x + 7, y + 5, 22, 2, STONE2)
  rect(g, x + 7, y + 8, 22, 1, STONE0)
  rect(g, x + 15, y + 9, 5, 4, '#cfc2e8')
  rect(g, x + 17, y + 13, 1, 3, PAL.saffronLight)
  rect(g, x + 13, y + 20, 12, 4, '#9a5ab8')
  rect(g, x + 15, y + 16, 8, 4, '#b88ad8')
  rect(g, x + 17, y + 14, 4, 2, '#d8b8f0')
  rect(g, x + 2, y + 17, 5, 5, '#f4b8cc')
  rect(g, x + 3, y + 18, 3, 3, '#2a2250')
  dot(g, x + 29, y + 3, '#7ae0a0')
  windowCurtains(g, x, y, 36, 30, '#b8e0c8')
  sillLedge(g, x - 3, y + 31, 42)
  s.windows.push(...litPane(x, y, 36, 30, [...CURTAIN_HOLES(36, 30), ...PRINTER_HOLES]))
}

// Ventana pequeña de la planta alta: cristal con cruceta y un alféizar continuo.
function smallWindow(s, x, y) {
  windowAt(s, x, y, 12, 8, { glint: true, lit: false })
  sillLedge(s.g, x - 2, y + 9, 16)
  s.windows.push(...litPane(x, y, 12, 8))
}

// Piedras de esquina alternas, para que las esquinas del muro no sean un poste liso.
function quoins(g, x, y, h, side) {
  for (let qy = y, i = 0; qy < y + h; qy += 8, i++) {
    const w = i % 2 ? 5 : 8
    const qx = side === 'left' ? x : x - w
    rect(g, qx, qy, w, 7, STONE1)
    rect(g, qx, qy, w, 1, STONE2)
    rect(g, qx, qy + 6, w, 1, STONE0)
  }
}

// Buhardilla sobre el tejado con su ventana de punto.
function dormer(s, cx, top) {
  const { g } = s
  wall(g, { x: cx - 12, y: top + 9, w: 24, h: 12, post: false })
  hipRoof(g, { x: cx - 16, y: top, w: 32, rows: 3, color: '#8a7ab8', inset: 3, rowH: 3 })
  windowAt(s, cx - 5, top + 12, 10, 8, { shutters: '#b8a2e0', arched: true })
}

// Casa de Lupe, de izquierda a derecha: la escalera de madera, la sala baja con la cubierta (balaustrada,
// sombrilla, mesa, telescopio y guirnalda) y la casa de dos plantas con buhardilla, ventana del ordenador,
// ventana de la impresora 3D y la puerta con su marquesina.
export function homeSprite() {
  const s = newSprite(256, 160)
  const { g } = s
  chimney(g, 222, 34, 40)
  wall(g, { x: 106, y: 74, w: 146, h: 86 })
  hipRoof(g, { x: 100, y: 48, w: 154, rows: 6, color: SLATE, inset: 4 })
  dormer(s, 179, 50)
  quoins(g, 109, 80, 72, 'left')
  quoins(g, 249, 80, 72, 'right')
  vine(g, 246, 108, 44)
  // Sala baja y cubierta. De atrás adelante: suelo, guirnalda, balaustrada trasera, telescopio, mesa con sombrilla
  // y escalera. La barandilla delantera va aparte (`overlay`): se dibuja por encima de la viajera.
  wall(g, { x: 38, y: 118, w: 70, h: 42, post: false })
  deckFloor(g)
  stringLights(s)
  backRail(g)
  telescope(g)
  parasol(g)
  terraceStairs(g, STAIRS)
  windowAt(s, 58, 128, 32, 20, { flowers: true, sill: true, curtains: '#e8a8c8', glint: true })
  // Casa de dos plantas. Entre las ventanas pequeñas y las grandes queda una franja libre de pared (cinco filas).
  computerWindow(s, 120, 102)
  printerWindow(s, 202, 102)
  smallWindow(s, 132, 83)
  smallWindow(s, 214, 83)
  // Entrada: tejadillo alto con el móvil de luna y estrella, puerta con marco y escalón, farol, macetas y placa.
  leanRoof(g, { x: 166, y: 114, w: 26, rows: 2, color: SLATE })
  rect(g, 168, 122, 2, 9, WOOD1)
  rect(g, 188, 122, 2, 9, WOOD1)
  starMobile(g, 179, 122)
  houseDoor(s, 172, 157, { w: 14, h: 26 })
  rect(g, 160, 131, 4, 1, WOOD0)
  rect(g, 161, 132, 3, 6, WOOD0)
  rect(g, 162, 133, 1, 4, PAL.saffronLight)
  s.windows.push({ x: 162, y: 133, w: 1, h: 4 })
  tallPlant(g, 158, 147)
  flowerPot(g, 192, 148)
  lupePlaque(g, 190, 138)
  return { ...finish(s), overlay: frontRailLayer(), glow: houseGlow(), snow: snowLayer(256, 160, terraceSnow) }
}

// Capa de nieve de un dibujo: se pinta aparte y la escena la funde sobre la versión de invierno (ver worldAssets).
function snowLayer(w, h, paint, origin = { x: 0, y: 0 }) {
  const canvas = makeCanvas(w, h)
  const g = canvas.getContext('2d')
  g.translate(-origin.x, -origin.y)
  paint(g)
  return canvas
}

// Barandilla delantera de la cubierta como lienzo propio, con un margen de dos píxeles para su contorno. Lleva la
// esquina (`x`, `y`) donde se coloca sobre el dibujo de la casa, y su propia capa de nieve.
function frontRailLayer() {
  const ox = FRONT_RAIL.x - 2
  const oy = FRONT_RAIL.top - 2
  const w = FRONT_RAIL.right - FRONT_RAIL.x + 4
  const h = FRONT_RAIL.bottom - FRONT_RAIL.top + 3
  const layer = newSprite(w, h)
  layer.g.translate(-ox, -oy)
  frontRail(layer.g)
  return { canvas: finish(layer).canvas, snow: snowLayer(w, h, frontRailSnow, { x: ox, y: oy }), x: ox, y: oy }
}

// Casa de los amigos: dos plantas, guirnaldas de luces bajo el alero y puerta verde.
export function friendsSprite() {
  const s = newSprite(128, 128)
  const { g } = s
  chimney(g, 92, 20, 34)
  wall(g, { x: 4, y: 58, w: 120, h: 70 })
  hipRoof(g, { x: 0, y: 34, w: 128, rows: 6, color: '#7a3f8f', inset: 4 })
  for (let x = 8; x < 120; x += 6) dot(g, x, 60 + Math.round(Math.sin(x / 6) * 1.5), x % 12 === 8 ? PAL.saffronLight : '#f4b8cc')
  ;[22, 82].forEach((x) => windowAt(s, x, 72, 16, 18, { shutters: PAL.teal }))
  ;[22, 82].forEach((x) => windowAt(s, x, 98, 14, 14, { flowers: true }))
  doorAt(s, 52, 125, { w: 16, h: 26, color: '#4f8f5a' })
  ellipse(g, 60, 76, 7, 7, WOOD1)
  ellipse(g, 60, 76, 5.5, 5.5, '#9fd6e0')
  rect(g, 60, 70, 1, 12, WOOD1)
  rect(g, 54, 76, 12, 1, WOOD1)
  return finish(s)
}

// Rincón de la música: casa estrecha con una nota en el rótulo y una ventana redonda.
export function musicSprite() {
  const s = newSprite(112, 96)
  const { g } = s
  wall(g, { x: 4, y: 40, w: 104, h: 56 })
  hipRoof(g, { x: 0, y: 20, w: 112, rows: 5, color: '#4a7aa8', inset: 4 })
  signBoard(g, 38, 24, 36, 12, { icon: 'note', color: '#1c1b3a', ink: PAL.saffronLight })
  ellipse(g, 30, 64, 9, 9, WOOD1)
  ellipse(g, 30, 64, 7.5, 7.5, '#e8a050')
  rect(g, 30, 56, 1, 16, WOOD1)
  rect(g, 22, 64, 17, 1, WOOD1)
  s.windows.push({ x: 24, y: 58, w: 12, h: 12 })
  windowAt(s, 78, 56, 18, 22, { shutters: '#c4577f' })
  doorAt(s, 50, 93, { w: 14, h: 24, color: '#8a5aa8' })
  return finish(s)
}

// Casita de la familia, en dos versiones: tejado frambuesa o tejado teja.
export function cottageSprite({ variant = 0 } = {}) {
  const s = newSprite(112, 80)
  const { g } = s
  const roof = variant === 0 ? '#a8467a' : '#c4572a'
  chimney(g, 80, 6, 22)
  wall(g, { x: 4, y: 32, w: 104, h: 48 })
  hipRoof(g, { x: 0, y: 14, w: 112, rows: 4, color: roof, inset: 4 })
  windowAt(s, 20, 44, 18, 18, { shutters: variant === 0 ? '#b8a2e0' : PAL.teal, flowers: true })
  windowAt(s, 78, 44, 18, 18, { shutters: variant === 0 ? '#b8a2e0' : PAL.teal })
  doorAt(s, 50, 77, { w: 12, h: 21, color: variant === 0 ? WOOD2 : '#4f8f5a' })
  return finish(s)
}

// Quiosco de helados: mostrador bajo un toldo de rayas con el cucurucho sobre el tejado.
export function kioskSprite() {
  const s = newSprite(64, 64)
  const { g } = s
  wall(g, { x: 4, y: 28, w: 56, h: 36, base: '#f4e8c8', dark: '#d8c496' })
  rect(g, 2, 20, 60, 8, '#e07a9c')
  for (let x = 2; x < 62; x += 8) {
    rect(g, x, 20, 4, 8, '#f6f0e0')
    rect(g, x, 28, 8, 2, x % 16 === 2 ? '#f6f0e0' : '#e07a9c')
  }
  iconAt(g, 28, 4, 'cone', '#f2b134', 2)
  dot(g, 29, 4, '#f4b8cc')
  rect(g, 26, 2, 12, 3, '#f4b8cc')
  rect(g, 28, 0, 8, 2, '#f6f0e0')
  rect(g, 12, 34, 40, 14, '#3a2a4a')
  rect(g, 12, 48, 40, 3, WOOD1)
  rect(g, 12, 48, 40, 1, WOOD3)
  for (let i = 0; i < 4; i++) ellipse(g, 20 + i * 9, 44, 3, 3, ['#f4b8cc', '#f6f0e0', '#f8d77a', '#b8e0c8'][i])
  s.windows.push({ x: 12, y: 34, w: 40, h: 14 })
  s.doorCol = 32
  rect(g, 4, 60, 56, 1, STONE0)
  rect(g, 12, 56, 40, 2, TONE.stone[1])
  return finish(s)
}
