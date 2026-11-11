import { describe, expect, it } from 'vitest'
import { BUILDINGS, TILE, roadTiles } from '../world.js'
import { EXIT_ID, roomOf } from '../interiors.js'
import { FURNITURE, solidsOf } from './furniture/index.js'
import { GRAN_ID, GRAN_INTERACTIONS, GRAN_PLAN, GRAN_WALL, GRAN_WINDOWS, RESERVED_SPOTS, granInteractionAt, granRoom } from './granLayout.js'
import { SCRIPTS, TALKS, talkFor } from '../dialogue/scripts.js'
import { DIALOGUE_COPY } from '../../lib/dialogueCopy.js'
import { COPY } from '../../lib/valleCopy.js'

const room = granRoom()
const solids = GRAN_PLAN.flatMap(solidsOf)
const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

// Los pies de la viajera (cuerpo de 8×4 sobre ellos) caben en (x, y): dentro del suelo y sin tocar ningún mueble.
function standable(x, y) {
  const { bounds } = room
  if (x - 4 < bounds.x || x + 4 > bounds.x + bounds.width || y - 4 < bounds.y || y > bounds.y + bounds.height) return false
  const feet = { x: x - 4, y: y - 4, w: 8, h: 4 }
  return !solids.some((solid) => overlaps(feet, solid))
}

function reachable() {
  const seen = new Set()
  const queue = [[room.spawn.x, room.spawn.y]]
  const key = (x, y) => `${x},${y}`
  seen.add(key(...queue[0]))
  while (queue.length) {
    const [x, y] = queue.pop()
    for (const [dx, dy] of [[2, 0], [-2, 0], [0, 2], [0, -2]]) {
      if (seen.has(key(x + dx, y + dy)) || !standable(x + dx, y + dy)) continue
      seen.add(key(x + dx, y + dy))
      queue.push([x + dx, y + dy])
    }
  }
  return seen
}

describe('IES Gran Capitán: edificio y sala', () => {
  const building = BUILDINGS.find((b) => b.id === GRAN_ID)

  it('conserva el id `daw`, la huella y la puerta del antiguo laboratorio, ahora con fachada propia', () => {
    expect(GRAN_ID).toBe('daw')
    expect(building).toMatchObject({ id: 'daw', kind: 'institute', x: 20, y: 14, w: 10, h: 5, door: { x: 25, y: 19 } })
    expect(roadTiles().has(`${building.door.x},${building.door.y}`)).toBe(true)
  })

  it('tiene sala propia con plano, distinta de la sala vacía genérica y de la casa', () => {
    expect(roomOf(building).plan).toBeTruthy()
    expect(roomOf(building).home).toBeUndefined()
    expect(roomOf({ id: 'cervantes', w: 12, h: 8 }).plan).toBeUndefined()
  })

  it('la entrada queda fuera de la zona de salida y dentro del suelo', () => {
    const { spawn, exit, bounds } = room
    expect(spawn.x >= exit.x && spawn.x <= exit.x + exit.width && spawn.y >= exit.y && spawn.y <= exit.y + exit.height).toBe(false)
    expect(standable(spawn.x, spawn.y)).toBe(true)
    expect(exit.x).toBeGreaterThanOrEqual(bounds.x)
    expect(exit.x + exit.width).toBeLessThanOrEqual(bounds.x + bounds.width)
    expect(EXIT_ID).toBe('exit')
  })
})

describe('IES Gran Capitán: muebles, interacciones y puestos reservados', () => {
  const reach = reachable()
  const reaches = (x, y) => [...reach].some((k) => Math.abs(Number(k.split(',')[0]) - x) <= 2 && Math.abs(Number(k.split(',')[1]) - y) <= 2)

  it('todos los muebles caben dentro de la sala y no se pisan', () => {
    GRAN_PLAN.forEach((piece, i) => {
      const { w, h } = FURNITURE[piece.kind]
      expect(piece.x - w / 2, piece.kind).toBeGreaterThanOrEqual(TILE)
      expect(piece.x + w / 2, piece.kind).toBeLessThanOrEqual(room.width - TILE)
      expect(piece.y - h, piece.kind).toBeGreaterThanOrEqual(0)
      solidsOf(piece).forEach((solid) => expect(solid.y, piece.kind).toBeGreaterThanOrEqual(room.bounds.y))
      GRAN_PLAN.slice(i + 1).forEach((other) => solidsOf(piece).forEach((a) => solidsOf(other).forEach((b) => expect(overlaps(a, b), `${piece.kind} pisa a ${other.kind}`).toBe(false))))
    })
  })

  it('cada interacción se alcanza andando desde la entrada y la zona devuelve su id', () => {
    GRAN_INTERACTIONS.forEach((interaction) => {
      expect(reaches(interaction.anchor.x, interaction.anchor.y), interaction.id).toBe(true)
      expect(granInteractionAt(interaction.anchor.x, interaction.anchor.y), interaction.id).toBe(interaction.id)
    })
    expect(granInteractionAt(room.spawn.x, room.spawn.y)).toBeNull()
  })

  it('el tablón y la pizarra cuelgan de la pared del fondo, sin tapar las ventanas', () => {
    Object.values(GRAN_WALL).forEach((item) => {
      expect(item.y + item.h).toBeLessThanOrEqual(room.bounds.y - 16)
      GRAN_WINDOWS.forEach((window) => expect(overlaps(item, window), 'cuadro sobre ventana').toBe(false))
    })
    GRAN_WINDOWS.forEach((window) => {
      expect(window.x).toBeGreaterThanOrEqual(TILE)
      expect(window.x + window.w).toBeLessThanOrEqual(room.width - TILE)
    })
  })

  it('los puestos de Ylonem y Grace están libres y se alcanzan, sin personaje ni diálogo todavía', () => {
    expect(RESERVED_SPOTS.map((spot) => spot.id)).toEqual(['ylonem', 'grace'])
    RESERVED_SPOTS.forEach((spot) => {
      expect(standable(spot.x, spot.y), spot.id).toBe(true)
      expect(reaches(spot.x, spot.y), spot.id).toBe(true)
    })
    Object.keys(SCRIPTS).forEach((id) => expect(id).not.toMatch(/ylonem|grace/))
    expect(Object.keys(TALKS).some((id) => /ylonem|grace/.test(id))).toBe(false)
  })
})

describe('IES Gran Capitán: conversaciones y textos', () => {
  const gran = Object.keys(SCRIPTS).filter((id) => id.startsWith('gran.'))

  it('la primera visita se oye una vez y después hay una repetición breve', () => {
    expect(talkFor('granCartel', new Set())).toBe('gran.entrada')
    expect(talkFor('granCartel', new Set(['gran.entrada']))).toBe('gran.repeticion')
    expect(SCRIPTS['gran.entrada'].pages).toHaveLength(2)
    expect(SCRIPTS['gran.repeticion'].pages).toHaveLength(1)
    expect(talkFor('granPizarra', new Set())).toBe('gran.pizarra')
  })

  it('toda página y toda opción tiene texto en español e inglés', () => {
    gran.forEach((id) => {
      SCRIPTS[id].pages.forEach((page) => ['es', 'en'].forEach((lang) => expect(DIALOGUE_COPY[lang].lines[page.text], `${id} ${lang}`).toBeTruthy()))
      SCRIPTS[id].options.forEach((option) => ['es', 'en'].forEach((lang) => expect(DIALOGUE_COPY[lang].options[option.label], `${option.label} ${lang}`).toBeTruthy()))
    })
  })

  it('las opciones ofrecen la ficha o seguir explorando, sin obligar a nada', () => {
    gran.forEach((id) => expect(SCRIPTS[id].options.map((option) => option.action ?? (option.close && 'cerrar'))).toEqual(['ficha', 'cerrar']))
  })

  it('el panel de la ficha y las etiquetas de acción existen en los dos idiomas', () => {
    ;['es', 'en'].forEach((lang) => {
      const copy = COPY[lang]
      expect(copy.zones.dawSheet).toBeTruthy()
      expect(copy.zones.daw).toBe('IES Gran Capitán')
      expect(copy.dawSheet.items.length).toBeGreaterThan(3)
      GRAN_INTERACTIONS.forEach(({ id }) => expect(copy.hud.actions[id], `${id} ${lang}`).toBeTruthy())
    })
  })

  it('la ficha no publica notas, porcentajes ni a Ylonem o Grace', () => {
    const granLines = (lang) => Object.entries(DIALOGUE_COPY[lang].lines).filter(([key]) => key.startsWith('gran.'))
    const text = JSON.stringify([COPY.es.dawSheet, COPY.en.dawSheet, granLines('es'), granLines('en')])
    expect(text).not.toMatch(/8,4|8\.4|10\/10|90 ?%|Ylonem|Grace/)
  })
})
