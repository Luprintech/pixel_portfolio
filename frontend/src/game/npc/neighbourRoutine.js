// Rutina de un vecino del IES (Ylonem o Grace): una lista de pasos que repite, cada uno con un sitio al que ir y algo que hacer allí un rato
// (descansar, sentarse a dar de comer a las palomas, grabar un rincón). Es una pequeña máquina de fases sin Phaser, como `deckVisit.js`, para
// probarla entera; quien la lleva (`GranNeighbours.js`) pone al personaje a andar y dibuja lo que hace:
//   pause (espera un poco) → walking (anda al sitio del paso) → doing (lo hace durante `ms`) → pause …
// Una conversación con la viajera congela los tiempos (`busy`): no se levanta ni se va a mitad de una frase.

const between = (range, rng) => range[0] + rng() * (range[1] - range[0])

// Cuánto espera entre un paso y el siguiente.
export const PAUSE_MS = [2000, 5000]
// Si un paso no tiene camino, lo salta y espera algo más antes del siguiente.
export const SKIP_MS = 4000

export function createRoutine(steps, rng = Math.random, firstWait = 1500) {
  return { steps, rng, index: -1, step: null, phase: 'pause', wait: firstWait, left: 0 }
}

// Avanza `dt` ms. `busy` es que está hablando con la viajera y `walking` que aún le queda camino. Devuelve qué debe hacer quien la lleva:
// { type: 'go', step } (echar a andar), { type: 'begin', step } (llegó: empieza a hacerlo) o { type: 'end', step } (terminó), o null.
export function stepRoutine(routine, dt, { busy = false, walking = false } = {}) {
  if (routine.phase === 'walking') {
    if (walking) return null
    routine.phase = 'doing'
    routine.left = between(routine.step.ms, routine.rng)
    return { type: 'begin', step: routine.step }
  }
  if (busy) return null
  if (routine.phase === 'doing') {
    routine.left -= dt
    if (routine.left > 0) return null
    routine.phase = 'pause'
    routine.wait = between(PAUSE_MS, routine.rng)
    return { type: 'end', step: routine.step }
  }
  routine.wait -= dt
  if (routine.wait > 0) return null
  routine.index = (routine.index + 1) % routine.steps.length
  routine.step = routine.steps[routine.index]
  routine.phase = 'walking'
  return { type: 'go', step: routine.step }
}

// El paso que acaba de empezar no tiene camino hasta su sitio: se salta.
export function skipStep(routine) {
  routine.phase = 'pause'
  routine.wait = SKIP_MS
}

// Qué está haciendo ahora, o null si anda o espera (para elegir entre su conversación habitual y la que va con lo que hace).
export const doingNow = (routine) => (routine.phase === 'doing' ? routine.step : null)
