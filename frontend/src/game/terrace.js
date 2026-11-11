// Escalera y cubierta de la casa de Lupe, en píxeles del dibujo de la casa (`homeSprite`), no del mapa.
// El dibujo y la escena leen estas mismas cifras: así los peldaños que se ven son los que se pisan.
// Sin dependencias de Phaser ni del lienzo.

// Escalera de perfil que sube hacia la derecha: cada peldaño es un bloque de `run` de ancho y `rise` de alto.
export const STAIRS = { x: 0, steps: 8, run: 5, rise: 6, bottom: 160 }

// Cuánto se ensancha la cubierta hacia la derecha: la casa de dos plantas se dibuja este tanto más a la derecha (ver `homes.js`),
// de modo que la azotea es una terraza de verdad y no una pasarela. La escalera y la cubierta se alargan hacia la izquierda.
export const DECK_WIDEN = 48

// La cubierta empieza donde acaba la escalera. `feet` es la fila donde apoyan los pies, justo sobre el entarimado, y `top`,
// lo más al fondo que se puede ir: la fila donde apoyan el telescopio y la mesa, para que quien pasa quede siempre por
// delante de ellos (el dibujo de la casa es una sola imagen, sin capas por mueble).
export const DECK = { left: STAIRS.x + STAIRS.steps * STAIRS.run, right: 106 + DECK_WIDEN, top: 94, feet: STAIRS.bottom - STAIRS.steps * STAIRS.rise }

// Telescopio de la cubierta: `x` es el centro del trípode y `base`, la fila donde apoyan sus patas. Se acerca uno
// a menos de `reach` píxeles de ese punto, desde cualquier lado, y se mira con E.
export const TELESCOPE = { x: 66, base: 94, reach: 17 }

// Mesa de la sombrilla: `x` es el centro de su mástil y `base`, la fila donde apoya.
export const TABLE = { x: 120, base: 95 }

// Silla de la cubierta, a la derecha del telescopio: `x` es su centro y `base`, la fila donde apoyan sus patas (la misma
// que la del telescopio y la mesa). Se sienta uno de cara a la cámara desde la franja de suelo que hay delante (`CHAIR_ZONE`)
// y, sentado, se mira por el telescopio (ver `seatOnDeck` en ValleScene.js).
export const CHAIR = { x: 92, base: 95 }
export const CHAIR_ZONE = { x: CHAIR.x - 12, y: CHAIR.base + 2, w: 24, h: 14 }

// Lo que se ve sobre el entarimado y no se atraviesa: las patas del trípode, la silla y la mesa. Rectángulos en píxeles del dibujo.
const DECK_SOLIDS = [
  // Del contrapeso colgante (a la izquierda) a la pata derecha del trípode.
  { x: TELESCOPE.x - 13, y: TELESCOPE.base - 5, w: 22, h: 8 },
  { x: CHAIR.x - 10, y: CHAIR.base - 5, w: 20, h: 7 },
  { x: TABLE.x - 11, y: TABLE.base - 6, w: 22, h: 9 },
]

export function nearTelescope(mode, x, y) {
  return mode === 'deck' && Math.hypot(x - TELESCOPE.x, y - TELESCOPE.base) <= TELESCOPE.reach
}

// Dónde espera Lupe cuando sube a saludar a quien llega por primera vez a la azotea (ver `npc/deckVisit.js`): por delante de
// la mesa y la silla, lejos de la escalera para no quedar encima de quien sube y a la vista de quien entra por la puerta.
export const LUPE_SPOT = { x: TABLE.x - 10, y: TABLE.base + 11 }

// Entrada a la casa desde la cubierta: el hueco dibujado en el extremo del entarimado (`DOORWAY` en terraceProps.js) es su
// aspecto, pero se usa desde cualquier punto de la franja de suelo pegada al muro, a todo lo hondo de la cubierta.
export const ROOF_ENTRY = 14

export function nearRoofDoor(mode, x, y) {
  return mode === 'deck' && x >= DECK.right - ROOF_ENTRY && y >= DECK.top
}

// Subir cuesta: en los peldaños se anda a esta fracción de la velocidad normal. Con la normal, los 40 px de
// escalera pasaban en menos de medio segundo y la subida parecía un salto.
export const STAIR_PACE = 0.5

// Hondura por la que se anda en la escalera, medida hacia atrás desde la fila de los pies de la rampa (`lane`): en el pie
// llega a `STAIR_REACH.foot` y, al llegar a la cubierta, a la hondura de esta, para que la franja de la escalera y la de la
// cubierta se junten sin escalón. Es casi todo el ancho de los peldaños dibujados (`STAIR_DEPTH` en terraceProps.js), con un
// margen ante el pasamanos trasero.
export const STAIR_REACH = { foot: 26, top: DECK.feet - DECK.top }
const reachAt = (x) => {
  const run = STAIRS.steps * STAIRS.run
  const along = Math.min(run, Math.max(0, x - STAIRS.x)) / run
  return STAIR_REACH.foot + (STAIR_REACH.top - STAIR_REACH.foot) * along
}

// Franja de suelo ante el primer peldaño desde la que se empieza a subir, a todo lo ancho de la escalera. Solo se sube por
// ese primer peldaño, viniendo desde la izquierda: `ValleScene.buildTerrace` cierra con muros sólidos el resto del perímetro.
export const FOOT = { top: STAIRS.bottom - STAIR_REACH.foot }

// Altura de los pies sobre el suelo en la columna `x`. Es una rampa continua, no un salto por peldaño: con
// saltos de 6 px la cámara, pegada a la viajera, temblaba al subir. Los pies se alzan `STAIR_SINK` píxeles sobre la
// rampa para quedar en el centro de las huellas (que se dibujan centradas en el filo de cada peldaño, ver
// terraceProps.js) y no hundidos en ellas. Ese repunte se alcanza en el primer medio peldaño y se pierde en el
// último, de modo que llegan a ras del suelo y de la cubierta en los dos extremos.
const STAIR_SINK = 3
export function stairLift(x) {
  const run = STAIRS.steps * STAIRS.run
  const along = Math.min(run, Math.max(0, x - STAIRS.x))
  const ease = STAIRS.run / 2
  const raise = STAIR_SINK * Math.min(1, along / ease, (run - along) / ease)
  return (along / run) * STAIRS.steps * STAIRS.rise + raise
}

// Fila de los pies en la columna `x`, por la parte delantera de la escalera.
const laneAt = (x) => STAIRS.bottom - stairLift(x)

// Pone a la viajera en la escalera: en la columna `x`, a la hondura que traiga (`y`) siempre que quepa entre el borde delantero
// y el trasero. `from` es la columna donde estaba antes: la franja sube con los peldaños, así que quien anda de lado sube con
// ella (conserva su sitio en la anchura) en vez de quedarse atrás.
function onStairs(x, y, from = x) {
  const front = laneAt(x)
  const shifted = y + front - laneAt(from)
  return { mode: 'stairs', x, y: Math.min(front, Math.max(front - reachAt(x), shifted)) }
}

// Dónde queda la viajera tras moverse. `mode` es 'ground' (en el suelo), 'stairs' (subiendo: se anda por toda la anchura de
// la escalera, y la franja sube con los peldaños) o 'deck' (sobre la cubierta). `last` es la columna corregida del fotograma
// anterior (solo la usa la escalera). Devuelve el modo nuevo y la posición corregida, en las mismas coordenadas.
export function climb(mode, x, y, last = x) {
  if (mode === 'ground') {
    const atFoot = x >= STAIRS.x && x < STAIRS.x + STAIRS.run && y >= FOOT.top && y <= STAIRS.bottom
    return atFoot ? onStairs(x, y) : { mode, x, y }
  }
  if (mode === 'stairs') {
    if (x < STAIRS.x) return { mode: 'ground', x, y }
    if (x >= DECK.left) return { mode: 'deck', ...clampToDeck(x, y) }
    return onStairs(x, y, Math.min(Math.max(last, STAIRS.x), DECK.left))
  }
  // Se baja a la escalera desde cualquier punto del borde izquierdo de la cubierta: las dos franjas tienen la misma hondura.
  if (x < DECK.left) return onStairs(DECK.left - 0.5, y)
  const spot = pushOutOfSolids(clampToDeck(x, y))
  return { mode, ...clampToDeck(spot.x, spot.y) }
}

const clampToDeck = (x, y) => ({ x: Math.min(x, DECK.right), y: Math.min(Math.max(y, DECK.top), DECK.feet) })

// Si el punto cae dentro del telescopio, la silla o la mesa, lo saca por el lado más cercano (a izquierda, derecha o hacia delante:
// hacia atrás no hay sitio, la cubierta acaba en `top`).
function pushOutOfSolids({ x, y }) {
  const solid = DECK_SOLIDS.find((s) => x > s.x && x < s.x + s.w && y > s.y && y < s.y + s.h)
  if (!solid) return { x, y }
  const ways = [
    { x: solid.x, y, cost: x - solid.x },
    { x: solid.x + solid.w, y, cost: solid.x + solid.w - x },
    { x, y: solid.y + solid.h, cost: solid.y + solid.h - y },
  ]
  const best = ways.reduce((a, b) => (b.cost < a.cost ? b : a))
  return { x: best.x, y: best.y }
}
