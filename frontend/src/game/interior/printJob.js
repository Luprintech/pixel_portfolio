// El trabajo de impresión de la A1 mini. Corre por reloj y no por el panel: el panel solo lo lanza y se cierra, y la
// impresión se ve en la propia máquina de la sala, capa a capa. El estado es un objeto pequeño (`{ state, startedAt }`)
// que guarda la escena en el registro del juego, así sigue aunque la viajera salga de la casa. Sin Phaser ni React.

// Lo que tarda en imprimirse la figura (la real tardaría horas; esto es un juego): ocho tandas de unos dos segundos y medio.
export const PRINT_MS = 20000
// Lo que dura el «Preparando impresión…» del panel antes de cerrarse.
export const PREPARE_MS = 1800

export const idleJob = () => ({ state: 'idle', startedAt: 0 })
export const startJob = (now) => ({ state: 'printing', startedAt: now })

// El trabajo tal como está en `now`: una impresión cuyo tiempo se ha cumplido pasa a «terminada». Si no cambia nada devuelve
// el mismo objeto, así quien lo guarda puede saber si hay algo que escribir.
export function jobAt(job, now) {
  if (job.state === 'printing' && now - job.startedAt >= PRINT_MS) return { state: 'done', startedAt: job.startedAt }
  return job
}

// Avance de 0 a 1.
export function progressOf(job, now) {
  if (job.state === 'done') return 1
  if (job.state !== 'printing') return 0
  return Math.min(1, Math.max(0, (now - job.startedAt) / PRINT_MS))
}

// Estado de la impresora para quien la usa: `idle` (lista, aún sin premio), `printing`, `completed` (terminada y sin
// recoger) y `reward_given` (en reposo con el premio ya entregado: solo ofrece reimprimir). El premio es aparte del trabajo
// y no se pierde al reimprimir.
export function printerState(job, now, rewardGiven) {
  const { state } = jobAt(job, now)
  if (state === 'printing') return 'printing'
  if (state === 'done') return 'completed'
  return rewardGiven ? 'reward_given' : 'idle'
}

// Al recoger la figura la impresora vuelve a reposo, y el premio se entrega solo si aún no se había entregado.
export const collectOutcome = (rewardGiven) => ({ job: idleJob(), reward: !rewardGiven })

// Qué enseñar en la impresora: reposo, una tanda de la impresión (de 0 a `stages - 1`) o la figura terminada.
export function printView(job, now, stages) {
  const current = jobAt(job, now)
  if (current.state === 'done') return { kind: 'done', stage: stages - 1 }
  if (current.state === 'printing') return { kind: 'printing', stage: Math.min(stages - 1, Math.floor(progressOf(current, now) * stages)) }
  return { kind: 'idle', stage: 0 }
}
