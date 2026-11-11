// Ajusta el ancho de un bocadillo a su línea más larga. Con `w-max` y un ancho máximo, el navegador deja la caja en el máximo
// aunque `text-wrap: balance` acorte las líneas, y queda un hueco vacío a la derecha. Norma para todos los bocadillos (el de
// Lupe en la portada y el de Atreus en la casa): el texto aprovecha todo el ancho de la caja. El primer hijo es el párrafo.
export function fitToText(bubble) {
  const paragraph = bubble.firstElementChild
  if (!paragraph) return
  bubble.style.width = ''
  const range = document.createRange()
  range.selectNodeContents(paragraph)
  // La animación de entrada escala el párrafo; se deshace para medir el ancho real.
  const scale = paragraph.getBoundingClientRect().width / paragraph.offsetWidth || 1
  const textWidth = range.getBoundingClientRect().width / scale
  const style = getComputedStyle(paragraph)
  const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
  // El píxel extra evita que un redondeo parta la última palabra a otra línea.
  const fitted = Math.ceil(textWidth + padding) + 1
  if (fitted < bubble.offsetWidth) bubble.style.width = `${fitted}px`
}

// Tiempo que un bocadillo debe seguir en pantalla para poder leerlo: un mínimo y unos milisegundos por letra.
const MIN_MS = 3200
const PER_CHAR_MS = 60
export const readingTime = (text) => Math.max(MIN_MS, 1800 + text.length * PER_CHAR_MS)
