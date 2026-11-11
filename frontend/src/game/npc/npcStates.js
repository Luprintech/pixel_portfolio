// Estados de un personaje no jugable y las transiciones permitidas entre ellos. Es lo común a cualquier NPC: cada uno
// añade su propio cerebro (ver `lupeBrain.js`) pero todos hablan el mismo vocabulario, y una transición no permitida
// se ignora en lugar de dejar al personaje en un estado imposible. Sin Phaser ni React.
//
//  idle     está en su sitio, con sus gestos naturales
//  talking  habla con la viajera y la mira
//  guiding  la lleva a un destino concreto
//  waiting  se ha parado a esperar a una viajera que se retrasa
//  routine  hace sus cosas, sin depender de nadie
export const NPC_STATES = ['idle', 'talking', 'guiding', 'waiting', 'routine']

const ALLOWED = {
  idle: ['talking', 'guiding', 'routine'],
  routine: ['idle', 'talking', 'guiding'],
  talking: ['idle', 'guiding', 'routine'],
  guiding: ['waiting', 'talking', 'idle', 'routine'],
  waiting: ['guiding', 'talking', 'idle', 'routine'],
}

export const canGo = (from, to) => from === to || Boolean(ALLOWED[from]?.includes(to))

// Estado siguiente: el pedido si se puede, y si no, el actual.
export const go = (from, to) => (canGo(from, to) ? to : from)

// Un NPC solo acompaña a la viajera en estos estados: fuera de ellos, anda por su cuenta o está quieto.
export const isAccompanying = (state) => state === 'guiding' || state === 'waiting'
