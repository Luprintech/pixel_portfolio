// Detalles de la fachada de la casa de Lupe: alféizares, puerta con su marco y escalón, placa, macetas, enredadera
// y el móvil de luna y estrella bajo el tejadillo. Cada pieza se dibuja sola y no sabe dónde va: `homes.js` las coloca.
import { PAL, TONE, shade, tint } from '../palette.js'
import { dot, ellipse, rect } from '../pixelKit.js'
import { drawText, textWidth } from '../pixelFont.js'
import { STONE0, STONE1, STONE2, WOOD0, WOOD1, WOOD2, WOOD3, doorAt } from './shared.js'

// Alféizar continuo de piedra: una repisa de tres filas (luz arriba, sombra propia abajo), sin nada más debajo: una
// sombra translúcida aquí se leía como una raya de color sobre la pared. `y` es la primera fila bajo el marco y `x`/`w` el ancho que cubre, con voladizo incluido.
export function sillLedge(g, x, y, w) {
  rect(g, x, y, w, 1, tint(STONE2, 0.2))
  rect(g, x, y + 1, w, 1, STONE2)
  rect(g, x, y + 2, w, 1, STONE1)
  // Los extremos pierden una esquina para que la repisa no sea un bloque recto.
  rect(g, x, y + 2, 1, 1, STONE0)
  rect(g, x + w - 1, y + 2, 1, 1, STONE0)
}

// Puerta ámbar con jambas de madera, pomo oscuro (sobre el ámbar se lee) y un escalón de piedra más ancho que la
// puerta. Devuelve la columna central, que `ValleScene` usa para alinear la tesela de la puerta.
export function houseDoor(sprite, x, bottom, { w, h }) {
  const { g } = sprite
  const top = bottom - h
  rect(g, x - 2, top - 2, 2, h + 2, WOOD2)
  rect(g, x - 2, top - 2, 1, h + 2, WOOD3)
  rect(g, x + w, top - 2, 2, h + 2, WOOD1)
  rect(g, x, top - 2, w, 2, WOOD1)
  const col = doorAt(sprite, x, bottom, { w, h, glow: true, step: false })
  rect(g, x + w - 5, top + 12, 3, 3, WOOD0)
  dot(g, x + w - 4, top + 13, tint(PAL.saffronLight, 0.4))
  // Escalón: cara superior clara, contrahuella y sombra. Las puntas de arriba se recortan.
  rect(g, x - 3, bottom, w + 6, 1, STONE2)
  rect(g, x - 4, bottom + 1, w + 8, 1, STONE1)
  rect(g, x - 4, bottom + 2, w + 8, 1, STONE0)
  dot(g, x + Math.floor(w / 2), bottom + 1, STONE0)
  return col
}

// Placa de madera con el nombre de la casa, colgada de dos clavos.
export function lupePlaque(g, x, y) {
  const label = 'LUPE'
  const w = textWidth(label) + 4
  rect(g, x, y, w, 9, WOOD2)
  rect(g, x, y, w, 1, WOOD3)
  rect(g, x, y + 8, w, 1, WOOD0)
  rect(g, x, y, 1, 9, WOOD3)
  rect(g, x + w - 1, y, 1, 9, WOOD1)
  rect(g, x + 1, y + 1, w - 2, 7, shade(WOOD2, 0.86))
  drawText(g, x + 2, y + 2, label, PAL.saffronLight)
  dot(g, x + 1, y + 1, WOOD0)
  dot(g, x + w - 2, y + 1, WOOD0)
  return w
}

// Maceta baja con arbusto y flores de varios colores.
export function flowerPot(g, x, y) {
  ellipse(g, x + 5, y + 3, 6, 3, TONE.grass[1])
  ellipse(g, x + 4, y + 2, 3, 2, TONE.grass[2])
  ;[[1, 1, PAL.rose], [4, 0, '#f6f0e0'], [7, 1, PAL.saffron], [9, 3, PAL.rose], [3, 3, '#b8a2e0']].forEach(([dx, dy, color]) => dot(g, x + dx, y + dy, color))
  clayPot(g, x, y + 5, '#d9703a', '#c4572a', '#e08a52')
}

// Maceta alta con hojas largas que se abren desde el centro.
export function tallPlant(g, x, y) {
  const blades = [[1, 5, 0], [2, 8, -1], [3, 11, -1], [4, 9, 0], [5, 12, 0], [6, 10, 1], [7, 8, 1], [8, 6, 1]]
  blades.forEach(([dx, height, lean]) => {
    for (let i = 0; i < height; i++) {
      const bend = i > height - 3 ? lean : 0
      rect(g, x + dx + bend, y + 5 - i, 1, 1, i % 4 === 3 ? TONE.grass[3] : TONE.grass[dx % 2 ? 1 : 2])
    }
  })
  clayPot(g, x, y + 5, '#8aa0b8', '#6d849c', '#a9bdd0')
}

function clayPot(g, x, y, rim, body, light) {
  rect(g, x, y, 10, 2, rim)
  rect(g, x + 1, y + 2, 8, 4, body)
  rect(g, x + 1, y + 2, 2, 4, light)
  rect(g, x + 1, y + 5, 8, 1, shade(body, 0.8))
}

// Enredadera discreta en una esquina: un tallo que sube en zigzag con hojas alternas y tres florecillas.
export function vine(g, x, y, h) {
  for (let i = 0; i < h; i++) {
    const bend = Math.round(Math.sin(i / 5) * 1.5)
    dot(g, x + bend, y + i, TONE.grass[0])
  }
  for (let i = 3; i < h; i += 5) {
    const bend = Math.round(Math.sin(i / 5) * 1.5)
    const side = (i / 5) % 2 === 0 ? -1 : 1
    const lx = x + bend + (side < 0 ? -2 : 1)
    rect(g, lx, y + i, 2, 2, TONE.grass[1])
    dot(g, lx + (side < 0 ? 0 : 1), y + i, TONE.grass[3])
    if (i % 15 === 3) dot(g, lx + (side < 0 ? -1 : 2), y + i + 1, '#f4b8cc')
  }
}

// Móvil bajo el tejadillo: media luna y estrella colgadas de un hilo, hermanas del telescopio de la cubierta.
// `x` es el centro; `top` la fila donde cuelgan los hilos (justo bajo el borde del tejadillo).
export function starMobile(g, x, top) {
  const outline = shade(PAL.saffron, 0.55)
  const crescent = ['.###', '##..', '##..', '##..', '.###']
  const star = [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]]
  // Hilos de la luna (sobre su pico) y de la estrella (sobre su centro).
  rect(g, x - 3, top, 1, 1, WOOD0)
  rect(g, x + 3, top, 1, 2, WOOD0)
  // Cada figura se pinta dos veces: la sombra oscura un píxel abajo a la derecha da contorno sobre la pared clara.
  ;[[1, outline], [0, null]].forEach(([shadow, flat]) => {
    crescent.forEach((row, dy) => {
      ;[...row].forEach((cell, dx) => {
        if (cell === '#') dot(g, x - 5 + dx + shadow, top + 1 + dy + shadow, flat ?? (dx === 0 || dy === 0 ? PAL.saffronLight : PAL.saffron))
      })
    })
    star.forEach(([dx, dy]) => dot(g, x + 2 + dx + shadow, top + 2 + dy + shadow, flat ?? PAL.saffronLight))
  })
}
