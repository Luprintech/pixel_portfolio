// Escalera y cubierta de la casa de Lupe, en píxeles del dibujo de la casa (`homeSprite`), no del mapa.
// El dibujo y la escena leen estas mismas cifras: así los peldaños que se ven son los que se pisan.
// Sin dependencias de Phaser ni del lienzo.

// Escalera de perfil que sube hacia la derecha: cada peldaño es un bloque de `run` de ancho y `rise` de alto.
export const STAIRS = { x: 0, steps: 8, run: 5, rise: 6, bottom: 160 }

// La cubierta empieza donde acaba la escalera. `feet` es la fila donde apoyan los pies, justo sobre el
// entarimado, y `top`, lo más al fondo que se puede ir antes de chocar con la pared y la balaustrada.
export const DECK = { left: STAIRS.x + STAIRS.steps * STAIRS.run, right: 106, top: 106, feet: STAIRS.bottom - STAIRS.steps * STAIRS.rise }

// Franja de suelo ante la escalera desde la que se empieza a subir (la pared sólida acaba más arriba).
export const FOOT = { top: 152 }

// Altura de los pies sobre el suelo en la columna `x`. Es una rampa continua, no un salto por peldaño: con
// saltos de 6 px la cámara, pegada a la viajera, temblaba al subir. Los pies se alzan unos píxeles a media
// escalera para quedar sobre las huellas y no hundidos en ellas, y llegan a ras en los dos extremos.
export function stairLift(x) {
  const run = STAIRS.steps * STAIRS.run
  const t = Math.min(1, Math.max(0, (x - STAIRS.x) / run))
  return t * STAIRS.steps * STAIRS.rise + 3 * (1 - Math.abs(2 * t - 1))
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
