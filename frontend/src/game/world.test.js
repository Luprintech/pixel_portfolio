import { describe, expect, it } from 'vitest'
import { BRIDGE, BUILDINGS, COLS, PROPS, ROWS, SPAWN, TILE, blockedWaterTiles, plazaTiles, roadTiles, treePositions, waterTiles } from './world.js'

const footprint = (b) => {
  const tiles = []
  for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) tiles.push(`${x},${y}`)
  return tiles
}

describe('mapa del valle', () => {
  it('los edificios caben en el mapa y no se pisan', () => {
    const used = new Map()
    BUILDINGS.forEach((b) => {
      expect(b.x).toBeGreaterThanOrEqual(0)
      expect(b.y).toBeGreaterThanOrEqual(0)
      expect(b.x + b.w).toBeLessThanOrEqual(COLS)
      expect(b.y + b.h).toBeLessThanOrEqual(ROWS)
      footprint(b).forEach((key) => {
        expect(used.has(key), `${b.id} pisa a ${used.get(key)} en ${key}`).toBe(false)
        used.set(key, b.id)
      })
    })
  })

  it('ningún edificio se levanta sobre un camino, la plaza o el agua', () => {
    const roads = roadTiles()
    const plaza = plazaTiles()
    const water = waterTiles()
    BUILDINGS.forEach((b) => {
      footprint(b).forEach((key) => {
        expect(roads.has(key), `${b.id} sobre un camino en ${key}`).toBe(false)
        expect(plaza.has(key), `${b.id} sobre la plaza en ${key}`).toBe(false)
        expect(water.has(key), `${b.id} sobre el agua en ${key}`).toBe(false)
      })
    })
  })

  it('cada puerta está en un camino, justo bajo su edificio', () => {
    const roads = roadTiles()
    BUILDINGS.forEach((b) => {
      expect(b.door.y).toBe(b.y + b.h)
      expect(roads.has(`${b.door.x},${b.door.y}`), `la puerta de ${b.id} no toca un camino`).toBe(true)
    })
    PROPS.filter((p) => p.zone).forEach((p) => expect(roads.has(`${p.door.x},${p.door.y}`)).toBe(true))
  })

  it('se llega andando desde la entrada a todas las puertas', () => {
    const blocked = new Set([...blockedWaterTiles(), ...BUILDINGS.flatMap(footprint)])
    const seen = new Set()
    const start = `${Math.floor(SPAWN.x / TILE)},${Math.floor(SPAWN.y / TILE)}`
    const queue = [start]
    seen.add(start)
    while (queue.length) {
      const [x, y] = queue.shift().split(',').map(Number)
      ;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const key = `${x + dx},${y + dy}`
        if (x + dx < 0 || y + dy < 0 || x + dx >= COLS || y + dy >= ROWS || blocked.has(key) || seen.has(key)) return
        seen.add(key)
        queue.push(key)
      })
    }
    BUILDINGS.forEach((b) => expect(seen.has(`${b.door.x},${b.door.y}`), `no se llega a la puerta de ${b.id}`).toBe(true))
    PROPS.filter((p) => p.zone).forEach((p) => expect(seen.has(`${p.door.x},${p.door.y}`)).toBe(true))
  })

  it('el puente cruza el arroyo por el camino del este', () => {
    const water = waterTiles()
    const walkable = blockedWaterTiles()
    let crossed = 0
    for (let y = BRIDGE.y; y < BRIDGE.y + BRIDGE.h; y++) {
      for (let x = BRIDGE.x; x < BRIDGE.x + BRIDGE.w; x++) {
        if (water.has(`${x},${y}`)) {
          crossed += 1
          expect(walkable.has(`${x},${y}`)).toBe(false)
        }
      }
    }
    expect(crossed).toBeGreaterThan(0)
  })

  it('los árboles no tapan caminos, agua ni puertas, y son siempre los mismos', () => {
    const roads = roadTiles()
    const water = waterTiles()
    const trees = treePositions()
    expect(treePositions()).toEqual(trees)
    trees.forEach(({ x, y }) => {
      expect(roads.has(`${x},${y}`) && y > 1 && y < ROWS - 1 && x > 0 && x < COLS - 1).toBe(false)
      expect(water.has(`${x},${y}`)).toBe(false)
    })
  })

  it('el acceso a la escalera de la casa de Lupe queda sin árboles', () => {
    const home = BUILDINGS.find((b) => b.terrace)
    const foot = { x: home.x - 4, y: home.y + home.h - 4 }
    const inApproach = treePositions().filter((t) => t.x >= foot.x && t.x < foot.x + 7 && t.y >= foot.y && t.y < foot.y + 6)
    expect(inApproach).toEqual([])
  })
})
