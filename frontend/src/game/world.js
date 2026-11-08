// Mapa del Valle del Bucle, en teselas de 16 px. Sin dependencias de Phaser.
import { seeded } from './palette.js'

export const TILE = 16
export const COLS = 56
export const ROWS = 30
export const SPAWN = { x: 28 * TILE, y: 17 * TILE }

// Cada edificio: posición de su esquina superior izquierda en teselas,
// tamaño en teselas y la tesela de la puerta (donde se pisa para entrar).
export const BUILDINGS = [
  { id: 'about', kind: 'house', style: { roof: '#d4503a', roofDark: '#b8402c' }, x: 8, y: 8, w: 4, h: 3.5, door: { x: 10, y: 12 } },
  { id: 'projects', kind: 'house', style: { roof: '#2f8f8b', roofDark: '#1f6468' }, x: 22, y: 6, w: 4, h: 3.5, door: { x: 24, y: 10 } },
  { id: 'contact', kind: 'house', style: { roof: '#7a3f8f', roofDark: '#5a2d6a' }, x: 36, y: 8, w: 4, h: 3.5, door: { x: 38, y: 12 } },
  { id: 'stack', kind: 'house', style: { roof: '#4a4a6a', roofDark: '#3b3b58', chimney: true, glow: true }, x: 44, y: 17, w: 4, h: 3.5, door: { x: 46, y: 21 } },
  { id: 'blog', kind: 'dungeon', x: 8, y: 17, w: 5, h: 3.25, door: { x: 10, y: 21 } },
]

export const LAKE = { x: 20, y: 22, w: 9, h: 5 }

// Caminos de tierra: tramos rectos entre teselas (ambos extremos incluidos).
const ROADS = [
  [4, 15, 52, 15],
  [10, 12, 10, 15],
  [24, 10, 24, 15],
  [38, 12, 38, 15],
  [43, 15, 43, 21],
  [43, 21, 47, 21],
  [7, 15, 7, 21],
  [7, 21, 11, 21],
]

export function roadTiles() {
  const set = new Set()
  ROADS.forEach(([x1, y1, x2, y2]) => {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        set.add(`${x},${y}`)
        if (y1 === y2) set.add(`${x},${y + 1}`) // camino principal de 2 teselas
      }
    }
  })
  return set
}

function inside(rect, x, y, margin = 0) {
  return x >= rect.x - margin && x < rect.x + rect.w + margin && y >= rect.y - margin && y < rect.y + rect.h + margin
}

// Árboles: borde del mapa más algunos sueltos, sin pisar caminos ni edificios.
export function treePositions() {
  const roads = roadTiles()
  const rand = seeded(2024)
  const trees = []
  const used = new Set()
  const add = (x, y) => {
    const key = `${x},${y}`
    if (used.has(key)) return
    used.add(key)
    trees.push({ x, y, variant: rand() > 0.5 ? 1 : 0 })
  }

  for (let x = 0; x < COLS; x++) {
    add(x, 1)
    add(x, ROWS - 1)
  }
  for (let y = 2; y < ROWS - 1; y++) {
    add(0, y)
    add(COLS - 1, y)
  }
  for (let i = 0; i < 70; i++) {
    const x = 2 + Math.floor(rand() * (COLS - 4))
    const y = 3 + Math.floor(rand() * (ROWS - 5))
    const blocked =
      roads.has(`${x},${y}`) ||
      roads.has(`${x},${y - 1}`) ||
      inside(LAKE, x, y, 1) ||
      BUILDINGS.some((b) => inside(b, x, y, 2) || (Math.abs(x - b.door.x) < 2 && y >= b.door.y - 1 && y <= b.door.y + 3)) ||
      Math.abs(x - SPAWN.x / TILE) < 3 && Math.abs(y - SPAWN.y / TILE) < 3
    if (!blocked) add(x, y)
  }
  return trees
}
