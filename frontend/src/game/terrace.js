// Escalera y cubierta de la casa de Lupe, en píxeles del dibujo de la casa (`homeSprite`), no del mapa.
// El dibujo y la escena leen estas mismas cifras: así los peldaños que se ven son los que se pisan.
// Sin dependencias de Phaser ni del lienzo.

// Escalera de perfil que sube hacia la derecha: cada peldaño es un bloque de `run` de ancho y `rise` de alto.
export const STAIRS = { x: 0, steps: 8, run: 5, rise: 6, bottom: 160 }

// La cubierta empieza donde acaba la escalera. `feet` es la fila donde apoyan los pies, justo sobre el
// entarimado, y `top`, lo más al fondo que se puede ir antes de chocar con la pared y la balaustrada.
export const DECK = { left: STAIRS.x + STAIRS.steps * STAIRS.run, right: 106, top: 104, feet: STAIRS.bottom - STAIRS.steps * STAIRS.rise }

// Telescopio de la cubierta: `x` es el centro del trípode y `base`, la fila donde apoyan sus patas. Se acerca uno
// a menos de `reach` píxeles de ese punto, desde cualquier lado, y se mira con E.
export const TELESCOPE = { x: 58, base: 105, reach: 17 }

export function nearTelescope(mode, x, y) {
  return mode === 'deck' && Math.hypot(x - TELESCOPE.x, y - TELESCOPE.base) <= TELESCOPE.reach
}

// Puerta de cristal de la cubierta, al fondo del entarimado junto al muro de la casa: se usa desde cualquier punto de
// la franja de suelo pegada a ella.
export function nearRoofDoor(mode, x, y) {
  return mode === 'deck' && x >= DECK.right - 16 && y >= DECK.feet - 8
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
  return { mode, x: Math.min(x, DECK.right), y: Math.min(Math.max(y, DECK.top), DECK.feet) }
}
