import { describe, expect, it } from 'vitest'
import { snapScale } from './useStageScale'

describe('snapScale', () => {
  it('en escritorio sube a pasos de un píxel físico', () => {
    expect(snapScale(1.4, 1)).toBe(1)
    expect(snapScale(2.7, 2)).toBe(2.5)
  })

  it('por debajo de 1 baja a pasos de un cuarto', () => {
    expect(snapScale(0.8)).toBe(0.75)
  })

  it('en el móvil llena todo el monitor, recortando solo al píxel físico', () => {
    expect(snapScale(1.4, 1, true, 240)).toBeCloseTo(1.4, 5)
    expect(snapScale(1.63, 3, true, 240)).toBeCloseTo(1.6292, 3)
    expect(snapScale(1.63, 3, true, 240)).toBeLessThanOrEqual(1.63)
    expect(snapScale(0.9, 2, true, 240)).toBeGreaterThan(0.89)
  })
})
