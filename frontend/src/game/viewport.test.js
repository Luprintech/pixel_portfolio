import { describe, expect, it } from 'vitest'
import { cameraZoom, steppedZoom } from './viewport.js'

const WORLD = [896, 480]

describe('steppedZoom', () => {
  it('sin pulsar nada coincide con el zoom de la pantalla', () => {
    expect(steppedZoom(0, 1910, 867, ...WORLD).zoom).toBe(cameraZoom(1910, 867, ...WORLD))
  })

  it('acercar sube un nivel entero y alejar lo baja', () => {
    const base = cameraZoom(1910, 867, ...WORLD)
    expect(steppedZoom(1, 1910, 867, ...WORLD).zoom).toBe(base + 1)
    expect(steppedZoom(-1, 1910, 867, ...WORLD).zoom).toBe(base - 1)
  })

  it('nunca aleja más de lo que cabe en el mapa ni acerca sin límite', () => {
    const far = steppedZoom(-10, 1910, 867, ...WORLD)
    expect(1910 / far.zoom).toBeLessThanOrEqual(WORLD[0])
    expect(867 / far.zoom).toBeLessThanOrEqual(WORLD[1])
    expect(far.canOut).toBe(false)
    const near = steppedZoom(10, 1910, 867, ...WORLD)
    expect(near.canIn).toBe(false)
    expect(near.steps).toBeLessThan(10)
  })

  it('en un móvil vertical no se puede alejar', () => {
    expect(steppedZoom(-1, 780, 1600, ...WORLD)).toMatchObject({ steps: 0, canOut: false })
  })
})

describe('cameraZoom', () => {
  it('usa zoom entero en móvil, tablet y escritorio', () => {
    ;[[390, 800], [768, 1024], [1910, 867], [3840, 2160]].forEach(([w, h]) => {
      expect(Number.isInteger(cameraZoom(w, h, ...WORLD))).toBe(true)
    })
  })

  it('en móvil vertical ve el valle de cerca', () => {
    expect(cameraZoom(390, 800, ...WORLD)).toBe(2)
  })

  it('nunca enseña más que el mapa', () => {
    ;[[390, 800], [600, 1400], [1910, 867], [2560, 1440]].forEach(([w, h]) => {
      const zoom = cameraZoom(w, h, ...WORLD)
      expect(w / zoom).toBeLessThanOrEqual(WORLD[0])
      expect(h / zoom).toBeLessThanOrEqual(WORLD[1])
    })
  })
})
