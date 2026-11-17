// La fauna ambiental de cada estación, sin Phaser: patos en el río (primavera), libélulas junto a la piscina y luciérnagas al anochecer en la ribera
// (verano), una ardilla cerca de los institutos (otoño) y un petirrojo en la plaza (invierno). Son adornos que se pintan, no personajes: no tienen
// cuerpo físico, no se ponen sobre caminos, puertas ni puentes, y se van o se esconden si la viajera se acerca. Aparecen de vez en cuando, no siempre.
// Los pájaros y las mariposas de siempre siguen en `ambient.js`; esto es lo que se suma. Qué hay en cada estación sale del cielo (`sky.spring`...).
import { BRIDGES, TILE } from './world.js'
import { riverAt, signedDistance } from './river.js'
import { fishSpots } from './riverPlaces.js'

const between = (range, rng) => range[0] + rng() * (range[1] - range[0])
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smooth = (v) => {
  const t = clamp01(v)
  return t * t * (3 - 2 * t)
}

// Cuánto pesa cada estación en el cielo (la primavera es lo que no es ninguna de las otras).
export const weightOf = (sky, season) => {
  if (!sky) return 0
  if (season === 'spring') return clamp01(1 - (sky.summer ?? 0) - (sky.autumn ?? 0) - (sky.winter ?? 0))
  return sky[season] ?? 0
}

const isDay = (sky) => sky.dark < 0.5 && sky.rain < 0.2 && (sky.snow ?? 0) < 0.1

// Qué se ve en cada momento, de 0 a 1: la estación que toca, a su hora y con el tiempo que le va.
export const FAUNA_LEVELS = {
  ducks: (sky) => (sky && (sky.snow ?? 0) < 0.1 ? weightOf(sky, 'spring') : 0),
  dragonflies: (sky) => (sky && isDay(sky) ? weightOf(sky, 'summer') : 0),
  fireflies: (sky) => (sky && sky.rain < 0.2 ? weightOf(sky, 'summer') * smooth((sky.dark - 0.3) / 0.4) : 0),
  squirrel: (sky) => (sky && isDay(sky) ? weightOf(sky, 'autumn') : 0),
  robin: (sky) => (sky && isDay(sky) && (sky.snowCover ?? 0) < 0.9 ? weightOf(sky, 'winter') : 0),
}

// Presencia: cada criatura aparece de vez en cuando. Se funde al entrar y al irse, y solo puede aparecer mientras `wanted` sea verdadero.
// `cfg`: `away` (cuánto falta entre una aparición y la siguiente, ms), `stay` (cuánto se queda) y `fade`.
export function createPresence(rng, cfg) {
  return { here: false, alpha: 0, timer: between(cfg.firstAway ?? cfg.away, rng) }
}

export function stepPresence(presence, dt, wanted, rng, cfg) {
  presence.timer -= dt
  if (presence.here && (!wanted || presence.timer <= 0)) {
    presence.here = false
    presence.timer = between(cfg.away, rng)
  } else if (!presence.here && wanted && presence.timer <= 0) {
    presence.here = true
    presence.timer = between(cfg.stay, rng)
  }
  const target = presence.here ? 1 : 0
  presence.alpha += Math.sign(target - presence.alpha) * Math.min(Math.abs(target - presence.alpha), dt / cfg.fade)
  return presence.alpha > 0
}

// ---- Patos ----------------------------------------------------------------------------------------------------------------------------
export const DUCKS = {
  count: 2,
  speed: [7, 12],
  rest: [2500, 7000],
  // Cuánto se alejan de su sitio, qué distancia dejan a la orilla y a los puentes, y a los puntos donde se echa la caña.
  roam: 80,
  bank: 12,
  bridgeGap: 24,
  rodGap: 36,
  presence: { firstAway: [3000, 12000], away: [30000, 90000], stay: [60000, 130000], fade: 1800 },
}

// Dónde vive cada pato: la corriente de dos tramos del río, lejos de los puentes y a distinto trecho del agua.
export function duckHomes() {
  return [0.37, 0.58].map((u) => {
    const at = riverAt(u)
    return { x: at.x, y: at.y }
  })
}

const nearBridge = (x, y, gap) => BRIDGES.some((b) => x > b.x * TILE - gap && x < (b.x + b.w) * TILE + gap && y > b.y * TILE - gap && y < (b.y + b.h) * TILE + gap)

// ¿Puede un pato estar aquí? Agua abierta, sin pasar bajo un puente ni sobre el sitio de pesca.
export function duckSpotOk(x, y, spots = fishSpots()) {
  return signedDistance(x, y) > DUCKS.bank && !nearBridge(x, y, DUCKS.bridgeGap) && spots.every((spot) => Math.hypot(spot.water.x - x, spot.water.y - y) > DUCKS.rodGap)
}

export function createDuck(home, rng, index) {
  return { home, x: home.x, y: home.y, target: { ...home }, speed: DUCKS.speed[0], rest: 0, face: 'right', t: rng() * 1000, presence: createPresence(rng, DUCKS.presence), index }
}

function pickDuckTarget(duck, rng, spots) {
  for (let tries = 0; tries < 14; tries++) {
    const angle = rng() * Math.PI * 2
    const reach = 14 + rng() * 40
    const x = duck.x + Math.cos(angle) * reach
    const y = duck.y + Math.sin(angle) * reach
    if (distance({ x, y }, duck.home) <= DUCKS.roam && duckSpotOk(x, y, spots)) return { x, y }
  }
  return null
}

export function stepDuck(duck, dt, level, rng, spots = fishSpots()) {
  duck.t += dt
  const visible = stepPresence(duck.presence, dt, level > 0.5, rng, DUCKS.presence)
  if (!visible) return
  if (duck.rest > 0) {
    duck.rest -= dt
    return
  }
  const dx = duck.target.x - duck.x
  const dy = duck.target.y - duck.y
  const left = Math.hypot(dx, dy)
  if (left < 1.5) {
    duck.rest = between(DUCKS.rest, rng)
    duck.speed = between(DUCKS.speed, rng)
    duck.target = pickDuckTarget(duck, rng, spots) ?? { ...duck.home }
    return
  }
  const step = Math.min(left, (duck.speed * dt) / 1000)
  duck.x += (dx / left) * step
  duck.y += (dy / left) * step
  if (Math.abs(dx) > 0.5) duck.face = dx < 0 ? 'left' : 'right'
}

// ---- Libélulas ------------------------------------------------------------------------------------------------------------------------
export const DRAGONFLIES = {
  count: 3,
  // Lo que se alejan del centro del agua (la mitad del vaso) y a qué altura vuelan.
  area: { x: 46, y: 24 },
  height: [8, 15],
  dart: 78,
  hover: [500, 2200],
  presence: { firstAway: [1000, 6000], away: [20000, 60000], stay: [50000, 110000], fade: 1500 },
}

export function createDragonfly(center, rng, index) {
  return { center, x: center.x + (rng() - 0.5) * 30, y: center.y + (rng() - 0.5) * 16, z: between(DRAGONFLIES.height, rng), target: { x: center.x, y: center.y }, hover: rng() * 1000, face: 'right', flap: rng() * 100, index, presence: createPresence(rng, DRAGONFLIES.presence) }
}

export function stepDragonfly(fly, dt, level, rng) {
  fly.flap += dt
  const visible = stepPresence(fly.presence, dt, level > 0.5, rng, DRAGONFLIES.presence)
  if (!visible) return
  if (fly.hover > 0) {
    fly.hover -= dt
    // Suspendida en el aire, con un temblor suave.
    fly.z += Math.sin(fly.flap / 90) * 0.04
    if (fly.hover <= 0) {
      fly.target = { x: fly.center.x + (rng() * 2 - 1) * DRAGONFLIES.area.x, y: fly.center.y + (rng() * 2 - 1) * DRAGONFLIES.area.y }
      fly.height = between(DRAGONFLIES.height, rng)
    }
    return
  }
  const dx = fly.target.x - fly.x
  const dy = fly.target.y - fly.y
  const left = Math.hypot(dx, dy)
  if (left < 2) {
    fly.hover = between(DRAGONFLIES.hover, rng)
    return
  }
  const step = Math.min(left, (DRAGONFLIES.dart * dt) / 1000)
  fly.x += (dx / left) * step
  fly.y += (dy / left) * step
  fly.z += ((fly.height ?? fly.z) - fly.z) * Math.min(1, dt / 220)
  if (Math.abs(dx) > 0.5) fly.face = dx < 0 ? 'left' : 'right'
}

// ---- Luciérnagas ----------------------------------------------------------------------------------------------------------------------
export const FIREFLIES = { clusters: [0.2, 0.34, 0.5, 0.66], perCluster: 4, bank: 20, spread: 16 }

// Puntos de la ribera donde se juntan, sobre una u otra orilla.
export function fireflyHomes() {
  return FIREFLIES.clusters.map((u, i) => {
    const at = riverAt(u)
    const side = i % 2 ? 1 : -1
    return { x: at.x + side * at.nx * (at.half + FIREFLIES.bank), y: at.y + side * at.ny * (at.half + FIREFLIES.bank) }
  })
}

export function createFireflies(homes) {
  return homes.flatMap((home, h) =>
    Array.from({ length: FIREFLIES.perCluster }, (_, i) => {
      const k = h * 11 + i * 3.7
      return { home, k, a: 0.31 + (k % 0.4), b: 0.23 + (k % 0.33), blink: 0.9 + (k % 0.7), radius: 6 + ((k * 3) % FIREFLIES.spread) }
    }),
  )
}

// Dónde está una luciérnaga en el instante `ms` y cuánto brilla (se enciende y se apaga sola).
export function fireflyAt(fly, ms) {
  const t = ms / 1000 + fly.k
  const glow = Math.max(0, Math.sin(t * fly.blink * 2)) ** 2
  return {
    x: fly.home.x + Math.sin(t * fly.a) * fly.radius + Math.sin(t * 1.7) * 3,
    y: fly.home.y + Math.cos(t * fly.b + fly.k) * fly.radius * 0.6,
    z: 6 + Math.sin(t * 0.8 + fly.k) * 4,
    glow,
  }
}

// ---- Ardilla --------------------------------------------------------------------------------------------------------------------------
export const SQUIRREL = {
  // Franjas de césped junto a los institutos (a los lados de IES Gran Capitán y de Alan Turing): el borde por el que entra y por el que se va.
  zones: [
    { x0: 6.2 * TILE, x1: 10.6 * TILE, y0: 14 * TILE, y1: 17 * TILE },
    { x0: 33.6 * TILE, x1: 37.6 * TILE, y0: 14 * TILE, y1: 17 * TILE },
  ],
  walk: 42,
  flee: 95,
  sit: [3500, 7000],
  // Solo sale si la viajera está a esta distancia de la franja: de lejos nadie la ve.
  seen: 380,
  scare: 38,
  presence: { firstAway: [8000, 25000], away: [40000, 100000] },
}

export function createSquirrel(rng) {
  return { state: 'away', x: 0, y: 0, face: 'right', timer: between(SQUIRREL.presence.firstAway, rng), t: 0, alpha: 0, zone: null, goal: null, exit: null }
}

const centerOf = (zone) => ({ x: (zone.x0 + zone.x1) / 2, y: (zone.y0 + zone.y1) / 2 })

function startRun(sq, traveller, rng) {
  const near = SQUIRREL.zones.filter((zone) => distance(centerOf(zone), traveller) <= SQUIRREL.seen)
  if (!near.length) return false
  const zone = near[Math.floor(rng() * near.length)]
  const fromLeft = rng() < 0.5
  const y = between([zone.y0, zone.y1], rng)
  Object.assign(sq, {
    state: 'in',
    zone,
    x: fromLeft ? zone.x0 : zone.x1,
    y,
    goal: { x: between([zone.x0 + (zone.x1 - zone.x0) * 0.3, zone.x0 + (zone.x1 - zone.x0) * 0.7], rng), y: between([zone.y0, zone.y1], rng) },
    exit: { x: fromLeft ? zone.x1 : zone.x0, y: between([zone.y0, zone.y1], rng) },
    face: fromLeft ? 'right' : 'left',
    alpha: 0,
  })
  return true
}

// Avanza `dt` ms. `level` es lo que toca de otoño y de día; `traveller` son los pies de la viajera.
export function stepSquirrel(sq, dt, level, traveller, rng) {
  sq.t += dt
  if (sq.state === 'away') {
    sq.alpha = 0
    sq.timer -= dt
    if (sq.timer <= 0) {
      if (level > 0.5 && startRun(sq, traveller, rng)) return
      sq.timer = 4000
    }
    return
  }
  // Si algo la asusta (la viajera cerca, el otoño que se acaba) sale corriendo hacia el borde.
  const scared = distance(sq, traveller) < SQUIRREL.scare || level <= 0.5
  if (scared && sq.state !== 'out') Object.assign(sq, { state: 'out', timer: 0 })
  const aim = sq.state === 'in' ? sq.goal : sq.exit
  const dx = aim.x - sq.x
  const dy = aim.y - sq.y
  const left = Math.hypot(dx, dy)
  if (sq.state === 'sit') {
    sq.timer -= dt
    if (sq.timer <= 0) sq.state = 'out'
    return
  }
  const speed = sq.state === 'out' && scared ? SQUIRREL.flee : SQUIRREL.walk
  if (left < 2) {
    if (sq.state === 'in') Object.assign(sq, { state: 'sit', timer: between(SQUIRREL.sit, rng) })
    else Object.assign(sq, { state: 'away', timer: between(SQUIRREL.presence.away, rng), alpha: 0 })
    return
  }
  const step = Math.min(left, (speed * dt) / 1000)
  sq.x += (dx / left) * step
  sq.y += (dy / left) * step
  if (Math.abs(dx) > 0.5) sq.face = dx < 0 ? 'left' : 'right'
  // Entra y sale fundiéndose con la hierba.
  sq.alpha = Math.min(1, sq.alpha + dt / 350)
  if (sq.state === 'out' && left < 22) sq.alpha = Math.min(sq.alpha, left / 22)
}

// ---- Petirrojo ------------------------------------------------------------------------------------------------------------------------
export const ROBIN = {
  // Cuánto se queda en cada percha, cuánto dura el vuelo entre dos y a qué distancia de la viajera se va.
  stay: [5000, 13000],
  flight: 1100,
  arc: 13,
  scare: 46,
  hop: [1800, 3600],
  presence: { firstAway: [4000, 14000], away: [25000, 70000], stay: [70000, 150000], fade: 900 },
}

// Perchas: el respaldo de los bancos y el remate de las farolas alrededor de la plaza (`props` son los objetos del mapa).
export function robinPerches(props) {
  const near = (p) => p.at[0] > 36 && p.at[0] < 54 && p.at[1] > 32 && p.at[1] < 48
  const benches = props.filter((p) => p.kind === 'bench' && near(p)).map((p) => ({ x: p.at[0] * TILE + (p.at[0] % 1 ? 6 : -6), y: p.at[1] * TILE - 15, depth: p.at[1] * TILE + 1 }))
  const lamps = props.filter((p) => p.kind === 'lamp' && near(p)).map((p) => ({ x: p.at[0] * TILE, y: p.at[1] * TILE - 34, depth: p.at[1] * TILE + 1 }))
  return [...benches, ...lamps]
}

export function createRobin(perches, rng) {
  const perch = perches[Math.floor(rng() * perches.length)]
  return { perch, from: perch, to: perch, x: perch.x, y: perch.y, z: 0, state: 'perch', timer: between(ROBIN.stay, rng), hopT: between(ROBIN.hop, rng), hop: 0, face: 'right', t: 0, flightT: 0, presence: createPresence(rng, ROBIN.presence) }
}

// Elige otra percha, lejos de la viajera y distinta de la actual.
function nextPerch(robin, perches, traveller, rng) {
  const options = perches.filter((p) => p !== robin.perch && distance(p, traveller) > ROBIN.scare * 1.4)
  return options.length ? options[Math.floor(rng() * options.length)] : null
}

export function stepRobin(robin, dt, level, perches, traveller, rng) {
  robin.t += dt
  const visible = stepPresence(robin.presence, dt, level > 0.5, rng, ROBIN.presence)
  if (!visible) return
  if (robin.state === 'fly') {
    robin.flightT += dt
    const k = Math.min(1, robin.flightT / ROBIN.flight)
    robin.x = robin.from.x + (robin.to.x - robin.from.x) * k
    robin.y = robin.from.y + (robin.to.y - robin.from.y) * k
    robin.z = Math.sin(k * Math.PI) * ROBIN.arc
    if (k >= 1) Object.assign(robin, { state: 'perch', perch: robin.to, z: 0, timer: between(ROBIN.stay, rng), hopT: between(ROBIN.hop, rng) })
    return
  }
  robin.hopT -= dt
  robin.hop = robin.hopT < 0 && robin.hopT > -160 ? 1 : 0
  if (robin.hopT <= -160) robin.hopT = between(ROBIN.hop, rng)
  robin.timer -= dt
  const scared = distance(robin.perch, traveller) < ROBIN.scare
  if (robin.timer <= 0 || scared) {
    const to = nextPerch(robin, perches, traveller, rng)
    if (to) Object.assign(robin, { state: 'fly', from: robin.perch, to, flightT: 0, face: to.x < robin.perch.x ? 'left' : 'right' })
    else robin.timer = 1500
  }
}

