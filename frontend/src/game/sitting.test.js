import { describe, expect, it, vi } from 'vitest'
import { printerNotes } from '../lib/printerSound.js'
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
  it('la impresora siempre suena y a veces añade el barrido del eje', () => {
    for (let tick = 0; tick < 12; tick++) expect(printerNotes(tick).length).toBeGreaterThan(0)
    expect(printerNotes(5).some((note) => note.to)).toBe(true)
    expect(printerNotes(1).some((note) => note.to)).toBe(false)
  })

  it('cada suceso del juego retro tiene su sonido', () => {
    ;['swing', 'hit', 'kill', 'hurt', 'chest', 'pickup', 'door', 'locked', 'stairs', 'room', 'dialog', 'dead', 'win'].forEach((type) => {
      expect(RETRO_SOUNDS[type], type).toBeTruthy()
    })
  })
})
