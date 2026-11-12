// Qué da cada juego de la recreativa al llegar a ciertos hitos. Cada recompensa tiene un identificador y se entrega una sola vez
// por partida guardada (ver `wallet.js`), así que repetir un juego no regala nada que ya se haya dado: el progreso paga, la
// insistencia no. Las recompensas se deciden a partir de los sucesos que devuelve el `step` de cada juego. Sin Phaser ni React.
import { SECTIONS } from './river/level.js'

// Monedas de cada recompensa. El resto de la recreativa (pesca incluida) puede añadir las suyas con su propio identificador.
export const REWARDS = {
  'dungeon.puerta': 1,
  'dungeon.acertijo': 1,
  'dungeon.jefe': 2,
  'galactic.oleada3': 1,
  'galactic.oleada5': 1,
  'galactic.nodo': 2,
  'river.puentes': 1,
  'river.puentes-todos': 1,
  'river.aterrizaje': 2,
}

// Recompensa que corresponde a un suceso de un juego, o null. `event` es uno de los que devuelve `step`.
export function rewardFor(gameId, event) {
  if (gameId === 'dungeon') {
    if (event.type === 'door') return 'dungeon.puerta'
    if (event.type === 'gate') return 'dungeon.acertijo'
    if (event.type === 'win') return 'dungeon.jefe'
  } else if (gameId === 'galactic') {
    if (event.type === 'wave' && event.wave === 3) return 'galactic.oleada3'
    if (event.type === 'wave' && event.wave === 5) return 'galactic.oleada5'
    if (event.type === 'win') return 'galactic.nodo'
  } else if (gameId === 'river') {
    if (event.type === 'checkpoint' && event.bridges === 3) return 'river.puentes'
    if (event.type === 'checkpoint' && event.bridges === SECTIONS) return 'river.puentes-todos'
    if (event.type === 'win') return 'river.aterrizaje'
  }
  return null
}

export const rewardCoins = (id) => REWARDS[id] ?? 0
