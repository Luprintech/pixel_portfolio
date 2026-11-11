import { describe, expect, it } from 'vitest'
import { retroCopyKeys } from '../../lib/retroCopy.js'
import { FIELD, chestAt, createGame, step, swordBox, tileChar } from './logic.js'
import { COLS, ENEMIES, ROOMS, ROWS, START, TILE } from './world.js'

const IDLE = { dx: 0, dy: 0, action: false }
const centre = (tile) => (tile + 0.5) * TILE

// Avanza `frames` fotogramas de 16 ms con una entrada fija y devuelve los sucesos de todos.
function run(state, input, frames = 1) {
  const events = []
  for (let i = 0; i < frames; i++) events.push(...step(state, i === 0 ? input : { ...input, action: false }, 16))
  return events
}

// Coloca a la viajera en una casilla de una sala ya cargada.
function place(state, col, row, dir = 'down') {
  state.player.x = centre(col)
  state.player.y = centre(row)
  state.player.dir = dir
}

function goTo(state, room, col, row) {
  state.room = room
  state.enemies = []
  place(state, col, row)
}

describe('mundo', () => {
  it('cada mapa mide 10×9 y solo usa símbolos conocidos', () => {
    Object.entries(ROOMS).forEach(([id, room]) => {
      expect(room.map.length, id).toBe(ROWS)
      room.map.forEach((line) => {
        expect(line.length, id).toBe(COLS)
        expect(line).toMatch(/^[.TRB~#PNCLU]+$/)
      })
    })
  })

  it('los enlaces entre salas son de ida y vuelta y caen en un hueco abierto', () => {
    const opposite = { left: 'right', right: 'left', up: 'down', down: 'up' }
    Object.entries(ROOMS).forEach(([id, room]) => {
      Object.entries(room.links ?? {}).forEach(([dir, target]) => {
        expect(ROOMS[target].links[opposite[dir]], `${id} ${dir}`).toBe(id)
      })
    })
  })

  it('cada cofre está sobre una casilla C y cada escalera sobre una U', () => {
    Object.entries(ROOMS).forEach(([id, room]) => {
      ;(room.chests ?? []).forEach((c) => {
        if (!c.afterClear) expect(room.map[c.row][c.col], `${id} cofre`).toBe('C')
      })
      Object.keys(room.stairs ?? {}).forEach((key) => {
        const [col, row] = key.split(',').map(Number)
        expect(room.map[row][col], `${id} escalera`).toBe('U')
        const target = room.stairs[key]
        expect(ROOMS[target.room].map[target.y][target.x], `${id} destino`).toBe('.')
      })
    })
  })

  it('todos los enemigos nacen en suelo libre', () => {
    Object.entries(ROOMS).forEach(([id, room]) => {
      ;(room.enemies ?? []).forEach((e) => expect(room.map[e.row][e.col], id).toBe('.'))
      ;(room.enemies ?? []).forEach((e) => expect(ENEMIES[e.type]).toBeTruthy())
    })
  })
})

describe('movimiento', () => {
  it('anda por el suelo y mira hacia donde va', () => {
    const state = createGame()
    const { x } = state.player
    run(state, { dx: 1, dy: 0, action: false }, 10)
    expect(state.player.x).toBeGreaterThan(x)
    expect(state.player.dir).toBe('right')
  })

  it('no atraviesa árboles ni rocas', () => {
    const state = createGame()
    goTo(state, 'aldea', 4, 1)
    run(state, { dx: 0, dy: -1, action: false }, 200)
    expect(state.player.y).toBeGreaterThan(TILE + 4)
  })

  it('cruza el borde abierto a la sala vecina y vuelve', () => {
    const state = createGame()
    goTo(state, 'aldea', 8, 4)
    run(state, { dx: 1, dy: 0, action: false }, 60)
    expect(state.room).toBe('bosque')
    expect(state.player.x).toBeLessThan(FIELD.width / 2)
    run(state, { dx: -1, dy: 0, action: false }, 60)
    expect(state.room).toBe('aldea')
  })

  it('sin enlace, el borde la detiene dentro de la sala', () => {
    const state = createGame()
    goTo(state, 'aldea', 1, 4)
    run(state, { dx: -1, dy: 0, action: false }, 120)
    expect(state.room).toBe('aldea')
    expect(state.player.x).toBeGreaterThan(0)
  })

  it('las escaleras llevan a otra sala', () => {
    const state = createGame()
    goTo(state, 'bosque', 5, 1)
    run(state, { dx: 0, dy: -1, action: false }, 40)
    expect(state.room).toBe('camara')
  })
})

describe('espada, cofres y monstruos', () => {
  it('sin espada no se puede atacar y avisa', () => {
    const state = createGame()
    run(state, { ...IDLE, action: true })
    expect(state.player.swing).toBe(0)
    expect(state.message.key).toBe('needSword')
  })

  it('el cofre de la cámara da la espada', () => {
    const state = createGame()
    goTo(state, 'camara', 4, 4)
    state.player.dir = 'up'
    const events = run(state, { ...IDLE, action: true })
    expect(state.player.sword).toBe(true)
    expect(events.some((e) => e.type === 'chest' && e.item === 'sword')).toBe(true)
    expect(state.message.key).toBe('gotSword')
    // Un cofre abierto no vuelve a dar nada.
    state.player.cooldown = 0
    run(state, { ...IDLE, action: true })
    expect(state.player.swing).toBeGreaterThan(0)
  })

  it('con espada, un mandoble mata un murciélago y suelta algo a veces', () => {
    const state = createGame()
    state.player.sword = true
    goTo(state, 'sala', 4, 5)
    state.enemies = [{ id: 'sala:t', type: 'bat', x: centre(4), y: centre(5) - 17, hp: 1, vx: 0, vy: 0, timer: 5000, hurt: 0, charge: 0, phase: 0 }]
    state.player.dir = 'up'
    const events = run(state, { ...IDLE, action: true })
    expect(events.some((e) => e.type === 'kill' && e.enemy === 'bat')).toBe(true)
    expect(state.enemies).toHaveLength(0)
    expect(state.killed.has('sala:t')).toBe(true)
  })

  it('el slime aguanta dos golpes', () => {
    const state = createGame()
    state.player.sword = true
    goTo(state, 'sala', 4, 5)
    state.enemies = [{ id: 'sala:s', type: 'slime', x: centre(4), y: centre(5) - 16, hp: 2, vx: 0, vy: 0, timer: 5000, hurt: 0, charge: 0, phase: 0 }]
    state.player.dir = 'up'
    run(state, { ...IDLE, action: true })
    expect(state.enemies).toHaveLength(1)
    expect(state.enemies[0].hp).toBe(1)
  })

  it('un monstruo que toca a la viajera le quita un corazón y luego da un respiro', () => {
    const state = createGame()
    state.room = 'sala'
    place(state, 4, 5)
    state.enemies = [{ id: 'sala:s', type: 'slime', x: state.player.x + 2, y: state.player.y, hp: 2, vx: 0, vy: 0, timer: 5000, hurt: 0, charge: 0, phase: 0 }]
    const events = run(state, IDLE, 2)
    expect(events.some((e) => e.type === 'hurt')).toBe(true)
    expect(state.player.hp).toBe(2)
    run(state, IDLE, 10)
    expect(state.player.hp).toBe(2)
  })

  it('sin corazones se pierde', () => {
    const state = createGame()
    state.room = 'sala'
    state.player.hp = 1
    place(state, 4, 5)
    state.enemies = [{ id: 'sala:s', type: 'slime', x: state.player.x, y: state.player.y, hp: 2, vx: 0, vy: 0, timer: 5000, hurt: 0, charge: 0, phase: 0 }]
    const events = run(state, IDLE, 2)
    expect(state.over).toBe('dead')
    expect(events.some((e) => e.type === 'dead')).toBe(true)
  })

  it('el mandoble tiene alcance delante y no detrás', () => {
    const state = createGame()
    state.player.x = 80
    state.player.y = 72
    state.player.dir = 'right'
    const box = swordBox(state.player)
    expect(box.x0).toBeGreaterThanOrEqual(state.player.x)
    expect(box.x1).toBeGreaterThan(state.player.x + 10)
  })
})

describe('llaves, puertas y final', () => {
  it('la puerta cerrada no cede sin llave y se abre con ella', () => {
    const state = createGame()
    goTo(state, 'sala', 5, 1)
    run(state, { dx: 0, dy: -1, action: false }, 40)
    expect(state.room).toBe('sala')
    expect(state.message.key).toBe('locked')
    state.player.keys = 1
    state.message = null
    run(state, { dx: 0, dy: -1, action: false }, 80)
    expect(state.doors.size).toBe(1)
    expect(state.player.keys).toBe(0)
    expect(state.room).toBe('jefe')
  })

  it('el cofre del cristal solo aparece cuando cae el jefe, y abrirlo gana', () => {
    const state = createGame()
    state.room = 'jefe'
    state.enemies = [{ id: 'jefe:0', type: 'boss', x: 80, y: 60, hp: 3, vx: 0, vy: 0, timer: 0, hurt: 0, charge: 0, phase: 0 }]
    expect(chestAt(state, 5, 1)).toBe(null)
    expect(tileChar(state, 5, 1)).toBe('.')
    state.enemies = []
    expect(chestAt(state, 5, 1)).toBeTruthy()
    place(state, 5, 2, 'up')
    const events = run(state, { ...IDLE, action: true })
    expect(state.over).toBe('won')
    expect(events.some((e) => e.type === 'win')).toBe(true)
  })

  it('el sabio habla distinto según lo que se tenga', () => {
    const state = createGame()
    goTo(state, 'aldea', 3, 3)
    state.player.dir = 'up'
    run(state, { ...IDLE, action: true })
    expect(state.dialog.lines).toEqual(['sageHello1', 'sageHello2'])
    run(state, { ...IDLE, action: true })
    run(state, { ...IDLE, action: true })
    expect(state.dialog).toBe(null)
    state.player.sword = true
    run(state, { ...IDLE, action: true })
    expect(state.dialog.lines).toEqual(['sageSword'])
  })

  it('con el diálogo abierto el juego se detiene', () => {
    const state = createGame()
    goTo(state, 'aldea', 3, 3)
    state.player.dir = 'up'
    run(state, { ...IDLE, action: true })
    const { x } = state.player
    run(state, { dx: 1, dy: 0, action: false }, 20)
    expect(state.player.x).toBe(x)
  })

  it('la partida empieza donde dice el mundo', () => {
    const state = createGame()
    expect(state.room).toBe(START.room)
  })
})

describe('textos', () => {
  it('cada mensaje y línea del sabio tiene texto en español e inglés', () => {
    const { es, en } = retroCopyKeys()
    expect(es.sort()).toEqual(en.sort())
    ;['gotSword', 'gotKey', 'gotCrystal', 'locked', 'needSword', 'doorOpened', 'sageHello1', 'sageHello2', 'sageSword', 'sageWon'].forEach((key) => expect(es).toContain(key))
  })
})
