// Líneas de la pantalla de carga del valle: salen una debajo de otra, escritas letra a letra como en una consola.
// Esta parte es solo el cálculo del tiempo; el dibujo y el sonido viven en `LoadingConsole.jsx` y `loadingSound.js`.

// Milisegundos por letra y pausa al terminar una línea, antes de empezar la siguiente.
export const CHAR_MS = 28
export const LINE_PAUSE_MS = 260

// Lo que se ve pasado `elapsed` ms: una lista con el texto visible de cada línea que ya ha empezado.
// Con `elapsed` infinito sale todo escrito (movimiento reducido).
export function linesAt(lines, elapsed) {
  const visible = []
  let remaining = elapsed
  for (const line of lines) {
    if (remaining < 0) break
    const typed = Math.min(line.length, Math.floor(remaining / CHAR_MS))
    visible.push(line.slice(0, typed))
    remaining -= line.length * CHAR_MS + LINE_PAUSE_MS
  }
  return visible
}

// Cuántas letras hay escritas en total: sirve para saber cuándo suena una tecla.
export const typedCount = (visible) => visible.reduce((sum, line) => sum + line.length, 0)
