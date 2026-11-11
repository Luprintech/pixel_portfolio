// Monta el aula del IES Gran Capitán en una escena de Phaser: muebles con su profundidad y sus colisiones, a Ylonem y a Grace, y las
// exclamaciones de lo que aún no se ha hablado o leído (el tablón y Ylonem). La escena (`InteriorScene.js`) los gobierna; aquí no hay
// lógica de movimiento ni de diálogos.
import { buildExclamation } from '../npc/exclaim.js'
import { avatarCanvas } from '../avatar/index.js'
import { characterSheet } from '../characters.js'
import { GRACE_LOOK } from '../grace.js'
import { placeFurniture } from './homeBuilder.js'
import { GRAN_PLAN, GRAN_WALL, NPC_BODY, NPC_PLAN } from './granLayout.js'
import { buildNpcSprite } from './npcSprite.js'
import { ylonemBlink, ylonemSheet } from './ylonemSheet.js'

// Hoja de cada persona del aula: Ylonem lleva su cámara; Grace es el dibujo del generador tal cual.
const SPRITES = {
  ylonem: { key: 'npc-ylonem', sheet: ylonemSheet, blink: ylonemBlink },
  grace: { key: 'npc-grace', sheet: () => characterSheet('grace'), blink: () => avatarCanvas(GRACE_LOOK, 'down', 0, true) },
}

export function buildGran(scene, pastel, addSolid) {
  placeFurniture(scene, GRAN_PLAN, pastel, addSolid)
  const { notice } = GRAN_WALL
  // Sobre el suelo, justo delante del tablón: la pared del fondo no se pisa, y así se ve desde donde se entra.
  const exclamation = buildExclamation(scene, () => ({ x: notice.x + notice.w / 2, y: notice.y + notice.h + 14 }))
  const npcs = Object.fromEntries(
    NPC_PLAN.map((plan) => [plan.id, buildNpcSprite(scene, { ...SPRITES[plan.id], plan, body: NPC_BODY }, addSolid)]),
  )
  const ylonemExclamation = buildExclamation(scene, () => ({ x: npcs.ylonem.sprite.x, y: npcs.ylonem.sprite.y - 38 }))
  return { exclamation, npcs, ylonemExclamation }
}
