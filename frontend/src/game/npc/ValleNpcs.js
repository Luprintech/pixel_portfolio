// Los personajes del valle que no maneja nadie: Lupe (con su cerebro de `lupeBrain.js`) y Khalessi, que la acompaña a ella.
// Une el cerebro con lo que se ve y con lo que se dice: dibuja a Lupe y a la gata, enseña la exclamación mientras haya una
// conversación nueva, abre la conversación que toca (`talkId`), reacciona a las acciones que lanzan los diálogos
// (`npc-action`) y guarda en la historia (`story/`) cómo va la visita guiada. La escena solo le da el tiempo y la posición de la
// viajera, y le avisa de lo que pasa con los edificios y los diálogos.
import { getStory, updateStory } from '../story/storyStore.js'
import { newTalkFor, setTour } from '../story/story.js'
import CatActor from './CatActor.js'
import NpcActor from './NpcActor.js'
import { buildExclamation } from './exclaim.js'
import { createCompanion, placeCompanion, updateCompanion } from './catCompanion.js'
import { HOME_DOOR, TOUR_GOAL, placesFor } from './lupePlaces.js'
import { createLupeBrain, endTalk, enterHome, placeAt, setAnchor, startGuide, startTalk, stopGuide, updateLupe } from './lupeBrain.js'
import { go } from './npcStates.js'
import { CONVERSATION, beginTalk, createVisit, isVisiting, startVisit, stepVisit, visitAlpha, visitDue } from './deckVisit.js'
import { facingFor } from '../walk.js'

// A qué distancia se puede hablar con ella, a cuál empieza sola la bienvenida (la viajera tiene que acercarse un poco) y a
// cuál se vuelve a armar si la viajera se va y regresa.
const TALK_RANGE = 24
const WELCOME_RANGE = 44
const REARM_RANGE = 90
// Cerca de la puerta: a esta distancia le ofrece entrar sin que haga falta pulsar nada.
const DOOR_OFFER_RANGE = 36
// Lo alto sobre los pies al que flota la exclamación y sale el bocadillo (sobre la cabeza de Lupe).
const MARK_ABOVE = 40
// Cada cuánto, como mínimo, comenta que espera.
const WAIT_BUBBLE_MS = 14000

export default class ValleNpcs {
  // `travellerAt()` devuelve dónde tiene los pies la viajera ({ x, y }).
  constructor(scene, nav, travellerAt) {
    this.scene = scene
    this.game = scene.game
    this.travellerAt = travellerAt
    const places = placesFor(getStory(this.game))
    this.brain = createLupeBrain({ nav, post: places.post, spots: places.spots })
    this.lupe = new NpcActor(scene, 'npc-lupe', this.brain.x, this.brain.y)
    this.companion = createCompanion(this.brain.x + 13, this.brain.y + 4)
    this.cat = new CatActor(scene, this.companion)
    this.mark = buildExclamation(scene, () => ({ x: this.brain.x, y: this.brain.y - MARK_ABOVE + 2 }))
    this.places = places
    this.armed = true
    this.offered = false
    this.lastState = this.brain.state
    this.waitBubbleAt = -WAIT_BUBBLE_MS
    this.bubbleOpen = false
    // Visita a la azotea: su propio dibujo de Lupe sobre la cubierta, mientras la del valle se esconde (como cuando está en casa).
    this.visit = createVisit()
    this.visitor = null
    this.syncMark()

    this.game.events.on('npc-action', this.onAction, this)
    this.game.events.on('bubble-closed', this.onBubbleClosed, this)
    this.game.registry.events.on('changedata-story', this.onStory, this)
    scene.events.once('shutdown', () => this.destroy())
  }

  destroy() {
    this.game.events.off('npc-action', this.onAction, this)
    this.game.events.off('bubble-closed', this.onBubbleClosed, this)
    this.game.registry.events.off('changedata-story', this.onStory, this)
    this.lupe.destroy()
    this.cat.destroy()
    this.mark.destroy()
    this.visitor?.destroy()
  }

  // Mientras va a su puerta o espera dentro no se puede hablar con ella.
  canTalk(x, y) {
    if (this.brain.state === 'entering') return false
    return Math.hypot(this.brain.x - x, this.brain.y - y) <= TALK_RANGE
  }

  // La viajera cruza la puerta de la casa durante la visita: Lupe ya está (o pasa a estar) dentro, esperándola.
  goInside() {
    this.brain.inside = true
    this.brain.path = []
    this.brain.state = go(this.brain.state, 'entering')
  }

  // Qué conversación abre Lupe ahora: la visita en marcha manda sobre todo; después la bienvenida, si no se ha escuchado.
  talkId(story) {
    if (story.tour === 'accepted') return this.brain.arrived ? 'inicio.puerta' : 'inicio.guia_pausa'
    return story.welcome === 'pending' ? 'inicio.bienvenida' : 'inicio.regreso'
  }

  talk() {
    startTalk(this.brain, this.travellerAt())
    this.mark.setVisible(false)
    this.game.events.emit('talk', this.talkId(getStory(this.game)))
  }

  // Al cerrarse el diálogo Lupe vuelve a lo que hacía (acompañar, pasear o estar quieta), salvo que la acción elegida
  // ya le haya dado otra cosa que hacer.
  onUnlock() {
    endTalk(this.brain)
    this.syncMark()
  }

  // La viajera acaba de subir a la azotea: la primera vez, Lupe aparece junto al telescopio y le cuenta lo suyo. `spot` es el
  // sitio en el mapa y `depth` la profundidad de la cubierta (se dibuja con la misma que la viajera).
  greetOnDeck(spot, depth) {
    if (this.visit.phase !== 'away' || this.brain.inside || !visitDue(getStory(this.game))) return
    startVisit(this.visit)
    this.brain.inside = true
    this.mark.setVisible(false)
    this.visitSpot = { ...spot, depth }
    this.visitor = new NpcActor(this.scene, 'npc-lupe', spot.x, spot.y)
    this.visitor.setAlpha(0)
  }

  // Lupe cuenta como presente en la azotea mientras espera o habla allí.
  onDeck() {
    return isVisiting(this.visit)
  }

  // E ante el telescopio con Lupe allí: abre la conversación sin esperar a que empiece sola.
  talkAtTelescope() {
    beginTalk(this.visit)
    this.game.events.emit('talk', CONVERSATION)
  }

  // Avanza la visita a la azotea y dibuja a Lupe sobre la cubierta.
  updateVisit(delta, locked, traveller, onDeck) {
    if (this.visit.phase === 'away') return
    const event = stepVisit(this.visit, delta, { onDeck, locked })
    if (event === 'talk') this.game.events.emit('talk', CONVERSATION)
    if (event === 'gone') {
      this.visitor.destroy()
      this.visitor = null
      this.brain.inside = false
      this.syncMark()
      return
    }
    const { x, y, depth } = this.visitSpot
    const facing = facingFor(traveller.x - x, traveller.y - y)
    this.visitor.render({ x, y, facing, walking: false }, delta, depth)
    this.visitor.setAlpha(visitAlpha(this.visit))
  }

  // Cambio de sitio habitual y de la exclamación cuando cambia la historia.
  onStory(_parent, story) {
    const places = placesFor(story)
    if (places !== this.places) {
      this.places = places
      setAnchor(this.brain, places.post, places.spots)
    }
    this.syncMark(story)
  }

  syncMark(story = getStory(this.game)) {
    this.mark.setVisible(this.brain.state !== 'talking' && !this.brain.inside && newTalkFor('lupe', story) !== null)
  }

  // Órdenes que llegan de los diálogos. Cada una cambia la visita y lo que hace Lupe a la vez.
  onAction(action) {
    const { brain } = this
    const setTourTo = (tour) => updateStory(this.game, (story) => setTour(story, tour))
    if (action === 'tour-start') {
      if (startGuide(brain, TOUR_GOAL)) {
        setTourTo('accepted')
        this.say('lupeGuide')
      } else {
        // Sin camino no hay visita: se queda pendiente en lugar de dejar a Lupe a medias.
        setTourTo('pending')
      }
    } else if (action === 'tour-decline' || action === 'tour-cancel') {
      setTourTo('cancelled')
      stopGuide(brain)
    } else if (action === 'tour-pause') {
      setTourTo('pending')
      stopGuide(brain)
    } else if (action === 'tour-enter') {
      // Lupe pasa primero y espera dentro; la viajera entra después, con E ante la puerta, como a cualquier edificio.
      enterHome(brain, HOME_DOOR)
      this.say('lupeInside')
    }
  }

  // Al volver de la casa tras la visita: Lupe ya la ha enseñado, así que vive en su puerta y deja de acompañar.
  finishTour() {
    updateStory(this.game, (story) => setTour(story, 'completed'))
    const { post } = placesFor(getStory(this.game))
    placeAt(this.brain, post.x, post.y)
    placeCompanion(this.companion, post.x + 13, post.y + 4)
    this.armed = false
  }

  // Bocadillo ambiental sobre Lupe (ver `WorldBubble.jsx`): no abre ningún diálogo ni bloquea el movimiento.
  say(key) {
    this.bubbleOpen = true
    this.game.events.emit('npc-bubble', key)
  }

  onBubbleClosed() {
    this.bubbleOpen = false
  }

  // Mientras el bocadillo está abierto, la página sabe dónde está la cabeza de Lupe en la pantalla (en píxeles CSS del lienzo).
  publishBubble() {
    if (!this.bubbleOpen) return
    const camera = this.scene.cameras.main
    const { canvas } = this.game
    const ratio = canvas.clientWidth / this.scene.scale.width
    this.game.events.emit('bubble-anchor', {
      x: (this.brain.x - camera.worldView.x) * camera.zoom * ratio,
      y: (this.brain.y - MARK_ABOVE - camera.worldView.y) * camera.zoom * ratio,
    })
  }

  // `locked` es que hay un diálogo o un panel abierto: mientras tanto Lupe no abre conversaciones por su cuenta.
  update(delta, locked, onDeck = false) {
    const traveller = this.travellerAt()
    const { brain } = this
    const wasWalking = brain.walking
    updateLupe(brain, delta, traveller)
    const story = getStory(this.game)
    const gap = Math.hypot(brain.x - traveller.x, brain.y - traveller.y)

    if (brain.abandoned) {
      // La viajera se fue y la visita queda pendiente: se avisa una vez y Lupe vuelve sola a su sitio.
      brain.abandoned = false
      updateStory(this.game, (current) => setTour(current, 'pending'))
      this.say('lupeLeft')
    }
    if (brain.state === 'waiting' && this.lastState !== 'waiting' && performance.now() - this.waitBubbleAt > WAIT_BUBBLE_MS) {
      this.waitBubbleAt = performance.now()
      this.say('lupeWait')
    }
    this.lastState = brain.state

    if (!locked) this.offerTalks(story, gap)
    if (gap > REARM_RANGE || story.welcome === 'done') this.armed = story.welcome === 'pending'
    if (!brain.arrived) this.offered = false

    updateCompanion(this.companion, delta, brain, wasWalking || brain.walking)
    this.lupe.render(brain, delta)
    this.cat.render(this.companion)
    // Dentro de su casa no se las ve: Khalessi entra con ella.
    this.lupe.setVisible(!brain.inside)
    this.cat.setVisible(!brain.inside)
    if (brain.inside) this.mark.setVisible(false)
    this.publishBubble()
    this.updateVisit(delta, locked, traveller, onDeck)
  }

  // Conversaciones que empiezan solas al acercarse: la bienvenida en una partida nueva y la oferta de entrar al llegar a la puerta.
  offerTalks(story, gap) {
    const { brain } = this
    if (story.welcome === 'pending' && story.tour !== 'accepted' && this.armed && gap < WELCOME_RANGE) {
      this.armed = false
      this.talk()
    } else if (story.tour === 'accepted' && brain.arrived && !this.offered && gap < DOOR_OFFER_RANGE) {
      this.offered = true
      this.talk()
    }
  }
}
