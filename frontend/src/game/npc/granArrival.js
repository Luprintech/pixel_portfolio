// La llegada de Lupe al IES Gran Capitán: la primera vez que la viajera se acerca a la puerta, Lupe aparece con un fundido, anda hasta
// Ylonem y Grace y, cuando la viajera está al lado, los presenta (`gran.llegada`); al terminar se desvanece. Es una máquina de fases sin
// Phaser, como `deckVisit.js`, para probarla entera:
//   away → walking (aparece y anda) → waiting (espera a la viajera) → talking (la conversación está abierta) → leaving (se desvanece) → away
// Si la viajera se aleja demasiado antes de hablar, se cancela y vuelve a darse cuando regrese.
export const ARRIVAL_TUNING = {
  fadeInMs: 600,
  fadeOutMs: 700,
  // A qué distancia de Lupe empieza sola la conversación.
  talkRange: 64,
  // Tope de espera a que la página bloquee el juego tras pedir la conversación: si no llega, se da por perdida.
  lockWaitMs: 1500,
}

export const createArrival = () => ({ phase: 'away', t: 0, locked: false })

export const isArriving = (arrival) => arrival.phase !== 'away'

// Opacidad de Lupe en cada fase.
export function arrivalAlpha(arrival) {
  if (arrival.phase === 'walking') return Math.min(1, arrival.t / ARRIVAL_TUNING.fadeInMs)
  if (arrival.phase === 'leaving') return Math.max(0, 1 - arrival.t / ARRIVAL_TUNING.fadeOutMs)
  return arrival.phase === 'away' ? 0 : 1
}

// Avanza `dt` ms. `due` es que toca la llegada, `near` que la viajera está cerca de la puerta, `far` que se ha ido lejos, `arrived` que Lupe
// ya está con ellos, `gap` lo que la separa de la viajera y `locked` que hay un diálogo o un panel abiertos. Devuelve qué debe hacer quien la
// lleva: 'start' (sacar a Lupe), 'talk' (abrir la conversación), 'gone' (cancelada) o 'done' (terminada), o null.
export function stepArrival(arrival, dt, { due, near, far, arrived, gap, locked }) {
  const { phase } = arrival
  if (phase === 'away') {
    if (!due || !near || locked) return null
    Object.assign(arrival, { phase: 'walking', t: 0, locked: false })
    return 'start'
  }
  arrival.t += dt
  if (phase === 'leaving') {
    if (arrival.t < ARRIVAL_TUNING.fadeOutMs) return null
    arrival.phase = 'away'
    return 'done'
  }
  if (phase === 'talking') {
    if (locked) arrival.locked = true
    else if (arrival.locked || arrival.t > ARRIVAL_TUNING.lockWaitMs) Object.assign(arrival, { phase: 'leaving', t: 0 })
    return null
  }
  if (far) {
    arrival.phase = 'away'
    return 'gone'
  }
  if (phase === 'walking' && arrived) arrival.phase = 'waiting'
  if (arrival.phase === 'waiting' && gap < ARRIVAL_TUNING.talkRange && !locked) {
    Object.assign(arrival, { phase: 'talking', t: 0, locked: false })
    return 'talk'
  }
  return null
}
