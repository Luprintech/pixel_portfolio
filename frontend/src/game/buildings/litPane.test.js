import { describe, expect, it } from 'vitest'
import { LIT_GLASS, litPane } from './litPane.js'

const area = (rects) => rects.reduce((sum, r) => sum + r.w * r.h, 0)
const covers = (rects, px, py) => rects.some((r) => px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h)

describe('cristal encendido con profundidad', () => {
  it('sin huecos cubre todo el cristal', () => {
    const pane = litPane(10, 20, 12, 8)
    expect(area(pane)).toBe(12 * 8)
  })

  it('no pinta nada sobre los huecos (la silueta del objeto queda a oscuras)', () => {
    const holes = [{ x: 4, y: 3, w: 5, h: 4 }]
    const pane = litPane(100, 50, 20, 15, holes)
    expect(area(pane)).toBe(20 * 15 - 5 * 4)
    for (let py = 3; py < 7; py++) for (let px = 4; px < 9; px++) expect(covers(pane, 100 + px, 50 + py)).toBe(false)
    expect(covers(pane, 100, 50)).toBe(true)
  })

  it('no es un rectángulo plano: el borde de arriba es más oscuro y el de abajo más claro', () => {
    const pane = litPane(0, 0, 10, 12)
    const colorAt = (px, py) => pane.find((r) => px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h).color
    expect(colorAt(5, 0)).not.toBe(LIT_GLASS)
    expect(colorAt(5, 6)).toBe(LIT_GLASS)
    expect(colorAt(5, 11)).not.toBe(LIT_GLASS)
    expect(new Set(pane.map((r) => r.color)).size).toBeGreaterThanOrEqual(3)
  })

  it('los rectángulos no se solapan', () => {
    const pane = litPane(0, 0, 36, 30, [{ x: 8, y: 5, w: 20, h: 15 }, { x: 0, y: 24, w: 36, h: 6 }])
    const seen = new Set()
    pane.forEach((r) => {
      for (let py = r.y; py < r.y + r.h; py++) {
        for (let px = r.x; px < r.x + r.w; px++) {
          const key = `${px},${py}`
          expect(seen.has(key), key).toBe(false)
          seen.add(key)
        }
      }
    })
  })
})
