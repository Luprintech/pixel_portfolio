// Grúa de RACE aparcada ante su garaje. A diferencia del resto de objetos no se pinta con código: sale de un PNG a la
// resolución del juego (81×39, ver `pngAssets.js`), redibujado a partir de la ilustración de la usuaria porque reducida
// tal cual el logo y el rótulo se volvían una mancha. Mira al oeste, como la grúa procedural a la que sustituye, y el
// rótulo de la caja se dibujó ya al derecho para que no salga en espejo.
import { makeCanvas } from './pixelKit.js'
import { drawPng } from './pngAssets.js'

const WIDTH = 81
const HEIGHT = 39

// Cuerpo sólido: la carrocería del parachoques delantero al trasero, en una franja baja junto a las ruedas. Así la viajera
// choca con el coche pero puede pasar por detrás (con la cabeza asomando por encima del techo) y por delante, y el orden
// de dibujo por la base hace el resto. La horquilla del enganche queda fuera: va en alto, sobre la caja.
export const TOW_TRUCK_BODY = [{ l: -39, t: -16, r: 36, b: -2 }]

export function towTruck() {
  const canvas = makeCanvas(WIDTH, HEIGHT)
  drawPng(canvas.getContext('2d'), 'towTruck')
  return { canvas, body: TOW_TRUCK_BODY, painted: true }
}
