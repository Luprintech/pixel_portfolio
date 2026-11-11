// Zoom de la cámara para que el mundo llene cualquier pantalla. Sin dependencias de Phaser.

// Lado corto de la pantalla, en píxeles de mundo, que se quiere ver como mínimo: da unas
// 3 o 4 pantallas de ancho en móvil y unas 25 teselas de alto en escritorio.
const TARGET_SHORT_SIDE = 220

// Zoom con el que una sala llena toda la pantalla, sin franjas vacías: el mayor de los dos ajustes (ancho y alto), subido
// al siguiente cuarto de punto para que el relleno sea completo. Lo que no cabe en el eje más corto se recorre con la
// cámara (que sigue a la viajera dentro de los límites de la sala), igual que el valle. Nunca baja de 1.
export function roomCover(width, height, roomWidth, roomHeight) {
  return Math.max(1, Math.ceil(Math.max(width / roomWidth, height / roomHeight) * 4) / 4)
}

// Zoom de una sala tras `steps` pulsaciones de + (positivas) o - (negativas) sobre el que la llena (`roomCover`). Alejar llega
// como mucho a ver la sala entera (con franjas a los lados si la pantalla es más ancha o más alta que ella); acercar, tres
// niveles. Cada nivel es una cuarta parte más, redondeada al cuarto de punto como el zoom base.
const ROOM_STEP = 1.25
const ROOM_MAX_IN = 3
export function steppedRoomZoom(steps, width, height, roomWidth, roomHeight) {
  const cover = roomCover(width, height, roomWidth, roomHeight)
  const contain = Math.max(1, Math.min(width / roomWidth, height / roomHeight))
  const min = Math.min(0, Math.ceil(Math.log(contain / cover) / Math.log(ROOM_STEP)))
  const level = Math.min(ROOM_MAX_IN, Math.max(min, steps))
  return { zoom: Math.round(cover * ROOM_STEP ** level * 4) / 4, steps: level, canIn: level < ROOM_MAX_IN, canOut: level > min }
}

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
