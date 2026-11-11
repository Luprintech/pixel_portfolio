import { describe, expect, it } from 'vitest'
import { ARCADE_COPY } from '../../../lib/arcadeCopy.js'
import { FIELD, blockAt, chestAt, createGame, loadRoom, plates, result, scoreOf, step, swordBox, tileChar, view, wizardTile } from './logic.js'
import { BOSS_PHASES, COLS, ENEMIES, ROOMS, ROWS, START, TILE } from './world.js'

const IDLE = { dx: 0, dy: 0, action: false }
const centre = (tile) => (tile + 0.5) * TILE

// Avanza `frames` fotogramas de 16 ms con una entrada fija y devuelve los sucesos de todos.
function run(state, input, frames = 1) {
  const events = []
  for (let i = 0; i < frames; i++) events.push(...step(state, i === 0 ? input : { ...input, action: false }, 16))
  return events
}

// Un juego con la presentación del mago ya hecha, para probar el resto.
function fresh() {
  const state = createGame()
  state.intro = 'done'
  return state
}

function place(state, col, row, dir = 'down') {
  state.player.x = centre(col)
  state.player.y = centre(row)
  state.player.dir = dir
}

// Coloca a la viajera en una sala ya cargada (con sus enemigos, bloques y monedas).
function goTo(state, room, col, row, { clear = true } = {}) {
  loadRoom(state, room)
  if (clear) state.enemies = []
  place(state, col, row)
}

const walkable = (ch) => '.FCS'.includes(ch)

// Casillas a las que se llega a pie desde (col, row), sin atravesar muros ni obstáculos. Puertas y rejas cuentan como paso.
function reach(room, col, row) {
  const seen = new Set([`${col},${row}`])
  const queue = [[col, row]]
  while (queue.length) {
    const [c, r] = queue.shift()
    ;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dc, dr]) => {
      const nc = c + dc
      const nr = r + dr
      const ch = ROOMS[room].map[nr]?.[nc]
      if (!ch || seen.has(`${nc},${nr}`) || !(walkable(ch) || 'LGU'.includes(ch))) return
      seen.add(`${nc},${nr}`)
      queue.push([nc, nr])
    })
  }
  return seen
}

describe('mundo', () => {
  it('cada mapa mide 15×11 y solo usa símbolos conocidos', () => {
    Object.entries(ROOMS).forEach(([id, room]) => {
      expect(room.map.length, id).toBe(ROWS)
      room.map.forEach((line) => {
        expect(line.length, id).toBe(COLS)
        expect(line).toMatch(/^[.FTRB~#PWCLGUS]+$/)
      })
    })
  })

  it('hay cinco salas conectadas y la aventura empieza en el claro del mago', () => {
    expect(Object.keys(ROOMS)).toEqual(['bosque', 'limos', 'cueva', 'acertijo', 'jefe'])
    expect(START.room).toBe('bosque')
    expect(wizardTile('bosque')).toEqual({ col: 3, row: 2 })
    expect(wizardTile('limos')).toBeNull()
  })

  it('los enlaces entre salas son de ida y vuelta y caen en un hueco abierto', () => {
    const opposite = { left: 'right', right: 'left', up: 'down', down: 'up' }
    const target = (link) => (typeof link === 'string' ? link : link.room)
    Object.entries(ROOMS).forEach(([id, room]) => {
      Object.entries(room.links ?? {}).forEach(([dir, link]) => {
        const back = ROOMS[target(link)].links?.[opposite[dir]]
        expect(back && target(back), `${id} ${dir}`).toBe(id)
        const edge = { left: [0, 5], right: [COLS - 1, 5] }[dir]
        if (edge) expect('.LG'.includes(room.map[edge[1]][edge[0]]), `${id} ${dir} hueco`).toBe(true)
      })
    })
  })

  it('cada cofre está sobre una casilla C, cada escalera sobre una U, y enemigos, monedas y bloques sobre suelo', () => {
    Object.entries(ROOMS).forEach(([id, room]) => {
      ;(room.chests ?? []).forEach((c) => expect(room.map[c.row][c.col], `${id} cofre`).toBe('C'))
      Object.keys(room.stairs ?? {}).forEach((key) => {
        const [col, row] = key.split(',').map(Number)
        expect(room.map[row][col], `${id} escalera`).toBe('U')
        const target = room.stairs[key]
        expect(ROOMS[target.room].map[target.y][target.x], `${id} destino`).toBe('.')
      })
      ;[...(room.enemies ?? []), ...(room.coins ?? []), ...(room.blocks ?? [])].forEach(({ col, row }) => expect(walkable(room.map[row][col]), `${id} ${col},${row}`).toBe(true))
    })
  })

  it('se puede llegar a pie a todo lo que importa de cada sala', () => {
    const bosque = reach('bosque', START.x, START.y)
    expect(bosque.has('12,3'), 'ante el cofre de la espada').toBe(true)
    expect(bosque.has('4,2'), 'junto al mago').toBe(true)
    expect(bosque.has(`${COLS - 1},5`), 'salida al bosque de los limos').toBe(true)
    const limos = reach('limos', 0, 5)
    expect(limos.has('7,0'), 'cueva').toBe(true)
    ROOMS.limos.coins.forEach(({ col, row }) => expect(limos.has(`${col},${row}`), `moneda ${col},${row}`).toBe(true))
    const cueva = reach('cueva', 7, 9)
    expect(cueva.has('1,2'), 'ante el cofre de la llave').toBe(true)
    expect(cueva.has(`${COLS - 2},5`), 'ante la puerta').toBe(true)
    ROOMS.cueva.coins.forEach(({ col, row }) => expect(cueva.has(`${col},${row}`), `moneda ${col},${row}`).toBe(true))
    const acertijo = reach('acertijo', 0, 5)
    plates('acertijo').forEach(({ col, row }) => expect(acertijo.has(`${col},${row}`)).toBe(true))
    expect(acertijo.has(`${COLS - 1},5`), 'ante la reja').toBe(true)
  })

  it('los bloques del acertijo tienen su placa en su fila, y hay tantas placas como bloques', () => {
    const blocks = ROOMS.acertijo.blocks
    const spots = plates('acertijo')
    expect(spots.length).toBe(blocks.length)
    blocks.forEach((block) => expect(spots.some((plate) => plate.row === block.row && plate.col > block.col)).toBe(true))
  })
})

describe('el mago', () => {
  it('no habla hasta que la viajera se acerca: primero le sale la exclamación de misión y luego habla', () => {
    const state = createGame()
    expect(state.dialog).toBeNull()
    expect(view(state).bubble).toBeNull()
    expect(view(state).quest).toBe(false)
    // Lejos de él, la viajera anda con libertad y el mago calla.
    run(state, { dx: 1, dy: 0, action: false }, 10)
    expect(state.player.x).toBeGreaterThan(centre(7))
    expect(state.dialog).toBeNull()
    place(state, 5, 3)
    const events = run(state, IDLE, 2)
    expect(events.map((e) => e.type)).toContain('quest')
    expect(view(state).quest).toBe(true)
    expect(view(state).bubble).toBeNull()
    // Mientras sale la exclamación no se mueve, y al acabar empieza a hablar.
    const x = state.player.x
    run(state, { dx: 1, dy: 0, action: false }, 10)
    expect(state.player.x).toBe(x)
    run(state, IDLE, 60)
    expect(view(state).quest).toBe(false)
    expect(view(state).bubble).toMatchObject({ key: 'wizIntro1', more: true })
    const { bubble } = view(state)
    expect(bubble.x).toBe(centre(3))
    expect(bubble.y).toBeLessThan(16 + 2 * TILE)
    run(state, { ...IDLE, action: true })
    expect(view(state).bubble.key).toBe('wizIntro2')
    run(state, { ...IDLE, action: true }, 1)
    run(state, { ...IDLE, action: true }, 1)
    expect(view(state).bubble).toMatchObject({ key: 'wizIntro4', more: false })
    run(state, { ...IDLE, action: true })
    expect(state.dialog).toBeNull()
    expect(state.intro).toBe('done')
  })

  it('si intenta salir de la sala sin haber hablado con él, la llevan hasta el mago', () => {
    const state = createGame()
    place(state, 13, 5)
    state.player.x = FIELD.width - 1
    run(state, { dx: 1, dy: 0, action: false }, 1)
    expect(state.room).toBe('bosque')
    expect(state.intro).toBe('escort')
    const events = []
    for (let i = 0; i < 400 && state.intro !== 'done'; i++) events.push(...step(state, IDLE, 16))
    expect(events.map((e) => e.type)).toContain('quest')
    expect(state.room).toBe('bosque')
    expect(state.player.x).toBe(centre(3))
    expect(state.player.y).toBe(centre(3))
    expect(state.dialog?.lines[0]).toBe('wizIntro1')
  })

  it('el aviso de misión suena y tiene su sonido', async () => {
    const { ARCADE_SOUNDS } = await import('../../../lib/arcadeSound.js')
    expect(ARCADE_SOUNDS.quest.length).toBeGreaterThan(1)
  })

  it('habla de la espada hasta que se tiene y, después, de lo que sigue', () => {
    const state = fresh()
    goTo(state, 'bosque', 4, 2, { clear: false })
    state.player.dir = 'left'
    run(state, { ...IDLE, action: true })
    expect(state.dialog.lines[0]).toBe('wizHello1')
    state.dialog = null
    state.player.sword = true
    state.player.cooldown = 0
    state.player.dir = 'left'
    run(state, { ...IDLE, action: true })
    expect(state.dialog.lines[0]).toBe('wizSword1')
  })
})

describe('movimiento y espada', () => {
  it('no atraviesa árboles ni muros y se desliza por ellos', () => {
    const state = fresh()
    place(state, 1, 5, 'left')
    run(state, { dx: -1, dy: 0, action: false }, 60)
    expect(state.player.x).toBeGreaterThanOrEqual(TILE + 5)
    place(state, 1, 1, 'up')
    run(state, { dx: 0, dy: -1, action: false }, 40)
    expect(state.player.y).toBeGreaterThanOrEqual(TILE + 5)
    expect(tileChar(state, 1, 0)).toBe('T')
    // Contra un muro en diagonal avanza por el eje que queda libre.
    place(state, 1, 4, 'left')
    const y = state.player.y
    run(state, { dx: -1, dy: 1, action: false }, 40)
    expect(state.player.x).toBeGreaterThanOrEqual(TILE + 5)
    expect(state.player.y).toBeGreaterThan(y)
  })

  it('sin espada no se sale del claro y el aviso lo explica', () => {
    const state = fresh()
    place(state, 13, 5, 'right')
    run(state, { dx: 1, dy: 0, action: false }, 80)
    expect(state.room).toBe('bosque')
    expect(state.message.key).toBe('noSwordExit')
    expect(state.player.x).toBeLessThan(FIELD.width)
  })

  it('con el cofre del claro se consigue la espada y se puede salir', () => {
    const state = fresh()
    place(state, 12, 3, 'up')
    const events = run(state, { ...IDLE, action: true })
    expect(state.player.sword).toBe(true)
    expect(events.map((e) => e.type)).toContain('chest')
    expect(state.message.key).toBe('gotSword')
    place(state, 13, 5, 'right')
    run(state, { dx: 1, dy: 0, action: false }, 80)
    expect(state.room).toBe('limos')
    expect(state.player.x).toBeLessThan(120)
  })

  it('sin espada, pulsar la acción solo avisa; con ella, blande y la caja queda delante', () => {
    const state = fresh()
    state.player.cooldown = 0
    expect(run(state, { ...IDLE, action: true }).map((e) => e.type)).not.toContain('swing')
    expect(state.message.key).toBe('needSword')
    state.player.sword = true
    state.player.cooldown = 0
    state.player.dir = 'right'
    expect(run(state, { ...IDLE, action: true }).map((e) => e.type)).toContain('swing')
    const box = swordBox(state.player)
    expect(box.x0).toBeGreaterThan(state.player.x)
    expect(state.player.swing).toBeGreaterThan(0)
  })

  it('durante el mandoble no anda y entre golpes hay una pausa', () => {
    const state = fresh()
    state.player.sword = true
    run(state, { ...IDLE, action: true })
    const x = state.player.x
    run(state, { dx: 1, dy: 0, action: false }, 5)
    expect(state.player.x).toBe(x)
    expect(state.player.cooldown).toBeGreaterThan(0)
  })
})

describe('enemigos y daño', () => {
  function duel(type = 'slime') {
    const state = fresh()
    state.player.sword = true
    goTo(state, 'limos', 7, 5, { clear: false })
    state.enemies = [{ id: 'x:0', type, x: centre(8), y: centre(5), hp: ENEMIES[type].hp, vx: 0, vy: 0, timer: 9999, hurt: 0, charge: 0, phase: 0, mode: 'idle', stage: 0, dirX: 0, dirY: 0, minion: false, boss: false }]
    state.player.dir = 'right'
    state.player.hurt = 0
    return state
  }

  it('un limo aguanta dos golpes y un murciélago uno; al caer cuentan para el marcador', () => {
    const state = duel('slime')
    run(state, { ...IDLE, action: true })
    expect(state.enemies[0].hp).toBe(1)
    state.player.cooldown = 0
    state.hitThisSwing = new Set()
    state.player.swing = 0
    state.enemies[0].hurt = 0
    state.enemies[0].x = centre(8)
    const events = run(state, { ...IDLE, action: true })
    expect(events.map((e) => e.type)).toContain('kill')
    expect(state.enemies.length).toBe(0)
    expect(state.kills).toBe(1)
    const bat = duel('bat')
    run(bat, { ...IDLE, action: true })
    expect(bat.enemies.length).toBe(0)
  })

  it('un mismo mandoble no golpea dos veces al mismo enemigo', () => {
    const state = duel('slime')
    run(state, { ...IDLE, action: true }, 10)
    expect(state.enemies[0].hp).toBe(1)
  })

  it('el contacto hace daño y deja un segundo largo de invulnerabilidad', () => {
    const state = duel('slime')
    state.player.sword = false
    state.enemies[0].x = state.player.x
    state.enemies[0].y = state.player.y
    const events = run(state, IDLE)
    expect(events.map((e) => e.type)).toContain('hurt')
    expect(state.player.hp).toBe(state.player.maxHp - 1)
    expect(state.player.hurt).toBeGreaterThan(1000)
    state.enemies[0].x = state.player.x
    state.enemies[0].y = state.player.y
    run(state, IDLE, 20)
    expect(state.player.hp).toBe(state.player.maxHp - 1)
  })

  it('al llegar a cero corazones cae, y la acción la devuelve al punto de control con todos los corazones', () => {
    const state = duel('slime')
    state.checkpoint = { room: 'limos', x: centre(1), y: centre(5) }
    state.player.hp = 1
    state.enemies[0].x = state.player.x
    state.enemies[0].y = state.player.y
    const events = run(state, IDLE)
    expect(events.map((e) => e.type)).toContain('dead')
    expect(state.over).toBe('dead')
    expect(view(state).status).toBe('dead')
    run(state, { dx: 1, dy: 0, action: false }, 10)
    expect(state.over).toBe('dead')
    run(state, { ...IDLE, action: true })
    expect(state.over).toBeNull()
    expect(state.player.hp).toBe(state.player.maxHp)
    expect(state.player.x).toBe(centre(1))
    expect(state.player.hurt).toBeGreaterThan(0)
    expect(state.deaths).toBe(1)
  })

  it('un corazón suelto cura y una moneda suma, y las monedas de la sala no se repiten', () => {
    const state = fresh()
    goTo(state, 'limos', 2, 1)
    state.player.hp = 2
    state.pickups.push({ type: 'heart', id: null, x: state.player.x, y: state.player.y })
    run(state, IDLE)
    expect(state.player.hp).toBe(3)
    expect(state.player.coins).toBe(1)
    expect(state.taken.has('limos:2,1')).toBe(true)
    loadRoom(state, 'limos')
    expect(state.pickups.some((p) => p.id === 'limos:2,1')).toBe(false)
  })

  it('los enemigos vencidos no vuelven al regresar a la sala', () => {
    const state = fresh()
    loadRoom(state, 'limos')
    state.killed.add('limos:0')
    loadRoom(state, 'limos')
    expect(state.enemies.map((e) => e.id)).not.toContain('limos:0')
    expect(state.enemies.length).toBe(ROOMS.limos.enemies.length - 1)
  })

  it('el limo salta a medias: para media vuelta y se mueve la otra', () => {
    const state = duel('slime')
    state.enemies[0].vx = 1
    state.enemies[0].timer = 9999
    state.time = 0
    const x0 = state.enemies[0].x
    let moving = 0
    for (let i = 0; i < 60; i++) {
      const before = state.enemies[0].x
      step(state, IDLE, 16)
      state.player.hurt = 5000
      if (state.enemies[0].x !== before) moving += 1
    }
    expect(state.enemies[0].x).toBeGreaterThan(x0)
    expect(moving).toBeGreaterThan(10)
    expect(moving).toBeLessThan(55)
  })
})

describe('llaves, puertas y puntos de control', () => {
  it('la puerta de la cueva se abre con una llave y avisa si no se tiene', () => {
    const state = fresh()
    goTo(state, 'cueva', 13, 5)
    expect(run(state, { dx: 1, dy: 0, action: false }, 6).map((e) => e.type)).toContain('locked')
    expect(state.message.key).toBe('locked')
    state.message = null
    state.player.keys = 1
    const events = run(state, { dx: 1, dy: 0, action: false }, 6)
    expect(events.map((e) => e.type)).toContain('door')
    expect(state.player.keys).toBe(0)
    run(state, { dx: 1, dy: 0, action: false }, 40)
    expect(state.room).toBe('acertijo')
  })

  it('el cofre de la cueva da la llave', () => {
    const state = fresh()
    goTo(state, 'cueva', 1, 2)
    state.player.dir = 'up'
    run(state, { ...IDLE, action: true })
    expect(state.player.keys).toBe(1)
    expect(chestAt(state, 1, 1).item).toBe('key')
    state.player.cooldown = 0
    run(state, { ...IDLE, action: true })
    expect(state.player.keys).toBe(1)
  })

  it('cada sala nueva guarda un punto de control y volver atrás no lo retrasa', () => {
    const state = fresh()
    state.player.sword = true
    place(state, 13, 5, 'right')
    const events = run(state, { dx: 1, dy: 0, action: false }, 80)
    expect(events.map((e) => e.type)).toContain('checkpoint')
    expect(state.checkpoint.room).toBe('limos')
    goTo(state, 'limos', 7, 1)
    state.player.y = centre(0)
    run(state, IDLE)
    expect(state.room).toBe('cueva')
    expect(state.checkpoint.room).toBe('cueva')
    state.player.x = centre(7)
    state.player.y = centre(10)
    run(state, IDLE)
    expect(state.room).toBe('limos')
    expect(state.checkpoint.room).toBe('cueva')
  })

  it('al caer en el jefe se reaparece en la sala del jefe con él entero y lo ya hecho se conserva', () => {
    const state = fresh()
    state.checkpoint = { room: 'jefe', x: centre(1), y: centre(5) }
    state.solved.add('acertijo')
    state.doors.add('cueva:14,5')
    state.player.keys = 0
    state.over = 'dead'
    run(state, { ...IDLE, action: true })
    expect(state.room).toBe('jefe')
    expect(state.enemies[0].boss).toBe(true)
    expect(state.enemies[0].hp).toBe(ENEMIES.boss.hp)
    expect(state.solved.has('acertijo')).toBe(true)
  })
})

// Camina hacia la derecha empujando hasta que hay un bloque en (col, row), y para justo ahí (si no, seguiría empujándolo).
function pushUntil(state, col, row) {
  const events = []
  for (let i = 0; i < 700 && !blockAt(state, col, row); i++) events.push(...step(state, { dx: 1, dy: 0, action: false }, 16))
  return events
}

describe('acertijo de los bloques', () => {
  function puzzle() {
    const state = fresh()
    goTo(state, 'acertijo', 3, 3)
    return state
  }

  it('empujar un bloque lo mueve una casilla en su fila', () => {
    const state = puzzle()
    state.player.dir = 'right'
    const events = run(state, { dx: 1, dy: 0, action: false }, 40)
    expect(events.map((e) => e.type)).toContain('push')
    expect(blockAt(state, 5, 3)).toBe(true)
    expect(blockAt(state, 4, 3)).toBe(false)
  })

  it('un bloque no atraviesa un pilar ni sale del mapa', () => {
    const state = fresh()
    goTo(state, 'acertijo', 4, 1)
    state.blocks = [{ col: 6, row: 1 }]
    place(state, 5, 1, 'right')
    state.blocks = [{ col: 6, row: 1 }]
    run(state, { dx: 1, dy: 0, action: false }, 400)
    expect(blockAt(state, 13, 1)).toBe(true)
    expect(state.blocks[0].col).toBe(13)
    const pillar = fresh()
    goTo(pillar, 'acertijo', 5, 2)
    pillar.blocks = [{ col: 5, row: 3 }]
    place(pillar, 5, 2, 'down')
    run(pillar, { dx: 0, dy: 1, action: false }, 200)
    expect(pillar.blocks[0].row).toBeGreaterThanOrEqual(3)
  })

  it('con los dos bloques sobre las placas se abre la reja y se puede pasar al jefe', () => {
    const state = puzzle()
    // Primer bloque hasta su placa.
    state.player.dir = 'right'
    pushUntil(state, 10, 3)
    expect(blockAt(state, 10, 3)).toBe(true)
    expect(state.solved.has('acertijo')).toBe(false)
    expect(run(state, IDLE).map((e) => e.type)).not.toContain('gate')
    // El segundo.
    place(state, 3, 7, 'right')
    const events = pushUntil(state, 10, 7)
    expect(blockAt(state, 10, 7)).toBe(true)
    expect(events.map((e) => e.type)).toContain('gate')
    expect(state.solved.has('acertijo')).toBe(true)
    place(state, 13, 5, 'right')
    run(state, { dx: 1, dy: 0, action: false }, 80)
    expect(state.room).toBe('jefe')
  })

  it('con la reja cerrada no se pasa y avisa', () => {
    const state = fresh()
    goTo(state, 'acertijo', 13, 5)
    const events = run(state, { dx: 1, dy: 0, action: false }, 10)
    expect(events.map((e) => e.type)).toContain('locked')
    expect(state.message.key).toBe('gateShut')
    expect(state.room).toBe('acertijo')
  })

  it('si un bloque se atasca, salir y volver a entrar lo devuelve a su sitio; resuelto, se queda en las placas', () => {
    const state = puzzle()
    state.blocks[0].col = 13
    state.blocks[0].row = 1
    loadRoom(state, 'acertijo')
    expect(state.blocks).toEqual(ROOMS.acertijo.blocks)
    state.solved.add('acertijo')
    loadRoom(state, 'acertijo')
    expect(state.blocks).toEqual(plates('acertijo'))
  })
})

describe('el Rey Limo', () => {
  function arena() {
    const state = fresh()
    state.player.sword = true
    goTo(state, 'jefe', 5, 5, { clear: false })
    state.player.hurt = 0
    return state
  }
  const boss = (state) => state.enemies.find((e) => e.boss)

  it('es un solo jefe, con vida suficiente y tres fases con vida decreciente', () => {
    const state = arena()
    expect(state.enemies.length).toBe(1)
    expect(boss(state).hp).toBe(ENEMIES.boss.hp)
    expect(BOSS_PHASES.length).toBe(3)
    expect([...BOSS_PHASES].sort((a, b) => b - a)).toEqual(BOSS_PHASES)
    expect(BOSS_PHASES[0]).toBe(ENEMIES.boss.hp)
  })

  it('avisa antes de embestir: espera, parpadea (aviso), embiste en línea recta y descansa', () => {
    const state = arena()
    const b = boss(state)
    const seen = []
    for (let i = 0; i < 400; i++) {
      step(state, IDLE, 16)
      state.player.hurt = 5000
      if (seen.at(-1) !== b.mode) seen.push(b.mode)
    }
    expect(seen.slice(0, 5)).toEqual(['idle', 'windup', 'dash', 'rest', 'idle'])
  })

  it('al bajar de vida cambia de fase: se detiene (no se le puede herir), avisa y, en la última, llama a limos pequeños', () => {
    const state = arena()
    const b = boss(state)
    state.player.dir = 'right'
    b.x = state.player.x + 20
    b.y = state.player.y
    b.hp = BOSS_PHASES[1] + 1
    b.mode = 'rest'
    b.timer = 5000
    const events = run(state, { ...IDLE, action: true })
    expect(b.hp).toBe(BOSS_PHASES[1])
    expect(b.stage).toBe(1)
    expect(b.mode).toBe('stun')
    expect(events.map((e) => e.type)).toContain('phase')
    expect(state.message.key).toBe('bossPhase2')
    // En pleno respiro un golpe rebota: no baja su vida.
    state.player.cooldown = 0
    state.player.swing = 0
    state.hitThisSwing = new Set()
    const blocked = run(state, { ...IDLE, action: true })
    expect(blocked.map((e) => e.type)).toContain('block')
    expect(b.hp).toBe(BOSS_PHASES[1])
    // Tercera fase: dos limos pequeños.
    b.mode = 'rest'
    b.hp = BOSS_PHASES[2] + 1
    state.player.cooldown = 0
    state.player.swing = 0
    state.hitThisSwing = new Set()
    run(state, { ...IDLE, action: true })
    expect(b.stage).toBe(2)
    expect(state.enemies.filter((e) => e.minion).length).toBe(2)
  })

  it('desde la segunda fase lanza bolas al terminar la embestida, y el escudo las frena de frente', () => {
    const state = arena()
    const b = boss(state)
    b.stage = 1
    b.mode = 'dash'
    b.timer = 1
    b.dirX = 0
    b.dirY = 0
    b.x = centre(11)
    b.y = centre(5)
    run(state, IDLE, 2)
    expect(state.shots.length).toBe(3)
    // Una bola que viene de frente choca con el escudo y no hace daño.
    state.shots = [{ x: state.player.x + 6, y: state.player.y, vx: -72, vy: 0 }]
    state.player.dir = 'right'
    state.player.hurt = 0
    const events = run(state, IDLE)
    expect(events.map((e) => e.type)).toContain('block')
    expect(state.player.hp).toBe(state.player.maxHp)
    // Por la espalda sí duele.
    state.shots = [{ x: state.player.x + 6, y: state.player.y, vx: -72, vy: 0 }]
    state.player.dir = 'left'
    run(state, IDLE)
    expect(state.player.hp).toBe(state.player.maxHp - 1)
  })

  it('el anillo de la última fase lanza ocho bolas y la espada puede deshacerlas', () => {
    const state = arena()
    const b = boss(state)
    b.stage = 2
    b.mode = 'dash'
    b.timer = 1
    b.x = centre(11)
    b.y = centre(5)
    run(state, IDLE, 2)
    expect(state.shots.length).toBe(8)
    state.shots = [{ x: state.player.x + 12, y: state.player.y, vx: -10, vy: 0 }]
    state.player.dir = 'right'
    state.player.cooldown = 0
    state.player.hurt = 5000
    const events = run(state, { ...IDLE, action: true })
    expect(events.map((e) => e.type)).toContain('hit')
    expect(state.shots.length).toBe(0)
  })

  it('al vencerlo hay una escena: aparece el cristal, se puede saltar tras un rato y acaba con victoria', () => {
    const state = arena()
    const b = boss(state)
    state.player.dir = 'right'
    b.x = state.player.x + 20
    b.y = state.player.y
    b.hp = 1
    b.mode = 'rest'
    b.timer = 5000
    const types = []
    types.push(...run(state, { ...IDLE, action: true }).map((e) => e.type))
    expect(types).toContain('bossDown')
    expect(state.victory).toBeTruthy()
    expect(state.enemies.length).toBe(0)
    expect(state.over).toBeNull()
    // Aún no se puede saltar.
    run(state, { ...IDLE, action: true })
    expect(state.over).toBeNull()
    for (let i = 0; i < 160; i++) types.push(...run(state, IDLE).map((e) => e.type))
    expect(types).toContain('crystal')
    expect(state.victory.crystal).toBe(true)
    expect(state.over).toBeNull()
    types.push(...run(state, { ...IDLE, action: true }).map((e) => e.type))
    expect(state.over).toBe('won')
    expect(types).toContain('win')
    expect(view(state).status).toBe('won')
    const done = result(state)
    expect(done.won).toBe(true)
    expect(done.score).toBe(scoreOf(state))
    expect(done.reward).toBe('crystal')
    expect(done.score).toBeGreaterThanOrEqual(700)
  })

  it('durante la victoria no se puede perder', () => {
    const state = arena()
    state.victory = { ms: 0, crystal: false }
    state.enemies = []
    state.shots = [{ x: state.player.x, y: state.player.y, vx: 0, vy: 0 }]
    run(state, IDLE, 5)
    expect(state.player.hp).toBe(state.player.maxHp)
  })
})

describe('textos', () => {
  const messages = ['needSword', 'noSwordExit', 'gotSword', 'gotKey', 'locked', 'doorOpened', 'gateShut', 'gateOpen', 'puzzleHint', 'checkpoint', 'respawn', 'bossPhase2', 'bossPhase3', 'gotCrystal']
  const dialogue = ['wizIntro1', 'wizIntro2', 'wizIntro3', 'wizIntro4', 'wizHello1', 'wizHello2', 'wizSword1', 'wizSword2']

  it('cada mensaje y cada página del mago tiene su texto en español e inglés', () => {
    ;['es', 'en'].forEach((lang) => {
      ;[...messages, ...dialogue].forEach((key) => expect(ARCADE_COPY[lang].lines[key], `${lang} ${key}`).toBeTruthy())
    })
  })
})
