// Cielo y tiempo de la portada. Todo son funciones puras de (milisegundos, semilla): cada visita trae
// una semilla nueva y con ella otra hora del día de partida y otro tiempo, y dibujar es cosa de
// titleSkyPaint.js. Así el ciclo se puede probar sin canvas ni audio.
import { hash2 } from './pixelKit.js'

export const HORIZON = 112
// Un día entero dura dos minutos: de sobra para ver amanecer, atardecer o una tormenta sin esperar.
export const DAY_MS = 120000

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smooth = (v) => {
  const t = clamp01(v)
  return t * t * (3 - 2 * t)
}
const mix = (a, b, t) => a + (b - a) * t

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
export const mixHex = (from, to, t) => {
  const a = hexToRgb(from)
  const b = hexToRgb(to)
  const [r, g, bl] = a.map((c, i) => Math.round(mix(c, b[i], clamp01(t))))
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`
}

// Seis franjas de cielo, de arriba abajo, y cuánta oscuridad hay en cada momento del día.
// `phase` va de 0 (medianoche) a 1: el amanecer cae en 0,24 y el atardecer en 0,72.
export const BAND_STARTS = [0, 26, 50, 72, 88, 100]
const KEYS = [
  { phase: 0, dark: 1, bands: ['#14132e', '#1c1b3a', '#2e2d5a', '#3b3572', '#4b4380', '#5c5a7a'] },
  { phase: 0.16, dark: 1, bands: ['#14132e', '#1c1b3a', '#2e2d5a', '#3b3572', '#4b4380', '#5c5a7a'] },
  { phase: 0.24, dark: 0.45, bands: ['#3b3572', '#7a6ab0', '#d58fae', '#f4a98f', '#f8c070', '#f8d77a'] },
  { phase: 0.34, dark: 0, bands: ['#4a93c0', '#6cb0d6', '#8fd3dd', '#b4e2e6', '#d3f0f2', '#f1e6cf'] },
  { phase: 0.62, dark: 0, bands: ['#4a93c0', '#6cb0d6', '#8fd3dd', '#b4e2e6', '#d3f0f2', '#f1e6cf'] },
  { phase: 0.72, dark: 0.5, bands: ['#2e2d5a', '#4b4380', '#7a6ab0', '#b58bb8', '#e59a98', '#f2b134'] },
  { phase: 0.82, dark: 1, bands: ['#14132e', '#1c1b3a', '#2e2d5a', '#3b3572', '#4b4380', '#5c5a7a'] },
  { phase: 1, dark: 1, bands: ['#14132e', '#1c1b3a', '#2e2d5a', '#3b3572', '#4b4380', '#5c5a7a'] },
]

function keysAt(phase) {
  const next = KEYS.findIndex((k) => k.phase > phase)
  const b = KEYS[next === -1 ? KEYS.length - 1 : next]
  const a = KEYS[Math.max(0, (next === -1 ? KEYS.length - 1 : next) - 1)]
  const t = b.phase === a.phase ? 0 : (phase - a.phase) / (b.phase - a.phase)
  return {
    dark: mix(a.dark, b.dark, t),
    bands: a.bands.map((color, i) => mixHex(color, b.bands[i], t)),
  }
}

// El tiempo cambia cada 45 s; los primeros 8 s de cada tramo se funden con el anterior.
export const WEATHER_MS = 45000
const WEATHER_FADE_MS = 8000
const WEATHER = {
  clear: { cloud: 0.2, rain: 0, storm: 0, snow: 0, wind: 0.25 },
  cloudy: { cloud: 0.7, rain: 0, storm: 0, snow: 0, wind: 0.5 },
  rain: { cloud: 0.9, rain: 0.65, storm: 0, snow: 0, wind: 0.6 },
  storm: { cloud: 1, rain: 1, storm: 1, snow: 0, wind: 0.9 },
  snow: { cloud: 0.85, rain: 0, storm: 0, snow: 1, wind: 0.35 },
}
const WEATHER_ODDS = [['clear', 0.32], ['cloudy', 0.52], ['rain', 0.72], ['storm', 0.85], ['snow', 1]]

function weatherKind(seed, k) {
  const roll = hash2(k, 5, seed % 997)
  return WEATHER_ODDS.find(([, limit]) => roll < limit)[0]
}

// `pace` alarga el reloj del mundo (día, tiempo y estaciones): con 4, todo dura cuatro veces más. La portada
// usa 1; el valle, más pausado, uno mayor. Solo estira lo que cambia despacio: las gotas y los destellos
// de los rayos siguen al reloj real.
function weatherAt(realMs, seed, pace = 1) {
  const ms = realMs / pace
  const k = Math.floor(ms / WEATHER_MS)
  const now = WEATHER[weatherKind(seed, k)]
  if (k === 0) return now
  const before = WEATHER[weatherKind(seed, k - 1)]
  const t = smooth((ms - k * WEATHER_MS) / WEATHER_FADE_MS)
  return Object.fromEntries(Object.keys(now).map((key) => [key, mix(before[key], now[key], t)]))
}

// Arcoíris: sale cuando el tiempo pasa de lluvioso a seco y se desvanece antes del siguiente cambio.
// Con el sol ya bajo o de noche no se ve, y tampoco si lo que viene es nieve.
const RAINBOW_FADE_MS = 8000
function rainbowAt(realMs, seed, pace = 1) {
  const ms = realMs / pace
  const k = Math.floor(ms / WEATHER_MS)
  const now = WEATHER[weatherKind(seed, k)]
  if (WEATHER[weatherKind(seed, k - 1)].rain < 0.3 || now.rain >= 0.3 || now.snow > 0) return 0
  // Aparece cuando el cielo ya se ha despejado: tras el fundido del tiempo, salvo al empezar la visita.
  const local = ms - k * WEATHER_MS - (k === 0 ? 0 : WEATHER_FADE_MS)
  return Math.min(smooth(local / RAINBOW_FADE_MS), smooth((WEATHER_MS - WEATHER_FADE_MS - local) / RAINBOW_FADE_MS))
}

// La visita empieza a una hora al azar del día, para que a veces toque ver salir el sol.
export const startPhase = (seed) => hash2(seed % 4093, 7, 11)

// Recorrido de sol y luna: nacen por la izquierda, suben, y se ponen por la derecha.
function arc(t) {
  return { x: -10 + t * 340, y: HORIZON + 6 - Math.sin(t * Math.PI) * (HORIZON - 26), height: Math.sin(t * Math.PI) }
}

const SUN_SPAN = [0.2, 0.76]
const MOON_SPAN = [0.72, 1.28]

function bodyAt(phase, [from, to]) {
  const p = phase < from && to > 1 ? phase + 1 : phase
  if (p < from || p > to) return null
  return arc((p - from) / (to - from))
}

// Estado completo de la portada en un instante. Con `still` (movimiento reducido) no hay lluvia ni rayos.
export function skyAt(ms, seed, still = false, pace = 1) {
  const phase = (startPhase(seed) + ms / (DAY_MS * pace)) % 1
  const { dark, bands } = keysAt(phase)
  const weather = weatherAt(ms, seed, pace)
  const rain = still ? 0 : weather.rain
  const storm = still ? 0 : weather.storm
  const snow = still ? 0 : weather.snow
  return {
    phase,
    dark,
    bands,
    // Bioma: con lluvia el valle pasa de la primavera de flores al otoño de setas y hojas caídas.
    autumn: clamp01(rain / 0.65),
    // Con la nevada el valle pasa a invierno: mismo fundido que el otoño, y los dos no coinciden.
    winter: clamp01(snow),
    rainbow: rainbowAt(ms, seed, pace) * (1 - dark),
    sun: bodyAt(phase, SUN_SPAN),
    moon: bodyAt(phase, MOON_SPAN),
    cloud: still ? Math.min(weather.cloud, 0.7) : weather.cloud,
    rain,
    storm,
    snow,
    wind: weather.wind,
    // Oscuridad total: la hora más la que añaden la lluvia y la tormenta; la nevada, más suave, también
    // enciende alguna ventana.
    gloom: Math.min(1, dark + 0.35 * rain + 0.2 * snow),
  }
}

// Hay mariposas de día y con el valle en primavera: ni de noche, ni con la lluvia del otoño, ni con nieve.
export const butterfliesOut = (sky) => sky.dark < 0.5 && sky.autumn < 0.5 && sky.winter < 0.5

// Cuántas ventanas del pueblo están encendidas: ninguna de día y todas cuando cae la noche.
export const LIGHTS = 4
export function windowsLit(gloom) {
  return gloom < 0.3 ? 0 : Math.min(LIGHTS, Math.ceil(((gloom - 0.3) / 0.7) * LIGHTS))
}

// Rayos: como mucho uno cada nueve segundos y solo cuando la tormenta está en su punto. Cada rayo es
// un destello doble y su trueno llega con retraso, como lo oiríamos de lejos.
const STRIKE_SLOT_MS = 9000
const FLASH_MS = 110
const SECOND_FLASH_AT = 190

function strikeAt(k, seed, pace = 1) {
  if (k < 0 || hash2(k, 1, seed % 991) > 0.8) return null
  const time = k * STRIKE_SLOT_MS + 1000 + hash2(k, 2, seed % 991) * 6000
  if (weatherAt(time, seed, pace).storm < 0.6) return null
  return { time, x: 40 + hash2(k, 3, seed % 991) * 240, delay: 0.3 + hash2(k, 4, seed % 991) * 2.2 }
}

// Intensidad del destello (0 a 1) y por dónde cae el rayo en este instante.
export function lightningAt(ms, seed, pace = 1) {
  const strike = strikeAt(Math.floor(ms / STRIKE_SLOT_MS), seed, pace)
  if (!strike) return null
  const first = 1 - (ms - strike.time) / FLASH_MS
  const second = 0.7 * (1 - (ms - strike.time - SECOND_FLASH_AT) / FLASH_MS)
  const flash = Math.max(first <= 1 ? first : 0, second <= 0.7 ? second : 0)
  return flash > 0 ? { flash: Math.min(1, flash), x: strike.x, id: strike.time } : null
}

// Rayos que cayeron entre dos instantes, con los segundos que tarda en oírse cada trueno.
export function strikesBetween(fromMs, toMs, seed, pace = 1) {
  const found = []
  for (let k = Math.floor(fromMs / STRIKE_SLOT_MS); k <= Math.floor(toMs / STRIKE_SLOT_MS); k++) {
    const strike = strikeAt(k, seed, pace)
    if (strike && strike.time > fromMs && strike.time <= toMs) found.push(strike)
  }
  return found
}

// Gotas de lluvia: más cuanto más llueve. Caen en diagonal y vuelven a empezar arriba.
const RAIN_WIDTH = 320
const RAIN_HEIGHT = 180
export function rainDrops(ms, rain, width = RAIN_WIDTH, height = RAIN_HEIGHT) {
  const count = Math.round(rain * 130 * ((width * height) / (RAIN_WIDTH * RAIN_HEIGHT)))
  return Array.from({ length: count }, (_, i) => {
    const y = (hash2(i, 2, 3) * height + ms * 0.33) % (height + 10) - 5
    const x = (hash2(i, 1, 3) * width + y * 0.25) % width
    return { x, y, long: i % 3 === 0 }
  })
}

// Copos de nieve: más cuanto más nieva. Bajan despacio, se mecen de lado a lado y los grandes caen
// más lentos que los pequeños, para dar profundidad.
export function snowFlakes(ms, snow, width = RAIN_WIDTH, height = RAIN_HEIGHT) {
  const count = Math.round(snow * 90 * ((width * height) / (RAIN_WIDTH * RAIN_HEIGHT)))
  return Array.from({ length: count }, (_, i) => {
    const big = i % 5 === 0
    const speed = big ? 0.014 : 0.022
    const y = (hash2(i, 4, 3) * (height + 10) + ms * speed) % (height + 10) - 5
    const sway = Math.sin(ms / (900 + (i % 7) * 130) + i) * (big ? 5 : 3)
    const x = (((hash2(i, 5, 3) * width + sway) % width) + width) % width
    return { x, y, big }
  })
}
