// Nieve sobre las superficies de la cubierta de la casa de Lupe. El tejado y lo más alto de cada columna ya los cubre
// `snowCap` (valleSeasons.js); aquí se añade lo que ese repintado no alcanza: huellas de la escalera, bordes y
// balaustradas de la cubierta y la sombrilla. El pasamanos y la barandilla delantera llevan su propia capa (`railSnow`). Se dibuja en una capa aparte, en las
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
  CORNER_POSTS,
  FRONT_RAIL,
  PARASOL,
  frontRailPosts,
  STAIR_DEPTH,
  noseY,
  railPosts,
  stairRailPosts,
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
    // La tabla ancha del peldaño: un manto con el borde roto hacia el fondo, que deja asomar la madera en el canto izquierdo.
    const reach = Math.max(0, Math.min(run, BACK_RAIL.from - left))
    for (let px = left + 1; px < left + reach; px++) {
      const depth = Math.round((STAIR_DEPTH - 4) * (0.7 + 0.3 * hash2(px, top, 17)))
      rect(g, px, top - 3 - depth, 1, depth, SNOW)
      rect(g, px, top - 3 - depth, 1, 1, SNOW_SHADE)
    }
    // Las dos filas de atrás de la huella quedan cubiertas; el canto delantero, de madera, se sigue viendo.
    rect(g, left, top - 2, run, 2, SNOW)
    rect(g, left + 1, top - 3, run - 2, 1, SNOW)
    rect(g, left, top, run - 1, 1, SNOW_SHADE)
  }
}

function deckSnow(g) {
  const left = DECK.left - 4
  const right = DECK.right
  // Bordes: el canto delantero entero y, atrás, los dos rincones que no cubre la sombrilla.
  mantle(g, left, FLOOR_TOP + FLOOR_DEPTH - 1, right - left, 21)
  patch(g, left, FLOOR_TOP, 14, 3, 31)
  patch(g, DECK.right - 4, FLOOR_TOP, 8, 3, 33)
  // Balaustrada trasera, entera, y el remate de los dos postes altos de las esquinas.
  const run = { x: BACK_RAIL.from, w: BACK_RAIL.right - BACK_RAIL.from }
  mantle(g, run.x, BACK_RAIL_Y - 1, run.w, 41)
  railPosts(run.x, run.w).forEach((px) => rect(g, px - 1, BACK_RAIL_Y - 4, 5, 1, SNOW))
  ;[CORNER_POSTS.left, CORNER_POSTS.right].forEach((px) => rect(g, px - 1, CORNER_POSTS.top - 3, 5, 1, SNOW))
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
  stairBackSnow(g)
  deckSnow(g)
  parasolSnow(g)
}

// Nieve del pasamanos de la escalera y de la barandilla delantera, en las coordenadas del dibujo de la casa (quien la usa
// traslada el lienzo).
export function railSnow(g) {
  const { x, top, right } = FRONT_RAIL
  mantle(g, x, top + 1, right - x, 61)
  frontRailPosts().forEach((px) => rect(g, px - 1, top - 1, 5, 1, SNOW))
  const posts = stairRailPosts(STAIRS)
  for (let px = posts[0]; px < x; px++) {
    const railTop = stairRailTop(px, STAIRS)
    rect(g, px, railTop - 1, 1, 1, SNOW)
    if (hash2(px, 3, 11) > 0.7) rect(g, px, railTop - 2, 1, 1, SNOW)
    if (hash2(px, 4, 11) < 0.6) rect(g, px, railTop + 3, 1, 1, SNOW_SHADE)
  }
  rect(g, posts[0] - 1, stairRailTop(posts[0] + 1, STAIRS) - 3, 5, 1, SNOW)
}

// Nieve del pasamanos trasero de la escalera: va en la capa de la casa, por detrás de la viajera.
export function stairBackSnow(g) {
  const posts = stairRailPosts(STAIRS)
  for (let px = posts[0]; px < posts[posts.length - 1] + 2; px++) {
    const railTop = stairRailTop(px, STAIRS) - STAIR_DEPTH
    rect(g, px, railTop - 1, 1, 1, SNOW)
    if (hash2(px, 6, 13) > 0.7) rect(g, px, railTop - 2, 1, 1, SNOW)
    if (hash2(px, 7, 13) < 0.6) rect(g, px, railTop + 3, 1, 1, SNOW_SHADE)
  }
}
