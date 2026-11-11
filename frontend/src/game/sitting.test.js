import { describe, expect, it, vi } from 'vitest'
import { printStepNotes } from '../lib/printerSound.js'
import { RETRO_SOUNDS } from '../lib/retroSound.js'
import { SIT_POSE, frameName } from './avatar/index.js'
import { sitDown, standUp } from './sitting.js'
import { DECK, nearRoofDoor } from './terrace.js'

// Sprite de mentira con lo que usa el módulo: posición, recorte, fotograma, profundidad y cuerpo físico.
function fakeSprite(x, y) {
  return {
    x,
    y,
    body: { setVelocity: vi.fn(), enable: true, reset: vi.fn() },
    setPosition(nx, ny) {
      this.x = nx
      this.y = ny
    },
    setFrame: vi.fn(),
    setDepth: vi.fn(),
  }
}

describe('sentarse', () => {
  const seat = { x: 100, y: 80, facing: 'up', depth: 90.5 }

  it('coloca a la viajera en el asiento con la pose sentada y apaga su cuerpo físico', () => {
    const sprite = fakeSprite(100, 120)
    const shadow = { setVisible: vi.fn() }
    const from = sitDown(sprite, shadow, seat)
    expect(from).toEqual({ x: 100, y: 120 })
    expect([sprite.x, sprite.y]).toEqual([100, 80])
    expect(sprite.setFrame).toHaveBeenCalledWith(frameName('up', SIT_POSE))
    expect(sprite.setDepth).toHaveBeenCalledWith(90.5)
    expect(sprite.body.enable).toBe(false)
    expect(shadow.setVisible).toHaveBeenCalledWith(false)
  })

  it('al levantarse vuelve a donde estaba y recupera el cuerpo', () => {
    const sprite = fakeSprite(100, 120)
    const shadow = { setVisible: vi.fn() }
    const from = sitDown(sprite, shadow, seat)
    standUp(sprite, shadow, from)
    expect(sprite.body.enable).toBe(true)
    expect(sprite.body.reset).toHaveBeenCalledWith(100, 120)
    expect(shadow.setVisible).toHaveBeenLastCalledWith(true)
  })
})

describe('puerta de la cubierta', () => {
  it('se alcanza solo desde el suelo de la cubierta, pegada al muro de la casa', () => {
    expect(nearRoofDoor('deck', DECK.right - 4, DECK.feet)).toBe(true)
    expect(nearRoofDoor('deck', DECK.left + 4, DECK.feet)).toBe(false)
    expect(nearRoofDoor('ground', DECK.right - 4, DECK.feet)).toBe(false)
    expect(nearRoofDoor('stairs', DECK.right - 4, DECK.feet)).toBe(false)
  })
})

describe('sonidos de la casa', () => {
  it('cada movimiento del cabezal suena suave, y la capa nueva añade el golpe del eje', () => {
    for (let sweep = 0; sweep < 4; sweep++) {
      const notes = printStepNotes({ sweep, layer: false })
      expect(notes.length).toBeGreaterThan(0)
      notes.forEach((note) => expect(note.volume, `tramo ${sweep}`).toBeLessThanOrEqual(0.05))
    }
    expect(printStepNotes({ sweep: 0, layer: true }).length).toBe(printStepNotes({ sweep: 0, layer: false }).length + 1)
    // Ida y vuelta suenan distinto: el motor sube de tono hacia la derecha y baja al volver.
    const rising = printStepNotes({ sweep: 0, layer: false })[0]
    const falling = printStepNotes({ sweep: 3, layer: false })[0]
    expect(rising.to).toBeGreaterThan(rising.freq)
    expect(falling.to).toBeLessThan(falling.freq)
  })

  it('cada suceso del juego retro tiene su sonido', () => {
    ;['swing', 'hit', 'kill', 'hurt', 'chest', 'pickup', 'door', 'locked', 'stairs', 'room', 'dialog', 'dead', 'win'].forEach((type) => {
      expect(RETRO_SOUNDS[type], type).toBeTruthy()
    })
  })
})
