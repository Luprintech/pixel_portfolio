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

  it('en el móvil llena el monitor con pasos más finos aunque pase de 1', () => {
    expect(snapScale(1.4, 1, true)).toBe(1.25)
    expect(snapScale(1.4, 5, true)).toBe(1.4)
  })
})
