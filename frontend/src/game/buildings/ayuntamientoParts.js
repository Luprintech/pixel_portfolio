// Piezas de dibujo del Ayuntamiento de Córdoba (el edificio real de la calle Capitulares): remates de la cubierta, alero de
// terracota, galería de arcos, parapeto, inscripción, pilares de sillería, paños de ladrillo, ventanales con marco dorado,
// barandilla, puertas de cristal, banderas colgadas, escultura de sillares y macetones con arbustos. Sin lógica de composición:
// `ayuntamiento.js` decide dónde va cada una. La luz viene de arriba a la izquierda, como en el resto del valle.
import { dot, rect } from '../pixelKit.js'
import { drawText, textWidth } from '../pixelFont.js'
import { archShape } from './mosqueParts.js'
import { iconAt } from './shared.js'

// Piedra rosada de la fachada, de la cara iluminada a la junta más honda.
export const STONE = { light: '#f6e4cc', base: '#e8ccb0', mid: '#d9b898', dark: '#c49c7e', deep: '#9e7a60' }
// Terracota del alero, los dinteles y las losas del balcón.
export const CLAY = { light: '#f29a48', base: '#e0782c', dark: '#b8561e', deep: '#8a3c14' }
const BRICK = { light: '#e09a62', base: '#cc8452', mortar: '#a8663a' }
const GOLD = { light: '#f8d872', base: '#f2c64a', dark: '#c8961e' }
const GLASS = { sky: '#9fd6e0', base: '#6fb3c6' }
const RAIL = '#1c1b3a'
const INK = '#3a2a2a'
const LEAF = ['#2f5a34', '#4f7f3f', '#7da844']
const POT = ['#4a4a5a', '#6c6a7c']

// Remate de la cubierta: una corona de piedra con cuatro agujas y un escudo de terracota y oro en el centro.
export function crownFinial(g, cx, bottom) {
  rect(g, cx - 9, bottom - 5, 18, 5, STONE.light)
  rect(g, cx - 9, bottom - 1, 18, 1, STONE.dark)
  rect(g, cx - 4, bottom - 9, 8, 7, CLAY.base)
  rect(g, cx - 3, bottom - 8, 6, 4, GOLD.base)
  rect(g, cx - 3, bottom - 8, 2, 1, GOLD.light)
  ;[-8, -5, 3, 6].forEach((dx) => {
    const h = dx === -5 || dx === 3 ? 13 : 9
    rect(g, cx + dx, bottom - h, 2, h - 4, STONE.light)
    rect(g, cx + dx + 1, bottom - h, 1, h - 4, STONE.mid)
    dot(g, cx + dx, bottom - h - 1, STONE.light)
  })
  rect(g, cx - 1, bottom - 14, 2, 5, STONE.light)
  dot(g, cx, bottom - 15, GOLD.base)
}

// Losa de la cubierta vista de canto: cornisa clara con dentículos arriba y sombra debajo.
export function roofCap(g, x, w, top) {
  for (let dx = 1; dx < w - 1; dx += 3) dot(g, x + dx, top, STONE.light)
  rect(g, x, top + 1, w, 5, STONE.light)
  rect(g, x, top + 3, w, 1, STONE.mid)
  rect(g, x, top + 5, w, 1, STONE.deep)
}

// Alero de terracota bajo la losa: una banda recta sobre la galería y, a cada lado, el vuelo inclinado que baja hasta ella.
export function eave(g, { capLeft, capRight, innerLeft, innerRight, top, bottom }) {
  for (let y = top; y < bottom; y++) {
    const t = (y - top) / (bottom - top)
    const left = Math.round(capLeft + (innerLeft - capLeft) * t)
    const right = Math.round(capRight - (capRight - innerRight) * t)
    const tone = y % 3 === 0 ? CLAY.dark : CLAY.base
    rect(g, left, y, innerLeft - left, 1, tone)
    rect(g, innerRight, y, right - innerRight, 1, tone)
    dot(g, left, y, CLAY.deep)
    dot(g, right - 1, y, CLAY.deep)
  }
  rect(g, innerLeft, top, innerRight - innerLeft, 4, CLAY.base)
  rect(g, innerLeft, top, innerRight - innerLeft, 1, CLAY.light)
  rect(g, innerLeft, top + 3, innerRight - innerLeft, 1, CLAY.dark)
}

// Galería superior: arcos de medio punto con el fondo de terracota, columnillas claras y medallones dorados en los extremos.
// Devuelve el ancho total, para centrarla.
export function archGallery(g, { x, top, bottom, count, archW, gap }) {
  const w = count * (archW + gap) + gap
  rect(g, x, top, w, bottom - top, STONE.light)
  for (let i = 0; i < count; i++) {
    const ax = x + gap + i * (archW + gap)
    archShape(g, ax, top + 2, archW, bottom - top - 2, CLAY.base)
    archShape(g, ax + 1, top + 3, archW - 2, 4, CLAY.light)
    rect(g, ax + archW, top + 3, 1, bottom - top - 3, STONE.dark)
    if (i === 0 || i === count - 1) {
      const mx = ax + Math.floor(archW / 2)
      rect(g, mx - 2, top + 8, 5, 3, GOLD.base)
      rect(g, mx - 1, top + 7, 3, 5, GOLD.base)
      dot(g, mx, top + 9, GOLD.dark)
    }
  }
  rect(g, x, top + 1, w, 1, STONE.mid)
  return w
}

// Paño de sillería: hiladas de cuatro píxeles con juntas desfasadas.
export function stoneWall(g, x, y, w, h) {
  rect(g, x, y, w, h, STONE.base)
  for (let row = y + 3; row < y + h; row += 4) {
    rect(g, x, row, w, 1, STONE.mid)
    const offset = ((row - y - 3) / 4) % 2 ? 5 : 0
    for (let joint = x + offset; joint < x + w; joint += 10) rect(g, joint, row - 3, 1, 3, STONE.mid)
  }
  rect(g, x, y, 1, h, STONE.light)
}

// Parapeto delantero: bloques macizos de sillería que asoman por encima de tramos de antepecho calado, sobre un muro corrido.
// `blocks` son los bordes izquierdos de cada bloque.
export function parapet(g, { x, w, top, bottom, blocks, blockW }) {
  const railTop = top + 5
  const wallTop = top + 12
  rect(g, x, railTop, w, 2, STONE.light)
  rect(g, x, railTop + 2, w, wallTop - railTop - 2, STONE.dark)
  for (let bx = x + 1; bx < x + w - 1; bx += 3) rect(g, bx, railTop + 2, 2, wallTop - railTop - 2, STONE.light)
  stoneWall(g, x, wallTop, w, bottom - wallTop)
  blocks.forEach((bx) => {
    stoneWall(g, bx, top, blockW, wallTop - top + 2)
    rect(g, bx, top, blockW, 1, STONE.light)
    rect(g, bx + blockW - 1, top, 1, wallTop - top + 2, STONE.deep)
    // Detalle geométrico del bloque: un rombo rehundido.
    const cx = bx + Math.floor(blockW / 2)
    ;[[0, 3], [-1, 4], [1, 4], [-2, 5], [2, 5], [-1, 6], [1, 6], [0, 7]].forEach(([dx, dy]) => dot(g, cx + dx, top + dy, STONE.dark))
  })
  rect(g, x, bottom - 1, w, 1, STONE.deep)
}

// Pilar de sillería que baja del parapeto al zócalo: canto claro y sombra a la derecha.
export function pier(g, x, top, bottom, w = 8) {
  stoneWall(g, x, top, w, bottom - top)
  rect(g, x, top, 2, bottom - top, STONE.light)
  rect(g, x + w - 1, top, 1, bottom - top, STONE.deep)
}

// Paño de ladrillo visto, a soga, con llagas desfasadas.
export function brickWall(g, x, y, w, h) {
  rect(g, x, y, w, h, BRICK.base)
  for (let row = y, n = 0; row < y + h; row += 3, n++) {
    rect(g, x, row + 2, w, 1, BRICK.mortar)
    const offset = n % 2 ? 3 : 0
    for (let joint = x + offset; joint < x + w; joint += 6) rect(g, joint, row, 1, 2, BRICK.mortar)
    if (n % 4 === 1) rect(g, x + 1 + offset, row, 4, 1, BRICK.light)
  }
}

// Dintel o losa de terracota con su canto claro y la sombra dura debajo.
export function clayBeam(g, x, y, w, h) {
  rect(g, x, y, w, h, CLAY.base)
  rect(g, x, y, w, 1, CLAY.light)
  rect(g, x, y + h - 1, w, 1, CLAY.dark)
  rect(g, x, y + h, w, 1, CLAY.deep)
}

// Copas de árboles reflejadas en el cristal: una línea ondulada de verdes al pie de cada hoja.
function treeReflection(g, x, y, w, h, seed) {
  for (let i = 0; i < w; i++) {
    const crown = Math.min(h - 1, 2 + ((i + seed * 3) % 5 > 2 ? 2 : 0) + ((i * 7 + seed) % 3 === 0 ? 1 : 0))
    const top = y + h - crown
    rect(g, x + i, top, 1, crown, i % 2 ? LEAF[1] : LEAF[0])
    if (i % 3 === 0) dot(g, x + i, top, LEAF[2])
  }
}

// Ventanal con carpintería dorada: cielo reflejado arriba, copas de árboles abajo, montantes cada `pane` píxeles y un travesaño.
// Cada hoja se registra por separado para encenderse de noche, así la carpintería se sigue viendo.
export function glassWall(s, x, y, w, h, { pane = 9, transom = 0.35, trees = true } = {}) {
  const { g } = s
  rect(g, x, y, w, h, GOLD.dark)
  rect(g, x, y, w, 1, GOLD.light)
  const inner = { x: x + 1, y: y + 1, w: w - 2, h: h - 2 }
  const transomY = inner.y + Math.round(inner.h * transom)
  const columns = Math.max(1, Math.round(inner.w / pane))
  for (let c = 0; c < columns; c++) {
    const px = Math.round(inner.x + (c * inner.w) / columns)
    const pw = Math.round(inner.x + ((c + 1) * inner.w) / columns) - px - (c < columns - 1 ? 1 : 0)
    ;[[inner.y, transomY - inner.y - 1], [transomY, inner.y + inner.h - transomY]].forEach(([py, ph], lower) => {
      if (ph < 2 || pw < 2) return
      rect(g, px, py, pw, ph, GLASS.base)
      rect(g, px, py, pw, Math.max(1, Math.floor(ph / 3)), GLASS.sky)
      if (trees && lower) treeReflection(g, px, py, pw, ph, c)
      dot(g, px, py, '#ffffff')
      s.windows.push({ x: px, y: py, w: pw, h: ph })
    })
  }
}

// Barandilla corrida de hierro negro: pasamanos doble y barrotes cada dos píxeles.
export function railing(g, x, y, w) {
  rect(g, x, y, w, 1, RAIL)
  rect(g, x, y + 1, w, 1, '#3a3a5a')
  for (let bx = x; bx < x + w; bx += 2) rect(g, bx, y + 2, 1, 5, RAIL)
  rect(g, x, y + 7, w, 1, RAIL)
}

// Puertas de cristal de dos hojas con marco dorado y tiradores; `x` es su borde izquierdo y `bottom` la fila donde apoyan.
export function glassDoors(s, x, w, top, bottom) {
  const { g } = s
  rect(g, x, top, w, bottom - top, GOLD.dark)
  rect(g, x, top, w, 1, GOLD.light)
  const leafW = Math.floor((w - 3) / 2)
  ;[x + 1, x + 2 + leafW].forEach((lx, i) => {
    rect(g, lx, top + 1, leafW, bottom - top - 1, GLASS.base)
    rect(g, lx, top + 1, leafW, 3, GLASS.sky)
    rect(g, lx, top + 7, leafW, 1, GOLD.base)
    treeReflection(g, lx, top + 8, leafW, 7, i + x)
    rect(g, i ? lx + 1 : lx + leafW - 2, top + 12, 1, 5, GOLD.light)
    s.windows.push({ x: lx, y: top + 1, w: leafW, h: 6 })
    s.windows.push({ x: lx, y: top + 15, w: leafW, h: bottom - top - 15 })
  })
}

// Escultura de sillares apilados ante la planta baja: hiladas que se estrechan hacia arriba.
export function stoneStack(g, cx, bottom) {
  ;[18, 16, 14, 12, 10, 8].forEach((w, i) => {
    const y = bottom - (i + 1) * 4
    const x = cx - Math.floor(w / 2)
    rect(g, x, y, w, 4, '#e6c88e')
    rect(g, x, y, w, 1, '#f4dfaa')
    rect(g, x + w - 1, y, 1, 4, '#b89656')
    for (let jx = x + (i % 2 ? 3 : 5); jx < x + w - 1; jx += 6) rect(g, jx, y + 1, 1, 3, '#b89656')
  })
}

// Macetón cuadrado de piedra oscura con un arbusto recortado en cono.
export function shrubPlanter(g, cx, bottom) {
  rect(g, cx - 5, bottom - 7, 10, 7, POT[0])
  rect(g, cx - 5, bottom - 7, 10, 1, POT[1])
  rect(g, cx - 5, bottom - 7, 2, 7, POT[1])
  for (let i = 0; i < 15; i++) {
    const half = Math.max(1, Math.round(1 + i * 0.32))
    const y = bottom - 22 + i
    rect(g, cx - half, y, half * 2, 1, LEAF[1])
    rect(g, cx - half, y, Math.max(1, Math.floor(half / 2)), 1, LEAF[2])
    dot(g, cx + half - 1, y, LEAF[0])
  }
  dot(g, cx, bottom - 23, LEAF[2])
}

// Bandera colgada en vertical delante de un pilar, con su barra y la punta abajo. `stripes` son las franjas de izquierda a
// derecha (cuelga de lado, así que se ven verticales); `badge` es el escudo y `stars` pinta el círculo de la europea.
export function hangingFlag(g, x, top, { stripes, badge = null, stars = false }) {
  rect(g, x - 1, top - 1, 9, 1, '#5a3a28')
  dot(g, x - 2, top - 2, GOLD.base)
  dot(g, x + 8, top - 2, GOLD.base)
  const w = 7
  const h = 15
  for (let row = 0; row < h; row++) {
    const inset = row > h - 4 ? row - (h - 4) : 0
    for (let col = inset; col < w - inset; col++) dot(g, x + col, top + row, stripes[Math.floor((col * stripes.length) / w)])
  }
  rect(g, x, top, 1, h - 3, 'rgba(255,255,255,0.25)')
  if (badge) {
    rect(g, x + 2, top + 5, 3, 3, badge)
    dot(g, x + 3, top + 8, badge)
  }
  if (stars) [[3, 3], [5, 4], [5, 7], [3, 8], [1, 7], [1, 4]].forEach(([dx, dy]) => dot(g, x + dx, top + dy, GOLD.base))
}

// Lápida con la inscripción entre dos escudos. La fuente de los carteles no tiene acentos: la tilde de la Ó se pone a mano.
export function inscription(g, cx, top, w) {
  const text = 'AYUNTAMIENTO DE CORDOBA'
  const x = cx - Math.floor(w / 2)
  rect(g, x, top, w, 12, STONE.light)
  rect(g, x, top, w, 1, '#fff4e2')
  rect(g, x, top + 11, w, 1, STONE.dark)
  rect(g, x, top + 12, w, 1, STONE.deep)
  rect(g, x + w - 1, top, 1, 12, STONE.dark)
  const tx = cx - Math.floor(textWidth(text) / 2)
  drawText(g, tx, top + 4, text, INK)
  dot(g, tx + 17 * 4 + 2, top + 2, INK)
  dot(g, tx + 17 * 4 + 1, top + 3, INK)
  iconAt(g, x + 6, top + 3, 'castle', INK)
  iconAt(g, x + w - 13, top + 3, 'castle', INK)
}

// Zócalo corrido con un peldaño más ancho delante.
export function plinth(g, x, w, top, bottom) {
  rect(g, x, top, w, bottom - top, STONE.base)
  rect(g, x, top, w, 1, STONE.light)
  rect(g, x, top + 2, w, 1, STONE.mid)
  rect(g, x - 2, bottom - 3, w + 4, 3, STONE.light)
  rect(g, x - 2, bottom - 1, w + 4, 1, STONE.deep)
}
