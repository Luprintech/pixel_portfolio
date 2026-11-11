import { beforeEach, describe, expect, it } from 'vitest'
import { ACHIEVEMENT_IDS } from '../achievements.js'
import { ARCADE_COPY } from '../../lib/arcadeCopy.js'
import { THEMES } from '../../lib/chiptuneSongs.js'
import { clearSave } from '../save.js'
import { GAMES, GAME_IDS } from './games.js'
import { MODULES } from './modules.js'
import { clearScores, loadScores, recordResult } from './scores.js'
import { FRAME } from './shared.js'
import { snapScale } from '../../components/valle/arcade/useStageScale.js'
import { LANDING_RUNWAY, RIVER_SEEDS, SECTIONS, buildObjects, riverAt } from './river/level.js'
import { createGame as createRiver, step as stepRiver } from './river/logic.js'

beforeEach(() => localStorage.clear())

describe('registro de juegos', () => {
  it('son tres, cada uno con módulo, logro propio, canción propia, textos en los dos idiomas y semillas', () => {
    expect(GAME_IDS).toEqual(['dungeon', 'galactic', 'river'])
    expect(new Set(GAMES.map((g) => g.achievement)).size).toBe(3)
    GAMES.forEach((game) => {
      const mod = MODULES[game.id]
      ;['create', 'step', 'draw', 'view', 'result'].forEach((fn) => expect(typeof mod[fn], `${game.id}.${fn}`).toBe('function'))
      expect(mod.seeds.length).toBeGreaterThan(0)
      expect(ACHIEVEMENT_IDS).toContain(game.achievement)
      expect(THEMES[game.theme]).toBeTruthy()
      ;['es', 'en'].forEach((lang) => {
        const copy = ARCADE_COPY[lang].games[game.id]
        ;['title', 'tag', 'desc', 'controls'].forEach((key) => expect(copy[key], `${lang} ${game.id} ${key}`).toBeTruthy())
      })
    })
  })

  it('cada juego arranca en estado jugable y su vista y su resultado tienen la forma que espera la pantalla', () => {
    GAMES.forEach(({ id }) => {
      const mod = MODULES[id]
      mod.seeds.forEach((seed) => {
        const state = mod.create(seed)
        const view = mod.view(state)
        expect(view.status, id).toBe('playing')
        const done = mod.result(state)
        expect(Array.isArray(done.stats)).toBe(true)
        done.stats.forEach(({ key }) => expect(ARCADE_COPY.es.ui.stats[key], `${id} ${key}`).toBeTruthy())
        expect(mod.step(state, { dx: 0, dy: 0, action: false, hold: false }, 16)).toBeInstanceOf(Array)
      })
    })
  })

  it('los textos de la interfaz están completos en los dos idiomas', () => {
    expect(Object.keys(ARCADE_COPY.en.ui).sort()).toEqual(Object.keys(ARCADE_COPY.es.ui).sort())
    expect(Object.keys(ARCADE_COPY.en.lines).sort()).toEqual(Object.keys(ARCADE_COPY.es.lines).sort())
  })

  it('el marco común es apaisado y los juegos lo usan', () => {
    expect(FRAME).toEqual({ width: 240, height: 192 })
  })
})

describe('puntuaciones', () => {
  it('sin nada guardado todos están a cero y sin completar', () => {
    const scores = loadScores()
    GAME_IDS.forEach((id) => expect(scores[id]).toEqual({ best: 0, cleared: false, plays: 0 }))
  })

  it('anota el mejor resultado, marca el juego completado solo al ganar y lo guarda', () => {
    let scores = loadScores()
    let res = recordResult(scores, 'galactic', { score: 1200, won: false })
    expect(res.record).toBe(true)
    scores = res.next
    expect(scores.galactic).toEqual({ best: 1200, cleared: false, plays: 1 })
    res = recordResult(scores, 'galactic', { score: 800, won: true })
    expect(res.record).toBe(false)
    expect(res.next.galactic).toEqual({ best: 1200, cleared: true, plays: 2 })
    expect(loadScores().galactic).toEqual({ best: 1200, cleared: true, plays: 2 })
    expect(loadScores().river.best).toBe(0)
  })

  it('ignora juegos desconocidos, puntos raros y datos dañados', () => {
    const scores = loadScores()
    expect(recordResult(scores, 'inventado', { score: 5, won: true })).toEqual({ next: scores, record: false })
    expect(recordResult(scores, 'river', { score: -4, won: false }).record).toBe(false)
    localStorage.setItem('valle-del-bucle:arcade', '{mal')
    expect(loadScores().dungeon.best).toBe(0)
    localStorage.setItem('valle-del-bucle:arcade', JSON.stringify({ dungeon: { best: 'x', cleared: 1 }, otro: { best: 9 } }))
    expect(loadScores().dungeon).toEqual({ best: 0, cleared: false, plays: 0 })
  })

  it('«Borrar partida» las borra con el resto de la partida', () => {
    recordResult(loadScores(), 'river', { score: 500, won: true })
    expect(loadScores().river.best).toBe(500)
    clearSave()
    expect(loadScores().river.best).toBe(0)
    recordResult(loadScores(), 'river', { score: 7, won: false })
    clearScores()
    expect(loadScores().river.best).toBe(0)
  })
})

describe('tamaño de la pantalla', () => {
  it('llena la caja sin deformar y con píxeles enteros reales', () => {
    expect(snapScale(4.9, 1)).toBe(4)
    expect(snapScale(4.9, 2)).toBe(4.5)
    expect(snapScale(3.3, 1.25)).toBeCloseTo(3.2, 5)
    // En un móvil pequeño baja de 1 sin dejar de caber.
    expect(snapScale(0.8)).toBe(0.75)
    expect(snapScale(0.1)).toBe(0.5)
    expect(snapScale(NaN)).toBe(1)
    // Un portátil de 1366×768 aprovecha ya mucho más que el 160×160 de antes.
    const laptop = snapScale(Math.min(1366 / FRAME.width, (768 - 170) / FRAME.height), 1)
    expect(FRAME.width * laptop).toBeGreaterThanOrEqual(720)
  })
})

describe('todos los ríos del juego', () => {
  RIVER_SEEDS.forEach((seed) => {
    it(`el río ${seed} es transitable, tiene sus puentes y se puede completar`, () => {
      for (let wy = -120; wy < LANDING_RUNWAY.y1; wy += 9) {
        const { left, right } = riverAt(seed, wy)
        expect(right - left, `${seed} y=${wy}`).toBeGreaterThanOrEqual(80)
        expect(left).toBeGreaterThanOrEqual(2)
        expect(right).toBeLessThanOrEqual(238)
      }
      const objects = buildObjects(seed)
      expect(objects.filter((o) => o.type === 'bridge').length).toBe(SECTIONS)
      objects.filter((o) => o.type === 'island').forEach((o) => {
        const { left, right } = riverAt(seed, o.wy)
        expect(o.x - o.hw - left).toBeGreaterThanOrEqual(30)
        expect(right - (o.x + o.hw)).toBeGreaterThanOrEqual(30)
      })
      const state = createRiver(seed)
      stepRiver(state, { dx: 0, dy: 0, action: true, hold: false }, 16)
      for (let i = 0; i < 60 * 60 * 8 && !state.over; i++) {
        const ahead = riverAt(seed, state.dist + 30)
        const aim = state.phase === 'landing' ? LANDING_RUNWAY.x : (ahead.left + ahead.right) / 2
        state.plane.invul = Infinity
        state.fuel = 100
        stepRiver(state, { dx: Math.abs(aim - state.plane.x) > 2 ? Math.sign(aim - state.plane.x) : 0, dy: 0, action: false, hold: true }, 16)
      }
      expect(state.over).toBe('won')
      expect(state.time / 1000).toBeGreaterThan(140)
      expect(state.time / 1000).toBeLessThan(330)
    })
  })
})
