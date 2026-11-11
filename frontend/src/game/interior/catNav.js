// Por dónde puede andar Khalessi: una rejilla sobre el suelo de la sala en la que cada celda está libre u ocupada según los
// cuerpos sólidos de los muebles (con un margen del ancho de la gata), y un buscador de caminos A* con alisado. Así cualquier
// destino se alcanza sin atravesar nada, ande donde ande el mueble. Es pura (sin Phaser ni lienzo): se prueba sin navegador.
const CELL = 4

// Holgura de la gata respecto a un mueble: a los lados (su cuerpo mide unos 14 píxeles), por detrás (donde queda tapada por el
// mueble) y por delante.
const MARGIN = { x: 7, top: 3, bottom: 2 }

// Mínimo de pasillo respecto a las paredes laterales y del fondo.
const WALL_GAP = { x: 8, y: 4 }

class Heap {
  constructor() {
    this.items = []
  }

  get size() {
    return this.items.length
  }

  push(item) {
    const a = this.items
    a.push(item)
    let i = a.length - 1
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (a[parent][0] <= a[i][0]) break
      ;[a[parent], a[i]] = [a[i], a[parent]]
      i = parent
    }
  }

  pop() {
    const a = this.items
    const top = a[0]
    const last = a.pop()
    if (a.length) {
      a[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < a.length && a[l][0] < a[m][0]) m = l
        if (r < a.length && a[r][0] < a[m][0]) m = r
        if (m === i) break
        ;[a[m], a[i]] = [a[i], a[m]]
        i = m
      }
    }
    return top
  }
}

const NEIGHBOURS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]

// `bounds` es el suelo de la sala, `solids` los cuerpos `{ x, y, w, h }` y `minY` la fila más alta por la que anda la gata
// (por encima solo hay muebles de pared y huecos tras ellos, donde desaparecería de la vista).
export function createNav({ bounds, solids, minY }) {
  const left = bounds.x + WALL_GAP.x
  const right = bounds.x + bounds.width - WALL_GAP.x
  const top = Math.max(bounds.y + WALL_GAP.y, minY)
  const bottom = bounds.y + bounds.height - WALL_GAP.y
  const cols = Math.floor((right - left) / CELL) + 1
  const rows = Math.floor((bottom - top) / CELL) + 1

  const free = (x, y) => {
    if (x < left || x > right || y < top || y > bottom) return false
    return !solids.some((s) => x > s.x - MARGIN.x && x < s.x + s.w + MARGIN.x && y > s.y - MARGIN.top && y < s.y + s.h + MARGIN.bottom)
  }
  const centre = (i, j) => ({ x: left + i * CELL, y: top + j * CELL })
  const cellOf = (x, y) => [Math.round((x - left) / CELL), Math.round((y - top) / CELL)]
  const cells = Array.from({ length: cols * rows }, (_, n) => {
    const { x, y } = centre(n % cols, Math.floor(n / cols))
    return free(x, y)
  })
  const open = (i, j) => i >= 0 && j >= 0 && i < cols && j < rows && cells[j * cols + i]

  // Línea recta sin obstáculos. Se comprueba cada píxel y, en cada muestra, también un píxel a cada lado: así el trozo entre
  // dos muestras queda libre y una esquina de mueble de un par de píxeles no se cuela.
  const clear = (a, b) => {
    const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y))
    for (let s = 0; s <= steps; s++) {
      const t = steps ? s / steps : 0
      const x = a.x + (b.x - a.x) * t
      const y = a.y + (b.y - a.y) * t
      if (!free(x, y) || !free(x - 1, y) || !free(x + 1, y) || !free(x, y - 1) || !free(x, y + 1)) return false
    }
    return true
  }

  // Celda abierta más cercana a un punto (la suya si está abierta), como índices `[i, j]`, o null si no queda ninguna.
  function nearestOpen(x, y) {
    const [ci, cj] = cellOf(x, y)
    if (open(ci, cj)) return [ci, cj]
    for (let radius = 1; radius < Math.max(cols, rows); radius++) {
      let best = null
      for (let j = cj - radius; j <= cj + radius; j++) {
        for (let i = ci - radius; i <= ci + radius; i++) {
          if (Math.max(Math.abs(i - ci), Math.abs(j - cj)) !== radius || !open(i, j)) continue
          const p = centre(i, j)
          const d = Math.hypot(p.x - x, p.y - y)
          if (!best || d < best.d) best = { i, j, d }
        }
      }
      if (best) return [best.i, best.j]
    }
    return null
  }

  // Punto libre más cercano a otro (el propio si está libre).
  function nearestFree(x, y) {
    if (free(x, y)) return { x, y }
    const cell = nearestOpen(x, y)
    return cell && centre(cell[0], cell[1])
  }

  // Camino de `from` a `to` como lista de puntos (sin el de partida), o null si no hay. Se alisa quitando los puntos
  // intermedios que no hacen falta.
  function path(from, to) {
    const start = nearestFree(from.x, from.y)
    const goal = nearestFree(to.x, to.y)
    if (!start || !goal) return null
    // La búsqueda va de celda a celda: se parte de la celda abierta más cercana a cada extremo, que puede no ser la que lo
    // contiene (un punto libre puede caer en una celda cuyo centro no lo está).
    const [si, sj] = nearestOpen(start.x, start.y)
    const [gi, gj] = nearestOpen(goal.x, goal.y)
    const index = (i, j) => j * cols + i
    const cost = new Map([[index(si, sj), 0]])
    const came = new Map()
    const heap = new Heap()
    const h = (i, j) => Math.hypot(gi - i, gj - j)
    heap.push([h(si, sj), si, sj])
    const done = new Set()
    while (heap.size) {
      const [, i, j] = heap.pop()
      const key = index(i, j)
      if (done.has(key)) continue
      done.add(key)
      if (i === gi && j === gj) break
      for (const [di, dj] of NEIGHBOURS) {
        const ni = i + di
        const nj = j + dj
        if (!open(ni, nj)) continue
        if (di && dj && (!open(i + di, j) || !open(i, j + dj))) continue
        const next = cost.get(key) + Math.hypot(di, dj)
        const nk = index(ni, nj)
        if (next >= (cost.get(nk) ?? Infinity)) continue
        cost.set(nk, next)
        came.set(nk, key)
        heap.push([next + h(ni, nj), ni, nj])
      }
    }
    const goalKey = index(gi, gj)
    if (!done.has(goalKey)) return null
    const cellsPath = []
    for (let k = goalKey; k !== undefined; k = came.get(k)) cellsPath.unshift(centre(k % cols, Math.floor(k / cols)))
    // Se camina desde el punto exacto de partida hasta el exacto de llegada pasando por las celdas; el alisado solo quita las
    // que sobran tras comprobar que la línea recta queda libre (también en los tramos de los extremos).
    const points = [{ x: start.x, y: start.y }, ...cellsPath, { x: goal.x, y: goal.y }]
    const smooth = [points[0]]
    let anchor = 0
    while (anchor < points.length - 1) {
      let far = points.length - 1
      while (far > anchor + 1 && !clear(points[anchor], points[far])) far--
      smooth.push(points[far])
      anchor = far
    }
    return smooth.slice(1)
  }

  // Puntos libres repartidos por la sala, para que la gata elija adónde pasear.
  const wanderPoints = () => {
    const out = []
    for (let j = 0; j < rows; j += 3) for (let i = 0; i < cols; i += 3) if (open(i, j)) out.push(centre(i, j))
    return out
  }

  return { free, nearestFree, path, clear, wanderPoints }
}
