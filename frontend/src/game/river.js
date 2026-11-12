// El río del valle como una curva suave con anchura variable, no como una cadena de cuadrados. Nace como un manantial estrecho
// al noreste, baja con curvas amplias por el este de la plaza y se ensancha hasta salir del mapa por el sureste. De aquí salen
// tanto lo que se dibuja (`signedDistance`, que pinta la orilla redondeada en `ground.js`) como lo que choca (`riverTiles`, las
// teselas que la viajera no puede pisar). Sin dependencias de Phaser ni de React; todo en píxeles salvo `RIVER_POINTS` (teselas).
const TILE = 16

// Puntos por los que pasa la línea central, en teselas. Una curva de Catmull-Rom los une.
export const RIVER_POINTS = [
  [58.2, 18.4], [56.6, 20.4], [54.2, 23], [52.6, 26.5], [52.2, 29.5], [53.4, 33], [57, 36.6], [60.4, 39.6], [63.2, 42.6], [66.4, 44.4], [71, 45.6], [76, 46.2], [80.5, 46.4],
]

// Anchura en teselas según lo avanzado del recorrido (0 al nacer, 1 al salir): estrecha al nacer, unas cuatro teselas y media en el
// puente y algo más al salir, con una onda suave para que no sea una cinta de ancho uniforme.
function widthAt(u) {
  const smooth = (t) => t * t * (3 - 2 * t)
  const base = 1.5 + 2.9 * smooth(Math.min(1, u / 0.3))
  const ripple = 0.45 * Math.sin(u * 11 + 1) * smooth(Math.min(1, u / 0.35))
  const mouth = 0.6 * smooth(Math.max(0, (u - 0.82) / 0.18))
  return base + ripple + mouth
}

// Catmull-Rom entre `b` y `c` con vecinos `a` y `d`.
function spline(a, b, c, d, t) {
  const t2 = t * t
  const t3 = t2 * t
  return [0, 1].map((k) => 0.5 * (2 * b[k] + (-a[k] + c[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t2 + (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * t3))
}

// Muestras de la línea central, una cada pocos píxeles: posición, anchura media y avance. Se calculan una vez.
const STEP_PX = 5
const SAMPLES = (() => {
  const points = [RIVER_POINTS[0], ...RIVER_POINTS, RIVER_POINTS.at(-1)]
  const raw = []
  for (let i = 1; i < points.length - 2; i++) {
    for (let k = 0; k < 24; k++) {
      const [x, y] = spline(points[i - 1], points[i], points[i + 1], points[i + 2], k / 24)
      raw.push({ x: x * TILE, y: y * TILE })
    }
  }
  raw.push({ x: RIVER_POINTS.at(-1)[0] * TILE, y: RIVER_POINTS.at(-1)[1] * TILE })
  // Se reparten a distancia constante para que la anchura avance con la longitud, no con la densidad de los puntos de control.
  const lengths = [0]
  for (let i = 1; i < raw.length; i++) lengths.push(lengths[i - 1] + Math.hypot(raw[i].x - raw[i - 1].x, raw[i].y - raw[i - 1].y))
  const total = lengths.at(-1)
  const samples = []
  let at = 0
  for (let distance = 0; distance <= total; distance += STEP_PX) {
    while (at < raw.length - 2 && lengths[at + 1] < distance) at += 1
    const span = lengths[at + 1] - lengths[at] || 1
    const f = Math.min(1, (distance - lengths[at]) / span)
    const x = raw[at].x + (raw[at + 1].x - raw[at].x) * f
    const y = raw[at].y + (raw[at + 1].y - raw[at].y) * f
    const u = distance / total
    samples.push({ x, y, half: (widthAt(u) * TILE) / 2, u })
  }
  return samples
})()

// Rejilla de cubos de 32 px con las muestras que caen en cada uno: la distancia a un píxel solo mira las muestras cercanas. Pintar el
// suelo pregunta por más de un millón de píxeles, así que lo lejano al río se descarta con una sola consulta (`NEAR`).
const CELL = 32
const REACH = Math.ceil(Math.max(...SAMPLES.map((s) => s.half)) + 8)
const SPAN = Math.ceil(REACH / CELL)
const BOUNDS = (() => {
  const cells = SAMPLES.map((s) => [Math.floor(s.x / CELL), Math.floor(s.y / CELL)])
  const cx = cells.map(([c]) => c)
  const cy = cells.map(([, r]) => r)
  return { x0: Math.min(...cx) - SPAN, y0: Math.min(...cy) - SPAN, x1: Math.max(...cx) + SPAN, y1: Math.max(...cy) + SPAN }
})()
const GRID_W = BOUNDS.x1 - BOUNDS.x0 + 1
const cellIndex = (cx, cy) => (cy - BOUNDS.y0) * GRID_W + (cx - BOUNDS.x0)
const BUCKETS = new Array(GRID_W * (BOUNDS.y1 - BOUNDS.y0 + 1))
const NEAR = new Uint8Array(BUCKETS.length)
SAMPLES.forEach((sample, index) => {
  const at = cellIndex(Math.floor(sample.x / CELL), Math.floor(sample.y / CELL))
  ;(BUCKETS[at] ??= []).push(index)
})
BUCKETS.forEach((bucket, at) => {
  if (!bucket) return
  const cx = (at % GRID_W) + BOUNDS.x0
  const cy = Math.floor(at / GRID_W) + BOUNDS.y0
  for (let dy = -SPAN; dy <= SPAN; dy++) for (let dx = -SPAN; dx <= SPAN; dx++) NEAR[cellIndex(cx + dx, cy + dy)] = 1
})

// Distancia con signo (px) del punto al borde del agua: positiva dentro, negativa fuera. Es la unión de los círculos de cada muestra, así
// que las curvas salen redondeadas y los cambios de anchura, graduales. Lejos del río devuelve -99.
export function signedDistance(px, py) {
  const cx = Math.floor(px / CELL)
  const cy = Math.floor(py / CELL)
  if (cx < BOUNDS.x0 || cx > BOUNDS.x1 || cy < BOUNDS.y0 || cy > BOUNDS.y1 || !NEAR[cellIndex(cx, cy)]) return -99
  let best = -Infinity
  for (let dy = -SPAN; dy <= SPAN; dy++) {
    for (let dx = -SPAN; dx <= SPAN; dx++) {
      const ax = cx + dx
      const ay = cy + dy
      if (ax < BOUNDS.x0 || ax > BOUNDS.x1 || ay < BOUNDS.y0 || ay > BOUNDS.y1) continue
      const bucket = BUCKETS[cellIndex(ax, ay)]
      if (!bucket) continue
      for (const index of bucket) {
        const sample = SAMPLES[index]
        const gx = px - sample.x
        const gy = py - sample.y
        const reach = sample.half + 8
        const squared = gx * gx + gy * gy
        if (squared > reach * reach) continue
        const inside = sample.half - Math.sqrt(squared)
        if (inside > best) best = inside
      }
    }
  }
  return best === -Infinity ? -99 : Math.max(best, -99)
}

// Teselas que cuentan como agua (las que no se pisan): las que tienen el centro dentro del agua o a menos de 3 px de ella. Así la
// viajera no entra en el agua dibujada y, como mucho, se queda unos píxeles antes de la orilla.
export function riverTiles(cols, rows) {
  const set = new Set()
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) if (signedDistance(x * TILE + TILE / 2, y * TILE + TILE / 2) > -3) set.add(`${x},${y}`)
  }
  return set
}

// Punto de la línea central a una fracción `u` del recorrido, con la normal que mira a la izquierda del avance y la anchura media (px).
export function riverAt(u) {
  const index = Math.max(1, Math.min(SAMPLES.length - 2, Math.round(u * (SAMPLES.length - 1))))
  const before = SAMPLES[index - 1]
  const after = SAMPLES[index + 1]
  const length = Math.hypot(after.x - before.x, after.y - before.y) || 1
  const tx = (after.x - before.x) / length
  const ty = (after.y - before.y) / length
  const s = SAMPLES[index]
  return { x: s.x, y: s.y, half: s.half, nx: ty, ny: -tx }
}

// Todas las muestras de la línea central (solo lectura): la vida del río (nenúfares, juncos, peces) las usa para colocarse.
export const RIVER_SAMPLES = SAMPLES
