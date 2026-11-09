import { describe, expect, it } from 'vitest'
import { lightenPixel, softenColor } from './titleSoften.js'

describe('softenColor', () => {
  it('con saturación 1 y brillo 1 deja el color igual', () => {
    expect(softenColor('#4a90c0', { saturate: 1, brightness: 1 })).toBe('#4a90c0')
  })
  it('acerca un azul saturado a un gris sin pasarse del rango', () => {
    const [r, g, b] = softenColor('#1f6fc0').slice(1).match(/../g).map((c) => parseInt(c, 16))
    expect(b - r).toBeLessThan(0xc0 - 0x1f)
    expect([r, g, b].every((c) => c >= 0 && c <= 255)).toBe(true)
  })
  it('mantiene el blanco y el negro', () => {
    expect(softenColor('#000000')).toBe('#000000')
    expect(softenColor('#ffffff', { saturate: 0.5, brightness: 1 })).toBe('#ffffff')
  })
})

describe('lightenPixel', () => {
  it('aclara un verde oscuro y lo acerca a la salvia', () => {
    const [h, s, l] = lightenPixel(95, 0.4, 0.3)
    expect(l).toBeGreaterThan(0.3)
    expect(h).toBeGreaterThan(95)
    expect(h).toBeLessThan(115)
    expect(s).toBe(0.4)
  })
  it('aclara un marrón oscuro sin cambiar su tono', () => {
    const [h, , l] = lightenPixel(25, 0.4, 0.26)
    expect(h).toBe(25)
    expect(l).toBeGreaterThan(0.26)
  })
  it('deja quietos los muros claros, la piedra gris y las flores del cerezo', () => {
    expect(lightenPixel(40, 0.5, 0.76)).toBeNull()
    expect(lightenPixel(250, 0.05, 0.5)).toBeNull()
    expect(lightenPixel(330, 0.6, 0.7)).toBeNull()
  })
})
