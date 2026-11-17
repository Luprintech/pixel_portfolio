// Estaciones y tiempo del valle como funciones puras. El estado que se guarda es mínimo (`{ season, cycle, elapsed, carry }`): de él y de la
// semilla del valle salen, siempre igual, los episodios de lluvia o nieve de la estación (`planSeason`) y el aspecto del mundo en cada instante
// (`climateOf`). Así recargar no reinicia el cupo de episodios, y probar el ciclo no necesita ni reloj ni Phaser.
// Los tiempos y las probabilidades están en `seasonConfig.js`.
import { hash2 } from './pixelKit.js'
import { EPISODES, EPISODE_GAP_MS, MIN_LEAD_MS, SEASONS, SEASON_FADE_MS, SEASON_MS, SNOW_COVER, TAIL_MS, WEATHER_SHAPE } from './seasonConfig.js'

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smooth = (v) => {
  const t = clamp01(v)
  return t * t * (3 - 2 * t)
}
const lerp = (a, b, t) => a + (b - a) * t
const isNumber = (value) => typeof value === 'number' && Number.isFinite(value)

// Una partida sin datos de estación empieza en primavera. `carry` es el tiempo activo desde el último episodio: sin episodios previos, todo el
// intervalo ya ha pasado (aun así, `MIN_LEAD_MS` impide que algo caiga nada más abrir el juego).
export const initialSeason = () => ({ season: 0, cycle: 0, elapsed: 0, carry: EPISODE_GAP_MS })

// Lo guardado puede venir de otra versión o estar manipulado: solo se acepta lo que tiene forma y rango.
export function sanitizeSeason(raw) {
  if (!raw || typeof raw !== 'object') return null
  const { season, cycle, elapsed, carry } = raw
  if (![season, cycle, elapsed, carry].every(isNumber)) return null
  if (!Number.isInteger(season) || season < 0 || season >= SEASONS.length) return null
  if (!Number.isInteger(cycle) || cycle < 0 || cycle > 1e6) return null
  if (elapsed < 0 || elapsed >= SEASON_MS || carry < 0) return null
  return { season, cycle, elapsed, carry: Math.min(carry, EPISODE_GAP_MS) }
}

// Cuántos episodios toca esta estación, según las probabilidades de `odds` (acumuladas contra una tirada de 0 a 1).
function countFor(odds, roll) {
  let acc = 0
  for (let i = 0; i < odds.length; i++) {
    acc += odds[i]
    if (roll < acc) return i
  }
  return odds.length - 1
}

// Cuánto tiempo hay que dejar libre al final de la estación para una nevada: lo que tarda en derretirse la nieve.
const snowTail = (kind) => (kind === 'snow' ? SNOW_COVER.hold + SNOW_COVER.melt : 0)

// Los episodios de una estación: `{ start, end, kind, strength }` en ms desde que empieza. Respetan el máximo de la estación, el intervalo
// mínimo con el episodio anterior (también el de antes de empezar la estación, por `carry`) y que acaben antes de que acabe la estación.
export function planSeason({ season, cycle, carry }, seed) {
  const config = EPISODES[SEASONS[season]]
  const salt = (Math.abs(seed | 0) % 9973) + 1
  const roll = (n) => hash2(cycle * SEASONS.length + season, n, salt)
  const count = countFor(config.odds, roll(0))
  const durations = Array.from({ length: count }, (_, i) => lerp(config.duration[0], config.duration[1], roll(10 + i)))
  const latestEnd = SEASON_MS - TAIL_MS - snowTail(config.kind)
  const plan = []
  let earliest = Math.max(MIN_LEAD_MS, EPISODE_GAP_MS - carry)
  durations.forEach((duration, i) => {
    // Si no cabe, se descarta: el máximo es un tope, no una obligación.
    const reserve = durations.slice(i + 1).reduce((sum, d) => sum + EPISODE_GAP_MS + d, 0)
    const latestStart = latestEnd - duration - reserve
    if (plan.length !== i || earliest > latestStart) return
    const start = earliest + roll(20 + i) * (latestStart - earliest)
    plan.push({ start, end: start + duration, kind: config.kind, strength: config.strength })
    earliest = start + duration + EPISODE_GAP_MS
  })
  return plan
}

// Tiempo activo desde el último episodio, con el estado y el plan dados. Un episodio en marcha cuenta como cero.
export function sinceLastEpisode(plan, elapsed, carry) {
  if (plan.some((e) => e.start <= elapsed && elapsed < e.end)) return 0
  const finished = plan.filter((e) => e.end <= elapsed)
  const last = finished.at(-1)
  return Math.min(EPISODE_GAP_MS, last ? elapsed - last.end : carry + elapsed)
}

// Avanza el estado `dt` ms de juego activo (cruza tantas estaciones como haga falta). Devuelve el estado nuevo y el plan de su estación.
export function advanceSeason(state, dt, seed, plan = planSeason(state, seed)) {
  let current = state
  let currentPlan = plan
  let left = dt
  while (current.elapsed + left >= SEASON_MS) {
    left -= SEASON_MS - current.elapsed
    const carry = sinceLastEpisode(currentPlan, SEASON_MS, current.carry)
    const next = { season: (current.season + 1) % SEASONS.length, cycle: current.cycle + 1, elapsed: 0, carry }
    current = next
    currentPlan = planSeason(next, seed)
  }
  return { state: { ...current, elapsed: current.elapsed + left }, plan: currentPlan }
}

// Pesos de cada estación (suman 1) y opacidad de cada capa de dibujo (`layers`): la primavera es la base y verano, otoño y escarcha se apilan
// encima en ese orden, así que al fundir una estación con la anterior la anterior se mantiene debajo hasta que la nueva la cubre del todo.
function blendOf({ season, cycle, elapsed }) {
  const fade = cycle === 0 ? 1 : smooth(elapsed / SEASON_FADE_MS)
  const weights = [0, 0, 0, 0]
  weights[season] = fade
  if (fade < 1) weights[(season + SEASONS.length - 1) % SEASONS.length] = 1 - fade
  const layers = { summer: 0, autumn: 0, frost: 0 }
  if (season === 0) layers.frost = 1 - fade
  else if (season === 1) layers.summer = fade
  else if (season === 2) Object.assign(layers, { summer: fade < 1 ? 1 : 0, autumn: fade })
  else Object.assign(layers, { autumn: fade < 1 ? 1 : 0, frost: fade })
  return { fade, weights, layers }
}

// Arcoíris tras la lluvia: espera, sale, se queda y se desvanece (ms).
const RAINBOW = { delay: 4000, fade: 8000, stay: 30000 }

// Nubes de fondo de cada estación cuando no hay episodio.
const BASE_CLOUD = { spring: 0.25, summer: 0.12, autumn: 0.35, winter: 0.3 }

// Tiempo en un instante de la estación, a partir de sus episodios.
function weatherOf(plan, elapsed, seasonName) {
  const { cloudLead, cloudTrail, rampIn, rampOut } = WEATHER_SHAPE
  let rain = 0
  let snow = 0
  let cloud = BASE_CLOUD[seasonName]
  let wind = 0.25
  let cover = 0
  let rainbow = 0
  let episode = null
  plan.forEach((e) => {
    const duration = e.end - e.start
    const t = elapsed - e.start
    const intensity = smooth(t / rampIn) * (1 - smooth((t - duration + rampOut) / rampOut))
    const envelope = smooth((t + cloudLead) / cloudLead) * (1 - smooth((elapsed - e.end) / cloudTrail))
    if (e.kind === 'rain') rain = Math.max(rain, e.strength * intensity)
    else snow = Math.max(snow, e.strength * intensity)
    cloud = Math.max(cloud, lerp(BASE_CLOUD[seasonName], e.kind === 'snow' ? 0.85 : 0.9, envelope))
    wind = Math.max(wind, 0.25 + 0.35 * intensity)
    if (e.kind === 'snow' && t >= 0) cover = Math.max(cover, smooth(t / SNOW_COVER.settle) * (1 - smooth((elapsed - e.end - SNOW_COVER.hold) / SNOW_COVER.melt)))
    if (t >= 0 && elapsed < e.end) episode = { kind: e.kind, progress: t / duration }
    // Tras la lluvia, cuando el cielo ya se ha abierto, sale un arcoíris un rato (de día; el cielo lo apaga de noche).
    if (e.kind === 'rain') rainbow = Math.max(rainbow, smooth((elapsed - e.end - RAINBOW.delay) / RAINBOW.fade) * (1 - smooth((elapsed - e.end - RAINBOW.delay - RAINBOW.stay) / RAINBOW.fade)))
  })
  return { rain, snow, cloud, wind, cover, rainbow, episode }
}

// Todo lo que el resto del juego necesita saber del clima en este instante.
export function climateOf(state, plan) {
  const name = SEASONS[state.season]
  const { fade, weights, layers } = blendOf(state)
  const { rain, snow, cloud, wind, cover, rainbow, episode } = weatherOf(plan, state.elapsed, name)
  return {
    season: state.season,
    name,
    fade,
    weights,
    layers: { ...layers, snow: cover },
    rain,
    snow,
    cloud,
    wind,
    snowCover: cover,
    rainbow,
    episode,
  }
}
