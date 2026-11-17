// El río del valle como una curva suave con anchura variable, no como una cadena de cuadrados. Entra por el borde norte, entre los
// árboles, a la derecha de la Mezquita; baja recto por el bosque y, a la altura del Ayuntamiento, se curva suavemente hacia el oeste;
// baja recto junto a él, se desvía un poco hacia el oeste hasta el puente romano y desde allí se ensancha hasta salir del mapa por el
// sureste. De aquí salen tanto lo que se dibuja
// (`signedDistance`, que pinta la orilla redondeada en `ground.js`) como lo que choca (`riverTiles`, las teselas que la viajera no
// puede pisar). Sin dependencias de Phaser ni de React; todo en píxeles salvo `RIVER_POINTS` (teselas).
import { shiftX, shiftY } from './mapRows.js'

const TILE = 16

// Puntos por los que pasa la línea central, en teselas de la plantilla (ver `mapRows.js`; las filas negativas caen en la franja norte).
// Una curva de Catmull-Rom los une. Los primeros quedan más allá del borde norte para que el río entre en el mapa sin acabar en una
// poza; bajan por la columna 56,5 de la plantilla (la 64,5 del mapa, a cinco teselas de la Mezquita) y, a la altura del Ayuntamiento, se
// curvan suavemente hasta la columna 54,3 del cauce de siempre. De ahí al sur no cambia.
const TEMPLATE_RIVER_POINTS = [
  [56.5, -16], [56.5, -12], [56.5, -6], [56.4, 0], [56.2, 4.5], [55.8, 8.5], [55.2, 12], [54.6, 14.8], [54.3, 17], [53.8, 20.5], [53.1, 23.5], [52.6, 26], [52.3, 28.3],
  [52.2, 29.5], [53.4, 33], [57, 36.6], [60.4, 39.6], [63.2, 42.6], [66.4, 44.4], [71, 45.6], [76, 46.2], [80.5, 46.4],
]
// En teselas del mapa actual.
export const RIVER_POINTS = TEMPLATE_RIVER_POINTS.map(([x, y]) => [shiftX(x), shiftY(y)])

const smooth = (t) => t * t * (3 - 2 * t)

// La anchura se mide desde un punto del cauce que no ha cambiado (la fila 29 del mapa, a media altura del Ayuntamiento), para que de
// ahí al sur sea la misma que cuando el río nacía recto en el borde norte: entonces ese punto quedaba a 26,75 teselas del nacimiento,
// con 74,68 teselas de río en total.
const ANCHOR_ROW = 29
const OLD_ANCHOR_TILES = 26.75
const OLD_TOTAL_TILES = 74.684

// Anchura en teselas según lo recorrido desde el antiguo nacimiento (`tiles`): algo más de cuatro de la fila de referencia al puente
// romano y algo más al salir, con una onda suave para que no sea una cinta de ancho uniforme. Aguas arriba de la fila de referencia (la
// curva y el tramo que entra por el norte) se queda con la anchura que tiene allí, de orilla a orilla, hasta el borde.
function widthAt(tiles) {
  const t = Math.max(OLD_ANCHOR_TILES, tiles)
  const head = 3.4
  const body = 0.9 * smooth(Math.max(0, Math.min(1, (t - 14) / 16)))
  const ripple = 0.35 * Math.sin(t * 0.55 + 1) * smooth(Math.min(1, t / 10))
  const mouth = 0.6 * smooth(Math.max(0, (tiles / OLD_TOTAL_TILES - 0.82) / 0.18))
  return head + body + ripple + mouth
}

// Catmull-Rom entre `b` y `c` con vecinos `a` y `d`.
function spline(a, b, c, d, t) {
  const t2 = t * t
  const t3 = t2 * t
  return [0, 1].map((k) => 0.5 * (2 * b[k] + (-a[k] + c[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t2 + (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * t3))
}

const STEP_PX = 5
// Rejilla de cubos de 32 px con las muestras que caen en cada uno: la distancia a un píxel solo mira las muestras cercanas. Pintar el
// suelo pregunta por más de un millón de píxeles, así que lo lejano al río se descarta con una sola consulta (`NEAR`).
const CELL = 32

// Muestras de la línea central, una cada pocos píxeles: posición, anchura media y avance.
function sampleCurve(controlPoints, widthOf) {
  const points = [controlPoints[0], ...controlPoints, controlPoints.at(-1)]
  const raw = []
  for (let i = 1; i < points.length - 2; i++) {
    for (let k = 0; k < 24; k++) {
      const [x, y] = spline(points[i - 1], points[i], points[i + 1], points[i + 2], k / 24)
      raw.push({ x: x * TILE, y: y * TILE })
    }
  }
  raw.push({ x: controlPoints.at(-1)[0] * TILE, y: controlPoints.at(-1)[1] * TILE })
  // Se reparten a distancia constante para que la anchura avance con la longitud, no con la densidad de los puntos de control.
  const lengths = [0]
  for (let i = 1; i < raw.length; i++) lengths.push(lengths[i - 1] + Math.hypot(raw[i].x - raw[i - 1].x, raw[i].y - raw[i - 1].y))
  const total = lengths.at(-1)
  // Lo recorrido hasta la fila de referencia en esta curva, para medir la anchura como antes (ver `widthAt`).
  const anchorAt = raw.findIndex((point) => point.y >= ANCHOR_ROW * TILE)
  const offset = lengths[Math.max(0, anchorAt)] / TILE - OLD_ANCHOR_TILES
  const samples = []
  let at = 0
  for (let distance = 0; distance <= total; distance += STEP_PX) {
    while (at < raw.length - 2 && lengths[at + 1] < distance) at += 1
    const span = lengths[at + 1] - lengths[at] || 1
    const f = Math.min(1, (distance - lengths[at]) / span)
    const x = raw[at].x + (raw[at + 1].x - raw[at].x) * f
    const y = raw[at].y + (raw[at + 1].y - raw[at].y) * f
    const u = distance / total
    samples.push({ x, y, half: (widthOf(distance / TILE - offset) * TILE) / 2, u })
  }
  return samples
}

// Campo de distancia de una curva: devuelve `(px, py) =>` distancia con signo (px) al borde del agua, positiva dentro y negativa fuera
// (`-99` lejos del río). Es la unión de los círculos de cada muestra, así que las curvas salen redondeadas y los cambios de anchura,
// graduales.
function distanceField(samples) {
  const reach = Math.ceil(Math.max(...samples.map((s) => s.half)) + 8)
  const span = Math.ceil(reach / CELL)
  const cells = samples.map((s) => [Math.floor(s.x / CELL), Math.floor(s.y / CELL)])
  const bounds = {
    x0: Math.min(...cells.map(([c]) => c)) - span,
    y0: Math.min(...cells.map(([, r]) => r)) - span,
    x1: Math.max(...cells.map(([c]) => c)) + span,
    y1: Math.max(...cells.map(([, r]) => r)) + span,
  }
  const gridW = bounds.x1 - bounds.x0 + 1
  const cellIndex = (cx, cy) => (cy - bounds.y0) * gridW + (cx - bounds.x0)
  const buckets = new Array(gridW * (bounds.y1 - bounds.y0 + 1))
  const near = new Uint8Array(buckets.length)
  samples.forEach((sample, index) => {
    ;(buckets[cellIndex(Math.floor(sample.x / CELL), Math.floor(sample.y / CELL))] ??= []).push(index)
  })
  buckets.forEach((bucket, at) => {
    if (!bucket) return
    const cx = (at % gridW) + bounds.x0
    const cy = Math.floor(at / gridW) + bounds.y0
    for (let dy = -span; dy <= span; dy++) for (let dx = -span; dx <= span; dx++) near[cellIndex(cx + dx, cy + dy)] = 1
  })

  return (px, py) => {
    const cx = Math.floor(px / CELL)
    const cy = Math.floor(py / CELL)
    if (cx < bounds.x0 || cx > bounds.x1 || cy < bounds.y0 || cy > bounds.y1 || !near[cellIndex(cx, cy)]) return -99
    let best = -Infinity
    for (let dy = -span; dy <= span; dy++) {
      for (let dx = -span; dx <= span; dx++) {
        const ax = cx + dx
        const ay = cy + dy
        if (ax < bounds.x0 || ax > bounds.x1 || ay < bounds.y0 || ay > bounds.y1) continue
        const bucket = buckets[cellIndex(ax, ay)]
        if (!bucket) continue
        for (const index of bucket) {
          const sample = samples[index]
          const gx = px - sample.x
          const gy = py - sample.y
          const radius = sample.half + 8
          const squared = gx * gx + gy * gy
          if (squared > radius * radius) continue
          const inside = sample.half - Math.sqrt(squared)
          if (inside > best) best = inside
        }
      }
    }
    return best === -Infinity ? -99 : Math.max(best, -99)
  }
}

const SAMPLES = sampleCurve(RIVER_POINTS, widthAt)
const riverDistance = distanceField(SAMPLES)

// Distancia con signo (px) del punto al borde del agua: positiva dentro, negativa fuera.
export const signedDistance = riverDistance

// Teselas de agua (las que no se pisan) según un campo de distancia: las que tienen el centro dentro del agua o a menos de 3 px de ella.
// Así la viajera no entra en el agua dibujada y, como mucho, se queda unos píxeles antes de la orilla.
const tilesOf = (field, cols, rows) => {
  const set = new Set()
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) if (field(x * TILE + TILE / 2, y * TILE + TILE / 2) > -3) set.add(`${x},${y}`)
  }
  return set
}

export const riverTiles = (cols, rows) => tilesOf(riverDistance, cols, rows)

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

// Fracción del recorrido (`u`) del punto de la línea central más cercano a una tesela (decimales).
export function riverNear(tx, ty) {
  let best = 0
  let bestDistance = Infinity
  SAMPLES.forEach((s, i) => {
    const d = Math.hypot(s.x - tx * TILE, s.y - ty * TILE)
    if (d < bestDistance) {
      best = i
      bestDistance = d
    }
  })
  return best / (SAMPLES.length - 1)
}

// Todas las muestras de la línea central (solo lectura): la vida del río (nenúfares, peces) las usa para colocarse.
export const RIVER_SAMPLES = SAMPLES
