import { PROPS, TILE } from '../world.js'
import { HOME_DOOR } from './lupePlaces.js'

// Los alrededores del IES Gran Capitán y la plaza, en píxeles del mapa: dónde viven Ylonem y Grace, por dónde llega Lupe a presentárselos a la
// viajera y adónde van después, cada uno con su rutina. La puerta es la tesela (25, 19) de `world.js`; el edificio acaba en la fila 18 y justo
// debajo hay una franja de suelo, que sigue hasta la plaza (fuente, bancos y buzón). La rejilla de caminos de esta zona es propia
// (`npc/valleNav.js` solo cubre la casa de Lupe).
export const GRAN_DOOR = { x: 25 * TILE + TILE / 2, y: 19 * TILE }
// Va del IES al sur de la casa de Lupe y de ahí al este hasta los naranjos de la Mezquita: por ella andan Khalessi cuando sale de casa y Atreus
// cuando pasea, además de Ylonem y Grace.
export const TOWN_REGION = { x: 17 * TILE, y: 19 * TILE - 4, width: 55 * TILE, height: 31 * TILE + 4 }

// A esta distancia de la puerta, la primera vez, sale Lupe; si la viajera se aleja más del doble, se da por perdida y vuelve a empezar al regresar.
export const TRIGGER_RANGE = 120
export const GIVE_UP_RANGE = 280

// Cada uno tiene su sitio (cerca de la puerta, sin taparla), donde está hasta que Lupe los presenta.
export const PEOPLE = {
  ylonem: { sheet: 'ylonem', post: { x: 364, y: 316 } },
  grace: { sheet: 'grace', post: { x: 452, y: 316 } },
  // Atreus vive en la casa de Lupe: su sitio aquí es la puerta, desde donde sale a pasear.
  atreus: { sheet: 'atreus', post: HOME_DOOR },
}

// Lupe aparece por la derecha de la franja y anda hasta quedar junto a Grace, de cara a la puerta.
export const LUPE_ENTRY = { x: 528, y: 322 }
export const LUPE_MEET = { x: 476, y: 322 }

// Un banco de la plaza (los de `PROPS`): el asiento (donde quedan los pies de quien se sienta, como en `ValleScene.addBench`) y el punto del suelo
// delante de él, desde donde se sienta y adonde vuelve al levantarse.
export const benchAt = ([tx, ty]) => {
  const x = tx * TILE
  const y = ty * TILE
  return { seat: { x, y: y - 5, facing: 'down', depth: y + 0.5 }, front: { x, y: y + 14 } }
}
const GRACE_BENCHES = [benchAt([32.5, 24.4]), benchAt([41.5, 24.4])]

// Los rincones de la plaza donde descansan las palomas (alrededor de la fuente) y cuántas son.
export const PIGEON_HOMES = [{ x: 560, y: 452 }, { x: 624, y: 456 }, { x: 576, y: 496 }, { x: 612, y: 494 }]
export const PIGEON_COUNT = 6

// Dónde se pone Grace de pie a esparcir semillas: a un lado de la fuente, mirando hacia donde descansan las palomas. Con la mano extendida las migas
// caen delante de ella (`feedSource`).
export const FEED_SPOTS = [
  { to: { x: 520, y: 446 }, look: { x: 562, y: 460 } },
  { to: { x: 668, y: 446 }, look: { x: 626, y: 460 } },
]

// Khalessi, en la plaza: de dónde sale a la plaza desde la casa (el centro de abajo), la fuente que curiosea y los sitios abiertos donde se tumba al sol.
export const CAT_PLAZA = { x: 592, y: 530 }
export const FOUNTAIN = { x: 592, y: 467 }
export const SUN_SPOTS = [{ x: 500, y: 410 }, { x: 690, y: 404 }, { x: 520, y: 520 }, { x: 676, y: 514 }]

// Rincones del pueblo que Ylonem graba: desde dónde, hacia qué y de qué trata (`topic` decide su bocadillo). Con la cámara en la mano mira al
// motivo, no a quien pasa. Los naranjos son los de la Mezquita.
export const FILM_SPOTS = [
  { to: { x: 408, y: 328 }, look: { x: 408, y: 250 }, topic: 'landscape' },
  { to: { x: 556, y: 472 }, look: { x: 592, y: 467 }, topic: 'fountain' },
  { to: { x: 536, y: 524 }, look: { x: 536, y: 505 }, topic: 'landscape' },
  { to: { x: 548, y: 504 }, look: { x: 592, y: 490 }, topic: 'pigeons' },
  { to: { x: 740, y: 404 }, look: { x: 760, y: 387 }, topic: 'landscape' },
  { to: { x: 744, y: 452 }, look: { x: 800, y: 430 }, topic: 'river' },
  { to: { x: 1064, y: 478 }, look: { x: 1022, y: 446 }, topic: 'trees' },
  { to: { x: 690, y: 574 }, look: { x: 696, y: 554 }, topic: 'landscape' },
]

// Con lluvia, Ylonem se refugia pegado a la fachada del IES, y al atardecer va a filmar el cielo desde la orilla, mirando al oeste.
export const SHELTER_SPOT = { to: { x: 440, y: 314 }, look: { x: 440, y: 380 }, topic: 'rain' }
export const SUNSET_SPOT = { to: { x: 744, y: 452 }, look: { x: 690, y: 440 }, topic: 'sunset' }

// Paseo de Atreus: sale por la puerta de su casa, da una vuelta por la plaza, el puente y la orilla del río, se sienta en un
// banco y vuelve a casa. `home: true` marca el paso de regreso (estado `returning`).
const ATREUS_BENCH = benchAt([42, 31.4])
export const ATREUS_DOOR = HOME_DOOR
export const WALK_SPOTS = {
  plaza: { to: { x: 600, y: 520 }, look: { x: 592, y: 470 } },
  bridge: { to: { x: 830, y: 462 }, look: { x: 836, y: 420 } },
  bank: { to: { x: 748, y: 472 }, look: { x: 800, y: 500 } },
}
// Cuánto descansa en casa entre paseos y la pausa entre paradas durante uno.
export const ATREUS_REST_MS = [100000, 180000]
export const ATREUS_PAUSE_MS = [3500, 7000]
export const ROUTINES = {
  grace: [
    { kind: 'rest', to: { x: 440, y: 332 }, ms: [6000, 10000] },
    { kind: 'sit', to: GRACE_BENCHES[0].front, bench: GRACE_BENCHES[0], ms: [40000, 60000] },
    { kind: 'feed', ...FEED_SPOTS[0], ms: [45000, 70000] },
    { kind: 'rest', to: { x: 560, y: 436 }, ms: [8000, 12000] },
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
  graceRain: [{ kind: 'shelter', to: { x: 476, y: 314 }, look: { x: 476, y: 380 }, topic: 'rain', ms: [25000, 40000] }],
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
