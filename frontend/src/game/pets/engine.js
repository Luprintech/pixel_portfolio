// Dibujo común de los animales de cuatro patas. Cada raza es una ficha (`spec`) con su tamaño de
// lienzo, cuerpo, patas, cola y cabeza, y un reparto de colores; este módulo solo la pinta.
// Todo se dibuja en el orden en que se ve: cola, cuerpo, detalles, patas, cabeza, contorno.
import { OUTLINE } from '../avatar/index.js'
import { dot, ellipse, makeCanvas, outlineSolid, rect } from '../pixelKit.js'

// Posiciones de las patas respecto al centro del cuerpo para un cuerpo de radio 7,5; se escalan
// con el largo real del cuerpo. El segundo fotograma las abre para dar el paso.
const LEG_PATTERN = [[-3, -1, 3, 5], [-4, 0, 2, 6]]
const LEG_PATTERN_RX = 7.5

function legPositions(body, frame) {
  return LEG_PATTERN[frame % 2].map((dx) => Math.round(body.cx + (dx * body.rx) / LEG_PATTERN_RX))
}

function drawTail(g, spec, c, tail) {
  const { body } = spec
  const ax = Math.round(body.cx - body.rx) - 1
  const ay = Math.round(body.cy) - 1
  const size = spec.tail.size ?? 2
  const cells = spec.tail.frames[tail % 2]
  cells.forEach(([dx, dy], i) => {
    const last = i === cells.length - 1
    // Con `taper`, la punta es un píxel más fina: el plumero acaba en punta y no en bloque.
    const side = last && spec.tail.taper ? size - 1 : size
    const ringed = spec.tail.rings && i % 2 === 1
    rect(g, ax + dx, ay + dy, side, side, last && c.tip ? c.tip : ringed ? c.spot : c.tail)
  })
}

function drawBody(g, spec, c) {
  const { cx, cy, rx, ry } = spec.body
  ellipse(g, cx, cy, rx, ry, c.belly)
  ellipse(g, cx, cy - 0.8, rx - 0.2, ry - 0.5, c.base)
  const backY = Math.round(cy - 0.8 - (ry - 0.5))
  for (let x = cx - 5; x <= cx + 4; x++) dot(g, x, backY + (x % 3 === 0 ? 1 : 0), c.back)
  ;(spec.stripes ?? []).forEach(([x, y]) => rect(g, x, y, 1, 2, c.stripe))
  ;(spec.spots ?? []).forEach(([x, y, w, h]) => rect(g, x, y, w, h, c.spot))
  spec.details?.(g, c, spec)
}

function drawLegs(g, spec, c, frame) {
  const { legs, body } = spec
  const sock = c.sock && Math.min(2, legs.h - 1)
  legPositions(body, frame).forEach((x) => {
    rect(g, x, legs.y, 2, legs.h, c.legs)
    if (sock) rect(g, x, legs.y + legs.h - sock, 2, sock, c.sock)
  })
}

function drawHead(g, spec, c) {
  const { rows, x: hx, y: hy, keys } = spec.head
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '.') continue
      dot(g, x + hx, y + hy, c[keys[row[x]]] ?? c.base)
    }
  })
}

export function drawPet(spec, c, frame = 0, tail = 0) {
  const canvas = makeCanvas(spec.w, spec.h)
  const g = canvas.getContext('2d')
  drawTail(g, spec, c, tail)
  drawBody(g, spec, c)
  drawLegs(g, spec, c, frame)
  drawHead(g, spec, c)
  outlineSolid(canvas, OUTLINE)
  spec.post?.(g, c, spec)
  return canvas
}
