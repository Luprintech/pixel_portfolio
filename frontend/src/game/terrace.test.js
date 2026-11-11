import { describe, expect, it } from 'vitest'
import { DECK, DECK_WIDEN, FOOT, ROOF_ENTRY, STAIRS, STAIR_PACE, STAIR_REACH, TABLE, LUPE_SPOT, TELESCOPE, climb, nearRoofDoor, nearTelescope, stairLift } from './terrace.js'

describe('escalera y cubierta de la casa de Lupe', () => {
  it('el telescopio está dentro de la cubierta y se alcanza desde cualquier lado', () => {
    expect(TELESCOPE.x).toBeGreaterThan(DECK.left)
    expect(TELESCOPE.x).toBeLessThan(DECK.right)
    expect(TELESCOPE.base).toBeGreaterThanOrEqual(DECK.top)
    expect(TELESCOPE.base).toBeLessThanOrEqual(DECK.feet)
    ;[[-12, 0], [12, 0], [0, 6], [0, -1], [-10, 5]].forEach(([dx, dy]) => {
      expect(nearTelescope('deck', TELESCOPE.x + dx, TELESCOPE.base + dy), `dx ${dx}, dy ${dy}`).toBe(true)
    })
  })

  it('solo se ofrece el telescopio en la cubierta y a su alcance', () => {
    expect(nearTelescope('ground', TELESCOPE.x, TELESCOPE.base)).toBe(false)
    expect(nearTelescope('stairs', TELESCOPE.x, TELESCOPE.base)).toBe(false)
    expect(nearTelescope('deck', DECK.left + 1, DECK.feet)).toBe(false)
    expect(nearTelescope('deck', DECK.right, DECK.feet)).toBe(false)
  })

  it('Lupe espera en un sitio libre del entarimado: ni dentro de un mueble ni en la zona de la silla', () => {
    expect(climb('deck', LUPE_SPOT.x, LUPE_SPOT.y)).toMatchObject({ x: LUPE_SPOT.x, y: LUPE_SPOT.y })
    expect(LUPE_SPOT.x).toBeGreaterThan(DECK.left)
    expect(LUPE_SPOT.x).toBeLessThan(DECK.right)
    expect(LUPE_SPOT.y).toBeLessThanOrEqual(DECK.feet)
    expect(nearTelescope('deck', LUPE_SPOT.x, LUPE_SPOT.y)).toBe(false)
  })

  it('la azotea es ancha y honda: una terraza con sitio para andar, no una pasarela', () => {
    expect(DECK.right - DECK.left).toBeGreaterThanOrEqual(100)
    expect(DECK.right - DECK.left).toBeGreaterThan(66 + DECK_WIDEN - 1)
    expect(DECK.feet - DECK.top).toBeGreaterThanOrEqual(16)
  })

  it('el telescopio y la mesa caben en la cubierta y no se pisan', () => {
    expect(TABLE.x - 11).toBeGreaterThan(TELESCOPE.x + 10)
    expect(TABLE.x + 11).toBeLessThan(DECK.right - ROOF_ENTRY)
    expect(TABLE.base).toBeGreaterThanOrEqual(DECK.top)
  })

  it('no se atraviesan el telescopio ni la mesa, y se rodean por delante', () => {
    ;[[TELESCOPE.x, TELESCOPE.base], [TABLE.x, TABLE.base]].forEach(([x, base]) => {
      const spot = climb('deck', x, base - 1)
      expect(Math.hypot(spot.x - x, spot.y - base), `en (${x}, ${base})`).toBeGreaterThanOrEqual(3)
      // Desde delante se llega a su altura y se pasa de largo sin quedarse encajonado.
      expect(climb('deck', x, DECK.feet)).toEqual({ mode: 'deck', x, y: DECK.feet })
    })
  })

  it('al lado del muro de la casa hay una zona de entrada, sin puerta dibujada, a todo lo hondo de la cubierta', () => {
    ;[DECK.top, (DECK.top + DECK.feet) / 2, DECK.feet].forEach((y) => expect(nearRoofDoor('deck', DECK.right, y), `y ${y}`).toBe(true))
    expect(nearRoofDoor('deck', DECK.right - ROOF_ENTRY - 1, DECK.feet)).toBe(false)
    expect(nearRoofDoor('ground', DECK.right, DECK.feet)).toBe(false)
    expect(nearRoofDoor('stairs', DECK.right, DECK.feet)).toBe(false)
    // Donde aparece la viajera al volver de la casa (ver `placeOnDeck`) no se ofrece entrar otra vez.
    expect(nearRoofDoor('deck', DECK.right - 18, DECK.feet)).toBe(false)
  })

  it('la escalera se sube más despacio que el suelo, pero se sube', () => {
    expect(STAIR_PACE).toBeGreaterThan(0)
    expect(STAIR_PACE).toBeLessThan(1)
  })

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

  it('solo se empieza a subir por el primer peldaño: de lado, desde debajo o a media escalera no', () => {
    expect(climb('ground', STAIRS.x + STAIRS.run - 0.5, 156).mode).toBe('stairs')
    ;[STAIRS.x + STAIRS.run, 12, 25, DECK.left - 1].forEach((x) => {
      ;[FOOT.top, 156, STAIRS.bottom].forEach((y) => expect(climb('ground', x, y).mode, `x ${x}, y ${y}`).toBe('ground'))
    })
    expect(climb('ground', 2, STAIRS.bottom + 1).mode).toBe('ground')
  })

  it('subiendo, los pies siguen los peldaños y al final pasan a la cubierta', () => {
    const lane = STAIRS.bottom - stairLift(17)
    expect(climb('stairs', 17, lane)).toEqual({ mode: 'stairs', x: 17, y: lane })
    expect(climb('stairs', DECK.left, DECK.feet)).toEqual({ mode: 'deck', x: DECK.left, y: DECK.feet })
    expect(climb('stairs', -1, 150)).toMatchObject({ mode: 'ground', y: 150 })
  })

  it('se sube por todo el ancho de la escalera, no solo por delante, y se queda dentro de ella', () => {
    const lane = (x) => STAIRS.bottom - stairLift(x)
    // Por detrás, a todo lo que llega la franja, se anda sin que la devuelvan al borde delantero.
    const back = lane(20) - STAIR_REACH.foot / 2
    expect(climb('stairs', 20, back).y).toBe(back)
    // Más allá del borde trasero o del delantero no se pasa.
    expect(climb('stairs', 20, lane(20) - 100).y).toBeGreaterThanOrEqual(lane(20) - STAIR_REACH.foot)
    expect(climb('stairs', 20, lane(20) + 100).y).toBe(lane(20))
    // Andando de lado la franja sube con los peldaños: quien va por detrás sigue por detrás.
    const next = climb('stairs', 24, back, 20)
    expect(next.y).toBeCloseTo(back + lane(24) - lane(20), 5)
  })

  it('se empieza a subir por el primer peldaño desde cualquier punto de su anchura, sin saltos de posición', () => {
    for (let y = FOOT.top; y <= STAIRS.bottom; y += 4) {
      const spot = climb('ground', 1, y)
      expect(spot.mode, `y ${y}`).toBe('stairs')
      expect(Math.abs(spot.y - y), `y ${y}`).toBeLessThanOrEqual(8)
    }
    expect(climb('ground', 1, FOOT.top - 1).mode).toBe('ground')
  })

  it('en la cubierta no se sale de su franja y por la izquierda se vuelve a la escalera', () => {
    expect(climb('deck', 500, 0)).toEqual({ mode: 'deck', x: DECK.right, y: DECK.top })
    expect(climb('deck', 90, 200)).toEqual({ mode: 'deck', x: 90, y: DECK.feet })
    // Se baja desde cualquier punto del borde izquierdo, sin saltar de sitio.
    for (let y = DECK.top; y <= DECK.feet; y += 3) {
      const at = climb('deck', DECK.left - 1, y)
      expect(at.mode, `y ${y}`).toBe('stairs')
      expect(Math.abs(at.y - y), `y ${y}`).toBeLessThanOrEqual(1)
    }
    const down = climb('deck', DECK.left - 1, DECK.feet)
    expect(down.mode).toBe('stairs')
    expect(Math.abs(down.y - DECK.feet)).toBeLessThan(1)
  })
})
