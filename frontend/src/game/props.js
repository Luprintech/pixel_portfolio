// Objetos sueltos del valle (fuente, bancos, farolas, vallas, autobús...). Cada uno es un dibujo con su
// cuerpo sólido, medido desde el punto de apoyo (centro de la base): `l`, `r`, `t` y `b` son los bordes
// en píxeles, con `t` y `b` negativos hacia arriba. Un `glow` marca la luz que se enciende de noche.
import { PAL, TONE } from './palette.js'
import { dot, ellipse, makeCanvas, outline, rect } from './pixelKit.js'
import { drawText, textWidth } from './pixelFont.js'

const [WOOD0, WOOD1, WOOD2, WOOD3] = TONE.wood
const [STONE0, STONE1, STONE2] = TONE.stone
const [W0, W1, W2, W3, W4] = TONE.water

const sprite = (w, h) => {
  const canvas = makeCanvas(w, h)
  return { canvas, g: canvas.getContext('2d') }
}
const done = ({ canvas }, strength = 0.5) => outline(canvas, strength)

function fountain() {
  const s = sprite(72, 60)
  const { g } = s
  ellipse(g, 36, 46, 33, 13, STONE0)
  ellipse(g, 36, 44, 33, 13, STONE2)
  ellipse(g, 36, 45, 29, 10, STONE1)
  ellipse(g, 36, 45, 27, 9, W2)
  ellipse(g, 36, 44, 22, 6.5, W3)
  for (let i = 0; i < 7; i++) dot(g, 16 + i * 6, 44 + (i % 2) * 2, W4)
  // Pie y dos cuencos.
  rect(g, 33, 24, 6, 20, STONE1)
  rect(g, 33, 24, 2, 20, STONE2)
  ellipse(g, 36, 30, 14, 5, STONE1)
  ellipse(g, 36, 29, 14, 5, STONE2)
  ellipse(g, 36, 29, 11, 3.5, W3)
  ellipse(g, 36, 16, 7, 3, STONE2)
  rect(g, 35, 8, 2, 8, W4)
  ellipse(g, 36, 6, 4, 3, W4)
  ;[[24, 14], [48, 14], [28, 6], [44, 8]].forEach(([x, y]) => dot(g, x, y + 8, W4))
  // Flores en el borde del pilón.
  for (let i = 0; i < 12; i++) {
    const x = 8 + i * 5
    dot(g, x, 54 + (i % 3), i % 2 ? PAL.rose : '#f6f0e0')
    dot(g, x + 1, 55 + (i % 3), TONE.grass[2])
  }
  return { canvas: done(s), body: [{ l: -30, t: -26, r: 30, b: -4 }] }
}

function noticeboard() {
  const s = sprite(36, 34)
  const { g } = s
  rect(g, 6, 20, 3, 14, WOOD1)
  rect(g, 27, 20, 3, 14, WOOD1)
  rect(g, 2, 4, 32, 18, WOOD2)
  rect(g, 2, 4, 32, 1, WOOD3)
  rect(g, 2, 21, 32, 1, WOOD0)
  rect(g, 0, 2, 36, 3, WOOD1)
  rect(g, 0, 2, 36, 1, WOOD3)
  rect(g, 5, 8, 8, 9, '#f6f0e0')
  rect(g, 15, 7, 7, 10, '#f4b8cc')
  rect(g, 24, 9, 8, 8, '#f8d77a')
  ;[7, 17, 26].forEach((x) => dot(g, x, 8, PAL.tile))
  ;[11, 13, 19, 21, 28].forEach((x) => rect(g, x - 3, 12, 3, 1, WOOD1))
  return { canvas: done(s), body: [{ l: -14, t: -8, r: 14, b: -1 }] }
}

function postbox() {
  const s = sprite(16, 32)
  const { g } = s
  rect(g, 7, 22, 3, 10, WOOD1)
  rect(g, 2, 4, 12, 20, '#c8402e')
  rect(g, 3, 3, 10, 1, '#c8402e')
  rect(g, 4, 2, 8, 1, '#c8402e')
  rect(g, 2, 4, 3, 20, '#e0644c')
  rect(g, 12, 4, 2, 20, '#8a2a20')
  rect(g, 4, 8, 8, 2, '#3a1a18')
  rect(g, 5, 14, 6, 4, '#f6f0e0')
  rect(g, 6, 15, 4, 1, '#c8402e')
  rect(g, 13, 8, 2, 5, PAL.saffron)
  return { canvas: done(s), body: [{ l: -5, t: -6, r: 5, b: -1 }] }
}

// Entrada del sur: dos pilares de piedra con farol y un arco de madera cubierto de flores.
function arch() {
  const s = sprite(72, 56)
  const { g } = s
  ;[2, 56].forEach((x) => {
    rect(g, x, 14, 14, 42, STONE1)
    rect(g, x, 14, 4, 42, STONE2)
    rect(g, x + 11, 14, 3, 42, STONE0)
    rect(g, x - 1, 10, 16, 5, STONE2)
    for (let y = 22; y < 56; y += 6) rect(g, x, y, 14, 1, STONE0)
  })
  // Arco de madera con flores trepando.
  for (let x = 14; x < 58; x++) {
    const t = (x - 36) / 22
    const y = 6 + Math.round(t * t * 12)
    rect(g, x, y, 1, 5, WOOD2)
    dot(g, x, y, WOOD3)
    dot(g, x, y + 4, WOOD0)
  }
  for (let i = 0; i < 46; i++) {
    const x = 6 + Math.round((i * 60) / 46)
    const t = (x - 36) / 30
    const y = 4 + Math.round(t * t * 16) + (i % 3)
    dot(g, x, y, i % 3 === 0 ? TONE.grass[2] : i % 2 ? PAL.rose : '#f6f0e0')
    dot(g, x + 1, y + 1, '#f09ab6')
  }
  return { canvas: done(s), body: [{ l: -34, t: -42, r: -20, b: -1 }, { l: 20, t: -42, r: 34, b: -1 }] }
}

// Cartel de bienvenida: tablón sobre dos postes con el nombre del valle en dos líneas.
function welcomeSign() {
  const s = sprite(48, 38)
  const { g } = s
  rect(g, 7, 22, 4, 16, WOOD1)
  rect(g, 7, 22, 1, 16, WOOD3)
  rect(g, 37, 22, 4, 16, WOOD1)
  rect(g, 37, 22, 1, 16, WOOD3)
  rect(g, 2, 2, 44, 22, WOOD0)
  rect(g, 3, 3, 42, 20, WOOD2)
  rect(g, 3, 3, 42, 1, WOOD3)
  rect(g, 3, 22, 42, 1, WOOD1)
  ;[[5, 5], [42, 5], [5, 20], [42, 20]].forEach(([x, y]) => dot(g, x, y, WOOD0))
  const cream = '#f6f0e0'
  const first = 'VALLE DEL'
  const second = 'BUCLE'
  drawText(g, 3 + Math.floor((42 - textWidth(first)) / 2), 6, first, cream)
  drawText(g, 3 + Math.floor((42 - textWidth(second)) / 2), 13, second, cream)
  return { canvas: done(s), body: [{ l: -17, t: -8, r: 17, b: -1 }] }
}

function busStop() {
  const s = sprite(36, 40)
  const { g } = s
  rect(g, 3, 6, 2, 34, STONE1)
  rect(g, 31, 6, 2, 34, STONE1)
  rect(g, 0, 2, 36, 5, '#8a74b4')
  rect(g, 0, 2, 36, 1, '#b8a2e0')
  rect(g, 5, 8, 26, 20, '#cfe8f0')
  rect(g, 5, 8, 26, 3, '#e6f6fb')
  rect(g, 8, 14, 20, 12, '#f6f0e0')
  rect(g, 10, 16, 8, 1, '#8a74b4')
  rect(g, 10, 19, 12, 1, '#c4a0d8')
  rect(g, 10, 22, 6, 1, '#c4a0d8')
  rect(g, 5, 30, 26, 3, WOOD2)
  rect(g, 6, 33, 2, 6, WOOD0)
  rect(g, 28, 33, 2, 6, WOOD0)
  return { canvas: done(s), body: [{ l: -15, t: -10, r: 15, b: -1 }] }
}

// Autobús de líneas amarillas y blancas visto de lado.
function bus() {
  const s = sprite(88, 44)
  const { g } = s
  rect(g, 4, 6, 80, 30, '#f6f0e0')
  rect(g, 6, 4, 76, 2, '#f6f0e0')
  rect(g, 4, 28, 80, 8, '#f2b134')
  rect(g, 4, 25, 80, 3, '#8a74b4')
  rect(g, 4, 6, 80, 2, '#d8d0c0')
  for (let i = 0; i < 5; i++) {
    rect(g, 10 + i * 13, 10, 10, 11, '#6fb3c6')
    rect(g, 10 + i * 13, 10, 10, 3, '#9fd6e0')
  }
  rect(g, 70, 9, 12, 16, '#6fb3c6')
  rect(g, 70, 9, 12, 3, '#9fd6e0')
  rect(g, 78, 10, 4, 14, '#e8a050')
  rect(g, 66, 10, 3, 24, '#d8d0c0')
  rect(g, 82, 30, 4, 4, '#fff6a8')
  ;[18, 62].forEach((x) => {
    ellipse(g, x, 37, 6, 6, '#2e2d4a')
    ellipse(g, x, 37, 3, 3, '#9a98b8')
  })
  return { canvas: done(s), body: [{ l: -42, t: -30, r: 42, b: -4 }] }
}

function towTruck() {
  const s = sprite(72, 44)
  const { g } = s
  rect(g, 30, 14, 36, 18, '#f2c230')
  rect(g, 30, 14, 36, 2, '#f8d77a')
  rect(g, 6, 8, 24, 24, '#f2c230')
  rect(g, 6, 8, 24, 2, '#f8d77a')
  rect(g, 8, 11, 12, 10, '#6fb3c6')
  rect(g, 8, 11, 12, 3, '#9fd6e0')
  rect(g, 2, 24, 28, 9, '#d4a020')
  rect(g, 4, 28, 4, 3, '#fff6a8')
  // Grúa: brazo inclinado con cable y gancho.
  for (let i = 0; i < 28; i++) rect(g, 44 + Math.floor(i * 0.8), 14 - Math.floor(i * 0.5), 3, 3, i % 4 < 2 ? '#8a8aa0' : '#6c6a8c')
  rect(g, 66, 0, 2, 22, STONE1)
  rect(g, 64, 22, 6, 2, STONE1)
  rect(g, 66, 22, 1, 4, STONE0)
  ;[16, 52].forEach((x) => {
    ellipse(g, x, 36, 6, 6, '#2e2d4a')
    ellipse(g, x, 36, 3, 3, '#9a98b8')
  })
  return { canvas: done(s), body: [{ l: -32, t: -30, r: 32, b: -4 }] }
}

// Piscina: lámina de agua con el borde de piedra clara, escalera de barras y cuatro franjas de luz.
function pool() {
  const s = sprite(112, 84)
  const { g } = s
  rect(g, 0, 4, 112, 80, '#e6dcc4')
  rect(g, 0, 4, 112, 3, '#f6f0e0')
  rect(g, 0, 81, 112, 3, '#b8a888')
  for (let x = 8; x < 108; x += 10) rect(g, x, 4, 1, 3, '#b8a888')
  rect(g, 6, 12, 100, 64, '#9ad4e4')
  rect(g, 6, 12, 100, 3, '#d3f0f2')
  for (let y = 15; y < 74; y++) {
    for (let x = 8; x < 104; x++) {
      const wave = Math.sin(x / 5 + y / 3) + Math.sin(x / 9 - y / 4)
      dot(g, x, y, wave > 1.2 ? W4 : wave > 0.2 ? W3 : wave > -0.8 ? '#7ec8dc' : W2)
    }
  }
  rect(g, 6, 12, 100, 1, '#5cb5c6')
  rect(g, 6, 76, 100, 1, '#3e9bb0')
  rect(g, 6, 12, 1, 64, '#5cb5c6')
  rect(g, 105, 12, 1, 64, '#3e9bb0')
  // Escalera de la esquina.
  rect(g, 90, 6, 2, 20, STONE2)
  rect(g, 98, 6, 2, 20, STONE2)
  ;[10, 16, 22].forEach((y) => rect(g, 90, y, 10, 1, STONE1))
  rect(g, 0, 4, 1, 80, '#b8a888')
  rect(g, 111, 4, 1, 80, '#b8a888')
  return { canvas: done(s), body: [{ l: -52, t: -76, r: 52, b: -2 }] }
}

// Estatua de piedra sobre un pedestal; la segunda sostiene un pergamino.
function statue(variant = 0) {
  const s = sprite(28, 48)
  const { g } = s
  rect(g, 4, 34, 20, 14, STONE1)
  rect(g, 4, 34, 20, 3, STONE2)
  rect(g, 4, 46, 20, 2, STONE0)
  rect(g, 8, 14, 12, 20, '#b8b6d0')
  rect(g, 8, 14, 3, 20, '#d8d6e8')
  rect(g, 17, 14, 3, 20, '#8d8aa8')
  ellipse(g, 14, 9, 5, 5.5, '#d0cee4')
  rect(g, 8, 4, 12, 3, '#9a98b8')
  if (variant === 0) {
    rect(g, 6, 22, 8, 7, '#8a74b4')
    rect(g, 6, 22, 8, 1, '#b8a2e0')
  } else {
    rect(g, 18, 18, 4, 14, '#f6f0e0')
    rect(g, 18, 18, 4, 2, '#d8c8a0')
  }
  return { canvas: done(s), body: [{ l: -9, t: -14, r: 9, b: -1 }] }
}

function easel() {
  const s = sprite(24, 32)
  const { g } = s
  rect(g, 5, 8, 2, 24, WOOD1)
  rect(g, 17, 8, 2, 24, WOOD1)
  rect(g, 11, 6, 2, 22, WOOD2)
  rect(g, 3, 20, 18, 2, WOOD1)
  rect(g, 4, 4, 16, 16, '#f6f0e0')
  rect(g, 4, 4, 16, 1, '#ffffff')
  rect(g, 6, 7, 6, 5, '#e07a9c')
  rect(g, 11, 10, 7, 6, '#4aa8d8')
  rect(g, 8, 14, 5, 4, PAL.saffron)
  return { canvas: done(s), body: [{ l: -7, t: -6, r: 7, b: -1 }] }
}

function bench() {
  const s = sprite(28, 18)
  const { g } = s
  rect(g, 3, 2, 22, 5, WOOD2)
  rect(g, 3, 2, 22, 1, WOOD3)
  rect(g, 3, 6, 22, 1, WOOD0)
  rect(g, 2, 9, 24, 3, WOOD1)
  rect(g, 2, 9, 24, 1, WOOD3)
  rect(g, 4, 12, 2, 5, STONE0)
  rect(g, 22, 12, 2, 5, STONE0)
  return { canvas: done(s), body: [{ l: -11, t: -8, r: 11, b: -1 }] }
}

// Farola de hierro con linterna; de noche brilla desde `glow`.
function lamp() {
  const s = sprite(14, 36)
  const { g } = s
  rect(g, 6, 12, 2, 24, '#3a3a52')
  rect(g, 4, 34, 6, 2, '#3a3a52')
  rect(g, 3, 4, 8, 9, '#3a3a52')
  rect(g, 4, 5, 6, 7, '#f8d77a')
  rect(g, 4, 5, 2, 7, '#fff6a8')
  rect(g, 2, 2, 10, 3, '#3a3a52')
  rect(g, 5, 0, 4, 2, '#3a3a52')
  return { canvas: done(s), body: [{ l: -3, t: -4, r: 3, b: -1 }], glow: { dx: 0, dy: -27, r: 12 } }
}

function rocks() {
  const s = sprite(36, 22)
  const { g } = s
  ;[[10, 14, 9, 7], [24, 13, 10, 8], [17, 8, 7, 6]].forEach(([cx, cy, rx, ry]) => {
    ellipse(g, cx, cy, rx, ry, STONE0)
    ellipse(g, cx - 1, cy - 1, rx - 1, ry - 1, STONE1)
    ellipse(g, cx - 2, cy - 2, rx - 4, ry - 4, STONE2)
  })
  ellipse(g, 6, 18, 2, 1, TONE.grass[3])
  return { canvas: done(s), body: [{ l: -15, t: -14, r: 15, b: -1 }] }
}

function umbrella() {
  const s = sprite(36, 44)
  const { g } = s
  rect(g, 17, 10, 2, 26, WOOD1)
  ellipse(g, 18, 9, 16, 7, '#e07a9c')
  for (let i = -15; i <= 15; i += 7) rect(g, 18 + i, 4, 3, 10, '#f6f0e0')
  rect(g, 8, 34, 20, 3, WOOD2)
  rect(g, 10, 37, 2, 6, WOOD0)
  rect(g, 24, 37, 2, 6, WOOD0)
  return { canvas: done(s), body: [{ l: -9, t: -8, r: 9, b: -1 }] }
}

// Tramo de valla de dos teselas de ancho.
function fence() {
  const s = sprite(32, 20)
  const { g } = s
  rect(g, 0, 7, 32, 3, WOOD2)
  rect(g, 0, 7, 32, 1, WOOD3)
  rect(g, 0, 13, 32, 3, WOOD2)
  rect(g, 0, 13, 32, 1, WOOD3)
  ;[2, 16, 30].forEach((x) => {
    rect(g, x - 1, 3, 3, 17, WOOD1)
    rect(g, x - 1, 3, 1, 17, WOOD3)
    rect(g, x - 1, 2, 3, 1, WOOD3)
  })
  return { canvas: done(s), body: [{ l: -16, t: -10, r: 16, b: -1 }] }
}

// Puente de tablones sobre el arroyo: tablas en horizontal con barandilla a los dos lados.
export function bridgeSprite(widthTiles, heightTiles) {
  const w = widthTiles * 16
  const h = heightTiles * 16 + 12
  const s = sprite(w, h)
  const { g } = s
  rect(g, 0, 10, w, h - 20, WOOD2)
  for (let x = 0; x < w; x += 5) {
    rect(g, x, 10, 1, h - 20, WOOD0)
    rect(g, x + 1, 10, 3, h - 20, x % 10 ? WOOD2 : WOOD3)
  }
  ;[2, h - 10].forEach((y) => {
    rect(g, 0, y, w, 3, WOOD1)
    rect(g, 0, y, w, 1, WOOD3)
    for (let x = 4; x < w; x += 16) rect(g, x, y - 5, 3, 9, WOOD0)
  })
  return done(s)
}

export const PROP_KINDS = {
  fountain, noticeboard, postbox, arch, welcomeSign, busStop, bus, towTruck, pool, statue, easel, bench, lamp, rocks, umbrella, fence,
}

// Cada objeto se dibuja una sola vez por variante: devuelve `{ canvas, body, glow? }`.
export function propSprite(kind, variant = 0) {
  return PROP_KINDS[kind](variant)
}
