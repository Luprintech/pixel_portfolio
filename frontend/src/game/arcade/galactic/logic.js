// Lógica de «Invasión Galáctica»: un shooter espacial a la manera de los clásicos de Atari. La nave se mueve en horizontal por abajo
// y dispara hacia arriba; cinco oleadas de bichos del código con formaciones distintas (filas, ola, picado, anillo y mezcla) y un
// Nodo Maestro final con tres fases. Puntos, vidas, vida extra y dificultad creciente. Función de paso pura sobre un estado que
// se muta, sin canvas ni teclado, así se prueba entera. Coordenadas en píxeles del lienzo de 240×192.
import { FRAME, boxAt, burst, clamp, overlaps, random, updateFx } from '../shared.js'

export const { width: W, height: H } = FRAME
export const SHIP_Y = 170
const SHIP_HALF = 6
const SHIP_SPEED = 118
const BULLET_SPEED = 200
const FIRE_COOLDOWN_MS = 230
const INVUL_MS = 2200
const LIVES = 3
const BANNER_MS = 2200
const CLEAR_PAUSE_MS = 1500
// Puntos que dan una vida más.
const EXTRA_LIFE_AT = [2500, 6000, 11000]

// Cuánto vale cada enemigo: puntos, vida y medio lado de su caja.
export const FOES = {
  bug: { score: 10, hp: 1, half: 6 },
  loop: { score: 20, hp: 1, half: 6 },
  moth: { score: 30, hp: 1, half: 6 },
  orb: { score: 40, hp: 2, half: 6 },
}
export const BOSS = { hp: 44, half: 22, score: 1500 }
// Vida del Nodo Maestro en la que empieza cada fase.
export const BOSS_PHASES = [44, 28, 14]

// Las oleadas, por orden. `kind` decide la formación y cómo se mueve; `speed` es la velocidad base (px/s) y `fire` los disparos
// por segundo y por enemigo en el instante más tranquilo.
export const WAVES = [
  { name: 'gWave1', kind: 'rows', rows: 3, cols: 7, types: ['orb', 'loop', 'bug'], speed: 20, fire: 0.05, dive: 0 },
  { name: 'gWave2', kind: 'stream', count: 14, types: ['loop'], speed: 46, fire: 0.08 },
  { name: 'gWave3', kind: 'swoop', count: 10, types: ['moth'], speed: 90, fire: 0.05 },
  { name: 'gWave4', kind: 'ring', count: 12, types: ['orb'], speed: 14, fire: 0.1 },
  { name: 'gWave5', kind: 'rows', rows: 3, cols: 6, types: ['moth', 'loop', 'bug'], speed: 26, fire: 0.08, dive: 2.4 },
]
export const BOSS_WAVE = WAVES.length + 1

const TAU = Math.PI * 2

export function createGame(seed = 11) {
  const state = {
    seed,
    time: 0,
    wave: 0,
    ship: { x: W / 2, cooldown: 0, invul: 0, moving: 0 },
    bullets: [],
    foes: [],
    shots: [],
    fx: [],
    stars: Array.from({ length: 48 }, (_, i) => ({ x: (i * 53) % W, y: (i * 37) % H, speed: 8 + (i % 3) * 14, size: i % 5 === 0 ? 2 : 1 })),
    score: 0,
    lives: LIVES,
    kills: 0,
    shotsFired: 0,
    extraGiven: 0,
    banner: null,
    clearTimer: 0,
    over: null,
    boss: null,
    form: null,
    nextDive: 0,
    nextId: 0,
    invaded: false,
  }
  startWave(state, 1)
  return state
}

const speedFactor = (wave) => 1 + 0.1 * (Math.min(wave, WAVES.length) - 1)
const say = (state, key) => {
  state.banner = { key, ms: BANNER_MS }
}

const foe = (state, type, x, y, extra = {}) => ({ id: (state.nextId += 1), type, x, y, hp: FOES[type].hp, t: 0, ...extra })

// Coloca los enemigos de una oleada con su formación.
function startWave(state, wave, events = []) {
  state.wave = wave
  state.shots = []
  state.bullets = []
  state.foes = []
  state.boss = null
  state.form = null
  state.clearTimer = 0
  if (wave === BOSS_WAVE) {
    startBoss(state)
    events.push({ type: 'wave', boss: true, wave })
    say(state, 'gBoss')
    return
  }
  const spec = WAVES[wave - 1]
  say(state, spec.name)
  events.push({ type: 'wave', wave })
  if (spec.kind === 'rows') {
    state.form = { x: 0, y: 0, dir: 1, total: spec.rows * spec.cols }
    for (let r = 0; r < spec.rows; r++) {
      for (let c = 0; c < spec.cols; c++) state.foes.push(foe(state, spec.types[r % spec.types.length], 0, 0, { col: c, row: r, home: true }))
    }
    layoutRows(state, spec)
    state.nextDive = 2600
  } else if (spec.kind === 'stream') {
    for (let i = 0; i < spec.count; i++) {
      const band = i % 4
      state.foes.push(foe(state, spec.types[0], -12 - i * 18, 34 + band * 14, { band, side: 1, phase: i * 0.8, base: 34 + band * 14, laps: 0 }))
    }
  } else if (spec.kind === 'swoop') {
    for (let i = 0; i < spec.count; i++) {
      state.foes.push(foe(state, spec.types[0], 0, 0, { col: i % 5, row: Math.floor(i / 5), home: true, dive: null }))
    }
    layoutSwoop(state, 0)
    state.nextDive = 1400
  } else if (spec.kind === 'ring') {
    for (let i = 0; i < spec.count; i++) state.foes.push(foe(state, spec.types[0], 0, 0, { slot: i, free: false, out: false }))
    state.form = { cx: W / 2, cy: -24, angle: 0, broken: false }
    layoutRing(state, 0)
  }
}

// Posición de cada enemigo de una formación en filas: una rejilla que se mueve a la vez.
function layoutRows(state, spec) {
  const gap = 24
  const left = (W - (spec.cols - 1) * gap) / 2
  state.foes.forEach((f) => {
    if (!f.home) return
    f.x = left + f.col * gap + state.form.x
    f.y = 26 + f.row * 18 + state.form.y
  })
}

function layoutSwoop(state, time) {
  state.foes.forEach((f) => {
    if (!f.home) return
    f.x = W / 2 - 52 + f.col * 26 + Math.sin(time / 700 + f.row) * 10
    f.y = 28 + f.row * 20
  })
}

function layoutRing(state, dt) {
  const { form } = state
  form.angle += (dt / 1000) * 0.9
  const radius = 38
  state.foes.filter((f) => !f.free && !f.out).forEach((f) => {
    const a = form.angle + (f.slot / WAVES[3].count) * TAU
    f.x = form.cx + Math.cos(a) * radius * 1.35
    f.y = form.cy + Math.sin(a) * radius * 0.7
  })
}

function startBoss(state) {
  state.boss = { x: W / 2, y: 40, hp: BOSS.hp, phase: 0, t: 0, fire: 900, fan: 1600, summon: 4500, shield: 0, shieldCooldown: 5200, hurt: 0, entering: 1 }
}

function fireAt(state, x, y, angle, speed) {
  state.shots.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed })
}

const shotSpeed = (state) => 62 + 8 * Math.min(state.wave, 6)

function scoreFor(state, points, events) {
  state.score += points
  while (state.extraGiven < EXTRA_LIFE_AT.length && state.score >= EXTRA_LIFE_AT[state.extraGiven]) {
    state.extraGiven += 1
    state.lives += 1
    say(state, 'gExtra')
    events.push({ type: 'extra' })
  }
}

function killFoe(state, f, events) {
  const spec = FOES[f.type]
  state.kills += 1
  burst(state, f.x, f.y, f.type === 'orb' ? ['#7a3f8f', '#f4b8cc', '#f1e6cf'] : ['#a3c14f', '#f8d77a', '#f1e6cf'], 9, 60)
  scoreFor(state, spec.score, events)
  events.push({ type: 'boom' })
}

// El jugador pierde una vida: explosión, invulnerabilidad al volver y, sin vidas, fin de la partida.
function hurtShip(state, events) {
  const { ship } = state
  if (ship.invul > 0 || state.over) return
  state.lives -= 1
  burst(state, ship.x, SHIP_Y, ['#f2b134', '#d4503a', '#f1e6cf', '#7fd0dc'], 18, 90)
  state.shots = []
  events.push({ type: 'hurt' })
  if (state.lives <= 0) {
    state.over = 'lost'
    events.push({ type: 'lose' })
    return
  }
  ship.invul = INVUL_MS
  ship.x = W / 2
}

function updateStars(state, dt) {
  state.stars.forEach((s) => {
    s.y += (s.speed * dt) / 1000
    if (s.y >= H) {
      s.y -= H
      s.x = (s.x * 7 + 31) % W
    }
  })
}

function stepShip(state, input, dt, events) {
  const { ship } = state
  ship.invul = Math.max(0, ship.invul - dt)
  ship.cooldown = Math.max(0, ship.cooldown - dt)
  ship.moving = input.dx
  ship.x = clamp(ship.x + input.dx * (SHIP_SPEED * dt) / 1000, SHIP_HALF + 2, W - SHIP_HALF - 2)
  const maxBullets = state.wave >= 4 ? 3 : 2
  if ((input.action || input.hold) && ship.cooldown <= 0 && state.bullets.length < maxBullets) {
    ship.cooldown = FIRE_COOLDOWN_MS
    state.bullets.push({ x: ship.x, y: SHIP_Y - 8 })
    state.shotsFired += 1
    events.push({ type: 'shoot' })
  }
}

function stepBullets(state, dt, events) {
  state.bullets.forEach((b) => {
    b.y -= (BULLET_SPEED * dt) / 1000
  })
  state.bullets = state.bullets.filter((b) => {
    if (b.y < -4) return false
    const box = boxAt(b.x, b.y, 1.5, 4)
    const target = state.foes.find((f) => f.hp > 0 && !f.out && overlaps(box, boxAt(f.x, f.y, FOES[f.type].half)))
    if (target) {
      target.hp -= 1
      if (target.hp <= 0) killFoe(state, target, events)
      else events.push({ type: 'hit' })
      target.hit = 120
      return false
    }
    const { boss } = state
    if (boss && !boss.entering && overlaps(box, boxAt(boss.x, boss.y, BOSS.half, BOSS.half * 0.55))) {
      if (boss.shield > 0) events.push({ type: 'block' })
      else {
        boss.hp -= 1
        boss.hurt = 120
        scoreFor(state, 10, events)
        events.push({ type: 'hit' })
        bossPhase(state, boss, events)
      }
      return false
    }
    return true
  })
  state.foes = state.foes.filter((f) => f.hp > 0)
}

function bossPhase(state, boss, events) {
  const phase = BOSS_PHASES.filter((start) => boss.hp <= start).length - 1
  if (phase > boss.phase) {
    boss.phase = phase
    say(state, 'gBossRage')
    events.push({ type: 'phase' })
  }
  if (boss.hp <= 0) {
    burst(state, boss.x, boss.y, ['#d4503a', '#f2b134', '#f1e6cf', '#7fd0dc'], 40, 130)
    scoreFor(state, BOSS.score, events)
    state.boss = null
    state.shots = []
    state.foes.forEach((f) => killFoe(state, f, events))
    state.foes = []
    state.over = 'won'
    events.push({ type: 'bigBoom' }, { type: 'win' })
  }
}

function stepFoes(state, dt) {
  const spec = WAVES[state.wave - 1]
  if (!spec) return
  const factor = speedFactor(state.wave)
  const speed = spec.speed * factor
  state.foes.forEach((f) => {
    f.t += dt
    if (f.hit > 0) f.hit -= dt
  })
  if (spec.kind === 'rows') stepRows(state, spec, speed, dt)
  else if (spec.kind === 'stream') stepStream(state, speed, dt)
  else if (spec.kind === 'swoop') stepSwoop(state, speed, dt)
  else stepRing(state, dt)
  // Disparos de los enemigos: cuanto más avanza el juego, más a menudo.
  const rate = spec.fire * (1 + 0.15 * state.wave)
  state.foes.forEach((f) => {
    if (f.out || f.y < 14 || f.y > SHIP_Y - 40 || f.x < 8 || f.x > W - 8) return
    if (random(state) < (rate * dt) / 1000) fireAt(state, f.x, f.y + 6, Math.PI / 2 + (random(state) - 0.5) * 0.35, shotSpeed(state))
  })
}

function stepRows(state, spec, speed, dt) {
  const { form } = state
  const alive = state.foes.length
  // Como en los clásicos: cuantos menos quedan, más deprisa van.
  const boost = 1 + (1 - alive / form.total) * 1.4
  form.x += form.dir * speed * boost * (dt / 1000)
  layoutRows(state, spec)
  const homes = state.foes.filter((f) => f.home)
  const edge = homes.some((f) => (form.dir > 0 ? f.x > W - 14 : f.x < 14))
  if (edge) {
    form.dir *= -1
    form.y += 7
    layoutRows(state, spec)
  }
  // Los que se lanzan en picado salen de la formación y siguen su curva.
  if (spec.dive) {
    state.nextDive -= dt
    if (state.nextDive <= 0) {
      state.nextDive = (spec.dive * 1000) / factorOf(state)
      const candidates = homes.filter((f) => !f.dive)
      if (candidates.length > 1) startDive(state, candidates[Math.floor(random(state) * candidates.length)])
    }
    state.foes.forEach((f) => f.dive && stepDive(state, f, dt, speed))
  }
  // Si la formación baja hasta la nave, la invasión cuesta una vida y se recoloca arriba.
  if (homes.some((f) => f.y > SHIP_Y - 14)) {
    form.y = 0
    form.x = 0
    layoutRows(state, spec)
    state.invaded = true
  }
}

const factorOf = (state) => speedFactor(state.wave)

function startDive(state, f) {
  f.home = false
  f.dive = { sx: f.x, sy: f.y, tx: state.ship.x, t: 0 }
}

function stepDive(state, f, dt, speed) {
  const dive = f.dive
  dive.t += dt / 1000
  const progress = dive.t * (speed * 1.6)
  f.y = dive.sy + progress
  f.x = dive.sx + (dive.tx - dive.sx) * Math.min(1, progress / (SHIP_Y - dive.sy)) + Math.sin(dive.t * 5) * 14
  if (f.y > H + 10) {
    // Vuelve a entrar por arriba y se mete en su hueco de la formación.
    f.dive = null
    f.home = true
    f.y = -10
  }
}

function stepStream(state, speed, dt) {
  state.foes.forEach((f) => {
    f.x += f.side * speed * (dt / 1000)
    f.y = f.base + Math.sin(f.t / 380 + f.phase) * 12
    const out = f.side > 0 ? f.x > W + 14 : f.x < -14
    if (out && f.t > 400) {
      // Sale por un lado y vuelve a entrar por el otro, un carril más abajo. En el último se va de la pantalla.
      f.side *= -1
      f.base += 14
      f.laps += 1
      if (f.base > SHIP_Y - 18) f.hp = 0
    }
  })
  state.foes = state.foes.filter((f) => f.hp > 0)
}

function stepSwoop(state, speed, dt) {
  layoutSwoop(state, state.time)
  state.nextDive -= dt
  const homes = state.foes.filter((f) => f.home)
  if (state.nextDive <= 0 && homes.length) {
    state.nextDive = (900 + random(state) * 900) / factorOf(state)
    startDive(state, homes[Math.floor(random(state) * homes.length)])
  }
  state.foes.forEach((f) => f.dive && stepDive(state, f, dt, speed))
}

function stepRing(state, dt) {
  const { form } = state
  form.cx = W / 2 + Math.sin(state.time / 1700) * 38
  if (!form.broken) {
    form.cy += ((WAVES[3].speed * factorOf(state) * dt) / 1000) * 1.6
    // Cuando el anillo llega bajo, se rompe: los enemigos se lanzan hacia la nave.
    if (form.cy > 100) {
      form.broken = true
      state.foes.forEach((f) => {
        f.free = true
        f.dive = { sx: f.x, sy: f.y, tx: state.ship.x + (random(state) - 0.5) * 60, t: 0 }
      })
    }
  }
  layoutRing(state, dt)
  state.foes.forEach((f) => {
    if (!f.free || f.out) return
    f.dive.t += dt / 1000
    const progress = f.dive.t * 70
    f.y = f.dive.sy + progress
    f.x = f.dive.sx + (f.dive.tx - f.dive.sx) * Math.min(1, progress / Math.max(1, SHIP_Y - f.dive.sy))
    if (f.y > H + 10) f.out = true
  })
  // Los que se escapan por abajo vuelven a formar el anillo en cuanto no queda ninguno en picado.
  if (form.broken && state.foes.every((f) => f.out)) {
    form.broken = false
    form.cy = -20
    state.foes.forEach((f) => {
      f.free = false
      f.out = false
      f.dive = null
    })
  }
}

function stepBoss(state, dt, events) {
  const boss = state.boss
  boss.t += dt
  if (boss.hurt > 0) boss.hurt -= dt
  if (boss.entering) {
    boss.y = Math.min(40, -30 + (boss.t / 1400) * 70)
    if (boss.t >= 1400) boss.entering = 0
    return
  }
  const sway = 1 + boss.phase * 0.35
  boss.x = W / 2 + Math.sin((boss.t / 1000) * 0.9 * sway) * 74
  boss.shieldCooldown -= dt
  if (boss.shield > 0) boss.shield -= dt
  else if (boss.shieldCooldown <= 0) {
    boss.shield = 1300
    boss.shieldCooldown = 5200
    events.push({ type: 'shield' })
  }
  const speed = shotSpeed(state) + 14 * boss.phase
  boss.fire -= dt
  if (boss.fire <= 0) {
    boss.fire = 1100 - boss.phase * 220
    fireAt(state, boss.x, boss.y + 12, Math.atan2(SHIP_Y - boss.y, state.ship.x - boss.x), speed)
    events.push({ type: 'spit' })
  }
  if (boss.phase >= 1) {
    boss.fan -= dt
    if (boss.fan <= 0) {
      boss.fan = 2000 - boss.phase * 380
      const n = boss.phase === 1 ? 3 : 5
      for (let i = 0; i < n; i++) fireAt(state, boss.x, boss.y + 12, Math.PI / 2 + (i - (n - 1) / 2) * 0.32, speed * 0.85)
      events.push({ type: 'spit' })
    }
  }
  if (boss.phase >= 2) {
    boss.summon -= dt
    if (boss.summon <= 0 && state.foes.length < 4) {
      boss.summon = 5200
      ;[-1, 1].forEach((side) => {
        const minion = foe(state, 'bug', boss.x + side * 20, boss.y + 10, { home: false })
        minion.dive = { sx: minion.x, sy: minion.y, tx: state.ship.x, t: 0 }
        state.foes.push(minion)
      })
    }
  }
  state.foes.forEach((f) => {
    if (!f.dive) return
    f.dive.t += dt / 1000
    f.y = f.dive.sy + f.dive.t * 66
    f.x = f.dive.sx + (f.dive.tx - f.dive.sx) * Math.min(1, (f.y - f.dive.sy) / Math.max(1, SHIP_Y - f.dive.sy))
    if (f.y > H + 10) f.hp = 0
  })
  state.foes = state.foes.filter((f) => f.hp > 0)
}

function stepShots(state, dt, events) {
  const shipBox = boxAt(state.ship.x, SHIP_Y, SHIP_HALF - 1, 5)
  state.shots = state.shots.filter((s) => {
    s.x += (s.vx * dt) / 1000
    s.y += (s.vy * dt) / 1000
    if (s.y > H + 4 || s.x < -4 || s.x > W + 4) return false
    if (overlaps(shipBox, boxAt(s.x, s.y, 2))) {
      hurtShip(state, events)
      return false
    }
    return true
  })
}

function checkCollisions(state, events) {
  const shipBox = boxAt(state.ship.x, SHIP_Y, SHIP_HALF - 1, 5)
  state.foes.forEach((f) => {
    if (f.hp > 0 && overlaps(shipBox, boxAt(f.x, f.y, FOES[f.type].half - 1)) && state.ship.invul <= 0) {
      f.hp = 0
      killFoe(state, f, events)
      hurtShip(state, events)
    }
  })
  state.foes = state.foes.filter((f) => f.hp > 0)
  if (state.invaded) {
    state.invaded = false
    hurtShip(state, events)
  }
}

// Avanza el juego `dt` milisegundos. `input` es `{ dx, action, hold }`: dirección horizontal (-1 a 1), disparo recién pulsado
// y disparo mantenido. Devuelve los sucesos de este paso, para el sonido y los logros.
export function step(state, input, dt) {
  const events = []
  state.time += dt
  updateFx(state, dt)
  updateStars(state, dt)
  if (state.banner) {
    state.banner.ms -= dt
    if (state.banner.ms <= 0) state.banner = null
  }
  if (state.over) return events
  stepShip(state, input, dt, events)
  stepBullets(state, dt, events)
  if (state.over) return events
  if (state.boss) stepBoss(state, dt, events)
  else stepFoes(state, dt)
  stepShots(state, dt, events)
  checkCollisions(state, events)
  if (state.over) return events

  // Oleada vencida: un respiro, el bonus y la siguiente.
  if (!state.boss && state.foes.length === 0 && state.wave <= WAVES.length) {
    if (state.clearTimer === 0) {
      state.clearTimer = CLEAR_PAUSE_MS
      state.shots = []
      scoreFor(state, 100 * state.wave + 25 * state.lives, events)
      say(state, 'gClear')
      events.push({ type: 'bonus' })
    } else {
      state.clearTimer -= dt
      if (state.clearTimer <= 0) startWave(state, state.wave + 1, events)
    }
  }
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
      { key: 'wave', value: state.wave === BOSS_WAVE ? '★' : `${state.wave}/${WAVES.length}` },
    ],
  }
}

export function result(state) {
  const accuracy = state.shotsFired ? Math.round((state.kills / state.shotsFired) * 100) : 0
  return {
    score: state.score,
    won: state.over === 'won',
    stats: [
      { key: 'wave', value: Math.min(state.wave, WAVES.length + 1) },
      { key: 'foes', value: state.kills },
      { key: 'accuracy', value: `${Math.min(100, accuracy)}%` },
      { key: 'time', value: Math.round(state.time / 1000) },
    ],
    reward: null,
  }
}
