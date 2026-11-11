// Zona de ocio: la televisión inteligente sobre su mueble, el sofá (visto desde atrás, mirando a la tele) y la mesita.
// La tele tiene un modo por canal: apagada, el tiempo con su presentadora y las aplicaciones (Netflix, Plex, HBO Max y YouTube).
// Lo que se ve en pantalla está en `tvScreens.js`: cada canal recorre en bucle sus escenas, un fotograma por escena.
import { INK, WOOD, rect, slab } from '../draw.js'
import { ellipse } from '../../pixelKit.js'
import { TV_CHANNELS, TV_FRAMES, TV_MODES, paintScreen } from './tvScreens.js'

export { TV_CHANNELS, TV_FRAMES, TV_MODES }

export const tvUnit = {
  w: 72,
  h: 48,
  frames: TV_FRAMES,
  ms: 700,
  modes: TV_MODES,
  body: [{ l: -36, t: -14, r: 36, b: 0 }],
  paint(g, frame) {
    const [deep, dark, mid, light] = WOOD
    slab(g, 0, 34, 72, 13, mid, light, dark)
    rect(g, 35, 35, 1, 11, dark)
    rect(g, 4, 38, 28, 1, dark)
    rect(g, 40, 38, 28, 1, dark)
    rect(g, 16, 41, 4, 1, INK.saffronLight)
    rect(g, 52, 41, 4, 1, INK.saffronLight)
    rect(g, 3, 47, 4, 1, deep)
    rect(g, 65, 47, 4, 1, deep)
    rect(g, 14, 3, 44, 27, INK.night)
    rect(g, 14, 3, 44, 1, INK.slateLight)
    paintScreen(g, frame)
    rect(g, 54, 28, 2, 1, frame === 0 ? INK.tile : INK.meadow)
    rect(g, 33, 30, 6, 2, INK.slate)
    rect(g, 28, 32, 16, 2, INK.slate)
    ;[[2, 16], [62, 16]].forEach(([x, y]) => {
      slab(g, x, y, 8, 18, INK.slate, INK.slateLight, INK.night2)
      rect(g, x + 2, y + 3, 4, 4, INK.night)
      rect(g, x + 3, y + 4, 2, 2, INK.steel)
      rect(g, x + 2, y + 10, 4, 4, INK.night)
      rect(g, x + 3, y + 11, 2, 2, INK.steel)
    })
  },
}

// Sofá que mira a la tele (hacia arriba en pantalla). Se ve de espaldas pero con la perspectiva de la cámara: más allá del
// respaldo asoman el asiento y los brazos. Va en dos capas para que quien se siente quede entre ellas: la base (brazos y
// cojines del asiento, detrás de la persona) y el respaldo (delante, tapándole la espalda y las piernas).
const TEAL = INK.teal
const TEAL_LIGHT = '#4eb2ad'
const TEAL_DARK = '#1f6b68'

export const sofa = {
  w: 64,
  h: 38,
  body: [{ l: -32, t: -30, r: 32, b: 0 }],
  paint(g) {
    // Brazos a los lados, de la altura del asiento hasta delante.
    slab(g, 0, 4, 8, 28, TEAL, TEAL_LIGHT, TEAL_DARK)
    slab(g, 56, 4, 8, 28, TEAL, TEAL_LIGHT, TEAL_DARK)
    rect(g, 1, 4, 6, 2, '#7fd0dc')
    rect(g, 57, 4, 6, 2, '#7fd0dc')
    // Cojines del asiento, con su costura, y un almohadón rosa y una manta de cuadros sobre ellos.
    slab(g, 8, 6, 24, 14, TEAL_LIGHT, '#7fd0dc', TEAL)
    slab(g, 32, 6, 24, 14, TEAL_LIGHT, '#7fd0dc', TEAL)
    rect(g, 31, 7, 1, 12, TEAL_DARK)
    slab(g, 10, 7, 9, 8, INK.rose, '#fde0e8', '#c4577f')
    rect(g, 13, 9, 3, 3, '#c4577f')
    rect(g, 40, 8, 14, 9, INK.saffronLight)
    for (let x = 40; x < 54; x += 4) rect(g, x, 8, 2, 9, INK.saffron)
    rect(g, 40, 12, 14, 2, INK.tile)
    rect(g, 6, 34, 4, 4, INK.night2)
    rect(g, 54, 34, 4, 4, INK.night2)
  },
}

export const sofaFront = {
  w: 64,
  h: 38,
  body: [],
  paint(g) {
    // Respaldo: un tablón ancho con botones, por delante del asiento, y los brazos recortando el costado.
    slab(g, 6, 20, 52, 16, TEAL, TEAL_LIGHT, TEAL_DARK)
    rect(g, 6, 20, 52, 2, '#7fd0dc')
    for (let x = 14; x < 56; x += 10) {
      rect(g, x, 26, 2, 2, TEAL_DARK)
      rect(g, x + 5, 30, 2, 2, TEAL_DARK)
    }
    rect(g, 6, 35, 52, 1, TEAL_DARK)
    slab(g, 0, 22, 8, 12, TEAL, TEAL_LIGHT, TEAL_DARK)
    slab(g, 56, 22, 8, 12, TEAL, TEAL_LIGHT, TEAL_DARK)
  },
}

export const coffeeTable = {
  w: 34,
  h: 16,
  body: [{ l: -16, t: -6, r: 16, b: 0 }],
  paint(g) {
    const [deep, dark, mid, light] = WOOD
    slab(g, 0, 4, 34, 5, light, '#d9a173', mid)
    rect(g, 0, 9, 34, 2, dark)
    rect(g, 2, 11, 3, 5, mid)
    rect(g, 29, 11, 3, 5, mid)
    rect(g, 2, 15, 3, 1, deep)
    rect(g, 29, 15, 3, 1, deep)
    // Una taza y un posavasos: las consolas están en la estantería junto a la tele.
    rect(g, 8, 4, 7, 1, INK.rose)
    rect(g, 22, 1, 5, 4, INK.white)
    rect(g, 27, 2, 1, 2, INK.white)
    rect(g, 23, 1, 3, 1, INK.tileDark)
  },
}

// Lámpara de pie a la izquierda del sofá: pie y varilla finos y pantalla de tela. Con `E` se enciende (modo `on`): la
// pantalla se llena de luz y en el suelo queda un charco cálido, a pasos duros como el resto del dibujo.
const SHADE = { off: ['#e9dcc4', '#fbf1dc', '#c9b896'], on: ['#ffe9a8', '#fff6d2', '#f5c95c'] }

function lampShade(g, mode) {
  const [base, light, dark] = SHADE[mode]
  for (let row = 0; row < 14; row++) {
    const half = 5 + Math.floor(row / 3)
    rect(g, 20 - half, row, half * 2, 1, row === 0 ? light : row === 13 ? dark : base)
  }
  rect(g, 20 - 5, 1, 1, 12, light)
  rect(g, 20 + 4, 1, 1, 12, dark)
}

export const floorLamp = {
  w: 40,
  h: 54,
  frames: 2,
  ms: 1000,
  modes: { off: [0], on: [1] },
  body: [{ l: -4, t: -4, r: 4, b: 0 }],
  paint(g, frame) {
    const on = frame === 1
    if (on) {
      g.globalAlpha = 0.22
      ellipse(g, 20, 50, 19, 3.5, INK.saffronLight)
      g.globalAlpha = 0.3
      ellipse(g, 20, 50, 12, 2.5, '#fff3c4')
      g.globalAlpha = 1
    }
    lampShade(g, on ? 'on' : 'off')
    rect(g, 19, 14, 2, 35, INK.steel)
    rect(g, 19, 14, 1, 35, INK.steelLight)
    rect(g, 16, 49, 8, 3, INK.slate)
    rect(g, 16, 49, 8, 1, INK.slateLight)
    if (on) {
      rect(g, 17, 14, 6, 1, '#fff6d2')
      rect(g, 18, 15, 4, 1, INK.saffronLight)
    }
  },
}
