// Zona de ocio: la televisión inteligente sobre su mueble, el sofá (visto desde atrás, mirando a la tele), la mesita y la
// lámpara de pie. La tele tiene un modo por canal: apagada, el tiempo con su presentadora y las aplicaciones (Netflix,
// Plex, Max y YouTube), cada una con su rótulo y colores de marca en píxeles; cada modo alterna dos fotogramas (un pulso
// de luz). La lámpara no se anima: su charco de luz se pinta en el suelo (`roomDecor.js`).
import { drawText, textWidth } from '../../pixelFont.js'
import { INK, WOOD, rect, slab } from '../draw.js'

// Canales de la tele y su orden en la rejilla de la pantalla inteligente (`components/valle/SmartTv.jsx`).
export const TV_CHANNELS = ['weather', 'netflix', 'plex', 'max', 'youtube']

const SCREEN = { x: 16, y: 5, w: 40, h: 22 }
const centred = (g, text, y, color, x = SCREEN.x, w = SCREEN.w) => drawText(g, x + Math.floor((w - textWidth(text)) / 2), y, text, color)

function screenOff(g) {
  const { x, y, w, h } = SCREEN
  rect(g, x, y, w, h, '#14132a')
  for (let i = 0; i < 8; i++) rect(g, x + 4 + i * 2, y + h - 3 - i, 3, 1, '#1f1e3d')
}

// El tiempo: fondo celeste, mapa con iconos de sol, nube y lluvia y una presentadora a la izquierda que señala; el icono
// resaltado cambia con el pulso.
function weather(g, pulse) {
  const { x, y, w, h } = SCREEN
  rect(g, x, y, w, h, '#3e9bb0')
  rect(g, x, y, w, 4, '#2f7a92')
  centred(g, 'TIEMPO', y + 1, INK.white)
  rect(g, x + 3, y + 10, 5, 5, '#f2c9a4')
  rect(g, x + 2, y + 9, 7, 3, '#6b4423')
  rect(g, x + 2, y + 15, 7, 7, INK.rose)
  rect(g, x + 9, y + 16 - pulse, 5, 1, '#f2c9a4')
  rect(g, x + 15, y + 6, 24, 15, INK.moss)
  rect(g, x + 15, y + 6, 24, 1, INK.meadow)
  rect(g, x + 17, y + 8, 5, 5, pulse ? INK.saffron : INK.saffronLight)
  rect(g, x + 24, y + 9, 6, 3, INK.white)
  rect(g, x + 25, y + 8, 4, 1, INK.white)
  rect(g, x + 31, y + 9, 6, 3, INK.steelLight)
  rect(g, x + 32, y + 13, 1, 2, INK.lagoonLight)
  rect(g, x + 35, y + 13, 1, 2, INK.lagoonLight)
}

function netflix(g, pulse) {
  const { x, y, w, h } = SCREEN
  rect(g, x, y, w, h, '#0b0a14')
  const red = '#e5252a'
  centred(g, 'NETFLIX', y + 8, '#7a1015')
  centred(g, 'NETFLIX', y + 7, red)
  if (pulse) rect(g, x + Math.floor((w - textWidth('NETFLIX')) / 2), y + 14, textWidth('NETFLIX'), 1, red)
}

// Plex: fondo oscuro, la palabra PLEX en blanco y el chevrón naranja característico a su lado.
function plex(g, pulse) {
  const { x, y, w, h } = SCREEN
  rect(g, x, y, w, h, '#1f2326')
  centred(g, 'PLEX', y + 8, INK.white, x, w - 6)
  const cx = x + w - 11
  ;[[0, 4], [1, 3], [2, 2], [3, 1], [4, 0], [3, -1], [2, -2], [1, -3], [0, -4]].forEach(([dx, dy]) => rect(g, cx + dx, y + 10 + dy, 3, 1, pulse ? '#ffc230' : '#e5a00d'))
}

// Max: fondo azul oscuro con una franja violeta y la palabra en blanco.
function max(g, pulse) {
  const { x, y, w, h } = SCREEN
  rect(g, x, y, w, h, '#2a1670')
  rect(g, x, y + 11, w, 11, '#5822b4')
  rect(g, x, y + 16, w, 6, pulse ? '#7a3de0' : '#6a2fcb')
  centred(g, 'MAX', y + 8, INK.white)
}

// YouTube: fondo blanco, el botón rojo con el triángulo de reproducir y el nombre debajo.
function youtube(g, pulse) {
  const { x, y, w, h } = SCREEN
  rect(g, x, y, w, h, INK.white)
  rect(g, x + 12, y + 3, 16, 11, '#ff0000')
  rect(g, x + 13, y + 2, 14, 13, '#ff0000')
  ;[[0, 1], [1, 3], [2, 5], [3, 3], [4, 1]].forEach(([dx, height]) => rect(g, x + 18 + dx, y + 8 - Math.floor(height / 2), 1, height, INK.white))
  centred(g, 'YOUTUBE', y + 16, pulse ? '#282828' : '#3b3b3b')
}

const CHANNEL_PAINTERS = { weather, netflix, plex, max, youtube }

// Fotogramas: 0 apagada y, por canal, dos (índice del canal × 2 + 1 y + 2).
export const TV_FRAMES = 1 + TV_CHANNELS.length * 2
export const TV_MODES = { off: [0], ...Object.fromEntries(TV_CHANNELS.map((channel, i) => [channel, [1 + i * 2, 2 + i * 2]])) }

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
    if (frame === 0) screenOff(g)
    else CHANNEL_PAINTERS[TV_CHANNELS[Math.floor((frame - 1) / 2)]](g, (frame - 1) % 2)
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

// Sofá visto desde atrás: respaldo ancho con un almohadón, una manta doblada sobre él y los brazos a los lados.
export const sofa = {
  w: 64,
  h: 34,
  body: [{ l: -32, t: -10, r: 32, b: 0 }],
  paint(g) {
    rect(g, 2, 28, 3, 6, INK.night2)
    rect(g, 59, 28, 3, 6, INK.night2)
    slab(g, 0, 8, 64, 22, INK.teal, '#4eb2ad', '#1f6b68')
    rect(g, 0, 2, 64, 8, '#4eb2ad')
    rect(g, 0, 2, 64, 1, '#7fd0dc')
    rect(g, 0, 9, 64, 1, '#1f6b68')
    rect(g, 4, 11, 56, 1, '#1f6b68')
    for (let i = 1; i < 4; i++) rect(g, i * 16, 12, 1, 14, '#1f6b68')
    slab(g, 0, 10, 7, 24, INK.teal, '#4eb2ad', '#1f6b68')
    slab(g, 57, 10, 7, 24, INK.teal, '#4eb2ad', '#1f6b68')
    // Manta de cuadros sobre el respaldo y un almohadón rosa en la esquina.
    rect(g, 36, 6, 18, 12, INK.saffronLight)
    for (let x = 36; x < 54; x += 4) rect(g, x, 6, 2, 12, INK.saffron)
    rect(g, 36, 12, 18, 2, INK.tile)
    rect(g, 36, 17, 18, 1, INK.saffron)
    slab(g, 10, 6, 11, 10, INK.rose, '#fde0e8', '#c4577f')
    rect(g, 14, 9, 3, 3, '#c4577f')
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

// Lámpara de pie con pantalla de tela cálida. Su luz es el charco que `roomDecor.js` pinta en el suelo.
export const floorLamp = {
  w: 14,
  h: 46,
  body: [{ l: -3, t: -3, r: 3, b: 0 }],
  paint(g) {
    rect(g, 2, 44, 10, 2, INK.slate)
    rect(g, 6, 14, 2, 30, INK.steel)
    rect(g, 7, 14, 1, 30, INK.slateLight)
    rect(g, 1, 3, 12, 11, INK.saffronLight)
    rect(g, 1, 3, 12, 1, '#fff3c4')
    rect(g, 2, 4, 2, 9, '#fff3c4')
    rect(g, 10, 4, 3, 9, INK.saffron)
    rect(g, 1, 13, 12, 1, INK.saffron)
    rect(g, 0, 5, 1, 7, INK.saffron)
    rect(g, 13, 5, 1, 7, INK.saffron)
  },
}
