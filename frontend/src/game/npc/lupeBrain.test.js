import { describe, expect, it } from 'vitest'
import { createNav } from '../interior/catNav.js'
import { TUNING, createLupeBrain, endTalk, placeAt, setAnchor, startGuide, startTalk, stopGuide, updateLupe } from './lupeBrain.js'
import { canGo, go, isAccompanying } from './npcStates.js'

// Camino en línea recta: basta para probar los estados sin mapa.
const straight = { path: (_from, to) => [to] }
const POST = { x: 100, y: 100 }
const DOOR = { x: 220, y: 100 }

const frames = (brain, traveller, ms, step = 50) => {
  for (let t = 0; t < ms; t += step) updateLupe(brain, step, traveller)
}

describe('estados de un NPC', () => {
  it('solo permite las transiciones previstas y mantiene el estado si piden otra', () => {
    expect(canGo('idle', 'guiding')).toBe(true)
    expect(canGo('idle', 'waiting')).toBe(false)
    expect(go('idle', 'waiting')).toBe('idle')
    expect(go('guiding', 'waiting')).toBe('waiting')
  })

  it('solo acompañan guiding y waiting', () => {
    expect(['idle', 'talking', 'guiding', 'waiting', 'routine'].filter(isAccompanying)).toEqual(['guiding', 'waiting'])
  })
})

describe('Lupe autónoma', () => {
  it('no sigue a la viajera: aunque ande a su alrededor, se queda en su sitio', () => {
    const brain = createLupeBrain({ nav: straight, post: POST })
    for (let i = 0; i < 200; i++) updateLupe(brain, 50, { x: 100 + (i % 40), y: 140 })
    expect(brain.state).not.toBe('guiding')
    expect(brain.x).toBe(POST.x)
    expect(brain.y).toBe(POST.y)
  })

  it('mira a la viajera cuando está cerca y quieta', () => {
    const brain = createLupeBrain({ nav: straight, post: POST })
    updateLupe(brain, 16, { x: 100, y: 130 })
    expect(brain.facing).toBe('down')
    updateLupe(brain, 16, { x: 60, y: 100 })
    expect(brain.facing).toBe('left')
  })

  it('pasea entre sus puntos por su cuenta y vuelve a quedarse quieta', () => {
    const brain = createLupeBrain({ nav: straight, post: POST, spots: [{ x: 130, y: 100 }], rng: () => 0 })
    const far = { x: 900, y: 900 }
    frames(brain, far, TUNING.idleMs[0] + 100)
    expect(brain.state).toBe('routine')
    frames(brain, far, 4000)
    expect(brain.state).toBe('idle')
    expect(brain.x).toBeGreaterThan(POST.x)
  })
})

describe('visita guiada', () => {
  it('guía hasta el destino a una velocidad menor que la de la viajera y se detiene al llegar', () => {
    expect(TUNING.guideSpeed).toBeLessThan(90)
    const brain = createLupeBrain({ nav: straight, post: POST })
    expect(startGuide(brain, DOOR)).toBe(true)
    expect(brain.state).toBe('guiding')
    // La viajera va pegada a ella.
    for (let i = 0; i < 400 && !brain.arrived; i++) updateLupe(brain, 50, { x: brain.x - 20, y: brain.y })
    expect(brain.arrived).toBe(true)
    expect(brain.state).toBe('idle')
    expect(brain.x).toBe(DOOR.x)
  })

  it('espera si la viajera se retrasa y sigue cuando se acerca', () => {
    const brain = createLupeBrain({ nav: straight, post: POST })
    startGuide(brain, DOOR)
    updateLupe(brain, 50, { x: brain.x - 20, y: brain.y })
    frames(brain, { x: POST.x - 200, y: POST.y }, 200)
    expect(brain.state).toBe('waiting')
    const stopped = brain.x
    frames(brain, { x: POST.x - 200, y: POST.y }, 500)
    expect(brain.x).toBe(stopped)
    updateLupe(brain, 50, { x: brain.x - 20, y: brain.y })
    expect(brain.state).toBe('guiding')
  })

  it('si la viajera se queda muy lejos mucho rato, da la visita por interrumpida y vuelve a su sitio', () => {
    const brain = createLupeBrain({ nav: straight, post: POST })
    startGuide(brain, DOOR)
    frames(brain, { x: 900, y: 900 }, TUNING.abandonMs + 500)
    expect(brain.abandoned).toBe(true)
    expect(isAccompanying(brain.state)).toBe(false)
    expect(brain.goal).toBeNull()
  })

  it('al cancelar recupera su autonomía y regresa por el camino, sin teletransportarse', () => {
    const brain = createLupeBrain({ nav: straight, post: POST })
    placeAt(brain, DOOR.x, DOOR.y)
    startGuide(brain, { x: 260, y: 100 })
    updateLupe(brain, 50, { x: DOOR.x, y: DOOR.y })
    stopGuide(brain)
    expect(brain.state).toBe('routine')
    const before = brain.x
    updateLupe(brain, 50, { x: 900, y: 900 })
    expect(Math.abs(brain.x - before)).toBeLessThan(5)
    frames(brain, { x: 900, y: 900 }, 6000)
    expect(brain.x).toBe(POST.x)
    expect(brain.state).toBe('idle')
  })

  it('sin camino no se mueve ni empieza la visita', () => {
    const brain = createLupeBrain({ nav: { path: () => null }, post: POST })
    expect(startGuide(brain, DOOR)).toBe(false)
    expect(brain.state).toBe('idle')
    expect(brain.x).toBe(POST.x)
  })

  it('en la puerta espera la decisión sin ponerse a pasear', () => {
    const brain = createLupeBrain({ nav: straight, post: POST, spots: [{ x: 130, y: 100 }], rng: () => 0 })
    startGuide(brain, DOOR)
    for (let i = 0; i < 400 && !brain.arrived; i++) updateLupe(brain, 50, { x: brain.x - 20, y: brain.y })
    frames(brain, { x: DOOR.x - 20, y: DOOR.y }, 20000)
    expect(brain.state).toBe('idle')
    expect(brain.x).toBe(DOOR.x)
  })
})

describe('conversación', () => {
  it('se para y mira a la viajera al hablar, y retoma la visita al acabar', () => {
    const brain = createLupeBrain({ nav: straight, post: POST })
    startGuide(brain, DOOR)
    frames(brain, { x: brain.x - 20, y: brain.y }, 200)
    startTalk(brain, { x: brain.x + 30, y: brain.y })
    const stopped = brain.x
    expect(brain.state).toBe('talking')
    expect(brain.facing).toBe('right')
    frames(brain, { x: stopped + 30, y: brain.y }, 500)
    expect(brain.x).toBe(stopped)
    endTalk(brain)
    expect(brain.state).toBe('guiding')
  })

  it('una conversación sin visita termina en reposo', () => {
    const brain = createLupeBrain({ nav: straight, post: POST })
    startTalk(brain, { x: 100, y: 130 })
    endTalk(brain)
    expect(brain.state).toBe('idle')
  })

  it('cambiar de sitio habitual hace que el paseo la lleve allí', () => {
    const brain = createLupeBrain({ nav: straight, post: POST, rng: () => 0 })
    setAnchor(brain, DOOR, [])
    frames(brain, { x: 900, y: 900 }, TUNING.idleMs[0] + 200)
    frames(brain, { x: 900, y: 900 }, 6000)
    expect(brain.x).toBe(DOOR.x)
  })
})

describe('caminos sobre obstáculos', () => {
  it('el camino de Lupe rodea un mueble en lugar de atravesarlo', () => {
    const nav = createNav({ bounds: { x: 0, y: 0, width: 200, height: 120 }, solids: [{ x: 90, y: 20, w: 20, h: 80 }], minY: 0 })
    const brain = createLupeBrain({ nav, post: { x: 30, y: 60 } })
    expect(startGuide(brain, { x: 170, y: 60 })).toBe(true)
    const crossing = brain.path.some((p) => p.x > 83 && p.x < 117 && p.y > 17 && p.y < 102)
    expect(crossing).toBe(false)
    for (let i = 0; i < 600 && !brain.arrived; i++) {
      updateLupe(brain, 50, { x: brain.x, y: brain.y })
      expect(brain.x > 90 && brain.x < 110 && brain.y > 20 && brain.y < 100).toBe(false)
    }
    expect(brain.arrived).toBe(true)
  })
})
