// Dónde van las flores de primavera y las hojas caídas de otoño: en los bordes de los caminos y de la plaza, sobre la hierba y nunca encima de
// un camino, del agua, de un edificio ni de un objeto o árbol. Siempre los mismos puntos (salen de un hash de la tesela), así que recargar o volver de
// una casa no los mueve. Sin Phaser: `SeasonalLife` los pinta.
import { hash2 } from './pixelKit.js'
import { FLOWER_KINDS, LEAF_KINDS } from './seasonalSprites.js'
import { BUILDINGS, COLS, PROPS, ROWS, TILE, plazaTiles, roadTiles, treePositions, waterTiles } from './world.js'

// Cuántas teselas del borde llevan algo (`chance`), cuántas piezas tienen (`perTile`) y la semilla de cada capa.
export const DECOR = {
  flowers: { chance: 0.42, perTile: 2, seed: 61, kinds: FLOWER_KINDS },
  leaves: { chance: 0.5, perTile: 3, seed: 73, kinds: LEAF_KINDS },
}

// Radio (en teselas) que ocupa cada tipo de objeto alrededor de su punto de apoyo; los no listados ocupan lo normal.
const PROP_REACH = { pool: 5.5, fountain: 4.5, arch: 3, cordobaArch: 4.5, sanRafael: 2.5, romanColumns: 6, bus: 4, busStop: 2, towTruck: 3, seatCordoba: 2, romanBridge: 6, easel: 2, umbrella: 2.2, lounger: 2.5, flowerBed: 2.5, cityMosaic: 3, welcomeSign: 2.5 }
const DEFAULT_REACH = 1.4

const NEIGHBOURS = [[1, 0], [-1, 0], [0, 1], [0, -1]]
const AROUND = [-1, 0, 1]

// Teselas de hierba con un camino o la plaza al lado y nada más encima.
export function edgeTiles() {
  const flat = new Set([...roadTiles(), ...plazaTiles()])
  const water = waterTiles()
  const trees = treePositions()
  const props = PROPS.map((p) => ({ x: p.at[0], y: p.at[1], reach: PROP_REACH[p.kind] ?? DEFAULT_REACH }))
  const tiles = []
  for (let y = 1; y < ROWS - 1; y++) {
    for (let x = 1; x < COLS - 1; x++) {
      const key = `${x},${y}`
      if (flat.has(key) || water.has(key)) continue
      if (!NEIGHBOURS.some(([dx, dy]) => flat.has(`${x + dx},${y + dy}`))) continue
      if (AROUND.some((dy) => AROUND.some((dx) => water.has(`${x + dx},${y + dy}`)))) continue
      if (BUILDINGS.some((b) => x >= b.x - 1 && x < b.x + b.w + 1 && y >= b.y - 1 && y < b.y + b.h + 1)) continue
      if (trees.some((t) => Math.hypot(t.x + 0.5 - (x + 0.5), t.y + 0.5 - (y + 0.5)) < 1.6)) continue
      if (props.some((p) => Math.hypot(p.x - (x + 0.5), p.y - (y + 0.5)) < p.reach)) continue
      tiles.push({ x, y })
    }
  }
  return tiles
}

// Las piezas de una capa (`flowers` o `leaves`): `{ x, y, kind }` en píxeles, ordenadas de arriba abajo. `x`, `y` es la base de la pieza.
export function decorSpots(layer, tiles = edgeTiles()) {
  const { chance, perTile, seed, kinds } = DECOR[layer]
  const spots = []
  tiles.forEach(({ x, y }) => {
    if (hash2(x, y, seed) >= chance) return
    const count = 1 + Math.floor(hash2(x, y, seed + 1) * perTile)
    for (let i = 0; i < count; i++) {
      spots.push({
        x: x * TILE + 3 + Math.floor(hash2(x, y, seed + 10 + i) * (TILE - 6)),
        y: y * TILE + 4 + Math.floor(hash2(x, y, seed + 20 + i) * (TILE - 6)),
        kind: Math.floor(hash2(x, y, seed + 30 + i) * kinds),
      })
    }
  })
  return spots.sort((a, b) => a.y - b.y)
}
