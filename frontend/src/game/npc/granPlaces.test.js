import { describe, expect, it } from 'vitest'
import { COPY } from '../../lib/valleCopy.js'
import { benchesOfWorld, FILM_SPOTS, PIGEON_COUNT, PIGEON_HOMES, ROUTINES, TOWN_REGION, benchAt } from './granPlaces.js'

const inside = ({ x, y }) => x > TOWN_REGION.x && x < TOWN_REGION.x + TOWN_REGION.width && y > TOWN_REGION.y && y < TOWN_REGION.y + TOWN_REGION.height

describe('rutinas de Ylonem y Grace', () => {
  it('Grace se sienta en bancos que existen en el mapa, en un asiento sobre el banco y con su sitio delante', () => {
    const sits = ROUTINES.grace.filter((step) => step.kind === 'sit')
    expect(sits.length).toBeGreaterThan(0)
    sits.forEach(({ bench, to }) => {
      expect(to).toEqual(bench.front)
      expect(bench.front.y).toBeGreaterThan(bench.seat.y)
      expect(bench.seat.facing).toBe('down')
      expect(inside(bench.front)).toBe(true)
    })
    const real = benchesOfWorld().map((at) => JSON.stringify(benchAt(at).seat))
    sits.forEach(({ bench }) => expect(real, 'banco que no existe en world.js').toContain(JSON.stringify(bench.seat)))
  })

  it('Ylonem recorre varios rincones, todos dentro de la rejilla, y graba hacia un motivo cercano', () => {
    expect(ROUTINES.ylonem.length).toBeGreaterThanOrEqual(4)
    ROUTINES.ylonem.forEach((step) => {
      expect(step.kind).toBe('film')
      expect(inside(step.to)).toBe(true)
      expect(Math.hypot(step.look.x - step.to.x, step.look.y - step.to.y)).toBeLessThan(120)
      expect(step.ms[0]).toBeLessThanOrEqual(step.ms[1])
    })
    expect(FILM_SPOTS).toHaveLength(ROUTINES.ylonem.length)
  })

  it('todo paso tiene sitio dentro de la rejilla y un tiempo razonable', () => {
    Object.values(ROUTINES).flat().forEach((step) => {
      expect(inside(step.to)).toBe(true)
      expect(step.ms[1]).toBeGreaterThanOrEqual(step.ms[0])
    })
  })

  it('las palomas tienen rincones dentro de la rejilla y hay más de una', () => {
    expect(PIGEON_COUNT).toBeGreaterThan(1)
    PIGEON_HOMES.forEach((home) => expect(inside(home)).toBe(true))
  })

  it('los bocadillos de Grace existen en los dos idiomas', () => {
    ;['es', 'en'].forEach((lang) => {
      ;['graceCat', 'gracePigeons'].forEach((key) => {
        expect(COPY[lang].bubbles[key].length, `${key} ${lang}`).toBeGreaterThanOrEqual(3)
      })
      expect(JSON.stringify(COPY[lang].bubbles.graceCat)).toContain('Khalessi')
    })
  })
})
