// Recreativa arcade vertical (upright): marquesina iluminada con el rótulo, pantalla de tubo con unos marcianitos, panel de
// mandos con joystick y botones de colores, y la ranura de las monedas. Va contra la pared, junto a la estantería de
// consolas. Se anima con cuatro fotogramas: las bombillas de la marquesina corren por su borde, el rótulo cambia de color
// y los marcianitos se mueven; con «reducir movimiento» se queda en el primero, ya encendida.
import { drawText, textWidth } from '../../pixelFont.js'
import { INK, rect, slab } from '../draw.js'

const CABINET = INK.blue
const CABINET_LIGHT = '#5f7fc0'
const CABINET_DARK = '#2a3f73'
const MARQUEE = [INK.saffronLight, INK.rose, INK.lagoonLight, INK.meadow]
const BUTTONS = [INK.tile, INK.saffronLight, INK.lagoonLight, INK.meadow]

// Bombillas del borde de la marquesina: una de cada dos encendida, y el turno cambia con el fotograma (efecto de persecución).
function marqueeBulbs(g, frame) {
  for (let i = 0; i < 11; i++) {
    const lit = (i + frame) % 2 === 0
    rect(g, 2 + i * 3, 0, 2, 1, lit ? '#fff3c4' : INK.slate)
    rect(g, 2 + i * 3, 9, 2, 1, lit ? INK.slate : '#fff3c4')
  }
}

// Marcianitos de la pantalla: una fila que se desplaza de lado a lado, con las patas alternando, y la nave abajo.
function invaders(g, x, y, frame) {
  const shift = [0, 1, 2, 1][frame % 4]
  ;[0, 1, 2].forEach((i) => {
    const ix = x + 2 + i * 6 + shift
    rect(g, ix, y + 2, 4, 2, i === 1 ? INK.rose : INK.meadow)
    rect(g, ix + 1, y + 1, 2, 1, i === 1 ? INK.rose : INK.meadow)
    rect(g, ix, y + 4, 1, 1, i === 1 ? INK.rose : INK.meadow)
    rect(g, ix + 3, y + 4, 1, 1, i === 1 ? INK.rose : INK.meadow)
    if (frame % 2) rect(g, ix + 1, y + 4, 2, 1, i === 1 ? INK.rose : INK.meadow)
  })
  rect(g, x + 8, y + 12, 4, 1, INK.lagoonLight)
  rect(g, x + 9, y + 11, 2, 1, INK.lagoonLight)
  rect(g, x + 9 + (frame % 2 ? 0 : 1), y + 8, 1, 2, INK.saffronLight)
}

export const arcade = {
  w: 34,
  h: 60,
  ms: 420,
  frames: 4,
  body: [{ l: -15, t: -14, r: 15, b: 0 }],
  paint(g, frame) {
    // Zócalo y cuerpo, con unas franjas de colores en el costado que se asoman por los bordes.
    rect(g, 3, 55, 28, 5, INK.night)
    slab(g, 2, 9, 30, 47, CABINET, CABINET_LIGHT, CABINET_DARK)
    rect(g, 2, 44, 2, 3, INK.saffronLight)
    rect(g, 2, 47, 2, 3, INK.rose)
    rect(g, 30, 44, 2, 3, INK.saffronLight)
    rect(g, 30, 47, 2, 3, INK.rose)
    // Marquesina iluminada, con su rótulo y su borde de bombillas.
    slab(g, 1, 0, 32, 10, INK.night2, INK.slateLight, INK.night)
    rect(g, 3, 2, 28, 6, MARQUEE[frame % MARQUEE.length])
    rect(g, 3, 2, 28, 1, '#ffffff')
    const label = 'ARCADE'
    drawText(g, 3 + Math.floor((28 - textWidth(label)) / 2), 3, label, INK.night)
    marqueeBulbs(g, frame)
    // Pantalla de tubo: marco oscuro, cristal curvo (esquinas recortadas) con el juego y un reflejo.
    rect(g, 4, 12, 26, 20, INK.night)
    rect(g, 6, 14, 22, 16, '#14132a')
    rect(g, 6, 14, 1, 1, INK.night)
    rect(g, 27, 14, 1, 1, INK.night)
    rect(g, 6, 29, 1, 1, INK.night)
    rect(g, 27, 29, 1, 1, INK.night)
    invaders(g, 8, 15, frame)
    rect(g, 8, 15, 3, 1, 'rgba(255,255,255,0.35)')
    rect(g, 8, 16, 1, 2, 'rgba(255,255,255,0.35)')
    // Panel de mandos inclinado, que sobresale: joystick con bola roja y cuatro botones de colores.
    slab(g, 0, 33, 34, 3, INK.slateLight, INK.steelLight, INK.slate)
    slab(g, 1, 36, 32, 6, INK.night2, INK.slateLight, INK.night)
    rect(g, 8, 32, 2, 4, INK.steel)
    rect(g, 6, 29, 6, 4, INK.tile)
    rect(g, 7, 29, 2, 1, '#ff9a9a')
    BUTTONS.forEach((color, i) => {
      rect(g, 17 + i * 4, 37 + (i % 2), 3, 3, color)
      rect(g, 17 + i * 4, 37 + (i % 2), 3, 1, '#ffffff')
    })
    // Ranura de las monedas, con su luz, y las rejillas del altavoz.
    rect(g, 12, 45, 10, 9, INK.night)
    rect(g, 13, 46, 3, 2, INK.tile)
    rect(g, 18, 46, 3, 2, INK.saffronLight)
    rect(g, 14, 50, 6, 1, INK.slate)
    rect(g, 14, 52, 6, 1, INK.slate)
  },
}
