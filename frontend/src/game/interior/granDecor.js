// Decoración fija del aula del IES Gran Capitán, sobre la sala vacía: suelo de baldosas, pared pintada, marcos de ventana, el tablón
// del itinerario (Trassierra a Gran Capitán) y la pizarra del proyecto final (propuestas, votación y Vocacción). Se pinta una vez, con
// los colores de la paleta; el cristal de las ventanas queda hueco para que se vea el cielo vivo (`InteriorSky`).
import { drawText } from '../pixelFont.js'
import { INK, WOOD, canvasOf, hash2, pastelize, rect, slab } from './draw.js'
import { GRAN_WALL } from './granLayout.js'
import { windowFrame } from './roomDecor.js'
import { TILE } from '../world.js'

const FLOOR = ['#d9cfb8', '#cfc4a8']
const PAINT = '#a9c9c4'
const CORK = '#c8a066'

function floor(g, room) {
  const top = room.wallRows * TILE
  for (let y = top; y < room.height; y += TILE / 2) {
    for (let x = TILE; x < room.width - TILE; x += TILE / 2) {
      rect(g, x, y, TILE / 2, TILE / 2, FLOOR[(((x - TILE) / (TILE / 2)) + (y - top) / (TILE / 2)) % 2])
      if (hash2(x, y, 31) < 0.12) rect(g, x + 2, y + 2, 2, 1, FLOOR[0])
    }
  }
  rect(g, TILE, top, room.width - 2 * TILE, 2, WOOD[0])
}

// Pared del fondo pintada de verde agua por encima del zócalo, entre las dos paredes laterales.
function paintWall(g, room) {
  rect(g, TILE, 3, room.width - 2 * TILE, room.wallRows * TILE - 20, PAINT)
  rect(g, TILE, 3, room.width - 2 * TILE, 1, INK.white)
}

// Tablón de corcho con dos tarjetas unidas por una flecha: "T" (Trassierra) y "GC" (Gran Capitán).
function notice(g, { x, y, w, h }) {
  slab(g, x, y, w, h, WOOD[2], WOOD[3], WOOD[0])
  rect(g, x + 2, y + 2, w - 4, h - 4, CORK)
  rect(g, x + 5, y + 8, 11, 14, INK.white)
  drawText(g, x + 9, y + 12, 'T', INK.night2)
  rect(g, x + w - 18, y + 8, 13, 14, INK.white)
  drawText(g, x + w - 16, y + 12, 'GC', INK.night2)
  rect(g, x + 18, y + 15, 12, 1, INK.night2)
  rect(g, x + 28, y + 13, 1, 5, INK.night2)
  rect(g, x + 27, y + 14, 1, 3, INK.night2)
  rect(g, x + 8, y + 5, 2, 2, INK.tile)
  rect(g, x + w - 12, y + 5, 2, 2, INK.lagoon)
}

// Pizarra blanca: cuatro notas de propuestas arriba, una flecha de votación y el nombre del proyecto elegido; bandeja con rotuladores.
function board(g, { x, y, w, h }) {
  slab(g, x, y, w, h, INK.steel, INK.steelLight, INK.slate)
  rect(g, x + 3, y + 3, w - 6, h - 9, INK.white)
  ;[INK.saffronLight, INK.rose, INK.lagoonLight, INK.meadow].forEach((color, i) => {
    rect(g, x + 8 + i * 20, y + 7, 14, 10, color)
    rect(g, x + 10 + i * 20, y + 10, 10, 1, INK.night2)
    rect(g, x + 10 + i * 20, y + 13, 7, 1, INK.night2)
  })
  rect(g, x + 8, y + 21, w - 16, 1, INK.night2)
  rect(g, x + w - 12, y + 19, 1, 5, INK.night2)
  rect(g, x + w - 11, y + 20, 1, 3, INK.night2)
  rect(g, x + 22, y + 25, 52, 7, INK.saffronLight)
  rect(g, x + 22, y + 25, 52, 1, INK.saffron)
  drawText(g, x + 30, y + 26, 'VOCACCION', INK.night2)
  rect(g, x + 6, y + h - 5, w - 12, 2, INK.steelLight)
  ;[INK.tile, INK.lagoon, INK.night2].forEach((color, i) => rect(g, x + 12 + i * 5, y + h - 6, 3, 1, color))
}

// Capa transparente del tamaño de la sala con todo lo anterior.
export function granDecorCanvas(room, pastel) {
  const { canvas, g } = canvasOf(room.width, room.height)
  floor(g, room)
  paintWall(g, room)
  room.windows.filter((window) => window.frame).forEach((window) => windowFrame(g, window))
  notice(g, GRAN_WALL.notice)
  board(g, GRAN_WALL.board)
  return pastelize(canvas, pastel)
}
