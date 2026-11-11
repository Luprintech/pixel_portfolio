import { describe, expect, it } from 'vitest'
import { INTERACTIONS, LUPE_TOWER_X, WALL_X, interactionAt } from '../homeLayout.js'
import { FURNITURE } from './index.js'
import { NAS, NAS_ACTIVITY, paintNas } from './nas.js'

function paint(frame) {
  const pixels = new Map()
  const g = { fillStyle: '#000', fillRect(x, y, w, h) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) pixels.set(`${x + i},${y + j}`, this.fillStyle) } }
  paintNas(g, 0, 0, frame)
  return pixels
}

describe('NAS Synology', () => {
  it('es una caja vertical que cabe sobre la torre de la mesa de Lupe', () => {
    expect(NAS.h).toBeGreaterThan(NAS.w)
    expect(NAS.w).toBeLessThanOrEqual(14)
    // La torre empieza en la fila 18 de la mesa: el NAS (con sus pies) queda por encima, dentro del lienzo.
    expect(18 - NAS.h).toBeGreaterThanOrEqual(0)
    expect(FURNITURE.lupeDesk.h).toBeGreaterThanOrEqual(18)
  })

  it('los LED de actividad parpadean de vez en cuando y no a la vez', () => {
    const frames = Array.from({ length: 4 }, (_, i) => paint(i))
    const lit = (pixels, bay) => pixels.get(`${2 + bay * 4},9`) === '#6dff9b'
    ;[0, 1].forEach((bay) => {
      const states = frames.map((pixels) => lit(pixels, bay))
      expect(states.some(Boolean), `bahía ${bay}`).toBe(true)
      expect(states.some((on) => !on), `bahía ${bay}`).toBe(true)
    })
    expect(NAS_ACTIVITY[0]).not.toEqual(NAS_ACTIVITY[1])
  })

  it('el halo de los LED es tenue (semitransparente)', () => {
    const halos = [...paint(0).values()].filter((color) => color.startsWith('rgba'))
    expect(halos.length).toBeGreaterThan(0)
    halos.forEach((color) => expect(Number(color.match(/,([\d.]+)\)/)[1])).toBeLessThanOrEqual(0.35))
  })

  it('tiene su propia zona de uso, delante de la torre, distinta de la del ordenador', () => {
    const nas = INTERACTIONS.find((interaction) => interaction.id === 'nas')
    expect(nas.zones[0].x + nas.zones[0].w / 2).toBe(LUPE_TOWER_X)
    expect(interactionAt(LUPE_TOWER_X, 90)).toBe('nas')
    // Más abajo, delante de la silla, a los lados y a la derecha de la mesa sigue siendo el ordenador.
    expect(interactionAt(LUPE_TOWER_X, 110)).toBe('pc')
    expect(interactionAt(WALL_X.lupeDesk - 57, 90)).toBe('pc')
    expect(interactionAt(WALL_X.lupeDesk - 20, 90)).toBe('pc')
    expect(interactionAt(WALL_X.lupeDesk + 30, 90)).toBe('pc')
    expect(interactionAt(WALL_X.lupeDesk, 110, 'down')).not.toBe('nas')
  })
})
