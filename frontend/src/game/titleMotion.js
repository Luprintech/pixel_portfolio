// Movimiento de la pantalla de título. Todo son funciones puras del tiempo (en milisegundos):
// dibujar es cosa de titleArt.js, y así el movimiento se puede probar sin canvas.
import { hash2 } from './pixelKit.js'

export const TITLE_WIDTH = 320
// Instante que se dibuja cuando se pide movimiento reducido: la gata quieta y la hora fijada.
export const STILL_MS = 6000

// Parpadeo de la viajera: uno cada poco más de tres segundos y, de vez en cuando, otro seguido.
export function isBlinking(ms) {
  return ms % 3400 < 140 || (ms + 1700) % 9100 < 120
}

// Estrella fugaz: una cada nueve segundos, con salida y sentido distintos cada vez.
const STAR_PERIOD = 9000
const STAR_DURATION = 1000
const STAR_OFFSET = 2500

export function shootingStar(ms) {
  if (ms < STAR_OFFSET) return null
  const k = Math.floor((ms - STAR_OFFSET) / STAR_PERIOD)
  const local = ms - STAR_OFFSET - k * STAR_PERIOD
  if (local > STAR_DURATION) return null
  const p = local / STAR_DURATION
  const sign = hash2(k, 0, 3) > 0.5 ? 1 : -1
  const x0 = 60 + hash2(k, 0, 1) * 200
  const y0 = 6 + hash2(k, 0, 2) * 34
  return { x: x0 + sign * 90 * p, y: y0 + 34 * p, dx: -sign * 0.93, dy: -0.37, alpha: Math.sin(p * Math.PI) }
}

// Brillo de las estrellas fijas: cada una parpadea a su ritmo.
export function starAlpha(index, ms) {
  return 0.45 + 0.55 * ((Math.sin(ms / 700 + index * 2.3) + 1) / 2)
}

// Las nubes derivan despacio hacia la derecha y reaparecen por la izquierda. Con más cobertura
// salen más, hasta siete.
const CLOUDS = [
  { x: 58, y: 78, scale: 1, speed: 2.2 },
  { x: 150, y: 62, scale: 0.8, speed: 1.4 },
  { x: 290, y: 84, scale: 1, speed: 3 },
  { x: 220, y: 40, scale: 1.1, speed: 2.6 },
  { x: 20, y: 46, scale: 0.9, speed: 1.8 },
  { x: 110, y: 28, scale: 1.2, speed: 1.1 },
  { x: 260, y: 66, scale: 0.9, speed: 3.4 },
]
const CLOUD_SPAN = TITLE_WIDTH + 100

export function cloudsAt(ms, coverage = 0.4) {
  const count = Math.min(CLOUDS.length, 2 + Math.round(coverage * 5))
  return CLOUDS.slice(0, count).map((c) => ({ ...c, x: ((c.x + 50 + (ms / 1000) * c.speed) % CLOUD_SPAN) - 50 }))
}

// Pájaros: una bandada de tres cruza el cielo cada dieciséis segundos.
const BIRD_PERIOD = 16000
const BIRD_OFFSET = 5000
const BIRD_CROSSING_MS = 12000

export function birdsAt(ms) {
  if (ms < BIRD_OFFSET) return []
  const local = (ms - BIRD_OFFSET) % BIRD_PERIOD
  if (local > BIRD_CROSSING_MS) return []
  const x = -12 + (local / BIRD_CROSSING_MS) * (TITLE_WIDTH + 24)
  return [0, 1, 2].map((i) => ({
    x: x - i * 9,
    y: 84 + i * 5 + Math.round(Math.sin(local / 500 + i) * 2),
    wing: Math.floor(local / 170 + i) % 2,
  }))
}

// Humo de la chimenea de la herrería: cuatro volutas que suben, se ensanchan y se desvanecen.
export function smokeAt(ms) {
  return [0, 1, 2, 3].map((i) => {
    const phase = (ms / 4200 + i / 4) % 1
    return { x: 198 + phase * 8 + Math.sin(phase * 6 + i) * 2, y: 56 - phase * 30, r: 2 + phase * 3, alpha: 0.85 * (1 - phase) }
  })
}

// Pétalos que caen del cerezo, mecidos por una brisa suave hacia la izquierda.
export function petalsAt(ms) {
  return [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const phase = (ms / 7000 + i * 0.143) % 1
    return { x: 300 + (i % 4) * 5 - phase * 46 + Math.sin(phase * 10 + i) * 4, y: 112 + phase * 46, light: i % 2 === 0 }
  })
}

// Luciérnagas del prado: vagan en pequeños círculos y se encienden y apagan.
const FIREFLIES = [[40, 150], [74, 164], [112, 142], [150, 160], [188, 170], [240, 162], [270, 144], [300, 168], [128, 174]]

export function firefliesAt(ms) {
  return FIREFLIES.map(([bx, by], i) => ({
    x: bx + Math.sin(ms / 1700 + i) * 10,
    y: by + Math.cos(ms / 2300 + i * 2) * 6,
    glow: (Math.sin(ms / 600 + i * 1.7) + 1) / 2,
  }))
}

// Mariposas de primavera: revolotean sobre las flores del prado, cada una por su lado.
// La primera es la que persigue Khalessi: revolotea delante de Lupe y las demás, a los lados.
const BUTTERFLIES = [[196, 164], [150, 152], [236, 152], [168, 166], [226, 166]]

export function butterfliesAt(ms) {
  return BUTTERFLIES.map(([bx, by], i) => ({
    x: bx + Math.sin(ms / 1900 + i * 1.9) * 22 + Math.sin(ms / 700 + i) * 3,
    y: by + Math.sin(ms / 1300 + i * 2.4) * 9 + Math.cos(ms / 410 + i) * 2,
    open: Math.floor(ms / 150 + i) % 2 === 0,
    kind: i % 3,
  }))
}

// Las flores del primer plano se mecen: la corola se desplaza un píxel a un lado y a otro.
export function flowerSway(index, ms) {
  return Math.round(Math.sin(ms / 900 + index * 0.9))
}
