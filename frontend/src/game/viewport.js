// Zoom de la cámara para que el mundo llene cualquier pantalla. Sin dependencias de Phaser.

// Lado corto de la pantalla, en píxeles de mundo, que se quiere ver como mínimo: da unas
// 3 o 4 pantallas de ancho en móvil y unas 25 teselas de alto en escritorio.
const TARGET_SHORT_SIDE = 220

// El zoom es siempre entero: con valores fraccionarios el pixel art se ve con costuras.
// Nunca baja de lo necesario para que la vista quepa en el mapa, así no se asoma el vacío.
export function cameraZoom(width, height, worldWidth, worldHeight) {
  const byTarget = Math.round(Math.min(width, height) / TARGET_SHORT_SIDE)
  const byWorld = Math.max(Math.ceil(width / worldWidth), Math.ceil(height / worldHeight))
  return Math.max(1, byTarget, byWorld)
}
