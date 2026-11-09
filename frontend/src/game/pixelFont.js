// Letras de 3×5 píxeles para los carteles del valle. Solo están las que hacen falta; si un rótulo nuevo
// necesita otra, se añade su dibujo aquí (cada fila es una cadena de tres casillas: '#' pinta, '.' no).
import { rect } from './pixelKit.js'

const GLYPHS = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  L: ['#..', '#..', '#..', '#..', '###'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
}

const GLYPH_W = 3
const GLYPH_H = 5
const GAP = 1

// Ancho en píxeles de un texto, para poder centrarlo.
export function textWidth(text) {
  return text.length * (GLYPH_W + GAP) - GAP
}

// Pinta `text` con la esquina superior izquierda en (x, y). Los espacios y las letras sin dibujo dejan hueco.
export function drawText(g, x, y, text, color) {
  ;[...text].forEach((char, i) => {
    const rows = GLYPHS[char]
    if (!rows) return
    const left = x + i * (GLYPH_W + GAP)
    rows.forEach((row, dy) => {
      ;[...row].forEach((cell, dx) => {
        if (cell === '#') rect(g, left + dx, y + dy, 1, 1, color)
      })
    })
  })
}
