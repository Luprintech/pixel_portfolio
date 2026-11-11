// Monta el aula del IES Gran Capitán en una escena de Phaser: muebles con su profundidad y sus colisiones, y la exclamación del tablón mientras
// no se haya leído. La escena (`InteriorScene.js`) la gobierna; aquí no hay lógica de movimiento ni de diálogos. Ylonem y Grace no están en
// el aula: viven fuera, junto a la puerta (`game/npc/GranNeighbours.js`).
import { buildExclamation } from '../npc/exclaim.js'
import { placeFurniture } from './homeBuilder.js'
import { GRAN_PLAN, GRAN_WALL } from './granLayout.js'

export function buildGran(scene, pastel, addSolid) {
  placeFurniture(scene, GRAN_PLAN, pastel, addSolid)
  const { notice } = GRAN_WALL
  // Sobre el suelo, justo delante del tablón: la pared del fondo no se pisa, y así se ve desde donde se entra.
  const exclamation = buildExclamation(scene, () => ({ x: notice.x + notice.w / 2, y: notice.y + notice.h + 14 }))
  return { exclamation }
}
