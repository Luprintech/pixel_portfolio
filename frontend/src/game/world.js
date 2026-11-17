// Mapa del Valle del Bucle, en teselas de 16 px. Sin dependencias de Phaser.
// La distribución sigue la lámina aprobada el 2026-11-12: estudios arriba a la izquierda, el Ayuntamiento con sus columnas
// encima de la plaza, la calle de trabajo al oeste, las dos casas a los lados de la entrada y, al este, el río con el puente
// romano, el arco y la Mezquita. Los edificios del juego miden más respecto a la cuadrícula que en la lámina, así que las
// distancias están adaptadas: lo que no cabe en una fila (la calle de trabajo) se reparte en dos.
// Todo va en coordenadas del mapa (72×66): la plantilla de 80×54 más 12 filas por arriba y 8 columnas por el oeste, menos 16 columnas
// recortadas por el este (ver `mapRows.js`). El río (`river.js`, `riverPlaces.js`) y los puntos de los NPC siguen en coordenadas de antes con `shiftX`/`shiftY`.
import { seeded } from './palette.js'
import { riverTiles } from './river.js'
import { MAP_COLS, MAP_ROWS } from './mapRows.js'
import { ROD_SPOT, riverProps } from './riverPlaces.js'

export const TILE = 16
export const COLS = MAP_COLS
export const ROWS = MAP_ROWS
// El cruce de caminos de la entrada: donde espera Lupe y a donde vuelve la viajera si guardó su posición en un sitio inválido.
const SPAWN_TILE = { x: 46, y: 56 }
export const SPAWN = { x: SPAWN_TILE.x * TILE, y: SPAWN_TILE.y * TILE }
// Una partida nueva empieza fuera del valle, al sur del arco: la viajera entra andando por el camino hasta `stopY`, donde
// recupera el control, y se encuentra a Lupe esperando en el cruce.
export const ARRIVAL = { x: 728, y: 1028, stopY: 972 }

// Cada lugar: esquina superior izquierda y tamaño en teselas, y la columna de la puerta, que queda justo debajo del edificio
// (donde se pisa para entrar). El tamaño lo fija el dibujo de cada tipo. `terrace` marca el edificio cuya escalera y cubierta
// se pisan (ver `terrace.js`); `talk`, el que abre una conversación en vez de un interior.
const BUILDINGS_RAW = [
  // Estudios, arriba a la izquierda: dos filas con un paseo delante de cada una. Arriba la Escuela de Artes Dionisio Ortiz y la
  // Universidad de Burgos; abajo el IES Gran Capitán (conserva el id `daw`: interior, guardado y textos) y Alan Turing.
  // La Escuela de Artes es la fachada de dos plantas de la usuaria: ocho teselas de alto, alineada por su puerta principal.
  { id: 'artes', kind: 'gallery', x: 11, y: 2, w: 10, h: 8, door: { x: 16 } },
  { id: 'universidad', kind: 'university', x: 23, y: 2, w: 15, h: 8, door: { x: 30 } },
  // El IES Gran Capitán es la fachada de tres plantas de la usuaria (`ies`): seis teselas de alto, alineada por su entrada (x 15), y
  // su dibujo ocupa de x 8,6 a 21,6, entre el naranjo del oeste y Alan Turing.
  { id: 'daw', kind: 'ies', x: 9, y: 12, w: 13, h: 6, door: { x: 15 } },
  // El CPIFP Alan Turing es la nave de la usuaria (`cpifp`): cuatro teselas de alto, alineada por sus puertas (x 32), y su dibujo
  // ocupa de x 23,5 a 36,5, a 1,9 teselas del IES Gran Capitán y antes del paseo que baja por x 38.
  { id: 'turing', kind: 'cpifp', x: 23, y: 14, w: 14, h: 4, door: { x: 32 } },
  // Ayuntamiento de Córdoba, justo encima de la plaza. Acortado a cinco vanos (19 teselas) y desplazado a la izquierda con sus columnas
  // para dejar sitio a la curva del río por detrás de él; su puerta (41) da a la plaza cívica, que enlaza con el eje de la fuente.
  { id: 'ayuntamiento', kind: 'city', x: 32, y: 21, w: 19, h: 9, door: { x: 41 } },
  // Calle de trabajo, al oeste de la plaza. Los tres no caben en una fila a la escala del juego: Mihrab da al camino del
  // Ayuntamiento, con margen a los dos lados, y Copos y RACE al camino que entra en la plaza por el oeste. Entre Copos y RACE
  // queda un hueco de césped con un manzano, para que con el zoom habitual se lean como dos locales.
  // Copos y RACE son locales bajos de una planta (tres teselas de alto) con la puerta acristalada a la izquierda. Copos se
  // alinea por su puerta (x 4) y su dibujo ocupa de x 3,5 a 14,5.
  // RACE es una oficina baja de una planta (tres teselas de alto), pegada al borde oeste de la plaza, con la puerta acristalada
  // a la izquierda: el dibujo se alinea por la puerta (x 24) y ocupa de x 23,2 a 34,2. Delante, al otro lado de la calle,
  // tiene su explanada para la grúa.
  // El Bar Mihrab es la fachada de la usuaria (64 px, cuatro teselas de alto) alineada por su puerta de la derecha (x 17): ocupa de
  // x 14,75 a 18,75 y su umbral queda en la fila 30. Delante, entre la fachada y el camino del Ayuntamiento, su terraza pavimentada
  // (filas 30 y 31) con las mesas a la izquierda de la puerta.
  { id: 'mihrab', kind: 'bar', x: 9, y: 26, w: 10, h: 4, door: { x: 17 } },
  { id: 'copos', kind: 'shop', x: 4, y: 37, w: 11, h: 3, door: { x: 4 } },
  { id: 'asistencia', kind: 'garage', x: 23, y: 37, w: 11, h: 3, door: { x: 24 } },
  // Mezquita-Catedral de Córdoba, al norte, junto a la zona de la Universidad, mirando al sur. Su puerta, el arco y el camino que los
  // une quedan en el mismo eje que el paseo que baja junto al Ayuntamiento (columnas 51 y 52, centro en x 52): por eso la puerta va
  // en media tesela (51,5) y el dibujo, de 17 teselas, ocupa de x 43,5 a 60,5, a tesela y media de la orilla. No tiene interior: la
  // puerta abre una conversación con Lupe.
  { id: 'mezquita', kind: 'mosque', x: 43.5, y: 1, w: 17, h: 11, door: { x: 51.5 }, talk: 'valle.mezquita' },
  // Entrada: la casa de Lupe, la primera a mano izquierda, con una franja de césped entre su fachada (el dibujo acaba en x 41,3) y el
  // eje de la entrada; a su izquierda, la piscina con el quiosco de helados justo a su derecha (el mostrador mira al sur, a su
  // caminito); y la Casa del Encuentro a mano derecha, en el hueco del segundo garaje de RACE, apartada una tesela del río. Es un
  // patio cordobés (`patio`) cuya entrada es el escalón del empedrado, sobre la tesela de la puerta.
  { id: 'about', kind: 'home', x: 26, y: 46, w: 16, h: 10, door: { x: 36 }, zone: 'about', terrace: true },
  // El quiosco Camy se alinea por su mostrador (x 15, sobre su caminito) y su dibujo, con la papelera a la izquierda y el cartel a
  // la derecha, ocupa de x 13,4 a 17,9. Entre el vaso de la piscina (hasta x 11,5) y la papelera quedan 31 px para pasar; entre el
  // cartel y la escalera de la casa (desde x 22,3) corre el atajo a RACE. Al puesto se entra por detrás.
  { id: 'kiosko', kind: 'kiosk', x: 13, y: 45, w: 5, h: 4, door: { x: 15 } },
  { id: 'encuentro', kind: 'patio', x: 51, y: 48, w: 8, h: 8, door: { x: 54 } },
]

// La puerta cae justo debajo del edificio; se calcula siempre desde la `y`.
export const BUILDINGS = BUILDINGS_RAW.map((b) => ({ ...b, door: { x: b.door.x, y: b.y + b.h } }))

// Objetos sueltos: `at` es el punto de apoyo (centro de la base) en teselas, con decimales, y `zone` la puerta que lleva a un
// panel. El cuerpo sólido sale del dibujo de cada objeto (`body`).
const POOL_AT = [8, 48.5]
const poolAt = (dx, dy) => [POOL_AT[0] + dx, POOL_AT[1] + dy]
const FIXED_PROPS = [
  // La fuente de la plaza: el centro de su estanque cae donde estaba el de la fuente anterior (x 45, y 39,8).
  { kind: 'fountain', at: [45, 42.375] },
  // El tablón, en el borde sur de la plaza, abajo a la izquierda de la fuente (donde había una farola), fuera del paso.
  { kind: 'noticeboard', at: [41.4, 44.9] },
  { kind: 'postbox', at: [55.5, 36.2], zone: 'contact', door: { x: 55, y: 36 } },
  // El arco de la entrada cierra el hueco de la valla: está a su misma altura.
  { kind: 'arch', at: [45, 62.4] },
  // La Puerta del Puente de Córdoba, ante la Mezquita: su abertura queda centrada en la puerta (52) y el camino recto pasa por
  // debajo. Su base apoya en el paseo del Alan Turing, que en este tramo baja una fila para que el arco quepa entero bajo la fila de
  // la puerta; su remate empieza en esa fila.
  { kind: 'cordobaArch', at: [52, 19] },
  // El Triunfo de San Rafael, delante del ala izquierda de la Mezquita y a la izquierda del arco: la base, en el césped fuera del
  // camino; la columna y el arcángel se dibujan delante de los ventanales (su base está más abajo que la fachada).
  { kind: 'sanRafael', at: [46.5, 15.5] },
  // Cartel a la derecha del camino nada más entrar (mirando al norte).
  { kind: 'welcomeSign', at: [50.5, 60.2] },
  // La parada de autobús, junto al puente romano. El autobús (el verde de Aucorsa, el único del valle) está aparcado en la explanada
  // de RACE, junto a la grúa.
  { kind: 'busStop', at: [48.6, 49.8] },
  // Explanada de RACE: el autobús de Aucorsa a la izquierda (sin tapar el atajo que sube de la casa de Lupe por x 19) y la grúa a
  // la derecha, con un hueco entre los dos. Las ruedas de ambos quedan en la misma fila y sus carrocerías (`AUCORSA_BUS_BODY`,
  // `TOW_TRUCK_BODY`) caben enteras en la explanada.
  { kind: 'bus', at: [24, 44.6] },
  { kind: 'towTruck', at: [31.75, 44.6] },
  // El SEAT Córdoba de la usuaria, aparcado delante del ala derecha de la Universidad, a la derecha de la escalinata (que acaba en
  // x 33,4) y antes del paseo que baja junto a ella (x 38): las ruedas, en la primera fila de baldosas del paseo de los estudios, y
  // el techo, por delante de los ventanales bajos. Debajo queda libre el resto del paseo para pasar.
  { kind: 'seatCordoba', at: [35.5, 10.4] },
  // Terraza del Bar Mihrab: tres mesas en fila delante de la fachada, a la izquierda de la puerta (x 17), con paso entre ellas, y dos
  // sombrillas con el mástil detrás, en los huecos entre mesas. Delante de la puerta queda libre.
  { kind: 'cafeTable', at: [9.875, 31.6] },
  { kind: 'cafeTable', at: [12.375, 31.6] },
  { kind: 'cafeTable', at: [14.875, 31.6] },
  { kind: 'cafeUmbrella', at: [11.125, 30.6] },
  { kind: 'cafeUmbrella', at: [13.625, 30.6] },
  // Piscina, con sus sombrillas y tumbonas al sur del vaso (el vaso choca: su cuerpo sale del dibujo).
  { kind: 'pool', at: POOL_AT },
  { kind: 'umbrella', at: poolAt(-3.4, 2.1) },
  { kind: 'umbrella', at: poolAt(3.2, 2.1) },
  { kind: 'lounger', at: poolAt(-1.8, 3), variant: 0 },
  { kind: 'lounger', at: poolAt(1.7, 3), variant: 1 },
  // Naranjos a los lados de la puerta de la Mezquita (centro de la puerta: 52).
  { kind: 'orangeTree', at: [49.3, 12] },
  { kind: 'orangeTree', at: [54.7, 12] },
  // Frutales del oeste: un manzano en el hueco de césped entre Copos y RACE y, en la franja al oeste de los estudios, un manzano y
  // un naranjo.
  { kind: 'appleTree', at: [18.5, 38.6] },
  { kind: 'appleTree', at: [5.5, 8.6] },
  { kind: 'orangeTree', at: [6.5, 15.6] },
  // Caballetes ante la Escuela de Artes, como antes respecto a su puerta.
  { kind: 'easel', at: [13.5, 10.6] },
  { kind: 'easel', at: [19.5, 10.6] },
  // Bancos de la plaza, pegados al borde de las baldosas junto a las esquinas, para dejar libre el centro alrededor de la fuente.
  { kind: 'bench', at: [39.2, 35.9] },
  { kind: 'bench', at: [50.8, 35.9] },
  { kind: 'bench', at: [39.2, 43.9] },
  { kind: 'bench', at: [50.8, 43.9] },
  // Farolas en las esquinas del contorno escalonado de la plaza: dos arriba, una a cada lado y una abajo a la derecha (la de abajo
  // a la izquierda se quitó de momento para dejar el sitio al tablón).
  { kind: 'lamp', at: [36.4, 38.9] },
  { kind: 'lamp', at: [53.6, 38.9] },
  { kind: 'lamp', at: [41.4, 34.9] },
  { kind: 'lamp', at: [48.6, 34.9] },
  { kind: 'lamp', at: [48.6, 44.9] },
  // Las farolas de la entrada van sobre los pilares del arco de la entrada.
  { kind: 'lamp', at: [43.4, 59.2] },
  { kind: 'lamp', at: [47, 59.2] },
  // Farolas de los paseos de los estudios.
  { kind: 'lamp', at: [22, 12.6] },
  { kind: 'lamp', at: [23.5, 20.6] },
  { kind: 'rocks', at: [68.5, 59] },
  // El puente romano, plano (se pisa por encima) y centrado en su tramo de `BRIDGES`, a la altura de la fuente de la plaza. El de tablones
  // del sur se quitó: no llevaba a ningún sitio.
  { kind: 'romanBridge', at: [60.5, 43.75] },
  ...Array.from({ length: 20 }, (_, i) => ({ kind: 'fence', at: [3 + i * 2, 62.4] })).filter((p) => p.at[0] < 42),
  ...Array.from({ length: 20 }, (_, i) => ({ kind: 'fence', at: [49 + i * 2, 62.4] })).filter((p) => p.at[0] < COLS - 2),
]

// Caminos: tramos rectos entre teselas (ambos extremos incluidos) con su ancho. Llevan las mismas baldosas que la plaza (ver
// `ground.js`). Cada tramo se estampa hacia la derecha y hacia abajo: uno de ancho `w` empieza en `from` y ocupa `w` teselas más
// allá de `to`. Los caminos de paso son de dos teselas y los senderos que llevan a una puerta o a un atajo, de una.
export const ROADS = [
  // Eje norte-sur: de la puerta del Ayuntamiento, por la plaza, hasta la entrada.
  { from: [44, 30], to: [44, 62], w: 2 },
  // Paseos de los estudios: uno ante cada fila de puertas, unidos al este de la Universidad. El de abajo (el del Alan Turing) sigue hacia
  // el este, por encima del Ayuntamiento, y baja pegado a su lado derecho hasta su camino, antes de la orilla del río.
  { from: [11, 10], to: [38, 10], w: 2 },
  { from: [38, 10], to: [38, 18], w: 2 },
  { from: [11, 18], to: [39, 18], w: 2 },
  // Pasada la Universidad baja una fila (19 y 20), por encima del Ayuntamiento, para dejar sitio al arco de la Mezquita.
  { from: [39, 19], to: [51, 19], w: 2 },
  { from: [51, 19], to: [51, 32], w: 2 },
  // Atajo del Ayuntamiento a los estudios, por el hueco entre Mihrab (acaba en x 18) y las columnas (empiezan en x 25,5).
  { from: [21, 20], to: [21, 31], w: 1 },
  // De la puerta del Ayuntamiento (41) baja un tramo de baldosas por su plaza hasta el camino que lleva a la plaza de la fuente.
  { from: [41, 30], to: [41, 31], w: 1 },
  // Camino del Ayuntamiento: corre al pie de su plaza, desde el borde oeste, por la puerta de Mihrab, hasta el paseo de los estudios.
  { from: [2, 32], to: [57, 32], w: 2 },
  // Terraza del Bar Mihrab, delante de la fachada: dos filas de baldosas pegadas al camino del Ayuntamiento.
  { from: [9, 30], to: [18, 30], w: 2 },
  // Calle de Copos y RACE: del borde oeste entra en la plaza. Cada local tiene su puerta sobre ella, y RACE, delante del garaje,
  // una explanada de tres filas donde aparca la grúa.
  { from: [2, 40], to: [36, 40], w: 2 },
  { from: [19, 42], to: [34, 42], w: 3 },
  // Atajo de la casa de Lupe a RACE: sale del camino del sur por el lado izquierdo de la casa, entre el quiosco y la escalera, y
  // sube hasta la explanada sin pasar por delante de la grúa.
  { from: [19, 45], to: [19, 55], w: 1 },
  // Camino del sur: del borde oeste pasa por la casa de Lupe y acaba a la altura de la Casa del Encuentro.
  { from: [2, 56], to: [57, 56], w: 2 },
  // Acceso a la piscina, entre sus tumbonas, y caminito hasta el mostrador del quiosco, los dos desde el camino del sur.
  { from: [6, 53], to: [6, 55], w: 1 },
  { from: [15, 49], to: [15, 55], w: 1 },
  // Ensanche de baldosas al norte de la Casa del Encuentro, donde antes esperaba el autobús. Acaba antes de la orilla.
  { from: [46, 46], to: [54, 46], w: 2 },
  // Correos, en el borde de la plaza.
  { from: [55, 36], to: [55, 40], w: 1 },
  // Camino de la Mezquita: de su puerta (centro en x 52, fila 12) recto hacia el sur, dos teselas de ancho como la abertura del arco,
  // por debajo de él hasta el paseo del Alan Turing, donde enlaza con el que baja junto al Ayuntamiento (las mismas columnas).
  { from: [51, 12], to: [51, 18], w: 2 },
  // El paseo del puente romano: de la plaza, recto y horizontal a la altura de la fuente, hasta su salida en la orilla este.
  { from: [52, 39], to: [64, 39], w: 2 },
]

// Pasarelas sobre el río (su forma está en `river.js`): rectángulos de teselas que se pisan aunque sean agua. El puente romano,
// donde el camino del este cruza el río; el de tablones, más al sur, donde el río empieza a curvarse hacia el este, entre el camino
// del sur y el que baja entre los bancos.
export const BRIDGES = [
  { id: 'romano', x: 56, y: 39, w: 9, h: 2 },
]

// Plaza empedrada alrededor de la fuente: una elipse de teselas.
const PLAZA_CENTER = { x: 45, y: 39.5, rx: 9.5, ry: 5.5 }
// Plaza del Ayuntamiento: una franja empedrada de dos filas ante la fachada y las columnas, que las une como un solo conjunto.
const CIVIC_PLAZA = { x: 24, y: 30, w: 27, h: 2 }

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
  for (let y = CIVIC_PLAZA.y; y < CIVIC_PLAZA.y + CIVIC_PLAZA.h; y++) for (let x = CIVIC_PLAZA.x; x < CIVIC_PLAZA.x + CIVIC_PLAZA.w; x++) set.add(`${x},${y}`)
  return set
}

function stamp(set, x, y, w) {
  for (let dy = 0; dy < w; dy++) for (let dx = 0; dx < w; dx++) set.add(`${x + dx},${y + dy}`)
}

export function roadTiles(roads = ROADS) {
  const set = new Set()
  roads.forEach(({ from: [x1, y1], to: [x2, y2], w }) => {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) stamp(set, x, y, w)
    }
  })
  return set
}

// Objetos de la plaza del Ayuntamiento. A la izquierda, las columnas del templo romano sobre su podio, que acaba a un píxel del
// primer pilar del Ayuntamiento: los dos conjuntos quedan contiguos, como en la ciudad. Delante, simétricos respecto a la puerta
// (x 41,5) y repartidos por la fachada acortada: farolas en los extremos, bancos, un arriate a cada lado de la entrada y el mosaico
// ante ella. A tres teselas a cada lado de la puerta no hay nada sólido, para llegar a ella en línea recta desde el camino.
const CIVIC_DOOR = 41.5
const civicPair = (kind, offset, y) => [{ kind, at: [CIVIC_DOOR - offset, y] }, { kind, at: [CIVIC_DOOR + offset, y] }]
const CIVIC_PROPS = [
  { kind: 'romanColumns', at: [27.75, 29.75] },
  ...civicPair('lamp', 8, 31.7),
  ...civicPair('bench', 5.5, 31.8),
  ...civicPair('flowerBed', 3.4, 31.6),
  { kind: 'cityMosaic', at: [CIVIC_DOOR, 31.95] },
]

// Objetos del valle: los fijos de arriba, los de la plaza del Ayuntamiento y el decorado del río (nenúfares, juncos, postes de
// pesca y la caña olvidada), que sale de la forma del río. Los juncos y los nenúfares evitan caminos, plaza, edificios y la
// cercanía de los puentes.
const onBuilding = (x, y) => BUILDINGS.some((b) => x >= b.x - 1 && x < b.x + b.w + 1 && y >= b.y - 1 && y < b.y + b.h + 1)
const nearBridge = (x, y, margin) => BRIDGES.some((bridge) => x >= bridge.x - margin && x < bridge.x + bridge.w + margin && y >= bridge.y - margin && y < bridge.y + bridge.h + margin)
const flatGround = { roads: roadTiles(), plaza: plazaTiles() }
// Lo que el río pone fuera del borde este (sale del mapa por él) no se coloca.
const RIVER_PROPS = riverProps(
  (x, y) => !flatGround.roads.has(`${x},${y}`) && !flatGround.plaza.has(`${x},${y}`) && !onBuilding(x, y) && !nearBridge(x, y, 2),
  (x, y, radius) => nearBridge(x, y, radius) || Math.hypot(x - ROD_SPOT.at[0], y - ROD_SPOT.at[1]) < 3,
).filter((prop) => prop.at[0] < COLS - 1)
export const PROPS = [...FIXED_PROPS, ...CIVIC_PROPS, ...RIVER_PROPS]

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

// Regiones del interior con muchos árboles y con qué probabilidad un árbol de cada una es cerezo en flor. Los cerezos se juntan
// en el suroeste y el sureste, como en la lámina. La parcela de la antigua biblioteca, junto al río, es ahora una de ellas, y las
// del oeste cubren la franja que ganó el valle por ese lado.
const GROVES = [
  { x: 2, y: 57, w: 38, h: 5, count: 15, blossom: 0.8 },
  { x: 2, y: 42, w: 5, h: 14, count: 4, blossom: 0.7 },
  { x: 50, y: 57, w: 20, h: 5, count: 8, blossom: 0.5 },
  { x: 60, y: 46, w: 10, h: 10, count: 5, blossom: 0.6 },
  // El bosque por el que baja el río desde el borde norte: la franja de su orilla este, hasta el borde del mapa. Entre la orilla oeste
  // y la Mezquita queda una franja de tierra.
  { x: 67, y: 2, w: 4, h: 37, count: 9, blossom: 0.3 },
  { x: 2, y: 2, w: 36, h: 18, count: 10, blossom: 0.2 },
  { x: 59, y: 20, w: 6, h: 20, count: 4, blossom: 0.2 },
  { x: 46, y: 48, w: 6, h: 7, count: 2, blossom: 0.2 },
]

// La escalera y la azotea de la casa se dibujan hacia la izquierda del edificio (ver `DECK_WIDEN` en terrace.js), así que se
// despeja ese lado entero, hasta la calle. Un árbol aquí tapa los peldaños o deja a la viajera encajonada al pie de la escalera.
const STAIRS_APPROACH = (() => {
  const home = BUILDINGS.find((b) => b.terrace)
  return home && { x: home.x - 7, y: home.y, w: 10, h: home.h + 2 }
})()

// Alrededor de la Mezquita no se siembran árboles: ni entre ella y la Universidad, ni delante de la fachada hasta el paseo del Alan
// Turing (taparían la fachada, el arco y San Rafael). El terreno se queda despejado hasta decidir la decoración.
const MOSQUE_GROUNDS = (() => {
  const mosque = BUILDINGS.find((b) => b.id === 'mezquita')
  const university = BUILDINGS.find((b) => b.id === 'universidad')
  const x = university.x + university.w
  return { x, y: 2, w: mosque.x + mosque.w + 1 - x, h: 19 }
})()

// Árboles puestos a mano, aparte de la siembra: el cerezo que estaba en el hueco entre Mihrab y las columnas, a un lado del atajo
// que ahora pasa por allí.
const PLACED_TREES = [{ x: 23, y: 27, variant: 2 }]

// Árboles: borde del mapa, grupos del interior y algunos sueltos, sin pisar caminos, agua, plaza, edificios (ni el pasillo
// hasta su puerta) ni objetos. Siempre los mismos: salen de una semilla fija.
export function treePositions() {
  const roads = roadTiles()
  const water = waterTiles()
  const plaza = plazaTiles()
  const rand = seeded(2026)
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
  const near = (set, x, y) => [-1, 0, 1].some((dy) => [-1, 0, 1].some((dx) => set.has(`${x + dx},${y + dy}`)))
  // Los árboles son grandes (casi tres teselas de ancho): se dejan separados entre sí para que no formen un muro.
  const crowded = (x, y) => trees.some((t) => Math.abs(t.x - x) < 2 && Math.abs(t.y - y) < 2)
  const blocked = (x, y) =>
    near(roads, x, y) ||
    near(water, x, y) ||
    plaza.has(`${x},${y}`) ||
    plaza.has(`${x},${y - 1}`) ||
    BUILDINGS.some((b) => inside(b, x, y, 1) || (Math.abs(x - b.door.x) < 2 && y >= b.door.y - 1 && y <= b.door.y + 3)) ||
    PROPS.some(({ kind, at: [px, py] }) => (kind === 'romanColumns' ? x > px - 5 && x < px + 5 && y > py - 9 && y < py + 2 : Math.abs(x - px) < 2.2 && Math.abs(y - py) < 2.4)) ||
    (STAIRS_APPROACH && inside(STAIRS_APPROACH, x, y)) ||
    inside(MOSQUE_GROUNDS, x, y) ||
    (Math.abs(x - SPAWN_TILE.x) < 3 && Math.abs(y - SPAWN_TILE.y) < 3) ||
    // Entrada del sur: el arco y el hueco de la valla se quedan despejados.
    (x >= 41 && x <= 49 && y >= 56)

  for (let x = 0; x < COLS; x++) {
    add(x, 1)
    if (!(x >= 41 && x <= 49)) add(x, ROWS - 1)
  }
  for (let y = 2; y < ROWS - 1; y++) {
    add(0, y)
    add(COLS - 1, y)
  }
  GROVES.forEach((grove) => {
    // Se intenta el triple de veces que árboles se quieren: los que caen sobre un camino se descartan.
    for (let i = 0; i < grove.count * 3; i++) {
      const x = grove.x + Math.floor(rand() * grove.w)
      const y = grove.y + Math.floor(rand() * grove.h)
      if (!blocked(x, y) && !crowded(x, y)) add(x, y, rand() < grove.blossom)
    }
  })
  for (let i = 0; i < 50; i++) {
    const x = 2 + Math.floor(rand() * (COLS - 4))
    const y = 3 + Math.floor(rand() * (ROWS - 5))
    if (!blocked(x, y) && !crowded(x, y)) add(x, y, rand() < 0.2)
  }
  return [...trees.filter((t) => !PLACED_TREES.some((p) => Math.abs(p.x - t.x) < 2 && Math.abs(p.y - t.y) < 2)), ...PLACED_TREES]
}
