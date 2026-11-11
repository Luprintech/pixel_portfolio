// Lógica del juego retro de la consola: movimiento con colisiones, espada, enemigos, cofres, llaves y puertas, escaleras
// entre salas, el sabio y la victoria o la derrota. Es una función de paso pura sobre un estado que se muta
// (`step(state, input, dt)`), sin canvas, sin teclado y sin tiempo real: así se prueba entera sin navegador. Las
// coordenadas son píxeles del campo de juego (sin el marcador).
import { COLS, ENEMIES, ROOMS, ROWS, SOLID_TILES, START, TILE } from './world.js'

export const FIELD = { width: COLS * TILE, height: ROWS * TILE }
const HALF = 5
const SPEED = 62
const MAX_HP = 3
const HURT_MS = 1000
const SWING_MS = 200
const SWING_COOLDOWN_MS = 380
const MESSAGE_MS = 2400
const KNOCK = 10
const REACH = HALF + 6

const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }
const centre = (tile) => (tile + 0.5) * TILE

// Generador pseudoaleatorio con semilla guardada en el estado: la misma partida se repite igual.
function random(state) {
  state.seed = (state.seed + 0x6d2b79f5) >>> 0
  let t = Math.imul(state.seed ^ (state.seed >>> 15), 1 | state.seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function createGame(seed = 7) {
  const state = {
    seed,
    time: 0,
    room: START.room,
    player: { x: centre(START.x), y: centre(START.y), dir: 'up', hp: MAX_HP, maxHp: MAX_HP, sword: false, keys: 0, coins: 0, hurt: 0, swing: 0, cooldown: 0, walk: 0, moving: false },
    opened: new Set(),
    killed: new Set(),
    doors: new Set(),
    enemies: [],
    pickups: [],
    message: null,
    dialog: null,
    over: null,
  }
  loadRoom(state, START.room)
  return state
}

function loadRoom(state, room) {
  state.room = room
  state.pickups = []
  state.enemies = (ROOMS[room].enemies ?? [])
    .map((spec, index) => ({ spec, id: `${room}:${index}` }))
    .filter(({ id }) => !state.killed.has(id))
    .map(({ spec, id }) => ({
      id,
      type: spec.type,
      x: centre(spec.col),
      y: centre(spec.row),
      hp: ENEMIES[spec.type].hp,
      vx: 0,
      vy: 0,
      timer: 400,
      hurt: 0,
      charge: 0,
      phase: spec.col + spec.row,
    }))
}

const say = (state, key) => {
  state.message = { key, ms: MESSAGE_MS }
}

// Cofre de una casilla, si lo hay y es visible (el del jefe aparece cuando la sala está despejada).
export function chestAt(state, col, row) {
  const chest = (ROOMS[state.room].chests ?? []).find((c) => c.col === col && c.row === row)
  if (!chest) return null
  if (chest.afterClear && state.enemies.length > 0) return null
  return chest
}

export const isOpen = (state, col, row) => state.opened.has(`${state.room}:${col},${row}`)

export function tileChar(state, col, row) {
  const map = ROOMS[state.room].map
  return map[row]?.[col] ?? '#'
}

function solidAt(state, col, row, flyer) {
  if (chestAt(state, col, row)) return true
  const ch = tileChar(state, col, row)
  if (ch === 'C') return false
  if (ch === 'L') return !state.doors.has(`${state.room}:${col},${row}`)
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

function move(state, entity, dx, dy, half, options) {
  if (!blocked(state, entity.x + dx, entity.y, half, options)) entity.x += dx
  if (!blocked(state, entity.x, entity.y + dy, half, options)) entity.y += dy
}

const overlaps = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1
const boxOf = (e, half) => ({ x0: e.x - half, x1: e.x + half, y0: e.y - half, y1: e.y + half })

// Caja que cubre la espada en el aire, delante de la viajera.
export function swordBox(player) {
  const [dx, dy] = DIRS[player.dir]
  const reach = 14
  const cx = player.x + dx * (HALF + reach / 2)
  const cy = player.y + dy * (HALF + reach / 2)
  const wide = dx ? reach / 2 : 7
  const high = dy ? reach / 2 : 7
  return { x0: cx - wide, x1: cx + wide, y0: cy - high, y1: cy + high }
}

// Casilla justo delante de la viajera.
function facingTile(player) {
  const [dx, dy] = DIRS[player.dir]
  return { col: Math.floor((player.x + dx * REACH) / TILE), row: Math.floor((player.y + dy * REACH) / TILE) }
}

function openChest(state, chest, events) {
  state.opened.add(`${state.room}:${chest.col},${chest.row}`)
  events.push({ type: 'chest', item: chest.item })
  if (chest.item === 'sword') {
    state.player.sword = true
    say(state, 'gotSword')
  } else if (chest.item === 'key') {
    state.player.keys += 1
    say(state, 'gotKey')
  } else {
    state.over = 'won'
    say(state, 'gotCrystal')
    events.push({ type: 'win' })
  }
}

function talk(state, events) {
  const { sword } = state.player
  const won = state.over === 'won'
  const lines = won ? ['sageWon'] : sword ? ['sageSword'] : ['sageHello1', 'sageHello2']
  state.dialog = { lines, index: 0 }
  events.push({ type: 'dialog' })
}

// Pulsar A: abrir un cofre o hablar con el sabio si se está ante ellos y, si no, blandir la espada.
function performAction(state, events) {
  const { player } = state
  const { col, row } = facingTile(player)
  const ch = tileChar(state, col, row)
  const chest = chestAt(state, col, row)
  if (chest && !isOpen(state, col, row)) return openChest(state, chest, events)
  if (ch === 'N') return talk(state, events)
  if (player.sword && player.cooldown <= 0) {
    player.swing = SWING_MS
    player.cooldown = SWING_COOLDOWN_MS
    state.hitThisSwing = new Set()
    events.push({ type: 'swing' })
  } else if (!player.sword && player.cooldown <= 0) {
    player.cooldown = SWING_COOLDOWN_MS
    say(state, 'needSword')
  }
  return undefined
}

function dropFrom(state, enemy) {
  const roll = random(state)
  const type = roll < 0.4 ? 'heart' : 'coin'
  if (enemy.type === 'boss') state.pickups.push({ type: 'heart', x: enemy.x, y: enemy.y })
  else if (roll < 0.75) state.pickups.push({ type, x: enemy.x, y: enemy.y })
}

function hitEnemies(state, events) {
  const { player } = state
  if (player.swing <= 0) return
  const box = swordBox(player)
  state.enemies.forEach((enemy) => {
    if (state.hitThisSwing.has(enemy.id) || !overlaps(box, boxOf(enemy, ENEMIES[enemy.type].size / 2))) return
    state.hitThisSwing.add(enemy.id)
    enemy.hp -= 1
    enemy.hurt = 220
    const [dx, dy] = DIRS[player.dir]
    enemy.vx = dx * 90
    enemy.vy = dy * 90
    events.push({ type: 'hit' })
  })
  const dead = state.enemies.filter((enemy) => enemy.hp <= 0)
  dead.forEach((enemy) => {
    state.killed.add(enemy.id)
    dropFrom(state, enemy)
    events.push({ type: 'kill', enemy: enemy.type })
  })
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0)
}

function moveEnemy(state, enemy, dt) {
  const spec = ENEMIES[enemy.type]
  const half = spec.size / 2
  const options = { flyer: enemy.type === 'bat' }
  if (enemy.hurt > 0) {
    // Retroceso tras el golpe: pierde velocidad hasta quedar quieto.
    enemy.hurt -= dt
    move(state, enemy, (enemy.vx * dt) / 1000, (enemy.vy * dt) / 1000, half, options)
    enemy.vx *= 0.9
    enemy.vy *= 0.9
    return
  }
  const { player } = state
  const toward = Math.atan2(player.y - enemy.y, player.x - enemy.x)
  enemy.timer -= dt
  if (enemy.timer <= 0) {
    const chase = random(state) < (enemy.type === 'bat' ? 0.5 : 0.65)
    const angle = chase ? toward : random(state) * Math.PI * 2
    enemy.vx = Math.cos(angle)
    enemy.vy = Math.sin(angle)
    enemy.timer = enemy.type === 'bat' ? 350 : 500 + random(state) * 500
    // El jefe embiste de vez en cuando, hacia donde está la viajera en ese momento.
    if (enemy.type === 'boss' && random(state) < 0.35) enemy.charge = 700
  }
  let speed = spec.speed
  if (enemy.type === 'slime' && Math.floor(state.time / 450 + enemy.phase) % 2 !== 0) speed = 0
  if (enemy.charge > 0) {
    enemy.charge -= dt
    speed *= 3.2
    enemy.vx = Math.cos(toward)
    enemy.vy = Math.sin(toward)
  }
  move(state, enemy, (enemy.vx * speed * dt) / 1000, (enemy.vy * speed * dt) / 1000, half, options)
}

function hurtPlayer(state, enemy, events) {
  const { player } = state
  if (player.hurt > 0 || state.over) return
  player.hp -= 1
  player.hurt = HURT_MS
  const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x)
  move(state, player, Math.cos(angle) * KNOCK, Math.sin(angle) * KNOCK, HALF, { canLeave: false })
  events.push({ type: 'hurt' })
  if (player.hp <= 0) {
    state.over = 'dead'
    events.push({ type: 'dead' })
  }
}

function collect(state, events) {
  const { player } = state
  state.pickups = state.pickups.filter((pickup) => {
    if (Math.hypot(pickup.x - player.x, pickup.y - player.y) > 9) return true
    if (pickup.type === 'heart') player.hp = Math.min(player.maxHp, player.hp + 1)
    else player.coins += 1
    events.push({ type: 'pickup', item: pickup.type })
    return false
  })
}

// Entra en `room` colocando a la viajera por el borde opuesto al que cruzó.
function crossEdge(state, dir, events) {
  const next = ROOMS[state.room].links?.[dir]
  const { player } = state
  if (!next) {
    player.x = Math.min(FIELD.width - HALF, Math.max(HALF, player.x))
    player.y = Math.min(FIELD.height - HALF, Math.max(HALF, player.y))
    return
  }
  loadRoom(state, next)
  if (dir === 'left') player.x = FIELD.width - HALF - 1
  if (dir === 'right') player.x = HALF + 1
  if (dir === 'up') player.y = FIELD.height - HALF - 1
  if (dir === 'down') player.y = HALF + 1
  events.push({ type: 'room' })
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
  const col = Math.floor(player.x / TILE)
  const row = Math.floor(player.y / TILE)
  if (tileChar(state, col, row) !== 'U') return
  const target = ROOMS[state.room].stairs?.[`${col},${row}`]
  if (!target) return
  loadRoom(state, target.room)
  player.x = centre(target.x)
  player.y = centre(target.y)
  events.push({ type: 'stairs' })
}

// Empujar una puerta con llave la abre si se tiene una; si no, avisa.
function checkDoor(state, dx, dy, events) {
  const { player } = state
  if (!dx && !dy) return
  const col = Math.floor((player.x + Math.sign(dx) * REACH) / TILE)
  const row = Math.floor((player.y + Math.sign(dy) * REACH) / TILE)
  if (tileChar(state, col, row) !== 'L' || state.doors.has(`${state.room}:${col},${row}`)) return
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

// Avanza el juego `dt` milisegundos. `input` es `{ dx, dy, action }`: dirección (-1 a 1 por eje) y si se acaba de pulsar
// la acción (A). Devuelve los sucesos que ocurrieron, para el sonido.
export function step(state, input, dt) {
  const events = []
  state.time += dt
  const { player } = state
  if (state.message) {
    state.message.ms -= dt
    if (state.message.ms <= 0) state.message = null
  }
  if (state.dialog) {
    if (input.action) {
      state.dialog.index += 1
      if (state.dialog.index >= state.dialog.lines.length) state.dialog = null
    }
    return events
  }
  if (state.over) return events

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
    }
  }
  if (input.action) performAction(state, events)
  hitEnemies(state, events)
  checkStairs(state, events)
  checkEdges(state, events)

  state.enemies.forEach((enemy) => {
    moveEnemy(state, enemy, dt)
    if (overlaps(boxOf(player, HALF - 1), boxOf(enemy, ENEMIES[enemy.type].size / 2 - 1))) hurtPlayer(state, enemy, events)
  })
  collect(state, events)
  return events
}
