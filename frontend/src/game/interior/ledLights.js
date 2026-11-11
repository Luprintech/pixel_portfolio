// Luces led de la casa de Lupe: tiras de colores en la pared, a los lados de la recreativa, de la tele y de las estanterías, con
// su halo, y un velo de brillo sobre las pantallas. Son luces decorativas: no son sólidas ni se pueden usar, y por eso no
// tienen cuerpo en `homeLayout.js`. Lo que sí tienen es profundidad. Cada tira va en la capa del objeto al que está pegada, a
// un pelo por delante de él, así quien pasa por delante la tapa y quien queda detrás queda tapado, como con cualquier mueble:
//   - `wall`: pegadas a la pared, por detrás de todo lo que hay delante (la tira del techo).
//   - `furniture`: pegadas a los muebles de la pared del fondo (recreativa, tele, estantería de consolas y sus pantallas).
//   - `shelf`: pegadas a la vitrina de piezas, que está en el suelo y tiene su propia fila.
// Los colores cambian entre tres paletas cada par de segundos (quietos con «reducir movimiento»). Sin Phaser: aquí solo se
// dibuja; `InteriorSky` coloca las capas, las enciende con la hora del valle y les pone el orden de dibujo (`LED_DEPTH`).
import { INK, canvasOf, rect } from './draw.js'
import { SPOTS, WALL_BASE, WALL_X } from './homeLayout.js'
import { stringLightBulbs } from './interiorLight.js'

export const LED_LAYERS = ['wall', 'furniture', 'shelf']
// Orden de dibujo de cada capa: justo por encima del objeto al que pertenece (la pared es el 0 y los muebles se ordenan por
// la fila de su base).
export const LED_DEPTH = { wall: 0.5, furniture: WALL_BASE + 0.3, shelf: SPOTS.makerShelf.y + 0.4 }

// Tiras: rectángulos en píxeles de la sala. Salen de las posiciones del plano (`homeLayout.js`), así que siguen a su mueble.
// Las mesas llevan ya su tira de color dibujada en el propio mueble y la escalera de la azotea no lleva ninguna.
export const ledStrips = (room) => [
  { layer: 'wall', x: 16, y: 3, w: room.width - 32, h: 1 },
  // A los lados de la estantería de consolas, de la recreativa y de la tele, y tras ella.
  { layer: 'furniture', x: WALL_X.consoleShelf - 31, y: 26, w: 1, h: 52 },
  { layer: 'furniture', x: WALL_X.consoleShelf + 30, y: 26, w: 1, h: 52 },
  { layer: 'furniture', x: WALL_X.arcade - 18, y: 22, w: 1, h: 56 },
  { layer: 'furniture', x: WALL_X.arcade + 17, y: 22, w: 1, h: 56 },
  { layer: 'furniture', x: WALL_X.tv - 24, y: 33, w: 48, h: 1 },
  { layer: 'furniture', x: WALL_X.tv - 35, y: 36, w: 1, h: 40 },
  { layer: 'furniture', x: WALL_X.tv + 35, y: 36, w: 1, h: 40 },
  // A los lados de la vitrina de piezas impresas.
  { layer: 'shelf', x: SPOTS.makerShelf.x - 19, y: SPOTS.makerShelf.y - 46, w: 1, h: 40 },
  { layer: 'shelf', x: SPOTS.makerShelf.x + 18, y: SPOTS.makerShelf.y - 46, w: 1, h: 40 },
]

// Pantallas que siguen luciendo bajo la penumbra: x, y, ancho y alto de un velo claro sobre cada una. Van en la capa de los
// muebles de la pared, por delante de ellos.
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

// Una capa de leds para una paleta: cada tira con su núcleo y dos halos más anchos y transparentes. La capa de los muebles
// lleva además el velo de las pantallas.
export function ledCanvas(room, palette, layer) {
  const { canvas, g } = canvasOf(room.width, room.height)
  ledStrips(room).forEach((strip, i) => {
    if (strip.layer !== layer) return
    const color = palette[i % palette.length]
    g.globalAlpha = 0.12
    rect(g, strip.x - 4, strip.y - 4, strip.w + 8, strip.h + 8, color)
    g.globalAlpha = 0.25
    rect(g, strip.x - 2, strip.y - 2, strip.w + 4, strip.h + 4, color)
    g.globalAlpha = 1
    rect(g, strip.x, strip.y, strip.w, strip.h, color)
  })
  if (layer === 'furniture') {
    g.globalAlpha = 0.2
    screenVeils().forEach(([x, y, w, h]) => rect(g, x, y, w, h, INK.white))
    g.globalAlpha = 1
  }
  return canvas
}

// Resplandor cálido de las bombillas de la guirnalda: se enciende de noche en la capa de la pared, por detrás de los muebles.
export function bulbGlowCanvas(room) {
  const { canvas, g } = canvasOf(room.width, room.height)
  stringLightBulbs(20, room.width - 20, 4).forEach(({ x, y }) => {
    ;[[7, 0.1], [5, 0.14], [3, 0.2], [2, 0.3]].forEach(([radius, alpha]) => {
      g.globalAlpha = alpha
      rect(g, x - radius, y + 4 - radius, radius * 2 + 1, radius * 2 + 1, '#ffd98a')
    })
  })
  g.globalAlpha = 1
  return canvas
}
