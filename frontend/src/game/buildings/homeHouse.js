// Exterior de la casa de Lupe según la ilustración de la usuaria: casa encalada de dos plantas con tejado de teja árabe,
// chimenea, buhardilla, esquinas de sillar, contraventanas lavanda, jardineras de geranios, puerta de tablones bajo un
// tejadillo con ménsulas de forja, farol, placa, macetas añiles y una enredadera; y la sala baja de la cubierta con sus
// ventanas de visillo. Todo va en píxeles del dibujo de la casa (`homeSprite`), que mide 304×160. La casa de dos plantas
// ocupa de x 153 a 301 y su puerta queda centrada en la columna 227, la misma de siempre, para que la tesela de entrada
// no cambie.
import { dot, line, rect } from '../pixelKit.js'
import { FLOWERS, LEAF, geraniums } from './flowers.js'
import { litPane } from './litPane.js'
import { lupePlaque } from './homeFacade.js'

export const HOME_DOOR_COL = 227
const ROOF = { hi: '#f4a888', light: '#e88a6a', base: '#d47258', mid: '#bc5c48', shade: '#96443a', dark: '#5a2a24' }
const LIME = { hi: '#fbf2ec', base: '#f6e8e0', blot: '#efdcd2', shade: '#e6d0c4' }
const SANDSTONE = { hi: '#f0d6ac', base: '#dcb48a', shade: '#b48a68', dark: '#8a6448' }
export const SKIRT = { hi: '#aaa2d2', base: '#8478a8', dark: '#5e5488' }
const SHUTTER = { hi: '#b2aada', base: '#9084b4', dark: '#6a5e9c' }
const WOOD = { hi: '#e6a068', base: '#c67842', mid: '#a45e32', dark: '#6a3a20' }
const FRAME = { base: '#8a5a3a', dark: '#5a3620' }
const GLASS = { hi: '#fff2b8', base: '#fcd284', shade: '#e8b060' }
const IRON = '#2a2228'
const POT = { hi: '#6a84d0', base: '#3e58b0', dark: '#283c80' }

// Teja árabe de 8×5 vista de frente: lomo redondeado con brillo arriba a la izquierda, caída en sombra a la derecha y el
// borde de abajo festoneado, que con las tejas vecinas dibuja la onda de cada hilada.
const TILE_ROWS = [
  ['dark', 'shade', 'hi', 'hi', 'light', 'base', 'mid', 'dark'],
  ['dark', 'hi', 'light', 'base', 'base', 'base', 'mid', 'shade'],
  ['dark', 'light', 'base', 'base', 'base', 'mid', 'mid', 'shade'],
  ['dark', 'base', 'base', 'base', 'mid', 'mid', 'shade', 'shade'],
  ['dark', 'dark', 'shade', 'mid', 'mid', 'shade', 'dark', 'dark'],
]
function barrelTile(g, x, y, w, h = 5) {
  const rows = h === 5 ? TILE_ROWS : [TILE_ROWS[0], TILE_ROWS[1], TILE_ROWS[3], TILE_ROWS[4]]
  rows.forEach((row, dy) => row.slice(0, w).forEach((tone, dx) => dot(g, x + dx, y + dy, ROOF[tone])))
}

// Faldón de teja: un trapecio de hiladas desfasadas, con los bordes en sombra.
function tiledSlope(g, { top, rows, left, right, rowH = 5 }) {
  for (let row = 0; row < rows; row++) {
    const y = top + row * rowH
    const t = rows === 1 ? 1 : row / (rows - 1)
    const x0 = Math.round(left[0] + (left[1] - left[0]) * t)
    const x1 = Math.round(right[0] + (right[1] - right[0]) * t)
    for (let x = x0 - (row % 2 ? 4 : 0); x < x1; x += 8) {
      const from = Math.max(x, x0)
      const w = Math.min(x + 8, x1) - from
      if (w > 0) barrelTile(g, from, y, w, rowH)
    }
    rect(g, x0, y, 1, rowH, ROOF.dark)
    rect(g, x1 - 1, y, 1, rowH, ROOF.dark)
  }
}

// Chimenea encalada con su caperuza de barro; el tejado tapa su base.
function chimney(g) {
  rect(g, 268, 14, 16, 18, LIME.base)
  rect(g, 268, 14, 2, 18, LIME.hi)
  rect(g, 281, 14, 3, 18, LIME.shade)
  rect(g, 267, 14, 18, 2, SANDSTONE.shade)
  rect(g, 265, 10, 22, 4, ROOF.base)
  rect(g, 265, 10, 22, 1, ROOF.hi)
  rect(g, 265, 13, 22, 1, ROOF.shade)
  rect(g, 284, 10, 2, 4, ROOF.mid)
}

// Tejado principal, alero oscuro festoneado y las cabezas de las vigas que asoman bajo él.
function roof(g) {
  tiledSlope(g, { top: 26, rows: 6, left: [163, 148], right: [282, 303] })
  rect(g, 148, 56, 156, 2, ROOF.dark)
  for (let x = 148; x < 303; x += 8) rect(g, x + 1, 56, 6, 1, ROOF.shade)
  rect(g, 151, 58, 151, 1, '#4a2a20')
  for (let x = 156; x < 300; x += 16) {
    rect(g, x, 59, 5, 4, '#6c3c30')
    rect(g, x, 59, 5, 1, '#8a5040')
    rect(g, x + 4, 59, 1, 4, '#4a2a20')
  }
}

// Buhardilla: frontón de teja, pared encalada y ventanita encendida con cruceta.
function dormer(s) {
  const { g } = s
  rect(g, 216, 38, 24, 14, LIME.base)
  rect(g, 216, 38, 24, 1, LIME.shade)
  for (let i = 0; i <= 10; i++) {
    const y = 31 + Math.round(i * 0.8)
    rect(g, 226 - Math.round(i * 1.5), y, 4, 2, i % 2 ? ROOF.base : ROOF.light)
    rect(g, 226 + Math.round(i * 1.5), y, 4, 2, i % 2 ? ROOF.mid : ROOF.base)
  }
  line(g, 213, 41, 227, 31, ROOF.dark)
  line(g, 228, 31, 243, 41, ROOF.dark)
  line(g, 214, 42, 227, 33, ROOF.hi)
  line(g, 228, 33, 242, 42, ROOF.shade)
  rect(g, 221, 43, 13, 9, FRAME.base)
  rect(g, 222, 44, 11, 7, GLASS.base)
  rect(g, 222, 44, 11, 2, GLASS.hi)
  rect(g, 227, 44, 1, 7, FRAME.base)
  rect(g, 222, 47, 11, 1, FRAME.base)
  s.windows.push(...litPane(222, 44, 11, 7, [{ x: 5, y: 0, w: 1, h: 7 }, { x: 0, y: 3, w: 11, h: 1 }]))
}

// Pared encalada con manchas suaves de cal, esquinas de sillar alternas y zócalo lavanda.
function facade(g) {
  rect(g, 153, 58, 149, 92, LIME.base)
  rect(g, 153, 59, 149, 3, LIME.shade)
  ;[[170, 84], [205, 70], [250, 82], [280, 140], [240, 140], [190, 132], [275, 108]].forEach(([x, y]) => {
    rect(g, x, y, 5, 1, LIME.blot)
    rect(g, x + 1, y + 1, 3, 1, LIME.blot)
  })
  ;[153, 293].forEach((edge, side) => {
    for (let y = 64, i = 0; y < 146; y += 8, i++) {
      const w = i % 2 ? 6 : 9
      const x = side ? edge + 9 - w : edge
      rect(g, x, y, w, 7, SANDSTONE.base)
      rect(g, x, y, w, 1, SANDSTONE.hi)
      rect(g, x, y + 6, w, 1, SANDSTONE.shade)
      rect(g, side ? x : x + w - 1, y, 1, 7, SANDSTONE.shade)
    }
  })
}

// Zócalo lavanda a lo largo de toda la fachada (sala baja y casa).
export function skirting(g, x0, x1) {
  rect(g, x0, 149, x1 - x0, 11, SKIRT.base)
  rect(g, x0, 149, x1 - x0, 1, SKIRT.hi)
  rect(g, x0, 158, x1 - x0, 2, SKIRT.dark)
}

// Dintel o alféizar de sillar.
function stoneBar(g, x, y, w, h = 3) {
  rect(g, x, y, w, h, SANDSTONE.base)
  rect(g, x, y, w, 1, SANDSTONE.hi)
  rect(g, x, y + h - 1, w, 1, SANDSTONE.shade)
}

// Ventana pequeña de la planta alta: cuatro cristales encendidos en marco de madera, dintel y alféizar de piedra.
function smallWindow(s, x, y) {
  const { g } = s
  stoneBar(g, x - 2, y - 3, 18)
  rect(g, x, y, 14, 12, FRAME.base)
  rect(g, x + 1, y + 1, 12, 10, GLASS.base)
  rect(g, x + 1, y + 1, 12, 2, GLASS.hi)
  rect(g, x + 6, y + 1, 2, 10, FRAME.base)
  rect(g, x + 1, y + 5, 12, 1, FRAME.base)
  stoneBar(g, x - 2, y + 12, 18)
  s.windows.push(...litPane(x + 1, y + 1, 12, 10, [{ x: 5, y: 0, w: 2, h: 10 }, { x: 0, y: 4, w: 12, h: 1 }]))
}

// Contraventana de lamas lavanda.
function shutter(g, x, y, h) {
  rect(g, x, y, 9, h, SHUTTER.base)
  rect(g, x, y, 9, 1, SHUTTER.hi)
  rect(g, x, y, 1, h, SHUTTER.hi)
  rect(g, x + 8, y, 1, h, SHUTTER.dark)
  for (let ly = y + 3; ly < y + h - 2; ly += 3) {
    rect(g, x + 2, ly, 5, 1, SHUTTER.dark)
    rect(g, x + 2, ly + 1, 5, 1, SHUTTER.hi)
  }
}

// Jardinera de barro con geranios y sus ménsulas de forja debajo del alféizar.
function flowerBox(g, x, y, w, kind, seed) {
  for (let cx = x + 4; cx < x + w - 2; cx += 6) geraniums(g, cx, y - 1, 9, 9, kind, seed + cx)
  rect(g, x, y + 7, w, 5, '#b4583a')
  rect(g, x, y + 7, w, 1, '#d47a52')
  rect(g, x, y + 11, w, 1, '#7a3422')
}

function ironBracket(g, x, y, flip) {
  const d = flip ? -1 : 1
  line(g, x, y, x + 5 * d, y, IRON)
  line(g, x + d, y, x + d, y + 4, IRON)
  ;[[2, 2], [3, 3], [4, 3], [5, 2], [4, 1]].forEach(([dx, dy]) => dot(g, x + dx * d, y + dy, IRON))
}

// Ventana grande de la planta alta: dintel, contraventanas, cristal encendido con lo que se ve dentro, jardinera, alféizar
// y ménsulas. `inside` pinta el interior y devuelve las zonas que no se encienden de noche.
function bigWindow(s, x, y, flowers, inside) {
  const { g } = s
  stoneBar(g, x - 6, y - 6, 37)
  shutter(g, x - 10, y - 1, 30)
  shutter(g, x + 25, y - 1, 30)
  rect(g, x - 1, y - 1, 27, 30, FRAME.base)
  rect(g, x, y, 25, 28, GLASS.base)
  rect(g, x, y, 25, 3, GLASS.hi)
  const holes = inside(g, x, y)
  flowerBox(g, x, y + 16, 25, flowers, x)
  stoneBar(g, x - 6, y + 28, 37)
  ironBracket(g, x + 3, y + 31, false)
  ironBracket(g, x + 21, y + 31, true)
  s.windows.push(...litPane(x, y, 25, 16, holes))
}

// Lo que se ve por la ventana de la izquierda: visillo de encaje arriba y la estantería con libros del cuarto de Lupe.
function shelfInside(g, x, y) {
  rect(g, x, y, 25, 4, '#f4ece0')
  for (let i = 0; i < 25; i += 3) dot(g, x + i + 1, y + 4, '#f4ece0')
  for (let i = 0; i < 25; i += 2) dot(g, x + i, y + 1, '#e2d4c4')
  rect(g, x + 2, y + 14, 21, 1, FRAME.dark)
  rect(g, x + 2, y + 9, 21, 1, FRAME.dark)
  ;['#8a3a3a', '#3f5f9e', '#c8902e', '#6b8f4e', '#7a4a8a', '#a8603a', '#3f5f9e', '#8a3a3a', '#c8902e'].forEach((color, i) => {
    rect(g, x + 3 + i * 2, y + 10 + (i % 3 === 1 ? 1 : 0), 2, 4 - (i % 3 === 1 ? 1 : 0), color)
    rect(g, x + 4 + i * 2, y + 5 + (i % 2), 1, 4 - (i % 2), i % 2 ? '#6b8f4e' : '#a8603a')
  })
  return [{ x: 0, y: 0, w: 25, h: 5 }, { x: 2, y: 5, w: 21, h: 10 }]
}

// Lo que se ve por la de la derecha: cristal encendido con su cruceta y una planta en el alféizar de dentro.
function plantInside(g, x, y) {
  rect(g, x + 12, y, 2, 16, FRAME.base)
  rect(g, x, y + 7, 25, 1, FRAME.base)
  ;[[15, 8], [16, 6], [17, 9], [18, 5], [19, 8], [14, 10], [20, 10]].forEach(([dx, dy]) => {
    rect(g, x + dx, y + dy, 1, 15 - dy, LEAF.mid)
    dot(g, x + dx, y + dy, LEAF.light)
  })
  return [{ x: 12, y: 0, w: 2, h: 16 }, { x: 0, y: 7, w: 25, h: 1 }, { x: 14, y: 5, w: 7, h: 11 }]
}

// Tejadillo de teja sobre la puerta, con sus dos ménsulas de forja en voluta.
function awning(g) {
  tiledSlope(g, { top: 89, rows: 3, left: [216, 209], right: [239, 246], rowH: 4 })
  rect(g, 210, 100, 35, 1, ROOF.dark)
  ;[[214, false], [240, true]].forEach(([x, flip]) => {
    const d = flip ? -1 : 1
    line(g, x, 101, x, 109, IRON)
    line(g, x, 101, x + 6 * d, 101, IRON)
    ;[[2, 3], [3, 4], [4, 4], [5, 3], [5, 2], [4, 1], [1, 6], [2, 7]].forEach(([dx, dy]) => dot(g, x + dx * d, 101 + dy, IRON))
  })
}

// Puerta de tablones con clavos y aldaba, en su marco de sillar con escalón.
function door(g) {
  rect(g, 215, 108, 25, 50, SANDSTONE.base)
  rect(g, 215, 108, 25, 1, SANDSTONE.hi)
  rect(g, 215, 108, 1, 50, SANDSTONE.hi)
  rect(g, 239, 108, 1, 50, SANDSTONE.shade)
  for (let y = 113; y < 156; y += 9) {
    rect(g, 215, y, 4, 1, SANDSTONE.shade)
    rect(g, 236, y + 4, 4, 1, SANDSTONE.shade)
  }
  rect(g, 219, 114, 17, 43, WOOD.dark)
  for (let x = 220; x < 235; x += 4) {
    rect(g, x, 115, 3, 41, WOOD.base)
    rect(g, x, 115, 1, 41, WOOD.hi)
    rect(g, x + 3, 115, 1, 41, WOOD.mid)
  }
  ;[118, 152].forEach((y) => [221, 225, 229, 233].forEach((x) => dot(g, x, y, '#3a2418')))
  for (let a = 0; a < Math.PI * 2; a += 0.4) dot(g, 227 + Math.cos(a) * 2, 130 + Math.sin(a) * 2, IRON)
  rect(g, 226, 126, 3, 2, IRON)
  rect(g, 213, 157, 29, 3, SANDSTONE.base)
  rect(g, 213, 157, 29, 1, SANDSTONE.hi)
}

// Farol de forja colgado de la pared, a la izquierda de la puerta: brazo, sombrerete, cristal encendido y punta.
function wallLantern(s) {
  const { g } = s
  rect(g, 207, 118, 5, 1, IRON)
  rect(g, 208, 119, 1, 2, IRON)
  rect(g, 206, 121, 5, 1, IRON)
  rect(g, 206, 122, 5, 6, IRON)
  rect(g, 207, 123, 3, 4, GLASS.base)
  dot(g, 207, 123, GLASS.hi)
  rect(g, 207, 128, 3, 1, IRON)
  dot(g, 208, 129, IRON)
  s.windows.push({ x: 207, y: 123, w: 3, h: 4 })
}

// Maceta añil de barro con geranios: boca ancha, panza redonda y pie estrecho.
const POT_ROWS = [11, 11, 9, 11, 11, 11, 11, 9, 7]
function bluePot(g, cx, kind, seed) {
  geraniums(g, cx, 135, 13, 12, kind, seed)
  POT_ROWS.forEach((w, i) => {
    const x = cx - Math.floor(w / 2)
    rect(g, x, 147 + i, w, 1, i === 0 ? POT.hi : POT.base)
    if (i > 1) {
      rect(g, x + 1, 147 + i, 2, 1, POT.hi)
      rect(g, x + w - 2, 147 + i, 2, 1, POT.dark)
    }
  })
  rect(g, cx - 5, 148, 11, 1, POT.dark)
}

// Rosal trepador en la esquina derecha: tallo en zigzag, hojas y flores rosas.
function climbingRose(g) {
  for (let y = 92; y < 149; y++) {
    const x = 296 + Math.round(Math.sin(y / 6) * 2.5)
    dot(g, x, y, '#6a4030')
    if (y % 4 === 0) {
      rect(g, x - 3, y, 3, 2, LEAF.mid)
      dot(g, x - 3, y, LEAF.light)
    }
    if (y % 4 === 2) {
      rect(g, x + 1, y, 3, 2, LEAF.dark)
      dot(g, x + 2, y, LEAF.mid)
    }
    if (y % 7 === 3) {
      const [dark, , base, light] = FLOWERS.pink
      rect(g, x + (y % 2 ? 1 : -2), y, 2, 2, base)
      dot(g, x + (y % 2 ? 1 : -2), y, light)
      dot(g, x + (y % 2 ? 2 : -1), y + 1, dark)
    }
  }
}

// Ventanas grandes, para la luz que reparten de noche (`homeLight.js`).
export const BIG_WINDOWS = [{ x: 172, y: 92, w: 25, h: 28 }, { x: 255, y: 92, w: 25, h: 28 }]
export const DOOR_LIGHT = { x: 227, lantern: { x: 208, y: 124 } }

// La casa de dos plantas, de atrás adelante.
export function drawHouse(s) {
  const { g } = s
  chimney(g)
  facade(g)
  skirting(g, 153, 302)
  roof(g)
  dormer(s)
  smallWindow(s, 177, 66)
  smallWindow(s, 260, 66)
  bigWindow(s, 172, 92, 'red', shelfInside)
  bigWindow(s, 255, 92, 'pink', plantInside)
  awning(g)
  door(g)
  wallLantern(s)
  lupePlaque(g, 245, 128)
  bluePot(g, 208, 'red', 70)
  bluePot(g, 246, 'pink', 71)
  climbingRose(g)
  s.doorCol = HOME_DOOR_COL
}

// Ventana de la sala baja: dintel y alféizar de sillar, marco de madera, visillo de encaje y jardinera de geranios.
export function lowerRoomWindow(s, x, y, w, h, kind) {
  const { g } = s
  stoneBar(g, x - 4, y - 4, w + 8, 3)
  rect(g, x - 1, y - 1, w + 2, h + 2, FRAME.base)
  rect(g, x, y, w, h, GLASS.base)
  rect(g, x, y, w, 2, GLASS.hi)
  rect(g, x + Math.floor(w / 2) - 1, y, 2, h, FRAME.base)
  rect(g, x, y, w, 4, '#f4ece0')
  for (let i = 0; i < w; i += 3) dot(g, x + i + 1, y + 4, '#f4ece0')
  flowerBox(g, x + 3, y + h - 10, w - 6, kind, x)
  stoneBar(g, x - 4, y + h + 1, w + 8, 3)
  s.windows.push(...litPane(x, y, w, h - 10, [{ x: 0, y: 0, w, h: 5 }, { x: Math.floor(w / 2) - 1, y: 0, w: 2, h }]))
}

// Maceta añil sobre un taburete de madera, en las esquinas del fondo de la cubierta.
export function deckPot(g, cx, kind, seed) {
  const top = 54
  geraniums(g, cx, top, 12, 11, kind, seed)
  rect(g, cx - 5, top + 9, 11, 2, POT.hi)
  rect(g, cx - 4, top + 11, 9, 6, POT.base)
  rect(g, cx - 3, top + 11, 2, 6, POT.hi)
  rect(g, cx + 2, top + 11, 2, 6, POT.dark)
  rect(g, cx - 6, top + 17, 13, 2, WOOD.base)
  rect(g, cx - 6, top + 17, 13, 1, WOOD.hi)
  rect(g, cx - 5, top + 19, 2, 8, WOOD.mid)
  rect(g, cx + 3, top + 19, 2, 8, WOOD.mid)
}
