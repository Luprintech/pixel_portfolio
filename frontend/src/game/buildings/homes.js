// Casa de Lupe con cubierta, escalera y telescopio (su casa de dos plantas está en `homeHouse.js`) y el quiosco de helados
// de la piscina. La Casa del Encuentro (el patio cordobés) está en `patio.js`.
import { PAL } from '../palette.js'
import { dot, makeCanvas, rect } from '../pixelKit.js'
import { DECK_WIDEN, STAIRS } from '../terrace.js'
import { deckPot, drawHouse, lowerRoomWindow, skirting } from './homeHouse.js'
import { houseGlow } from './homeLight.js'
import { LOWER_WINDOW, RAIL_BOX, backRail, deckChair, deckFloor, lowerWindowXs, parasol, stairRail, strandPoints, telescope, terraceRail, terraceStairs } from './terraceProps.js'
import { railSnow, terraceSnow } from './terraceWinter.js'
import { drawPng } from '../pngAssets.js'
import { WOOD0, finish, newSprite } from './shared.js'

const LOWER_LIME = '#f6e8e0'
const LOWER_LIME_SHADE = '#e6d0c4'

// Guirnalda de bombillas entre los dos postes de las esquinas traseras de la cubierta (que dibuja `backRail`). Las bombillas se
// encienden de noche.
function stringLights(s) {
  const { g } = s
  strandPoints().forEach(({ x, y, bulb }) => {
    dot(g, x, y, WOOD0)
    if (bulb) {
      rect(g, x, y + 1, 3, 1, WOOD0)
      rect(g, x, y + 2, 3, 3, PAL.saffronLight)
      dot(g, x, y + 2, '#fff6d0')
      s.windows.push({ x, y: y + 2, w: 3, h: 3 })
    }
  })
}

// Casa de Lupe, de izquierda a derecha: la escalera de madera, la sala baja con la cubierta (balaustrada, macetas, sombrilla,
// mesa, telescopio y guirnalda) y la casa de dos plantas encalada (`homeHouse.js`), según la ilustración de la usuaria.
// La geometría de la escalera y la cubierta (`terrace.js`) no cambia: los peldaños que se ven son los que se pisan.
// El tejado nuevo es más alto y ancho que el anterior; como la escena saca el cuerpo sólido de las filas anchas del dibujo,
// se fijan las de siempre (`wallRows`) para que la colisión y el paso por detrás de la casa sigan igual.
const HOME_WALL_ROWS = { top: 48, bottom: 160 }
export function homeSprite() {
  const DX = DECK_WIDEN
  const s = newSprite(256 + DX, 160)
  const { g } = s
  drawHouse(s)
  // Sala baja y cubierta. De atrás adelante: pared, suelo, guirnalda, escalera con su pasamanos trasero, balaustrada trasera
  // (que lo recibe en el poste de la esquina), macetas de las esquinas, telescopio, silla y mesa con sombrilla. El pasamanos y la
  // barandilla delantera van aparte (`overlay`): se dibujan por encima de la viajera. En el muro del extremo del entarimado no
  // hay puerta dibujada; la zona de entrada (`nearRoofDoor`) es solo de uso.
  rect(g, 38, 118, 116, 42, LOWER_LIME)
  rect(g, 38, 118, 116, 2, LOWER_LIME_SHADE)
  skirting(g, 38, 154)
  deckFloor(g)
  stringLights(s)
  terraceStairs(g, STAIRS)
  stairRail(g, STAIRS, 'back')
  backRail(g)
  deckPot(g, 46, 'pink', 80)
  deckPot(g, 138, 'red', 81)
  telescope(g)
  deckChair(g)
  parasol(g)
  lowerWindowXs().forEach((wx, i) => lowerRoomWindow(s, wx, LOWER_WINDOW.y, LOWER_WINDOW.w, LOWER_WINDOW.h, i ? 'pink' : 'red'))
  return { ...finish(s), wallRows: HOME_WALL_ROWS, overlay: railLayer(), glow: houseGlow(), snow: snowLayer(256 + DX, 160, terraceSnow) }
}

// Capa de nieve de un dibujo: se pinta aparte y la escena la funde sobre la versión de invierno (ver worldAssets).
function snowLayer(w, h, paint, origin = { x: 0, y: 0 }) {
  const canvas = makeCanvas(w, h)
  const g = canvas.getContext('2d')
  g.translate(-origin.x, -origin.y)
  paint(g)
  return canvas
}

// Pasamanos de la escalera y barandilla delantera de la cubierta como lienzo propio, con un margen para su contorno. Lleva
// la esquina (`x`, `y`) donde se coloca sobre el dibujo de la casa, y su propia capa de nieve.
function railLayer() {
  const { x: ox, y: oy, w, h } = RAIL_BOX
  const layer = newSprite(w, h)
  layer.g.translate(-ox, -oy)
  terraceRail(layer.g)
  return { canvas: finish(layer).canvas, snow: snowLayer(w, h, railSnow, { x: ox, y: oy }), x: ox, y: oy }
}

// Quiosco de helados Camy, con la papelera a la izquierda y el cartel de helados a la derecha. Sale de la ilustración de la usuaria, pero redibujado a
// mano a la resolución del juego (72×64): reducido tal cual, con vecino más cercano o promediando, quedaba ruidoso y
// borroso. Son dos PNG (ver `pngAssets.js`): el fondo (techo, estantes, caja y vitrina) y el frente (mostrador con el logo,
// postes, cartel y papelera). La viajera puede entrar por la puerta trasera y quedarse detrás del mostrador: el fondo se
// ordena por su pared trasera y el frente por la base, así que dentro queda entre los dos y asoma por el hueco.
// `doorCol` es el centro del mostrador, que mira al sur, a su caminito; `E` se pulsa desde delante.
export const KIOSK_W = 72
export const KIOSK_DOOR_COL = 34
const KIOSK_H = 64
// Filas del lienzo por las que se ordena cada capa: la pared trasera del puesto y la base.
const BACK_ROW = 49
const FRONT_ROW = KIOSK_H - 1
// Huellas sólidas, en píxeles del lienzo: franjas bajas junto al suelo. Dentro del puesto queda libre la franja entre la
// pared trasera y el mostrador (filas 50 a 56), a la que se pasa por la puerta trasera (columnas 42 a 51).
export const KIOSK_BODIES = [
  { x: 1, y: 57, w: 9, h: 6 }, // papelera
  { x: 60, y: 58, w: 12, h: 5 }, // cartel
  { x: 10, y: 57, w: 49, h: 6 }, // mostrador: desde dentro, los pies quedan fuera del aviso de `E` (que empieza en la fila 58)
  { x: 10, y: 47, w: 32, h: 3 }, // pared trasera, a la izquierda de la puerta
  { x: 52, y: 47, w: 7, h: 3 }, // pared trasera, a la derecha de la puerta
  { x: 10, y: 47, w: 4, h: 16 }, // lateral izquierdo
  { x: 55, y: 47, w: 4, h: 16 }, // lateral derecho
]

const layer = (name) => {
  const canvas = makeCanvas(KIOSK_W, KIOSK_H)
  drawPng(canvas.getContext('2d'), name)
  return canvas
}

export function kioskSprite() {
  return {
    canvas: layer('kioskBack'),
    overlay: { x: 0, y: 0, canvas: layer('kioskFront') },
    doorCol: KIOSK_DOOR_COL,
    windows: [],
    bodies: KIOSK_BODIES,
    depthRows: { back: BACK_ROW, front: FRONT_ROW },
    painted: true,
  }
}
