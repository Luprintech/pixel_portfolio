// Luces led de la casa de Lupe de noche: tiras de colores en la pared, bajo las mesas, tras la tele y en los bordes de las
// estanterías, con su halo, sobre un oscurecimiento de la sala. Los colores cambian entre tres paletas cada par de
// segundos (quietos con «reducir movimiento»). Sin Phaser: aquí solo se dibuja; `InteriorScene` coloca las capas.
import { INK, canvasOf, rect } from './draw.js'
import { SPOTS, WALL_X } from './homeLayout.js'

// Tiras: rectángulos en píxeles de la sala. Salen de las posiciones del plano (`homeLayout.js`), así que siguen a su mueble.
export const ledStrips = (room) => [
  { x: 16, y: 3, w: room.width - 32, h: 1 },
  // Bajo el tablero de cada mesa.
  { x: WALL_X.atreusDesk - 39, y: 70, w: 62, h: 1 },
  { x: WALL_X.lupeDesk - 37, y: 69, w: 74, h: 1 },
  // A los lados de la estantería de consolas, de la recreativa y de la tele, y tras ella.
  { x: WALL_X.consoleShelf - 31, y: 26, w: 1, h: 52 },
  { x: WALL_X.consoleShelf + 30, y: 26, w: 1, h: 52 },
  { x: WALL_X.arcade - 18, y: 22, w: 1, h: 56 },
  { x: WALL_X.arcade + 17, y: 22, w: 1, h: 56 },
  { x: WALL_X.tv - 24, y: 33, w: 48, h: 1 },
  { x: WALL_X.tv - 35, y: 36, w: 1, h: 40 },
  { x: WALL_X.tv + 35, y: 36, w: 1, h: 40 },
  // Sobre la escalera y a los lados de la vitrina de piezas impresas.
  { x: WALL_X.stairs - 13, y: 52, w: 28, h: 1 },
  { x: SPOTS.makerShelf.x - 19, y: SPOTS.makerShelf.y - 46, w: 1, h: 40 },
  { x: SPOTS.makerShelf.x + 18, y: SPOTS.makerShelf.y - 46, w: 1, h: 40 },
]

// Pantallas que siguen luciendo bajo la penumbra: x, y, ancho y alto de un velo claro sobre cada una.
const screenVeils = () => [
  [WALL_X.atreusDesk - 34, 37, 54, 16],
  [WALL_X.lupeDesk - 34, 36, 70, 18],
  [WALL_X.tv - 20, 37, 40, 22],
  [WALL_X.arcade - 11, 12, 22, 17],
]

export const LED_PALETTES = [
  ['#ff4fa8', '#35e0ff'],
  ['#35e0ff', '#9b6bff'],
  ['#ffb347', '#ff4fa8'],
]

// Capa de leds para una paleta: cada tira con su núcleo y dos halos más anchos y transparentes.
export function ledCanvas(room, palette) {
  const { canvas, g } = canvasOf(room.width, room.height)
  ledStrips(room).forEach((strip, i) => {
    const color = palette[i % palette.length]
    g.globalAlpha = 0.12
    rect(g, strip.x - 4, strip.y - 4, strip.w + 8, strip.h + 8, color)
    g.globalAlpha = 0.25
    rect(g, strip.x - 2, strip.y - 2, strip.w + 4, strip.h + 4, color)
    g.globalAlpha = 1
    rect(g, strip.x, strip.y, strip.w, strip.h, color)
  })
  // Las pantallas siguen luciendo bajo la penumbra: un velo claro sobre cada una.
  g.globalAlpha = 0.2
  screenVeils().forEach(([x, y, w, h]) => rect(g, x, y, w, h, INK.white))
  g.globalAlpha = 1
  return canvas
}
