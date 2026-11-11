// La zona de Khalessi: un rascador de sisal con su plataforma y un juguete colgando, el comedero con comida y agua, y el
// arenero. La caja de cartón en la que duerme está en `decor.js`. Todo es bajo y está fuera del recorrido de la gata hasta
// Atreus (ver `catBrain.js`).
import { INK, rect, slab } from '../draw.js'

const SISAL = ['#c9a56b', '#a98450']

export const scratcher = {
  w: 22,
  h: 46,
  body: [{ l: -11, t: -6, r: 11, b: 0 }],
  paint(g) {
    // Base cuadrada, poste de cuerda con vueltas y plataforma con cojín arriba.
    slab(g, 0, 41, 22, 5, INK.whiteShade, INK.white, INK.steel)
    rect(g, 8, 8, 6, 33, SISAL[0])
    for (let y = 9; y < 41; y += 2) rect(g, 8, y, 6, 1, SISAL[1])
    rect(g, 8, 8, 1, 33, '#dfc088')
    slab(g, 1, 3, 20, 5, INK.whiteShade, INK.white, INK.steel)
    rect(g, 3, 1, 16, 3, INK.rose)
    rect(g, 3, 1, 16, 1, '#fde0e8')
    // Pelota colgada de una cuerda del borde de la plataforma.
    rect(g, 18, 8, 1, 7, INK.steelLight)
    rect(g, 17, 15, 3, 3, INK.saffronLight)
    rect(g, 17, 15, 1, 1, '#fff3c4')
  },
}

// Comedero: una esterilla de goma con un cuenco de pienso y otro de agua.
export const catBowls = {
  w: 24,
  h: 9,
  body: [{ l: -12, t: -4, r: 12, b: 0 }],
  paint(g) {
    rect(g, 0, 2, 24, 7, INK.rose)
    rect(g, 0, 2, 24, 1, '#fde0e8')
    rect(g, 0, 8, 24, 1, '#c4577f')
    rect(g, 2, 3, 9, 5, INK.white)
    rect(g, 2, 3, 9, 1, INK.whiteShade)
    rect(g, 3, 4, 7, 2, '#8d5a34')
    rect(g, 4, 3, 2, 1, '#a9744a')
    rect(g, 13, 3, 9, 5, INK.white)
    rect(g, 13, 3, 9, 1, INK.whiteShade)
    rect(g, 14, 4, 7, 2, INK.lagoonLight)
    rect(g, 15, 4, 2, 1, '#e6f6f8')
  },
}

// Arenero: bandeja de borde alto, con la arena a la vista y la palita apoyada.
export const litterBox = {
  w: 28,
  h: 14,
  body: [{ l: -13, t: -6, r: 13, b: 0 }],
  paint(g) {
    slab(g, 0, 2, 28, 12, INK.teal, '#4eb2ad', '#1f6b68')
    rect(g, 2, 4, 24, 6, '#e8d9b0')
    rect(g, 2, 4, 24, 1, '#cdbb8a')
    rect(g, 6, 6, 2, 1, '#cdbb8a')
    rect(g, 16, 7, 3, 1, '#cdbb8a')
    rect(g, 22, 5, 1, 1, '#cdbb8a')
    rect(g, 20, 0, 1, 6, INK.steelLight)
    rect(g, 19, 0, 3, 1, INK.steelLight)
  },
}
