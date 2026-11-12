// Piezas de dibujo de la Mezquita-Catedral: sillería, almenas, arcos, ventanas en arco y tejados de pizarra. Sin lógica de
// composición: `mosque.js` decide dónde va cada una.
import { dot, line, rect } from '../pixelKit.js'
import { hipRoof } from './shared.js'

export const SAND = ['#b88a52', '#dcb77a', '#efd9a0']
export const SAND_SHADE = '#946c3e'
export const RED = '#b84c3c'
export const CREAM = '#f3e4bf'
export const DARK = '#2e1f2a'
// Tejas de barro: todos los tejados llevan `main` para que lean como una sola cubierta; `warm` es el de la linterna del campanario.
export const ROOF = { main: '#a35b38', warm: '#b8693f' }
export const RIDGE = '#5e301e'
const SPRING = 0.35

// Bloque de piedra con la luz arriba a la izquierda.
export function stoneBlock(g, x, y, w, h) {
  rect(g, x, y, w, h, SAND[1])
  rect(g, x, y, w, 1, SAND[2])
  rect(g, x, y, 2, h, SAND[2])
  rect(g, x + w - 2, y, 2, h, SAND[0])
}

// Hiladas de sillares: líneas finas horizontales y juntas desfasadas, para que el muro no sea un plano liso.
export function masonry(g, x, y, w, h, step = 6) {
  for (let row = y + 4; row < y + h - 3; row += step) {
    rect(g, x, row, w, 1, SAND[0])
    for (let joint = x + (((row - y) / step) % 2) * 6; joint < x + w; joint += 12) rect(g, joint, row + 1, 1, step - 1, SAND[0])
  }
}

// Almenas: cada una es un pequeño remate escalonado, de cinco píxeles con una cabeza de tres.
export function merlons(g, x, y, w) {
  for (let mx = x; mx + 5 <= x + w; mx += 8) {
    rect(g, mx, y - 3, 5, 4, SAND[1])
    rect(g, mx + 1, y - 5, 3, 2, SAND[1])
    rect(g, mx, y - 3, 5, 1, SAND[2])
    rect(g, mx + 1, y - 5, 3, 1, SAND[2])
    rect(g, mx + 4, y - 3, 1, 4, SAND[0])
  }
}

// Silueta de un arco de medio punto: `w` de ancho, `h` de alto, con la curva en los primeros `w / 2` píxeles.
export function archShape(g, x, top, w, h, color) {
  const r = w / 2
  for (let i = 0; i < h; i++) {
    const dy = r - i - 0.5
    const half = i < r ? Math.sqrt(Math.max(0, r * r - dy * dy)) : r
    rect(g, Math.round(x + r - half), top + i, Math.max(1, Math.round(half * 2)), 1, color)
  }
}

// Hueco en arco con moldura clara. Si `lit`, el tramo recto se registra para encenderlo de noche con el resto de ventanas.
export function archWindow(s, x, top, w, h, { lit = true, fill = DARK } = {}) {
  archShape(s.g, x - 1, top - 1, w + 2, h + 1, SAND[2])
  archShape(s.g, x, top, w, h, fill)
  rect(s.g, x - 1, top + h, w + 2, 1, SAND[0])
  if (lit) s.windows.push({ x, y: top + Math.floor(w / 2), w, h: h - Math.floor(w / 2) })
}

// Arco de herradura de `w` de ancho: el hueco se ensancha por encima de la línea de arranque y se cierra un poco por debajo, y lo
// rodea un anillo de dovelas alternas rojas y crema que sigue por las jambas hasta el suelo. `top` es la cima del hueco.
export function horseshoe(g, cx, top, w, h, ring = 3) {
  const radius = (w / 2) * 1.12
  const neck = w / 2 - 1
  const centreY = top + radius
  const springY = centreY + SPRING * radius
  const bottom = top + h
  const halfAt = (y) => {
    const dy = y + 0.5 - centreY
    return dy < SPRING * radius ? Math.sqrt(Math.max(0, radius * radius - dy * dy)) : neck
  }
  for (let y = top; y < bottom; y++) {
    const half = halfAt(y)
    rect(g, Math.round(cx - half), y, Math.round(half * 2), 1, DARK)
  }
  for (let y = Math.floor(top - ring); y < springY; y++) {
    for (let x = Math.floor(cx - radius - ring); x <= Math.ceil(cx + radius + ring); x++) {
      const dx = x + 0.5 - cx
      const dy = y + 0.5 - centreY
      const distance = Math.hypot(dx, dy)
      if (distance > radius && distance <= radius + ring && dy < SPRING * radius) {
        rect(g, x, y, 1, 1, Math.floor(Math.atan2(dy, dx) / (Math.PI / 11)) % 2 === 0 ? RED : CREAM)
      }
    }
  }
  for (let y = Math.floor(springY); y < bottom; y++) {
    const colour = Math.floor((y - springY) / 3) % 2 === 0 ? RED : CREAM
    rect(g, Math.round(cx - neck) - ring, y, ring, 1, colour)
    rect(g, Math.round(cx + neck), y, ring, 1, colour)
  }
}

// Tejado a cuatro aguas de teja marrón con su cumbrera oscura.
export function tileRoof(g, { color = ROOF.main, ...options }) {
  hipRoof(g, { color, ...options })
  const { x, y, w, rows, inset = 3 } = options
  rect(g, x + inset * (rows - 1), y - 1, w - 2 * inset * (rows - 1), 1, RIDGE)
}

// Campana de bronce vista de frente, colgada de su yugo: seis filas que se ensanchan hasta el labio, con luz a la izquierda,
// sombra a la derecha y badajo. `cx` es su columna central y `top` la fila del yugo.
export function bell(g, cx, top) {
  const bronze = ['#f2c64a', '#d9a02a', '#a8741c']
  rect(g, cx - 1, top, 2, 1, '#5a3a28')
  ;[2, 4, 4, 6, 6, 8].forEach((w, i) => {
    const x = cx - w / 2
    const lip = i === 5
    rect(g, x, top + 1 + i, w, 1, lip ? bronze[2] : bronze[1])
    if (!lip) rect(g, x, top + 1 + i, 1, 1, bronze[0])
    if (!lip && w > 2) rect(g, x + w - 1, top + 1 + i, 1, 1, bronze[2])
  })
  rect(g, cx - 1, top + 7, 2, 1, '#5a3a28')
}

// Pináculo de piedra con su bola: remata los pilares de la portada y los ángulos de las torres.
export function pinnacle(g, x, top, h) {
  rect(g, x, top + 2, 2, h - 2, SAND[2])
  rect(g, x + 1, top + 2, 1, h - 2, SAND[1])
  rect(g, x - 1, top + h - 2, 4, 2, SAND[1])
  dot(g, x, top, SAND[2])
  dot(g, x + 1, top + 1, SAND[1])
  rect(g, x, top + 1, 2, 1, SAND[2])
}

// Contrafuerte volado: dos trazos paralelos en diagonal entre dos puntos.
export function flyingButtress(g, x0, y0, x1, y1) {
  line(g, x0, y0, x1, y1, SAND[1], 2)
  line(g, x0, y0 + 2, x1, y1 + 2, SAND[0], 1)
}
