// Aspecto común de las tarjetas y muestras del creador: el marco cambia si está elegida.
import { PAL } from '../../game/palette'

// Borde de lo que no está elegido. Con el violeta de antes (#4b4380) tenía 1,9:1 contra la tarjeta y
// una muestra negra casi no se veía; este llega a 3,6:1, por encima del mínimo de 3:1 para el borde de un control.
export const RING = PAL.mist

// Fondo de las tarjetas con un dibujo: el verde del prado, el mismo de las escenas, por decisión de
// Lupe. Coincide o casi con diez de los colores elegibles (los tres verdes, con 1,00:1), pero los
// sprites llevan contorno oscuro y su silueta se separa con 3,9:1 sobre este tono.
export const TILE_BACKGROUND = PAL.moss

export const pickShadow = (active, ring = 5) =>
  active ? `0 0 0 3px ${PAL.ink}, 0 0 0 6px ${PAL.saffron}` : `0 0 0 3px ${PAL.ink}, 0 0 0 ${ring}px ${RING}`

// Las opciones "sin nada" se marcan con una cruz de píxeles.
export const CROSS = [[0, 0], [4, 0], [1, 1], [3, 1], [2, 2], [1, 3], [3, 3], [0, 4], [4, 4]]
