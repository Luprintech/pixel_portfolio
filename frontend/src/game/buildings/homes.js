// Casas y rincones de ocio: la casa de Lupe con cubierta, escalera y telescopio, la casa de los amigos, el rincón de
// la música, las casitas de la familia y el quiosco de helados de la piscina.
import { PAL, TONE, shade, tint } from '../palette.js'
import { dot, ellipse, makeCanvas, rect } from '../pixelKit.js'
import { DECK_WIDEN, STAIRS } from '../terrace.js'
import { flowerPot, houseDoor, lupePlaque, sillLedge, starMobile, tallPlant, vine } from './homeFacade.js'
import { houseGlow } from './homeLight.js'
import { litPane } from './litPane.js'
import { LOWER_WINDOW, RAIL_BOX, STRAND, backRail, deckChair, deckFloor, lowerWindowXs, parasol, stairRail, strandPoints, telescope, terraceRail, terraceStairs } from './terraceProps.js'
import { railSnow, terraceSnow } from './terraceWinter.js'
import { STONE0, STONE1, STONE2, WOOD0, WOOD1, WOOD2, WOOD3, chimney, doorAt, finish, hipRoof, iconAt, leanRoof, newSprite, signBoard, wall, windowAt } from './shared.js'

const SLATE = '#6b5b95'

// Guirnalda de bombillas entre los dos postes de las esquinas traseras de la cubierta (que dibuja `backRail`). Las bombillas se
// encienden de noche.
function stringLights(s) {
  const { g } = s
  strandPoints().forEach(({ x, y, bulb }) => {
    dot(g, x, y, WOOD0)
    if (bulb) {
      rect(g, x, y + 1, 2, 2, PAL.saffronLight)
      s.windows.push({ x, y: y + 1, w: 2, h: 2 })
    }
  })
}

// Cortinas recogidas a los lados de una ventana grande: tela con pliegues desde la barra casi hasta el alféizar, con su lazo.
// `reach` es lo que cubre cada una. Se pintan después del interior para quedar por encima.
function drapes(g, x, y, w, h, color, reach) {
  const fold = shade(color, 0.78)
  const light = tint(color, 0.22)
  ;[x, x + w - reach].forEach((cx) => {
    rect(g, cx, y, reach, h - 6, color)
    for (let i = 1; i < reach; i += 3) rect(g, cx + i, y, 1, h - 6, i % 2 ? fold : light)
    rect(g, cx, y + Math.floor(h * 0.55), reach, 2, fold)
  })
  rect(g, x - 1, y, w + 2, 3, tint(color, 0.25))
  rect(g, x - 1, y + 3, w + 2, 1, fold)
}

// Zonas de la ventana grande que no se encienden de noche: las cortinas y la cenefa, para que el cristal quede entre dos
// bandas con fondo, y lo que se ve dentro, que se lee como silueta contra la luz.
const DRAPE_HOLES = (w, h, reach) => [{ x: 0, y: 0, w: reach, h: h - 6 }, { x: w - reach, y: 0, w: reach, h: h - 6 }, { x: 0, y: 0, w, h: 4 }]
const SILL = { x: 0, y: 24, w: 36, h: 6 }
const SHELF_HOLES = [{ x: 10, y: 6, w: 17, h: 9 }, { x: 22, y: 4, w: 6, h: 10 }]
const LAMP_HOLES = [{ x: 17, y: 16, w: 2, h: 8 }]

// Ventana de la izquierda de la planta alta, vista desde la calle: dentro se ve una pared cálida con una estantería de libros y
// una planta colgante (como la del cuarto de Lupe), entre cortinas rosas. Nada que no exista en la sala.
function shelfWindow(s, x, y) {
  const { g } = s
  windowAt(s, x, y, 36, 30, { screen: '#e9cfa8', shutters: '#b8a2e0', muntins: false, lit: false })
  rect(g, x, y + 17, 36, 7, '#dcb98c')
  rect(g, x + 10, y + 14, 17, 2, WOOD2)
  rect(g, x + 10, y + 16, 17, 1, WOOD0)
  ;[[11, 8, 2, '#c4577f'], [14, 9, 2, '#3f5f9e'], [17, 7, 3, PAL.saffron], [21, 10, 2, '#6b8f4e']].forEach(([dx, top, bw, color]) => rect(g, x + dx, y + top, bw, 14 - top, color))
  rect(g, x + 23, y + 4, 4, 3, '#f6f0e0')
  for (let i = 0; i < 3; i++) rect(g, x + 23 + i, y + 7, 1, 3 + i * 2, TONE.grass[2])
  rect(g, x, y + 24, 36, 6, WOOD2)
  rect(g, x, y + 24, 36, 1, WOOD3)
  rect(g, x + 28, y + 19, 4, 5, '#f4b8cc')
  dot(g, x + 29, y + 17, TONE.grass[2])
  dot(g, x + 30, y + 18, TONE.grass[2])
  drapes(g, x, y, 36, 30, '#e8a8c8', 9)
  sillLedge(g, x - 3, y + 31, 42)
  s.windows.push(...litPane(x, y, 36, 30, [...DRAPE_HOLES(36, 30, 9), ...SHELF_HOLES, SILL]))
}

// Ventana de la derecha de la planta alta: un visillo cerrado con una lámpara encendida detrás y la guirnalda de bombillas
// que cuelga dentro de la sala, entre cortinas verdes. Se adivina la luz, no una máquina.
function lampWindow(s, x, y) {
  const { g } = s
  windowAt(s, x, y, 36, 30, { screen: '#c8bcd8', shutters: '#b8a2e0', muntins: false, lit: false })
  for (let i = 0; i < 36; i += 3) rect(g, x + i, y + 4, 1, 20, i % 2 ? '#e6dcef' : '#d4c7e2')
  rect(g, x, y + 4, 36, 20, 'rgba(244,233,247,0.35)')
  for (let bx = 6; bx < 32; bx += 6) {
    rect(g, x + bx, y + 6 + Math.round(Math.sin(bx / 5) * 1.5), 2, 2, PAL.saffronLight)
  }
  rect(g, x + 14, y + 11, 8, 6, '#ffe9a6')
  rect(g, x + 15, y + 10, 6, 1, '#ffe9a6')
  rect(g, x + 14, y + 11, 8, 1, '#fff6cf')
  rect(g, x + 17, y + 17, 2, 7, '#7a6a96')
  rect(g, x, y + 24, 36, 6, WOOD2)
  rect(g, x, y + 24, 36, 1, WOOD3)
  rect(g, x + 4, y + 20, 4, 4, '#f6f0e0')
  rect(g, x + 5, y + 17, 2, 3, TONE.grass[2])
  drapes(g, x, y, 36, 30, '#b8e0c8', 5)
  sillLedge(g, x - 3, y + 31, 42)
  s.windows.push(...litPane(x, y, 36, 30, [...DRAPE_HOLES(36, 30, 5), ...LAMP_HOLES, SILL, { x: 4, y: 17, w: 4, h: 7 }]))
}

// Ventana pequeña de la planta alta: cristal con cruceta y un alféizar continuo.
function smallWindow(s, x, y) {
  windowAt(s, x, y, 12, 8, { glint: true, lit: false })
  sillLedge(s.g, x - 2, y + 9, 16)
  s.windows.push(...litPane(x, y, 12, 8))
}

// Piedras de esquina alternas, para que las esquinas del muro no sean un poste liso.
function quoins(g, x, y, h, side, skip = null) {
  for (let qy = y, i = 0; qy < y + h; qy += 8, i++) {
    if (skip && qy + 7 > skip.from && qy < skip.to) continue
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
// sombrilla, mesa, telescopio y guirnalda) y la casa de dos plantas con buhardilla, dos ventanas grandes (estantería y
// lámpara con visillo) y la puerta con su marquesina.
export function homeSprite() {
  // La casa de dos plantas se dibuja `DX` píxeles más a la derecha que la sala baja y la cubierta: así la azotea es ancha.
  const DX = DECK_WIDEN
  const s = newSprite(256 + DX, 160)
  const { g } = s
  chimney(g, 222 + DX, 34, 40)
  wall(g, { x: 106 + DX, y: 74, w: 146, h: 86 })
  hipRoof(g, { x: 100 + DX, y: 48, w: 154, rows: 6, color: SLATE, inset: 4 })
  dormer(s, 179 + DX, 50)
  quoins(g, 109 + DX, 80, 72, 'left')
  quoins(g, 249 + DX, 80, 72, 'right')
  vine(g, 246 + DX, 108, 44)
  // Sala baja y cubierta. De atrás adelante: suelo, guirnalda, escalera con su pasamanos trasero, balaustrada trasera (que
  // lo recibe en el poste de la esquina), telescopio, silla y mesa con sombrilla. El pasamanos y la barandilla delantera van aparte (`overlay`): se dibujan por encima de la viajera. En el
  // muro del extremo del entarimado no hay puerta dibujada; la zona de entrada (`nearRoofDoor`) es solo de uso.
  wall(g, { x: 38, y: 118, w: 70 + DX, h: 42, post: false })
  deckFloor(g)
  stringLights(s)
  terraceStairs(g, STAIRS)
  stairRail(g, STAIRS, 'back')
  backRail(g)
  telescope(g)
  deckChair(g)
  parasol(g)
  lowerWindowXs().forEach((wx, i) => windowAt(s, wx, LOWER_WINDOW.y, LOWER_WINDOW.w, LOWER_WINDOW.h, { sill: true, curtains: i ? '#b8e0c8' : '#e8a8c8', glint: true }))
  // Casa de dos plantas. Entre las ventanas pequeñas y las grandes queda una franja libre de pared (cinco filas).
  shelfWindow(s, 120 + DX, 102)
  lampWindow(s, 202 + DX, 102)
  smallWindow(s, 132 + DX, 83)
  smallWindow(s, 214 + DX, 83)
  // Entrada: tejadillo alto con el móvil de luna y estrella, puerta con marco y escalón, farol, macetas y placa.
  leanRoof(g, { x: 166 + DX, y: 114, w: 26, rows: 2, color: SLATE })
  rect(g, 168 + DX, 122, 2, 9, WOOD1)
  rect(g, 188 + DX, 122, 2, 9, WOOD1)
  starMobile(g, 179 + DX, 122)
  houseDoor(s, 172 + DX, 157, { w: 14, h: 26 })
  rect(g, 160 + DX, 131, 4, 1, WOOD0)
  rect(g, 161 + DX, 132, 3, 6, WOOD0)
  rect(g, 162 + DX, 133, 1, 4, PAL.saffronLight)
  s.windows.push({ x: 162 + DX, y: 133, w: 1, h: 4 })
  tallPlant(g, 158 + DX, 147)
  flowerPot(g, 192 + DX, 148)
  lupePlaque(g, 190 + DX, 138)
  return { ...finish(s), overlay: railLayer(), glow: houseGlow(), snow: snowLayer(256 + DX, 160, terraceSnow) }
}

// Capa de nieve de un dibujo: se pinta aparte y la escena la funde sobre la versión de invierno (ver worldAssets).
function snowLayer(w, h, paint, origin = { x: 0, y: 0 }) {
  const canvas = makeCanvas(w, h)
  const g = canvas.getContext('2d')
  g.translate(-origin.x, -origin.y)
  paint(g)
  return canvas
}

// Pasamanos de la escalera y barandilla delantera de la cubierta como lienzo propio, con un margen para su contorno. Lleva
// la esquina (`x`, `y`) donde se coloca sobre el dibujo de la casa, y su propia capa de nieve.
function railLayer() {
  const { x: ox, y: oy, w, h } = RAIL_BOX
  const layer = newSprite(w, h)
  layer.g.translate(-ox, -oy)
  terraceRail(layer.g)
  return { canvas: finish(layer).canvas, snow: snowLayer(w, h, railSnow, { x: ox, y: oy }), x: ox, y: oy }
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
