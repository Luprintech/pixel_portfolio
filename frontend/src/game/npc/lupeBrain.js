// Cerebro de Lupe en el valle: decide qué hace cada fotograma según su estado (ver `npcStates.js`), sin tocar Phaser.
// La escena le da el tiempo transcurrido y dónde está la viajera, y dibuja lo que el cerebro dice (posición, hacia
// dónde mira, si anda). Así se puede probar entera sin navegador.
//
// Lupe es autónoma: pasa el rato en su sitio (`idle`), da un paseo corto entre sus puntos (`routine`) y mira a la
// viajera si se acerca. Solo acompaña (`guiding` y `waiting`) cuando la escena le pide una visita guiada, y al terminarla,
// cancelarla o perder a la viajera vuelve sola a su sitio. Todo el movimiento va por los caminos de `nav`
// (`interior/catNav.js`), así que nunca cruza un obstáculo ni se teletransporta: si no hay camino, se queda donde está.
import { facingFor } from '../walk.js'
import { go, isAccompanying } from './npcStates.js'

export const TUNING = {
  // Más lenta que la viajera (90 px/s) para que pueda seguirla sin correr; el paseo propio es más pausado todavía.
  guideSpeed: 66,
  routineSpeed: 38,
  // Distancia a la que Lupe se para a esperar, y a la que vuelve a andar (con histéresis para que no titubee).
  waitGap: 78,
  resumeGap: 46,
  // Si la viajera se aleja tanto y tanto rato, la visita se da por interrumpida.
  abandonGap: 300,
  abandonMs: 14000,
  // Desde dónde mira a la viajera cuando está quieta.
  lookRange: 100,
  idleMs: [5000, 9000],
}

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

// `abandonMs` es lo que aguanta con la viajera lejos antes de dar la visita por interrumpida (dentro de casa no la da por perdida nunca).
export function createLupeBrain({ nav, post, spots = [], rng = Math.random, abandonMs = TUNING.abandonMs }) {
  return {
    nav,
    rng,
    state: 'idle',
    x: post.x,
    y: post.y,
    facing: 'down',
    walking: false,
    path: [],
    speed: TUNING.routineSpeed,
    idleFor: 0,
    idleLimit: TUNING.idleMs[0],
    // Sitio donde pasa el rato y puntos de su paseo. Cambian cuando Lupe cambia de sitio (ver `setAnchor`).
    post,
    spots,
    spotIndex: 0,
    // Visita guiada: destino, si ya llegó, cuánto lleva la viajera lejos y si la dio por perdida.
    goal: null,
    arrived: false,
    far: 0,
    abandoned: false,
    abandonMs,
    // A qué vuelve al terminar una conversación.
    resume: 'idle',
    // Ya ha cruzado la puerta de su casa y espera dentro: en el valle no se dibuja ni se puede hablar con ella.
    inside: false,
  }
}

const faceTowards = (brain, target) => {
  brain.facing = facingFor(target.x - brain.x, target.y - brain.y)
}

const rest = (brain) => {
  brain.state = go(brain.state, 'idle')
  brain.walking = false
  brain.path = []
  brain.idleFor = 0
  brain.idleLimit = TUNING.idleMs[0] + brain.rng() * (TUNING.idleMs[1] - TUNING.idleMs[0])
}

// Avanza por el camino un fotograma. Devuelve si se movió.
function advancePath(brain, dt) {
  const next = brain.path[0]
  if (!next) return false
  const dx = next.x - brain.x
  const dy = next.y - brain.y
  const left = Math.hypot(dx, dy)
  const step = (brain.speed * dt) / 1000
  if (left <= step) {
    brain.x = next.x
    brain.y = next.y
    brain.path.shift()
  } else {
    brain.x += (dx / left) * step
    brain.y += (dy / left) * step
  }
  if (left > 0.01) brain.facing = facingFor(dx, dy)
  return true
}

// Coloca a Lupe sin mover a nadie más (al entrar en el mundo o al volver de un edificio).
export function placeAt(brain, x, y) {
  brain.x = x
  brain.y = y
  brain.inside = false
  rest(brain)
}

// Cambia su sitio habitual y sus puntos de paseo (por ejemplo, de la entrada a la puerta de su casa). No se mueve: el
// paseo siguiente la lleva hasta ahí por el camino.
export function setAnchor(brain, post, spots = []) {
  brain.post = post
  brain.spots = spots
  brain.spotIndex = 0
}

// Empieza a hablar con la viajera: se para y la mira. Recuerda qué hacía para retomarlo al terminar.
export function startTalk(brain, traveller) {
  if (brain.state !== 'talking') brain.resume = isAccompanying(brain.state) || brain.state === 'routine' ? brain.state : 'idle'
  brain.state = go(brain.state, 'talking')
  brain.walking = false
  faceTowards(brain, traveller)
}

export function endTalk(brain) {
  if (brain.state !== 'talking') return
  if (brain.resume === 'idle' || (brain.resume === 'routine' && !brain.path.length)) return rest(brain)
  brain.state = go(brain.state, brain.resume)
}

// Visita guiada: Lupe echa a andar hacia `goal` por el camino. Devuelve false si no hay camino (no se mueve).
export function startGuide(brain, goal) {
  const path = brain.nav.path({ x: brain.x, y: brain.y }, goal)
  if (!path) return false
  brain.path = path
  brain.goal = goal
  brain.arrived = false
  brain.far = 0
  brain.abandoned = false
  brain.speed = TUNING.guideSpeed
  brain.state = go(brain.state, 'guiding')
  return true
}

// Fin del acompañamiento (terminada, cancelada o perdida la viajera): Lupe recupera su autonomía y vuelve a su sitio
// andando. Si el camino de vuelta no existe, se queda donde está.
export function stopGuide(brain) {
  brain.goal = null
  brain.arrived = false
  brain.far = 0
  brain.walking = false
  brain.path = []
  brain.state = go(brain.state, 'idle')
  walkTo(brain, brain.post)
}

// Se queda donde está, quieta y sin pasear: la visita por dentro de la casa la deja así cuando se pausa o se acaba (no tiene sitio
// al que volver). Con `arrived` el paseo propio no la manda a ningún sitio.
export function holdPosition(brain) {
  brain.goal = null
  brain.far = 0
  brain.path = []
  brain.walking = false
  brain.arrived = true
  brain.state = go(brain.state, 'idle')
}

// Lupe va sola a la puerta de su casa y entra a esperar dentro. No lleva a la viajera consigo: ella entra cuando quiere, con E.
// Si no hay camino hasta la puerta, entra de inmediato en lugar de quedarse a medias.
export function enterHome(brain, door) {
  const path = brain.nav.path({ x: brain.x, y: brain.y }, door)
  brain.goal = null
  brain.arrived = false
  brain.far = 0
  brain.state = go(brain.state, 'entering')
  brain.walking = false
  brain.path = path ?? []
  brain.speed = TUNING.guideSpeed
  brain.inside = brain.path.length === 0
}

function walkTo(brain, target) {
  const path = brain.nav.path({ x: brain.x, y: brain.y }, target)
  if (!path?.length) return rest(brain)
  brain.path = path
  brain.speed = TUNING.routineSpeed
  brain.state = go(brain.state, 'routine')
}

// Siguiente punto de su paseo, o su sitio si no tiene más.
function nextStroll(brain) {
  const stops = [brain.post, ...brain.spots]
  brain.spotIndex = (brain.spotIndex + 1) % stops.length
  walkTo(brain, stops[brain.spotIndex])
}

// Si la viajera se aleja demasiado y demasiado rato, la visita se da por interrumpida: Lupe vuelve a lo suyo y lo avisa.
function checkAbandon(brain, gap, dt) {
  brain.far = gap > TUNING.abandonGap ? brain.far + dt : 0
  if (brain.far < brain.abandonMs) return false
  brain.abandoned = true
  stopGuide(brain)
  return true
}

export function updateLupe(brain, dt, traveller) {
  const gap = distance(brain, traveller)
  switch (brain.state) {
    case 'talking':
      brain.walking = false
      faceTowards(brain, traveller)
      break
    case 'guiding':
      if (checkAbandon(brain, gap, dt)) break
      if (gap > TUNING.waitGap) {
        brain.state = go(brain.state, 'waiting')
        brain.walking = false
        faceTowards(brain, traveller)
        break
      }
      brain.walking = advancePath(brain, dt)
      if (!brain.path.length) {
        // Llegó: espera a la viajera mirándola. Hasta que decida algo no se pone a pasear.
        brain.arrived = true
        rest(brain)
        faceTowards(brain, traveller)
      }
      break
    case 'waiting':
      brain.walking = false
      faceTowards(brain, traveller)
      if (checkAbandon(brain, gap, dt)) break
      if (gap < TUNING.resumeGap) brain.state = go(brain.state, 'guiding')
      break
    case 'routine':
      brain.walking = advancePath(brain, dt)
      if (!brain.path.length) rest(brain)
      break
    case 'entering':
      brain.walking = advancePath(brain, dt)
      if (!brain.path.length) {
        brain.walking = false
        brain.inside = true
      }
      break
    default:
      brain.walking = false
      if (gap < TUNING.lookRange) faceTowards(brain, traveller)
      brain.idleFor += dt
      // Con una visita pendiente de decidir (ha llegado a la puerta) se queda esperando en lugar de pasear.
      if (!brain.arrived && brain.idleFor > brain.idleLimit) nextStroll(brain)
  }
}
