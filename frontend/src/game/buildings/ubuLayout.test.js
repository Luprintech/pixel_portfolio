import { describe, expect, it } from 'vitest'
import { UBU_DOOR_ZONE, rampFeet, ubuBodies, walkable } from './ubuLayout.js'

// El cuerpo de la viajera mide 8×4 px sobre sus pies (ver `ValleScene`).
const bodyAt = (x, y) => ({ l: x - 4, r: x + 4, t: y - 4, b: y })
const hits = (bodies, x, y) => {
  const me = bodyAt(x, y)
  return bodies.some((r) => me.l < r.x + r.w && me.r > r.x && me.t < r.y + r.h && me.b > r.y)
}

describe('fachada de la Universidad de Burgos', () => {
  const bodies = ubuBodies()

  it('se sube por la escalinata, a los dos lados del pasamanos, hasta el rellano', () => {
    for (let y = 118; y >= 103; y--) {
      expect(hits(bodies, 108, y), `escalinata izquierda en y ${y}`).toBe(false)
      expect(hits(bodies, 134, y), `escalinata derecha en y ${y}`).toBe(false)
    }
    // El pasamanos central no se atraviesa.
    expect(hits(bodies, 120, 110)).toBe(true)
  })

  it('se sube por la rampa desde la esquina oeste, a ras de suelo, hasta el rellano', () => {
    for (let x = 0; x <= 97; x++) expect(hits(bodies, x, Math.round(rampFeet(x))), `rampa en x ${x}`).toBe(false)
    expect(walkable(98, 103)).toBe(true)
    // Desde la calle no se salta a la rampa por encima de la barandilla.
    expect(hits(bodies, 50, 116)).toBe(true)
  })

  it('el muro no se atraviesa y la zona de E queda en el rellano, a los dos lados del pasamanos', () => {
    expect(hits(bodies, 160, 90)).toBe(true)
    expect(hits(bodies, 122, 96)).toBe(true)
    // Se llega a ella por cada mitad de la escalinata: hay un punto libre del rellano dentro de la zona a cada lado del pasamanos.
    const feetY = UBU_DOOR_ZONE.y + UBU_DOOR_ZONE.h - 1
    expect(hits(bodies, 108, feetY)).toBe(false)
    expect(hits(bodies, 136, feetY)).toBe(false)
    expect(UBU_DOOR_ZONE.x).toBeLessThanOrEqual(108)
    expect(UBU_DOOR_ZONE.x + UBU_DOOR_ZONE.w).toBeGreaterThan(136)
  })
})
