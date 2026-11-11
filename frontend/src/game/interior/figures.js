// Las figuras impresas en 3D de la casa, cada una dibujada en un lienzo de 16×16 para verlas de cerca (el visor de la
// vitrina las amplía) y, la del pokémon, también sobre la cama de la impresora pequeña. Más adelante se podrán sustituir o
// acompañar con fotos de las figuras reales de Lupe. Sin dependencias de Phaser ni de React.
import { INK, canvasOf, rect } from './draw.js'

// Pokémon amarillo de orejas largas con la punta negra, mejillas rojas y cola en zigzag. `ox, oy` es su esquina.
export function drawPokemon(g, ox = 0, oy = 0) {
  const put = (x, y, w, h, color) => rect(g, ox + x, oy + y, w, h, color)
  put(11, 4, 2, 2, '#c99a1c')
  put(12, 2, 2, 3, '#f8d63a')
  put(13, 1, 2, 2, '#f8d63a')
  put(10, 6, 2, 2, '#c99a1c')
  put(4, 1, 2, 4, '#f8d63a')
  put(3, 0, 2, 2, INK.night)
  put(9, 1, 2, 4, '#f8d63a')
  put(10, 0, 2, 2, INK.night)
  put(3, 4, 9, 6, '#f8d63a')
  put(4, 10, 7, 4, '#f8d63a')
  put(5, 14, 2, 2, '#c99a1c')
  put(8, 14, 2, 2, '#c99a1c')
  put(5, 6, 1, 2, INK.night)
  put(9, 6, 1, 2, INK.night)
  put(3, 8, 2, 2, INK.tile)
  put(10, 8, 2, 2, INK.tile)
  put(7, 8, 1, 1, INK.night)
  put(4, 11, 1, 2, '#c99a1c')
}

const lightbox = (g) => {
  rect(g, 1, 2, 14, 11, INK.night2)
  ;[[3, 4, 3], [9, 4, 3], [2, 6, 12], [3, 8, 10], [5, 10, 6], [7, 12, 2]].forEach(([x, y, w]) => rect(g, x, y, w, 2, INK.rose))
  rect(g, 4, 5, 1, 1, '#fde0e8')
}

const roundCritter = (g) => {
  rect(g, 3, 4, 10, 10, INK.saffronLight)
  rect(g, 3, 1, 3, 4, INK.saffronLight)
  rect(g, 10, 1, 3, 4, INK.saffronLight)
  rect(g, 5, 8, 2, 2, INK.night)
  rect(g, 9, 8, 2, 2, INK.night)
  rect(g, 7, 11, 2, 1, INK.tile)
}

const wingedCritter = (g) => {
  rect(g, 5, 4, 7, 9, INK.lagoonLight)
  rect(g, 1, 6, 4, 6, INK.lagoon)
  rect(g, 12, 6, 4, 6, INK.lagoon)
  rect(g, 6, 7, 1, 2, INK.night)
  rect(g, 10, 7, 1, 2, INK.night)
  rect(g, 7, 10, 3, 1, INK.saffron)
}

const vase = (g) => {
  rect(g, 6, 1, 4, 3, INK.teal)
  rect(g, 4, 4, 8, 9, INK.teal)
  rect(g, 3, 6, 10, 5, INK.teal)
  rect(g, 4, 8, 8, 1, '#1f6b68')
  rect(g, 4, 11, 8, 1, '#1f6b68')
}

const keyrings = (g) => {
  ;[[3, INK.tile], [6, INK.saffronLight], [9, INK.meadow], [12, INK.lagoonLight]].forEach(([x, color]) => {
    rect(g, x, 1, 1, 6, INK.steelLight)
    rect(g, x - 1, 7, 3, 3, color)
    rect(g, x, 10, 1, 2, INK.night2)
  })
}

// Las figuras de la vitrina y la del pokémon. `unlock` es el logro que la entrega (sin él, no se ve en el visor).
export const FIGURES = [
  { id: 'lightbox', draw: lightbox },
  { id: 'roundCritter', draw: roundCritter },
  { id: 'wingedCritter', draw: wingedCritter },
  { id: 'vase', draw: vase },
  { id: 'keyrings', draw: keyrings },
  { id: 'pokemon', draw: (g) => drawPokemon(g, 0, 0), unlock: 'maker' },
]

export function figureCanvas(figure) {
  const { canvas, g } = canvasOf(16, 16)
  figure.draw(g)
  return canvas
}
