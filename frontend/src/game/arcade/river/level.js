// El nivel de «Río en Peligro»: un río generado a partir de una semilla (siempre el mismo para la misma semilla) con cinco tramos,
// un puente al final de cada uno, depósitos de combustible, enemigos y obstáculos que aparecen más seguido a medida que avanza, y
// una pista de despegue al principio y otra de aterrizaje al final. Todo está en coordenadas del mundo: `wy` crece hacia delante y
// la avioneta vuela siempre a la altura de la pantalla `PLANE_Y`. Son solo datos y cálculo, sin canvas, Phaser ni React.
import { FRAME, random } from '../shared.js'

export const { width: W, height: H } = FRAME
export const PLANE_Y = 150
export const SECTIONS = 5
export const SECTION_LEN = 2600
export const BRIDGE_ROW = 12
// Pista de despegue (detrás de la avioneta al empezar) y de aterrizaje (tras el último puente).
export const TAKEOFF_RUNWAY = { y0: -80, y1: 120 }
export const LAND_ZONE_START = SECTIONS * SECTION_LEN + 380
export const LANDING_RUNWAY = { y0: LAND_ZONE_START + 260, y1: LAND_ZONE_START + 500, x: W / 2, half: 22 }
export const LEVEL_END = LANDING_RUNWAY.y1 + 60
// Semillas de ríos distintos que se alternan entre partidas (todos probados en `river.test.js`).
export const RIVER_SEEDS = [5, 11, 23, 42, 77]
const AIRFIELD_WIDTH = 226

// Posición en el mundo de cada puente.
export const bridgeY = (section) => (section + 1) * SECTION_LEN

const lerp = (a, b, t) => a + (b - a) * t
const clamp01 = (t) => Math.min(1, Math.max(0, t))
const smooth = (t) => t * t * (3 - 2 * t)

// 0 lejos de `at` y 1 encima, con una rampa de `reach` píxeles.
const nearness = (y, at, reach) => smooth(clamp01(1 - Math.abs(y - at) / reach))

// Cuánto se parece el río, en la altura `y`, a un campo de aviación: ancho y recto al despegar y al aterrizar.
const airfieldMix = (y) => Math.max(clamp01((TAKEOFF_RUNWAY.y1 + 160 - y) / 160), clamp01((y - (LAND_ZONE_START - 100)) / 140))
const bridgeMix = (y) => Math.max(...Array.from({ length: SECTIONS }, (_, s) => nearness(y, bridgeY(s), 110)))

// Orillas del río en la altura `y`: `{ left, right }` en píxeles de pantalla. El cauce serpentea y cambia de anchura, y se
// endereza y ensancha a ratos ante los puentes y las pistas para que siempre haya paso.
export function riverAt(seed, y) {
  const a = (seed * 0.37) % 6.28
  const b = (seed * 0.91) % 6.28
  const c = (seed * 1.73) % 6.28
  let centre = W / 2 + 30 * Math.sin(y / 310 + a) + 15 * Math.sin(y / 133 + b)
  let width = Math.min(150, Math.max(86, 120 + 30 * Math.sin(y / 410 + c) + 10 * Math.sin(y / 170 + a)))
  const field = airfieldMix(y)
  const bridge = bridgeMix(y)
  centre = lerp(centre, W / 2, Math.max(field, bridge))
  width = lerp(width, 134, bridge)
  width = lerp(width, AIRFIELD_WIDTH, field)
  // Siempre queda un margen de tierra a cada lado, aunque el cauce serpentee y se ensanche a la vez.
  centre = Math.min(W - width / 2 - 6, Math.max(width / 2 + 6, centre))
  return { left: centre - width / 2, right: centre + width / 2 }
}

// Medidas de cada objetivo: medio ancho y medio alto de su caja y los puntos que da.
export const KINDS = {
  ship: { hw: 8, hh: 4, score: 30 },
  heli: { hw: 8, hh: 6, score: 60 },
  jet: { hw: 8, hh: 4, score: 100 },
  mine: { hw: 5, hh: 5, score: 20 },
  tank: { hw: 6, hh: 8, score: 80 },
  house: { hw: 6, hh: 6, score: 40 },
}

// Qué tipos aparecen en cada tramo y con qué peso: más peligro cuanto más lejos.
const TABLE = [
  { ship: 5, heli: 2, house: 3, island: 1 },
  { ship: 4, heli: 3, jet: 1, house: 2, island: 2 },
  { ship: 3, heli: 3, jet: 2, mine: 2, island: 2, house: 1 },
  { ship: 2, heli: 3, jet: 3, mine: 3, island: 2, house: 1 },
  { ship: 2, heli: 3, jet: 4, mine: 3, island: 2 },
]

function pick(rng, weights) {
  const entries = Object.entries(weights)
  let roll = random(rng) * entries.reduce((sum, [, w]) => sum + w, 0)
  for (const [type, w] of entries) {
    roll -= w
    if (roll <= 0) return type
  }
  return entries[0][0]
}

// Todos los objetos del nivel, en orden de aparición. Tienen `wy` (posición en el mundo), `x` y lo suyo según el tipo.
export function buildObjects(seed) {
  const rng = { seed: (seed * 2654435761) >>> 0 }
  const objects = []
  let id = 0
  const add = (object) => objects.push({ id: (id += 1), alive: true, ...object })
  for (let section = 0; section < SECTIONS; section++) {
    const from = section * SECTION_LEN + 300
    const to = (section + 1) * SECTION_LEN - 260
    const gap = 150 - section * 14
    for (let wy = from; wy < to; wy += gap + Math.floor(random(rng) * 40)) {
      const { left, right } = riverAt(seed, wy)
      const type = pick(rng, TABLE[section])
      const inside = left + 18 + random(rng) * (right - left - 36)
      if (type === 'island') {
        if (right - left < 104) continue
        const hw = 10 + Math.floor(random(rng) * 6)
        add({ type, x: Math.min(right - hw - 36, Math.max(left + hw + 36, inside)), wy, hw, hh: 22 + Math.floor(random(rng) * 14) })
      } else if (type === 'house') add({ type, x: random(rng) < 0.5 ? left - 12 : right + 12, wy })
      else if (type === 'ship') add({ type, x: inside, wy, vx: (random(rng) < 0.5 ? -1 : 1) * (18 + section * 4) })
      else if (type === 'heli') add({ type, x: inside, wy, vx: (random(rng) < 0.5 ? -1 : 1) * (28 + section * 5) })
      else if (type === 'jet') add({ type, x: -30, wy, side: random(rng) < 0.5 ? 1 : -1, active: false })
      else add({ type, x: inside, wy })
    }
    // Un depósito de combustible cada poco, para que nunca falte si se pasa por encima.
    for (let wy = from + 160; wy < to; wy += 560 - section * 20) {
      const { left, right } = riverAt(seed, wy)
      add({ type: 'tank', x: left + 22 + random(rng) * (right - left - 44), wy })
    }
    add({ type: 'bridge', x: W / 2, wy: bridgeY(section), hp: 2 })
  }
  return objects.sort((a, b) => a.wy - b.wy)
}

// La caja de un objeto en el mundo: `{ x0, x1, y0, y1 }` con `y` hacia delante.
export function boxOf(object) {
  if (object.type === 'bridge') {
    return { x0: 0, x1: W, y0: object.wy - BRIDGE_ROW / 2, y1: object.wy + BRIDGE_ROW / 2 }
  }
  const spec = object.type === 'island' ? object : KINDS[object.type]
  return { x0: object.x - spec.hw, x1: object.x + spec.hw, y0: object.wy - spec.hh, y1: object.wy + spec.hh }
}
