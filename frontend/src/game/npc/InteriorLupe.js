// Lupe dentro de su casa, con la visita guiada o sin ella. Une la visita (`homeTour.js`, pura) con lo que se ve y con lo que se dice:
// dibuja a Lupe con la hoja del avatar, le pone la exclamación mientras espera con una parada por contar, abre las conversaciones
// que la visita decide, reacciona a las opciones que se eligen en ellas (`npc-action`) y guarda en la historia (`story/`) las
// paradas hechas. La escena solo le da el tiempo y dónde está la viajera.
import { homeNav } from '../interior/homeNav.js'
import { getStory, updateStory } from '../story/storyStore.js'
import NpcActor from './NpcActor.js'
import { buildExclamation } from './exclaim.js'
import { startGuide } from './lupeBrain.js'
import { LUPE_MIN_Y, TOUR, applyTourAction, snapSpots, canTalkTo, closeWithoutChoice, createHomeTour, talkToLupe, updateHomeTour } from './homeTour.js'

// A cuántos píxeles de donde aparece la viajera por la azotea espera Lupe (a la vista y a unos pasos).
const ROOF_MEETING = { x: 34, y: 22 }
// A cuánto de la viajera tiene que estar Lupe para hablar, y a qué lado de ella se pone al acudir.
const NEAR_FOR_TALK = TOUR.reach * 2
const SUMMON_SIDE = 22
// Lo alto sobre los pies al que flota la exclamación y sale el bocadillo (sobre la cabeza de Lupe).
const MARK_ABOVE = 40
// Cada cuánto, como mínimo, comenta que espera.
const WAIT_BUBBLE_MS = 14000

export default class InteriorLupe {
  // Lupe está en su casa siempre que la viajera entra. `guided` es que hay una visita en marcha (ver `story.js`): si no, está quieta, sin
  // abrir nada, y solo habla si se le habla o si acude a donde se abre una conversación suya (`summon`). `roofArrival` es dónde aparece la
  // viajera si entra por la azotea: Lupe la espera allí cerca en lugar de junto a la puerta de la calle.
  constructor(scene, { roofArrival = null, guided = false } = {}) {
    this.scene = scene
    this.nav = null
    this.summoned = false
    this.game = scene.game
    const nav = homeNav(LUPE_MIN_Y)
    const spots = snapSpots(nav)
    if (roofArrival) spots.entrada = nav.nearestFree(roofArrival.x + ROOF_MEETING.x, roofArrival.y + ROOF_MEETING.y)
    this.nav = nav
    this.tour = createHomeTour({ nav, story: getStory(this.game), spots, resident: !guided })
    const { brain } = this.tour
    this.actor = new NpcActor(scene, 'npc-lupe', brain.x, brain.y)
    this.mark = buildExclamation(scene, () => ({ x: brain.x, y: brain.y - MARK_ABOVE + 2 }))
    this.waitBubbleAt = -WAIT_BUBBLE_MS
    this.lastState = brain.state
    this.game.events.on('npc-action', this.onAction, this)
    this.game.registry.events.on('changedata-locked', this.onLock, this)
    scene.events.once('shutdown', () => this.destroy())
  }

  destroy() {
    this.game.events.off('npc-action', this.onAction, this)
    this.game.registry.events.off('changedata-locked', this.onLock, this)
    this.actor.destroy()
    this.mark.destroy()
  }

  get sprite() {
    return this.actor.sprite
  }

  // Cerca de Lupe para pulsar E.
  canTalk(x, y) {
    return canTalkTo(this.tour, { x, y })
  }

  // Lo bastante cerca de la viajera para que una conversación suya tenga sentido.
  isNear(traveller) {
    return Math.hypot(this.tour.brain.x - traveller.x, this.tour.brain.y - traveller.y) <= NEAR_FOR_TALK
  }

  // Lupe va junto a la viajera antes de que se abra una conversación suya. Deja lo que hacía (una parada se retoma después) y, como la
  // viajera ya está allí, no espera a que se acerque. Devuelve false si no hay camino: entonces se habla igual, desde donde esté.
  summon(traveller) {
    const { tour } = this
    if (tour.phase === 'talking') return false
    const goal = this.nav.nearestFree(traveller.x - SUMMON_SIDE, traveller.y + 6)
    if (!startGuide(tour.brain, goal, true)) return false
    if (tour.phase === 'arrived' || tour.phase === 'leading') tour.phase = 'paused'
    this.summoned = true
    return true
  }

  release() {
    this.summoned = false
  }

  talk(traveller) {
    const event = talkToLupe(this.tour, traveller)
    if (event) this.game.events.emit('talk', event.id)
  }

  // Una opción de la visita. La historia que devuelve (paradas hechas, estado) se guarda tal cual.
  onAction(action) {
    if (this.tour.phase !== 'talking') return
    updateStory(this.game, (story) => applyTourAction(this.tour, action, story))
  }

  // Si el diálogo se cierra sin haber elegido nada (Esc o el botón de cerrar), la parada no cuenta y Lupe espera donde está. Las
  // opciones llegan antes que el desbloqueo, así que aquí solo queda lo que no eligió nada.
  onLock(_parent, locked) {
    if (!locked) closeWithoutChoice(this.tour)
  }

  say(key) {
    this.scene.showBubble('lupe', key)
  }

  // `locked` es que hay un diálogo o un panel abiertos.
  update(delta, traveller, locked) {
    const { brain } = this.tour
    // Mientras acude a una conversación pedida, la visita no abre otra por su cuenta.
    const event = updateHomeTour(this.tour, delta, traveller, locked || this.summoned, getStory(this.game))
    if (event) this.game.events.emit('talk', event.id)
    if (brain.state === 'waiting' && this.lastState !== 'waiting' && performance.now() - this.waitBubbleAt > WAIT_BUBBLE_MS) {
      this.waitBubbleAt = performance.now()
      this.say('lupeWait')
    }
    this.lastState = brain.state
    // Con una parada por contar y sin hablar, la exclamación avisa de que quiere decir algo.
    this.mark.setVisible(this.tour.phase === 'arrived' && !locked)
    this.actor.render(brain, delta)
  }
}
