// Lupe dentro de su casa durante la visita guiada. Une la visita (`homeTour.js`, pura) con lo que se ve y con lo que se dice:
// dibuja a Lupe con la hoja del avatar, le pone la exclamación mientras espera con una parada por contar, abre las conversaciones
// que la visita decide, reacciona a las opciones que se eligen en ellas (`npc-action`) y guarda en la historia (`story/`) las
// paradas hechas. La escena solo le da el tiempo y dónde está la viajera.
import { homeNav } from '../interior/homeNav.js'
import { getStory, updateStory } from '../story/storyStore.js'
import NpcActor from './NpcActor.js'
import { buildExclamation } from './exclaim.js'
import { LUPE_MIN_Y, applyTourAction, canTalkTo, closeWithoutChoice, createHomeTour, talkToLupe, updateHomeTour } from './homeTour.js'

// Lo alto sobre los pies al que flota la exclamación y sale el bocadillo (sobre la cabeza de Lupe).
const MARK_ABOVE = 40
// Cada cuánto, como mínimo, comenta que espera.
const WAIT_BUBBLE_MS = 14000

export default class InteriorLupe {
  constructor(scene) {
    this.scene = scene
    this.game = scene.game
    this.tour = createHomeTour({ nav: homeNav(LUPE_MIN_Y), story: getStory(this.game) })
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
    const event = updateHomeTour(this.tour, delta, traveller, locked)
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
