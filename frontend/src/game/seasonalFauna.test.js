import { describe, expect, it } from 'vitest'
import { seeded } from './palette.js'
import { signedDistance } from './river.js'
import { decorSpots, edgeTiles } from './seasonDecor.js'
import {
  DRAGONFLIES,
  DUCKS,
  FAUNA_LEVELS,
  SQUIRREL,
  createDragonfly,
  createDuck,
  createFireflies,
  createRobin,
  createSquirrel,
  duckHomes,
  fireflyAt,
  fireflyHomes,
  robinPerches,
  stepDragonfly,
  stepDuck,
  stepRobin,
  stepSquirrel,
} from './seasonalFauna.js'
import { BUILDINGS, PROPS, TILE, plazaTiles, roadTiles, waterTiles } from './world.js'

const sky = (patch) => ({ dark: 0, rain: 0, snow: 0, snowCover: 0, summer: 0, autumn: 0, winter: 0, ...patch })
const SPRING = sky()
const SUMMER = sky({ summer: 1 })
const AUTUMN = sky({ autumn: 1 })
const WINTER = sky({ winter: 1 })

describe('qué fauna hay en cada estación', () => {
  it('cada animal sale en su estación y a su hora, y en ninguna otra', () => {
    expect(FAUNA_LEVELS.ducks(SPRING)).toBe(1)
    expect(FAUNA_LEVELS.ducks(SUMMER)).toBe(0)
    expect(FAUNA_LEVELS.dragonflies(SUMMER)).toBe(1)
    expect(FAUNA_LEVELS.dragonflies(sky({ summer: 1, dark: 0.9 }))).toBe(0)
    expect(FAUNA_LEVELS.dragonflies(SPRING)).toBe(0)
    expect(FAUNA_LEVELS.fireflies(sky({ summer: 1, dark: 0.9 }))).toBeGreaterThan(0.9)
    expect(FAUNA_LEVELS.fireflies(SUMMER)).toBe(0)
    expect(FAUNA_LEVELS.fireflies(sky({ dark: 0.9 }))).toBe(0)
    expect(FAUNA_LEVELS.squirrel(AUTUMN)).toBe(1)
    expect(FAUNA_LEVELS.squirrel(SUMMER)).toBe(0)
    expect(FAUNA_LEVELS.robin(WINTER)).toBe(1)
    expect(FAUNA_LEVELS.robin(sky({ winter: 1, snow: 0.8 }))).toBe(0)
    expect(FAUNA_LEVELS.robin(AUTUMN)).toBe(0)
  })

  it('la lluvia y la noche los esconden y sin cielo no hay nada', () => {
    expect(FAUNA_LEVELS.squirrel(sky({ autumn: 1, rain: 0.8 }))).toBe(0)
    expect(FAUNA_LEVELS.dragonflies(sky({ summer: 1, rain: 0.5 }))).toBe(0)
    Object.values(FAUNA_LEVELS).forEach((level) => expect(level(null)).toBe(0))
  })
})

describe('patos', () => {
  it('viven en agua abierta, lejos de los puentes y del sitio de pesca', () => {
    duckHomes().forEach((home) => expect(signedDistance(home.x, home.y)).toBeGreaterThan(DUCKS.bank))
  })

  it('aparecen de vez en cuando, nadan solo por el agua y no existen fuera de la primavera', () => {
    const rng = seeded(5)
    const duck = createDuck(duckHomes()[0], rng, 0)
    let visibleMs = 0
    for (let t = 0; t < 600000; t += 100) {
      stepDuck(duck, 100, 1, rng)
      if (duck.presence.alpha > 0) {
        visibleMs += 100
        expect(signedDistance(duck.x, duck.y)).toBeGreaterThan(4)
      }
    }
    expect(visibleMs).toBeGreaterThan(0)
    expect(visibleMs).toBeLessThan(600000)
    // Sin primavera se van y no vuelven.
    for (let t = 0; t < 10000; t += 100) stepDuck(duck, 100, 0, rng)
    expect(duck.presence.alpha).toBe(0)
  })
})

describe('libélulas y luciérnagas', () => {
  it('las libélulas se quedan sobre el agua de la piscina', () => {
    const rng = seeded(9)
    const center = { x: 128, y: 736 }
    const fly = createDragonfly(center, rng, 0)
    for (let t = 0; t < 300000; t += 50) {
      stepDragonfly(fly, 50, 1, rng)
      expect(Math.abs(fly.x - center.x)).toBeLessThanOrEqual(DRAGONFLIES.area.x + 20)
      expect(Math.abs(fly.y - center.y)).toBeLessThanOrEqual(DRAGONFLIES.area.y + 20)
    }
  })

  it('las luciérnagas se encienden y se apagan y no se alejan de su sitio', () => {
    const flies = createFireflies(fireflyHomes())
    expect(flies.length).toBeGreaterThanOrEqual(12)
    const glows = new Set()
    flies.forEach((fly) => {
      for (let ms = 0; ms < 20000; ms += 250) {
        const at = fireflyAt(fly, ms)
        glows.add(at.glow > 0.5)
        expect(Math.hypot(at.x - fly.home.x, at.y - fly.home.y)).toBeLessThan(40)
      }
    })
    expect(glows.size).toBe(2)
  })
})

describe('ardilla', () => {
  it('sale cerca de los institutos, se queda dentro de su franja de césped y se va sola', () => {
    const rng = seeded(3)
    const zone = SQUIRREL.zones[0]
    const traveller = { x: (zone.x0 + zone.x1) / 2 + 160, y: (zone.y0 + zone.y1) / 2 }
    const sq = createSquirrel(rng)
    const seen = new Set()
    let appearances = 0
    let last = 'away'
    for (let t = 0; t < 900000; t += 50) {
      stepSquirrel(sq, 50, 1, traveller, rng)
      seen.add(sq.state)
      if (last === 'away' && sq.state === 'in') appearances++
      last = sq.state
      if (sq.state !== 'away') {
        expect(sq.x).toBeGreaterThanOrEqual(sq.zone.x0 - 1)
        expect(sq.x).toBeLessThanOrEqual(sq.zone.x1 + 1)
        expect(sq.y).toBeGreaterThanOrEqual(sq.zone.y0 - 1)
        expect(sq.y).toBeLessThanOrEqual(sq.zone.y1 + 1)
      }
    }
    expect(seen).toContain('sit')
    expect(appearances).toBeGreaterThan(2)
    // Aparece de vez en cuando, no todo el rato.
    expect(appearances).toBeLessThan(40)
  })

  it('no sale si la viajera está lejos y huye si se le acerca', () => {
    const rng = seeded(8)
    const far = { x: 5000, y: 5000 }
    const sq = createSquirrel(rng)
    for (let t = 0; t < 200000; t += 100) stepSquirrel(sq, 100, 1, far, rng)
    expect(sq.state).toBe('away')
    const near = { x: (SQUIRREL.zones[0].x0 + SQUIRREL.zones[0].x1) / 2 + 100, y: (SQUIRREL.zones[0].y0 + SQUIRREL.zones[0].y1) / 2 }
    for (let t = 0; t < 120000 && sq.state !== 'in'; t += 100) stepSquirrel(sq, 100, 1, near, rng)
    expect(sq.state).toBe('in')
    // Sin otoño se va aunque esté a medias.
    for (let t = 0; t < 30000; t += 100) stepSquirrel(sq, 100, 0, near, rng)
    expect(sq.state).toBe('away')
  })
})

describe('petirrojo', () => {
  it('tiene perchas en la plaza y salta de una a otra sin posarse junto a la viajera', () => {
    const perches = robinPerches(PROPS)
    expect(perches.length).toBeGreaterThanOrEqual(6)
    const rng = seeded(21)
    const traveller = { x: 45 * TILE, y: 39.5 * TILE }
    const robin = createRobin(perches, rng)
    const landed = new Set()
    for (let t = 0; t < 900000; t += 50) {
      stepRobin(robin, 50, 1, perches, traveller, rng)
      if (robin.state === 'perch' && robin.presence.alpha > 0) landed.add(robin.perch)
    }
    expect(landed.size).toBeGreaterThan(1)
  })
})

describe('flores y hojas de los bordes de los caminos', () => {
  const tiles = edgeTiles()
  const flat = new Set([...roadTiles(), ...plazaTiles()])
  const water = waterTiles()
  const tileOf = (spot) => `${Math.floor(spot.x / TILE)},${Math.floor(spot.y / TILE)}`

  it('hay muchas, siempre las mismas y nunca sobre un camino, el agua o un edificio', () => {
    ;['flowers', 'leaves'].forEach((layer) => {
      const spots = decorSpots(layer, tiles)
      expect(spots.length).toBeGreaterThan(150)
      expect(decorSpots(layer, tiles)).toEqual(spots)
      spots.forEach((spot) => {
        const key = tileOf(spot)
        expect(flat.has(key), `${layer} ${key} sobre camino`).toBe(false)
        expect(water.has(key), `${layer} ${key} sobre agua`).toBe(false)
        const [x, y] = key.split(',').map(Number)
        expect(BUILDINGS.some((b) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h), `${layer} ${key} sobre edificio`).toBe(false)
      })
    })
  })

  it('cada pieza está junto a un camino o la plaza', () => {
    decorSpots('flowers', tiles).forEach((spot) => {
      const [x, y] = tileOf(spot).split(',').map(Number)
      expect([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => flat.has(`${x + dx},${y + dy}`))).toBe(true)
    })
  })
})
