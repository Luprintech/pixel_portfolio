import { describe, expect, it } from 'vitest'
import { ARCADE_COPY } from '../../../lib/arcadeCopy.js'
import { BRIDGE_ROW, KINDS, LANDING_RUNWAY, LAND_ZONE_START, LEVEL_END, SECTIONS, SECTION_LEN, W, boxOf, bridgeY, buildObjects, riverAt } from './level.js'
import { createGame, result, step, touchesBank, view } from './logic.js'

const IDLE = { dx: 0, dy: 0, action: false, hold: false }

function run(state, input, frames = 1, dt = 16) {
  const events = []
  for (let i = 0; i < frames; i++) events.push(...step(state, input, dt))
  return events
}
const types = (events) => events.map((e) => e.type)

// Una partida ya despegada, en vuelo y sin objetos por delante, para probar una cosa cada vez.
function flying(seed = 5) {
  const state = createGame(seed)
  run(state, { ...IDLE, action: true })
  run(state, IDLE, 200)
  state.plane.invul = 0
  state.objects = []
  state.banner = null
  return state
}

// Pone la avioneta en mitad del río a la altura en que está, para que un choque no venga de la orilla sin que se quiera.
function centred(state) {
  const { left, right } = riverAt(state.seed, state.dist)
  state.plane.x = (left + right) / 2
  return state
}

describe('el nivel', () => {
  it('el río es siempre el mismo para la misma semilla y distinto para otra', () => {
    expect(riverAt(5, 1234)).toEqual(riverAt(5, 1234))
    expect(riverAt(5, 1234)).not.toEqual(riverAt(9, 1234))
    expect(buildObjects(5)).toEqual(buildObjects(5))
  })

  it('el cauce nunca es más estrecho de 80 px ni se sale de la pantalla, en toda la longitud', () => {
    for (let wy = -120; wy < LEVEL_END; wy += 7) {
      const { left, right } = riverAt(5, wy)
      expect(right - left, `y=${wy}`).toBeGreaterThanOrEqual(80)
      expect(left, `y=${wy}`).toBeGreaterThanOrEqual(2)
      expect(right, `y=${wy}`).toBeLessThanOrEqual(W - 2)
    }
  })

  it('hay cinco puentes, uno al final de cada tramo, sobre un tramo recto, y las pistas son anchas', () => {
    const bridges = buildObjects(5).filter((o) => o.type === 'bridge')
    expect(bridges.map((b) => b.wy)).toEqual(Array.from({ length: SECTIONS }, (_, s) => bridgeY(s)))
    bridges.forEach((b) => {
      const { left, right } = riverAt(5, b.wy)
      expect((left + right) / 2).toBeCloseTo(W / 2, 0)
      expect(right - left).toBeLessThan(150)
    })
    const start = riverAt(5, 40)
    expect(start.right - start.left).toBeGreaterThan(200)
    const land = riverAt(5, LANDING_RUNWAY.y0 + 50)
    expect(land.right - land.left).toBeGreaterThan(200)
    expect(LAND_ZONE_START).toBeGreaterThan(bridgeY(SECTIONS - 1))
  })

  it('los objetivos del agua caen dentro del cauce, las casitas en la orilla y las islas dejan paso a ambos lados', () => {
    buildObjects(5).forEach((o) => {
      if (o.type === 'bridge') return
      const { left, right } = riverAt(5, o.wy)
      if (o.type === 'house') {
        expect(o.x < left || o.x > right, `casa ${o.wy}`).toBe(true)
      } else if (o.type === 'island') {
        expect(o.x - o.hw - left, `isla ${o.wy}`).toBeGreaterThanOrEqual(30)
        expect(right - (o.x + o.hw), `isla ${o.wy}`).toBeGreaterThanOrEqual(30)
      } else if (o.type !== 'jet') {
        expect(o.x - KINDS[o.type].hw, `${o.type} ${o.wy}`).toBeGreaterThanOrEqual(left)
        expect(o.x + KINDS[o.type].hw, `${o.type} ${o.wy}`).toBeLessThanOrEqual(right)
      }
    })
  })

  it('cada tramo tiene depósitos de combustible a poca distancia entre sí y más peligros que el anterior', () => {
    const objects = buildObjects(5)
    const per = Array.from({ length: SECTIONS }, (_, s) => objects.filter((o) => o.wy >= s * SECTION_LEN && o.wy < (s + 1) * SECTION_LEN))
    per.forEach((list, s) => {
      const tanks = list.filter((o) => o.type === 'tank').map((o) => o.wy)
      expect(tanks.length, `tramo ${s}`).toBeGreaterThanOrEqual(3)
      for (let i = 1; i < tanks.length; i++) expect(tanks[i] - tanks[i - 1], `tramo ${s}`).toBeLessThanOrEqual(600)
    })
    const danger = (list) => list.filter((o) => ['jet', 'mine', 'heli'].includes(o.type)).length
    expect(danger(per[4])).toBeGreaterThan(danger(per[0]))
    expect(per[0].some((o) => o.type === 'jet')).toBe(false)
  })

  it('cada caja de un objeto tiene tamaño y el puente ocupa todo el ancho', () => {
    buildObjects(5).forEach((o) => {
      const box = boxOf(o)
      expect(box.x1).toBeGreaterThan(box.x0)
      expect(box.y1).toBeGreaterThan(box.y0)
    })
    const bridge = buildObjects(5).find((o) => o.type === 'bridge')
    expect(boxOf(bridge).y1 - boxOf(bridge).y0).toBe(BRIDGE_ROW)
  })
})

describe('despegue', () => {
  it('espera en la pista hasta que se pulsa la acción y entonces despega sin poder chocar ni disparar', () => {
    const state = createGame()
    expect(state.phase).toBe('ready')
    expect(view(state).message).toBe('rTakeoff')
    run(state, { ...IDLE, dx: 1 }, 30)
    expect(state.dist).toBe(0)
    const events = run(state, { ...IDLE, action: true })
    expect(types(events)).toContain('takeoff')
    expect(state.phase).toBe('takeoff')
    const speeds = []
    for (let i = 0; i < 60; i++) {
      step(state, IDLE, 16)
      speeds.push(state.speed)
    }
    expect(speeds.at(-1)).toBeGreaterThan(speeds[0])
    expect(state.plane.lift).toBeGreaterThan(0)
    expect(state.bullets.length).toBe(0)
    run(state, IDLE, 120)
    expect(state.phase).toBe('fly')
    expect(state.plane.lift).toBe(1)
  })
})

describe('vuelo', () => {
  it('la avioneta gira a los lados sin salir de la pantalla y sube o baja de velocidad sin pararse', () => {
    const state = flying()
    state.dist = 100
    const x = state.plane.x
    run(state, { ...IDLE, dx: 1 }, 10)
    expect(state.plane.x).toBeGreaterThan(x)
    const base = state.speed
    run(state, { ...IDLE, dy: -1 }, 60)
    const fast = state.speed
    run(state, { ...IDLE, dy: 1 }, 120)
    const slow = state.speed
    expect(fast).toBeGreaterThan(base)
    expect(slow).toBeLessThan(base)
    expect(slow).toBeGreaterThan(20)
  })

  it('tocar una orilla es chocar: cuesta una vida y devuelve al último punto de control con el depósito lleno', () => {
    const state = flying()
    state.dist = 600
    state.checkpoint = 400
    state.fuel = 30
    state.plane.x = riverAt(state.seed, state.dist).left + 2
    expect(touchesBank(state)).toBe(true)
    const events = run(state, IDLE)
    expect(types(events)).toContain('crash')
    expect(state.lives).toBe(2)
    expect(state.dist).toBe(400)
    expect(state.fuel).toBe(100)
    expect(state.plane.invul).toBeGreaterThan(1000)
    expect(view(state).message).toBe('rCrash')
    expect(touchesBank(state)).toBe(false)
    // Con la invulnerabilidad del reaparecer no hay un segundo golpe encadenado.
    state.plane.x = riverAt(state.seed, state.dist).left + 2
    run(state, IDLE)
    expect(state.lives).toBe(2)
  })

  it('sin vidas se pierde la partida y el juego ya no avanza', () => {
    const state = flying()
    state.lives = 1
    state.plane.x = riverAt(state.seed, state.dist).left + 2
    const events = run(state, IDLE)
    expect(types(events)).toEqual(expect.arrayContaining(['crash', 'lose']))
    expect(state.over).toBe('lost')
    const dist = state.dist
    expect(run(state, { ...IDLE, hold: true }, 20)).toEqual([])
    expect(state.dist).toBe(dist)
    expect(result(state)).toMatchObject({ won: false })
  })

  it('chocar con un enemigo destruye a los dos y con una isla también acaba en choque', () => {
    const state = flying()
    state.objects = [{ id: 1, type: 'ship', alive: true, x: state.plane.x, wy: state.dist, vx: 0 }]
    expect(types(run(state, IDLE))).toEqual(expect.arrayContaining(['boom', 'crash']))
    expect(state.score).toBe(KINDS.ship.score)
    const rock = flying()
    rock.objects = [{ id: 2, type: 'island', alive: true, x: rock.plane.x, wy: rock.dist + 4, hw: 12, hh: 20 }]
    expect(types(run(rock, IDLE))).toContain('crash')
  })

  it('el combustible baja, se recarga sobrevolando un depósito y al llegar a cero se pierde una vida', () => {
    const state = flying()
    const full = state.fuel
    run(state, IDLE, 120)
    expect(state.fuel).toBeLessThan(full)
    const low = state.fuel
    state.objects = [{ id: 3, type: 'tank', alive: true, x: state.plane.x, wy: state.dist }]
    const events = run(state, IDLE, 40)
    expect(state.fuel).toBeGreaterThan(low - 1)
    expect(types(events)).toContain('fuel')
    const empty = flying()
    empty.fuel = 20
    expect(types(run(empty, IDLE, 80))).toContain('lowFuel')
    empty.fuel = 0.01
    empty.checkpoint = 0
    run(empty, IDLE, 10)
    expect(empty.lives).toBe(2)
    expect(view(empty).message).toBe('rNoFuel')
  })
})

describe('disparos y puentes', () => {
  function target(type, extra = {}) {
    const state = flying()
    state.dist = 800
    centred(state)
    const o = { id: 9, type, alive: true, x: state.plane.x, wy: state.dist + 70, vx: 0, ...extra }
    state.objects = [o]
    return { state, o }
  }

  it('una bala destruye un barco, suma sus puntos y suena la explosión', () => {
    const { state, o } = target('ship')
    const events = run(state, { ...IDLE, action: true }, 40)
    expect(types(events)).toEqual(expect.arrayContaining(['shoot', 'boom']))
    expect(o.alive).toBe(false)
    expect(state.score).toBe(KINDS.ship.score)
    expect(state.kills).toBe(1)
  })

  it('no hay más de tres balas a la vez', () => {
    const state = flying()
    run(state, { ...IDLE, hold: true }, 20)
    expect(state.bullets.length).toBeLessThanOrEqual(3)
    expect(state.bullets.length).toBeGreaterThan(0)
  })

  it('las islas paran las balas y no se pueden destruir', () => {
    const { state, o } = target('island', { hw: 12, hh: 18 })
    const events = run(state, { ...IDLE, action: true }, 40)
    expect(types(events)).toContain('block')
    expect(o.alive).toBe(true)
  })

  it('el puente aguanta dos balas y al caer da puntos, un punto de control y el aviso', () => {
    const state = flying()
    state.dist = 2000
    state.objects = [{ id: 7, type: 'bridge', alive: true, x: W / 2, wy: 2100, hp: 2 }]
    const events = run(state, { ...IDLE, hold: true }, 90)
    expect(types(events)).toEqual(expect.arrayContaining(['hit', 'bridge', 'checkpoint']))
    expect(state.objects[0].alive).toBe(false)
    expect(state.bridges).toBe(1)
    expect(state.checkpoint).toBe(state.objects[0].wy + 40)
    expect(state.score).toBeGreaterThanOrEqual(500)
    expect(view(state).message).toBe('rBridge')
  })

  it('chocar con un puente sin volar es un choque; destruido, se pasa', () => {
    const state = flying()
    state.dist = 2000
    state.objects = [{ id: 8, type: 'bridge', alive: true, x: W / 2, wy: 2004, hp: 2 }]
    expect(types(run(state, IDLE))).toContain('crash')
    const safe = flying()
    safe.dist = 2000
    safe.objects = [{ id: 8, type: 'bridge', alive: false, x: W / 2, wy: 2004, hp: 0 }]
    expect(types(run(safe, IDLE, 3))).not.toContain('crash')
  })

  it('el caza cruza la pantalla y el helicóptero rebota en las orillas', () => {
    const state = flying()
    state.dist = 900
    centred(state)
    state.objects = [{ id: 1, type: 'jet', alive: true, x: -30, wy: 960, side: 1, active: false }]
    run(state, IDLE, 20)
    expect(state.objects[0].active).toBe(true)
    expect(state.objects[0].x).toBeGreaterThan(-14)
    const heli = flying()
    heli.dist = 900
    centred(heli)
    const { left } = riverAt(heli.seed, 960)
    heli.objects = [{ id: 2, type: 'heli', alive: true, x: left + 12, wy: 960, vx: -40 }]
    run(heli, IDLE, 30)
    expect(heli.objects[0].vx).toBeGreaterThan(0)
    expect(heli.objects[0].x).toBeGreaterThanOrEqual(left)
  })

  it('al reaparecer se reconstruye lo que había por delante del punto de control', () => {
    const state = flying()
    state.objects = [{ id: 1, type: 'ship', alive: false, x: 100, wy: 3000, vx: 0 }]
    state.checkpoint = 2700
    state.dist = 3200
    state.plane.x = riverAt(state.seed, state.dist).left + 1
    run(state, IDLE)
    expect(state.objects.length).toBeGreaterThan(0)
    expect(state.objects.every((o) => o.alive)).toBe(true)
    expect(state.objects.every((o) => o.wy > 2700 - 180)).toBe(true)
  })
})

describe('aterrizaje', () => {
  function approach() {
    const state = flying()
    state.bridges = SECTIONS
    state.checkpoint = LAND_ZONE_START - 300
    state.dist = LAND_ZONE_START + 4
    run(state, IDLE, 2)
    return state
  }

  it('tras el último puente aparece la pista y la partida entra en aterrizaje', () => {
    const state = approach()
    expect(state.phase).toBe('landing')
    expect(view(state).message).toBe('rLanding')
  })

  it('alineada con la pista, aterriza, frena y se gana la partida', () => {
    const state = approach()
    state.plane.x = LANDING_RUNWAY.x
    state.dist = LANDING_RUNWAY.y0 + 30
    const events = []
    for (let i = 0; i < 400 && !state.over; i++) events.push(...step(state, IDLE, 16))
    expect(types(events)).toEqual(expect.arrayContaining(['land', 'win']))
    expect(state.over).toBe('won')
    expect(view(state).status).toBe('won')
    expect(result(state).won).toBe(true)
    expect(state.speed).toBeLessThan(5)
  })

  it('fuera de la pista no se aterriza: se pierde una vida y se vuelve a intentar', () => {
    const state = approach()
    state.plane.x = LANDING_RUNWAY.x + LANDING_RUNWAY.half + 30
    state.dist = LANDING_RUNWAY.y0 + 30
    const events = []
    for (let i = 0; i < 200 && !types(events).includes('crash'); i++) events.push(...step(state, IDLE, 16))
    expect(types(events)).toContain('crash')
    expect(state.lives).toBe(2)
    expect(state.phase).toBe('fly')
    expect(state.dist).toBeLessThan(state.checkpoint + 10)
  })
})

describe('duración y dificultad', () => {
  // Un piloto automático que sigue el centro del río y dispara siempre; con la avioneta intocable comprueba que el nivel se puede
  // completar y que dura lo que debe: de 3 a 5 minutos al ritmo normal.
  function autopilot(accelerate = 0) {
    const state = createGame(5)
    run(state, { ...IDLE, action: true })
    let frames = 0
    while (!state.over && frames < 60 * 60 * 10) {
      const ahead = riverAt(state.seed, state.dist + 30)
      const aim = state.phase === 'landing' ? LANDING_RUNWAY.x : (ahead.left + ahead.right) / 2
      const dx = Math.abs(aim - state.plane.x) > 2 ? Math.sign(aim - state.plane.x) : 0
      state.plane.invul = Infinity
      state.fuel = 100
      step(state, { dx, dy: -accelerate, action: false, hold: true }, 16)
      frames += 1
    }
    return state
  }

  it('al ritmo normal el nivel dura entre dos minutos y medio y cinco, y acaba en victoria', () => {
    const state = autopilot(0)
    expect(state.over).toBe('won')
    expect(state.bridges).toBe(SECTIONS)
    expect(state.time / 1000).toBeGreaterThan(150)
    expect(state.time / 1000).toBeLessThan(310)
  })

  it('con el acelerador a fondo se hace bastante más corto', () => {
    const state = autopilot(1)
    expect(state.over).toBe('won')
    expect(state.time / 1000).toBeLessThan(210)
  })

  it('cada tramo va un poco más deprisa que el anterior', () => {
    const early = flying()
    const late = flying()
    late.dist = SECTION_LEN * 4 + 100
    run(early, IDLE, 200)
    run(late, IDLE, 200)
    expect(late.speed).toBeGreaterThan(early.speed)
  })
})

describe('textos', () => {
  it('cada aviso del juego tiene su texto en español e inglés', () => {
    const keys = ['rTakeoff', 'rFuelLow', 'rBridge', 'rLanding', 'rLanded', 'rCrash', 'rNoFuel']
    ;['es', 'en'].forEach((lang) => keys.forEach((key) => expect(ARCADE_COPY[lang].lines[key], `${lang} ${key}`).toBeTruthy()))
  })
})
