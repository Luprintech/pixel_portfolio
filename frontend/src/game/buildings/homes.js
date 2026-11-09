// Casas y rincones de ocio: la casa de Lupe con cubierta, escalera y telescopio, la casa de los amigos, el rincón de
// la música, las casitas de la familia y el quiosco de helados de la piscina.
import { PAL, TONE, shade, tint } from '../palette.js'
import { dot, ellipse, rect } from '../pixelKit.js'
import { DECK, STAIRS } from '../terrace.js'
import { STONE0, STONE1, STONE2, WOOD0, WOOD1, WOOD2, WOOD3, chimney, doorAt, finish, hipRoof, iconAt, leanRoof, newSprite, signBoard, wall, windowAt } from './shared.js'

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

// Sombrilla con mesa y dos sillas, para la azotea.
function parasol(g, x, y) {
  rect(g, x + 11, y + 8, 2, 22, WOOD1)
  ellipse(g, x + 12, y + 7, 14, 6, '#e07a9c')
  for (let i = -12; i <= 12; i += 6) rect(g, x + 12 + i, y + 3, 3, 8, '#f6f0e0')
  rect(g, x + 2, y + 28, 20, 3, WOOD2)
  rect(g, x + 2, y + 28, 20, 1, WOOD3)
  rect(g, x + 4, y + 31, 2, 6, WOOD0)
  rect(g, x + 18, y + 31, 2, 6, WOOD0)
  ;[x - 6, x + 25].forEach((cx) => {
    rect(g, cx, y + 26, 5, 2, '#e07a9c')
    rect(g, cx + (cx < x ? 0 : 4), y + 20, 1, 8, WOOD1)
    rect(g, cx + 1, y + 28, 1, 9, WOOD0)
    rect(g, cx + 3, y + 28, 1, 9, WOOD0)
  })
}

// Maceta de barro con arbusto y flores.
function pot(g, x, y, bloom) {
  ellipse(g, x + 5, y + 2, 6, 4, TONE.grass[1])
  ellipse(g, x + 4, y + 1, 3, 2, TONE.grass[2])
  dot(g, x + 2, y, bloom)
  dot(g, x + 7, y + 2, bloom)
  dot(g, x + 5, y - 1, bloom)
  rect(g, x, y + 5, 10, 2, '#d9703a')
  rect(g, x + 1, y + 7, 8, 4, '#c4572a')
  rect(g, x + 1, y + 7, 2, 4, '#e08a52')
}

// Escalera exterior de madera, vista de perfil: cada peldaño es un bloque con su huella clara y el hueco
// de debajo en sombra. Sube hacia la derecha hasta la cubierta; el pasamanos arranca en el segundo peldaño.
function terraceStairs(g, { x, bottom, steps, run, rise }) {
  for (let i = 0; i < steps; i++) {
    const left = x + i * run
    const top = bottom - rise * (i + 1)
    rect(g, left, top, run, bottom - top, WOOD0)
    for (let sx = left; sx < left + run; sx += 3) rect(g, sx, top + rise, 1, bottom - top - rise, WOOD1)
    rect(g, left, top, run, 2, WOOD3)
    rect(g, left, top + 2, run, rise - 2, WOOD2)
    rect(g, left + run - 1, top + 2, 1, rise - 2, WOOD1)
  }
  // Zanca diagonal bajo los peldaños y poste de apoyo.
  for (let px = 0; px < steps * run; px++) rect(g, x + px, bottom - Math.round((px * rise) / run) - rise - 1, 1, 2, WOOD1)
  rect(g, x + 2, bottom - 8, 3, 8, WOOD0)
  rect(g, x + steps * run - 5, bottom - rise * steps, 3, rise * steps, WOOD0)
  // Pasamanos: postes cada tres peldaños y barandal en diagonal con un travesaño.
  ;[1, 4, 7].forEach((i) => rect(g, x + i * run + 1, bottom - rise * (i + 1) - 14, 2, 14, WOOD1))
  for (let px = run; px < steps * run; px++) {
    const y = bottom - rise * 2 - Math.round(((px - run) * rise) / run) - 13
    rect(g, x + px, y, 1, 2, WOOD3)
    rect(g, x + px, y + 6, 1, 1, WOOD2)
  }
}

// Balaustrada de la cubierta: balaustres, postes con remate, barandal y travesaño bajo.
function balustrade(g, x, y, w) {
  rect(g, x, y + 11, w, 2, WOOD1)
  for (let bx = x + 3; bx < x + w - 2; bx += 4) rect(g, bx, y + 2, 2, 10, WOOD2)
  for (let bx = x; bx <= x + w - 3; bx += 14) {
    rect(g, bx, y - 2, 3, 15, WOOD1)
    rect(g, bx, y - 2, 1, 15, WOOD3)
    rect(g, bx - 1, y - 3, 5, 2, WOOD3)
  }
  rect(g, x, y, w, 3, WOOD2)
  rect(g, x, y, w, 1, WOOD3)
}

// Guirnalda de bombillas entre el mástil de la cubierta y la pared. Las bombillas se encienden de noche.
function stringLights(s, from, to) {
  const { g } = s
  rect(g, from.x - 1, from.y - 2, 2, 28, WOOD1)
  dot(g, from.x - 1, from.y - 3, PAL.saffron)
  for (let px = from.x; px <= to.x; px++) {
    const u = (px - from.x) / (to.x - from.x)
    const y = Math.round(from.y + (to.y - from.y) * u + 7 * Math.sin(Math.PI * u))
    dot(g, px, y, WOOD0)
    if ((px - from.x) % 7 === 3) {
      rect(g, px, y + 1, 2, 2, PAL.saffronLight)
      s.windows.push({ x: px, y: y + 1, w: 2, h: 2 })
    }
  }
}

// Cortinas y reflejo de las ventanas grandes: se pintan después del interior para quedar por encima.
function windowDressing(g, x, y, w, h, curtain) {
  const fold = shade(curtain, 0.78)
  rect(g, x, y, 4, h - 6, curtain)
  rect(g, x + 3, y, 1, h - 6, fold)
  rect(g, x + w - 4, y, 4, h - 6, curtain)
  rect(g, x + w - 4, y, 1, h - 6, fold)
  rect(g, x, y, w, 2, tint(curtain, 0.2))
  for (let i = 0; i < 6; i++) dot(g, x + 6 + i, y + 8 - i, 'rgba(255,255,255,0.4)')
}

// Ventana del ordenador: monitor con un corazón sobre la mesa, cortinas rosas y un reflejo en el cristal.
function computerWindow(s, x, y) {
  const { g } = s
  windowAt(s, x, y, 36, 30, { screen: '#2a2250', shutters: '#b8a2e0', muntins: false, sill: true })
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
  windowDressing(g, x, y, 36, 30, '#e8a8c8')
}

// Ventana de la impresora 3D: bastidor, cabezal sobre el pórtico y la pieza morada a medio imprimir.
function printerWindow(s, x, y) {
  const { g } = s
  windowAt(s, x, y, 36, 30, { screen: '#2a2250', shutters: '#b8a2e0', muntins: false, flowers: true })
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
  windowDressing(g, x, y, 36, 30, '#b8e0c8')
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

// Hiedra que trepa por una esquina, en manchas de dos tonos.
function ivy(g, x, y, h) {
  for (let i = 0; i < h; i += 5) {
    const dx = (i * 7) % 6
    rect(g, x + dx, y + i, 3, 3, TONE.grass[1])
    dot(g, x + dx, y + i, TONE.grass[2])
    if (i % 15 === 0) dot(g, x + dx + 2, y + i + 1, '#f4b8cc')
  }
}

// Buhardilla sobre el tejado con su ventana de punto.
function dormer(s, cx, top) {
  const { g } = s
  wall(g, { x: cx - 12, y: top + 9, w: 24, h: 12, post: false })
  hipRoof(g, { x: cx - 16, y: top, w: 32, rows: 3, color: '#8a7ab8', inset: 3, rowH: 3 })
  windowAt(s, cx - 5, top + 12, 10, 8, { shutters: '#b8a2e0', arched: true })
}

// Placa con la cara de Khalessi sobre la puerta.
function khalessiPlaque(g, x, y) {
  rect(g, x, y, 14, 12, '#d9a557')
  rect(g, x, y, 14, 1, '#f1c878')
  rect(g, x, y + 11, 14, 1, '#a87a35')
  rect(g, x, y, 3, 3, WOOD2)
  rect(g, x + 11, y, 3, 3, WOOD2)
  dot(g, x + 3, y + 5, WOOD0)
  dot(g, x + 10, y + 5, WOOD0)
  rect(g, x + 6, y + 7, 2, 1, '#e07a9c')
  rect(g, x + 4, y + 8, 6, 1, WOOD1)
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
  ivy(g, 240, 82, 70)
  // Sala baja y cubierta.
  wall(g, { x: 38, y: 118, w: 70, h: 42, post: false })
  rect(g, 36, 112, 74, 6, WOOD2)
  rect(g, 36, 112, 74, 1, WOOD3)
  for (let x = 38; x < 108; x += 7) rect(g, x, 113, 1, 4, WOOD1)
  rect(g, 36, 117, 74, 1, WOOD0)
  stringLights(s, { x: 40, y: 68 }, { x: 106, y: 82 })
  telescope(g, 50, 82)
  parasol(g, 76, 72)
  pot(g, 98, 101, '#f4b8cc')
  balustrade(g, DECK.left + 4, 97, DECK.right - DECK.left - 4)
  terraceStairs(g, STAIRS)
  windowAt(s, 58, 128, 32, 20, { flowers: true, sill: true, curtains: '#e8a8c8', glint: true })
  // Casa de dos plantas.
  computerWindow(s, 120, 98)
  printerWindow(s, 202, 98)
  windowAt(s, 128, 82, 12, 10, { sill: true, glint: true })
  windowAt(s, 216, 82, 12, 10, { sill: true, glint: true })
  khalessiPlaque(g, 172, 102)
  // Puerta con marquesina, farol y macetas.
  leanRoof(g, { x: 166, y: 120, w: 26, rows: 2, color: SLATE })
  rect(g, 168, 128, 2, 3, WOOD1)
  rect(g, 188, 128, 2, 3, WOOD1)
  doorAt(s, 172, 157, { w: 14, h: 26, glow: true })
  rect(g, 160, 131, 4, 1, WOOD0)
  rect(g, 161, 132, 3, 6, WOOD0)
  rect(g, 162, 133, 1, 4, PAL.saffronLight)
  s.windows.push({ x: 162, y: 133, w: 1, h: 4 })
  rect(g, 171, 157, 16, 1, '#c46aa0')
  pot(g, 158, 148, '#e07a9c')
  pot(g, 192, 148, '#f6f0e0')
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
