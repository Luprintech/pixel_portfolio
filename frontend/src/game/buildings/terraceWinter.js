// Nieve sobre las superficies de la cubierta de la casa de Lupe. El tejado y lo más alto de cada columna ya los cubre
// `snowCap` (valleSeasons.js); aquí se añade lo que ese repintado no alcanza: huellas y pasamanos de la escalera,
// bordes y balaustradas de la cubierta, la sombrilla y la barandilla delantera. Se dibuja en una capa aparte, en las
// mismas coordenadas que el dibujo de la casa, y la escena la funde sobre su versión de invierno. Cada superficie
// es un manto de un píxel con montoncitos y, debajo, un filo en sombra que le da grosor; lo que queda a cubierto
// (bajo la sombrilla) no recibe nieve.
import { SNOW, SNOW_SHADE } from '../titleWinter.js'
import { hash2, rect } from '../pixelKit.js'
import { DECK, STAIRS } from '../terrace.js'
import {
  BACK_RAIL,
  BACK_RAIL_Y,
  FLOOR_DEPTH,
  FLOOR_TOP,
  FRONT_RAIL,
  PARASOL,
  noseY,
  railPosts,
  stairRailTop,
} from './terraceProps.js'

// Manto sobre una superficie horizontal: `w` columnas desde (x, y), con montoncitos de uno o dos píxeles encima y un
// filo de sombra debajo en la mayoría de las columnas.
function mantle(g, x, y, w, seed) {
  rect(g, x, y, w, 1, SNOW)
  for (let i = 0; i < w; i++) {
    const roll = hash2(x + i, y, seed)
    if (roll > 0.62) rect(g, x + i, y - 1, roll > 0.88 ? 2 : 1, 1, SNOW)
    if (roll < 0.7) rect(g, x + i, y + 1, 1, 1, SNOW_SHADE)
  }
}

// Mancha irregular sobre el suelo: una banda ancha con el borde roto.
function patch(g, x, y, w, h, seed) {
  for (let i = 0; i < w; i++) {
    const depth = Math.max(1, Math.round(h * (0.55 + 0.45 * hash2(x + i, y, seed))))
    rect(g, x + i, y, 1, depth, SNOW)
    rect(g, x + i, y + depth, 1, 1, SNOW_SHADE)
  }
}

function stairsSnow(g) {
  const { x, bottom, steps, run, rise } = STAIRS
  for (let i = 0; i < steps; i++) {
    const left = x + i * run
    const top = noseY(i, { bottom, rise })
    // Las dos filas de atrás de la huella quedan cubiertas; el canto delantero, de madera, se sigue viendo.
    rect(g, left, top - 2, run, 2, SNOW)
    rect(g, left + 1, top - 3, run - 2, 1, SNOW)
    rect(g, left, top, run - 1, 1, SNOW_SHADE)
  }
  // Pasamanos con su manto, y remate de los postes de los extremos.
  const from = x + run
  const to = x + steps * run - 2
  for (let px = from; px <= to; px++) {
    const top = stairRailTop(px, STAIRS)
    rect(g, px, top - 1, 1, 1, SNOW)
    if (hash2(px, 3, 11) > 0.7) rect(g, px, top - 2, 1, 1, SNOW)
    if (hash2(px, 4, 11) < 0.6) rect(g, px, top + 3, 1, 1, SNOW_SHADE)
  }
  ;[1, steps - 1].forEach((i) => {
    const px = x + i * run + 1
    rect(g, px - 1, stairRailTop(px, STAIRS) - 3, 5, 1, SNOW)
  })
}

function deckSnow(g) {
  const left = DECK.left - 4
  const right = DECK.right + 4
  // Bordes: el canto delantero entero y, atrás, los dos rincones que no cubre la sombrilla.
  mantle(g, left, FLOOR_TOP + FLOOR_DEPTH - 1, right - left, 21)
  patch(g, left, FLOOR_TOP, 14, 3, 31)
  patch(g, DECK.right - 4, FLOOR_TOP, 8, 3, 33)
  // Balaustrada trasera: el poste de la esquina y el tramo de la derecha.
  const run = { x: BACK_RAIL.from, w: DECK.right + 1 - BACK_RAIL.from }
  mantle(g, run.x, BACK_RAIL_Y - 1, run.w, 41)
  ;[BACK_RAIL.post, ...railPosts(run.x, run.w)].forEach((px) => rect(g, px - 1, BACK_RAIL_Y - 4, 5, 1, SNOW))
  rect(g, BACK_RAIL.post, BACK_RAIL_Y - 1, 3, 1, SNOW)
}

// Cubierta de la sombrilla: un casquete blanco en lo alto, de borde irregular, que deja ver los gajos debajo.
function parasolSnow(g) {
  const { cx, top, rx, ry } = PARASOL
  const centerY = top + ry
  for (let x = cx - rx; x < cx + rx; x++) {
    const u = (x + 0.5 - cx) / rx
    const reach = Math.sqrt(Math.max(0, 1 - u * u))
    const topEdge = Math.round(centerY - ry * reach)
    if (reach <= 0) continue
    const depth = 3 + Math.round(2 * hash2(x, 5, 51)) + Math.round(2 * reach)
    rect(g, x, topEdge - 1, 1, depth + 1, SNOW)
    rect(g, x, topEdge + depth, 1, 1, SNOW_SHADE)
  }
}

// Capa de nieve del dibujo de la casa (el lienzo tiene su tamaño).
export function terraceSnow(g) {
  stairsSnow(g)
  deckSnow(g)
  parasolSnow(g)
}

// Nieve de la barandilla delantera, en las coordenadas del dibujo de la casa (quien la usa traslada el lienzo).
export function frontRailSnow(g) {
  const { x, top, right } = FRONT_RAIL
  mantle(g, x, top + 1, right - x, 61)
  ;[x, x + 18, x + 36, right - 3].forEach((px) => rect(g, px - 1, top - 1, 5, 1, SNOW))
}
