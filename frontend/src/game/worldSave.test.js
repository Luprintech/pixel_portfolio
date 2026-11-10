import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_LOOK } from './look'
import { clearSave, loadSave, writeSave } from './save'
import { BUILDINGS, SPAWN, TILE, waterTiles } from './world.js'
import { resumePoint, sanitizeWorld } from './worldSave.js'

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
