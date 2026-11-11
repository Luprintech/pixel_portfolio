// La visita guiada por dentro de la casa (C2): Lupe lleva a la viajera de parada en parada (entrada, impresoras, Atreus, su
// ordenador, Khalessi y cierre), espera a que se acerque, abre la conversación de cada una y sigue cuando la viajera decide. Es
// pura (sin Phaser ni React): decide a dónde anda Lupe y qué conversación toca, y devuelve la historia nueva cuando una acción
// la cambia; la escena (`InteriorLupe.js`) la dibuja y la guarda.
//
// Quién manda es la viajera: Lupe es la única que se mueve sola. Una parada solo cuenta como hecha cuando se elige una opción
// del final de su conversación (seguir, mirar con calma o dejarla); cerrarla con Esc no la da por hecha y Lupe espera donde
// está. Los sitios donde se para salen del plano de la casa y se ajustan al suelo libre de su rejilla de caminos
// (`interior/homeNav.js`), así que no hay coordenadas sueltas ni camino que atraviese un mueble.
import { NPC_PLAN, SPOTS, WALL_X, homeRoom } from '../interior/homeLayout.js'
import { completeStop, nextStop, setTour } from '../story/story.js'
import { createLupeBrain, endTalk, holdPosition, startGuide, startTalk, updateLupe } from './lupeBrain.js'

export const TOUR = {
  // A qué distancia de Lupe, ya parada en su sitio, empieza sola la conversación de la parada, y cuánto hay que alejarse para que
  // vuelva a hacerlo si se cerró con Esc.
  talkRange: 56,
  rearmRange: 90,
  // Al entrar o reanudar se deja pasar este rato antes de hablar: la sala acaba de aparecer con su fundido.
  warmupMs: 700,
  // A qué distancia se puede hablar con ella (E) para reabrir una parada, retomar la visita o preguntarle algo.
  reach: 24,
}

// Fila más alta por la que anda Lupe: deja ver las mesas de pared (la de la gata sube menos).
export const LUPE_MIN_Y = 96

const atreus = NPC_PLAN.find((npc) => npc.id === 'atreus')

// Dónde espera Lupe en cada parada, calculado a partir de los muebles de la sala; `snapSpots` lo lleva al suelo libre más
// cercano. La entrada queda a unos pasos de donde aparece la viajera para que haya que acercarse.
export function rawSpots() {
  const { spawn } = homeRoom()
  return {
    entrada: { x: spawn.x - 26, y: spawn.y - 44 },
    impresoras: { x: (SPOTS.printerA1.x + SPOTS.printerMini.x) / 2, y: SPOTS.printerA1.y + 20 },
    atreus: { x: atreus.x + 26, y: atreus.y + 12 },
    pc: { x: WALL_X.lupeDesk - 34, y: 104 },
    khalessi: { x: SPOTS.box.x - 6, y: SPOTS.box.y + 30 },
    cierre: { x: SPOTS.coffeeTable.x - 52, y: SPOTS.coffeeTable.y + 26 },
  }
}

export function snapSpots(nav) {
  return Object.fromEntries(Object.entries(rawSpots()).map(([id, point]) => [id, nav.nearestFree(point.x, point.y)]))
}

export const stopTalk = (stop) => `tour.${stop}`
export const PAUSE_TALK = 'tour.pausa'
export const AFTER_TALK = 'tour.despues'

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

// `story` da la parada por la que se sigue: si ya hay avance guardado, Lupe aparece en la entrada y echa a andar hacia ella.
export function createHomeTour({ nav, story, spots = snapSpots(nav) }) {
  const start = spots.entrada
  const brain = createLupeBrain({ nav, post: start, abandonMs: Infinity })
  brain.arrived = true
  const tour = {
    brain,
    spots,
    stop: nextStop(story),
    // leading (anda hacia la parada), arrived (espera en ella), talking, paused (la viajera la ha parado) o done.
    phase: 'arrived',
    // De qué fase salió al hablar, para volver a ella si se cierra sin elegir nada.
    before: 'arrived',
    // Qué conversación está abierta: la de una parada, la de pausa o la de después de la visita.
    kind: null,
    armed: true,
    warmup: TOUR.warmupMs,
  }
  if (!tour.stop) tour.phase = 'done'
  else if (tour.stop !== 'entrada') leadToStop(tour)
  return tour
}

// Lupe echa a andar hacia la parada que toca. Sin camino no se teletransporta: se queda donde está y presenta la parada allí.
function leadToStop(tour) {
  const ok = startGuide(tour.brain, tour.spots[tour.stop])
  tour.phase = ok ? 'leading' : 'arrived'
  tour.armed = true
  if (!ok) tour.brain.arrived = true
}

function openTalk(tour, kind, id, traveller) {
  tour.before = tour.phase
  tour.phase = 'talking'
  tour.kind = kind
  startTalk(tour.brain, traveller)
  return { type: 'talk', id }
}

// Avanza a Lupe un fotograma. Devuelve `{ type: 'talk', id }` cuando empieza sola una conversación (la viajera se ha acercado
// a la parada), o null. `locked` es que hay un diálogo o un panel abiertos: entonces no abre nada.
export function updateHomeTour(tour, dt, traveller, locked) {
  const { brain } = tour
  tour.warmup = Math.max(0, tour.warmup - dt)
  updateLupe(brain, dt, traveller)
  if (tour.phase === 'leading' && brain.arrived) tour.phase = 'arrived'
  if (tour.phase !== 'arrived') return null
  const gap = distance(brain, traveller)
  if (gap > TOUR.rearmRange) tour.armed = true
  if (!tour.armed || locked || tour.warmup > 0 || gap > TOUR.talkRange) return null
  tour.armed = false
  return openTalk(tour, 'stop', stopTalk(tour.stop), traveller)
}

// Lupe a la que se puede hablar con E: no mientras habla ya, y solo si está a mano.
export const canTalkTo = (tour, traveller) => tour.phase !== 'talking' && distance(tour.brain, traveller) <= TOUR.reach

// E ante Lupe: según lo que esté haciendo reabre su parada, pregunta si se sigue o se despide. Devuelve `{ type: 'talk', id }`.
export function talkToLupe(tour, traveller) {
  if (tour.phase === 'talking') return null
  if (tour.phase === 'arrived') return openTalk(tour, 'stop', stopTalk(tour.stop), traveller)
  if (tour.phase === 'done') return openTalk(tour, 'after', AFTER_TALK, traveller)
  return openTalk(tour, 'pause', PAUSE_TALK, traveller)
}

// El diálogo se cerró sin elegir ninguna opción (Esc o el botón de cerrar): no cambia nada de la visita, Lupe sigue como estaba y
// una parada abierta no se vuelve a ofrecer sola hasta que la viajera se aleje y regrese.
export function closeWithoutChoice(tour) {
  if (tour.phase !== 'talking') return
  tour.phase = tour.before
  tour.armed = false
  endTalk(tour.brain)
}

// Las acciones que lanzan las opciones de los diálogos de la visita (`dialogue/tourScripts.js`).
export const TOUR_ACTIONS = ['tour-next', 'tour-finish', 'tour-linger', 'tour-leave', 'tour-resume']

// Una opción de un diálogo de la visita. Devuelve la historia nueva (cambian las paradas hechas y el estado de la visita).
//  tour-next    la parada está contada: se sigue hacia la siguiente
//  tour-finish  la despedida: la última parada completa la visita
//  tour-linger  la viajera quiere mirar con calma: Lupe espera y la visita sigue abierta para retomarla
//  tour-leave   la viajera deja la visita para explorar por su cuenta: queda pendiente con lo ya visto
//  tour-resume  se retoma por la siguiente parada
export function applyTourAction(tour, action, story) {
  if (!TOUR_ACTIONS.includes(action)) {
    closeWithoutChoice(tour)
    return story
  }
  const presenting = tour.kind === 'stop'
  tour.kind = null
  if (action === 'tour-next' || action === 'tour-finish') {
    const next = completeStop(story, tour.stop)
    tour.stop = nextStop(next)
    if (tour.stop) leadToStop(tour)
    else finish(tour)
    return next
  }
  if (action === 'tour-resume') {
    tour.stop = nextStop(story)
    if (!tour.stop) {
      finish(tour)
      return story
    }
    leadToStop(tour)
    return setTour(story, 'accepted')
  }
  // Mirar con calma o dejarla: contar la parada que se estaba presentando ya la da por escuchada; una pausa a mitad de camino
  // no completa nada.
  const next = presenting ? completeStop(story, tour.stop) : story
  tour.stop = nextStop(next)
  tour.phase = 'paused'
  holdPosition(tour.brain)
  return action === 'tour-leave' && next.tour !== 'completed' ? setTour(next, 'pending') : next
}

function finish(tour) {
  tour.phase = 'done'
  holdPosition(tour.brain)
}
