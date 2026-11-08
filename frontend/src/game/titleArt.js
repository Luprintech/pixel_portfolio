// Ilustración de la pantalla de título: el valle al amanecer, dibujado píxel a píxel en 160×90.
import { PAL } from './palette.js'
import { catCanvas, princessCanvas } from './sprites.js'

export const TITLE_W = 160
export const TITLE_H = 90
export const LIGHTS = 5

const BANDS = [
  [0, '#2e2d5a'],
  [14, '#4b4380'],
  [26, '#7a6ab0'],
  [38, '#d98e7a'],
  [47, '#f2b134'],
]

const rect = (g, x, y, w, h, c) => {
  g.fillStyle = c
  g.fillRect(x, y, w, h)
}

function house(g, x, y, w, roof, wall, lit) {
  rect(g, x, y, w, 9, wall)
  for (let i = 0; i < 5; i++) rect(g, x + 4 - i, y - 5 + i, w - 8 + 2 * i, 1, roof)
  rect(g, x + w - 5, y + 4, 3, 5, PAL.ink)
  rect(g, x + 2, y + 2, 3, 3, lit ? PAL.saffron : PAL.ink2)
}

// `lit` cuenta cuántas ventanas están encendidas (0 a LIGHTS): es la única animación de la pantalla.
export function drawTitle(canvas, look, lit = LIGHTS) {
  const g = canvas.getContext('2d')
  g.imageSmoothingEnabled = false

  for (let y = 0; y < 62; y++) {
    let b = 0
    BANDS.forEach((band, i) => {
      if (y >= band[0]) b = i
    })
    for (let x = 0; x < TITLE_W; x++) {
      let c = BANDS[b][1]
      if (b > 0 && y - BANDS[b][0] < 2 && (x + y) % 2 === 0) c = BANDS[b - 1][1]
      rect(g, x, y, 1, 1, c)
    }
  }
  for (let y = -9; y <= 9; y++)
    for (let x = -9; x <= 9; x++) if (x * x + y * y <= 81 && 46 + y < 52) rect(g, 112 + x, 46 + y, 1, 1, PAL.saffronLight)

  for (let x = 0; x < TITLE_W; x++) rect(g, x, 44 + Math.round(7 * Math.sin(x / 14) + 4 * Math.sin(x / 5 + 1)), 1, 60, PAL.dusk)
  for (let x = 0; x < TITLE_W; x++) rect(g, x, 58 + Math.round(3 * Math.sin(x / 18) + 2 * Math.sin(x / 7)), 1, 40, PAL.mossDark)

  const houses = [
    [12, 56, 14, PAL.tile],
    [32, 54, 16, '#2f8f8b'],
    [54, 57, 14, '#7a3f8f'],
    [78, 55, 16, '#4a4a6a'],
  ]
  houses.forEach(([x, y, w, roof], i) => house(g, x, y, w, roof, i === 3 ? '#c9b994' : PAL.wall, lit > i))
  rect(g, 89, 46, 3, 5, '#4a4a6a')
  ;[[90, 44], [92, 41], [91, 38]].forEach(([x, y]) => rect(g, x, y, 2, 1, PAL.mist))

  for (let x = 116; x <= 150; x++) {
    const d = (x - 133) / 17
    const h = Math.round(16 * Math.sqrt(Math.max(0, 1 - d * d)))
    rect(g, x, 70 - h, 1, h + 4, PAL.stone)
  }
  rect(g, 129, 62, 8, 12, PAL.ink)
  rect(g, 130, 61, 6, 1, PAL.ink)
  rect(g, 126, 60, 2, 3, lit > 4 ? PAL.saffron : PAL.ink2)
  rect(g, 138, 60, 2, 3, lit > 4 ? PAL.saffron : PAL.ink2)

  for (let x = 0; x < TITLE_W; x++) {
    const h = 74 + Math.round(2 * Math.sin(x / 22 + 2))
    rect(g, x, h, 1, 20, PAL.moss)
    rect(g, x, h, 1, 1, PAL.meadow)
  }
  for (let i = 0; i < 46; i++) rect(g, (i * 37) % 160, 77 + ((i * 13) % 12), 1, 1, i % 3 ? PAL.meadow : PAL.mossDark)
  rect(g, 98, 81, 13, 2, PAL.mossDark)
  rect(g, 114, 84, 15, 2, PAL.mossDark)

  g.drawImage(princessCanvas(look, 'down', 0), 100, 69)
  g.drawImage(catCanvas(0), 116, 77)
}

