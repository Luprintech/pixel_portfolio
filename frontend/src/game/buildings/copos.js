// Copos Congelados dibujado en píxeles, copiando pieza a pieza la fachada que aportó la usuaria: cornisa, rótulo blanco
// corrido con "COPOS" y "CONGELADOS", puerta acristalada bajo su cajón a la izquierda, portero automático, logo de la luna
// con el copo, escaparate, azulejo del copo, dos persianas y el zócalo de mármol. Conserva las medidas del PNG (176×43,
// apoyada abajo en un lienzo de tres teselas) y la columna de la puerta, que usan la escena y `world.test.js`.
import { PAL, TONE, shade, tint } from '../palette.js'
import { dot, hash2, rect } from '../pixelKit.js'
import { ROUNDED_GLYPHS, drawText } from '../pixelFont.js'
import { litPane } from './litPane.js'
import { finish, newSprite } from './shared.js'

export const COPOS_FACADE = { w: 176, h: 43 }
const COPOS_CANVAS_H = 48
const TOP = COPOS_CANVAS_H - COPOS_FACADE.h
// Centro de la puerta acristalada, en píxeles desde el borde izquierdo de la fachada.
export const COPOS_DOOR_COL = 16

// Azules de la marca, sacados del PNG: no hay tokens de azul marino y sin ellos el rótulo deja de ser el de Copos.
const NAVY = '#1f3c8f'
const BLUE = '#2b72b5'
const SKY = '#4a7ccc'
// Mármol blanco algo rosado de la fachada original, con sus vetas.
const MARBLE = ['#d3c6c1', '#e6dbd6', '#efe6e2', '#faf4f1']
const VEIN = '#cfc1bc'
// Molduras del mármol: gris cálido, sombra arriba y canto abajo.
const BAND = ['#8a7f80', '#a89c9b']
// Metal de marcos y persianas: la piedra lavanda del valle, que es lo que pone la fachada en su estilo.
const [METAL0, METAL1, METAL2] = TONE.stone
const DARK = shade(PAL.stone, 0.55)
// Cristales azul verdoso, como en el PNG: el de la puerta, más oscuro, queda a la sombra del cajón.
const GLASS = '#445d6e'
const GLASS_SHEEN = '#6b92ae'
const DOOR_GLASS = '#2c3b44'
const DOOR_SHEEN = '#57708a'
// Beige de las cajas de la pared (portero y registro).
const BOX = ['#9a8582', '#d5c4bc', '#e0d1c6']

const FLAKE = ['#.#.#', '.###.', '#####', '.###.', '#.#.#']
// Logo: la luna creciente con el copo que sale disparado a la derecha (columnas desde x 53, filas desde y 15).
const MOON = ['......##', '...###..', '..###...', '.####...', '.####...', '######..', '.########', '..####...']
const STAR = ['', '', '.....#..', '...#####', '...###..', '#..####', '.....#..', '']

function bitmap(g, x, y, rows, color) {
  rows.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx++) if (row[dx] === '#') dot(g, x + dx, y + dy, color)
  })
}

// Cornisa: canto claro, sombra y la albardilla de debajo, de borde a borde.
function cornice(g) {
  rect(g, 0, 1, 176, 1, METAL2)
  rect(g, 0, 2, 176, 1, DARK)
  rect(g, 2, 3, 172, 1, METAL2)
}

// Rótulo corrido: franja blanca con el copo, "COPOS" y "CONGELADOS" repetidos cada 72 px y separadores grises.
function signBand(g) {
  rect(g, 2, 4, 172, 7, '#ffffff')
  rect(g, 2, 11, 172, 1, MARBLE[3])
  rect(g, 2, 12, 172, 1, DARK)
  for (let x = 3; x < 174; x += 72) {
    bitmap(g, x, 5, FLAKE, SKY)
    drawText(g, x + 6, 5, 'COPOS', NAVY, ROUNDED_GLYPHS)
    if (x + 26 < 174) rect(g, x + 26, 4, 1, 7, METAL1)
    if (x + 29 < 174) drawText(g, x + 29, 5, 'CONGELADOS', NAVY, ROUNDED_GLYPHS)
    if (x + 69 < 174) rect(g, x + 69, 4, 1, 7, METAL1)
  }
}

// Paño de mármol: vetas en diagonal en las dos direcciones, a trozos, formando el enrejado suave de la ilustración.
// Salen de un hash fijo: la fachada se ve igual en cada visita.
function marble(g, x, y, w, h) {
  rect(g, x, y, w, h, MARBLE[2])
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      const down = (px - py + 400) % 14 === 0 && hash2(Math.floor((px + py) / 6), 1, 17) > 0.45
      const up = (px + py) % 18 === 0 && hash2(Math.floor((px - py + 400) / 6), 2, 29) > 0.55
      if (down || up) dot(g, px, py, VEIN)
      else if (hash2(px, py, 5) > 0.93) dot(g, px, py, MARBLE[1])
    }
  }
}

// Pilastras de los extremos: canto oscuro a la izquierda, mármol y un filo de luz a la derecha (la luz viene de ese lado
// en la ilustración, también en la pilastra derecha).
function pilaster(g, x) {
  marble(g, x, 13, 5, 29)
  rect(g, x, 13, 1, 29, shade(MARBLE[0], 0.55))
  rect(g, x + 4, 13, 1, 29, MARBLE[3])
}

// Puerta acristalada de aluminio con el cajón de la persiana encima, el reflejo en diagonal, el tirador y el zócalo azulado.
function door(g) {
  rect(g, 7, 13, 19, 2, DARK)
  rect(g, 7, 15, 19, 1, METAL1)
  rect(g, 7, 16, 19, 1, METAL2)
  rect(g, 7, 17, 19, 1, DARK)
  rect(g, 7, 18, 19, 1, METAL0)
  rect(g, 9, 19, 15, 3, shade(DARK, 0.7))
  rect(g, 7, 19, 2, 23, METAL2)
  rect(g, 7, 19, 1, 23, tint(METAL2, 0.3))
  rect(g, 24, 19, 1, 23, METAL1)
  rect(g, 25, 13, 1, 29, DARK)
  rect(g, 9, 22, 15, 20, shade(DARK, 0.7))
  rect(g, 11, 22, 11, 18, DOOR_GLASS)
  for (let i = 0; i < 9; i++) rect(g, 19 - i, 22 + i, 2, 1, DOOR_SHEEN)
  rect(g, 11, 40, 11, 2, DOOR_SHEEN)
  rect(g, 20, 29, 1, 5, MARBLE[3])
}

// Portero automático junto a la puerta, con la placa blanca de debajo.
function intercom(g) {
  rect(g, 27, 22, 8, 10, BOX[0])
  rect(g, 28, 22, 7, 9, BOX[2])
  rect(g, 29, 23, 5, 7, BOX[1])
  rect(g, 31, 25, 1, 2, DARK)
  rect(g, 27, 34, 7, 8, MARBLE[3])
  rect(g, 27, 41, 7, 1, MARBLE[1])
}

// Molduras horizontales del mármol: la de media altura (cortada por el logo) y la de encima del zócalo.
function bands(g) {
  ;[[35, 15], [71, 13]].forEach(([x, w]) => {
    rect(g, x, 22, w, 1, BAND[0])
    rect(g, x, 23, w, 1, BAND[1])
  })
  rect(g, 26, 32, 98, 1, BAND[0])
  rect(g, 26, 33, 98, 1, BAND[1])
}

function logo(g) {
  bitmap(g, 53, 15, MOON, BLUE)
  bitmap(g, 58, 15, STAR, BLUE)
  rect(g, 61, 20, 3, 1, SKY)
  drawText(g, 51, 24, 'COPOS', NAVY, ROUNDED_GLYPHS)
}

// Escaparate de esquinas redondeadas con dos reflejos en diagonal y su alféizar blanco.
const SHOW = { x: 85, y: 16, w: 23, h: 13 }
function showWindow(g) {
  const { x, y, w, h } = SHOW
  rect(g, x - 2, y - 2, w + 4, h + 4, '#ffffff')
  rect(g, x - 1, y - 1, w + 2, h + 2, DARK)
  rect(g, x, y, w, h, GLASS)
  ;[x - 2, x + w + 1].forEach((cx) => [y - 2, y + h + 1].forEach((cy) => dot(g, cx, cy, MARBLE[2])))
  ;[x - 1, x + w].forEach((cx) => [y - 1, y + h].forEach((cy) => dot(g, cx, cy, '#ffffff')))
  for (let row = 0; row < h; row++) {
    const col = h - 1 - row
    rect(g, x + 2 + col, y + row, 3, 1, GLASS_SHEEN)
    rect(g, x + 12 + col, y + row, 2, 1, GLASS_SHEEN)
  }
  rect(g, x - 1, y + h + 1, w + 2, 1, '#ffffff')
  rect(g, x - 1, y + h + 2, w + 2, 1, DARK)
}

// Azulejo del copo junto al escaparate.
function flakeTile(g) {
  rect(g, 109, 16, 14, 9, METAL1)
  rect(g, 110, 17, 12, 7, '#ffffff')
  bitmap(g, 114, 18, FLAKE, NAVY)
}

// Persiana enrollable: cajón arriba, lamas de cuatro filas (sombra, cuerpo, luz y brillo) y el tirador abajo.
function shutter(g, x, w, handle) {
  rect(g, x, 13, w, 2, DARK)
  rect(g, x, 15, w, 1, METAL0)
  for (let y = 16; y < 40; y += 4) {
    rect(g, x, y, w, 1, METAL2)
    rect(g, x, y + 1, w, 1, METAL1)
    rect(g, x, y + 2, w, 1, METAL1)
    rect(g, x, y + 3, w, 1, METAL0)
  }
  rect(g, x, 40, w, 2, METAL1)
  rect(g, x + handle, 41, 4, 1, PAL.earthDark)
  rect(g, x - 1, 13, 1, 29, DARK)
  rect(g, x + w, 13, 1, 29, DARK)
}

// Caja de registro a ras de suelo, con su cerradura.
function utilityBox(g) {
  rect(g, 76, 36, 5, 6, BOX[1])
  rect(g, 76, 36, 5, 1, BOX[2])
  rect(g, 80, 37, 1, 5, BOX[0])
  dot(g, 78, 38, DARK)
}

export function shopSprite() {
  const s = newSprite(COPOS_FACADE.w, COPOS_CANVAS_H)
  const { g } = s
  // Las piezas trabajan en píxeles de la fachada; el lienzo es más alto y la fachada se apoya abajo.
  g.translate(0, TOP)
  cornice(g)
  signBand(g)
  marble(g, 26, 13, 98, 29)
  marble(g, 150, 13, 4, 29)
  pilaster(g, 2)
  pilaster(g, 169)
  door(g)
  intercom(g)
  bands(g)
  logo(g)
  showWindow(g)
  flakeTile(g)
  utilityBox(g)
  shutter(g, 125, 24, 10)
  shutter(g, 155, 14, 5)
  g.setTransform(1, 0, 0, 1, 0, 0)
  s.doorCol = COPOS_DOOR_COL
  // De noche se encienden el escaparate y el cristal de la puerta.
  s.windows.push(...litPane(SHOW.x, TOP + SHOW.y, SHOW.w, SHOW.h))
  s.windows.push(...litPane(11, TOP + 22, 11, 18))
  return finish(s)
}
