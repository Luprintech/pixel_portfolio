// Mapa del Valle del Bucle, en teselas de 16 px. Sin dependencias de Phaser.
// Parte de la lámina de referencia `img/valle/referencia valle del bucle.png`, a escala 0,052 (80×54
// teselas) y con los edificios a la mitad de su tamaño en la lámina, para que quepan varios en pantalla.
import { seeded } from './palette.js'

export const TILE = 16
export const COLS = 80
export const ROWS = 54
// La viajera aparece en el camino, junto a la entrada del sur.
export const SPAWN = { x: 38 * TILE, y: 44 * TILE }

// Cada lugar: esquina superior izquierda y tamaño en teselas, y la tesela de la puerta, que queda justo
// debajo del edificio (donde se pisa para entrar). `zone` es el panel que abre; sin él, la puerta aún no
// lleva a ningún contenido (interiores y diálogos llegan en fases posteriores).
export const BUILDINGS = [
  // Norte: formación.
  { id: 'cervantes', kind: 'school', x: 18, y: 4, w: 12, h: 8, door: { x: 23 } },
  { id: 'artes', kind: 'gallery', x: 31, y: 6, w: 10, h: 6, door: { x: 36 } },
  { id: 'universidad', kind: 'university', x: 42, y: 3, w: 15, h: 8, door: { x: 49 } },
  { id: 'daw', kind: 'lab', x: 20, y: 14, w: 10, h: 5, door: { x: 25 }, zone: 'stack' },
  // Noreste: proyectos y lectura.
  { id: 'projects', kind: 'workshop', x: 60, y: 8, w: 9, h: 7, door: { x: 64 }, zone: 'projects' },
  { id: 'blog', kind: 'library', x: 69, y: 7, w: 9, h: 8, door: { x: 73 }, zone: 'blog' },
  // Oeste: trabajo y casa.
  { id: 'mihrab', kind: 'bar', x: 2, y: 19, w: 14, h: 8, door: { x: 9 } },
  { id: 'copos', kind: 'shop', x: 17, y: 21, w: 11, h: 6, door: { x: 23 } },
  { id: 'about', kind: 'home', x: 7, y: 34, w: 15, h: 10, door: { x: 15 }, zone: 'about' },
  // Este: amistades, música y familia.
  { id: 'encuentro', kind: 'friends', x: 60, y: 18, w: 8, h: 8, door: { x: 63 } },
  { id: 'musica', kind: 'music', x: 72, y: 17, w: 7, h: 6, door: { x: 75 } },
  { id: 'casaHermanos', kind: 'cottage', x: 60, y: 31, w: 7, h: 5, door: { x: 63 }, variant: 0 },
  { id: 'casaPadres', kind: 'cottage', x: 72, y: 31, w: 7, h: 5, door: { x: 75 }, variant: 1 },
  // Sur: asistencia en carretera.
  { id: 'asistencia', kind: 'garage', x: 45, y: 38, w: 11, h: 6, door: { x: 49 } },
  // Quiosco de helados de la piscina.
  { id: 'kiosko', kind: 'kiosk', x: 12, y: 10, w: 4, h: 4, door: { x: 13 } },
].map((b) => ({ ...b, door: { x: b.door.x, y: b.y + b.h } }))

// Objetos sueltos: `at` es el punto de apoyo (centro de la base) en teselas, con decimales, y `zone` la
// puerta que lleva a un panel. El tamaño del cuerpo sólido lo da `PROP_BODY` en ValleScene.
export const PROPS = [
  { kind: 'fountain', at: [37, 29.2] },
  { kind: 'noticeboard', at: [33.5, 31.6] },
  { kind: 'postbox', at: [47.5, 24.2], zone: 'contact', door: { x: 47, y: 24 } },
  { kind: 'arch', at: [37, 48.4] },
  { kind: 'busStop', at: [43.5, 34.6] },
  { kind: 'bus', at: [48, 35.4] },
  { kind: 'towTruck', at: [58.6, 44.6] },
  { kind: 'pool', at: [8, 15.5] },
  { kind: 'statue', at: [45, 13.6], variant: 0 },
  { kind: 'statue', at: [54, 13.6], variant: 1 },
  { kind: 'easel', at: [33.5, 12.6] },
  { kind: 'easel', at: [39.5, 12.6] },
  { kind: 'bench', at: [32.5, 24.4] },
  { kind: 'bench', at: [41.5, 24.4] },
  { kind: 'bench', at: [31.5, 31.4] },
  { kind: 'bench', at: [42, 31.4] },
  { kind: 'bench', at: [65, 38.6] },
  { kind: 'bench', at: [70, 38.6] },
  { kind: 'lamp', at: [30.2, 27] },
  { kind: 'lamp', at: [44.6, 27] },
  { kind: 'lamp', at: [34.6, 22.6] },
  { kind: 'lamp', at: [40.2, 22.6] },
  { kind: 'lamp', at: [34.6, 33.6] },
  { kind: 'lamp', at: [40.2, 33.6] },
  { kind: 'lamp', at: [35.4, 47.2] },
  { kind: 'lamp', at: [39, 47.2] },
  { kind: 'lamp', at: [48.2, 21] },
  { kind: 'lamp', at: [20.5, 26.8] },
  { kind: 'rocks', at: [75.5, 47.6] },
  { kind: 'rocks', at: [78, 45.6] },
  { kind: 'umbrella', at: [4.6, 17.4] },
  { kind: 'umbrella', at: [11.2, 17.4] },
  ...Array.from({ length: 16 }, (_, i) => ({ kind: 'fence', at: [3 + i * 2, 50.4] })).filter((p) => p.at[0] < 34),
  ...Array.from({ length: 20 }, (_, i) => ({ kind: 'fence', at: [41 + i * 2, 50.4] })).filter((p) => p.at[0] < 78),
]

// Caminos de tierra: tramos rectos entre teselas (ambos extremos incluidos) con su ancho. Los troncales
// son de dos teselas; los ramales hasta cada puerta, de una.
const ROADS = [
  // Eje norte-sur desde la entrada hasta la plaza y, más allá, hasta Artes.
  { from: [36, 12], to: [36, 50], w: 2 },
  // Norte: de Cervantes a Artes y hacia la piscina.
  { from: [16, 12], to: [37, 12], w: 2 },
  { from: [16, 12], to: [16, 28], w: 1 },
  { from: [25, 19], to: [37, 19], w: 2 },
  // Oeste: Mihrab y Copos.
  { from: [9, 27], to: [28, 27], w: 2 },
  // Casa de Lupe: ramal a la plaza y vuelta al eje por el sur.
  { from: [28, 30], to: [24, 30], w: 2 },
  { from: [24, 30], to: [24, 44], w: 2 },
  { from: [15, 44], to: [49, 44], w: 2 },
  // Norte-este: universidad, proyectos y biblioteca.
  { from: [49, 11], to: [49, 15], w: 1 },
  { from: [36, 15], to: [76, 15], w: 2 },
  { from: [64, 15], to: [64, 15], w: 1 },
  { from: [73, 15], to: [73, 15], w: 1 },
  // Este: puente, amistades, música y familia.
  { from: [44, 28], to: [76, 28], w: 2 },
  { from: [63, 26], to: [63, 28], w: 1 },
  { from: [75, 23], to: [75, 28], w: 1 },
  // Entre las dos casitas baja un ramal hasta el camino que une sus puertas.
  { from: [69, 28], to: [69, 37], w: 1 },
  { from: [63, 36], to: [75, 37], w: 2 },
  // Correos, en el borde de la plaza.
  { from: [47, 24], to: [47, 28], w: 1 },
  // Sur: asistencia.
  { from: [49, 44], to: [49, 44], w: 1 },
  // Quiosco de la piscina.
  { from: [13, 14], to: [13, 14], w: 1 },
]

// Arroyo del este, de norte a sur y luego hacia el este: puntos por los que pasa, siempre de dos teselas.
const STREAM = [[57, 18], [54, 22], [52, 25], [51, 30], [55, 35], [60, 40], [64, 43], [70, 45], [77, 46]]

// Puente donde el camino del este cruza el arroyo: sus teselas se pueden pisar aunque sean agua.
export const BRIDGE = { x: 50, y: 28, w: 5, h: 2 }

// Plaza empedrada alrededor de la fuente: una elipse de teselas.
const PLAZA_CENTER = { x: 37, y: 27.5, rx: 9.5, ry: 5.5 }

function stamp(set, x, y, w) {
  for (let dy = 0; dy < w; dy++) for (let dx = 0; dx < w; dx++) set.add(`${x + dx},${y + dy}`)
}

export function plazaTiles() {
  const set = new Set()
  const { x: cx, y: cy, rx, ry } = PLAZA_CENTER
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const dx = (x + 0.5 - cx) / rx
      const dy = (y + 0.5 - cy) / ry
      if (dx * dx + dy * dy <= 1) set.add(`${x},${y}`)
    }
  }
  return set
}

export function roadTiles() {
  const set = new Set()
  ROADS.forEach(({ from: [x1, y1], to: [x2, y2], w }) => {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) stamp(set, x, y, w)
    }
  })
  return set
}

export function waterTiles() {
  const set = new Set()
  STREAM.slice(0, -1).forEach(([x1, y1], i) => {
    const [x2, y2] = STREAM[i + 1]
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 2
    for (let s = 0; s <= steps; s++) stamp(set, Math.round(x1 + ((x2 - x1) * s) / steps), Math.round(y1 + ((y2 - y1) * s) / steps), 2)
  })
  return set
}

// Teselas de agua por las que no se puede andar: todas menos las del puente.
export function blockedWaterTiles() {
  const set = waterTiles()
  for (let y = BRIDGE.y; y < BRIDGE.y + BRIDGE.h; y++) for (let x = BRIDGE.x; x < BRIDGE.x + BRIDGE.w; x++) set.delete(`${x},${y}`)
  return set
}

const inside = (r, x, y, margin = 0) => x >= r.x - margin && x < r.x + r.w + margin && y >= r.y - margin && y < r.y + r.h + margin

// Regiones del interior con muchos árboles (los cerezos en flor se juntan en el suroeste y el sureste,
// como en la lámina) y con qué probabilidad un árbol de cada una es cerezo.
const GROVES = [
  { x: 2, y: 36, w: 4, h: 15, count: 9, blossom: 0.9 },
  { x: 62, y: 46, w: 16, h: 6, count: 12, blossom: 0.8 },
  { x: 2, y: 2, w: 12, h: 8, count: 6, blossom: 0.5 },
  { x: 58, y: 2, w: 8, h: 5, count: 4, blossom: 0.5 },
  { x: 66, y: 36, w: 12, h: 8, count: 6, blossom: 0.4 },
  { x: 18, y: 34, w: 6, h: 14, count: 6, blossom: 0.1 },
  { x: 24, y: 46, w: 10, h: 4, count: 6, blossom: 0.2 },
  { x: 56, y: 19, w: 4, h: 12, count: 4, blossom: 0.3 },
  { x: 38, y: 35, w: 7, h: 8, count: 5, blossom: 0.2 },
]

// Árboles: borde del mapa, grupos del interior y algunos sueltos, sin pisar caminos, agua, plaza,
// edificios (ni el pasillo hasta su puerta) ni objetos.
export function treePositions() {
  const roads = roadTiles()
  const water = waterTiles()
  const plaza = plazaTiles()
  const rand = seeded(2024)
  const trees = []
  const used = new Set()
  // Variantes: 0 y 1 son verdes; 2 es un cerezo en flor.
  const add = (x, y, blossom = false) => {
    const key = `${x},${y}`
    if (used.has(key)) return
    used.add(key)
    trees.push({ x, y, variant: blossom ? 2 : rand() > 0.5 ? 1 : 0 })
  }

  const blocked = (x, y) =>
    roads.has(`${x},${y}`) ||
    roads.has(`${x},${y - 1}`) ||
    roads.has(`${x - 1},${y}`) ||
    roads.has(`${x + 1},${y}`) ||
    [...Array(3).keys()].some((d) => water.has(`${x + d - 1},${y}`) || water.has(`${x + d - 1},${y - 1}`) || water.has(`${x + d - 1},${y + 1}`)) ||
    plaza.has(`${x},${y}`) ||
    plaza.has(`${x},${y - 1}`) ||
    BUILDINGS.some((b) => inside(b, x, y, 1) || (Math.abs(x - b.door.x) < 2 && y >= b.door.y - 1 && y <= b.door.y + 3)) ||
    PROPS.some(({ at: [px, py] }) => Math.abs(x - px) < 2.2 && Math.abs(y - py) < 2.4) ||
    (Math.abs(x - SPAWN.x / TILE) < 3 && Math.abs(y - SPAWN.y / TILE) < 3) ||
    // Entrada del sur: el arco y el hueco de la valla se quedan despejados.
    (x >= 33 && x <= 41 && y >= 44)

  for (let x = 0; x < COLS; x++) {
    add(x, 1)
    if (!(x >= 33 && x <= 41)) add(x, ROWS - 1)
  }
  for (let y = 2; y < ROWS - 1; y++) {
    add(0, y)
    add(COLS - 1, y)
  }
  // Los árboles son grandes (casi tres teselas de ancho): con grupos pequeños basta para llenar.
  GROVES.forEach((grove) => {
    // Se intenta el triple de veces que árboles se quieren: los que caen sobre un camino se descartan.
    for (let i = 0; i < grove.count * 3; i++) {
      const x = grove.x + Math.floor(rand() * grove.w)
      const y = grove.y + Math.floor(rand() * grove.h)
      if (!blocked(x, y)) add(x, y, rand() < grove.blossom)
    }
  })
  for (let i = 0; i < 60; i++) {
    const x = 2 + Math.floor(rand() * (COLS - 4))
    const y = 3 + Math.floor(rand() * (ROWS - 5))
    if (!blocked(x, y)) add(x, y, rand() < 0.2)
  }
  return trees
}
