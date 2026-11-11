import { describe, expect, it } from 'vitest'
import { createCompanion, meetPhase, startMeet, updateCompanion } from './catCompanion.js'

const LUPE = { x: 100, y: 100 }

function runUntil(cat, pet, phase, limit = 20000) {
  for (let t = 0; t < limit; t += 50) {
    if (meetPhase(cat) === phase) return true
    updateCompanion(cat, 50, LUPE, false)
  }
  return false
}

describe('Khalessi conoce a la mascota', () => {
  it('se acerca, olfatea, juega y vuelve con Lupe', () => {
    const cat = createCompanion(113, 104)
    const pet = { x: 60, y: 120 }
    startMeet(cat, pet)
    expect(meetPhase(cat)).toBe('approach')
    expect(runUntil(cat, pet, 'sniff')).toBe(true)
    expect(Math.hypot(cat.x - pet.x, cat.y - pet.y)).toBeLessThan(14)
    expect(runUntil(cat, pet, 'play')).toBe(true)
    for (let t = 0; t < 6000; t += 50) {
      updateCompanion(cat, 50, LUPE, false)
      if (meetPhase(cat) === 'play') expect(Math.hypot(cat.x - pet.x, cat.y - pet.y)).toBeLessThan(20)
    }
    expect(meetPhase(cat)).toBeNull()
    for (let t = 0; t < 8000; t += 50) updateCompanion(cat, 50, LUPE, false)
    expect(Math.hypot(cat.x - LUPE.x, cat.y - LUPE.y)).toBeLessThan(25)
  })

  it('no se queda esperando si no llega', () => {
    const cat = createCompanion(0, 0)
    startMeet(cat, { x: 5000, y: 0 })
    expect(runUntil(cat, null, 'sniff', 8000)).toBe(true)
  })
})
