// Por dónde se puede andar en la casa de Lupe: la rejilla de `catNav.js` sobre los cuerpos sólidos de los muebles y de Atreus.
// La usan Khalessi (`catBrain.js`) y Lupe durante la visita guiada (`npc/homeTour.js`); cada una elige hasta qué fila sube.
// Pura (sin Phaser ni lienzo).
import { solidsOf } from './furniture/index.js'
import { ATREUS_BODY, FURNITURE_PLAN, NPC_PLAN, homeRoom } from './homeLayout.js'
import { createNav } from './catNav.js'

const atreus = NPC_PLAN.find((npc) => npc.id === 'atreus')

// Los cuerpos sólidos de la sala tal como los registra la escena: muebles y Atreus.
export const HOME_SOLIDS = [
  ...FURNITURE_PLAN.flatMap(solidsOf),
  { x: atreus.x + ATREUS_BODY.l, y: atreus.y + ATREUS_BODY.t, w: ATREUS_BODY.r - ATREUS_BODY.l, h: ATREUS_BODY.b - ATREUS_BODY.t },
]

// `minY` es la fila más alta por la que se anda (por encima solo hay muebles de pared y huecos tras ellos).
export const homeNav = (minY) => createNav({ bounds: homeRoom().bounds, solids: HOME_SOLIDS, minY })
