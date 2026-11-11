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

// Lo que se ve sobre el entarimado y no se atraviesa: las patas del trípode y la mesa. Rectángulos en píxeles del dibujo.
const DECK_SOLIDS = [
  { x: TELESCOPE.x - 9, y: TELESCOPE.base - 5, w: 18, h: 8 },
  { x: TABLE.x - 11, y: TABLE.base - 6, w: 22, h: 9 },
]

export function nearTelescope(mode, x, y) {
  return mode === 'deck' && Math.hypot(x - TELESCOPE.x, y - TELESCOPE.base) <= TELESCOPE.reach
}

// Entrada a la casa desde la cubierta, sin puerta dibujada (vista de frente, la pared de la casa no tiene una puerta que
// se vea): se usa desde cualquier punto de la franja de suelo pegada al muro de la casa, a todo lo hondo de la cubierta.
export const ROOF_ENTRY = 14

export function nearRoofDoor(mode, x, y) {
  return mode === 'deck' && x >= DECK.right - ROOF_ENTRY && y >= DECK.top
}

// Subir cuesta: en los peldaños se anda a esta fracción de la velocidad normal. Con la normal, los 40 px de
// escalera pasaban en menos de medio segundo y la subida parecía un salto.
export const STAIR_PACE = 0.5

// Franja de suelo ante la escalera desde la que se empieza a subir (la pared sólida acaba más arriba).
export const FOOT = { top: 152 }

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

const onStairs = (x) => ({ mode: 'stairs', x, y: STAIRS.bottom - stairLift(x) })

// Dónde queda la viajera tras moverse. `mode` es 'ground' (en el suelo), 'stairs' (subiendo: la altura la
// da la columna, no se puede subir ni bajar de lado) o 'deck' (sobre la cubierta, en una franja estrecha).
// Devuelve el modo nuevo y la posición corregida, en las mismas coordenadas.
export function climb(mode, x, y) {
  if (mode === 'ground') {
    const atFoot = x >= STAIRS.x && x < DECK.left && y >= FOOT.top && y <= STAIRS.bottom
    return atFoot ? onStairs(x) : { mode, x, y }
  }
  if (mode === 'stairs') {
    if (x < STAIRS.x) return { mode: 'ground', x, y: STAIRS.bottom }
    if (x >= DECK.left) return { mode: 'deck', x, y: DECK.feet }
    return onStairs(x)
  }
  if (x < DECK.left) return onStairs(DECK.left - 0.5)
  const spot = pushOutOfSolids(clampToDeck(x, y))
  return { mode, ...clampToDeck(spot.x, spot.y) }
}

const clampToDeck = (x, y) => ({ x: Math.min(x, DECK.right), y: Math.min(Math.max(y, DECK.top), DECK.feet) })

// Si el punto cae dentro del telescopio o de la mesa, lo saca por el lado más cercano (a izquierda, derecha o hacia delante:
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
