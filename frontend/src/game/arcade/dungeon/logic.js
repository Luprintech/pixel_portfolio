// Lógica de «La espada del Bucle»: movimiento con colisiones, espada, daño con invulnerabilidad, escudo, enemigos de movimientos
// sencillos, cofres, llaves, puertas, bloques y placas, puntos de control, el mago, el Rey Limo (tres fases) y la escena de
// victoria. Es una función de paso pura sobre un estado que se muta (`step(state, input, dt)`), sin canvas, sin teclado y sin
// tiempo real: así se prueba entera sin navegador. Las coordenadas son píxeles del campo de juego (sin el marcador).
import { boxAt, burst, clamp, overlaps, random, updateFx } from '../shared.js'
import { BOSS_PHASES, BOSS_SCORE, CHECKPOINT_ROOMS, COIN_SCORE, COLS, CRYSTAL_BONUS, ENEMIES, HUD, ROOMS, ROWS, SOLID_TILES, START, TILE } from './world.js'

export const FIELD = { width: COLS * TILE, height: ROWS * TILE }
const HALF = 5
const SPEED = 64
const MAX_HP = 5
const HURT_MS = 1200
const SWING_MS = 220
const SWING_COOLDOWN_MS = 360
const MESSAGE_MS = 2600
// El mago repara en la viajera cuando la tiene a menos de 3,5 baldosas; antes de hablar le sale la exclamación de misión.
const NOTICE_RADIUS = TILE * 3.5
const NOTICE_MS = 850
const KNOCK = 10
const REACH = HALF + 6
const PUSH_MS = 280
const SHOT_SPEED = 72
const SKIP_VICTORY_AFTER_MS = 2400
const VICTORY = { crystalAt: 700, endAt: 4600 }

// Salas en el orden de la aventura: un punto de control solo avanza, nunca vuelve atrás.
const ORDER = ['bosque', 'limos', 'cueva', 'acertijo', 'jefe']

// Ritmo del jefe en cada fase (ms): espera, aviso (parpadeo antes de embestir), descanso (es cuando conviene golpearle), y lo que
// lanza al terminar la embestida: un abanico de bolas o un anillo.
const BOSS_MOVES = [
  { idle: 900, windup: 650, rest: 1100, dash: 520, fan: 0, ring: 0 },
  { idle: 700, windup: 550, rest: 850, dash: 520, fan: 3, ring: 0 },
  { idle: 500, windup: 450, rest: 700, dash: 560, fan: 0, ring: 8 },
]
const STUN_MS = 1100
const MAX_FOES = 5

const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }
const centre = (tile) => (tile + 0.5) * TILE
const tileOf = (value) => Math.floor(value / TILE)
const linkOf = (room, dir) => {
  const link = ROOMS[room].links?.[dir]
  return typeof link === 'string' ? { room: link } : link ?? null
}

// Casilla del mago en una sala (solo hay uno, en el claro del bosque), o null.
export function wizardTile(room) {
  const row = ROOMS[room].map.findIndex((line) => line.includes('W'))
  return row < 0 ? null : { col: ROOMS[room].map[row].indexOf('W'), row }
}

const say = (state, key) => {
  state.message = { key, ms: MESSAGE_MS }
}

// El mago habla en el escenario: abre un diálogo (E avanza de página) que sale en un bocadillo junto a él.
const startDialog = (state, lines, events) => {
  state.dialog = { lines, index: 0 }
  events.push({ type: 'dialog' })
}

export function createGame(seed = 7) {
  const state = {
    seed,
    time: 0,
    room: START.room,
    player: { x: centre(START.x), y: centre(START.y), dir: 'up', hp: MAX_HP, maxHp: MAX_HP, sword: false, keys: 0, coins: 0, hurt: 0, swing: 0, cooldown: 0, walk: 0, moving: false, push: 0 },
    opened: new Set(),
    killed: new Set(),
    doors: new Set(),
    taken: new Set(),
    solved: new Set(),
    enemies: [],
    pickups: [],
    shots: [],
    blocks: [],
    fx: [],
    message: null,
    dialog: null,
    // 'wait' (el mago aún no ha reparado en la viajera), 'escort' (intentó irse y la llevan hasta él), 'notice' (la exclamación) y
    // 'done' (ya habló). La aventura no empieza con él hablando: habla cuando ella se acerca.
    intro: 'wait',
    noticeMs: 0,
    victory: null,
    over: null,
    checkpoint: { room: START.room, x: centre(START.x), y: centre(START.y) },
    kills: 0,
    deaths: 0,
    minions: 0,
    hitThisSwing: new Set(),
  }
  loadRoom(state, START.room)
  return state
}

// El mago llama la atención de la viajera: la exclamación amarilla de misión, con su sonido, y enseguida habla.
function beginNotice(state, events) {
  state.intro = 'notice'
  state.noticeMs = NOTICE_MS
  state.player.moving = false
  state.player.dir = 'up'
  events.push({ type: 'quest' })
}

// Antes de que hable, el mago espera a que la viajera se acerque; si intenta salir de la sala, se la lleva hasta él andando.
// Devuelve si este paso lo ha ocupado la presentación (y por tanto no se juega nada más).
function stepIntro(state, dt, events) {
  const { player } = state
  const wizard = wizardTile(state.room)
  if (!wizard) {
    state.intro = 'done'
    return false
  }
  if (state.intro === 'notice') {
    state.noticeMs -= dt
    if (state.noticeMs <= 0) {
      state.intro = 'done'
      startDialog(state, ['wizIntro1', 'wizIntro2', 'wizIntro3', 'wizIntro4'], events)
    }
    return true
  }
  const goal = { x: centre(wizard.col), y: centre(wizard.row + 1) }
  if (state.intro === 'escort') {
    const dx = goal.x - player.x
    const dy = goal.y - player.y
    const left = Math.hypot(dx, dy)
    const stride = (SPEED * dt) / 1000
    if (left <= stride) {
      player.x = goal.x
      player.y = goal.y
      beginNotice(state, events)
      return true
    }
    player.x += (dx / left) * stride
    player.y += (dy / left) * stride
    player.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down'
    player.moving = true
    player.walk += dt
    return true
  }
  if (Math.hypot(player.x - centre(wizard.col), player.y - centre(wizard.row)) <= NOTICE_RADIUS) {
    beginNotice(state, events)
    return true
  }
  return false
}

const outsideField = ({ x, y }) => x < 0 || x >= FIELD.width || y < 0 || y >= FIELD.height

export function loadRoom(state, room) {
  const spec = ROOMS[room]
  state.room = room
  state.shots = []
  state.fx = []
  state.pickups = (spec.coins ?? [])
    .map((coin) => ({ type: 'coin', id: `${room}:${coin.col},${coin.row}`, x: centre(coin.col), y: centre(coin.row) }))
    .filter(({ id }) => !state.taken.has(id))
  state.enemies = (spec.enemies ?? [])
    .map((enemy, index) => ({ enemy, id: `${room}:${index}` }))
    .filter(({ id }) => !state.killed.has(id))
    .map(({ enemy, id }) => newEnemy(enemy.type, id, centre(enemy.col), centre(enemy.row), enemy.col + enemy.row))
  state.blocks = blocksFor(state, room)
}

function newEnemy(type, id, x, y, phase = 0) {
  const boss = type === 'boss'
  return { id, type, x, y, hp: ENEMIES[type].hp, vx: 0, vy: 0, timer: 400, hurt: 0, charge: 0, phase, mode: 'idle', stage: 0, dirX: 0, dirY: 0, minion: false, boss }
}

// Los bloques del acertijo vuelven a su sitio al entrar si aún no está resuelto; resuelto, se quedan sobre las placas.
function blocksFor(state, room) {
  const spec = ROOMS[room]
  if (!spec.blocks) return []
  if (state.solved.has(room)) return plates(room).map(({ col, row }) => ({ col, row }))
  return spec.blocks.map(({ col, row }) => ({ col, row }))
}

// Casillas de las placas de una sala.
export function plates(room) {
  const found = []
  ROOMS[room].map.forEach((line, row) => {
    ;[...line].forEach((ch, col) => ch === 'S' && found.push({ col, row }))
  })
  return found
}

export const blockAt = (state, col, row) => state.blocks.some((block) => block.col === col && block.row === row)

// Cofre de una casilla, si lo hay.
export function chestAt(state, col, row) {
  return (ROOMS[state.room].chests ?? []).find((c) => c.col === col && c.row === row) ?? null
}

export const isOpen = (state, col, row) => state.opened.has(`${state.room}:${col},${row}`)

export function tileChar(state, col, row) {
  return ROOMS[state.room].map[row]?.[col] ?? '#'
}

const doorOpen = (state, col, row) => state.doors.has(`${state.room}:${col},${row}`)

function solidAt(state, col, row, flyer) {
  if (chestAt(state, col, row)) return true
  if (blockAt(state, col, row)) return true
  const ch = tileChar(state, col, row)
  if (ch === 'C') return false
  if (ch === 'L') return !doorOpen(state, col, row)
  if (ch === 'G') return !state.solved.has(state.room)
  if (ch === '~' && flyer) return false
  return SOLID_TILES.has(ch)
}

// ¿Una caja centrada en (x, y) toca algo sólido? Fuera de la pantalla solo estorba a quien no puede salir.
function blocked(state, x, y, half, { flyer = false, canLeave = false } = {}) {
  const eps = 0.01
  for (const cx of [x - half, x + half - eps]) {
    for (const cy of [y - half, y + half - eps]) {
      const col = Math.floor(cx / TILE)
      const row = Math.floor(cy / TILE)
      if (col < 0 || col >= COLS || row < 0 || row >= ROWS) {
        if (!canLeave) return true
      } else if (solidAt(state, col, row, flyer)) return true
    }
  }
  return false
}

// Mueve por ejes separados para deslizarse por las paredes. Devuelve si pudo avanzar en algún eje.
function move(state, entity, dx, dy, half, options) {
  let moved = false
  if (!blocked(state, entity.x + dx, entity.y, half, options)) {
    entity.x += dx
    moved ||= dx !== 0
  }
  if (!blocked(state, entity.x, entity.y + dy, half, options)) {
    entity.y += dy
    moved ||= dy !== 0
  }
  return moved
}

const sizeOf = (enemy) => ENEMIES[enemy.type].size / 2
const boxOf = (e, half) => boxAt(e.x, e.y, half)

// Caja que cubre la espada en el aire, delante de la viajera.
export function swordBox(player) {
  const [dx, dy] = DIRS[player.dir]
  const reach = 15
  const cx = player.x + dx * (HALF + reach / 2)
  const cy = player.y + dy * (HALF + reach / 2)
  const wide = dx ? reach / 2 : 8
  const high = dy ? reach / 2 : 8
  return { x0: cx - wide, x1: cx + wide, y0: cy - high, y1: cy + high }
}

// Casilla justo delante de la viajera.
function facingTile(player) {
  const [dx, dy] = DIRS[player.dir]
  return { col: tileOf(player.x + dx * REACH), row: tileOf(player.y + dy * REACH) }
}

function openChest(state, chest, events) {
  state.opened.add(`${state.room}:${chest.col},${chest.row}`)
  events.push({ type: 'chest', item: chest.item })
  if (chest.item === 'sword') {
    state.player.sword = true
    say(state, 'gotSword')
  } else {
    state.player.keys += 1
    say(state, 'gotKey')
  }
}

function talk(state, events) {
  startDialog(state, state.player.sword ? ['wizSword1', 'wizSword2'] : ['wizHello1', 'wizHello2'], events)
}

// Pulsar la acción: abrir un cofre o hablar con el mago si se está ante ellos y, si no, blandir la espada.
function performAction(state, events) {
  const { player } = state
  const { col, row } = facingTile(player)
  const chest = chestAt(state, col, row)
  if (chest && !isOpen(state, col, row)) return openChest(state, chest, events)
  if (tileChar(state, col, row) === 'W') return talk(state, events)
  if (player.cooldown > 0) return undefined
  player.cooldown = SWING_COOLDOWN_MS
  if (player.sword) {
    player.swing = SWING_MS
    state.hitThisSwing = new Set()
    events.push({ type: 'swing' })
  } else say(state, 'needSword')
  return undefined
}

function dropFrom(state, enemy) {
  if (enemy.boss) return
  const roll = random(state)
  if (roll < 0.3) state.pickups.push({ type: 'heart', id: null, x: enemy.x, y: enemy.y })
  else if (roll < 0.65) state.pickups.push({ type: 'coin', id: null, x: enemy.x, y: enemy.y })
}

// Fase del jefe según su vida: 0, 1 o 2.
const bossPhaseOf = (hp) => BOSS_PHASES.filter((start) => hp <= start).length - 1

function hitEnemies(state, events) {
  const { player } = state
  if (player.swing <= 0) return
  const box = swordBox(player)
  state.enemies.forEach((enemy) => {
    if (state.hitThisSwing.has(enemy.id) || !overlaps(box, boxOf(enemy, sizeOf(enemy)))) return
    state.hitThisSwing.add(enemy.id)
    // Mientras el jefe cambia de fase no se le puede herir: es el respiro entre fases.
    if (enemy.boss && enemy.mode === 'stun') {
      events.push({ type: 'block' })
      return
    }
    enemy.hp -= 1
    enemy.hurt = enemy.boss ? 240 : 220
    if (!enemy.boss) {
      const [dx, dy] = DIRS[player.dir]
      enemy.vx = dx * 90
      enemy.vy = dy * 90
    }
    events.push({ type: 'hit' })
    if (enemy.boss && enemy.hp > 0) changePhase(state, enemy, events)
  })
  const dead = state.enemies.filter((enemy) => enemy.hp <= 0)
  dead.forEach((enemy) => defeat(state, enemy, events))
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0)
}

function defeat(state, enemy, events) {
  state.killed.add(enemy.id)
  state.kills += 1
  if (enemy.minion) state.minions -= 1
  burst(state, enemy.x, enemy.y, enemy.boss ? ['#d4503a', '#f8d77a', '#f1e6cf'] : ['#62933f', '#a3c14f'], enemy.boss ? 26 : 8, enemy.boss ? 110 : 60)
  if (enemy.boss) {
    // El jefe cae: se acaba todo lo que traía y empieza la escena de victoria.
    state.shots = []
    state.enemies.forEach((other) => other !== enemy && (other.hp = 0))
    state.victory = { ms: 0, crystal: false }
    events.push({ type: 'bossDown' })
  } else {
    dropFrom(state, enemy)
    events.push({ type: 'kill', enemy: enemy.type })
  }
}

// Al bajar de ciertos puntos de vida el jefe se enfurece: se queda quieto un momento (herirle no vale), y desde la segunda
// fase llama a limos pequeños en su ayuda.
function changePhase(state, boss, events) {
  const phase = bossPhaseOf(boss.hp)
  if (phase === boss.stage) return
  boss.stage = phase
  boss.mode = 'stun'
  boss.timer = STUN_MS
  events.push({ type: 'phase' })
  say(state, phase === 1 ? 'bossPhase2' : 'bossPhase3')
  if (phase === 2) {
    ;[-1, 1].forEach((side) => {
      if (state.enemies.length >= MAX_FOES) return
      state.minions += 1
      const baby = newEnemy('slime', `minion:${state.minions}:${Math.floor(state.time)}`, clamp(boss.x + side * 22, 20, FIELD.width - 20), boss.y, side)
      baby.hp = 1
      baby.minion = true
      state.enemies.push(baby)
    })
  }
}

function fire(state, x, y, angle) {
  state.shots.push({ x, y, vx: Math.cos(angle) * SHOT_SPEED, vy: Math.sin(angle) * SHOT_SPEED })
}

function bossFire(state, boss, moves, events) {
  const toward = Math.atan2(state.player.y - boss.y, state.player.x - boss.x)
  if (moves.fan) for (let i = 0; i < moves.fan; i++) fire(state, boss.x, boss.y, toward + (i - (moves.fan - 1) / 2) * 0.4)
  if (moves.ring) {
    const offset = random(state) * Math.PI
    for (let i = 0; i < moves.ring; i++) fire(state, boss.x, boss.y, offset + (i / moves.ring) * Math.PI * 2)
  }
  if (moves.fan || moves.ring) events.push({ type: 'spit' })
}

// Ciclo del jefe: espera persiguiendo despacio, avisa parpadeando, embiste en línea recta, lanza lo que le toque y descansa.
function moveBoss(state, boss, dt, events) {
  const moves = BOSS_MOVES[boss.stage]
  const spec = ENEMIES.boss
  const { player } = state
  const half = sizeOf(boss)
  if (boss.hurt > 0) boss.hurt -= dt
  boss.timer -= dt
  const toward = Math.atan2(player.y - boss.y, player.x - boss.x)
  if (boss.mode === 'idle') {
    move(state, boss, (Math.cos(toward) * spec.speed * dt) / 1000, (Math.sin(toward) * spec.speed * dt) / 1000, half)
    if (boss.timer <= 0) {
      boss.mode = 'windup'
      boss.timer = moves.windup
    }
  } else if (boss.mode === 'windup') {
    if (boss.timer <= 0) {
      boss.mode = 'dash'
      boss.timer = moves.dash
      boss.dirX = Math.cos(toward)
      boss.dirY = Math.sin(toward)
      events.push({ type: 'slam' })
    }
  } else if (boss.mode === 'dash') {
    const rush = (spec.speed * 6 * dt) / 1000
    const advanced = move(state, boss, boss.dirX * rush, boss.dirY * rush, half)
    if (boss.timer <= 0 || !advanced) {
      boss.mode = 'rest'
      boss.timer = moves.rest
      bossFire(state, boss, moves, events)
    }
  } else if (boss.timer <= 0) {
    boss.mode = 'idle'
    boss.timer = moves.idle
  }
}

function moveEnemy(state, enemy, dt, events) {
  if (enemy.boss) return moveBoss(state, enemy, dt, events)
  const spec = ENEMIES[enemy.type]
  const half = spec.size / 2
  const options = { flyer: enemy.type === 'bat' }
  if (enemy.hurt > 0) {
    // Retroceso tras el golpe: pierde velocidad hasta quedar quieto.
    enemy.hurt -= dt
    move(state, enemy, (enemy.vx * dt) / 1000, (enemy.vy * dt) / 1000, half, options)
    enemy.vx *= 0.9
    enemy.vy *= 0.9
    return undefined
  }
  const { player } = state
  const toward = Math.atan2(player.y - enemy.y, player.x - enemy.x)
  enemy.timer -= dt
  if (enemy.timer <= 0) {
    const chase = random(state) < (enemy.type === 'bat' ? 0.5 : 0.6)
    const angle = chase ? toward : random(state) * Math.PI * 2
    enemy.vx = Math.cos(angle)
    enemy.vy = Math.sin(angle)
    enemy.timer = enemy.type === 'bat' ? 350 : 500 + random(state) * 500
  }
  // El limo avanza a saltitos: se mueve medio ciclo y se detiene el otro medio, y así se pueden esquivar.
  let speed = spec.speed
  if (enemy.type === 'slime' && Math.floor(state.time / 450 + enemy.phase) % 2 !== 0) speed = 0
  move(state, enemy, (enemy.vx * speed * dt) / 1000, (enemy.vy * speed * dt) / 1000, half, options)
  return undefined
}

function hurtPlayer(state, source, events) {
  const { player } = state
  if (player.hurt > 0 || state.over || state.victory) return
  player.hp -= 1
  player.hurt = HURT_MS
  const angle = Math.atan2(player.y - source.y, player.x - source.x)
  move(state, player, Math.cos(angle) * KNOCK, Math.sin(angle) * KNOCK, HALF)
  events.push({ type: 'hurt' })
  if (player.hp <= 0) {
    state.over = 'dead'
    state.deaths += 1
    events.push({ type: 'dead' })
  }
}

// El escudo frena lo que viene de frente: un proyectil que choca con él mirando hacia su origen se deshace.
function shielded(player, shot) {
  if (player.swing > 0) return false
  const [fx, fy] = DIRS[player.dir]
  const length = Math.hypot(shot.vx, shot.vy) || 1
  return (-shot.vx / length) * fx + (-shot.vy / length) * fy > 0.5
}

function updateShots(state, dt, events) {
  const { player } = state
  const swing = player.swing > 0 ? swordBox(player) : null
  state.shots = state.shots.filter((shot) => {
    shot.x += (shot.vx * dt) / 1000
    shot.y += (shot.vy * dt) / 1000
    if (shot.x < 0 || shot.y < 0 || shot.x > FIELD.width || shot.y > FIELD.height || solidAt(state, tileOf(shot.x), tileOf(shot.y), true)) return false
    const box = boxAt(shot.x, shot.y, 3)
    if (swing && overlaps(swing, box)) {
      events.push({ type: 'hit' })
      return false
    }
    if (!overlaps(boxAt(player.x, player.y, HALF - 1), box)) return true
    if (shielded(player, shot)) events.push({ type: 'block' })
    else hurtPlayer(state, shot, events)
    return false
  })
}

function collect(state, events) {
  const { player } = state
  state.pickups = state.pickups.filter((pickup) => {
    if (Math.hypot(pickup.x - player.x, pickup.y - player.y) > 10) return true
    if (pickup.type === 'heart') player.hp = Math.min(player.maxHp, player.hp + 1)
    else player.coins += 1
    if (pickup.id) state.taken.add(pickup.id)
    events.push({ type: 'pickup', item: pickup.type })
    return false
  })
}

// Entra en una sala colocando a la viajera y, si es la más avanzada hasta ahora, guarda ahí el punto de control.
function enterRoom(state, room, x, y, events) {
  loadRoom(state, room)
  state.player.x = x
  state.player.y = y
  state.player.push = 0
  events.push({ type: 'room' })
  if (CHECKPOINT_ROOMS.has(room) && ORDER.indexOf(room) > ORDER.indexOf(state.checkpoint.room)) {
    state.checkpoint = { room, x, y }
    say(state, 'checkpoint')
    events.push({ type: 'checkpoint' })
  } else if (room === 'acertijo' && !state.solved.has(room)) say(state, 'puzzleHint')
}

// Cruza el borde de la pantalla por el lado opuesto al que salió. Si no hay sala al otro lado (o hay que cumplir algo
// antes) se queda dentro.
function crossEdge(state, dir, events) {
  const link = linkOf(state.room, dir)
  const { player } = state
  const keepIn = () => {
    player.x = clamp(player.x, HALF, FIELD.width - HALF)
    player.y = clamp(player.y, HALF, FIELD.height - HALF)
  }
  if (!link) return keepIn()
  if (link.needs === 'sword' && !player.sword) {
    keepIn()
    if (!state.message) say(state, 'noSwordExit')
    return undefined
  }
  const x = dir === 'left' ? FIELD.width - HALF - 1 : dir === 'right' ? HALF + 1 : player.x
  const y = dir === 'up' ? FIELD.height - HALF - 1 : dir === 'down' ? HALF + 1 : player.y
  enterRoom(state, link.room, x, y, events)
  return undefined
}

function checkEdges(state, events) {
  const { player } = state
  if (player.x < 0) crossEdge(state, 'left', events)
  else if (player.x >= FIELD.width) crossEdge(state, 'right', events)
  else if (player.y < 0) crossEdge(state, 'up', events)
  else if (player.y >= FIELD.height) crossEdge(state, 'down', events)
}

function checkStairs(state, events) {
  const { player } = state
  const col = tileOf(player.x)
  const row = tileOf(player.y)
  if (tileChar(state, col, row) !== 'U') return
  const target = ROOMS[state.room].stairs?.[`${col},${row}`]
  if (!target) return
  enterRoom(state, target.room, centre(target.x), centre(target.y), events)
  events.push({ type: 'stairs' })
}

// Empujar una puerta con llave la abre si se tiene una; la reja del acertijo solo avisa de que falta algo.
function checkDoor(state, dx, dy, events) {
  const { player } = state
  if (!dx && !dy) return
  const col = tileOf(player.x + Math.sign(dx) * REACH)
  const row = tileOf(player.y + Math.sign(dy) * REACH)
  const ch = tileChar(state, col, row)
  if (ch === 'G' && !state.solved.has(state.room)) {
    if (!state.message) {
      say(state, 'gateShut')
      events.push({ type: 'locked' })
    }
    return
  }
  if (ch !== 'L' || doorOpen(state, col, row)) return
  if (player.keys > 0) {
    player.keys -= 1
    state.doors.add(`${state.room}:${col},${row}`)
    say(state, 'doorOpened')
    events.push({ type: 'door' })
  } else if (!state.message) {
    say(state, 'locked')
    events.push({ type: 'locked' })
  }
}

// Empuja el bloque que tiene delante si lleva un momento apoyada en él y la casilla de detrás está libre.
function pushBlock(state, dx, dy, dt, events) {
  const { player } = state
  const straight = (dx === 0) !== (dy === 0)
  const col = tileOf(player.x + Math.sign(dx) * REACH)
  const row = tileOf(player.y + Math.sign(dy) * REACH)
  if (!straight || !blockAt(state, col, row)) {
    player.push = 0
    return
  }
  player.push += dt
  if (player.push < PUSH_MS) return
  const toCol = col + Math.sign(dx)
  const toRow = row + Math.sign(dy)
  const free = toCol >= 0 && toCol < COLS && toRow >= 0 && toRow < ROWS && !solidAt(state, toCol, toRow, false) && !tileChar(state, toCol, toRow).match(/[UL]/)
  player.push = 0
  if (!free) return
  const block = state.blocks.find((b) => b.col === col && b.row === row)
  block.col = toCol
  block.row = toRow
  events.push({ type: 'push' })
  checkPlates(state, events)
}

// Cuando todas las placas tienen bloque encima se abre la reja para siempre.
function checkPlates(state, events) {
  const targets = plates(state.room)
  if (!targets.length || state.solved.has(state.room)) return
  const covered = targets.filter(({ col, row }) => blockAt(state, col, row)).length
  if (covered > 0) events.push({ type: 'plate' })
  if (covered === targets.length) {
    state.solved.add(state.room)
    say(state, 'gateOpen')
    events.push({ type: 'gate' })
  }
}

// Tras caer, la viajera vuelve al último punto de control con todos los corazones; lo ya abierto o vencido sigue así.
function respawn(state, events) {
  const { player, checkpoint } = state
  player.hp = player.maxHp
  player.hurt = 1600
  player.swing = 0
  state.over = null
  state.dialog = null
  loadRoom(state, checkpoint.room)
  player.x = checkpoint.x
  player.y = checkpoint.y
  say(state, 'respawn')
  events.push({ type: 'room' })
}

// Escena de victoria: el jefe estalla, aparece el Cristal del Bucle y sube; con la acción se salta lo que queda.
function stepVictory(state, input, dt, events) {
  const scene = state.victory
  scene.ms += dt
  if (!scene.crystal && scene.ms >= VICTORY.crystalAt) {
    scene.crystal = true
    events.push({ type: 'crystal' })
    say(state, 'gotCrystal')
  }
  if (input.action && scene.ms >= SKIP_VICTORY_AFTER_MS) scene.ms = VICTORY.endAt
  if (scene.ms >= VICTORY.endAt) {
    state.over = 'won'
    events.push({ type: 'win' })
  }
}

// Avanza el juego `dt` milisegundos. `input` es `{ dx, dy, action }`: dirección (-1 a 1 por eje) y si se acaba de pulsar
// la acción. Devuelve los sucesos que ocurrieron, para el sonido y los logros.
export function step(state, input, dt) {
  const events = []
  state.time += dt
  const { player } = state
  if (state.message) {
    state.message.ms -= dt
    if (state.message.ms <= 0) state.message = null
  }
  updateFx(state, dt)
  if (state.dialog) {
    if (input.action) {
      state.dialog.index += 1
      events.push({ type: 'dialog' })
      if (state.dialog.index >= state.dialog.lines.length) state.dialog = null
    }
    return events
  }
  if (state.over === 'dead') {
    if (input.action) respawn(state, events)
    return events
  }
  if (state.over) return events
  if (state.victory) {
    stepVictory(state, input, dt, events)
    return events
  }

  if (state.intro !== 'done' && stepIntro(state, dt, events)) return events

  player.hurt = Math.max(0, player.hurt - dt)
  player.swing = Math.max(0, player.swing - dt)
  player.cooldown = Math.max(0, player.cooldown - dt)

  const length = Math.hypot(input.dx, input.dy)
  player.moving = length > 0.15
  if (player.moving) {
    const dx = input.dx / Math.max(1, length)
    const dy = input.dy / Math.max(1, length)
    player.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down'
    // Durante el mandoble no se anda: la espada pide los pies quietos.
    if (player.swing <= 0) {
      move(state, player, (dx * SPEED * dt) / 1000, (dy * SPEED * dt) / 1000, HALF, { canLeave: true })
      player.walk += dt
      checkDoor(state, dx, dy, events)
      pushBlock(state, dx, dy, dt, events)
    }
  } else player.push = 0
  // Sin haber hablado con el mago no se sale de la sala: el primer intento la lleva hasta él.
  if (state.intro === 'wait' && outsideField(player)) {
    player.x = Math.min(FIELD.width - 1, Math.max(1, player.x))
    player.y = Math.min(FIELD.height - 1, Math.max(1, player.y))
    state.intro = 'escort'
    return events
  }
  if (input.action) performAction(state, events)
  hitEnemies(state, events)
  checkStairs(state, events)
  checkEdges(state, events)
  if (state.victory) return events

  state.enemies.forEach((enemy) => {
    moveEnemy(state, enemy, dt, events)
    if (overlaps(boxOf(player, HALF - 1), boxOf(enemy, sizeOf(enemy) - 1))) hurtPlayer(state, enemy, events)
  })
  updateShots(state, dt, events)
  collect(state, events)
  return events
}

// Lo que enseña la pantalla además del lienzo (ver `ArcadeMachine.jsx`): estado de la partida, mensaje y el bocadillo del mago
// en coordenadas del lienzo, para colocarlo junto a él.
export function view(state) {
  const wizard = wizardTile(state.room)
  const talking = state.dialog && wizard
  return {
    quest: state.intro === 'notice',
    status: state.over === 'won' ? 'won' : state.over === 'dead' ? 'dead' : 'playing',
    message: state.message?.key ?? null,
    bubble: talking
      ? { key: state.dialog.lines[state.dialog.index], x: centre(wizard.col), y: HUD + wizard.row * TILE - 2, more: state.dialog.index < state.dialog.lines.length - 1 }
      : null,
    hint: state.dialog ? 'dialogHint' : null,
  }
}

export function scoreOf(state) {
  const crystal = state.over === 'won' ? BOSS_SCORE + CRYSTAL_BONUS : 0
  return state.player.coins * COIN_SCORE + state.kills * 5 + crystal
}

export function result(state) {
  return {
    score: scoreOf(state),
    won: state.over === 'won',
    stats: [
      { key: 'coins', value: state.player.coins },
      { key: 'foes', value: state.kills },
      { key: 'deaths', value: state.deaths },
      { key: 'time', value: Math.round(state.time / 1000) },
    ],
    reward: state.over === 'won' ? 'crystal' : null,
  }
}
