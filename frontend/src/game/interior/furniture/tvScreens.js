// Lo que sale en la pantalla de la tele de la sala (40×22 píxeles). Cada canal es una secuencia de escenas, cada una un fotograma de la
// tele: la tele las recorre en bucle (`living.js`). Netflix enseña su logo y después Breaking Bad; HBO Max, su logo y después Game of
// Thrones; los demás alternan dos fotogramas (un pulso de luz). Todo se dibuja con rectángulos y letras de píxeles: sin imágenes ni
// marcas descargadas, solo la silueta y los colores de cada una. Sin Phaser ni React.
import { drawText, textPixels, textWidth } from '../../pixelFont.js'
import { INK, rect } from '../draw.js'

export const TV_CHANNELS = ['weather', 'netflix', 'plex', 'max', 'youtube']

export const SCREEN = { x: 16, y: 5, w: 40, h: 22 }
const centred = (g, text, y, color, x = SCREEN.x, w = SCREEN.w) => drawText(g, x + Math.floor((w - textWidth(text)) / 2), y, text, color)

// Texto ampliado `k` veces (cada píxel del dibujo ocupa k×k), para los logos grandes.
function drawScaled(g, x, y, text, color, glyphs, k) {
  textPixels(text, glyphs).forEach((p) => rect(g, x + p.x * k, y + p.y * k, k, k, color))
}

// Letras que el alfabeto de `pixelFont.js` no tiene: las minúsculas del logo de Breaking Bad (3×5) y la «x» de «max» (3×4).
const BB_GLYPHS = {
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  r: ['.##', '#..', '#..', '#..', '#..'],
  a: ['.#.', '#.#', '###', '#.#', '#.#'],
  e: ['.##', '#.#', '###', '#..', '.##'],
  k: ['#.#', '#.#', '##.', '#.#', '#.#'],
  i: ['.#.', '...', '.#.', '.#.', '.#.'],
  n: ['##.', '#.#', '#.#', '#.#', '#.#'],
  g: ['.##', '#.#', '.##', '..#', '##.'],
  d: ['..#', '..#', '.##', '#.#', '.##'],
}
const MAX_GLYPHS = {
  m: ['###', '###', '#.#', '#.#'],
  a: ['.##', '#.#', '#.#', '.##'],
  x: ['#.#', '.#.', '.#.', '#.#'],
}
function screenOff(g) {
  const { x, y, w, h } = SCREEN
  rect(g, x, y, w, h, '#14132a')
  for (let i = 0; i < 8; i++) rect(g, x + 4 + i * 2, y + h - 3 - i, 3, 1, '#1f1e3d')
}
export { screenOff }

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

// Netflix, primera escena: su logotipo rojo sobre negro, con un destello que recorre la palabra.
function netflixLogo(g, pulse) {
  const { x, y, w, h } = SCREEN
  rect(g, x, y, w, h, '#0b0a14')
  centred(g, 'NETFLIX', y + 8, '#7a1015')
  centred(g, 'NETFLIX', y + 7, '#e5252a')
  if (pulse) rect(g, x + Math.floor((w - textWidth('NETFLIX')) / 2), y + 14, textWidth('NETFLIX'), 1, '#e5252a')
}

// Netflix, segunda escena: el rótulo de Breaking Bad, con los símbolos químicos Br y Ba en cuadrados verdes (sin números) y el resto
// de las letras en verde, sobre fondo blanco, como en la serie.
const BB_GREEN = '#0f6b34'
function breakingBad(g) {
  const { x, y, w, h } = SCREEN
  rect(g, x, y, w, h, INK.white)
  const square = (sx, sy, symbol) => {
    rect(g, sx, sy, 9, 10, BB_GREEN)
    drawText(g, sx + 1, sy + 3, symbol, INK.white, BB_GLYPHS)
  }
  square(x + 2, y + 1, 'Br')
  drawText(g, x + 12, y + 4, 'eaking', BB_GREEN, BB_GLYPHS)
  square(x + 11, y + 11, 'Ba')
  drawText(g, x + 21, y + 14, 'd', BB_GREEN, BB_GLYPHS)
}

// HBO Max, primera escena: «HBO» arriba y «max» debajo, grandes, sobre un fondo que pasa de negro a violeta.
function hboMax(g, pulse) {
  const { x, y, w, h } = SCREEN
  rect(g, x, y, w, h, '#0c0a1e')
  rect(g, x, y + 10, w, 12, '#1d1140')
  rect(g, x, y + 16, w, 6, pulse ? '#2c1a66' : '#26165a')
  drawScaled(g, x + Math.floor((w - textWidth('HBO') * 2) / 2), y + 1, 'HBO', INK.white, undefined, 2)
  const maxW = (3 * 3 + 2) * 2
  drawScaled(g, x + Math.floor((w - maxW) / 2), y + 13, 'max', pulse ? '#c9b3ff' : '#b99cff', MAX_GLYPHS, 2)
}

// HBO Max, segunda escena: el logotipo de Game of Thrones, en negro sobre fondo claro: «GAME OF» y «THRONES» entre dos filetes.
function gameOfThrones(g) {
  const { x, y, w, h } = SCREEN
  rect(g, x, y, w, h, '#ecebe6')
  const black = '#111111'
  rect(g, x + 3, y + 2, w - 6, 1, black)
  const line = `GAME OF`
  drawText(g, x + Math.floor((w - textWidth(line)) / 2), y + 4, line, black)
  rect(g, x + 3, y + 10, w - 6, 1, black)
  drawText(g, x + Math.floor((w - textWidth('THRONES')) / 2), y + 12, 'THRONES', black)
  rect(g, x + 3, y + 19, w - 6, 1, black)
}

// Plex, como su aplicación web: barra superior gris con la palabra PLEX y su chevrón naranja, columna de iconos a la izquierda con el
// primero (Inicio) en naranja y una fila de carátulas de «Seguir viendo» con su barra de progreso naranja. El pulso mueve el foco.
const POSTERS = [['#7a2fb0', '#f4b8cc'], ['#1f5fd0', '#d8e6ff'], ['#2f7a45', '#f8d77a'], ['#b8402c', '#f1e6cf']]
function plex(g, pulse) {
  const { x, y, w, h } = SCREEN
  const orange = '#e5a00d'
  rect(g, x, y, w, h, '#1f2326')
  rect(g, x, y, w, 7, '#282a2d')
  drawText(g, x + 8, y + 1, 'PLEX', INK.white)
  ;[[0, 3], [1, 2], [2, 1], [1, 0]].forEach(([dx, dy]) => rect(g, x + 25 + dx, y + 1 + dy, 1, 1, orange))
  ;[[2, 0], [1, 1], [0, 2], [1, 3], [2, 4]].forEach(([dx, dy]) => rect(g, x + 25 + dx, y + 1 + dy, 1, 1, orange))
  rect(g, x, y + 7, 6, h - 7, '#181a1c')
  ;[0, 1, 2, 3].forEach((i) => rect(g, x + 2, y + 9 + i * 3, 2, 2, i === 0 ? orange : '#5a5f66'))
  rect(g, x + 8, y + 9, 12, 1, '#8a8f96')
  POSTERS.forEach(([base, accent], i) => {
    const px = x + 8 + i * 8
    rect(g, px, y + 11, 7, 9, base)
    rect(g, px + 1, y + 12, 5, 3, accent)
    rect(g, px, y + 19, 7, 1, '#3a3d42')
    rect(g, px, y + 19, 2 + i, 1, orange)
    if (i === (pulse ? 1 : 0)) {
      rect(g, px - 1, y + 10, 9, 1, orange)
      rect(g, px - 1, y + 20, 9, 1, orange)
      rect(g, px - 1, y + 10, 1, 11, orange)
      rect(g, px + 7, y + 10, 1, 11, orange)
    }
  })
}

// YouTube: la página del canal de Luprintech en píxeles (respaldo de la captura). Cabecera con el avatar (disco negro con el cerebro rosa y el circuito turquesa), el nombre
// y los botones; pestañas con «Inicio» subrayada; y las tres miniaturas de los vídeos con su barra roja de progreso.
// Captura del canal de Luprintech que se enseña en la tele de YouTube (pantalla 40×22, su proporción casi igual). Se precarga al cargar el
// juego; mientras no esté cargada, o si el archivo no existe, se dibuja la versión en píxeles de abajo.
export const YOUTUBE_ART = '/images/tv/youtube-luprintech.png'
let youtubeArt = null
export function preloadTvArt() {
  if (youtubeArt || typeof Image === 'undefined') return
  youtubeArt = new Image()
  youtubeArt.src = YOUTUBE_ART
}
preloadTvArt()

function youtube(g, pulse) {
  const { x, y, w, h } = SCREEN
  if (youtubeArt?.complete && youtubeArt.naturalWidth > 0 && typeof g.drawImage === 'function') {
    g.imageSmoothingEnabled = true
    g.imageSmoothingQuality = 'high'
    g.drawImage(youtubeArt, x, y, w, h)
    return
  }
  rect(g, x, y, w, h, '#0f0f0f')
  const cx = x + 5
  const cy = y + 5
  for (let j = -4; j <= 4; j++) {
    for (let i = -4; i <= 4; i++) {
      const r = Math.hypot(i, j)
      if (r > 4.4) continue
      const color = r > 3.4 ? (i < 0 ? '#f4b8cc' : '#3e9bb0') : i < 0 ? ((i + j) % 2 ? '#f4b8cc' : '#9a5a78') : ((i + j) % 2 ? '#7fd0dc' : '#1f6b78')
      rect(g, cx + i, cy + j, 1, 1, color)
    }
  }
  rect(g, x + 11, y + 2, 17, 2, INK.white)
  rect(g, x + 11, y + 5, 22, 1, '#9a9a9a')
  rect(g, x + 11, y + 7, 9, 3, '#272727')
  rect(g, x + 21, y + 7, 11, 3, '#272727')
  rect(g, x + 2, y + 11, 6, 1, INK.white)
  rect(g, x + 2, y + 12, 6, 1, INK.white)
  ;[11, 18, 25, 31].forEach((px, i) => rect(g, x + px, y + 11, i === 3 ? 4 : 5, 1, '#8a8a8a'))
  const thumbs = [
    ['#7a2fb0', '#f4b8cc', '#e8c36a'],
    ['#1a2a1a', '#4f9f3f', '#f0a030'],
    ['#1f5fd0', '#f1e6cf', '#d4503a'],
  ]
  thumbs.forEach(([base, accent, spot], i) => {
    const tx = x + 1 + i * 13
    rect(g, tx, y + 14, 12, 7, base)
    rect(g, tx + 1, y + 15, 5, 2, accent)
    rect(g, tx + 7, y + 15, 4, 4, spot)
    rect(g, tx, y + 20, 12, 1, '#3a3a3a')
    rect(g, tx, y + 20, pulse ? 5 + i : 4 + i, 1, '#ff0000')
  })
}

// Escenas de cada canal, en el orden en que se reproducen.
export const CHANNEL_SCENES = {
  weather: [(g) => weather(g, 0), (g) => weather(g, 1)],
  netflix: [(g) => netflixLogo(g, 0), (g) => netflixLogo(g, 1), breakingBad, breakingBad],
  plex: [(g) => plex(g, 0), (g) => plex(g, 1)],
  max: [(g) => hboMax(g, 0), (g) => hboMax(g, 1), gameOfThrones, gameOfThrones],
  youtube: [(g) => youtube(g, 0), (g) => youtube(g, 1)],
}

// Fotogramas de la tele: 0 apagada y, por canal, tantos como escenas tenga, en el orden de `TV_CHANNELS`.
export const TV_FRAMES = 1 + TV_CHANNELS.reduce((sum, channel) => sum + CHANNEL_SCENES[channel].length, 0)

export const TV_MODES = (() => {
  const modes = { off: [0] }
  let next = 1
  TV_CHANNELS.forEach((channel) => {
    modes[channel] = CHANNEL_SCENES[channel].map(() => next++)
  })
  return modes
})()

// Dibuja el fotograma `frame` de la tele en la pantalla.
export function paintScreen(g, frame) {
  if (frame === 0) return screenOff(g)
  const channel = TV_CHANNELS.find((id) => TV_MODES[id].includes(frame))
  return CHANNEL_SCENES[channel][TV_MODES[channel].indexOf(frame)](g)
}
