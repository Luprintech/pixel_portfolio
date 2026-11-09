// Aspecto común de las tarjetas y muestras del creador: el marco cambia si está elegida.
import { PAL } from '../../game/palette'
import { tone } from '../../lib/tone'

// Borde de lo que no está elegido. Con el violeta de antes (#4b4380) tenía 1,9:1 contra la tarjeta y
// una muestra negra casi no se veía; este llega a 3,6:1, por encima del mínimo de 3:1 para el borde de un control.
export const RING = PAL.mist

// Fondo de las tarjetas con un dibujo. En modo noche, el verde del prado de las escenas, por decisión de
// Lupe; coincide o casi con diez de los colores elegibles, pero el contorno oscuro de los sprites separa
// su silueta con 3,9:1. En el tema valle es un pistacho (#b5d19a): el contorno sube a 11:1 y el verde
// deja de ser la masa más oscura de una pantalla pastel. Los colores claros (pieles, marfiles) son los
// que se acercan a este fondo; los separa el contorno.
export const TILE_BACKGROUND = tone('tile', PAL.moss)

// La cruz de las opciones "sin nada" se dibuja en un canvas, que no lee variables CSS; en el valle va en
// frambuesa honda (4,5:1 sobre el pistacho) y en modo noche en el rojo teja de siempre.
export const crossColor = (theme) => (theme === 'valle' ? '#a30f4c' : PAL.tile)

export const pickShadow = (active, ring = 5) =>
  active
    ? `0 0 0 3px ${tone('ink', PAL.ink)}, 0 0 0 6px ${tone('berry', PAL.saffron)}`
    : `0 0 0 3px ${tone('ink', PAL.ink)}, 0 0 0 ${ring}px ${RING}`

// Las opciones "sin nada" se marcan con una cruz de píxeles.
export const CROSS = [[0, 0], [4, 0], [1, 1], [3, 1], [2, 2], [1, 3], [3, 3], [0, 4], [4, 4]]
