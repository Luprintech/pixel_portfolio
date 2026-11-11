import { describe, expect, it } from 'vitest'
import { BUILDINGS, TILE } from '../world.js'
import { roomOf } from '../interiors.js'
import { CAT_SEQUENCE, CAT_SPOTS } from './catBrain.js'
import { FURNITURE, solidsOf } from './furniture/index.js'
import { ARCADE_FRONT, ATREUS_BODY, FURNITURE_PLAN, HOME_ID, INTERACTIONS, LUPE_TOWER_W, NPC_PLAN, ROOF_DOOR, SEATS, WALL_X, WINDOWS, homeRoom, interactionAt } from './homeLayout.js'

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

describe('zona de Khalessi', () => {
  // Los puntos por los que pasa la gata, en orden, empezando por la caja. Ella (un punto) no atraviesa ningún mueble salvo
  // la caja, de la que sale por delante: se comprueba con dos píxeles de margen.
  const route = [CAT_SPOTS.box, ...CAT_SEQUENCE.filter((step) => step.kind === 'walk').map((step) => step.to)]
  const props = FURNITURE_PLAN.filter((piece) => !piece.kind.startsWith('box')).flatMap(solidsOf).concat(solids.slice(-1))
  const inside = (x, y, margin) => props.some((s) => x > s.x - margin && x < s.x + s.w + margin && y > s.y - margin && y < s.y + s.h + margin)

  it('el recorrido de la gata hasta Atreus y de vuelta no cruza ningún mueble', () => {
    route.slice(1).forEach((to, i) => {
      const from = route[i]
      for (let t = 0; t <= 1; t += 0.02) {
        const x = from.x + (to.x - from.x) * t
        const y = from.y + (to.y - from.y) * t
        expect(inside(x, y, 2), `paso ${i + 1} en (${Math.round(x)}, ${Math.round(y)})`).toBe(false)
      }
    })
  })

  it('la sardina cae a los pies de Atreus, fuera de la caja y de los muebles', () => {
    const toy = CAT_SPOTS.toy
    expect(inside(toy.x, toy.y, 2)).toBe(false)
    const atreusSpot = CAT_SPOTS.atreus
    expect(inside(atreusSpot.x + 6, atreusSpot.y + 2, 0)).toBe(false)
  })

  it('tiene su rascador, su comida y su arenero, y la caja', () => {
    ;['scratcher', 'catBowls', 'litterBox', 'boxBack'].forEach((kind) => expect(FURNITURE_PLAN.some((piece) => piece.kind === kind), kind).toBe(true))
  })
})

describe('recreativa', () => {
  it('está en la pared del fondo junto a la estantería de consolas, y se juega desde delante', () => {
    const arcade = FURNITURE_PLAN.find((piece) => piece.kind === 'arcade')
    const shelf = FURNITURE_PLAN.find((piece) => piece.kind === 'consoleShelf')
    expect(arcade.y).toBe(shelf.y)
    expect(arcade.x - shelf.x).toBeLessThan(80)
    const zone = INTERACTIONS.find((interaction) => interaction.id === 'arcade')
    expect(zone).toBeTruthy()
    expect(interactionAt(ARCADE_FRONT.x, ARCADE_FRONT.y)).toBe('arcade')
    expect(standable(ARCADE_FRONT.x, ARCADE_FRONT.y)).toBe(true)
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

describe('sentarse', () => {
  const seatIds = ['chairAtreus', 'chairLupe', 'sofaLeft', 'sofaRight']

  it('el aviso solo sale delante del asiento y mirando hacia él', () => {
    seatIds.forEach((id) => {
      const { anchor } = INTERACTIONS.find((interaction) => interaction.id === id)
      expect(interactionAt(anchor.x, anchor.y, 'up'), `${id} de cara`).toBe(id)
      ;['down', 'left', 'right'].forEach((facing) => expect(interactionAt(anchor.x, anchor.y, facing), `${id} mirando ${facing}`).not.toBe(id))
    })
  })

  it('sin orientación (las pruebas de alcance) se reconoce igual', () => {
    seatIds.forEach((id) => {
      const { anchor } = INTERACTIONS.find((interaction) => interaction.id === id)
      expect(interactionAt(anchor.x, anchor.y)).toBe(id)
    })
  })

  it('las zonas de asiento están delante del asiento (al sur) y nunca a su lado ni detrás', () => {
    SEATS.forEach((seat) => {
      expect(seat.zone.y, seat.id).toBeGreaterThan(seat.y)
      expect(seat.zone.x + seat.zone.w, seat.id).toBeGreaterThan(seat.x - 20)
      expect(seat.zone.x, seat.id).toBeLessThan(seat.x + 20)
    })
  })

  it('la viajera sentada va por delante de la capa de atrás del asiento y por detrás de la de delante', () => {
    ;[['chairAtreus', 'chairAtreusFront', 'chairAtreus'], ['chairLupe', 'chairLupeFront', 'chairLupe'], ['sofa', 'sofaFront', 'sofaLeft'], ['sofa', 'sofaFront', 'sofaRight']].forEach(([back, front, id]) => {
      const backPiece = FURNITURE_PLAN.find((piece) => piece.kind === back)
      const frontPiece = FURNITURE_PLAN.find((piece) => piece.kind === front)
      const seat = SEATS.find((candidate) => candidate.id === id)
      expect(seat.depth, id).toBeGreaterThan(backPiece.y + backPiece.dz)
      expect(seat.depth, id).toBeLessThan(frontPiece.y + frontPiece.dz)
    })
  })
})

describe('ventanas', () => {
  it('todas caben en la pared del fondo y ninguna se pisa con otra', () => {
    WINDOWS.forEach((window) => {
      expect(window.x, window.id).toBeGreaterThanOrEqual(TILE)
      expect(window.x + window.w, window.id).toBeLessThanOrEqual(room.width - TILE)
      expect(window.y, window.id).toBeGreaterThanOrEqual(0)
      expect(window.y + window.h, window.id).toBeLessThanOrEqual(room.wallRows * TILE)
    })
    WINDOWS.forEach((a, i) => WINDOWS.slice(i + 1).forEach((b) => expect(overlaps({ x: a.x, y: a.y, w: a.w, h: a.h }, { x: b.x, y: b.y, w: b.w, h: b.h }), `${a.id} con ${b.id}`).toBe(false)))
  })

  it('la puerta de la azotea deja su cristal dentro de su propio dibujo', () => {
    const door = WINDOWS.find((window) => window.id === 'roofDoor')
    const stairs = FURNITURE_PLAN.find((piece) => piece.kind === 'roofStairs')
    expect(door.x).toBe(stairs.x - ROOF_DOOR.w / 2 + ROOF_DOOR.glass.x)
    expect(door.y).toBe(stairs.y - ROOF_DOOR.h + ROOF_DOOR.glass.y)
    expect(FURNITURE.roofStairs.w).toBe(ROOF_DOOR.w)
    expect(FURNITURE.roofStairs.h).toBe(ROOF_DOOR.h)
  })
})

describe('zona gaming y rincón de impresión', () => {
  const printers = FURNITURE_PLAN.filter((piece) => piece.kind.startsWith('printer'))
  const gaming = { x: 96, y: 84, w: 90, h: 56 }

  it('las impresoras están por delante de la vitrina y no pisan la zona de Atreus', () => {
    expect(printers).toHaveLength(2)
    const shelf = FURNITURE_PLAN.find((piece) => piece.kind === 'makerShelf')
    printers.forEach((printer) => {
      expect(printer.y, printer.kind).toBeGreaterThan(shelf.y)
      const { w, h } = FURNITURE[printer.kind]
      expect(overlaps({ x: printer.x - w / 2, y: printer.y - h, w, h }, gaming), printer.kind).toBe(false)
    })
  })

  it('se puede usar cada impresora desde el suelo de delante de ellas', () => {
    ;['printer', 'printerMini'].forEach((id) => {
      const { anchor } = INTERACTIONS.find((interaction) => interaction.id === id)
      expect(standable(anchor.x, anchor.y), id).toBe(true)
    })
  })

  it('la mesa de Lupe lleva su torre a la izquierda sin pisar la minicadena', () => {
    const desk = FURNITURE_PLAN.find((piece) => piece.kind === 'lupeDesk')
    const hifi = FURNITURE_PLAN.find((piece) => piece.kind === 'hifi')
    expect(desk.x - FURNITURE.lupeDesk.w / 2).toBeGreaterThanOrEqual(hifi.x + FURNITURE.hifi.w / 2)
    expect(desk.x + FURNITURE.lupeDesk.w / 2).toBeLessThanOrEqual(room.width - TILE)
    // La tabla sigue centrada donde estaba: el ordenador se usa desde el mismo sitio.
    expect(desk.x + LUPE_TOWER_W / 2).toBe(WALL_X.lupeDesk)
  })
})
