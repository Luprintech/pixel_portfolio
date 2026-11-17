import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_LOOK } from './look'
import { clearSave, loadSave, writeSave } from './save'
import { BUILDINGS, SPAWN, TILE, waterTiles } from './world.js'
import { fromTemplateSave, migrateWorld, resumePoint, sanitizeWorld } from './worldSave.js'

const world = { seed: 123456, ms: 98765, x: 600, y: 700 }

describe('estado del valle guardado', () => {
  it('acepta un estado completo y rechaza lo que no tiene forma de mundo', () => {
    expect(sanitizeWorld(world)).toEqual(world)
    expect(sanitizeWorld(null)).toBeNull()
    expect(sanitizeWorld({ ...world, ms: -1 })).toBeNull()
    expect(sanitizeWorld({ ...world, x: 99999 })).toBeNull()
    expect(sanitizeWorld({ ...world, seed: 1.5 })).toBeNull()
    expect(sanitizeWorld({ ...world, y: '700' })).toBeNull()
    expect(sanitizeWorld({ ...world, ms: Infinity })).toBeNull()
  })

  it('reanuda en el mismo punto si está libre', () => {
    expect(resumePoint({ x: SPAWN.x, y: SPAWN.y })).toEqual({ x: SPAWN.x, y: SPAWN.y })
  })

  it('si el punto cae dentro de un edificio, sale por su puerta', () => {
    const lupe = BUILDINGS.find((b) => b.id === 'about')
    const onDeck = { x: (lupe.x + 3) * TILE, y: (lupe.y + 2) * TILE }
    expect(resumePoint(onDeck)).toEqual({ x: lupe.door.x * TILE + TILE / 2, y: lupe.door.y * TILE + 6 })
  })

  it('si el punto cae en el agua, vuelve a la entrada', () => {
    const [tile] = [...waterTiles()]
    const [tx, ty] = tile.split(',').map(Number)
    expect(resumePoint({ x: tx * TILE + 4, y: ty * TILE + 4 })).toEqual({ x: SPAWN.x, y: SPAWN.y })
  })
})

describe('partida con estado del valle', () => {
  beforeEach(() => clearSave())

  it('guarda y recupera la hora y la posición', () => {
    expect(writeSave({ name: 'Lupe', look: DEFAULT_LOOK, world })).toBe(true)
    expect(loadSave().world).toEqual(world)
  })

  it('una partida sin estado del valle sigue cargando, sin `world`', () => {
    writeSave({ name: 'Lupe', look: DEFAULT_LOOK })
    expect(loadSave()).not.toHaveProperty('world')
  })

  it('descarta un estado dañado sin perder el aspecto', () => {
    localStorage.setItem('valle-del-bucle:save', JSON.stringify({ version: 4, name: 'Lupe', look: DEFAULT_LOOK, world: { seed: 'x' } }))
    const loaded = loadSave()
    expect(loaded.name).toBe('Lupe')
    expect(loaded).not.toHaveProperty('world')
  })
})

describe('partidas de antes de la franja norte', () => {
  it('bajan la posición tantas filas como ha crecido el valle por arriba', () => {
    expect(fromTemplateSave({ seed: 1, ms: 2, x: 600, y: 700 })).toMatchObject({ x: 600, y: 700 + 12 * TILE })
    expect(fromTemplateSave(null)).toBeNull()
  })

  it('una posición guardada antes de la ampliación al oeste se desplaza ocho columnas, y una de antes de la franja norte también baja', () => {
    const saved = { seed: 1, ms: 2, x: 600, y: 700 }
    expect(migrateWorld(saved, 6)).toMatchObject({ x: 600 + 8 * TILE, y: 700 })
    expect(migrateWorld(saved, 5)).toMatchObject({ x: 600 + 8 * TILE, y: 700 + 12 * TILE })
    expect(migrateWorld(saved, 7)).toEqual(saved)
    expect(migrateWorld(null, 6)).toBeNull()
  })
})

describe('estación en la partida guardada', () => {
  const world = { seed: 12345, ms: 90000, x: 400, y: 700 }

  it('una partida anterior sin estación se acepta tal cual (empezará en primavera)', () => {
    expect(sanitizeWorld(world)).toEqual(world)
  })

  it('conserva la estación y su progreso, y descarta una dañada sin perder el resto', () => {
    const season = { season: 2, cycle: 6, elapsed: 540000, carry: 300000 }
    expect(sanitizeWorld({ ...world, season })).toEqual({ ...world, season })
    expect(sanitizeWorld({ ...world, season: { ...season, season: 9 } })).toEqual(world)
    expect(sanitizeWorld({ ...world, season: 'otoño' })).toEqual(world)
  })
})
