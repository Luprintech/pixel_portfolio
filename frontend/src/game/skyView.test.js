import { describe, expect, it } from 'vitest'
import { VIEW_H, VIEW_W, paintSkyView, skyKind, starVisibility } from './skyView.js'
import { DAY_MS, skyAt } from './titleSky.js'

// Contexto de mentira que anota qué se pinta: jsdom no trae canvas y aquí solo importa qué se dibuja.
function recorder() {
  const calls = []
  let shift = 0
  const stack = []
  const g = {
    fillStyle: '#000',
    globalAlpha: 1,
    fillRect: (x, y, w, h) => calls.push({ x, y: y + shift, w, h, color: g.fillStyle, alpha: g.globalAlpha }),
    save: () => stack.push(shift),
    restore: () => {
      shift = stack.pop()
    },
    translate: (_x, y) => {
      shift += y
    },
  }
  return { g, calls }
}

const day = { dark: 0, cloud: 0.2, rain: 0, snow: 0 }
const night = { dark: 1, cloud: 0.2, rain: 0, snow: 0 }

describe('qué se ve por el telescopio', () => {
  it('distingue el día y la noche, con o sin nubes, y la lluvia y la nieve', () => {
    expect(skyKind(day)).toBe('clearDay')
    expect(skyKind({ ...day, cloud: 0.8 })).toBe('cloudyDay')
    expect(skyKind(night)).toBe('clearNight')
    expect(skyKind({ ...night, cloud: 0.8 })).toBe('cloudyNight')
    expect(skyKind({ ...day, rain: 0.65, cloud: 0.9 })).toBe('rain')
    expect(skyKind({ ...night, snow: 1, cloud: 0.85 })).toBe('snow')
  })

  it('las estrellas se ven de noche y las nubes las apagan', () => {
    expect(starVisibility(day)).toBe(0)
    expect(starVisibility(night)).toBeGreaterThan(starVisibility({ ...night, cloud: 1 }))
    expect(starVisibility({ ...night, cloud: 1 })).toBeGreaterThan(0)
  })
})

describe('pintar la vista del cielo', () => {
  const sky = (seed, ms) => skyAt(ms, seed)

  it('pinta cielo y marco en cualquier momento del día y del tiempo, sin salirse del lienzo', () => {
    // Se muestrea cada 15 s, que cubre día, noche y varios cambios de tiempo; se comparan solo los extremos porque
    // un `expect` por trazo haría la prueba lentísima.
    for (let ms = 0; ms < DAY_MS * 2; ms += 15000) {
      const { g, calls } = recorder()
      paintSkyView(g, sky(7, ms), ms + 8500)
      expect(calls.length).toBeGreaterThan(100)
      const xs = calls.map((c) => c.x)
      const ys = calls.map((c) => c.y)
      // Las nubes entran y salen por los lados: el lienzo recorta lo que sobra, pero nunca se dibuja lejos.
      expect(Math.min(...xs)).toBeGreaterThanOrEqual(-100)
      expect(Math.max(...xs)).toBeLessThanOrEqual(VIEW_W + 100)
      expect(Math.min(...ys)).toBeGreaterThanOrEqual(-10)
      expect(Math.max(...ys)).toBeLessThanOrEqual(VIEW_H + 10)
    }
  })

  // Franjas fijas: así los colores de las estrellas y de los pájaros no se confunden con los del cielo.
  const NIGHT_BANDS = ['#14132e', '#1c1b3a', '#2e2d5a', '#3b3572', '#4b4380', '#5c5a7a']
  const DAY_BANDS = ['#4a93c0', '#6cb0d6', '#8fd3dd', '#b4e2e6', '#d3f0f2', '#f1e6cf']

  it('de noche y despejado pinta estrellas; de día no', () => {
    const stars = (state) => {
      const { g, calls } = recorder()
      paintSkyView(g, { ...skyAt(0, 3), rain: 0, snow: 0, sun: null, moon: null, bands: NIGHT_BANDS, ...state }, 1000, true)
      return calls.filter((c) => c.color === '#f1e6cf' && c.w === 1).length
    }
    expect(stars({ dark: 1, cloud: 0.2 })).toBeGreaterThan(40)
    expect(stars({ dark: 0, cloud: 0.2 })).toBe(0)
  })

  it('con movimiento reducido no hay pájaros ni estrellas fugaces', () => {
    const base = { ...skyAt(0, 3), dark: 0, cloud: 0.2, rain: 0, snow: 0, sun: null, moon: null, bands: DAY_BANDS }
    const birds = (still) => {
      const { g, calls } = recorder()
      paintSkyView(g, base, 8000, still)
      return calls.filter((c) => c.color === '#2e2d5a' && c.w === 1 && c.h === 1).length
    }
    expect(birds(false)).toBeGreaterThan(0)
    expect(birds(true)).toBe(0)
  })
})
