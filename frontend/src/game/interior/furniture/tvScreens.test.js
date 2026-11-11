import { describe, expect, it } from 'vitest'
import { CHANNEL_SCENES, SCREEN, TV_CHANNELS, TV_FRAMES, TV_MODES, paintScreen } from './tvScreens.js'

// Lienzo falso: apunta el color de cada píxel pintado (las pantallas solo usan `fillRect` y `fillStyle`).
function canvas() {
  const pixels = new Map()
  const g = {
    fillStyle: '#000',
    fillRect(x, y, w, h) {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) pixels.set(`${x + i},${y + j}`, this.fillStyle.toLowerCase())
    },
  }
  return { g, pixels }
}
const paint = (frame) => {
  const c = canvas()
  paintScreen(c.g, frame)
  return c.pixels
}
const count = (pixels, color) => [...pixels.values()].filter((value) => value === color).length

describe('pantallas de la tele', () => {
  it('cada canal tiene sus fotogramas seguidos y el total cuadra', () => {
    const all = TV_CHANNELS.flatMap((id) => TV_MODES[id])
    expect(all).toEqual(Array.from({ length: all.length }, (_, i) => i + 1))
    expect(TV_FRAMES).toBe(all.length + 1)
    TV_CHANNELS.forEach((id) => expect(TV_MODES[id].length, id).toBe(CHANNEL_SCENES[id].length))
  })

  it('todas las escenas pintan dentro de la pantalla y la cubren entera', () => {
    for (let frame = 0; frame < TV_FRAMES; frame++) {
      const pixels = paint(frame)
      pixels.forEach((_, key) => {
        const [x, y] = key.split(',').map(Number)
        expect(x, `fotograma ${frame}`).toBeGreaterThanOrEqual(SCREEN.x)
        expect(x, `fotograma ${frame}`).toBeLessThan(SCREEN.x + SCREEN.w)
        expect(y, `fotograma ${frame}`).toBeGreaterThanOrEqual(SCREEN.y)
        expect(y, `fotograma ${frame}`).toBeLessThan(SCREEN.y + SCREEN.h)
      })
      expect(pixels.size, `fotograma ${frame}`).toBe(SCREEN.w * SCREEN.h)
    }
  })

  it('Netflix enseña primero su logo rojo y después Breaking Bad en verde y blanco', () => {
    const [logoA, , bbA] = TV_MODES.netflix
    expect(count(paint(logoA), '#e5252a')).toBeGreaterThan(10)
    expect(count(paint(logoA), '#0f6b34')).toBe(0)
    const bb = paint(bbA)
    expect(count(bb, '#0f6b34')).toBeGreaterThan(150)
    expect(count(bb, '#f1ece2')).toBeGreaterThan(300)
  })

  it('HBO Max enseña HBO y max y después Game of Thrones en negro sobre claro', () => {
    const [hbo, , got] = TV_MODES.max
    expect(count(paint(hbo), '#f1ece2')).toBeGreaterThan(40)
    expect(count(paint(hbo), '#b99cff') + count(paint(hbo), '#c9b3ff')).toBeGreaterThan(20)
    expect(count(paint(got), '#111111')).toBeGreaterThan(80)
  })

  it('Plex usa el naranja de la marca y YouTube enseña el canal con sus tres miniaturas', () => {
    expect(count(paint(TV_MODES.plex[0]), '#e5a00d')).toBeGreaterThan(15)
    const channel = paint(TV_MODES.youtube[0])
    ;['#7a2fb0', '#1a2a1a', '#1f5fd0'].forEach((color) => expect(count(channel, color), color).toBeGreaterThan(20))
  })
})
