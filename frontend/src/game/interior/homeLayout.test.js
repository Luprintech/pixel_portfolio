import { describe, expect, it } from 'vitest'
import { BUILDINGS, TILE } from '../world.js'
import { roomOf } from '../interiors.js'
import { FURNITURE, solidsOf } from './furniture/index.js'
import { ATREUS_BODY, FURNITURE_PLAN, HOME_ID, INTERACTIONS, NPC_PLAN, homeRoom, interactionAt } from './homeLayout.js'

const room = homeRoom()
const atreus = NPC_PLAN.find((npc) => npc.id === 'atreus')
const solids = [
  ...FURNITURE_PLAN.flatMap(solidsOf),
  { x: atreus.x + ATREUS_BODY.l, y: atreus.y + ATREUS_BODY.t, w: ATREUS_BODY.r - ATREUS_BODY.l, h: ATREUS_BODY.b - ATREUS_BODY.t },
]

const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

// Los pies de la viajera (cuerpo de 8×4 sobre ellos) caben en (x, y): dentro del suelo y sin tocar ningún mueble.
function standable(x, y) {
  const { bounds } = room
  if (x - 4 < bounds.x || x + 4 > bounds.x + bounds.width || y - 4 < bounds.y || y > bounds.y + bounds.height) return false
  const feet = { x: x - 4, y: y - 4, w: 8, h: 4 }
  return !solids.some((solid) => overlaps(feet, solid))
}

// Todos los puntos del suelo a los que se puede llegar andando desde la entrada, en pasos de 2 píxeles.
function reachable() {
  const STEP = 2
  const seen = new Set()
  const queue = [[room.spawn.x, room.spawn.y]]
  const key = (x, y) => `${x},${y}`
  seen.add(key(...queue[0]))
  while (queue.length) {
    const [x, y] = queue.pop()
    for (const [dx, dy] of [[STEP, 0], [-STEP, 0], [0, STEP], [0, -STEP]]) {
      const nx = x + dx
      const ny = y + dy
      if (seen.has(key(nx, ny)) || !standable(nx, ny)) continue
      seen.add(key(nx, ny))
      queue.push([nx, ny])
    }
  }
  return seen
}

describe('plano de la casa de Lupe', () => {
  it('es la sala del edificio de la casa y es más grande que las genéricas', () => {
    const home = BUILDINGS.find((b) => b.id === HOME_ID)
    expect(roomOf(home).home).toBe(true)
    expect(room.width).toBeGreaterThan(14 * TILE)
    expect(room.bounds.y).toBe(room.wallRows * TILE)
  })

  it('todos los muebles caben dentro de la sala', () => {
    FURNITURE_PLAN.forEach((piece) => {
      const { w, h } = FURNITURE[piece.kind]
      expect(piece.x - w / 2, piece.kind).toBeGreaterThanOrEqual(TILE)
      expect(piece.x + w / 2, piece.kind).toBeLessThanOrEqual(room.width - TILE)
      expect(piece.y - h, piece.kind).toBeGreaterThanOrEqual(0)
      expect(piece.y, piece.kind).toBeLessThanOrEqual(room.height)
    })
  })

  it('ningún cuerpo sólido pisa a otro', () => {
    solids.forEach((a, i) => {
      solids.slice(i + 1).forEach((b) => expect(overlaps(a, b), `${JSON.stringify(a)} con ${JSON.stringify(b)}`).toBe(false))
    })
  })

  it('la viajera nace en un sitio libre', () => {
    expect(standable(room.spawn.x, room.spawn.y)).toBe(true)
  })

  it('se llega andando a la salida y a cada interacción, y a todo el suelo despejado', () => {
    const cells = reachable()
    const at = (x, y) => [...cells].some((cell) => cell === `${x},${y}`)
    expect(at(room.spawn.x, room.spawn.y)).toBe(true)
    const { exit } = room
    const exitReached = [...cells].some((cell) => {
      const [x, y] = cell.split(',').map(Number)
      return x >= exit.x && x <= exit.x + exit.width && y >= exit.y && y <= exit.y + exit.height
    })
    expect(exitReached).toBe(true)
    INTERACTIONS.forEach(({ id, zones }) => {
      const reached = [...cells].some((cell) => {
        const [x, y] = cell.split(',').map(Number)
        return zones.some((z) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) && interactionAt(x, y) === id
      })
      expect(reached, id).toBe(true)
    })
    // Pasillos transitables: de todo el suelo libre, ninguna bolsa queda encerrada.
    const free = []
    for (let y = room.bounds.y + 4; y <= room.bounds.y + room.bounds.height; y += 2) {
      for (let x = room.bounds.x + 4; x <= room.bounds.x + room.bounds.width - 4; x += 2) if (standable(x, y)) free.push([x, y])
    }
    const cut = free.filter(([x, y]) => !cells.has(`${x},${y}`))
    expect(cut.length, 'zonas encerradas').toBe(0)
  })

  it('la zona de salida no se solapa con ninguna interacción', () => {
    const { exit } = room
    INTERACTIONS.forEach(({ id, zones }) => {
      zones.forEach((z) => expect(overlaps({ x: exit.x, y: exit.y, w: exit.width, h: exit.height }, { x: z.x, y: z.y, w: z.w, h: z.h }), id).toBe(false))
    })
  })

  it('cada interacción se reconoce desde su ancla', () => {
    INTERACTIONS.forEach(({ id, anchor }) => expect(interactionAt(anchor.x, anchor.y), id).toBe(id))
  })
})

describe('muebles', () => {
  it('todos los tipos del plano existen y tienen cuerpo y dibujo', () => {
    FURNITURE_PLAN.forEach(({ kind }) => {
      expect(FURNITURE[kind], kind).toBeTruthy()
      expect(typeof FURNITURE[kind].paint).toBe('function')
      expect(FURNITURE[kind].body, kind).toBeInstanceOf(Array)
    })
  })
})
