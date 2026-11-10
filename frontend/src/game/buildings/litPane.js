// Luz de un cristal encendido, con algo de fondo. Un rectángulo amarillo liso se lee como un cartel; aquí el borde de
// arriba y el de la izquierda se oscurecen (la sombra del marco) y el de abajo se aclara (la luz que cae sobre el
// alféizar). Los `holes` son los objetos del interior (monitor, impresora...): quedan sin luz y se ven como silueta.
// Devuelve rectángulos con su color; `LitWindows` los pinta sin conocer nada de esta forma.
export const LIT_GLASS = '#f8d77a'
const LIT_SHADE = '#d9a343'
const LIT_EDGE = '#eab95a'
const LIT_FLOOR = '#ffe9a6'

const TOP_ROWS = 2
const FLOOR_ROWS = 3

function glassColor(col, row, h) {
  if (row < TOP_ROWS) return LIT_SHADE
  if (row >= h - FLOOR_ROWS) return LIT_FLOOR
  return col === 0 ? LIT_EDGE : LIT_GLASS
}

const insideAny = (holes, col, row) => holes.some((r) => col >= r.x && col < r.x + r.w && row >= r.y && row < r.y + r.h)

export function litPane(x, y, w, h, holes = []) {
  const rects = []
  let open = new Map()
  for (let row = 0; row < h; row++) {
    const next = new Map()
    let col = 0
    while (col < w) {
      if (insideAny(holes, col, row)) {
        col++
        continue
      }
      const color = glassColor(col, row, h)
      let end = col + 1
      while (end < w && !insideAny(holes, end, row) && glassColor(end, row, h) === color) end++
      const key = `${col}:${end - col}:${color}`
      // Un tramo idéntico al de la fila de arriba la alarga en vez de abrir otro rectángulo.
      const rect = open.get(key) ?? { x: x + col, y: y + row, w: end - col, h: 0, color }
      if (!open.has(key)) rects.push(rect)
      rect.h++
      next.set(key, rect)
      col = end
    }
    open = next
  }
  return rects
}
