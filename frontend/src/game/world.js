// Mapa del Valle del Bucle, en teselas de 16 px. Sin dependencias de Phaser.
import { seeded } from './palette.js'

export const TILE = 16
export const COLS = 56
export const ROWS = 30
export const SPAWN = { x: 28 * TILE, y: 17 * TILE }

// Plaza central: punto de entrada y cruce de todos los caminos. Empedrada, para
// que se distinga de un vistazo de la tierra de los senderos.
export const PLAZA = { x: 24, y: 12, w: 9, h: 6 }

// Cartel de la plaza, en el centro: orienta a quien llega por primera vez.
export const SIGNPOST = { x: 28, y: 14 }

// Cada edificio: posición de su esquina superior izquierda en teselas,
// tamaño en teselas y la tesela de la puerta (donde se pisa para entrar).
// Reparto: el Taller al norte de la plaza, como destino principal; la casa de Lupe
// y la taberna al oeste; la biblioteca y correos al este.
export const BUILDINGS = [
  { id: 'about', kind: 'house', style: { roof: '#e0708f', shutter: '#b8a2e0' }, x: 10, y: 6, w: 4, h: 4, door: { x: 12, y: 10 } },
  { id: 'projects', kind: 'house', style: { roof: '#2f8f8b', shutter: '#f2b134' }, x: 26, y: 4, w: 4, h: 4, door: { x: 28, y: 8 } },
  { id: 'contact', kind: 'house', style: { roof: '#9b6bb5', shutter: '#f4b8cc' }, x: 44, y: 17, w: 4, h: 4, door: { x: 46, y: 21 } },
  { id: 'stack', kind: 'house', style: { roof: '#5c5a7a', shutter: '#d4503a', glow: true }, x: 10, y: 19, w: 4, h: 4, door: { x: 12, y: 23 } },
  { id: 'blog', kind: 'dungeon', x: 42, y: 6, w: 5, h: 3.25, door: { x: 44, y: 10 } },
]

export const LAKE = { x: 26, y: 21, w: 9, h: 5 }

// Caminos de tierra: tramos rectos entre teselas (ambos extremos incluidos).
// Los horizontales ocupan dos teselas de alto; los verticales, una.
const ROADS = [
  [6, 14, 50, 14],
  [12, 10, 12, 13],
  [28, 8, 28, 11],
  [44, 10, 44, 13],
  [42, 16, 42, 21],
  [42, 21, 46, 21],
  [8, 16, 8, 23],
  [8, 23, 12, 23],
]

export function plazaTiles() {
  const set = new Set()
  for (let y = PLAZA.y; y < PLAZA.y + PLAZA.h; y++) {
    for (let x = PLAZA.x; x < PLAZA.x + PLAZA.w; x++) set.add(`${x},${y}`)
  }
  return set
}

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
  // Variantes: 0 y 1 son verdes; 2 es un cerezo en flor, que se reserva para el interior.
  const add = (x, y, blossom = false) => {
    const key = `${x},${y}`
    if (used.has(key)) return
    used.add(key)
    trees.push({ x, y, variant: blossom ? 2 : rand() > 0.5 ? 1 : 0 })
  }

  for (let x = 0; x < COLS; x++) {
    add(x, 1)
    add(x, ROWS - 1)
  }
  for (let y = 2; y < ROWS - 1; y++) {
    add(0, y)
    add(COLS - 1, y)
  }
  // Los árboles son grandes (casi tres teselas de ancho): con menos basta para llenar el valle.
  for (let i = 0; i < 40; i++) {
    const x = 2 + Math.floor(rand() * (COLS - 4))
    const y = 3 + Math.floor(rand() * (ROWS - 5))
    const blocked =
      roads.has(`${x},${y}`) ||
      roads.has(`${x},${y - 1}`) ||
      inside(LAKE, x, y, 1) ||
      inside(PLAZA, x, y, 1) ||
      BUILDINGS.some((b) => inside(b, x, y, 2) || (Math.abs(x - b.door.x) < 2 && y >= b.door.y - 1 && y <= b.door.y + 3)) ||
      Math.abs(x - SPAWN.x / TILE) < 3 && Math.abs(y - SPAWN.y / TILE) < 3
    if (!blocked) add(x, y, rand() < 0.25)
  }
  return trees
}
