import { describe, expect, it } from 'vitest'
import { butterfliesAt, birdsAt, cloudsAt, firefliesAt, isBlinking, petalsAt, shootingStar, smokeAt } from './titleMotion.js'

describe('titleMotion', () => {
  it('parpadea al principio de cada ciclo y el resto del tiempo tiene los ojos abiertos', () => {
    expect(isBlinking(50)).toBe(true)
    expect(isBlinking(1000)).toBe(false)
    expect(isBlinking(3400 + 50)).toBe(true)
  })

  it('la estrella fugaz aparece en su momento y desaparece después', () => {
    expect(shootingStar(1000)).toBeNull()
    const star = shootingStar(2500 + 500)
    expect(star).not.toBeNull()
    expect(star.alpha).toBeGreaterThan(0.9)
    expect(shootingStar(2500 + 5000)).toBeNull()
    expect(shootingStar(2500 + 9000 + 500)).not.toBeNull()
  })

  it('las nubes siempre quedan dentro del margen y se repiten', () => {
    for (let ms = 0; ms < 400000; ms += 9000) {
      cloudsAt(ms).forEach((c) => {
        expect(c.x).toBeGreaterThanOrEqual(-50)
        expect(c.x).toBeLessThan(370)
      })
    }
  })

  it('los pájaros cruzan de lado a lado y luego no hay ninguno', () => {
    expect(birdsAt(1000)).toEqual([])
    const flock = birdsAt(5000 + 6000)
    expect(flock).toHaveLength(3)
    expect(birdsAt(5000 + 14000)).toEqual([])
  })

  it('humo, pétalos y luciérnagas devuelven siempre valores válidos', () => {
    for (let ms = 0; ms < 30000; ms += 777) {
      smokeAt(ms).forEach((s) => {
        expect(s.alpha).toBeGreaterThanOrEqual(0)
        expect(s.alpha).toBeLessThanOrEqual(1)
        expect(s.r).toBeGreaterThan(0)
      })
      petalsAt(ms).forEach((p) => expect(p.y).toBeLessThanOrEqual(160))
      firefliesAt(ms).forEach((f) => {
        expect(f.glow).toBeGreaterThanOrEqual(0)
        expect(f.glow).toBeLessThanOrEqual(1)
      })
    }
  })

  it('las mariposas revolotean por el prado sin salirse de la imagen', () => {
    for (let ms = 0; ms < 60000; ms += 700) {
      const butterflies = butterfliesAt(ms)
      expect(butterflies).toHaveLength(5)
      butterflies.forEach((b) => {
        expect(b.x).toBeGreaterThan(0)
        expect(b.x).toBeLessThan(320)
        expect(b.y).toBeGreaterThan(130)
        expect(b.y).toBeLessThan(180)
      })
    }
  })
})
