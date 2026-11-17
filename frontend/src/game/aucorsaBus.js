// Autobús verde de Aucorsa, aparcado en la explanada de RACE junto a la grúa. Sale de la ilustración de la usuaria reducida con
// vecino más cercano a 120×43 (ver `pngAssets.js`), con el frontal a la izquierda; a esa escala el logo no se leía y se redibujó
// "AUCORSA" con la letra de 3×5 y el emblema hexagonal.
import { makeCanvas } from './pixelKit.js'
import { drawPng } from './pngAssets.js'

const WIDTH = 120
const HEIGHT = 43

// Cuerpo sólido: la carrocería en una franja baja junto a las ruedas, de parachoques a parachoques. Se puede pasar por detrás
// (la viajera queda tapada) y por delante, con el orden de dibujo por la base.
export const AUCORSA_BUS_BODY = [{ l: -58, t: -14, r: 58, b: -2 }]

export function aucorsaBus() {
  const canvas = makeCanvas(WIDTH, HEIGHT)
  drawPng(canvas.getContext('2d'), 'aucorsaBus')
  return { canvas, body: AUCORSA_BUS_BODY, painted: true }
}
