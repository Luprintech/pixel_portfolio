// Rejilla de la figura y pincel para pintar en ella. La figura mide 16 columnas por 28 filas y la
// cabeza empieza en la fila 0; encima hay cuatro filas libres (de y negativa) para moños, coletas
// altas y pompones. Todas las partes usan estas coordenadas sin conocer el lienzo.

export const COLS = 16
export const FIGURE_ROWS = 28
export const MARGIN = 4
export const ROWS = MARGIN + FIGURE_ROWS
export const EMPTY = '.'

export const createGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY))

// `dy` baja todo lo que se pinta con este pincel: así el cuerpo entero se hunde un píxel al dar un
// paso mientras las piernas se quedan en el suelo.
export function painter(grid, dy = 0) {
  const put = (x, y, ch) => {
    const row = y + dy + MARGIN
    if (row >= 0 && row < ROWS && x >= 0 && x < COLS) grid[row][x] = ch
  }

  // Una fila entre dos columnas; `left` y `right` sustituyen a la letra en los extremos.
  const span = (y, a, b, ch, left, right) => {
    for (let x = a; x <= b; x++) put(x, y, x === a && left ? left : x === b && right ? right : ch)
  }

  const rect = (x0, y0, x1, y1, ch) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, ch)
  }

  // Filas de texto de 16 caracteres; '.' deja pasar lo que hay debajo.
  const rows = (y, list) => list.forEach((row, i) => [...row].forEach((ch, x) => ch !== EMPTY && put(x, y + i, ch)))

  const cells = (list) => list.forEach(({ x, y, ch }) => put(x, y, ch))

  return { put, span, rect, rows, cells }
}
