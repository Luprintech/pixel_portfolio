// Letras de 3×5 píxeles para los carteles del valle. Solo están las que hacen falta; si un rótulo nuevo
// necesita otra, se añade su dibujo aquí (cada fila es una cadena de tres casillas: '#' pinta, '.' no).
import { rect } from './pixelKit.js'

const GLYPHS = {
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  W: ['#.#', '#.#', '###', '###', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  Q: ['.#.', '#.#', '#.#', '###', '.##'],
  M: ['#.#', '###', '###', '#.#', '#.#'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  J: ['..#', '..#', '..#', '#.#', '.#.'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  G: ['.##', '#..', '#.#', '#.#', '.##'],
  0: ['###', '#.#', '#.#', '#.#', '###'],
  1: ['.#.', '##.', '.#.', '.#.', '###'],
  2: ['###', '..#', '###', '#..', '###'],
  3: ['###', '..#', '###', '..#', '###'],
  4: ['#.#', '#.#', '###', '..#', '..#'],
  5: ['###', '#..', '###', '..#', '###'],
  6: ['###', '#..', '###', '#.#', '###'],
  7: ['###', '..#', '.#.', '.#.', '.#.'],
  8: ['###', '#.#', '###', '#.#', '###'],
  9: ['###', '#.#', '###', '..#', '###'],
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  L: ['#..', '#..', '#..', '#..', '###'],
  N: ['#.#', '###', '###', '###', '#.#'],
  O: ['###', '#.#', '#.#', '#.#', '###'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Z: ['###', '..#', '.#.', '#..', '###'],
}

// Letras de 3×4 para rótulos pequeños (el logotipo de las impresoras): minúsculas y las pocas mayúsculas que hacen falta.
const SMALL_GLYPHS = {
  b: ['#..', '##.', '#.#', '##.'],
  a: ['.##', '#.#', '#.#', '.##'],
  m: ['###', '###', '#.#', '#.#'],
  u: ['#.#', '#.#', '#.#', '.##'],
  A: ['.#.', '#.#', '###', '#.#'],
  1: ['.#.', '##.', '.#.', '###'],
}

const GLYPH_W = 3
const GLYPH_H = 5
const GAP = 1

// Ancho en píxeles de un texto, para poder centrarlo.
export function textWidth(text) {
  return text.length * (GLYPH_W + GAP) - GAP
}

// Píxeles de un texto relativos a su esquina, con el índice de su letra (para pintar, delinear o dar brillo por letras).
export function textPixels(text, glyphs = GLYPHS) {
  const pixels = []
  ;[...text].forEach((char, index) => {
    const rows = glyphs[char]
    if (!rows) return
    rows.forEach((row, y) => {
      ;[...row].forEach((cell, dx) => {
        if (cell === '#') pixels.push({ x: index * (GLYPH_W + GAP) + dx, y, index })
      })
    })
  })
  return pixels
}

// Pinta `text` con la esquina superior izquierda en (x, y). Los espacios y las letras sin dibujo dejan hueco.
export function drawText(g, x, y, text, color, glyphs = GLYPHS) {
  textPixels(text, glyphs).forEach((pixel) => rect(g, x + pixel.x, y + pixel.y, 1, 1, color))
}

export const drawSmallText = (g, x, y, text, color) => drawText(g, x, y, text, color, SMALL_GLYPHS)
