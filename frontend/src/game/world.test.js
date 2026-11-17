import { describe, expect, it } from 'vitest'
import { BRIDGES, BUILDINGS, COLS, PROPS, ROWS, SPAWN, TILE, blockedWaterTiles, plazaTiles, roadTiles, treePositions, waterTiles } from './world.js'
import { fishSpots, ROD_SPOT } from './riverPlaces.js'
import { shiftY } from './mapRows.js'
import { COLUMN_BODY } from './romanColumns.js'
import { TOW_TRUCK_BODY } from './towTruck.js'
import { AUCORSA_BUS_BODY } from './aucorsaBus.js'
import { SEAT_CORDOBA_BODY, SEAT_CORDOBA_SIZE } from './seatCordoba.js'
import { SAN_RAFAEL_BODY } from './sanRafael.js'
import { KIOSK_BODIES, KIOSK_DOOR_COL } from './buildings/homes.js'
import { COPOS_DOOR_COL, COPOS_FACADE } from './buildings/copos.js'
import { RACE_DOOR_COL, RACE_FACADE } from './buildings/race.js'
import { FACADE_LEFT } from './buildings/ayuntamiento.js'
import { RIVER_SAMPLES, signedDistance } from './river.js'

const footprint = (b) => {
  const tiles = []
  for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) tiles.push(`${x},${y}`)
  return tiles
}


// Teselas que pisa una puerta: una, o las dos entre las que queda centrada si va en media tesela (la Mezquita).
const doorTiles = (b) => [...new Set([Math.floor(b.door.x), Math.ceil(b.door.x)])].map((x) => `${x},${b.door.y}`)

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
      doorTiles(b).forEach((key) => expect(roads.has(key), `la puerta de ${b.id} no toca un camino`).toBe(true))
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
    BUILDINGS.forEach((b) => doorTiles(b).forEach((key) => expect(seen.has(key), `no se llega a la puerta de ${b.id}`).toBe(true)))
    PROPS.filter((p) => p.zone).forEach((p) => expect(seen.has(`${p.door.x},${p.door.y}`)).toBe(true))
  })

  it('queda el puente romano (el de tablones se quitó) y cruza el río de orilla a orilla', () => {
    const water = waterTiles()
    const walkable = blockedWaterTiles()
    expect(BRIDGES.map((b) => b.id)).toEqual(['romano'])
    BRIDGES.forEach((bridge) => {
      // Cada fila de la calzada tiene agua en medio, que solo se pisa gracias al puente, y tierra en los dos extremos.
      for (let y = bridge.y; y < bridge.y + bridge.h; y++) {
        const row = Array.from({ length: bridge.w }, (_, i) => water.has(`${bridge.x + i},${y}`))
        expect(row.some(Boolean), `${bridge.id} fila ${y}`).toBe(true)
        expect(row[0] || row.at(-1), `${bridge.id} no apoya en tierra en la fila ${y}`).toBe(false)
        row.forEach((isWater, i) => isWater && expect(walkable.has(`${bridge.x + i},${y}`)).toBe(false))
      }
    })
  })

  it('ningún camino se mete en el agua: el río solo se cruza por los puentes', () => {
    const water = blockedWaterTiles()
    ;[...roadTiles()].forEach((key) => expect(water.has(key), `camino en el agua en ${key}`).toBe(false))
  })

  it('el puente romano tiene camino en sus dos extremos', () => {
    const roads = roadTiles()
    BRIDGES.forEach((b) => {
      expect(roads.has(`${b.x - 1},${b.y}`), `${b.id} sin camino al oeste`).toBe(true)
      expect(roads.has(`${b.x + b.w},${b.y}`), `${b.id} sin camino al este`).toBe(true)
    })
  })

  it('el río es un cauce continuo de entre tres y seis teselas, sin cortes ni estrechamientos bruscos', () => {
    const water = waterTiles()
    // Por filas, la anchura de cada tramo, desde que el afluente se ha unido al río (justo encima del puente romano) hasta la salida.
    const widths = []
    for (let y = shiftY(29); y < shiftY(45); y++) {
      let run = 0
      for (let x = 48; x < 78; x++) if (water.has(`${x},${y}`)) run += 1
      widths.push(run)
    }
    widths.forEach((run, i) => expect(run, `fila ${shiftY(29) + i}`).toBeGreaterThan(0))
    const steps = widths.slice(1).map((run, i) => Math.abs(run - widths[i]))
    expect(Math.max(...steps)).toBeLessThanOrEqual(4)
    expect(Math.max(...widths)).toBeLessThanOrEqual(12)
  })

  it('el río entra por el borde norte entre los árboles, a la derecha de la Mezquita, y baja curvándose hasta el puente romano', () => {
    const water = waterTiles()
    const cityHall = BUILDINGS.find((b) => b.id === 'ayuntamiento')
    const mosque = BUILDINGS.find((b) => b.id === 'mezquita')
    const bridge = BRIDGES.find((b) => b.id === 'romano')
    const rowWater = (y) => [...Array(COLS).keys()].filter((x) => water.has(`${x},${y}`))
    // Ya no sale por el borde este: al norte del puente romano no hay agua en la última columna.
    for (let y = 0; y < bridge.y; y++) expect(water.has(`${COLS - 1},${y}`), `agua en el borde este, fila ${y}`).toBe(false)
    // Entra por el borde norte, con un hueco del ancho del cauce en la hilera de árboles y árboles a los dos lados.
    const top = rowWater(1)
    expect(top.length).toBeGreaterThanOrEqual(3)
    expect(top.length).toBeLessThanOrEqual(6)
    const trees = treePositions()
    expect(trees.some((t) => t.y === 1 && water.has(`${t.x},${t.y}`))).toBe(false)
    expect(trees.some((t) => t.y === 1 && t.x < Math.min(...top) && t.x >= Math.min(...top) - 3)).toBe(true)
    expect(trees.some((t) => t.y === 1 && t.x > Math.max(...top) && t.x <= Math.max(...top) + 3)).toBe(true)
    // Del borde al puente romano el agua es continua; entre la Mezquita y la orilla, y entre el Ayuntamiento y la orilla, queda tierra.
    for (let y = 0; y < bridge.y; y++) expect(rowWater(y).length, `fila ${y}`).toBeGreaterThan(0)
    // La Mezquita, en el eje del paseo lateral del Ayuntamiento, deja tesela y media de orilla.
    for (let y = mosque.y; y <= mosque.y + mosque.h; y++) expect(Math.min(...rowWater(y)), `fila ${y}`).toBeGreaterThan(mosque.x + mosque.w + 1)
    for (let y = cityHall.y; y < cityHall.y + cityHall.h; y++) expect(Math.min(...rowWater(y)), `fila ${y}`).toBeGreaterThan(cityHall.x + cityHall.w + 2)
    // Medida de orilla a orilla, la curva y el tramo que entra por el norte tienen la misma anchura (entre tres teselas y media y
    // cuatro y media).
    const north = RIVER_SAMPLES.filter((sample) => sample.y < 29 * TILE)
    north.forEach((sample) => {
      expect(sample.half).toBeCloseTo(north[0].half, 5)
      expect(sample.half * 2).toBeGreaterThanOrEqual(3.5 * TILE)
      expect(sample.half * 2).toBeLessThanOrEqual(4.5 * TILE)
    })
  })

  it('los cuatro centros de estudios están arriba a la izquierda, con sus puertas en un paseo que llega a la plaza', () => {
    expect(BUILDINGS.some((b) => b.id === 'cervantes' || b.kind === 'school')).toBe(false)
    const cityHall = BUILDINGS.find((b) => b.id === 'ayuntamiento')
    const studies = ['artes', 'universidad', 'daw', 'turing'].map((id) => BUILDINGS.find((b) => b.id === id))
    studies.forEach((b) => {
      expect(b, 'falta un centro de estudios').toBeTruthy()
      // En la mitad oeste del valle (la Universidad acaba en la columna 38).
      expect(b.x + b.w).toBeLessThanOrEqual(40)
      expect(b.y + b.h).toBeLessThan(cityHall.y)
    })
    // Se va de la fuente a cada puerta sin salir de caminos y plaza.
    const walk = new Set([...roadTiles(), ...plazaTiles()])
    const fountain = PROPS.find((p) => p.kind === 'fountain')
    const start = `${Math.floor(fountain.at[0])},${Math.floor(fountain.at[1]) + 2}`
    const seen = new Set([start])
    const queue = [start]
    while (queue.length) {
      const [x, y] = queue.shift().split(',').map(Number)
      ;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const key = `${x + dx},${y + dy}`
        if (!walk.has(key) || seen.has(key)) return
        seen.add(key)
        queue.push(key)
      })
    }
    studies.forEach((b) => expect(seen.has(`${b.door.x},${b.door.y}`), `no hay paseo hasta ${b.id}`).toBe(true))
  })

  it('la Mezquita está al norte, pegada al paseo de junto a la Universidad, sin interior, y su puerta abre la conversación con Lupe', () => {
    const mosque = BUILDINGS.find((b) => b.id === 'mezquita')
    const university = BUILDINGS.find((b) => b.id === 'universidad')
    expect(mosque).toMatchObject({ kind: 'mosque', x: 43.5, y: 1, w: 17, h: 11, door: { x: 51.5, y: 12 }, talk: 'valle.mezquita' })
    // Entre las dos queda el paseo de dos teselas que baja junto a la Universidad, del paseo de arriba de los estudios (fila 10) al del
    // Alan Turing, y a su derecha césped hasta la Mezquita.
    expect(mosque.x).toBeGreaterThan(university.x + university.w + 2)
    const roads = roadTiles()
    for (let y = 10; y <= 18; y++) for (let x = university.x + university.w; x < university.x + university.w + 2; x++) expect(roads.has(`${x},${y}`), `paso cortado en ${x},${y}`).toBe(true)
  })

  it('las dos casitas de la familia ya no están: ni edificio ni camino ni dibujo', () => {
    expect(BUILDINGS.some((b) => b.id === 'casaHermanos' || b.id === 'casaPadres' || b.kind === 'cottage')).toBe(false)
    const roads = roadTiles()
    // Donde estaba el ramal entre las dos casitas y el camino que unía sus puertas.
    for (let y = shiftY(30); y <= shiftY(36); y++) expect(roads.has(`77,${y}`), `camino en 77,${y}`).toBe(false)
    for (let x = 76; x <= 84; x++) expect(roads.has(`${x},${shiftY(36)}`), `camino en ${x},${shiftY(36)}`).toBe(false)
  })

  it('el arco de Córdoba frente a la puerta de la Mezquita, con el camino recto bajo él desde el paseo del Alan Turing', () => {
    const mosque = BUILDINGS.find((b) => b.id === 'mezquita')
    const arch = PROPS.find((p) => p.kind === 'cordobaArch')
    const roads = roadTiles()
    // El eje del arco es el de la puerta y su remate (siete filas por encima de la base) empieza en la fila de la puerta.
    expect(arch.at[0]).toBeCloseTo(mosque.door.x + 0.5, 5)
    expect(arch.at[1] - 7).toBe(mosque.door.y)
    // El arco queda en el eje del paseo que baja junto al Ayuntamiento (columnas 51 y 52).
    expect(arch.at[0]).toBe(52)
    // Entre la puerta y la base del arco, solo el camino recto de dos teselas, del ancho de la abertura.
    const path = [Math.floor(mosque.door.x), Math.ceil(mosque.door.x)]
    for (let y = mosque.door.y; y < arch.at[1]; y++) {
      for (let x = Math.floor(arch.at[0] - 3.5); x < Math.ceil(arch.at[0] + 3.5); x++) expect(roads.has(`${x},${y}`), `camino en ${x},${y}`).toBe(path.includes(x))
    }
    // Bajo la base, el paseo del Alan Turing, que viene de su puerta y sigue hasta el lateral del Ayuntamiento.
    const turing = BUILDINGS.find((b) => b.id === 'turing')
    for (let x = turing.door.x; x <= 39; x++) expect(roads.has(`${x},${turing.door.y}`), `paseo cortado en ${x}`).toBe(true)
    for (let x = 39; x <= 52; x++) for (let y = arch.at[1]; y < arch.at[1] + 2; y++) expect(roads.has(`${x},${y}`), `paseo cortado en ${x},${y}`).toBe(true)
    // Las alas del arco (su cuerpo, en la fila de encima del paseo) no pisan baldosas fuera del camino recto.
    for (let x = Math.floor(arch.at[0] - 3); x < Math.ceil(arch.at[0] + 3); x++) if (!path.includes(x)) expect(roads.has(`${x},${arch.at[1] - 1}`), `camino bajo el ala en ${x}`).toBe(false)
    // Ningún árbol de relleno entre la Universidad y la Mezquita ni delante de su fachada hasta el paseo.
    const university = BUILDINGS.find((b) => b.id === 'universidad')
    const trees = treePositions().filter((t) => t.x >= university.x + university.w && t.x <= mosque.x + mosque.w && t.y >= 2 && t.y <= arch.at[1] + 1)
    expect(trees).toEqual([])
  })

  it('del puente romano sale el paseo hasta su orilla este, y el camino del sur acaba a la altura de la Casa del Encuentro', () => {
    const romano = BRIDGES.find((b) => b.id === 'romano')
    const friends = BUILDINGS.find((b) => b.id === 'encuentro')
    const roads = roadTiles()
    for (let y = romano.y; y < romano.y + romano.h; y++) {
      expect(roads.has(`${romano.x + romano.w},${y}`), `sin salida en la fila ${y}`).toBe(true)
      for (let x = romano.x + romano.w + 1; x < COLS; x++) expect(roads.has(`${x},${y}`), `paseo sin destino en ${x},${y}`).toBe(false)
    }
    // El camino del sur llega hasta el final de la Casa del Encuentro y no sigue hacia el río.
    for (let y = friends.door.y; y < friends.door.y + 2; y++) {
      expect(roads.has(`${friends.x + friends.w - 1},${y}`)).toBe(true)
      for (let x = friends.x + friends.w + 1; x < COLS; x++) expect(roads.has(`${x},${y}`), `camino sin destino en ${x},${y}`).toBe(false)
    }
    // Ni el tramo que bajaba al puente de tablones ni el ramal que subía a él desde el camino del sur.
    for (let y = romano.y + romano.h; y < friends.door.y; y++) for (let x = friends.x + friends.w + 1; x < COLS; x++) expect(roads.has(`${x},${y}`), `tramo sobrante en ${x},${y}`).toBe(false)
  })

  it('el Triunfo de San Rafael está delante del ala izquierda de la Mezquita, en el césped, y choca solo por su base', () => {
    const rafael = PROPS.find((p) => p.kind === 'sanRafael')
    const arch = PROPS.find((p) => p.kind === 'cordobaArch')
    const mosque = BUILDINGS.find((b) => b.id === 'mezquita')
    const roads = roadTiles()
    const [{ l, r, t }] = SAN_RAFAEL_BODY
    const px = rafael.at[0] * TILE
    const py = rafael.at[1] * TILE
    // Ni la base ni su margen de una tesela pisan camino.
    for (let y = Math.floor((py + t) / TILE) - 1; y < Math.ceil(py / TILE); y++) {
      for (let x = Math.floor((px + l) / TILE) - 1; x <= Math.floor((px + r) / TILE) + 1; x++) expect(roads.has(`${x},${y}`), `camino en ${x},${y}`).toBe(false)
    }
    // Delante del ala izquierda: entre el borde de la Mezquita y su puerta, con la base más abajo que la fachada (se dibuja delante)
    // y la figura (133 px de alto) por encima de su línea de suelo, sobre los ventanales.
    expect(px + l).toBeGreaterThanOrEqual(mosque.x * TILE)
    expect(px + r).toBeLessThan(mosque.door.x * TILE)
    expect(py).toBeGreaterThan((mosque.y + mosque.h) * TILE)
    expect(py - 133).toBeLessThan((mosque.y + mosque.h) * TILE - 3 * TILE)
    // A la izquierda del arco, sin taparlo (su dibujo llega a 56 px de su eje y el de San Rafael a 24 del suyo).
    expect(arch.at[0] * TILE - 56).toBeGreaterThanOrEqual(px + 24)
    // El cuerpo es solo la base: no más alto que una tesela.
    expect(-t).toBeLessThanOrEqual(TILE)
  })

  it('el SEAT Córdoba está aparcado delante del ala derecha de la Universidad, sin tapar la escalinata ni el paso del paseo', () => {
    const car = PROPS.find((p) => p.kind === 'seatCordoba')
    const university = BUILDINGS.find((b) => b.id === 'universidad')
    const roads = roadTiles()
    const [{ l, r, t, b }] = SEAT_CORDOBA_BODY
    const px = car.at[0] * TILE
    const py = car.at[1] * TILE
    const half = SEAT_CORDOBA_SIZE.w / 2
    // La fachada (240 px) va alineada por su puerta (columna 122); la escalinata acaba a 168 px de su borde izquierdo.
    const facadeLeft = university.door.x * TILE + TILE / 2 - 122
    expect(px - half).toBeGreaterThan(facadeLeft + 168)
    expect(px + half).toBeLessThanOrEqual(facadeLeft + 240)
    // Las ruedas, sobre las baldosas del paseo de los estudios, y el techo por delante de la parte baja de la fachada.
    for (let x = Math.floor((px + l) / TILE); x <= Math.floor((px + r) / TILE); x++) expect(roads.has(`${x},${Math.floor((py - 1) / TILE)}`), `sin baldosa en ${x}`).toBe(true)
    expect(py - SEAT_CORDOBA_SIZE.h).toBeLessThan((university.y + university.h) * TILE)
    // Bajo la carrocería queda más de una tesela de paseo para pasar.
    expect(Math.ceil(py / TILE) * TILE + 2 * TILE - (py + b)).toBeGreaterThan(TILE)
    expect(Math.floor(py / TILE) + 1).toBeLessThan(12)
    expect(-t).toBeLessThanOrEqual(TILE)
  })

  it('la Biblioteca de los Logs ya no está (su antigua parcela, junto al río, quedó fuera del borde este recortado)', () => {
    expect(BUILDINGS.some((b) => b.id === 'blog' || b.kind === 'library')).toBe(false)
  })

  it('en la entrada del valle está el arco de siempre, con las farolas sobre sus pilares, y no el de Córdoba', () => {
    const entrance = PROPS.filter((p) => p.kind === 'arch')
    expect(entrance).toEqual([{ kind: 'arch', at: [45, shiftY(50.4)] }])
    expect(PROPS.filter((p) => p.kind === 'lamp' && p.at[1] > shiftY(46)).map((p) => p.at)).toEqual([[43.4, shiftY(47.2)], [47, shiftY(47.2)]])
  })

  it('el taller de proyectos y la Casa de la Música ya no están en el mapa', () => {
    expect(BUILDINGS.some((b) => b.id === 'projects' || b.kind === 'workshop')).toBe(false)
    expect(BUILDINGS.some((b) => b.id === 'musica' || b.kind === 'music')).toBe(false)
  })

  it('al entrar, la casa de Lupe queda a la izquierda y la Casa del Encuentro a la derecha, con las puertas en el camino del sur', () => {
    const home = BUILDINGS.find((b) => b.id === 'about')
    const house = BUILDINGS.find((b) => b.id === 'encuentro')
    const arch = PROPS.find((p) => p.kind === 'arch')
    expect(home.x + home.w).toBeLessThanOrEqual(arch.at[0])
    expect(house.x).toBeGreaterThan(arch.at[0])
    expect(house).toMatchObject({ kind: 'patio', w: 8, h: 8 })
    expect(home.door.y).toBe(house.door.y)
    // Nada entre la casa de Lupe y la entrada: es la primera a mano izquierda.
    expect(BUILDINGS.some((b) => b !== home && b.y + b.h === home.door.y && b.x > home.x && b.x < arch.at[0])).toBe(false)
  })

  it('entre la casa de Lupe y el eje de la entrada queda césped, y un atajo sube desde su lado izquierdo hasta la explanada de RACE', () => {
    const home = BUILDINGS.find((b) => b.id === 'about')
    const race = BUILDINGS.find((b) => b.kind === 'garage')
    const kiosk = BUILDINGS.find((b) => b.id === 'kiosko')
    const truck = PROPS.find((p) => p.kind === 'towTruck')
    const arch = PROPS.find((p) => p.kind === 'arch')
    const roads = roadTiles()
    // Dos teselas de césped como mínimo entre la fachada y el eje (que empieza una tesela a la izquierda del arco).
    for (let x = home.x + home.w; x < arch.at[0] - 1; x++) for (let y = home.y; y < home.y + home.h; y++) expect(roads.has(`${x},${y}`), `camino en ${x},${y}`).toBe(false)
    expect(arch.at[0] - 1 - (home.x + home.w)).toBeGreaterThanOrEqual(2)
    // El atajo: una columna de camino entre el quiosco y la escalera (que se dibuja hasta 3,7 teselas a la izquierda de la casa), del
    // camino del sur a la explanada, sin cruzar la grúa.
    const lane = [...Array(home.x - 4 - (kiosk.x + kiosk.w)).keys()].map((i) => kiosk.x + kiosk.w + i).find((x) => {
      for (let y = race.door.y + 2; y <= home.door.y; y++) if (!roads.has(`${x},${y}`)) return false
      return true
    })
    expect(lane, 'no hay atajo de la casa a RACE').toBeDefined()
    expect(Math.abs(lane - truck.at[0])).toBeGreaterThan(3)
  })

  it('un atajo une el camino del Ayuntamiento con el paseo de los estudios por el hueco entre Mihrab y las columnas', () => {
    const mihrab = BUILDINGS.find((b) => b.id === 'mihrab')
    const daw = BUILDINGS.find((b) => b.id === 'daw')
    const columns = PROPS.find((p) => p.kind === 'romanColumns')
    const roads = roadTiles()
    const lane = [...Array(Math.floor(columns.at[0] - 4) - (mihrab.x + mihrab.w)).keys()].map((i) => mihrab.x + mihrab.w + i).find((x) => {
      for (let y = daw.door.y; y <= mihrab.door.y; y++) if (!roads.has(`${x},${y}`)) return false
      return true
    })
    expect(lane, 'no hay atajo del Ayuntamiento a los estudios').toBeDefined()
    // Ningún árbol tapa el atajo.
    treePositions().forEach((t) => expect(Math.abs(t.x - lane) < 2 && t.y > daw.door.y && t.y < mihrab.door.y, `árbol en el atajo en ${t.x},${t.y}`).toBe(false))
  })

  it('el quiosco de helados está justo a la derecha de la piscina, con paso entre los dos y un caminito desde el camino del sur', () => {
    const home = BUILDINGS.find((b) => b.id === 'about')
    const kiosk = BUILDINGS.find((b) => b.id === 'kiosko')
    const pool = PROPS.find((p) => p.kind === 'pool')
    const poolRight = pool.at[0] + 112 / 2 / TILE
    const poolTop = pool.at[1] - 84 / TILE
    // A la derecha del vaso, con al menos una tesela libre entre los dos, y antes de la escalera de la casa (7 teselas a su izquierda).
    expect(kiosk.x - poolRight).toBeGreaterThanOrEqual(1)
    expect(kiosk.x + kiosk.w).toBeLessThanOrEqual(home.x - 7)
    // A la altura de la piscina, no en el camino del sur.
    expect(kiosk.y).toBeGreaterThan(poolTop)
    expect(kiosk.y).toBeLessThan(pool.at[1])
    expect(kiosk.door.y).toBeLessThan(home.door.y)
    // El caminito baja del mostrador al camino del sur sin cortes.
    const roads = roadTiles()
    for (let y = kiosk.door.y; y <= home.door.y; y++) expect(roads.has(`${kiosk.door.x},${y}`), `caminito cortado en ${kiosk.door.x},${y}`).toBe(true)
    // Y otro ramal sube del camino del sur a la piscina.
    const spur = [...roads].map((key) => key.split(',').map(Number)).filter(([x, y]) => y < home.door.y && y > pool.at[1] && Math.abs(x - pool.at[0]) < 4)
    expect(spur.length).toBeGreaterThan(1)
  })

  it('el quiosco Camy deja paso hasta la piscina y su mostrador queda sobre el caminito', () => {
    const kiosk = BUILDINGS.find((b) => b.id === 'kiosko')
    const pool = PROPS.find((p) => p.kind === 'pool')
    const poolRight = pool.at[0] * TILE + 112 / 2
    const left = kiosk.door.x * TILE + TILE / 2 - KIOSK_DOOR_COL
    const py = kiosk.y * TILE
    // Entre el vaso y la pieza más a la izquierda (el cartel) cabe la viajera.
    expect(left + Math.min(...KIOSK_BODIES.map((b) => b.x)) - poolRight).toBeGreaterThanOrEqual(TILE)
    // Todas las piezas se apoyan en la fila de la puerta, y el caminito sube hasta ella.
    KIOSK_BODIES.forEach((b) => expect(py + b.y + b.h).toBeLessThanOrEqual(kiosk.door.y * TILE))
    expect(roadTiles().has(`${kiosk.door.x},${kiosk.door.y}`)).toBe(true)
  })

  it('la terraza del Bar Mihrab deja libre la puerta, el paso entre mesas y el camino del Ayuntamiento', () => {
    const bar = BUILDINGS.find((b) => b.id === 'mihrab')
    const tables = PROPS.filter((p) => p.kind === 'cafeTable').map((p) => p.at[0] * TILE).sort((a, b) => a - b)
    const doorLeft = bar.door.x * TILE - 6
    expect(tables).toHaveLength(3)
    // Las mesas (28 px de ancho con sus sillas) quedan a la izquierda de la puerta y con al menos 10 px entre una y otra.
    tables.forEach((x) => expect(x + 14).toBeLessThan(doorLeft))
    tables.slice(1).forEach((x, i) => expect(x - 14 - (tables[i] + 14)).toBeGreaterThanOrEqual(10))
    // Todo sobre las baldosas de la terraza, por encima del camino del Ayuntamiento (fila 32).
    const roads = roadTiles()
    PROPS.filter((p) => p.kind.startsWith('cafe')).forEach((p) => {
      expect(p.at[1]).toBeLessThan(32)
      expect(roads.has(`${Math.floor(p.at[0])},${Math.floor(p.at[1])}`)).toBe(true)
    })
    expect(roads.has(`${bar.door.x},${bar.door.y}`)).toBe(true)
  })

  it('calle de trabajo al oeste de la plaza: Copos y un solo RACE separados por césped, cada uno con su puerta en la misma calle', () => {
    const fountain = PROPS.find((p) => p.kind === 'fountain')
    const copos = BUILDINGS.find((b) => b.id === 'copos')
    const garages = BUILDINGS.filter((b) => b.kind === 'garage')
    const mihrab = BUILDINGS.find((b) => b.id === 'mihrab')
    expect(garages).toHaveLength(1)
    const race = garages[0]
    // Copos al oeste, RACE más cerca de la plaza y un hueco de al menos cuatro teselas de césped entre los dos.
    expect(race.x - (copos.x + copos.w)).toBeGreaterThanOrEqual(4)
    // RACE es más bajo (una planta), pero los dos se apoyan en la misma fila.
    expect(race.y + race.h).toBe(copos.y + copos.h)
    // Las fachadas se dibujan alineadas por su puerta (ver `ValleScene.buildBuildings`): entre Copos y RACE queda césped de
    // más de dos teselas, y RACE está pegada al borde oeste de la plaza, sin pisarla.
    const raceLeft = race.door.x * TILE + TILE / 2 - RACE_DOOR_COL
    const raceRight = raceLeft + RACE_FACADE.w
    const coposRight = copos.door.x * TILE + TILE / 2 - COPOS_DOOR_COL + COPOS_FACADE.w
    expect(raceLeft - coposRight).toBeGreaterThan(2 * TILE)
    const plaza = plazaTiles()
    for (let y = race.y; y < race.y + race.h; y++) {
      for (let x = Math.floor(raceLeft / TILE); x < Math.ceil(raceRight / TILE); x++) expect(plaza.has(`${x},${y}`), `la fachada pisa la plaza en ${x},${y}`).toBe(false)
    }
    // La plaza es una elipse: donde se toca con la fachada es en la fila de su base.
    expect(plaza.has(`${Math.ceil(raceRight / TILE) + 1},${race.y + race.h - 1}`), 'la fachada no está pegada a la plaza').toBe(true)
    const roads = roadTiles()
    for (let x = copos.x + copos.w; x < race.x; x++) for (let y = copos.y; y < copos.y + copos.h; y++) expect(roads.has(`${x},${y}`), `camino en el hueco ${x},${y}`).toBe(false)
    // Las dos puertas dan a la misma calle, y se va de una a otra por ella.
    expect(copos.door.y).toBe(race.door.y)
    for (let x = copos.door.x; x <= race.door.x; x++) expect(roads.has(`${x},${race.door.y}`), `calle cortada en ${x}`).toBe(true)
    ;[copos, race, mihrab].forEach((b) => expect(b.x + b.w).toBeLessThan(fountain.at[0] - 9))
    // Mihrab, con margen a los dos lados: el borde oeste y las columnas del templo.
    const columns = PROPS.find((p) => p.kind === 'romanColumns')
    expect(mihrab.x).toBeGreaterThanOrEqual(4)
    expect(columns.at[0] - 4 - (mihrab.x + mihrab.w)).toBeGreaterThanOrEqual(4)
  })

  it('RACE tiene una explanada delante del garaje con la grúa aparcada sin tapar la puerta', () => {
    const race = BUILDINGS.find((b) => b.kind === 'garage')
    const truck = PROPS.find((p) => p.kind === 'towTruck')
    const roads = roadTiles()
    // Explanada: camino en las tres filas bajo la calle, a lo ancho del garaje.
    for (let y = race.door.y + 2; y <= race.door.y + 4; y++) for (let x = race.x; x < race.x + race.w; x++) expect(roads.has(`${x},${y}`), `explanada en ${x},${y}`).toBe(true)
    // La grúa está sobre ella y no delante de la puerta.
    expect(roads.has(`${Math.floor(truck.at[0])},${Math.floor(truck.at[1])}`)).toBe(true)
    expect(truck.at[1]).toBeGreaterThan(race.door.y + 2)
    expect(Math.abs(truck.at[0] - (race.door.x + 0.5))).toBeGreaterThan(3)
    // Su carrocería sólida no pisa la columna de la puerta y no se sale de la explanada.
    const px = truck.at[0] * TILE
    const py = truck.at[1] * TILE
    TOW_TRUCK_BODY.forEach(({ l, t, r, b }) => {
      expect(px + l, 'la grúa invade la columna de la puerta').toBeGreaterThan((race.door.x + 1) * TILE)
      expect(px + r).toBeLessThanOrEqual((race.x + race.w) * TILE)
      expect(py + t).toBeGreaterThanOrEqual((race.door.y + 2) * TILE)
      expect(py + b).toBeLessThanOrEqual((race.door.y + 5) * TILE)
    })
  })

  it('en la explanada de RACE, el autobús de Aucorsa a la izquierda y la grúa a la derecha, con hueco y sin tapar el atajo', () => {
    const race = BUILDINGS.find((b) => b.kind === 'garage')
    const buses = PROPS.filter((p) => p.kind === 'bus')
    const truck = PROPS.find((p) => p.kind === 'towTruck')
    expect(buses).toHaveLength(1)
    const [bus] = buses
    const span = (prop, body) => body.map(({ l, r }) => [prop.at[0] * TILE + l, prop.at[0] * TILE + r])[0]
    const [busLeft, busRight] = span(bus, AUCORSA_BUS_BODY)
    const [truckLeft] = span(truck, TOW_TRUCK_BODY)
    expect(busRight).toBeLessThan(truckLeft - 16)
    expect(bus.at[1]).toBe(truck.at[1])
    // El atajo de la casa de Lupe llega a la explanada por x 19: el autobús empieza a su derecha.
    expect(busLeft).toBeGreaterThan(20 * TILE)
    // Sobre las baldosas de la explanada.
    const roads = roadTiles()
    expect(roads.has(`${Math.floor(bus.at[0])},${Math.floor(bus.at[1])}`)).toBe(true)
    expect(bus.at[1]).toBeGreaterThan(race.door.y + 2)
  })

  it('el borde este, recortado, queda a la derecha de la Mezquita con una franja de árboles', () => {
    const mosque = BUILDINGS.find((b) => b.id === 'mezquita')
    expect(COLS).toBe(72)
    const strip = COLS - 1 - (mosque.x + mosque.w)
    expect(strip).toBeGreaterThanOrEqual(4)
    const trees = treePositions().filter((t) => t.x >= mosque.x + mosque.w && t.x < COLS - 1 && t.y >= mosque.y && t.y < mosque.y + mosque.h)
    expect(trees.length).toBeGreaterThan(2)
    // Nada del mapa queda más allá del borde.
    BUILDINGS.forEach((b) => expect(b.x + b.w, b.id).toBeLessThanOrEqual(COLS))
    PROPS.forEach((p) => expect(p.at[0], p.kind).toBeLessThan(COLS))
  })

  it('ante la Mezquita no quedan las columnas de la Universidad y hay un naranjo a cada lado de la puerta', () => {
    expect(PROPS.some((p) => p.kind === 'statue')).toBe(false)
    const mosque = BUILDINGS.find((b) => b.id === 'mezquita')
    const trees = PROPS.filter((p) => p.kind === 'orangeTree' && Math.abs(p.at[0] - mosque.door.x) < 5).map((p) => p.at[0])
    const centre = mosque.door.x + 0.5
    expect(trees).toHaveLength(2)
    expect(trees[0] - centre).toBeCloseTo(centre - trees[1], 5)
    expect(trees[1] - centre).toBeGreaterThan(2)
  })

  it('los frutales (naranjos y manzanos) están sobre hierba: ni en caminos, ni en el agua, ni dentro de edificios, ni pegados a un árbol', () => {
    const fruit = PROPS.filter((p) => p.kind === 'orangeTree' || p.kind === 'appleTree')
    expect(fruit.filter((p) => p.kind === 'appleTree').length).toBeGreaterThanOrEqual(2)
    expect(fruit.filter((p) => p.kind === 'orangeTree').length).toBeGreaterThanOrEqual(3)
    const walk = new Set([...roadTiles(), ...plazaTiles()])
    const water = blockedWaterTiles()
    const trees = treePositions()
    fruit.forEach(({ at: [x, y] }) => {
      // Se mira justo delante de la base. Los naranjos de la Mezquita apoyan en el borde del muro, sobre el camino (entero en y): solo ellos pisan camino.
      const feet = [Math.floor(x), Math.floor(y + 0.3)]
      if (!Number.isInteger(y)) expect(walk.has(`${feet[0]},${feet[1]}`), `camino bajo el árbol en ${x},${y}`).toBe(false)
      expect(water.has(`${feet[0]},${feet[1]}`), `agua bajo el árbol en ${x},${y}`).toBe(false)
      expect(BUILDINGS.some((b) => feet[0] >= b.x && feet[0] < b.x + b.w && feet[1] >= b.y && feet[1] < b.y + b.h), `edificio en ${x},${y}`).toBe(false)
      expect(trees.some((t) => Math.hypot(t.x + 0.5 - x, t.y - y) < 2), `árbol pegado en ${x},${y}`).toBe(false)
    })
  })

  it('el valle tiene árboles de sobra', () => {
    // Con el borde este recortado (72 columnas) caben menos que antes, pero el valle sigue arbolado.
    const before = treePositions().length
    expect(before).toBeGreaterThan(250)
  })

  it('los puntos de pesca están en tierra firme, junto al agua y a los que se llega andando, y la caña también', () => {
    const blocked = new Set([...blockedWaterTiles(), ...BUILDINGS.flatMap(footprint)])
    const reach = new Set()
    const start = `${Math.floor(SPAWN.x / TILE)},${Math.floor(SPAWN.y / TILE)}`
    const queue = [start]
    reach.add(start)
    while (queue.length) {
      const [x, y] = queue.shift().split(',').map(Number)
      ;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const key = `${x + dx},${y + dy}`
        if (x + dx < 0 || y + dy < 0 || x + dx >= COLS || y + dy >= ROWS || blocked.has(key) || reach.has(key)) return
        reach.add(key)
        queue.push(key)
      })
    }
    const spots = fishSpots()
    expect(spots.length).toBe(5)
    spots.forEach((spot) => {
      // La zona de pesca mide unos 36 px: basta con que alguna de las teselas de alrededor se alcance a pie.
      const cx = Math.floor(spot.stand.x / TILE)
      const cy = Math.floor(spot.stand.y / TILE)
      const around = [-1, 0, 1].flatMap((dx) => [-1, 0, 1].map((dy) => `${cx + dx},${cy + dy}`))
      expect(around.some((tile) => reach.has(tile)), `a ${spot.id} no se llega`).toBe(true)
      expect(Math.hypot(spot.stand.x - spot.water.x, spot.stand.y - spot.water.y), `${spot.id} lejos del agua`).toBeLessThan(60)
      expect(signedDistance(spot.water.x, spot.water.y), `el corcho de ${spot.id} no cae en el agua`).toBeGreaterThan(4)
    })
    expect(reach.has(`${Math.floor(ROD_SPOT.at[0])},${Math.floor(ROD_SPOT.at[1])}`)).toBe(true)
  })

  it('el decorado del río: nenúfares sobre el agua, juncos fuera de caminos y edificios, y nada sobre los puentes', () => {
    const roads = roadTiles()
    const lilies = PROPS.filter((p) => p.kind === 'lily')
    const reeds = PROPS.filter((p) => p.kind === 'reeds')
    expect(lilies.length).toBeGreaterThanOrEqual(8)
    expect(reeds.length).toBeGreaterThanOrEqual(12)
    lilies.forEach((p) => expect(signedDistance(p.at[0] * TILE, (p.at[1] - 0.3) * TILE)).toBeGreaterThan(5))
    reeds.forEach((p) => {
      const key = `${Math.floor(p.at[0])},${Math.floor(p.at[1] - 0.7)}`
      expect(roads.has(key), `juncos sobre un camino en ${key}`).toBe(false)
      BUILDINGS.forEach((b) => expect(footprint(b).includes(key)).toBe(false))
    })
    ;[...lilies, ...reeds].forEach((p) =>
      BRIDGES.forEach((b) => expect(p.at[0] >= b.x - 1 && p.at[0] < b.x + b.w + 1 && p.at[1] >= b.y - 1 && p.at[1] < b.y + b.h + 2, `${p.kind} bajo ${b.id}`).toBe(false)),
    )
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

describe('Ayuntamiento y columnas de la franja norte', () => {
  const cityHall = BUILDINGS.find((b) => b.id === 'ayuntamiento')
  const columns = PROPS.find((p) => p.kind === 'romanColumns')

  // Teselas que tocan el cuerpo sólido de un objeto (ver `propSprite`): el camino a la puerta no puede atravesarlas.
  const propTiles = (prop, body) => {
    const tiles = []
    const px = prop.at[0] * TILE
    const py = prop.at[1] * TILE
    body.forEach(({ l, t, r, b }) => {
      for (let y = Math.floor((py + t) / TILE); y <= Math.floor((py + b) / TILE); y++)
        for (let x = Math.floor((px + l) / TILE); x <= Math.floor((px + r) / TILE); x++) tiles.push(`${x},${y}`)
    })
    return tiles
  }

  it('las columnas del templo quedan pegadas a la izquierda del Ayuntamiento, sin solaparse', () => {
    // El dibujo del Ayuntamiento mide `w` teselas y se alinea por el centro de la puerta (ver `ValleScene.buildBuildings`).
    const facadeLeft = cityHall.door.x * TILE + TILE / 2 - (cityHall.w * TILE) / 2 + FACADE_LEFT
    const columnsRight = columns.at[0] * TILE + Math.max(...COLUMN_BODY.map((b) => b.r))
    expect(facadeLeft - columnsRight).toBeGreaterThan(0)
    expect(facadeLeft - columnsRight).toBeLessThanOrEqual(2)
    expect(columns.at[1]).toBeLessThanOrEqual(cityHall.door.y)
  })

  it('su puerta se alcanza a pie desde la entrada del valle, sin pisar agua, edificios ni las columnas', () => {
    const blocked = new Set([...blockedWaterTiles(), ...BUILDINGS.flatMap(footprint), ...propTiles(columns, COLUMN_BODY)])
    treePositions().forEach((t) => blocked.add(`${t.x},${t.y}`))
    const start = `${Math.floor(SPAWN.x / TILE)},${Math.floor(SPAWN.y / TILE)}`
    const reach = new Set([start])
    const queue = [start]
    while (queue.length) {
      const [x, y] = queue.shift().split(',').map(Number)
      ;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const key = `${x + dx},${y + dy}`
        if (x + dx < 0 || y + dy < 0 || x + dx >= COLS || y + dy >= ROWS || blocked.has(key) || reach.has(key)) return
        reach.add(key)
        queue.push(key)
      })
    }
    expect(reach.has(`${cityHall.door.x},${cityHall.door.y}`), 'puerta del Ayuntamiento').toBe(true)
  })

  it('delante de la puerta hay plaza empedrada y ningún objeto sólido hasta el camino', () => {
    const plaza = plazaTiles()
    const roads = roadTiles()
    const { x, y } = cityHall.door
    expect(plaza.has(`${x},${y}`)).toBe(true)
    expect(roads.has(`${x},${y + 2}`)).toBe(true)
    const solidNear = PROPS.filter((p) => p.kind !== 'cityMosaic' && Math.abs(p.at[0] - (x + 0.5)) < 2.5 && p.at[1] > y - 1 && p.at[1] < y + 3)
    expect(solidNear).toEqual([])
  })

  it('el podio de las columnas es sólido hasta el suelo', () => {
    expect(COLUMN_BODY.every((b) => b.b === -1 && b.t < -20)).toBe(true)
  })
})
