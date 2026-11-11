// Minicadena de música: un mueblecito bajo con el equipo de sonido (pantalla con ecualizador, ranura del disco y botones) y dos
// altavoces a los lados. Apagada, la pantalla está oscura; sonando, las barras del ecualizador se mueven entre dos fotogramas.
import { INK, WOOD, hash2, rect, slab } from '../draw.js'

export const hifi = {
  w: 38,
  h: 32,
  ms: 360,
  frames: 3,
  modes: { off: [0], on: [1, 2] },
  body: [{ l: -17, t: -8, r: 17, b: 0 }],
  paint(g, frame) {
    const [deep, dark, mid, light] = WOOD
    // Mueble bajo.
    slab(g, 1, 20, 36, 11, mid, light, dark)
    rect(g, 3, 31, 3, 1, deep)
    rect(g, 32, 31, 3, 1, deep)
    rect(g, 4, 24, 14, 5, dark)
    rect(g, 20, 24, 14, 5, dark)
    // Altavoces.
    ;[[0, 2], [30, 2]].forEach(([x, y]) => {
      slab(g, x, y, 8, 18, INK.slate, INK.slateLight, INK.night2)
      rect(g, x + 2, y + 3, 4, 4, INK.night)
      rect(g, x + 3, y + 4, 2, 2, INK.steel)
      rect(g, x + 2, y + 10, 4, 5, INK.night)
      rect(g, x + 3, y + 11, 2, 3, INK.steel)
    })
    // Equipo: pantalla, ranura y botones.
    slab(g, 9, 6, 20, 14, INK.steel, INK.steelLight, INK.slateLight)
    rect(g, 11, 8, 16, 6, INK.night)
    if (frame > 0) {
      for (let i = 0; i < 6; i++) {
        const height = 1 + Math.floor(hash2(i, frame, 41) * 4)
        rect(g, 12 + i * 2 + (i > 2 ? 1 : 0), 13 - height, 1, height, i % 2 ? INK.meadow : INK.lagoonLight)
      }
    } else rect(g, 14, 11, 10, 1, INK.slate)
    rect(g, 11, 15, 16, 1, INK.night)
    rect(g, 12, 17, 2, 2, INK.slateLight)
    rect(g, 16, 17, 2, 2, INK.slateLight)
    rect(g, 24, 17, 3, 2, frame > 0 ? INK.meadow : INK.tile)
  },
}
