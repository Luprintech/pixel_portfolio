// Mapa del Valle del Bucle, en teselas de 16 px. Sin dependencias de Phaser.
// Parte de la lámina de referencia `img/valle/referencia valle del bucle.png`, a escala 0,052 (80×54
// teselas) y con los edificios a la mitad de su tamaño en la lámina, para que quepan varios en pantalla.
import { seeded } from './palette.js'
import { legacyRiverTiles, riverTiles } from './river.js'
import { ROD_SPOT, riverProps } from './riverPlaces.js'

export const TILE = 16
export const COLS = 80
export const ROWS = 54
// El cruce de caminos de la entrada: donde espera Lupe y a donde vuelve la viajera si guardó su posición en un sitio inválido.
export const SPAWN = { x: 38 * TILE, y: 44 * TILE }
// Una partida nueva empieza fuera del valle, al sur del arco: la viajera entra andando por el camino hasta `stopY`, donde
// recupera el control, y se encuentra a Lupe esperando en el cruce.
export const ARRIVAL = { x: 600, y: 836, stopY: 780 }

// Cada lugar: esquina superior izquierda y tamaño en teselas, y la tesela de la puerta, que queda justo
// debajo del edificio (donde se pisa para entrar). `zone` es el panel que abre; sin él, la puerta aún no
// lleva a ningún contenido (interiores y diálogos llegan en fases posteriores). `terrace` marca el edificio
// cuya escalera y cubierta se pisan (ver `terrace.js`).
export const BUILDINGS = [
  // Norte: formación. La Universidad ocupa el sitio donde estaba el colegio Cervantes (misma puerta, en la tesela 23).
  { id: 'universidad', kind: 'university', x: 16, y: 4, w: 15, h: 8, door: { x: 23 } },
  { id: 'artes', kind: 'gallery', x: 31, y: 6, w: 10, h: 6, door: { x: 36 } },
  // Mezquita-Catedral de Córdoba, homenaje a la ciudad de Lupe. No tiene interior: la puerta (`talk`) abre una conversación con Lupe.
  { id: 'mezquita', kind: 'mosque', x: 58, y: 17, w: 17, h: 11, door: { x: 66 }, talk: 'valle.mezquita' },
  // IES Gran Capitán, nodo de la formación en DAW. Conserva el id `daw` (puerta, interior, guardado y textos) del antiguo laboratorio.
  { id: 'daw', kind: 'institute', x: 20, y: 14, w: 10, h: 5, door: { x: 25 } },
  // Noreste: lectura.
  { id: 'blog', kind: 'library', x: 69, y: 7, w: 9, h: 8, door: { x: 73 }, zone: 'blog' },
  // Oeste: trabajo.
  { id: 'mihrab', kind: 'bar', x: 2, y: 19, w: 14, h: 8, door: { x: 9 } },
  { id: 'copos', kind: 'shop', x: 17, y: 21, w: 11, h: 6, door: { x: 23 } },
  // Este: familia (y, junto al puente romano, la Mezquita).
  { id: 'encuentro', kind: 'friends', x: 52, y: 7, w: 8, h: 8, door: { x: 55 } },
  { id: 'casaHermanos', kind: 'cottage', x: 60, y: 31, w: 7, h: 5, door: { x: 63 }, variant: 0 },
  { id: 'casaPadres', kind: 'cottage', x: 72, y: 31, w: 7, h: 5, door: { x: 75 }, variant: 1 },
  // Sur: la casa de Lupe, en el hueco junto a la entrada, y asistencia en carretera.
  { id: 'about', kind: 'home', x: 20, y: 34, w: 16, h: 10, door: { x: 30 }, zone: 'about', terrace: true },
  { id: 'asistencia', kind: 'garage', x: 45, y: 38, w: 11, h: 6, door: { x: 49 } },
  // Quiosco de helados de la piscina.
  { id: 'kiosko', kind: 'kiosk', x: 12, y: 10, w: 4, h: 4, door: { x: 13 } },
].map((b) => ({ ...b, door: { x: b.door.x, y: b.y + b.h } }))

// Frutales: no entran en la siembra de árboles (se despeja a su alrededor después, ver `inMovedClearance`).
const FRUIT_TREES = ['orangeTree', 'appleTree']
// Lo de la piscina que se añadió después (sombrillas rehechas, tumbonas y toalla) tampoco entra en la siembra: se sembró con las sombrillas de antes.
const POOL_EXTRAS = ['umbrella', 'lounger', 'towel']
const UMBRELLAS_BEFORE = [{ at: [4.6, 17.4] }, { at: [11.2, 17.4] }]

// Objetos sueltos: `at` es el punto de apoyo (centro de la base) en teselas, con decimales, y `zone` la
// puerta que lleva a un panel. El tamaño del cuerpo sólido lo da `PROP_BODY` en ValleScene.
const FIXED_PROPS = [
  { kind: 'fountain', at: [37, 29.2] },
  { kind: 'noticeboard', at: [33.5, 31.6] },
  { kind: 'postbox', at: [47.5, 24.2], zone: 'contact', door: { x: 47, y: 24 } },
  // El arco cierra el hueco de la valla: está a su misma altura.
  { kind: 'arch', at: [37, 50.4] },
  // Cartel a la derecha del camino nada más entrar (mirando al norte).
  { kind: 'welcomeSign', at: [42.5, 48.2] },
  { kind: 'busStop', at: [43.5, 34.6] },
  { kind: 'bus', at: [48, 35.4] },
  { kind: 'towTruck', at: [58.6, 44.6] },
  { kind: 'pool', at: [8, 15.5] },
  // Naranjos a los lados de la puerta de la Mezquita (centro de la puerta: 66,5). Apoyan en la base del muro: la puerta cae sobre el camino.
  { kind: 'orangeTree', at: [63.8, 28] },
  { kind: 'orangeTree', at: [69.2, 28] },
  // Huerto al oeste de la plaza, en el prado bajo el camino de Mihrab y Copos, y un manzano junto al puente romano (orilla oeste).
  { kind: 'appleTree', at: [20.5, 31.8] },
  { kind: 'orangeTree', at: [24, 31.8] },
  { kind: 'appleTree', at: [27.5, 31.8] },
  { kind: 'appleTree', at: [47, 32.6] },
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
  // Las farolas de la entrada flanquean la Puerta del Puente por fuera de sus alas (el dibujo ocupa de 33,5 a 40,5).
  { kind: 'lamp', at: [32.4, 49.4] },
  { kind: 'lamp', at: [41.6, 49.4] },
  { kind: 'lamp', at: [48.4, 19.8] },
  { kind: 'lamp', at: [20.5, 26.8] },
  { kind: 'rocks', at: [60.5, 47] },
  { kind: 'rocks', at: [77, 49] },
  // Pasarelas del río: el puente romano y el de tablones, planos (se pisan por encima).
  { kind: 'romanBridge', at: [52.5, 32.75] },
  { kind: 'plankBridge', at: [58, 38.375] },
  // Puentecillo del camino sobre el afluente, entre Artes y la Mezquita.
  { kind: 'footBridge', at: [44, 17.375] },
  // Piscina Santuario: dos sombrillas a los lados y, entre ellas, dos tumbonas mirando al agua (una con toalla doblada) y una toalla en el suelo.
  { kind: 'umbrella', at: [4.6, 17.6] },
  { kind: 'umbrella', at: [11.2, 17.6] },
  { kind: 'lounger', at: [6.2, 18.5], variant: 0 },
  { kind: 'lounger', at: [9.7, 18.5], variant: 1 },
  { kind: 'towel', at: [8.1, 19.4] },
  ...Array.from({ length: 16 }, (_, i) => ({ kind: 'fence', at: [3 + i * 2, 50.4] })).filter((p) => p.at[0] < 34),
  ...Array.from({ length: 20 }, (_, i) => ({ kind: 'fence', at: [41 + i * 2, 50.4] })).filter((p) => p.at[0] < 78),
]

// Caminos de tierra: tramos rectos entre teselas (ambos extremos incluidos) con su ancho. Los troncales
// son de dos teselas; los ramales hasta cada puerta, de una.
const ROADS = [
  // Eje norte-sur desde la entrada hasta la plaza y, más allá, hasta Artes.
  { from: [36, 12], to: [36, 50], w: 2 },
  // Norte: de la Universidad a Artes y hacia la piscina.
  { from: [16, 12], to: [37, 12], w: 2 },
  { from: [16, 12], to: [16, 28], w: 1 },
  { from: [25, 19], to: [37, 19], w: 2 },
  // Oeste: Mihrab y Copos.
  { from: [9, 27], to: [28, 27], w: 2 },
  // Camino del sur: pasa por la puerta de la casa de Lupe y une la entrada con el oeste y la asistencia.
  { from: [15, 44], to: [49, 44], w: 2 },
  // Norte-este: Casa del Encuentro y biblioteca.
  { from: [36, 15], to: [76, 15], w: 2 },
  { from: [73, 15], to: [73, 15], w: 1 },
  // Este: puente romano, Mezquita y familia.
  { from: [44, 28], to: [76, 28], w: 2 },
  // Segundo cruce, más sencillo, entre la parada del autobús y las casitas de la familia.
  { from: [38, 36], to: [52, 36], w: 2 },
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

// Pasarelas sobre el río (su forma está en `river.js`): rectángulos de teselas que se pisan aunque sean agua. El primero es el puente
// romano, donde el camino del este cruza el río; el segundo, un puente de tablones más sencillo entre la parada del autobús y las casitas;
// el tercero, un puentecillo corto donde el camino del norte cruza el afluente.
export const BRIDGES = [
  { id: 'romano', x: 48, y: 28, w: 9, h: 2 },
  { id: 'tablones', x: 52, y: 36, w: 12, h: 2 },
  { id: 'arroyo', x: 41, y: 15, w: 6, h: 2 },
]

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

// Objetos del valle: los fijos de arriba y el decorado del río (nenúfares, juncos, postes de pesca y la caña olvidada), que sale de la
// forma del río. Los juncos y los nenúfares evitan caminos, plaza, edificios y la cercanía de los puentes.
const onBuilding = (x, y) => BUILDINGS.some((b) => x >= b.x - 1 && x < b.x + b.w + 1 && y >= b.y - 1 && y < b.y + b.h + 1)
const nearBridge = (x, y, margin) => BRIDGES.some((bridge) => x >= bridge.x - margin && x < bridge.x + bridge.w + margin && y >= bridge.y - margin && y < bridge.y + bridge.h + margin)
const flatGround = { roads: roadTiles(), plaza: plazaTiles() }
export const PROPS = [
  ...FIXED_PROPS,
  ...riverProps(
    (x, y) => !flatGround.roads.has(`${x},${y}`) && !flatGround.plaza.has(`${x},${y}`) && !onBuilding(x, y) && !nearBridge(x, y, 2),
    (x, y, radius) => nearBridge(x, y, radius) || Math.hypot(x - ROD_SPOT.at[0], y - ROD_SPOT.at[1]) < 3,
  ),
]

// La siembra de árboles parte del río de antes (`legacyRiverTiles`) y al final se quitan los del interior que pisan el cauce actual o
// quedan pegados a él (la tesela y las ocho de alrededor, como con el río de antes). Los del borde se quedan: las copas del borde norte
// son las que tapan el nacimiento del río.
const onRiverBank = (x, y) => {
  if (x <= 0 || y <= 1 || x >= COLS - 1 || y >= ROWS - 1) return false
  const water = waterTiles()
  return [-1, 0, 1].some((dy) => [-1, 0, 1].some((dx) => water.has(`${x + dx},${y + dy}`)))
}

// El agua se calcula una sola vez: es la misma para el suelo, las colisiones y los árboles.
let waterCache = null

export function waterTiles() {
  waterCache ??= riverTiles(COLS, ROWS)
  return new Set(waterCache)
}

// Teselas de agua por las que no se puede andar: todas menos las de las pasarelas.
export function blockedWaterTiles() {
  const set = waterTiles()
  BRIDGES.forEach((bridge) => {
    for (let y = bridge.y; y < bridge.y + bridge.h; y++) for (let x = bridge.x; x < bridge.x + bridge.w; x++) set.delete(`${x},${y}`)
  })
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
  { x: 8, y: 34, w: 11, h: 9, count: 7, blossom: 0.4 },
  { x: 24, y: 46, w: 10, h: 4, count: 6, blossom: 0.2 },
  { x: 56, y: 19, w: 4, h: 12, count: 4, blossom: 0.3 },
  { x: 38, y: 35, w: 7, h: 8, count: 5, blossom: 0.2 },
]

// Árboles: borde del mapa, grupos del interior y algunos sueltos, sin pisar caminos, agua, plaza,
// edificios (ni el pasillo hasta su puerta) ni objetos.
export function treePositions() {
  // La semilla reparte los árboles según lo que estorba, así que cualquier cambio en lo que estorba reordena todo el valle. Se
  // siembra con los edificios, los ramales de camino y las columnas de antes, y al final se quitan los que pisan lo nuevo (ver
  // `LEGACY_BUILDINGS`).
  const roads = roadTiles()
  LEGACY_ROAD_SPURS.forEach(({ x, from, to }) => {
    for (let y = from; y <= to; y++) roads.add(`${x},${y}`)
  })
  const buildings = [...BUILDINGS.filter((b) => !MOVED_BUILDINGS.includes(b.id)), ...LEGACY_BUILDINGS]
  const props = [...PROPS.filter((p) => !FRUIT_TREES.includes(p.kind) && !POOL_EXTRAS.includes(p.kind)), ...STATUES_BEFORE, ...UMBRELLAS_BEFORE]
  const water = legacyRiverTiles(COLS, ROWS)
  const plaza = plazaTiles()
  const rand = seeded(2024)
  const trees = []
  const used = new Set()
  // Variantes: 0 y 1 son verdes; 2 es un cerezo en flor.
  const add = (x, y, blossom = false) => {
    const key = `${x},${y}`
    // El río sale del mapa por el este: los árboles del borde no se plantan en el agua.
    if (used.has(key) || water.has(key)) return
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
    buildings.some((b) => inside(b, x, y, 1) || (Math.abs(x - b.door.x) < 2 && y >= b.door.y - 1 && y <= b.door.y + 3)) ||
    props.some(({ at: [px, py] }) => Math.abs(x - px) < 2.2 && Math.abs(y - py) < 2.4) ||
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
  // Se quitan al final y no en `blocked`: así el resto de árboles no se reparte distinto con la misma semilla.
  return trees.filter((t) => !inStairsApproach(t.x, t.y) && !inMovedClearance(t.x, t.y) && !onRiverBank(t.x, t.y)).concat(MUSIC_SITE_TREES)
}

// Lo que había antes de recolocar edificios: la Mezquita primera, el taller de proyectos y la Casa de la Música (ya quitados), la Casa
// del Encuentro y la Mezquita en su sitio de entonces, los ramales de camino que llevaban a sus puertas y las dos columnas de la
// Universidad que había ante la primera Mezquita. Solo sirven para repartir los árboles igual que antes en el resto del valle (ver
// `treePositions`); no se dibujan ni chocan.
const MOVED_BUILDINGS = ['mezquita', 'encuentro']
const LEGACY_BUILDINGS = [
  { x: 42, y: 3, w: 15, h: 8, door: { x: 49, y: 11 } },
  { x: 60, y: 8, w: 9, h: 7, door: { x: 64, y: 15 } },
  { x: 60, y: 18, w: 8, h: 8, door: { x: 63, y: 26 } },
  { x: 72, y: 17, w: 7, h: 6, door: { x: 75, y: 23 } },
]
const LEGACY_ROAD_SPURS = [
  { x: 49, from: 11, to: 15 },
  { x: 63, from: 26, to: 28 },
  { x: 75, from: 23, to: 28 },
]
const STATUES_BEFORE = [{ at: [45, 13.6] }, { at: [54, 13.6] }]

// Árboles de relleno donde estuvo la Casa de la Música: lo que la Mezquita nueva deja libre entre ella y el borde del mapa. Se
// añaden aparte de la siembra para no reordenarla; son siempre los mismos y evitan caminos, agua y edificios.
const MUSIC_SITE_TREES = [
  { x: 76, y: 19, variant: 1 },
  { x: 77, y: 22, variant: 0 },
  { x: 76, y: 25, variant: 2 },
]

// Lo que las dos casas recolocadas dejan libre: su huella con un margen, el pasillo hasta su puerta y la copa de cada naranjo.
const inMovedClearance = (x, y) => {
  const moved = BUILDINGS.filter((b) => MOVED_BUILDINGS.includes(b.id))
  const orangeTrees = PROPS.filter((p) => FRUIT_TREES.includes(p.kind))
  return (
    moved.some((b) => inside(b, x, y, 1) || (Math.abs(x - b.door.x) < 2 && y >= b.door.y - 1 && y <= b.door.y + 3)) ||
    orangeTrees.some(({ at: [px, py] }) => Math.abs(x - px) < 2.2 && Math.abs(y - py) < 2.4) ||
    PROPS.some((p) => POOL_EXTRAS.includes(p.kind) && Math.abs(x - p.at[0]) < 2.2 && Math.abs(y - p.at[1]) < 2.4)
  )
}

// Acceso a la escalera de la casa y ala de la cubierta: la escalera y la azotea, ensanchada, se dibujan hacia la izquierda
// del edificio (ver `DECK_WIDEN` en terrace.js), así que se despeja ese lado entero, hasta la calle. Un árbol aquí tapa los
// peldaños o deja a la viajera encajonada al pie de la escalera.
const STAIRS_APPROACH = (() => {
  const home = BUILDINGS.find((b) => b.terrace)
  return home && { x: home.x - 7, y: home.y, w: 10, h: home.h + 2 }
})()
const inStairsApproach = (x, y) => Boolean(STAIRS_APPROACH) && inside(STAIRS_APPROACH, x, y)
