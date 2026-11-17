// Piezas comunes de los edificios del valle: tejados, paredes, ventanas, puertas y rótulos. Cada
// edificio las combina con sus rasgos propios (reloj, arcadas, toldo...) para tener silueta distinta.
// Todo se dibuja en píxeles, con la luz arriba a la izquierda, y termina con el contorno de color.
import { PAL, TONE, shade, tint } from '../palette.js'
import { dot, makeCanvas, outline, rect } from '../pixelKit.js'

export const [WOOD0, WOOD1, WOOD2, WOOD3] = TONE.wood
export const [WALL0, WALL1, WALL2] = TONE.wall
export const [STONE0, STONE1, STONE2] = TONE.stone
export const GLASS = '#6fb3c6'
export const GLASS_LIGHT = '#9fd6e0'
export const BLOOM = [PAL.rose, '#f6f0e0', PAL.saffron, PAL.rose, '#b8a2e0']

// Lienzo de un edificio. `windows` guarda los cristales para encenderlos de noche y `doorCol` la
// columna del centro de la puerta, con la que ValleScene alinea el dibujo con su tesela de puerta.
export function newSprite(w, h) {
  const canvas = makeCanvas(w, h)
  return { canvas, g: canvas.getContext('2d'), windows: [], doorCol: Math.floor(w / 2) }
}

// Cierra el dibujo: contorno de color y los datos que necesita la escena.
export function finish(sprite, strength = 0.5) {
  outline(sprite.canvas, strength)
  return { canvas: sprite.canvas, doorCol: sprite.doorCol, windows: sprite.windows }
}

export const roofTones = (color) => [shade(color, 0.55), shade(color, 0.78), color, tint(color, 0.28)]

// Tejado a cuatro aguas visto de frente: filas de tejas desfasadas, cada una más ancha que la de arriba.
export function hipRoof(g, { x, y, w, rows, color, inset = 3, rowH = 4 }) {
  const r = roofTones(color)
  for (let row = 0; row < rows; row++) {
    const top = y + row * rowH
    const left = x + inset * (rows - 1 - row)
    const width = w - 2 * inset * (rows - 1 - row)
    rect(g, left, top, width, rowH, r[2])
    rect(g, left, top + rowH - 1, width, 1, r[0])
    rect(g, left, top, width, 1, r[3])
    for (let tx = left + (row % 2) * 3; tx < left + width; tx += 6) {
      rect(g, tx, top + 1, 1, rowH - 1, r[1])
      rect(g, tx + 1, top + 1, 1, 1, r[3])
    }
    rect(g, left, top, 2, rowH, r[3])
    rect(g, left + width - 2, top, 2, rowH, r[1])
  }
  rect(g, x + inset * (rows - 1) - 1, y - 1, w - 2 * inset * (rows - 1) + 2, 2, r[3])
}

// Tejado de un solo agua (cobertizo o ala baja): una franja inclinada hacia un lado.
export function leanRoof(g, { x, y, w, rows, color, rowH = 4 }) {
  const r = roofTones(color)
  for (let row = 0; row < rows; row++) {
    const top = y + row * rowH
    rect(g, x, top, w, rowH, r[2])
    rect(g, x, top + rowH - 1, w, 1, r[0])
    rect(g, x, top, w, 1, r[3])
    for (let tx = x + (row % 2) * 3; tx < x + w; tx += 6) rect(g, tx, top + 1, 1, rowH - 1, r[1])
  }
}

// Pared con sombra bajo el alero, esquinas de madera y cimiento de piedra.
export function wall(g, { x, y, w, h, base = WALL1, dark = WALL0, post = true }) {
  rect(g, x, y, w, h, base)
  rect(g, x, y, w, 4, dark)
  rect(g, x, y + 4, w, 1, tint(dark, 0.18))
  if (post) {
    rect(g, x, y, 3, h, WOOD1)
    rect(g, x, y, 1, h, WOOD2)
    rect(g, x + w - 3, y, 3, h, WOOD0)
  }
  rect(g, x + 1, y + h - 6, w - 2, 6, STONE1)
  for (let sx = x + 1; sx < x + w - 1; sx += 7) rect(g, sx + ((sx / 7) % 2 ? 3 : 0), y + h - 6, 1, 6, STONE0)
  rect(g, x + 1, y + h - 6, w - 2, 1, STONE2)
}

// Ventana con marco, cruceta y brillo. `shutters` pinta postigos de ese color y `flowers` una jardinera.
// `sill` añade dintel y alféizar de piedra, `curtains` cortinas del color dado, `glint` el reflejo
// diagonal del cristal y `muntins: false` quita la cruceta para dibujar un interior sin cortarlo.
// `lit: false` no registra el cristal para encenderlo de noche.
export function windowAt(sprite, x, y, w, h, { shutters = null, flowers = false, arched = false, screen = null, sill = false, curtains = null, glint = false, muntins = true, lit = true } = {}) {
  const { g } = sprite
  if (shutters) {
    const s = [shade(shutters, 0.7), shutters, tint(shutters, 0.3)]
    rect(g, x - 3, y, 3, h, s[1])
    rect(g, x - 3, y, 1, h, s[2])
    rect(g, x + w, y, 3, h, s[1])
    rect(g, x + w + 2, y, 1, h, s[0])
  }
  rect(g, x - 1, y - 1, w + 2, h + 2, WOOD1)
  rect(g, x - 1, y - 1, w + 2, 1, WOOD3)
  rect(g, x, y, w, h, screen || GLASS)
  if (!screen) rect(g, x, y, w, Math.max(2, Math.floor(h / 3)), GLASS_LIGHT)
  if (arched) {
    dot(g, x - 1, y - 1, 'rgba(0,0,0,0)')
    rect(g, x, y - 1, w, 1, WOOD1)
  }
  if (curtains) curtainsAt(g, x, y, w, h, curtains)
  if (muntins && w >= 8) rect(g, x + Math.floor(w / 2) - 1, y, 2, h, WOOD1)
  if (muntins && h >= 10) rect(g, x, y + Math.floor(h / 2), w, 2, WOOD1)
  dot(g, x + 1, y + 1, '#ffffff')
  if (glint) glintAt(g, x, y, w)
  if (sill) sillAt(g, x, y, w, h)
  if (flowers) flowerBox(g, x - 2, y + h + 1, w + 4)
  // `lit: false` deja el cristal sin luz plana de noche: quien llama registra el suyo (con siluetas y profundidad).
  if (lit) sprite.windows.push({ x, y, w, h })
}

// Cortinas recogidas a los lados con su lazo: dejan ver el centro del cristal.
function curtainsAt(g, x, y, w, h, color) {
  const fold = shade(color, 0.78)
  const cw = Math.max(3, Math.floor(w / 5))
  ;[x, x + w - cw].forEach((cx) => {
    rect(g, cx, y, cw, h, color)
    rect(g, cx + (cx === x ? cw - 1 : 0), y, 1, h, fold)
    rect(g, cx, y + Math.floor(h * 0.6), cw, 1, fold)
  })
  rect(g, x, y, w, 1, tint(color, 0.25))
}

// Reflejo del cristal: dos trazos diagonales en la esquina de arriba a la izquierda.
function glintAt(g, x, y, w) {
  const light = 'rgba(255,255,255,0.45)'
  for (let i = 0; i < 6; i++) dot(g, x + 2 + i, y + 7 - i, light)
  if (w >= 24) for (let i = 0; i < 4; i++) dot(g, x + 9 + i, y + 7 - i, light)
}

// Dintel y alféizar de piedra: dan relieve al hueco de la ventana.
function sillAt(g, x, y, w, h) {
  rect(g, x - 2, y - 3, w + 4, 2, STONE2)
  rect(g, x - 2, y - 1, w + 4, 1, STONE0)
  rect(g, x - 3, y + h + 1, w + 6, 2, STONE2)
  rect(g, x - 3, y + h + 3, w + 6, 1, STONE0)
}

// Jardinera con flores en filas de colores.
export function flowerBox(g, x, y, w) {
  rect(g, x, y, w, 3, WOOD1)
  rect(g, x, y, w, 1, WOOD2)
  rect(g, x, y + 2, w, 1, WOOD0)
  for (let i = 0; i < w; i += 3) {
    dot(g, x + 1 + i, y - 1, BLOOM[(i / 3) % BLOOM.length])
    dot(g, x + 2 + i, y - 1, TONE.grass[2])
  }
}

// Puerta de madera; `x` es su borde izquierdo y `bottom` la fila donde apoya. Devuelve la columna central.
export function doorAt(sprite, x, bottom, { w = 12, h = 19, glow = false, color = WOOD2, arched = true, step = true } = {}) {
  const { g } = sprite
  const top = bottom - h
  rect(g, x, top, w, h, WOOD0)
  if (arched) {
    rect(g, x + 1, top - 1, w - 2, 1, WOOD0)
    rect(g, x + 2, top - 2, w - 4, 1, WOOD0)
  }
  rect(g, x + 1, top + 1, w - 2, h - 1, glow ? PAL.saffron : color)
  if (arched) rect(g, x + 2, top, w - 4, 1, glow ? PAL.saffron : color)
  for (let px = x + 3; px < x + w - 2; px += 3) rect(g, px, top + 1, 1, h - 1, glow ? PAL.tile : WOOD1)
  rect(g, x + 1, top + 1, 1, h - 1, glow ? PAL.saffronLight : WOOD3)
  rect(g, x + w - 4, top + Math.floor(h / 2), 2, 2, PAL.saffron)
  if (step) {
    rect(g, x - 2, bottom, w + 4, 3, STONE2)
    rect(g, x - 2, bottom + 2, w + 4, 1, STONE0)
  }
  sprite.doorCol = x + Math.floor(w / 2)
  return sprite.doorCol
}

// Rótulo de madera con un icono de 7×7 píxeles.
const ICONS = {
  book: ['xxx.xxx', 'x.x.x.x', 'x.x.x.x', 'x.x.x.x', 'x.x.x.x', 'xxxxxxx', '.......'],
  gear: ['..x.x..', '.xxxxx.', 'xxx.xxx', '.x...x.', 'xxx.xxx', '.xxxxx.', '..x.x..'],
  cart: ['x......', 'xxxxxx.', '.xxxxx.', '.xxxxx.', '..xxx..', '..x.x..', '.xx.xx.'],
  snow: ['...x...', 'x..x..x', '.x.x.x.', '..xxx..', '.x.x.x.', 'x..x..x', '...x...'],
  code: ['.x...x.', 'x.....x', '.x.x.x.', 'x..x..x', '.x.x.x.', 'x.....x', '.x...x.'],
  cone: ['..xxx..', '.xxxxx.', '.xxxxx.', '..xxx..', '..xxx..', '...x...', '...x...'],
  castle: ['x.x.x.x', 'xxxxxxx', '.xxxxx.', '.x.x.x.', '.xxxxx.', '.xx.xx.', '.xx.xx.'],
  hook: ['..xxxx.', '..x....', '..x....', '..x....', 'x.x....', 'xxx....', '.x.....'],
  lock: ['..xxx..', '.x...x.', '.x...x.', 'xxxxxxx', 'xxx.xxx', 'xxx.xxx', 'xxxxxxx'],
}

export function iconAt(g, x, y, name, color, scale = 1) {
  ICONS[name].forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx++) if (row[rx] === 'x') rect(g, x + rx * scale, y + ry * scale, scale, scale, color)
  })
}

export function signBoard(g, x, y, w, h, { icon = null, color = WOOD2, ink = WOOD0 } = {}) {
  rect(g, x, y, w, h, color)
  rect(g, x, y, w, 1, tint(color, 0.3))
  rect(g, x, y + h - 1, w, 1, shade(color, 0.7))
  rect(g, x, y, 1, h, tint(color, 0.15))
  rect(g, x + w - 1, y, 1, h, shade(color, 0.7))
  if (icon) iconAt(g, x + Math.floor((w - 7) / 2), y + Math.floor((h - 7) / 2), icon, ink)
}

// Chimenea de piedra con su remate.
export function chimney(g, x, y, h) {
  rect(g, x, y, 9, h, STONE1)
  rect(g, x, y, 3, h, STONE2)
  rect(g, x + 7, y, 2, h, STONE0)
  rect(g, x - 2, y - 2, 13, 3, STONE2)
  rect(g, x - 2, y + 1, 13, 1, STONE0)
  for (let cy = y + 5; cy < y + h; cy += 4) rect(g, x, cy, 9, 1, STONE0)
}

