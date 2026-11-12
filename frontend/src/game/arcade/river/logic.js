// Lógica de «Río en Peligro»: vuelo y disparos con desplazamiento vertical. Despegue desde la pista, un río de cinco tramos con
// orillas, islas, minas, barcos, helicópteros y cazas, depósitos de combustible que se recargan sobrevolándolos, puentes que hay
// que volar (y que dejan un punto de control), vidas, puntos y dificultad creciente, y aterrizaje al final. Función de paso
// pura sobre un estado que se muta, sin canvas ni teclado. Todo va en coordenadas del mundo (ver `level.js`).
import { burst, clamp, overlaps, updateFx } from '../shared.js'
import { KINDS, LANDING_RUNWAY, LAND_ZONE_START, LEVEL_END, PLANE_Y, SECTIONS, SECTION_LEN, W, boxOf, buildObjects, riverAt } from './level.js'

const PLANE_HALF = 6
const STEER = 110
const BASE_SPEED = 58
const MIN_FACTOR = 0.6
const MAX_FACTOR = 1.6
const FUEL_MAX = 100
const FUEL_DRAIN = 3.3
const FUEL_REFILL = 95
const LOW_FUEL = 28
const TAKEOFF_MS = 2300
const LANDING_MS = 1700
const LIVES = 3
const INVUL_MS = 2000
const BULLET_SPEED = 280
const BULLET_LIFE_MS = 720
const FIRE_COOLDOWN_MS = 260
const BANNER_MS = 2600
// Cuánto dura la llamarada de un objetivo destruido. Es un efecto del mundo y no toca el estado de la avioneta.
const BLAST_MS = 360
const EXTRA_LIFE_AT = [3000, 8000]
// Un tramo más difícil: todo va un poco más deprisa.
const sectionFactor = (wy) => 1 + 0.07 * Math.min(SECTIONS - 1, Math.floor(wy / SECTION_LEN))

export function createGame(seed = 5) {
  const state = {
    seed,
    time: 0,
    // 'ready' espera a que se pulse para despegar; 'takeoff', 'fly', 'landing' (con la pista a la vista) y 'landed'.
    phase: 'ready',
    phaseMs: 0,
    dist: 0,
    speed: 0,
    plane: { x: W / 2, lift: 0, bank: 0, invul: 0, cooldown: 0 },
    fuel: FUEL_MAX,
    lives: LIVES,
    score: 0,
    kills: 0,
    bridges: 0,
    extraGiven: 0,
    bullets: [],
    objects: buildObjects(seed),
    fx: [],
    blasts: [],
    banner: null,
    over: null,
    checkpoint: 0,
    lowWarned: false,
    refuelMs: 0,
    lowMs: 0,
    landMsg: false,
  }
  say(state, 'rTakeoff')
  return state
}

const say = (state, key, ms = BANNER_MS) => {
  state.banner = { key, ms }
}

function addScore(state, points, events) {
  state.score += points
  while (state.extraGiven < EXTRA_LIFE_AT.length && state.score >= EXTRA_LIFE_AT[state.extraGiven]) {
    state.extraGiven += 1
    state.lives += 1
    events.push({ type: 'extra' })
  }
}

// Caja de la avioneta en el mundo.
const planeBox = (state) => ({ x0: state.plane.x - PLANE_HALF, x1: state.plane.x + PLANE_HALF, y0: state.dist - PLANE_HALF, y1: state.dist + PLANE_HALF })

// ¿La avioneta toca una orilla? Se mira en tres alturas de su cuerpo.
export function touchesBank(state) {
  return [-PLANE_HALF, 0, PLANE_HALF].some((offset) => {
    const { left, right } = riverAt(state.seed, state.dist + offset)
    return state.plane.x - PLANE_HALF < left || state.plane.x + PLANE_HALF > right
  })
}

// Pérdida de una vida: explosión y, si quedan, vuelta al último punto de control con el depósito lleno.
function crash(state, events, reason) {
  if (state.plane.invul > 0 || state.over) return
  state.lives -= 1
  burst(state, state.plane.x, PLANE_Y, ['#f2b134', '#d4503a', '#f1e6cf', '#7fd0dc'], 20, 90)
  events.push({ type: 'crash' })
  if (state.lives <= 0) {
    state.over = 'lost'
    events.push({ type: 'lose' })
    return
  }
  respawn(state, reason)
}

function respawn(state, reason) {
  state.dist = state.checkpoint
  state.speed = BASE_SPEED
  state.fuel = FUEL_MAX
  state.plane.x = W / 2
  state.plane.invul = INVUL_MS
  state.plane.bank = 0
  state.bullets = []
  state.lowWarned = false
  state.phase = 'fly'
  state.landMsg = false
  state.blasts = []
  // Lo que había por delante del punto de control se reconstruye: se repite el tramo tal cual salió, con todo en su sitio. Lo que
  // queda detrás (el puente ya volado, por ejemplo) no vuelve a aparecer.
  state.objects = buildObjects(state.seed).filter((o) => o.wy > state.checkpoint)
  say(state, reason === 'fuel' ? 'rNoFuel' : 'rCrash')
}

function fire(state, input, dt, events) {
  const { plane } = state
  plane.cooldown = Math.max(0, plane.cooldown - dt)
  if ((input.action || input.hold) && plane.cooldown <= 0 && state.bullets.length < 3 && state.phase !== 'ready' && state.phase !== 'takeoff' && state.phase !== 'landed') {
    plane.cooldown = FIRE_COOLDOWN_MS
    state.bullets.push({ x: plane.x, wy: state.dist + 8, ms: BULLET_LIFE_MS })
    events.push({ type: 'shoot' })
  }
}

// Qué ocurre cuando la avioneta toca un objeto: el depósito de combustible reposta y no daña, las casitas de la orilla son
// decorado y todo lo demás (enemigos, islas, puentes) es un choque.
const planeEffect = (object) => (object.type === 'tank' ? 'refuel' : object.type === 'house' ? 'none' : 'crash')

// Destruye un objetivo: lo da por muerto de inmediato (así ninguna otra bala ni choque lo cuenta dos veces), suma sus puntos y
// deja una llamarada. No toca vidas, combustible, posición ni desplazamiento: eso solo lo cambian `crash` y `stepFuel`.
function destroy(state, object, events) {
  if (!object.alive) return
  object.alive = false
  state.kills += 1
  const bridge = object.type === 'bridge'
  state.blasts.push({ x: object.x, wy: object.wy, ms: BLAST_MS, big: bridge })
  burst(state, object.x, PLANE_Y - (object.wy - state.dist), ['#f2b134', '#d4503a', '#f1e6cf'], bridge ? 24 : 10, bridge ? 100 : 65)
  addScore(state, bridge ? 500 : KINDS[object.type].score, events)
  events.push({ type: bridge ? 'bridge' : object.type === 'tank' ? 'fuelBlast' : 'boom' })
}

function stepBullets(state, dt, events) {
  state.bullets.forEach((b) => {
    b.wy += (BULLET_SPEED * dt) / 1000
    b.ms -= dt
  })
  state.bullets = state.bullets.filter((b) => {
    if (b.ms <= 0) return false
    const box = { x0: b.x - 1.5, x1: b.x + 1.5, y0: b.wy - 4, y1: b.wy + 4 }
    const target = state.objects.find((o) => o.alive && o.type !== 'tank' && onScreen(state, o) && overlaps(box, boxOf(o)))
    const tank = !target && state.objects.find((o) => o.alive && o.type === 'tank' && overlaps(box, boxOf(o)))
    const hit = target ?? tank
    if (!hit) return true
    if (hit.type === 'island') {
      events.push({ type: 'block' })
      return false
    }
    if (hit.type === 'bridge') {
      hit.hp -= 1
      if (hit.hp <= 0) bridgeDown(state, hit, events)
      else events.push({ type: 'hit' })
      return false
    }
    destroy(state, hit, events)
    return false
  })
}

function bridgeDown(state, bridge, events) {
  destroy(state, bridge, events)
  state.bridges += 1
  state.checkpoint = bridge.wy + 40
  say(state, 'rBridge')
  events.push({ type: 'checkpoint', bridges: state.bridges })
}

const onScreen = (state, o) => o.wy - state.dist < PLANE_Y + 30 && o.wy - state.dist > -50

// Mueve a los enemigos que se ven y vigila que no se salgan del cauce.
function stepFoes(state, dt) {
  state.objects.forEach((o) => {
    if (!o.alive || !onScreen(state, o)) return
    if (o.type === 'ship' || o.type === 'heli') {
      const { left, right } = riverAt(state.seed, o.wy)
      const speed = o.vx * sectionFactor(o.wy)
      o.x += (speed * dt) / 1000
      if (o.x < left + KINDS[o.type].hw + 2) {
        o.x = left + KINDS[o.type].hw + 2
        o.vx = Math.abs(o.vx)
      } else if (o.x > right - KINDS[o.type].hw - 2) {
        o.x = right - KINDS[o.type].hw - 2
        o.vx = -Math.abs(o.vx)
      }
    } else if (o.type === 'jet') {
      // El caza cruza la pantalla de lado a lado a toda velocidad, de una orilla a la otra.
      if (!o.active) {
        o.active = true
        o.x = o.side > 0 ? -14 : W + 14
      }
      o.x += o.side * 120 * sectionFactor(o.wy) * (dt / 1000)
      if (o.x < -40 || o.x > W + 40) o.alive = false
    }
  })
}

function stepPlane(state, input, dt) {
  const { plane } = state
  plane.invul = Math.max(0, plane.invul - dt)
  const steer = state.phase === 'fly' || state.phase === 'landing' ? input.dx : 0
  plane.x = clamp(plane.x + (steer * STEER * dt) / 1000, PLANE_HALF + 1, W - PLANE_HALF - 1)
  plane.bank += (steer - plane.bank) * Math.min(1, dt / 90)
  // Subir o bajar el ritmo: arriba acelera y abajo frena, pero nunca se para. Al aterrizar solo se puede ir despacio.
  let factor = 1 + (-input.dy) * 0.6
  if (state.phase === 'landing') factor = MIN_FACTOR + 0.2
  factor = clamp(factor, MIN_FACTOR, MAX_FACTOR)
  const target = BASE_SPEED * factor * sectionFactor(state.dist)
  if (state.phase === 'takeoff') {
    const t = clamp(state.phaseMs / TAKEOFF_MS, 0, 1)
    state.speed = target * (0.15 + 0.85 * t * t)
    plane.lift = t
  } else if (state.phase === 'landed') {
    state.speed = Math.max(0, state.speed - (BASE_SPEED * dt) / 900)
    plane.lift = Math.max(0, 1 - state.phaseMs / LANDING_MS)
  } else if (state.phase === 'ready') state.speed = 0
  else state.speed += (target - state.speed) * Math.min(1, dt / 220)
  state.dist += (state.speed * dt) / 1000
}

function stepFuel(state, dt, events) {
  if (state.phase !== 'fly' && state.phase !== 'landing') return
  state.fuel = Math.max(0, state.fuel - (FUEL_DRAIN * dt) / 1000)
  const box = planeBox(state)
  const over = state.objects.some((o) => o.alive && planeEffect(o) === 'refuel' && overlaps(box, boxOf(o)))
  if (over) {
    state.fuel = Math.min(FUEL_MAX, state.fuel + (FUEL_REFILL * dt) / 1000)
    // Suena al tocar el depósito y, si se queda encima, cada poco.
    if (state.refuelMs <= 0 || state.refuelMs >= 380) {
      state.refuelMs = 0
      events.push({ type: 'fuel' })
    }
    state.refuelMs += dt
  } else state.refuelMs = 0
  if (state.fuel < LOW_FUEL) {
    state.lowMs += dt
    if (!state.lowWarned) {
      state.lowWarned = true
      say(state, 'rFuelLow')
    }
    if (state.lowMs >= 900) {
      state.lowMs = 0
      events.push({ type: 'lowFuel' })
    }
  } else if (state.fuel > LOW_FUEL + 12) state.lowWarned = false
  if (state.fuel <= 0) crash(state, events, 'fuel')
}

function stepCollisions(state, events) {
  if (state.phase !== 'fly' && state.phase !== 'landing') return
  // Con la invulnerabilidad del despegue y del reaparecer la avioneta atraviesa todo, para que un choque no encadene otro.
  if (state.plane.invul > 0) return
  const box = planeBox(state)
  for (const o of state.objects) {
    if (!o.alive || !onScreen(state, o) || planeEffect(o) !== 'crash') continue
    if (overlaps(box, boxOf(o))) {
      if (o.type !== 'island' && o.type !== 'bridge') destroy(state, o, events)
      crash(state, events, 'crash')
      return
    }
  }
  if (touchesBank(state)) crash(state, events, 'crash')
}

// Cuando se acerca la zona de la pista se avisa; al llegar a ella con la nave alineada se aterriza.
function stepLanding(state, events) {
  if (state.phase === 'fly' && state.dist >= LAND_ZONE_START && state.bridges >= SECTIONS) {
    state.phase = 'landing'
    say(state, 'rLanding')
  }
  if (state.phase !== 'landing') return
  const strip = LANDING_RUNWAY
  if (state.dist >= strip.y0 + 50) {
    if (Math.abs(state.plane.x - strip.x) <= strip.half - 3) {
      state.phase = 'landed'
      state.phaseMs = 0
      say(state, 'rLanded')
      events.push({ type: 'land' })
    } else {
      // Se pasó de la pista: se vuelve a intentar desde el último punto de control.
      crash(state, events, 'crash')
    }
  }
}

// Avanza el juego `dt` milisegundos. `input` es `{ dx, dy, action, hold }`: dirección (-1 a 1), el disparo recién pulsado (que
// también despega al empezar) y el disparo mantenido. Devuelve los sucesos de este paso.
export function step(state, input, dt) {
  const events = []
  state.time += dt
  updateFx(state, dt)
  state.fx.forEach((p) => {
    // Las partículas nacen en la altura de la avioneta o del objetivo; se corrigen con el avance del mundo.
    p.y += (state.speed * dt) / 1000
  })
  state.blasts.forEach((b) => {
    b.ms -= dt
  })
  state.blasts = state.blasts.filter((b) => b.ms > 0)
  if (state.banner) {
    state.banner.ms -= dt
    if (state.banner.ms <= 0) state.banner = null
  }
  if (state.over) return events
  if (state.phase === 'ready') {
    if (input.action || input.hold) {
      state.phase = 'takeoff'
      state.phaseMs = 0
      events.push({ type: 'takeoff' })
      say(state, 'rTakeoff', 600)
      state.banner = null
    }
    return events
  }
  state.phaseMs += dt
  stepPlane(state, input, dt)
  if (state.phase === 'takeoff' && state.phaseMs >= TAKEOFF_MS) {
    state.phase = 'fly'
    state.phaseMs = 0
    state.plane.lift = 1
    state.plane.invul = 600
  }
  if (state.phase === 'landed') {
    if (state.phaseMs >= LANDING_MS) {
      state.over = 'won'
      events.push({ type: 'win' })
    }
    return events
  }
  fire(state, input, dt, events)
  stepBullets(state, dt, events)
  stepFoes(state, dt)
  stepFuel(state, dt, events)
  stepCollisions(state, events)
  stepLanding(state, events)
  // Tras el último puente sin pista a la vista nada más que volar; si se pasa de largo el final, se da por perdido el intento.
  if (!state.over && state.dist > LEVEL_END) crash(state, events, 'crash')
  return events
}

export function view(state) {
  return {
    status: state.over ?? 'playing',
    message: state.banner?.key ?? null,
    bubble: null,
    hint: null,
    hud: [
      { key: 'score', value: state.score },
      { key: 'lives', value: state.lives },
      { key: 'fuel', value: `${Math.round(state.fuel)}%` },
    ],
  }
}

export function result(state) {
  return {
    score: state.score,
    won: state.over === 'won',
    stats: [
      { key: 'bridges', value: `${state.bridges}/${SECTIONS}` },
      { key: 'foes', value: state.kills },
      { key: 'fuel', value: `${Math.round(state.fuel)}%` },
      { key: 'time', value: Math.round(state.time / 1000) },
    ],
    reward: null,
  }
}

