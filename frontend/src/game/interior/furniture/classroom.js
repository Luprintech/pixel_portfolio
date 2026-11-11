// Muebles del aula de DAW del IES Gran Capitán: mesas de ordenadores vistas de frente (los monitores miran a quien entra) y la mesa
// "de la ficha", con el borde azafrán y una pantalla que enseña una hoja. Mismas piezas y paleta que el resto de salas.
import { INK, WOOD, codeScreen, keyboard, monitor, rect, slab } from '../draw.js'

const CODE_TONES = [INK.lagoonLight, INK.saffronLight, INK.rose, INK.meadow]

// Hoja con título y líneas de texto, para la pantalla de la mesa que abre la ficha.
function sheetScreen(g, x, y, w, h) {
  rect(g, x, y, w, h, INK.lagoon)
  rect(g, x + 2, y + 1, w - 4, 1, INK.white)
  for (let row = 4; row < h - 1; row += 2) rect(g, x + 2, y + row, row % 4 === 0 ? w - 6 : w - 9, 1, INK.lagoonLight)
}

function desk(featured) {
  return {
    w: 56,
    h: 30,
    body: [{ l: -28, t: -12, r: 28, b: 0 }],
    paint(g) {
      monitor(g, 6, 1, 18, 13, (gg, x, y, w, h) => codeScreen(gg, x, y, w, h, 0, CODE_TONES))
      monitor(g, 32, 1, 18, 13, featured ? sheetScreen : (gg, x, y, w, h) => codeScreen(gg, x, y, w, h, 3, CODE_TONES))
      slab(g, 0, 17, 56, 13, WOOD[2], WOOD[3], WOOD[0])
      if (featured) rect(g, 1, 18, 54, 2, INK.saffron)
      keyboard(g, 8, 21, 14, INK.slate, INK.steelLight)
      keyboard(g, 34, 21, 14, INK.slate, INK.steelLight)
      rect(g, 2, 28, 3, 2, WOOD[0])
      rect(g, 51, 28, 3, 2, WOOD[0])
    },
  }
}

export const classDesk = desk(false)
export const sheetDesk = desk(true)
