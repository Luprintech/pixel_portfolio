import { beforeEach, describe, expect, it } from 'vitest'
import { ACHIEVEMENT_IDS, SECRET_IDS, clearAchievements, loadAchievements, unlockAchievement } from '../achievements.js'
import { CAT_SPOTS, NAV, createCat, updateCat } from './catBrain.js'
import { FURNITURE } from './furniture/index.js'
import { FIGURES } from './figures.js'
import { TV_CHANNELS } from './furniture/living.js'

// Generador con semilla (mulberry32): el cerebro de la gata es aleatorio y las pruebas tienen que repetirse igual.
function seeded(seed) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TICK = 50
const LONG_RUN = 24000

describe('Khalessi', () => {
  it('empieza dormida en su caja', () => {
    const cat = createCat(seeded(1))
    expect(cat.layer).toBe('box')
    expect(cat.pose).toBe('sleep')
  })

  it('en una tarde hace de todo: pasea, come, usa el arenero, se asea, rasca, duerme y juega con la sardina', () => {
    const cat = createCat(seeded(7))
    const meows = []
    const seen = new Set()
    const layers = new Set()
    for (let i = 0; i < LONG_RUN; i++) {
      updateCat(cat, TICK).forEach((event) => meows.push(event.variant))
      seen.add(cat.pose)
      layers.add(cat.layer)
      if (cat.carrying && cat.giving) throw new Error('lleva y entrega a la vez')
    }
    ;['sit', 'walk', 'play', 'grab', 'give', 'eat', 'wash', 'scratch', 'sleep'].forEach((pose) => expect(seen.has(pose), pose).toBe(true))
    ;['box', 'litter', null].forEach((layer) => expect(layers.has(layer), String(layer)).toBe(true))
    // Tres maullidos distintos.
    expect(new Set(meows)).toEqual(new Set([0, 1, 2]))
    // Nunca se queda sin camino.
    expect(cat.skipped).toBe(0)
  })

  it('lleva la sardina en la boca solo camino de Atreus y se la deja cerca de él', () => {
    const cat = createCat(seeded(3))
    let carried = false
    let dropped = null
    for (let i = 0; i < LONG_RUN && !dropped; i++) {
      updateCat(cat, TICK)
      if (cat.carrying) carried = true
      if (cat.giving) dropped = { ...cat.toy }
    }
    expect(carried).toBe(true)
    expect(Math.hypot(dropped.x - CAT_SPOTS.atreus.x, dropped.y - CAT_SPOTS.atreus.y)).toBeLessThan(12)
  })

  it('se gira antes de andar hacia el otro lado: mientras gira no se mueve y mira hacia donde va', () => {
    const cat = createCat(seeded(5))
    const start = NAV.nearestFree(150, 150)
    const to = { x: start.x + 40, y: start.y }
    Object.assign(cat, { layer: null, z: 0, x: start.x, y: start.y, face: 'left', plan: [{ kind: 'walk', to, pose: 'walk' }], step: 0, route: NAV.path(start, to) })
    const before = [cat.x, cat.y]
    updateCat(cat, TICK)
    expect(cat.turning).toBeGreaterThan(0)
    expect([cat.x, cat.y]).toEqual(before)
    expect(cat.face).toBe('left')
    for (let i = 0; i < 20 && cat.turning > 0; i++) updateCat(cat, TICK)
    expect(cat.face).toBe('right')
    updateCat(cat, TICK)
    expect(cat.x).toBeGreaterThan(before[0])
  })

  it('la sardina se ve cogida, llevada y entregada, en ese orden', () => {
    const cat = createCat(seeded(3))
    const phases = []
    for (let i = 0; i < LONG_RUN; i++) {
      updateCat(cat, TICK)
      if (phases.at(-1) !== cat.toyPhase) phases.push(cat.toyPhase)
    }
    const order = phases.filter((phase) => phase !== 'ground')
    expect(order.slice(0, 3)).toEqual(['lifting', 'carried', 'dropping'])
    expect(phases).toContain('ground')
  })

  it('nunca anda de espaldas: cuando se mueve sobre todo en horizontal, mira hacia donde va', () => {
    const cat = createCat(seeded(11))
    let last = [cat.x, cat.y]
    for (let i = 0; i < LONG_RUN; i++) {
      updateCat(cat, TICK)
      const dx = cat.x - last[0]
      const dy = cat.y - last[1]
      // En un movimiento casi vertical conserva el lado en que mira: es lo que se ve natural.
      if (Math.abs(dx) > 0.05 && Math.abs(dx) > Math.abs(dy)) expect(cat.face, `paso ${i}`).toBe(dx > 0 ? 'right' : 'left')
      last = [cat.x, cat.y]
    }
  })

  it('nunca pisa un mueble: en cada fotograma está en suelo libre, salvo al saltar a la caja o al arenero', () => {
    const cat = createCat(seeded(13))
    for (let i = 0; i < LONG_RUN; i++) {
      updateCat(cat, TICK)
      if (cat.layer === null && cat.z === 0) expect(NAV.free(cat.x, cat.y), `paso ${i} en (${Math.round(cat.x)}, ${Math.round(cat.y)})`).toBe(true)
    }
  })
})

describe('logros', () => {
  beforeEach(() => {
    const store = new Map()
    globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) }
  })

  it('se desbloquean una sola vez, se guardan y se borran', () => {
    const first = unlockAchievement(new Set(), 'maker')
    expect(first.isNew).toBe(true)
    expect(unlockAchievement(first.next, 'maker').isNew).toBe(false)
    expect(loadAchievements().has('maker')).toBe(true)
    clearAchievements()
    expect(loadAchievements().size).toBe(0)
  })

  it('ignora los logros que no existen y los datos dañados', () => {
    expect(unlockAchievement(new Set(), 'inventado').isNew).toBe(false)
    globalThis.localStorage.setItem('valle-del-bucle:achievements', '{mal')
    expect(loadAchievements().size).toBe(0)
  })

  it('hay cuatro: la impresora, la consola retro y los dos secretos del ordenador', () => {
    expect(ACHIEVEMENT_IDS).toEqual(['maker', 'retro', 'hola', 'developer'])
    expect(SECRET_IDS).toEqual(['hola', 'developer'])
    expect(unlockAchievement(new Set(), 'hola').isNew).toBe(true)
  })
})

describe('muebles con modos', () => {
  it('cada modo usa fotogramas que existen', () => {
    Object.entries(FURNITURE)
      .filter(([, piece]) => piece.modes)
      .forEach(([kind, piece]) => {
        Object.entries(piece.modes).forEach(([mode, frames]) => {
          frames.forEach((frame) => {
            expect(frame, `${kind}.${mode}`).toBeGreaterThanOrEqual(0)
            expect(frame, `${kind}.${mode}`).toBeLessThan(piece.frames)
          })
        })
      })
  })

  it('la tele tiene un modo por canal y apagada', () => {
    expect(Object.keys(FURNITURE.tvUnit.modes)).toEqual(['off', ...TV_CHANNELS])
  })

  it('la impresora pequeña tiene reposo, impresión y figura terminada', () => {
    expect(Object.keys(FURNITURE.printerMini.modes)).toEqual(['idle', 'printing', 'done'])
  })
})

describe('figuras', () => {
  it('la del pokémon solo la entrega el logro de la impresora', () => {
    expect(FIGURES.find((figure) => figure.id === 'pokemon').unlock).toBe('maker')
    expect(FIGURES.filter((figure) => figure.unlock)).toHaveLength(1)
  })
})
