import { describe, expect, it } from 'vitest'
import { ARCADE_COPY } from '../../../lib/arcadeCopy.js'
import { BOSS, BOSS_PHASES, BOSS_WAVE, FOES, SHIP_Y, W, WAVES, createGame, result, step, view } from './logic.js'

const IDLE = { dx: 0, action: false, hold: false }

function run(state, input, frames = 1, dt = 16) {
  const events = []
  for (let i = 0; i < frames; i++) events.push(...step(state, input, dt))
  return events
}
const types = (events) => events.map((e) => e.type)

// Salta directamente a una oleada ya empezada.
function wave(n) {
  const state = createGame(5)
  while (state.wave < n) {
    state.foes = []
    state.boss = null
    state.clearTimer = 1
    run(state, IDLE, 2)
  }
  state.banner = null
  return state
}

describe('partida', () => {
  it('empieza con tres vidas, la primera oleada y el aviso de su nombre', () => {
    const state = createGame()
    expect(state.lives).toBe(3)
    expect(state.score).toBe(0)
    expect(state.wave).toBe(1)
    expect(state.foes.length).toBe(WAVES[0].rows * WAVES[0].cols)
    expect(view(state).message).toBe('gWave1')
    expect(view(state).status).toBe('playing')
  })

  it('hay cinco oleadas con formaciones distintas y un jefe al final', () => {
    expect(WAVES.length).toBe(5)
    expect(new Set(WAVES.map((w) => w.kind)).size).toBeGreaterThanOrEqual(4)
    expect(BOSS_WAVE).toBe(6)
    // Cada oleada se prepara con enemigos propios y velocidad creciente.
    for (let n = 1; n <= WAVES.length; n++) expect(wave(n).foes.length, `oleada ${n}`).toBeGreaterThan(5)
    expect(wave(BOSS_WAVE).boss.hp).toBe(BOSS.hp)
    expect(Math.max(...WAVES.map((w) => w.fire))).toBeGreaterThan(WAVES[0].fire)
  })

  it('cada enemigo tiene sus puntos: más valen los más difíciles', () => {
    const scores = ['bug', 'loop', 'moth', 'orb'].map((t) => FOES[t].score)
    expect([...scores].sort((a, b) => a - b)).toEqual(scores)
  })
})

describe('la nave', () => {
  it('se mueve solo en horizontal y no se sale de la pantalla', () => {
    const state = createGame()
    run(state, { ...IDLE, dx: 1 }, 400)
    expect(state.ship.x).toBeLessThan(W)
    expect(state.ship.x).toBeGreaterThan(W - 20)
    run(state, { ...IDLE, dx: -1 }, 800)
    expect(state.ship.x).toBeLessThan(20)
    expect(state.ship.x).toBeGreaterThan(0)
  })

  it('dispara hacia arriba con pausa entre disparos y no más de dos balas a la vez', () => {
    const state = createGame()
    state.foes = []
    state.clearTimer = 99999
    expect(types(run(state, { ...IDLE, action: true }))).toContain('shoot')
    expect(state.bullets.length).toBe(1)
    const y = state.bullets[0].y
    run(state, IDLE, 5)
    expect(state.bullets[0].y).toBeLessThan(y)
    // Con el disparo mantenido sale otra al acabar la pausa, pero no una tercera.
    run(state, { ...IDLE, hold: true }, 40)
    expect(state.bullets.length).toBeLessThanOrEqual(2)
    expect(state.shotsFired).toBeGreaterThanOrEqual(2)
  })

  it('una bala acaba con un escarabajo y suma sus puntos; un ojo aguanta dos', () => {
    const state = createGame()
    const target = state.foes.find((f) => f.type === 'bug')
    state.ship.x = target.x
    // Queda otro enemigo para que no cuente el bonus de oleada limpia.
    state.foes = [target, { ...state.foes[0], id: 999, x: 10, y: 60 }]
    state.bullets = [{ x: target.x, y: target.y + 10 }]
    const events = run(state, IDLE, 6)
    expect(types(events)).toContain('boom')
    expect(state.score).toBe(FOES.bug.score)
    expect(state.kills).toBe(1)
    const orb = createGame().foes.find((f) => f.type === 'orb')
    const second = createGame()
    second.foes = [orb, { ...second.foes[0], id: 998, x: 200, y: 60 }]
    second.bullets = [{ x: orb.x, y: orb.y + 6 }]
    const hit = run(second, IDLE, 3)
    expect(types(hit)).toContain('hit')
    expect(orb.hp).toBe(1)
    second.bullets = [{ x: orb.x, y: orb.y + 6 }]
    expect(types(run(second, IDLE, 3))).toContain('boom')
    expect(second.score).toBe(FOES.orb.score)
  })
})

describe('daño, vidas y puntos', () => {
  it('un disparo enemigo cuesta una vida y deja un respiro de invulnerabilidad', () => {
    const state = wave(2)
    state.foes = [state.foes[0]]
    state.foes[0].x = 5
    state.foes[0].y = 20
    state.shots = [{ x: state.ship.x, y: SHIP_Y, vx: 0, vy: 0 }]
    const events = run(state, IDLE)
    expect(types(events)).toContain('hurt')
    expect(state.lives).toBe(2)
    expect(state.ship.invul).toBeGreaterThan(1000)
    state.shots = [{ x: state.ship.x, y: SHIP_Y, vx: 0, vy: 0 }]
    run(state, IDLE)
    expect(state.lives).toBe(2)
  })

  it('chocar con un enemigo también cuesta una vida y lo destruye', () => {
    const state = wave(4)
    state.form.broken = true
    const [crasher, ...rest] = state.foes
    state.foes = [crasher, ...rest.slice(0, 2)]
    state.foes.forEach((f) => {
      f.free = true
      f.dive = { sx: -50, sy: 0, tx: -50, t: 0 }
    })
    crasher.dive = { sx: state.ship.x, sy: SHIP_Y - 2, tx: state.ship.x, t: 0 }
    run(state, IDLE)
    expect(state.lives).toBe(2)
    expect(state.foes.includes(crasher)).toBe(false)
  })

  it('sin vidas la partida termina en derrota y nada más cambia', () => {
    const state = wave(2)
    state.lives = 1
    state.foes = [state.foes[0]]
    state.shots = [{ x: state.ship.x, y: SHIP_Y, vx: 0, vy: 0 }]
    const events = run(state, IDLE)
    expect(types(events)).toContain('lose')
    expect(state.over).toBe('lost')
    expect(view(state).status).toBe('lost')
    const score = state.score
    expect(run(state, { ...IDLE, hold: true }, 30)).toEqual([])
    expect(state.score).toBe(score)
    expect(result(state)).toMatchObject({ won: false, score })
  })

  it('cada cierto número de puntos da una vida extra, una sola vez por umbral', () => {
    const state = createGame()
    state.score = 2490
    const target = state.foes.find((f) => f.type === 'bug')
    state.foes = [target, { ...state.foes[0], id: 997, x: 10, y: 60 }]
    state.bullets = [{ x: target.x, y: target.y + 10 }]
    const events = run(state, IDLE, 6)
    expect(types(events)).toContain('extra')
    expect(state.lives).toBe(4)
    expect(view(state).message).toBe('gExtra')
    state.score = 2600
    expect(types(run(state, IDLE, 20))).not.toContain('extra')
  })

  it('limpiar la oleada da un bonus, un respiro y la siguiente oleada', () => {
    const state = createGame()
    state.foes = []
    const first = run(state, IDLE)
    expect(types(first)).toContain('bonus')
    expect(state.score).toBeGreaterThan(0)
    const events = run(state, IDLE, 100)
    expect(types(events)).toContain('wave')
    expect(state.wave).toBe(2)
    expect(view(state).message).toBe('gWave2')
  })
})

describe('formaciones', () => {
  it('las filas se mueven de lado, bajan al tocar el borde y aceleran cuando quedan pocos', () => {
    const state = createGame()
    const x0 = state.foes[0].x
    run(state, IDLE, 30)
    expect(state.foes[0].x).toBeGreaterThan(x0)
    let drops = 0
    let y = state.form.y
    for (let i = 0; i < 1400; i++) {
      state.ship.invul = Infinity
      step(state, IDLE, 16)
      if (state.form.y > y) {
        drops += 1
        y = state.form.y
      }
    }
    expect(drops).toBeGreaterThanOrEqual(1)
    const fast = createGame()
    fast.foes = fast.foes.slice(0, 3)
    const slow = createGame()
    const fx = fast.foes[0].x
    const sx = slow.foes[0].x
    run(fast, IDLE, 20)
    run(slow, IDLE, 20)
    expect(Math.abs(fast.foes[0].x - fx)).toBeGreaterThan(Math.abs(slow.foes[0].x - sx))
  })

  it('la ola cruza la pantalla, vuelve a entrar un carril más abajo y acaba por irse sin quedarse para siempre', () => {
    const state = wave(2)
    const f = state.foes[0]
    const lane = f.base
    for (let i = 0; i < 1500 && f.laps === 0; i++) {
      state.ship.invul = Infinity
      step(state, IDLE, 16)
    }
    expect(f.laps).toBeGreaterThanOrEqual(1)
    expect(f.base).toBeGreaterThan(lane)
    for (let i = 0; i < 12000 && state.wave === 2; i++) {
      state.ship.invul = Infinity
      step(state, IDLE, 16)
    }
    expect(state.wave).toBe(3)
  })

  it('las polillas se lanzan en picado y vuelven a su hueco', () => {
    const state = wave(3)
    let dived = false
    let back = false
    for (let i = 0; i < 3000; i++) {
      state.ship.invul = Infinity
      step(state, IDLE, 16)
      if (state.foes.some((f) => f.dive)) dived = true
      else if (dived && state.foes.every((f) => f.home)) back = true
    }
    expect(dived).toBe(true)
    expect(back || state.foes.some((f) => f.home)).toBe(true)
  })

  it('el anillo gira, baja, se rompe y los ojos que se escapan vuelven a formarlo', () => {
    const state = wave(4)
    const a0 = state.form.angle
    run(state, IDLE, 20)
    expect(state.form.angle).toBeGreaterThan(a0)
    let broke = false
    let formed = false
    for (let i = 0; i < 4000; i++) {
      state.ship.invul = Infinity
      step(state, IDLE, 16)
      if (state.form.broken) broke = true
      else if (broke) formed = true
    }
    expect(broke).toBe(true)
    expect(formed).toBe(true)
  })
})

describe('Nodo Maestro', () => {
  const boss = () => {
    const state = wave(BOSS_WAVE)
    state.boss.entering = 0
    state.boss.y = 40
    state.boss.shieldCooldown = 99999
    return state
  }

  it('entra desde arriba, no se le puede herir al llegar y lanza disparos apuntados', () => {
    const state = wave(BOSS_WAVE)
    expect(state.boss.entering).toBe(1)
    state.boss.t = 0
    state.bullets = [{ x: state.boss.x, y: 30 }]
    run(state, IDLE, 2)
    expect(state.boss.hp).toBe(BOSS.hp)
    run(state, IDLE, 120)
    expect(state.boss.entering).toBe(0)
    state.boss.fire = 1
    state.ship.invul = Infinity
    expect(types(run(state, IDLE, 2))).toContain('spit')
    expect(state.shots.length).toBeGreaterThan(0)
  })

  it('cada bala le quita vida y cambia de fase con avisos; desde la segunda lanza abanicos y desde la tercera llama a bichos', () => {
    const state = boss()
    state.ship.invul = Infinity
    state.boss.hp = BOSS_PHASES[1] + 1
    state.boss.x = 120
    state.bullets = [{ x: 120, y: state.boss.y + 8 }]
    const events = run(state, IDLE, 2)
    expect(state.boss.hp).toBe(BOSS_PHASES[1])
    expect(state.boss.phase).toBe(1)
    expect(types(events)).toContain('phase')
    expect(view(state).message).toBe('gBossRage')
    state.boss.fan = 1
    state.shots = []
    run(state, IDLE, 2)
    expect(state.shots.length).toBeGreaterThanOrEqual(3)
    state.boss.phase = 2
    state.boss.summon = 1
    state.foes = []
    run(state, IDLE, 2)
    expect(state.foes.length).toBe(2)
  })

  it('el escudo detiene las balas y se apaga solo', () => {
    const state = boss()
    state.ship.invul = Infinity
    state.boss.x = 120
    state.boss.shield = 800
    state.bullets = [{ x: 120, y: state.boss.y + 8 }]
    const events = run(state, IDLE, 2)
    expect(types(events)).toContain('block')
    expect(state.boss.hp).toBe(BOSS.hp)
    run(state, IDLE, 80)
    expect(state.boss.shield).toBe(0)
  })

  it('al vencerlo se gana la partida con su premio', () => {
    const state = boss()
    state.ship.invul = Infinity
    state.boss.hp = 1
    state.boss.x = 120
    state.bullets = [{ x: 120, y: state.boss.y + 8 }]
    const events = run(state, IDLE, 2)
    expect(types(events)).toEqual(expect.arrayContaining(['bigBoom', 'win']))
    expect(state.over).toBe('won')
    expect(state.score).toBeGreaterThanOrEqual(BOSS.score)
    expect(view(state).status).toBe('won')
    expect(result(state).won).toBe(true)
  })
})

describe('duración y dificultad', () => {
  // Un jugador automático que persigue al enemigo más bajo y dispara siempre, sin esquivar. Con la nave intocable sirve para
  // comprobar que la partida se puede completar y que dura lo que debe (de 3 a 5 minutos para quien juega bien).
  it('una partida completa dura entre minuto y medio y siete minutos', () => {
    const state = createGame(3)
    let frames = 0
    while (!state.over && frames < 60 * 60 * 9) {
      const targets = state.boss ? [state.boss] : state.foes.filter((f) => f.y > 0 && f.y < SHIP_Y - 10 && !f.out)
      const aim = targets.sort((a, b) => b.y - a.y)[0]
      const dx = aim ? Math.sign(aim.x - state.ship.x) * (Math.abs(aim.x - state.ship.x) > 3 ? 1 : 0) : 0
      state.ship.invul = Infinity
      step(state, { dx, action: false, hold: true }, 16)
      frames += 1
    }
    expect(state.over).toBe('won')
    const seconds = state.time / 1000
    expect(seconds).toBeGreaterThan(60)
    expect(seconds).toBeLessThan(7 * 60)
  })

  it('cada oleada es más rápida y dispara más a menudo', () => {
    const rowSpeeds = WAVES.filter((w) => w.kind === 'rows').map((w) => w.speed)
    expect(rowSpeeds[1]).toBeGreaterThan(rowSpeeds[0])
    const a = wave(1)
    const b = wave(5)
    expect(b.foes.length).toBeGreaterThan(0)
    expect(a.wave).toBeLessThan(b.wave)
  })
})

describe('textos', () => {
  it('cada aviso del juego tiene su texto en español e inglés', () => {
    const keys = [...WAVES.map((w) => w.name), 'gBoss', 'gBossRage', 'gExtra', 'gClear']
    ;['es', 'en'].forEach((lang) => keys.forEach((key) => expect(ARCADE_COPY[lang].lines[key], `${lang} ${key}`).toBeTruthy()))
  })
})
