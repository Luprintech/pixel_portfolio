// Lo que el valle sabe de quien lo visita: si ha puesto nombre (a ella y a su mascota) y qué mascota trae. Sin React ni Phaser.
// El creador lo usa para no dejar entrar sin nombre; los diálogos, para que Lupe se dirija a ella y salude a su mascota.
import { sanitizeName } from './save.js'

// Qué falta por rellenar. Un nombre de solo símbolos cuenta como vacío: el guardado lo dejaría en blanco.
export function missingNames({ name, pet, petName }) {
  return { name: !sanitizeName(name), petName: pet.kind !== 'ninguna' && !sanitizeName(petName) }
}

export const isReadyToEnter = (player) => {
  const missing = missingNames(player)
  return !missing.name && !missing.petName
}

// Funciones de diálogo que dependen de la mascota (páginas con `when`, ver `game/dialogue/engine.js`). Sin nombre de mascota no se
// ofrece: Lupe no puede preguntar «¿se llama...?» sin saberlo (una partida antigua con mascota pero sin nombre).
export function playerFeatures({ pet, petName }) {
  const named = !!sanitizeName(petName)
  return { petDog: pet.kind === 'perro' && named, petCat: pet.kind === 'gato' && named }
}
