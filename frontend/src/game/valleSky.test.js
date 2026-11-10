import { describe, expect, it } from 'vitest'
import { DAY_MS } from './titleSky.js'
import { VALLE_PACE, clockOffset, lampGlow, valleSkyAt, windowGlow } from './valleSky.js'

describe('cielo del valle', () => {
  it('la visita empieza de día, sea cual sea la semilla', () => {
    for (let seed = 1; seed < 200; seed += 7) {
      const sky = valleSkyAt(clockOffset(seed), seed)
      expect(sky.dark, `semilla ${seed}`).toBe(0)
    }
  })

  it('el desplazamiento nunca es negativo ni supera un día del valle', () => {
    for (let seed = 1; seed < 200; seed += 7) {
      const offset = clockOffset(seed)
      expect(offset).toBeGreaterThanOrEqual(0)
      expect(offset).toBeLessThan(DAY_MS * VALLE_PACE)
    }
  })

  it('el día del valle dura VALLE_PACE veces lo que el de la portada', () => {
    const seed = 5
    expect(valleSkyAt(DAY_MS * VALLE_PACE, seed).phase).toBeCloseTo(valleSkyAt(0, seed).phase, 5)
    expect(valleSkyAt(DAY_MS, seed).phase).not.toBeCloseTo(valleSkyAt(0, seed).phase, 2)
  })

  it('las ventanas se encienden escalonadas y todas con la noche cerrada', () => {
    expect(windowGlow(0, 0)).toBe(0)
    expect(windowGlow(1, 0)).toBe(1)
    expect(windowGlow(1, 1)).toBe(1)
    // A media tarde, con poca oscuridad, el edificio de menor rango se enciende antes que el de mayor.
    expect(windowGlow(0.5, 0)).toBeGreaterThan(windowGlow(0.5, 1))
  })

  it('las farolas se encienden antes que las ventanas', () => {
    expect(lampGlow(0.1)).toBe(0)
    expect(lampGlow(0.5)).toBe(1)
    expect(lampGlow(0.3)).toBeGreaterThan(windowGlow(0.3, 0))
  })
})
