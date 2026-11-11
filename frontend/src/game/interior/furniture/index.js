// Catálogo de muebles de las salas. Cada tipo es `{ w, h, body, paint, frames?, ms? }`: un lienzo de `w`×`h` píxeles cuyo
// pie (última fila, centrada) cae en el punto donde se coloca, y un cuerpo sólido (`body`) en rectángulos
// `{ l, t, r, b }` relativos a ese punto, igual que los objetos del valle. Si tiene `frames`, se anima: `paint` recibe el
// fotograma y `ms` es lo que dura cada uno.
import { canvasOf, pastelize } from '../draw.js'
import { atreusDesk, lupeDesk } from './desks.js'
import { bigPlant, chairAtreus, chairAtreusFront, chairLupe, chairLupeFront, roofStairs, tallPlant } from './decor.js'
import { arcade } from './arcade.js'
import { catBowls, litterBox, scratcher } from './catCorner.js'
import { coffeeTable, floorLamp, sofa, sofaFront, tvUnit } from './living.js'
import { hifi } from './audio.js'
import { printerA1, printerMini } from './maker.js'
import { consoleShelf, makerShelf } from './shelves.js'

export const FURNITURE = {
  atreusDesk, lupeDesk, floorLamp, chairAtreus, chairAtreusFront, chairLupe, chairLupeFront, sofaFront, roofStairs, tvUnit, sofa, coffeeTable, consoleShelf, makerShelf,
  printerA1, printerMini, hifi, arcade, bigPlant, tallPlant, scratcher, catBowls, litterBox,
}

export const framesOf = (kind) => FURNITURE[kind].frames ?? 1

// Dibujo de un fotograma de un mueble, ya con el color del tema.
export function furnitureCanvas(kind, frame, pastel) {
  const { w, h, paint } = FURNITURE[kind]
  const { canvas, g } = canvasOf(w, h)
  paint(g, frame)
  return pastelize(canvas, pastel)
}

// Rectángulos sólidos de un mueble colocado en (x, y), en píxeles de la sala.
export function solidsOf(piece) {
  return FURNITURE[piece.kind].body.map(({ l, t, r, b }) => ({ x: piece.x + l, y: piece.y + t, w: r - l, h: b - t }))
}
