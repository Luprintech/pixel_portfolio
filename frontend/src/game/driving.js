// Conducir el SEAT Córdoba por el valle, sin Phaser: avance del coche y sitio libre para bajarse. De momento el coche va
// por todo el mapa sin chocar con nada (decisión de la usuaria, 2026-11-13); por dónde puede ir se fijará cuando los caminos
// sean definitivos. La viajera sí choca al bajarse, así que solo se baja donde sus pies caben.

// Velocidad máxima en píxeles por segundo: algo más del doble de lo que anda la viajera (90).
export const CAR_SPEED = 150
// Constante de tiempo de la aceleración y la frenada: el coche no arranca ni se para en seco.
const EASE_MS = 350
// Medio ancho del dibujo (66) con un píxel de margen y su alto (31): el coche no asoma por los bordes del mapa.
const HALF_W = 33
const HEIGHT = 31
const DEAD_ZONE = 0.15

// Los pies de la viajera: el mismo cuerpo de 8×4 que le da la escena.
const FEET = { w: 8, h: 4 }
// Dónde se baja, por orden de preferencia: delante del coche (por debajo), detrás (por encima) y a cada lado.
const EXITS = [
  { dx: 0, dy: 10 },
  { dx: 0, dy: -14 },
  { dx: -40, dy: -2 },
  { dx: 40, dy: -2 },
]

// Coche parado en (x, y), su punto de apoyo entre las ruedas. Se dibuja con el frontal a la izquierda.
export function createCar(x, y, facing = 'left') {
  return { x, y, vx: 0, vy: 0, facing }
}

// Avanza el coche `delta` ms según la dirección pedida (`input`, de -1 a 1 por eje) y lo mantiene dentro del mapa.
// Modifica `car` y devuelve cuánto va acelerado (0 parado, 1 a tope), que marca el tono del motor.
export function stepCar(car, input, delta, bounds) {
  const len = Math.hypot(input.x, input.y)
  const scale = len > DEAD_ZONE ? Math.min(1, len) / len : 0
  const ease = Math.min(1, delta / EASE_MS)
  car.vx += (input.x * scale * CAR_SPEED - car.vx) * ease
  car.vy += (input.y * scale * CAR_SPEED - car.vy) * ease
  car.x = clamp(car.x + (car.vx * delta) / 1000, HALF_W, bounds.w - HALF_W)
  car.y = clamp(car.y + (car.vy * delta) / 1000, HEIGHT, bounds.h)
  // Solo hay dibujo de perfil: al subir o bajar conserva el último lado.
  if (Math.abs(input.x) > DEAD_ZONE) car.facing = input.x < 0 ? 'left' : 'right'
  return Math.min(1, Math.hypot(car.vx, car.vy) / CAR_SPEED)
}

// Primer sitio junto al coche donde caben los pies de la viajera sin tocar ningún cuerpo sólido (`rects`, cajas
// { x, y, w, h }) ni salirse del mapa, o null si no hay ninguno.
export function freeExitSpot(car, rects, bounds) {
  for (const { dx, dy } of EXITS) {
    const spot = { x: car.x + dx, y: car.y + dy }
    const feet = { x: spot.x - FEET.w / 2, y: spot.y - FEET.h, w: FEET.w, h: FEET.h }
    const inside = feet.x >= 0 && feet.y >= 0 && feet.x + feet.w <= bounds.w && spot.y <= bounds.h
    if (inside && !rects.some((rect) => overlaps(feet, rect))) return spot
  }
  return null
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
