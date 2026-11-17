import { describe, expect, it } from 'vitest'
import { COPY } from '../../lib/valleCopy.js'
import { BUILDINGS, TILE, blockedWaterTiles, plazaTiles, roadTiles } from '../world.js'
import { shiftPx } from '../mapRows.js'
import { HOME_DOOR } from './lupePlaces.js'
import {
  ATREUS_DOOR, ATREUS_PAUSE_MS, ATREUS_REST_MS, CAT_PLAZA, FEED_SPOTS, FILM_SPOTS, FOUNTAIN, PIGEON_COUNT, PIGEON_HOMES, ROUTINES, SUN_SPOTS, TOWN_REGION, WEATHER_ROUTINES,
  benchAt, benchesOfWorld, frontOf, isNight, isRaining, isSunset,
} from './granPlaces.js'

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

  // Los sitios a los que van no pueden caer en agua ni en un edificio (si no, el paso se salta por falta de camino); los de la plaza y los caminos van además
  // sobre suelo de piedra o tierra.
  it('ningún destino cae en el agua ni dentro de un edificio, y los de plaza y casa están sobre camino', () => {
    const walk = new Set([...roadTiles(), ...plazaTiles()])
    const water = blockedWaterTiles()
    const steps = [...Object.values(ROUTINES), ...Object.values(WEATHER_ROUTINES)].flat()
    const spots = [...steps.map((step) => step.to), CAT_PLAZA, ...SUN_SPOTS, ...PIGEON_HOMES]
    ;[ATREUS_DOOR, CAT_PLAZA, ...FEED_SPOTS.map((spot) => spot.to)].forEach(({ x, y }) => expect(walk.has(`${Math.floor(x / TILE)},${Math.floor(y / TILE)}`), `${x},${y} no es camino ni plaza`).toBe(true))
    spots.forEach(({ x, y }) => {
      const tile = [Math.floor(x / TILE), Math.floor(y / TILE)]
      expect(water.has(tile.join(','))).toBe(false)
      expect(BUILDINGS.some((b) => tile[0] >= b.x && tile[0] < b.x + b.w && tile[1] >= b.y && tile[1] < b.y + b.h), `${x},${y} cae dentro de un edificio`).toBe(false)
    })
  })

  it('Grace esparce semillas de pie, en dos sitios libres de la plaza, mirando hacia donde descansan las palomas', () => {
    expect(FEED_SPOTS).toHaveLength(2)
    const feeds = ROUTINES.grace.filter((step) => step.kind === 'feed')
    expect(feeds).toHaveLength(2)
    feeds.forEach((step) => {
      expect(inside(step.to)).toBe(true)
      expect(Math.hypot(step.look.x - step.to.x, step.look.y - step.to.y)).toBeLessThan(60)
      // A un lado de la fuente (su pretil ocupa unos 70 px a cada lado, ver `granCapitanFountain.js`) y cerca de los rincones de las palomas.
      expect(Math.abs(step.to.x - FOUNTAIN.x)).toBeGreaterThan(76)
      expect(Math.min(...PIGEON_HOMES.map((home) => Math.hypot(home.x - step.to.x, home.y - step.to.y)))).toBeLessThan(120)
    })
    // Se sienta y se levanta entre medias: nunca echa de comer sentada.
    const kinds = ROUTINES.grace.map((step) => step.kind)
    expect(kinds.indexOf('sit')).toBeLessThan(kinds.indexOf('feed'))
  })

  it('el paseo de Atreus sale por la puerta de su casa, recorre plaza, puente y orilla, se sienta y vuelve a la puerta', () => {
    const steps = ROUTINES.atreus
    expect(ATREUS_DOOR).toBe(HOME_DOOR)
    expect(steps.at(-1)).toMatchObject({ kind: 'home', home: true, to: ATREUS_DOOR })
    expect(steps.filter((step) => step.kind === 'look').map((step) => step.topic)).toEqual(['plaza', 'bridge', 'river'])
    expect(steps.some((step) => step.kind === 'sit')).toBe(true)
    // Descansa en casa más de un minuto entre paseos, y entre paradas solo unos segundos.
    expect(ATREUS_REST_MS[0]).toBeGreaterThanOrEqual(60000)
    expect(ATREUS_PAUSE_MS[1]).toBeLessThan(10000)
    steps.slice(0, -1).forEach((step) => expect(inside(step.to)).toBe(true))
  })

  it('con lluvia Ylonem y Grace se refugian en la fachada del IES y Atreus vuelve; al atardecer Ylonem filma el cielo', () => {
    ;[WEATHER_ROUTINES.ylonemRain[0], WEATHER_ROUTINES.graceRain[0]].forEach((step) => {
      expect(step.kind).toBe('shelter')
      expect(step.to.y).toBeLessThan(shiftPx(330))
    })
    expect(WEATHER_ROUTINES.atreusHome).toEqual([expect.objectContaining({ home: true, to: ATREUS_DOOR })])
    expect(WEATHER_ROUTINES.ylonemSunset[0]).toMatchObject({ kind: 'film', topic: 'sunset' })
    expect(WEATHER_ROUTINES.ylonemSunset[0].look.x).toBeLessThan(WEATHER_ROUTINES.ylonemSunset[0].to.x)
  })

  it('Ylonem graba el paisaje, la fuente, las palomas, el río y los naranjos', () => {
    expect(new Set(FILM_SPOTS.map((spot) => spot.topic))).toEqual(new Set(['landscape', 'fountain', 'pigeons', 'river', 'trees']))
  })

  it('cada tema de lo que graba tiene bocadillos en los dos idiomas, y el paseo de Atreus sus cuatro frases', () => {
    const topics = [...new Set([...FILM_SPOTS.map((spot) => spot.topic), 'sunset', 'rain', 'cat'])]
    ;['es', 'en'].forEach((lang) => {
      topics.forEach((topic) => {
        const key = `ylonem${topic[0].toUpperCase()}${topic.slice(1)}`
        expect(COPY[lang].bubbles[key]?.length, `${key} ${lang}`).toBeGreaterThanOrEqual(2)
      })
      expect(COPY[lang].bubbles.atreusWalk).toHaveLength(4)
    })
  })

  it('el tiempo se lee del cielo: lluvia, noche y atardecer', () => {
    expect(isRaining({ rain: 0.5 })).toBe(true)
    expect(isRaining({ rain: 0.1 })).toBe(false)
    expect(isRaining(null)).toBe(false)
    expect(isNight({ dark: 0.9 })).toBe(true)
    expect(isNight({ dark: 0.2 })).toBe(false)
    expect(isSunset({ phase: 0.7, rain: 0 })).toBe(true)
    expect(isSunset({ phase: 0.3, rain: 0 })).toBe(false)
    expect(isSunset({ phase: 0.7, rain: 0.8 })).toBe(false)
  })

  it('lo que Grace echa cae delante de ella, hacia donde mira', () => {
    const point = frontOf({ x: 100, y: 100 }, { x: 140, y: 100 }, 22)
    expect(point).toEqual({ x: 122, y: 100 })
    expect(frontOf({ x: 5, y: 5 }, { x: 5, y: 5 }, 10)).toEqual({ x: 5, y: 5 })
  })
})
