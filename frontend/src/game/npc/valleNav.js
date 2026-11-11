// Caminos de los personajes del valle. La rejilla de `interior/catNav.js` cubre solo la zona por la que Lupe anda (la
// entrada y el camino hasta su casa): cubrir todo el mapa costaría más de lo que se gana, y sus paseos no salen de ahí.
// Los obstáculos son los mismos cuerpos sólidos que frenan a la viajera, así que lo que a ella le cierra el paso, a Lupe también.
import { createNav } from '../interior/catNav.js'
import { TILE } from '../world.js'

export const NAV_REGION = { x: 12 * TILE, y: 40 * TILE, width: 42 * TILE, height: 11 * TILE }

const touches = (r, b) => r.x < b.x + b.width && r.x + r.w > b.x && r.y < b.y + b.height && r.y + r.h > b.y

// `solids` son los rectángulos `{ x, y, w, h }` de esquina superior izquierda.
export function createValleNav(solids) {
  return createNav({ bounds: NAV_REGION, solids: solids.filter((s) => touches(s, NAV_REGION)), minY: NAV_REGION.y })
}
