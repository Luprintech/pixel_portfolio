import { describe, expect, it } from 'vitest'
import { followRamp, onRamp } from './ramps.js'

describe('rampas', () => {
  const ramp = { x0: 0, y0: 100, x1: 100, y1: 80 }

  it('sabe si los pies están sobre la línea de la rampa', () => {
    expect(onRamp(ramp, 50, 90)).toBe(true)
    expect(onRamp(ramp, 50, 96)).toBe(false)
    expect(onRamp(ramp, 120, 80)).toBe(false)
  })

  it('andar solo en horizontal sobre la rampa sube o baja con la pendiente', () => {
    expect(followRamp([ramp], 50, 90, 1, 0)).toBeCloseTo(-0.2)
    expect(followRamp([ramp], 50, 90, -1, 0)).toBeCloseTo(0.2)
  })

  it('no toca el movimiento fuera de la rampa ni si ya se pide subir o bajar', () => {
    expect(followRamp([ramp], 50, 120, 1, 0)).toBe(0)
    expect(followRamp([ramp], 50, 90, 1, -1)).toBe(-1)
    expect(followRamp([ramp], 50, 90, 0, 0)).toBe(0)
  })
})
