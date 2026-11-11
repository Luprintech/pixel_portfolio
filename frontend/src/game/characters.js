// Personajes con aspecto fijo (no los elige quien juega). Todos salen del generador del avatar, así
// que su hoja tiene la misma rejilla que la de la viajera: tres poses por cuatro direcciones, y se
// registra en el juego con `frameName` y `frameRect` (`avatar/sheet.js`).
import { avatarSheet } from './avatar/index.js'
import { ATREUS_LOOK } from './atreus.js'
import { GRACE_LOOK } from './grace.js'
import { LUPE_LOOK } from './lupe.js'
import { YLONEM_LOOK } from './ylonem.js'

export const CHARACTERS = { lupe: LUPE_LOOK, atreus: ATREUS_LOOK, ylonem: YLONEM_LOOK, grace: GRACE_LOOK }

export const characterSheet = (id) => avatarSheet(CHARACTERS[id])
