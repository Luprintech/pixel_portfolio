import { describe, expect, it } from 'vitest'
import { heldDirections } from './touchDirections'

describe('heldDirections', () => {
  it('con el joystick en el centro no hay nada pulsado', () => {
    expect([...heldDirections(0, 0, false)]).toEqual([])
    expect([...heldDirections(0.2, -0.3, false)]).toEqual([])
  })

  it('pasado el umbral se pulsa la dirección, y las diagonales pulsan dos', () => {
    expect([...heldDirections(-1, 0, false)]).toEqual(['left'])
    expect([...heldDirections(0.8, 0.8, false)].sort()).toEqual(['down', 'right'])
  })

  it('en un juego de lado a lado se ignora la vertical', () => {
    expect([...heldDirections(0.9, -0.9, true)]).toEqual(['right'])
  })
})
