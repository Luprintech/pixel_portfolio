// Piezas del patio cordobés (Casa del Encuentro): tejas, macetas con flores, faroles, azulejos, mosaico de chinos, pozo y
// limonero. Los colores salen de la ilustración de la usuaria, no de los tonos generales del valle: el azul añil de la
// carpintería, la cal rosada y el barro del tejado son lo que hace reconocible un patio de Córdoba.
import { dot, hash2, line, rect } from '../pixelKit.js'
import { LEAF, flowerClump } from './flowers.js'

export const ROOF = { hi: '#f8a868', light: '#f08848', base: '#e06a36', mid: '#cc5a2e', shade: '#a8442a', dark: '#6e2e1c' }
export const BLUE = { hi: '#4898f8', light: '#1f62d8', base: '#0848c0', mid: '#093ea5', dark: '#06286e', deep: '#04123d' }
export const LIME = { hi: '#fff6f0', base: '#faeae3', mid: '#f1d4c4', shade: '#e0c8c1', dark: '#d7b8ab' }
export const BRICK = { hi: '#f4bd91', base: '#e0663f', mid: '#d55f2b', dark: '#98251a' }
export const IRON = '#1a1a22'
export const LAMP_GLOW = '#f8d878'
export const GLASS = { base: '#a0b8d0', hi: '#dce8f4', curtain: '#f4f2f8', fold: '#c8d0e0' }
// Teja árabe vista de frente, de 5×3: junta oscura a la izquierda, lomo encendido arriba y caída en sombra abajo a la
// derecha. Las filas de arriba salen algo más claras, como en la ilustración, y alguna teja suelta lleva musgo.
const TILE_W = 5
const TILE_H = 3
function tile(g, x, y, w, row, mossy) {
  const [hi, light, base, mid] = mossy ? ['#d8c070', '#c8a050', '#a88a3a', '#8a7030'] : row < 2 ? [ROOF.hi, ROOF.hi, ROOF.light, ROOF.base] : [ROOF.hi, ROOF.light, ROOF.base, ROOF.mid]
  const rows = [[ROOF.dark, hi, light, base, mid], [ROOF.dark, light, base, mid, ROOF.shade], [ROOF.dark, ROOF.shade, ROOF.shade, ROOF.shade, ROOF.dark]]
  rows.forEach((colors, dy) => colors.slice(0, w).forEach((color, dx) => dot(g, x + dx, y + dy, color)))
}

// Tejado visto de frente, más ancho abajo que arriba: el borde izquierdo y el derecho se abren con distinta pendiente
// porque el alero cuelga más por la derecha. Siete hiladas de tejas desfasadas y, debajo, el remate de cal festoneado.
export function roof(g, { top, bottom, left, right }) {
  const rows = Math.floor((bottom - top) / TILE_H)
  for (let row = 0; row < rows; row++) {
    const y = top + row * TILE_H
    const t = (row * TILE_H) / (bottom - top)
    const x0 = Math.round(left.top + (left.bottom - left.top) * t)
    const x1 = Math.round(right.top + (right.bottom - right.top) * t)
    for (let x = x0 - (row % 2 ? 2 : 0); x < x1; x += TILE_W) {
      const from = Math.max(x, x0)
      const w = Math.min(x + TILE_W, x1) - from
      if (w > 0) tile(g, from, y, w, row, hash2(x, row, 11) > 0.982)
    }
    rect(g, x0, y, 1, TILE_H, ROOF.dark)
    rect(g, x1 - 1, y, 1, TILE_H, ROOF.dark)
  }
  const y = top + rows * TILE_H
  rect(g, left.bottom, y, right.bottom - left.bottom, 2, LIME.base)
  rect(g, left.bottom, y, right.bottom - left.bottom, 1, LIME.hi)
  for (let x = left.bottom + 1; x < right.bottom - 1; x += 3) {
    rect(g, x, y + 2, 2, 1, LIME.mid)
    dot(g, x + 2, y + 2, ROOF.dark)
  }
}

// Viga de madera pintada de añil, con su canto de luz arriba y la sombra que proyecta debajo.
export function beam(g, x, y, w, h = 4) {
  rect(g, x, y, w, h, BLUE.base)
  rect(g, x, y, w, 1, BLUE.hi)
  rect(g, x, y + 1, w, 1, BLUE.light)
  rect(g, x, y + h - 1, w, 1, BLUE.dark)
}

// Pie derecho de madera añil: luz en el canto izquierdo y sombra en el derecho.
export function post(g, x, y, h, w = 4) {
  rect(g, x, y, w, h, BLUE.base)
  rect(g, x, y, 1, h, BLUE.hi)
  rect(g, x + w - 1, y, 1, h, BLUE.dark)
}

// Zapata bajo la viga, donde apoya un pie derecho o asoma una cabeza de viga.
export function corbel(g, x, y) {
  rect(g, x, y, 4, 6, BLUE.base)
  rect(g, x, y, 4, 1, BLUE.hi)
  rect(g, x, y, 1, 6, BLUE.light)
  rect(g, x + 3, y, 1, 6, BLUE.dark)
  rect(g, x + 1, y + 5, 2, 1, BLUE.dark)
}

// Farol de forja colgado: gancho, sombrerete, cristal encendido y punta. Devuelve el cristal para encenderlo de noche.
export function lantern(g, cx, top) {
  rect(g, cx, top, 1, 2, IRON)
  rect(g, cx - 1, top + 2, 3, 1, IRON)
  rect(g, cx - 2, top + 3, 5, 1, IRON)
  rect(g, cx - 2, top + 4, 5, 4, IRON)
  rect(g, cx - 1, top + 4, 3, 3, LAMP_GLOW)
  dot(g, cx - 1, top + 4, '#fff6d0')
  rect(g, cx - 1, top + 8, 3, 1, IRON)
  dot(g, cx, top + 9, IRON)
  return { x: cx - 1, y: top + 4, w: 3, h: 3 }
}

// Maceta añil de barro pintado, como las de los patios: borde ancho con luz y cuerpo que se estrecha hacia abajo.
export function pot(g, cx, y, w = 6, h = 5) {
  const x = Math.round(cx - w / 2)
  rect(g, x - 1, y, w + 2, 1, BLUE.hi)
  rect(g, x - 1, y + 1, w + 2, 1, BLUE.base)
  for (let i = 0; i < h - 1; i++) {
    const inset = i >= h - 2 ? 1 : 0
    rect(g, x + inset, y + 2 + i, w - inset * 2, 1, BLUE.base)
    dot(g, x + inset, y + 2 + i, BLUE.light)
    rect(g, x + w - inset - 2, y + 2 + i, 2, 1, BLUE.dark)
  }
}

// Maceta con su mata encima.
export function pottedFlowers(g, cx, potY, kinds, { w = 8, h = 6, potW = 6, seed = 0 } = {}) {
  flowerClump(g, cx, potY - h + 1, w, h, kinds, seed)
  pot(g, cx, potY, potW)
}

// Contrahuella de azulejo: fondo blanco con una cenefa menuda de aspas añiles, como la de la escalera de la ilustración.
export function azulejoRiser(g, x, y, w, h = 3) {
  rect(g, x, y, w, h, '#f4f0fa')
  const motif = [[BLUE.base, null, null, BLUE.light], [null, BLUE.base, BLUE.light, null], [BLUE.mid, null, null, BLUE.base]]
  for (let i = x; i < x + w; i++) {
    for (let row = 0; row < Math.min(h, 3); row++) {
      const color = motif[row][(i - x) % 4]
      if (color) dot(g, i, y + row, color)
    }
  }
}

// Huella de barro de un peldaño, con el canto encendido.
export function brickTread(g, x, y, w, h = 2) {
  rect(g, x, y, w, h, BRICK.base)
  rect(g, x, y, w, 1, BRICK.hi)
  rect(g, x, y + h - 1, w, 1, BRICK.mid)
}

// Empedrado de chinos: puntos claros y oscuros sobre arena, siempre en el mismo orden.
export function pebbles(g, x, y, w, h, inside = () => true) {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      if (!inside(px, py)) continue
      const n = hash2(px, py, 31)
      dot(g, px, py, n < 0.35 ? '#ddcaa6' : n < 0.7 ? '#cfbb96' : n < 0.9 ? '#bca686' : '#e8dabc')
    }
  }
}

// Dibujo del mosaico: un anillo ovalado y una flor de cuatro pétalos en chino oscuro.
export function mosaic(g, cx, cy, rx, ry, inside) {
  const ink = '#4a4e50'
  const plot = (x, y) => inside(Math.round(x), Math.round(y)) && dot(g, x, y, ink)
  for (let a = 0; a < Math.PI * 2; a += 0.01) {
    plot(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry)
  }
  // Pétalos: husos entre el centro y el extremo de cada eje, más anchos en medio.
  const petal = (dx, dy, len, width) => {
    for (let t = 0; t <= 1; t += 0.02) {
      const half = Math.sin(t * Math.PI) * width
      const x = cx + dx * len * t
      const y = cy + dy * len * t
      for (let s = -half; s <= half; s += 0.5) plot(x + dy * s, y + dx * s)
    }
  }
  petal(0, -1, ry - 1.5, 1.6)
  petal(0, 1, ry - 1.5, 1.6)
  petal(-1, 0, rx * 0.66, 1.8)
  petal(1, 0, rx * 0.66, 1.8)
}

// Pozo de piedra encalada: brocal redondo con la boca oscura, cuerpo de sillares con luz a la izquierda y sombra a la
// derecha, arco de forja rematado con un roleo, polea, cuerda y cubo. `x`, `y` es la esquina de arriba a la izquierda del
// brocal, que mide 21 de ancho.
export function well(g, x, y) {
  const cx = x + 10
  // Arco de forja.
  rect(g, x + 1, y - 14, 2, 16, IRON)
  rect(g, x + 18, y - 14, 2, 16, IRON)
  for (let a = Math.PI; a <= Math.PI * 2; a += 0.03) {
    dot(g, cx + 0.5 + Math.cos(a) * 8.5, y - 14 + Math.sin(a) * 7, IRON)
    dot(g, cx + 0.5 + Math.cos(a) * 7.5, y - 14 + Math.sin(a) * 6, IRON)
  }
  ;[[0, -26], [-1, -25], [1, -25], [0, -24], [-3, -25], [-4, -24], [3, -25], [4, -24], [-2, -26], [2, -26], [-5, -23], [5, -23]].forEach(([dx, dy]) => dot(g, cx + dx, y + dy, IRON))
  rect(g, x + 3, y - 13, 15, 1, IRON)
  // Polea, cuerda y cubo.
  rect(g, cx - 1, y - 12, 3, 3, '#a06030')
  dot(g, cx, y - 11, '#e0a050')
  line(g, cx - 1, y - 9, cx - 3, y - 6, '#c89048')
  line(g, cx + 1, y - 9, cx + 5, y - 1, '#c89048')
  rect(g, cx - 5, y - 6, 6, 6, '#9a9aa6')
  rect(g, cx - 5, y - 6, 6, 1, '#e4e4ec')
  rect(g, cx - 4, y - 5, 2, 5, '#c8c8d2')
  rect(g, cx, y - 5, 1, 5, '#6a6a76')
  // Brocal: corona redonda clara alrededor de la boca oscura.
  const ring = (row) => [[6, 15], [2, 19], [1, 20], [1, 20], [2, 19]][row]
  ring(0) && [0, 1, 2, 3, 4].forEach((row) => {
    const [a, b] = ring(row)
    rect(g, x + a, y + row, b - a, 1, row === 0 ? '#fbf3e4' : '#f0e2c8')
  })
  rect(g, x + 4, y + 1, 13, 3, '#3e3028')
  rect(g, x + 5, y + 1, 11, 1, '#241a16')
  rect(g, x + 4, y + 3, 13, 1, '#5a4a40')
  // Cuerpo: luz a la izquierda, sombra a la derecha y los sillares; abajo se curva como el cilindro.
  for (let row = 5; row < 20; row++) {
    const inset = row >= 18 ? row - 17 : 0
    for (let col = inset; col < 21 - inset; col++) {
      const t = col / 20
      dot(g, x + col, y + row, t < 0.15 ? '#f6ead4' : t < 0.55 ? '#e8d6b6' : t < 0.8 ? '#d2b892' : '#b4966e')
    }
  }
  rect(g, x, y + 5, 21, 1, '#c8ae8c')
  for (let row = 0; row < 3; row++) {
    const ry = y + 9 + row * 4
    rect(g, x + 1, ry, 19, 1, '#c8ae8c')
    ;[3, 8, 13, 17].forEach((bx, i) => (i + row) % 2 === 0 && rect(g, x + bx, ry - 3, 1, 3, '#c8ae8c'))
  }
  // Contorno propio: el brocal se pinta sobre el empedrado, así que el contorno general del dibujo no lo separa del suelo.
  const ink = '#7a6448'
  rect(g, x + 6, y - 1, 9, 1, ink)
  rect(g, x + 2, y, 4, 1, ink)
  rect(g, x + 15, y, 4, 1, ink)
  rect(g, x - 1, y + 2, 1, 16, ink)
  rect(g, x + 21, y + 2, 1, 16, ink)
  dot(g, x, y + 1, ink)
  dot(g, x + 20, y + 1, ink)
  dot(g, x, y + 18, ink)
  dot(g, x + 20, y + 18, ink)
  rect(g, x + 1, y + 19, 2, 1, ink)
  rect(g, x + 18, y + 19, 2, 1, ink)
  rect(g, x + 3, y + 20, 15, 1, ink)
}

// Limonero: copa abultada hecha de racimos de hojas en cinco verdes, más oscura por abajo y a la derecha, y tronco que se
// tuerce un poco hasta el suelo del patio.
const LEMON_BLOBS = [[0, 0, 8, 7], [-6, 4, 6, 6], [6, 3, 6, 6], [-4, 11, 7, 6], [5, 11, 7, 6], [0, 16, 7, 6], [-7, 17, 5, 5], [7, 18, 5, 5], [1, 22, 5, 4]]
export function lemonTree(g, cx, top, trunkBottom) {
  for (let y = top + 20; y <= trunkBottom; y++) {
    const x = cx - 3 + Math.round(Math.sin((y - top) / 8) * 1.2)
    rect(g, x, y, 5, 1, '#9a5a28')
    dot(g, x, y, '#d88038')
    dot(g, x + 1, y, '#b87030')
    dot(g, x + 4, y, '#583018')
  }
  LEMON_BLOBS.forEach(([bx, by, rx, ry], i) => {
    const ox = cx + bx
    const oy = top + ry + by
    for (let y = oy - ry; y < oy + ry; y++) {
      for (let x = ox - rx; x < ox + rx; x++) {
        const dx = (x + 0.5 - ox) / rx
        const dy = (y + 0.5 - oy) / ry
        if (dx * dx + dy * dy > 0.85 + hash2(x, y, i) * 0.3) continue
        const light = -dx * 0.55 - dy * 0.65 - by / 30 + (hash2(x, y, 9) - 0.5) * 0.8
        dot(g, x, y, light > 0.6 ? LEAF.hi : light > 0.15 ? LEAF.light : light > -0.35 ? LEAF.mid : light > -0.8 ? LEAF.dark : LEAF.deep)
      }
    }
  })
}

export function lemon(g, x, y) {
  rect(g, x, y, 2, 3, '#f8d808')
  dot(g, x, y, '#fff27a')
  dot(g, x + 1, y + 2, '#d8a000')
}
