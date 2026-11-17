import { BUILDINGS, COLS, PROPS, TILE } from '../world.js'
import { HOME_DOOR } from './lupePlaces.js'
import { shiftPx, shiftPxX, shiftX, shiftY } from '../mapRows.js'

// Los alrededores del IES Gran Capitán y la plaza, en píxeles del mapa: dónde viven Ylonem y Grace, por dónde llega Lupe a presentárselos a la
// viajera y adónde van después, cada uno con su rutina. El IES está en la fila de abajo de los estudios, arriba a la izquierda: su puerta es la
// tesela de `world.js` (la 15, 18) y delante corre el paseo de los estudios. Los puntos de la plaza (fuente, bancos, palomas) no se movieron con la
// redistribución y siguen escritos en coordenadas de la plantilla (`shiftPxX`, `shiftPx`). La rejilla de caminos de esta zona es propia (`npc/valleNav.js` solo
// cubre la casa de Lupe).
const granDoor = BUILDINGS.find((b) => b.id === 'daw').door
export const GRAN_DOOR = { x: granDoor.x * TILE + TILE / 2, y: granDoor.y * TILE }
// Va del paseo de los estudios (fila 17) al sur de la casa de Lupe, y de los estudios a los naranjos de la Mezquita: por ella andan Khalessi
// cuando sale de casa y Atreus cuando pasea, además de Ylonem y Grace, que desde el IES bajan a la plaza.
export const TOWN_REGION = { x: 10 * TILE, y: 17 * TILE - 4, width: (COLS - 11) * TILE, height: 45 * TILE + 4 }

// A esta distancia de la puerta, la primera vez, sale Lupe; si la viajera se aleja más del doble, se da por perdida y vuelve a empezar al regresar.
export const TRIGGER_RANGE = 120
export const GIVE_UP_RANGE = 280

// Cada uno tiene su sitio (cerca de la puerta, sin taparla), donde está hasta que Lupe los presenta.
export const PEOPLE = {
  ylonem: { sheet: 'ylonem', post: { x: 220, y: 300 } },
  grace: { sheet: 'grace', post: { x: 308, y: 300 } },
  // Atreus vive en la casa de Lupe: su sitio aquí es la puerta, desde donde sale a pasear.
  atreus: { sheet: 'atreus', post: HOME_DOOR },
}

// Lupe aparece por la derecha, por el paseo, y anda hasta quedar junto a Grace, de cara a la puerta.
export const LUPE_ENTRY = { x: 384, y: 306 }
export const LUPE_MEET = { x: 332, y: 306 }

// Un banco de la plaza (los de `PROPS`): el asiento (donde quedan los pies de quien se sienta, como en `ValleScene.addBench`) y el punto del suelo
// delante de él, desde donde se sienta y adonde vuelve al levantarse.
export const benchAt = ([tx, ty]) => {
  const x = tx * TILE
  const y = ty * TILE
  return { seat: { x, y: y - 5, facing: 'down', depth: y + 0.5 }, front: { x, y: y + 14 } }
}
// Los dos bancos de arriba de la plaza (ver `world.js`).
const GRACE_BENCHES = [benchAt([shiftX(31.2), shiftY(23.9)]), benchAt([shiftX(42.8), shiftY(23.9)])]

// Los rincones de la plaza donde descansan las palomas (delante de la fuente, fuera del pretil) y cuántas son.
export const PIGEON_HOMES = [{ x: shiftPxX(556), y: shiftPx(482) }, { x: shiftPxX(628), y: shiftPx(482) }, { x: shiftPxX(574), y: shiftPx(500) }, { x: shiftPxX(610), y: shiftPx(498) }]
export const PIGEON_COUNT = 6

// Dónde se pone Grace de pie a esparcir semillas: a un lado de la fuente, mirando hacia donde descansan las palomas. Con la mano extendida las migas
// caen delante de ella (`feedSource`).
export const FEED_SPOTS = [
  { to: { x: shiftPxX(512), y: shiftPx(446) }, look: { x: shiftPxX(550), y: shiftPx(476) } },
  { to: { x: shiftPxX(672), y: shiftPx(446) }, look: { x: shiftPxX(634), y: shiftPx(476) } },
]

// Khalessi, en la plaza: de dónde sale a la plaza desde la casa (el centro de abajo), la fuente que curiosea y los sitios abiertos donde se tumba al sol.
export const CAT_PLAZA = { x: shiftPxX(592), y: shiftPx(530) }
export const FOUNTAIN = { x: shiftPxX(592), y: shiftPx(486) }
export const SUN_SPOTS = [{ x: shiftPxX(500), y: shiftPx(410) }, { x: shiftPxX(690), y: shiftPx(404) }, { x: shiftPxX(572), y: shiftPx(520) }, { x: shiftPxX(676), y: shiftPx(514) }]

// Rincones del pueblo que Ylonem graba: desde dónde, hacia qué y de qué trata (`topic` decide su bocadillo). Con la cámara en la mano mira al
// motivo, no a quien pasa. Los naranjos son los de la Mezquita.
export const FILM_SPOTS = [
  { to: { x: 264, y: 312 }, look: { x: 264, y: 234 }, topic: 'landscape' },
  { to: { x: shiftPxX(548), y: shiftPx(488) }, look: { x: shiftPxX(592), y: shiftPx(440) }, topic: 'fountain' },
  { to: { x: shiftPxX(484), y: shiftPx(532) }, look: { x: shiftPxX(484), y: shiftPx(505) }, topic: 'landscape' },
  { to: { x: shiftPxX(548), y: shiftPx(504) }, look: { x: shiftPxX(592), y: shiftPx(490) }, topic: 'pigeons' },
  { to: { x: shiftPxX(740), y: shiftPx(404) }, look: { x: shiftPxX(760), y: shiftPx(387) }, topic: 'landscape' },
  { to: { x: shiftPxX(744), y: shiftPx(452) }, look: { x: shiftPxX(800), y: shiftPx(430) }, topic: 'river' },
  // El naranjo de la derecha de la puerta de la Mezquita: lo graba desde el césped a la derecha del arco, dentro de la zona por la que
  // anda (`TOWN_REGION` empieza en la fila 17).
  { to: { x: 920, y: 280 }, look: { x: 875, y: 190 }, topic: 'trees' },
  { to: { x: shiftPxX(690), y: shiftPx(574) }, look: { x: shiftPxX(696), y: shiftPx(554) }, topic: 'landscape' },
]

// Con lluvia, Ylonem se refugia pegado a la fachada del IES, y al atardecer va a filmar el cielo desde la orilla, mirando al oeste.
export const SHELTER_SPOT = { to: { x: 296, y: 298 }, look: { x: 296, y: 364 }, topic: 'rain' }
export const SUNSET_SPOT = { to: { x: shiftPxX(744), y: shiftPx(452) }, look: { x: shiftPxX(690), y: shiftPx(440) }, topic: 'sunset' }

// Paseo de Atreus: sale por la puerta de su casa, da una vuelta por la plaza, el puente y la orilla del río, se sienta en un
// banco y vuelve a casa. `home: true` marca el paso de regreso (estado `returning`).
// El banco de abajo a la derecha de la plaza.
const ATREUS_BENCH = benchAt([shiftX(42.8), shiftY(31.9)])
export const ATREUS_DOOR = HOME_DOOR
export const WALK_SPOTS = {
  plaza: { to: { x: shiftPxX(600), y: shiftPx(520) }, look: { x: shiftPxX(592), y: shiftPx(470) } },
  bridge: { to: { x: shiftPxX(830), y: shiftPx(462) }, look: { x: shiftPxX(836), y: shiftPx(420) } },
  bank: { to: { x: shiftPxX(748), y: shiftPx(472) }, look: { x: shiftPxX(800), y: shiftPx(500) } },
}
// Cuánto descansa en casa entre paseos y la pausa entre paradas durante uno.
export const ATREUS_REST_MS = [100000, 180000]
export const ATREUS_PAUSE_MS = [3500, 7000]
export const ROUTINES = {
  grace: [
    { kind: 'rest', to: { x: 296, y: 316 }, ms: [6000, 10000] },
    { kind: 'sit', to: GRACE_BENCHES[0].front, bench: GRACE_BENCHES[0], ms: [40000, 60000] },
    { kind: 'feed', ...FEED_SPOTS[0], ms: [45000, 70000] },
    { kind: 'rest', to: { x: shiftPxX(560), y: shiftPx(436) }, ms: [8000, 12000] },
    { kind: 'sit', to: GRACE_BENCHES[1].front, bench: GRACE_BENCHES[1], ms: [30000, 50000] },
    { kind: 'feed', ...FEED_SPOTS[1], ms: [45000, 70000] },
  ],
  ylonem: FILM_SPOTS.map((spot) => ({ kind: 'film', ...spot, ms: [8000, 12000] })),
  atreus: [
    { kind: 'look', ...WALK_SPOTS.plaza, topic: 'plaza', ms: [6000, 10000] },
    { kind: 'look', ...WALK_SPOTS.bridge, topic: 'bridge', ms: [9000, 14000] },
    { kind: 'look', ...WALK_SPOTS.bank, topic: 'river', ms: [8000, 12000] },
    { kind: 'sit', to: ATREUS_BENCH.front, bench: ATREUS_BENCH, topic: 'bench', ms: [25000, 40000] },
    { kind: 'home', home: true, to: ATREUS_DOOR, ms: [100, 100] },
  ],
}
// Listas alternativas por tiempo: Ylonem se refugia con lluvia y va al atardecer a la orilla; Atreus vuelve derecho a casa si llueve o anochece.
export const WEATHER_ROUTINES = {
  graceRain: [{ kind: 'shelter', to: { x: 332, y: 298 }, look: { x: 332, y: 364 }, topic: 'rain', ms: [25000, 40000] }],
  ylonemRain: [{ kind: 'shelter', ...SHELTER_SPOT, ms: [25000, 40000] }],
  ylonemSunset: [{ kind: 'film', ...SUNSET_SPOT, ms: [14000, 20000] }],
  atreusHome: [{ kind: 'home', home: true, to: ATREUS_DOOR, ms: [100, 100] }],
}

// Los bancos usados existen de verdad en el mapa.
export const benchesOfWorld = () => PROPS.filter((prop) => prop.kind === 'bench').map((prop) => prop.at)

// Un punto del suelo delante de quien mira hacia `look` desde `from`, a `reach` píxeles: dónde cae lo que echa con la mano.
export function frontOf(from, look, reach) {
  const dx = look.x - from.x
  const dy = look.y - from.y
  const length = Math.hypot(dx, dy) || 1
  return { x: from.x + (dx / length) * reach, y: from.y + (dy / length) * reach }
}

// Atardecer: el sol ya baja (la última parte de su arco, ver `titleSky.js`, `SUN_SPAN`) y aún no ha anochecido.
export const isSunset = (sky) => Boolean(sky) && sky.phase >= 0.62 && sky.phase < 0.8 && sky.rain < 0.35
export const isRaining = (sky) => Boolean(sky) && sky.rain > 0.35
export const isNight = (sky) => Boolean(sky) && sky.dark > 0.6
