// Zoom de la cámara para que el mundo llene cualquier pantalla. Sin dependencias de Phaser.

// Lado corto de la pantalla, en píxeles de mundo, que se quiere ver como mínimo: da unas
// 3 o 4 pantallas de ancho en móvil y unas 25 teselas de alto en escritorio.
const TARGET_SHORT_SIDE = 220

// Cuánto se puede acercar la vista, a partir del zoom que da la pantalla, con el botón +.
const MAX_STEPS_IN = 3

// Zoom mínimo para que la vista quepa en el mapa: por debajo se asomaría el vacío.
function minZoom(width, height, worldWidth, worldHeight) {
  return Math.max(1, Math.ceil(width / worldWidth), Math.ceil(height / worldHeight))
}

// El zoom es siempre entero: con valores fraccionarios el pixel art se ve con costuras.
export function cameraZoom(width, height, worldWidth, worldHeight) {
  const byTarget = Math.round(Math.min(width, height) / TARGET_SHORT_SIDE)
  return Math.max(byTarget, minZoom(width, height, worldWidth, worldHeight))
}

// Zoom que se muestra tras `steps` pulsaciones de + (positivas) o - (negativas) sobre el de la pantalla, y los
// límites en los que se queda. En un móvil vertical el mínimo coincide con el de partida: no se puede alejar.
export function steppedZoom(steps, width, height, worldWidth, worldHeight) {
  const base = cameraZoom(width, height, worldWidth, worldHeight)
  const min = minZoom(width, height, worldWidth, worldHeight)
  const max = base + MAX_STEPS_IN
  const zoom = Math.min(max, Math.max(min, base + steps))
  return { zoom, steps: zoom - base, canIn: zoom < max, canOut: zoom > min }
}
