import { describe, expect, it } from 'vitest'
import { DECK, FOOT, STAIRS, climb, stairLift } from './terrace.js'

describe('escalera y cubierta de la casa de Lupe', () => {
  it('la rampa llega a ras de la cubierta y del suelo, sin saltos', () => {
    expect(stairLift(STAIRS.x)).toBe(0)
    expect(STAIRS.bottom - stairLift(DECK.left)).toBe(DECK.feet)
    let previous = stairLift(STAIRS.x)
    for (let x = STAIRS.x + 0.5; x <= DECK.left; x += 0.5) {
      const lift = stairLift(x)
      expect(Math.abs(lift - previous), `salto en x=${x}`).toBeLessThanOrEqual(1.5)
      previous = lift
    }
  })

  it('fuera de la escalera la altura es la de sus extremos', () => {
    expect(stairLift(-3)).toBe(0)
    expect(stairLift(DECK.left + 20)).toBe(STAIRS.rise * STAIRS.steps)
  })

  it('desde el suelo se sube por el pie de la escalera y no por delante de los peldaños altos', () => {
    expect(climb('ground', -2, 158).mode).toBe('ground')
    expect(climb('ground', 2, 158).mode).toBe('stairs')
    expect(climb('ground', 2, FOOT.top - 4).mode).toBe('ground')
    expect(climb('ground', 20, STAIRS.bottom + 6).mode).toBe('ground')
  })

  it('subiendo, los pies siguen los peldaños y al final pasan a la cubierta', () => {
    const mid = climb('stairs', 17, 130)
    expect(mid).toEqual({ mode: 'stairs', x: 17, y: STAIRS.bottom - stairLift(17) })
    expect(climb('stairs', DECK.left, 120)).toEqual({ mode: 'deck', x: DECK.left, y: DECK.feet })
    expect(climb('stairs', -1, 150)).toMatchObject({ mode: 'ground', y: STAIRS.bottom })
  })

  it('en la cubierta no se sale de su franja y por la izquierda se vuelve a la escalera', () => {
    expect(climb('deck', 500, 0)).toEqual({ mode: 'deck', x: DECK.right, y: DECK.top })
    expect(climb('deck', 70, 200)).toEqual({ mode: 'deck', x: 70, y: DECK.feet })
    const down = climb('deck', DECK.left - 1, DECK.feet)
    expect(down.mode).toBe('stairs')
    expect(Math.abs(down.y - DECK.feet)).toBeLessThan(1)
  })
})
