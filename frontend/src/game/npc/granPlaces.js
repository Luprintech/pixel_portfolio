import { PROPS, TILE } from '../world.js'

// Los alrededores del IES Gran Capitán y la plaza, en píxeles del mapa: dónde viven Ylonem y Grace, por dónde llega Lupe a presentárselos a la
// viajera y adónde van después, cada uno con su rutina. La puerta es la tesela (25, 19) de `world.js`; el edificio acaba en la fila 18 y justo
// debajo hay una franja de suelo, que sigue hasta la plaza (fuente, bancos y buzón). La rejilla de caminos de esta zona es propia
// (`npc/valleNav.js` solo cubre la casa de Lupe).
export const GRAN_DOOR = { x: 25 * TILE + TILE / 2, y: 19 * TILE }
export const TOWN_REGION = { x: 17 * TILE, y: 19 * TILE - 4, width: 33 * TILE, height: 18 * TILE }

// A esta distancia de la puerta, la primera vez, sale Lupe; si la viajera se aleja más del doble, se da por perdida y vuelve a empezar al regresar.
export const TRIGGER_RANGE = 120
export const GIVE_UP_RANGE = 280

// Cada uno tiene su sitio (cerca de la puerta, sin taparla), donde está hasta que Lupe los presenta.
export const PEOPLE = {
  ylonem: { sheet: 'ylonem', post: { x: 364, y: 316 } },
  grace: { sheet: 'grace', post: { x: 452, y: 316 } },
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

// Rincones del pueblo que Ylonem graba: desde dónde y hacia qué. Con la cámara en la mano mira al motivo, no a quien pasa.
export const FILM_SPOTS = [
  { to: { x: 408, y: 328 }, look: { x: 408, y: 250 } },
  { to: { x: 556, y: 472 }, look: { x: 592, y: 467 } },
  { to: { x: 536, y: 524 }, look: { x: 536, y: 505 } },
  { to: { x: 740, y: 404 }, look: { x: 760, y: 387 } },
  { to: { x: 690, y: 574 }, look: { x: 696, y: 554 } },
]

// Los pasos de cada rutina (ver `neighbourRoutine.js`): `to` es adónde van y `ms` cuánto lo hacen. Grace se sienta en un banco de la plaza a
// dar de comida a las palomas y a jugar con Khalessi; Ylonem recorre el pueblo grabando.
export const ROUTINES = {
  grace: [
    { kind: 'rest', to: { x: 440, y: 332 }, ms: [6000, 10000] },
    { kind: 'sit', to: GRACE_BENCHES[0].front, bench: GRACE_BENCHES[0], ms: [60000, 90000] },
    { kind: 'rest', to: { x: 560, y: 436 }, ms: [8000, 12000] },
    { kind: 'sit', to: GRACE_BENCHES[1].front, bench: GRACE_BENCHES[1], ms: [60000, 90000] },
  ],
  ylonem: FILM_SPOTS.map((spot) => ({ kind: 'film', ...spot, ms: [8000, 12000] })),
}

// Los bancos usados existen de verdad en el mapa.
export const benchesOfWorld = () => PROPS.filter((prop) => prop.kind === 'bench').map((prop) => prop.at)
