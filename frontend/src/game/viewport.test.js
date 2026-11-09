import { describe, expect, it } from 'vitest'
import { cameraZoom } from './viewport.js'

const WORLD = [896, 480]

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
