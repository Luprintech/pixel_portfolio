import { describe, expect, it } from 'vitest'
import { cameraZoom, roomCover, steppedRoomZoom, steppedZoom } from './viewport.js'

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

describe('roomCover', () => {
  it('llena la pantalla: la sala cubre el ancho y el alto', () => {
    ;[[1280, 720], [1920, 1080], [750, 1500], [1024, 768], [390, 844]].forEach(([w, h]) => {
      const zoom = roomCover(w, h, 384, 224)
      expect(384 * zoom, `${w}x${h}`).toBeGreaterThanOrEqual(w)
      expect(224 * zoom, `${w}x${h}`).toBeGreaterThanOrEqual(h)
    })
  })

  it('en horizontal se ajusta al ancho y en vertical al alto', () => {
    expect(roomCover(1920, 1080, 384, 224)).toBe(5)
    expect(roomCover(750, 1500, 384, 224)).toBeCloseTo(6.75, 2)
  })

  it('nunca baja de 1', () => {
    expect(roomCover(100, 100, 384, 224)).toBe(1)
  })
})

describe('steppedRoomZoom', () => {
  it('sin pulsar nada llena la pantalla', () => {
    expect(steppedRoomZoom(0, 750, 1500, 384, 224).zoom).toBe(roomCover(750, 1500, 384, 224))
  })

  it('acercar sube y tiene tope; alejar baja hasta ver la sala entera', () => {
    const base = steppedRoomZoom(0, 750, 1500, 384, 224)
    expect(steppedRoomZoom(1, 750, 1500, 384, 224).zoom).toBeGreaterThan(base.zoom)
    expect(steppedRoomZoom(9, 750, 1500, 384, 224).canIn).toBe(false)
    const far = steppedRoomZoom(-9, 750, 1500, 384, 224)
    expect(far.canOut).toBe(false)
    // En el nivel más lejano la sala entera cabe en la pantalla (sobra a los lados: la cámara la centra).
    expect(384 * far.zoom).toBeLessThanOrEqual(750)
    expect(224 * far.zoom).toBeLessThanOrEqual(1500)
    expect(far.zoom).toBeLessThan(base.zoom)
  })

  it('en una pantalla casi igual que la sala apenas hay donde alejar', () => {
    expect(steppedRoomZoom(-3, 1152, 672, 384, 224).zoom).toBeGreaterThanOrEqual(3)
  })
})
