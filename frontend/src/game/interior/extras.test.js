import { beforeEach, describe, expect, it } from 'vitest'
import { ACHIEVEMENT_IDS, clearAchievements, loadAchievements, unlockAchievement } from '../achievements.js'
import { CAT_SEQUENCE, CAT_SPOTS, createCat, updateCat } from './catBrain.js'
import { FURNITURE } from './furniture/index.js'
import { FIGURES } from './figures.js'
import { TV_CHANNELS } from './furniture/living.js'

describe('Khalessi', () => {
  it('completa su ciclo: sale de la caja, juega, lleva la sardina a Atreus, maúlla distinto y vuelve', () => {
    const cat = createCat()
    const meows = []
    const seen = new Set()
    let left = false
    for (let i = 0; i < 20000; i++) {
      updateCat(cat, 50).forEach((event) => meows.push(event.variant))
      seen.add(cat.pose)
      if (!cat.inBox) left = true
      if (cat.carrying && cat.giving) throw new Error('lleva y entrega a la vez')
    }
    expect(left).toBe(true)
    ;['sit', 'walk', 'play', 'grab', 'give'].forEach((pose) => expect(seen.has(pose), pose).toBe(true))
    // Tres maullidos distintos.
    expect(new Set(meows)).toEqual(new Set([0, 1, 2]))
    // Vuelve a la caja al terminar cada vuelta.
    const rest = createCat()
    for (let i = 0; i < 2000 && rest.step !== CAT_SEQUENCE.length - 1; i++) updateCat(rest, 50)
    for (let i = 0; i < 2000 && !rest.inBox; i++) updateCat(rest, 50)
    expect([rest.x, rest.y]).toEqual([CAT_SPOTS.box.x, CAT_SPOTS.box.y])
  })

  it('lleva la sardina en la boca solo camino de Atreus y se la deja a sus pies', () => {
    const cat = createCat()
    let carried = false
    let dropped = null
    for (let i = 0; i < 20000 && !dropped; i++) {
      updateCat(cat, 50)
      if (cat.carrying) carried = true
      if (cat.giving) dropped = { ...cat.toy }
    }
    expect(carried).toBe(true)
    expect(Math.hypot(dropped.x - CAT_SPOTS.atreus.x, dropped.y - CAT_SPOTS.atreus.y)).toBeLessThan(12)
  })

  it('los puntos del recorrido están dentro de la sala y fuera de los muebles grandes', () => {
    Object.values(CAT_SPOTS).forEach(({ x, y }) => {
      expect(x).toBeGreaterThan(16)
      expect(y).toBeGreaterThan(64)
    })
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

  it('los dos primeros son el de la impresora y el de la consola retro', () => {
    expect(ACHIEVEMENT_IDS).toEqual(['maker', 'retro'])
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
