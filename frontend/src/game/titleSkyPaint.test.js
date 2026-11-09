import { describe, expect, it } from 'vitest'
import { skyAt } from './titleSky.js'
import { skyTopColor } from './titleSkyPaint.js'

const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return ((n >> 16) & 255) + ((n >> 8) & 255) + (n & 255)
}

describe('color del cielo que se extiende por encima del lienzo', () => {
  it('es un color válido en cualquier momento', () => {
    for (let ms = 0; ms < 200000; ms += 5000) expect(skyTopColor(skyAt(ms, 42))).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('de noche es más oscuro que a mediodía', () => {
    const day = { bands: ['#4a93c0'], dark: 0, rain: 0, storm: 0, winter: 0 }
    const night = { ...day, dark: 1 }
    expect(luminance(skyTopColor(night))).toBeLessThan(luminance(skyTopColor(day)))
  })

  it('sin oscuridad, lluvia ni nieve es el de la franja alta', () => {
    expect(skyTopColor({ bands: ['#4a93c0'], dark: 0, rain: 0, storm: 0, winter: 0 })).toBe('#4a93c0')
  })
})
