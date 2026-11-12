import { describe, expect, it } from 'vitest'
import { BRIDGES, BUILDINGS, COLS, PROPS, ROWS, SPAWN, TILE, blockedWaterTiles, plazaTiles, roadTiles, treePositions, waterTiles } from './world.js'
import { fishSpots, ROD_SPOT } from './riverPlaces.js'
import { signedDistance } from './river.js'

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

  it('hay tres puentes y cada uno cruza el río de orilla a orilla, con tierra firme a los dos lados', () => {
    const water = waterTiles()
    const walkable = blockedWaterTiles()
    expect(BRIDGES.length).toBe(3)
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

  it('el río es un cauce continuo de entre tres y seis teselas, sin cortes ni estrechamientos bruscos', () => {
    const water = waterTiles()
    // Por filas, la anchura de cada tramo, desde que el afluente se ha unido al río (justo encima del puente romano) hasta la salida.
    const widths = []
    for (let y = 29; y < 45; y++) {
      let run = 0
      for (let x = 40; x < 70; x++) if (water.has(`${x},${y}`)) run += 1
      widths.push(run)
    }
    widths.forEach((run, i) => expect(run, `fila ${29 + i}`).toBeGreaterThan(0))
    const steps = widths.slice(1).map((run, i) => Math.abs(run - widths[i]))
    expect(Math.max(...steps)).toBeLessThanOrEqual(4)
    expect(Math.max(...widths)).toBeLessThanOrEqual(12)
  })

  it('el río baja del borde norte entre Artes y la Casa del Encuentro, sin cortes, y se une al río', () => {
    const water = waterTiles()
    const artes = BUILDINGS.find((b) => b.id === 'artes')
    const mosque = BUILDINGS.find((b) => b.id === 'encuentro')
    for (let y = 3; y <= 16; y++) {
      const xs = [...Array(mosque.x - artes.x)].map((_, i) => artes.x + i).filter((x) => water.has(`${x},${y}`))
      expect(xs.length, `fila ${y}`).toBeGreaterThan(0)
      // El agua queda entre los dos edificios, sin pisar a ninguno y con tierra a los dos lados.
      expect(Math.min(...xs), `fila ${y}`).toBeGreaterThan(artes.x + artes.w)
      expect(Math.max(...xs), `fila ${y}`).toBeLessThan(mosque.x - 1)
    }
    // Se hace hilo al llegar al borde y no sale por él: las filas 0 y 1 son de árboles, no de agua.
    for (let x = 0; x < COLS; x++) expect(water.has(`${x},0`) || water.has(`${x},1`), `columna ${x}`).toBe(false)
    // Y desemboca en el río principal: hay agua continua hasta tocarlo, junto al puente romano.
    expect([...Array(8)].some((_, i) => water.has(`${52},${24 + i}`))).toBe(true)
  })

  it('Cervantes ya no está y la Universidad ocupa su sitio, con su misma puerta', () => {
    expect(BUILDINGS.some((b) => b.id === 'cervantes')).toBe(false)
    expect(BUILDINGS.some((b) => b.kind === 'school')).toBe(false)
    const university = BUILDINGS.find((b) => b.id === 'universidad')
    expect(university).toMatchObject({ x: 16, y: 4, door: { x: 23, y: 12 } })
  })

  it('la Mezquita está junto al puente romano, sin interior, y su puerta abre la conversación con Lupe', () => {
    const mosque = BUILDINGS.find((b) => b.id === 'mezquita')
    expect(mosque).toMatchObject({ kind: 'mosque', x: 58, y: 17, w: 17, h: 11, door: { x: 66, y: 28 }, talk: 'valle.mezquita' })
  })

  it('el taller de proyectos y la Casa de la Música ya no están en el mapa', () => {
    expect(BUILDINGS.some((b) => b.id === 'projects' || b.kind === 'workshop')).toBe(false)
    expect(BUILDINGS.some((b) => b.id === 'musica' || b.kind === 'music')).toBe(false)
  })

  it('la Casa del Encuentro ocupa la parcela que tuvo la Mezquita, con la puerta sobre el camino del norte', () => {
    const house = BUILDINGS.find((b) => b.id === 'encuentro')
    expect(house).toMatchObject({ kind: 'friends', x: 52, y: 7, w: 8, h: 8, door: { x: 55, y: 15 } })
  })

  it('el solar de la Casa de la Música queda limpio: ni camino ni edificio, y con árboles de relleno', () => {
    const roads = roadTiles()
    for (let y = 17; y < 28; y++) expect(roads.has(`75,${y}`), `camino en 75,${y}`).toBe(false)
    const filler = treePositions().filter((t) => t.x >= 75 && t.x <= 78 && t.y >= 17 && t.y <= 27)
    expect(filler.length).toBeGreaterThan(0)
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
    expect(fruit.filter((p) => p.kind === 'appleTree').length).toBeGreaterThanOrEqual(3)
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

  it('los frutales no cambian la siembra de árboles de antes: con ellos o sin ellos salen los mismos', () => {
    const before = treePositions().length
    expect(before).toBeGreaterThan(300)
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
