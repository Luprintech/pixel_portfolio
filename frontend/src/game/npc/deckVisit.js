// La visita de Lupe a la azotea: la primera vez que la viajera sube, Lupe aparece junto al telescopio, le cuenta lo suyo
// (`cielo.telescopio`) y, al terminar, se va. Es una pequeña máquina de fases sin Phaser, para probarla entera:
//   away → here (aparece y espera un momento) → talking (la conversación y la vista del cielo están abiertas)
//        → leaving (se desvanece) → away
// Si la viajera baja antes de que empiece a hablar, la visita se cancela y volverá a darse la próxima vez que suba.
export const CONVERSATION = 'cielo.telescopio'

export const VISIT_TUNING = {
  // Aparece con un fundido, y la conversación se abre un instante después, con la viajera ya situada.
  fadeInMs: 500,
  talkAfterMs: 1100,
  fadeOutMs: 700,
  // Tope de espera a que la página bloquee el juego tras pedir la conversación: si no llega, se da por perdida.
  lockWaitMs: 1500,
}

export const createVisit = () => ({ phase: 'away', t: 0, locked: false })

// Toca la visita si la viajera no la ha vivido ya y Lupe no está ocupada guiándola por el valle.
export const visitDue = (story) => story.tour !== 'accepted' && !story.heard.includes(CONVERSATION)

export function startVisit(visit) {
  visit.phase = 'here'
  visit.t = 0
  visit.locked = false
}

// La conversación empieza (sola o porque la viajera pulsó E ante el telescopio): desde aquí se espera a que se cierre.
export function beginTalk(visit) {
  visit.phase = 'talking'
  visit.t = 0
  visit.locked = false
}

export const isVisiting = (visit) => visit.phase === 'here' || visit.phase === 'talking'

// Opacidad de Lupe en cada fase.
export function visitAlpha(visit) {
  if (visit.phase === 'here') return Math.min(1, visit.t / VISIT_TUNING.fadeInMs)
  if (visit.phase === 'leaving') return Math.max(0, 1 - visit.t / VISIT_TUNING.fadeOutMs)
  return visit.phase === 'talking' ? 1 : 0
}

// Avanza `dt` ms. `onDeck` es si la viajera sigue en la cubierta y `locked`, si hay un diálogo o un panel abiertos. Devuelve
// qué debe hacer quien la lleva: 'talk' (abrir la conversación) o 'gone' (retirar a Lupe), o null.
export function stepVisit(visit, dt, { onDeck, locked }) {
  if (visit.phase === 'away') return null
  visit.t += dt
  if (visit.phase === 'leaving') {
    if (visit.t < VISIT_TUNING.fadeOutMs) return null
    visit.phase = 'away'
    return 'gone'
  }
  if (!onDeck && visit.phase === 'here') {
    visit.phase = 'away'
    return 'gone'
  }
  if (visit.phase === 'here') {
    if (visit.t < VISIT_TUNING.talkAfterMs || locked) return null
    beginTalk(visit)
    return 'talk'
  }
  // Hablando: se espera a que la conversación (y la vista del cielo, si la viajera la abre) se cierre del todo.
  if (locked) visit.locked = true
  else if (visit.locked || visit.t > VISIT_TUNING.lockWaitMs) {
    visit.phase = 'leaving'
    visit.t = 0
  }
  return null
}
