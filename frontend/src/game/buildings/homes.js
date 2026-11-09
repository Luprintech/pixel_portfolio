// Casas y rincones de ocio: la casa de Lupe con azotea y telescopio, la casa de los amigos, el rincón de
// la música, las casitas de la familia y el quiosco de helados de la piscina.
import { PAL, TONE } from '../palette.js'
import { dot, ellipse, rect } from '../pixelKit.js'
import { STONE0, STONE1, STONE2, WOOD0, WOOD1, WOOD2, WOOD3, chimney, doorAt, finish, flowerBox, hipRoof, iconAt, newSprite, signBoard, wall, windowAt } from './shared.js'

const SLATE = '#6b5b95'

function heart(g, x, y, color) {
  ;[[0, 0], [1, 0], [3, 0], [4, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [1, 2], [2, 2], [3, 2], [2, 3]].forEach(([dx, dy]) => dot(g, x + dx, y + dy, color))
}

// Telescopio sobre un trípode: tubo en diagonal con las dos tapas de latón.
function telescope(g, x, y) {
  rect(g, x + 7, y + 14, 1, 14, WOOD0)
  for (let i = 0; i < 9; i++) {
    dot(g, x + 7 - Math.floor(i / 2), y + 14 + i * 1.6, WOOD1)
    dot(g, x + 8 + Math.floor(i / 2), y + 14 + i * 1.6, WOOD1)
  }
  for (let i = 0; i < 20; i++) {
    const px = x + 1 + i
    const py = y + 14 - Math.floor(i * 0.6)
    rect(g, px, py, 1, 3, i < 3 || i > 16 ? PAL.saffron : '#5c7aa8')
    dot(g, px, py, '#9fb8d8')
  }
}

// Sombrilla con mesa, para la azotea.
function parasol(g, x, y) {
  rect(g, x + 11, y + 8, 2, 22, WOOD1)
  ellipse(g, x + 12, y + 7, 14, 6, '#e07a9c')
  for (let i = -12; i <= 12; i += 6) rect(g, x + 12 + i, y + 3, 3, 8, '#f6f0e0')
  rect(g, x + 2, y + 28, 20, 3, WOOD2)
  rect(g, x + 4, y + 31, 2, 6, WOOD0)
  rect(g, x + 18, y + 31, 2, 6, WOOD0)
}

// Casa de Lupe: a la derecha la casa de dos plantas con su ventana de ordenador y la de la impresora 3D;
// a la izquierda, una sala baja cuya azotea lleva barandilla, sombrilla, mesa y telescopio, con escalera.
export function homeSprite() {
  const s = newSprite(240, 160)
  const { g } = s
  chimney(g, 206, 34, 40)
  wall(g, { x: 72, y: 74, w: 164, h: 86 })
  hipRoof(g, { x: 66, y: 48, w: 176, rows: 6, color: SLATE, inset: 4 })
  // Sala baja con la azotea encima.
  wall(g, { x: 4, y: 118, w: 70, h: 42, post: false })
  rect(g, 2, 112, 74, 6, WOOD2)
  rect(g, 2, 112, 74, 1, WOOD3)
  rect(g, 2, 117, 74, 1, WOOD0)
  for (let x = 4; x < 74; x += 8) rect(g, x, 98, 2, 14, WOOD1)
  rect(g, 4, 98, 70, 2, WOOD2)
  telescope(g, 8, 82)
  parasol(g, 38, 72)
  // Escalera de la azotea por el lado izquierdo.
  for (let i = 0; i < 6; i++) {
    rect(g, 0 + i * 3, 150 - i * 7, 8, 7, STONE1)
    rect(g, 0 + i * 3, 150 - i * 7, 8, 1, STONE2)
  }
  windowAt(s, 22, 128, 30, 22, { flowers: true })
  // Ventana del ordenador (pantalla rosa con un corazón) y de la impresora 3D (pieza morada).
  windowAt(s, 86, 100, 40, 30, { screen: '#c46aa0', shutters: '#b8a2e0' })
  heart(g, 102, 108, '#ffd0e4')
  rect(g, 92, 122, 28, 2, '#2e2d5a')
  windowAt(s, 186, 100, 40, 30, { screen: '#3a2a6a', shutters: '#b8a2e0' })
  rect(g, 190, 102, 2, 26, STONE1)
  rect(g, 220, 102, 2, 26, STONE1)
  rect(g, 190, 102, 32, 2, STONE1)
  rect(g, 200, 118, 12, 10, '#9a5ab8')
  rect(g, 202, 112, 8, 6, '#b88ad8')
  rect(g, 204, 108, 4, 4, '#d8b8f0')
  windowAt(s, 140, 84, 12, 10)
  windowAt(s, 164, 84, 12, 10)
  doorAt(s, 148, 157, { w: 14, h: 26, glow: true })
  // Cartel con la cara de Khalessi en un poste, junto a la puerta.
  rect(g, 126, 138, 3, 22, WOOD1)
  rect(g, 120, 126, 14, 12, '#d9a557')
  rect(g, 120, 126, 14, 1, '#f1c878')
  rect(g, 120, 126, 3, 3, '#d9a557')
  rect(g, 131, 126, 3, 3, '#d9a557')
  dot(g, 123, 131, WOOD0)
  dot(g, 130, 131, WOOD0)
  rect(g, 126, 133, 2, 1, '#e07a9c')
  flowerBox(g, 178, 152, 16)
  return finish(s)
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
