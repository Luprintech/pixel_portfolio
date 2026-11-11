import { describe, expect, it } from 'vitest'
import { bandDirections, heldDirections } from './touchDirections'

describe('heldDirections', () => {
  it('con el joystick en el centro no hay nada pulsado', () => {
    expect([...heldDirections(0, 0, false)]).toEqual([])
    expect([...heldDirections(0.2, -0.3, false)]).toEqual([])
  })

  it('pasado el umbral se pulsa la dirección, y las diagonales pulsan dos', () => {
    expect([...heldDirections(-1, 0, false)]).toEqual(['left'])
    expect([...heldDirections(0.8, 0.8, false)].sort()).toEqual(['down', 'right'])
  })

  it('un pulgar algo torcido hacia arriba no añade un paso lateral', () => {
    expect([...heldDirections(0.4, -0.9, false)]).toEqual(['up'])
    expect([...heldDirections(-0.4, 0.9, false)]).toEqual(['down'])
    expect([...heldDirections(0.9, -0.4, false)]).toEqual(['right'])
  })

  it('una diagonal clara se conserva', () => {
    expect([...heldDirections(0.6, -0.9, false)].sort()).toEqual(['right', 'up'])
  })

  it('en un juego de lado a lado se ignora la vertical', () => {
    expect([...heldDirections(0.9, -0.9, true)]).toEqual(['right'])
  })
})

describe('bandDirections', () => {
  it('la mitad izquierda de la banda es izquierda y la derecha, derecha', () => {
    expect([...bandDirections(0)]).toEqual(['left'])
    expect([...bandDirections(0.49)]).toEqual(['left'])
    expect([...bandDirections(0.5)]).toEqual(['right'])
    expect([...bandDirections(1)]).toEqual(['right'])
  })

  it('fuera de la banda se toma el extremo más cercano', () => {
    expect([...bandDirections(-0.4)]).toEqual(['left'])
    expect([...bandDirections(1.6)]).toEqual(['right'])
  })
})
