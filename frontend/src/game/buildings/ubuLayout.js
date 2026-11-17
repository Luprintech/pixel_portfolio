// Geometría de la fachada de la Universidad de Burgos (240×119, ver `civic.js`): por dónde se anda delante de ella. Se sube
// al rellano de la puerta por la escalinata central o por la rampa de la izquierda, que arranca a ras de suelo en la esquina
// oeste y sube en diagonal pegada al ala. Todo en píxeles de la fachada (origen arriba a la izquierda); sin Phaser.
//
// Los cuerpos sólidos salen de restar al bulto del edificio el hueco que necesita el cuerpo de la viajera (8×4 px sobre sus
// pies) en cada punto pisable, y de juntar en rectángulos las filas iguales. Así la escalera y la rampa, que son diagonales,
// quedan bien aunque los cuerpos de Phaser sean rectángulos.

export const UBU_FACADE = { w: 240, h: 119 }
// Centro de la puerta acristalada, entre sus dos hojas.
export const UBU_DOOR_COL = 122

const BODY_HALF_W = 4
const BODY_H = 4

// Línea de los pies en la rampa: a ras de suelo en la esquina (fila 113) y en el rellano (fila 102) al llegar a x 90.
export const rampFeet = (x) => 113 - (x * 11) / 90
const RAMP_END = 97
// La rampa como tramo de la línea de los pies, para que la escena ayude a subirla andando solo en horizontal (`ramps.js`).
export const UBU_RAMP = { x0: 0, y0: rampFeet(0), x1: RAMP_END, y1: rampFeet(RAMP_END) }
// Pasamanos central de la escalinata, columnas 119 a 121.
const RAIL = { left: 118, right: 122 }
const LANDING_TOP = 102
const STAIRS_TOP = 104
const STAIRS_BOTTOM = 118

const stairsLeft = (y) => (y < STAIRS_TOP ? 97 : 95 - (y - STAIRS_TOP) * 2)
const stairsRight = (y) => (y < STAIRS_TOP ? 150 : 150 + (y - STAIRS_TOP) * 1.3)

// ¿Pueden estar ahí los pies de la viajera? Rellano, escalinata (a los lados del pasamanos) o rampa.
// Bajo el último escalón los pies pueden seguir unas filas más: así la fila de piedra del arranque queda libre y se pasa
// del paseo a la escalinata sin tropezar.
export function walkable(x, y) {
  const stairsY = Math.min(y, STAIRS_BOTTOM)
  const onStairs = y >= LANDING_TOP && y <= STAIRS_BOTTOM + BODY_H && x >= stairsLeft(stairsY) && x <= stairsRight(stairsY)
  const offRail = x <= RAIL.left - BODY_HALF_W || x >= RAIL.right + BODY_HALF_W
  const onRamp = x >= 0 && x <= RAMP_END && Math.abs(y - rampFeet(x)) <= 2
  return (onStairs && offRail) || onRamp
}

// Bulto del edificio: el muro, el zócalo de la rampa y la escalinata.
const FOOTPRINT = [
  { x: 0, y: 5, w: 240, h: 109 },
  { x: 5, y: 114, w: 204, h: 3 },
  { x: 65, y: 117, w: 106, h: 2 },
]
const inFootprint = (x, y) => FOOTPRINT.some((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h)

function freeGrid() {
  const { w, h } = UBU_FACADE
  const free = Array.from({ length: h }, () => new Uint8Array(w))
  for (let fy = 0; fy <= h + BODY_H; fy++) {
    for (let fx = -BODY_HALF_W; fx < w + BODY_HALF_W; fx++) {
      if (!walkable(fx, fy)) continue
      for (let y = fy - BODY_H; y < fy; y++) {
        for (let x = fx - BODY_HALF_W; x < fx + BODY_HALF_W; x++) if (y >= 0 && y < h && x >= 0 && x < w) free[y][x] = 1
      }
    }
  }
  return free
}

// Tramos sólidos de una fila, como `[inicio, fin)`.
function rowRuns(free, y) {
  const runs = []
  let start = -1
  for (let x = 0; x <= UBU_FACADE.w; x++) {
    const solid = x < UBU_FACADE.w && inFootprint(x, y) && !free[y][x]
    if (solid && start < 0) start = x
    if (!solid && start >= 0) {
      runs.push([start, x])
      start = -1
    }
  }
  return runs
}

// Cuerpos sólidos en píxeles de la fachada: las filas seguidas con los mismos tramos se juntan en un rectángulo.
export function ubuBodies() {
  const free = freeGrid()
  const bodies = []
  let open = new Map()
  for (let y = 0; y <= UBU_FACADE.h; y++) {
    const runs = y < UBU_FACADE.h ? rowRuns(free, y) : []
    const keys = new Set(runs.map(([a, b]) => `${a},${b}`))
    const next = new Map()
    open.forEach((rect, key) => (keys.has(key) ? next.set(key, { ...rect, h: rect.h + 1 }) : bodies.push(rect)))
    runs.forEach(([a, b]) => {
      const key = `${a},${b}`
      if (!next.has(key)) next.set(key, { x: a, y, w: b - a, h: 1 })
    })
    open = next
  }
  return bodies
}

// Zona de `E`: el rellano ante la puerta, a los dos lados del pasamanos, porque el pasamanos corta el rellano y quien sube por
// la mitad derecha de la escalinata no puede cruzar a la izquierda. La salida del interior deja a la viajera donde pulsó `E`, así
// que siempre vuelve a un sitio del rellano libre de barandillas.
export const UBU_DOOR_ZONE = { x: 100, y: 96, w: 44, h: 11 }
// Profundidad del fondo: justo por encima de los pies más altos del rellano y la rampa, para que quien sube quede por delante.
export const UBU_BACK_ROW = 100
