// Ylonem y Grace en el pueblo, y la llegada de Lupe a presentárselos a la viajera. Une los cerebros (los mismos de Lupe, `lupeBrain.js`, con una
// rejilla de caminos propia) con lo que se ve y con lo que se dice. Hasta que Lupe los presenta se quedan junto a la puerta del IES; después
// cada uno sigue su rutina (`neighbourRoutine.js`, pasos en `granPlaces.js`): Grace se sienta en un banco de la plaza a dar de comida a las
// palomas (`PigeonFlock.js`) y a jugar con Khalessi, que viene a verla, y Ylonem recorre el pueblo grabando con su cámara. Si la viajera les
// habla, contestan con lo que van haciendo. La escena solo le da el tiempo, la posición de la viajera y si hay un diálogo abierto.
import { createNav } from '../interior/catNav.js'
import { characterSheet } from '../characters.js'
import { registerSheet } from '../sheetTexture.js'
import { ylonemSheet } from '../interior/ylonemSheet.js'
import { facingFor } from '../walk.js'
import { PAL } from '../palette.js'
import { getStory } from '../story/storyStore.js'
import { GRAN_ARRIVAL, granArrivalDue } from '../story/story.js'
import CatActor from './CatActor.js'
import NpcActor from './NpcActor.js'
import PigeonFlock from './PigeonFlock.js'
import { screenAnchor } from './bubbleAnchor.js'
import { createCompanion, updateCompanion } from './catCompanion.js'
import { arrivalAlpha, createArrival, isArriving, stepArrival } from './granArrival.js'
import { GIVE_UP_RANGE, GRAN_DOOR, LUPE_ENTRY, LUPE_MEET, PEOPLE, PIGEON_COUNT, PIGEON_HOMES, ROUTINES, TOWN_REGION, TRIGGER_RANGE } from './granPlaces.js'
import { createLupeBrain, endTalk, placeAt, startGuide, startTalk, updateLupe, walkTo } from './lupeBrain.js'
import { createRoutine, doingNow, skipStep, stepRoutine } from './neighbourRoutine.js'

// A qué distancia se puede hablar con ellos.
const TALK_RANGE = 26
// Cada cuánto, como mínimo, dice Grace algo bonito, y a qué distancia de la viajera lo dice (el bocadillo solo se ve si está en pantalla).
const SPEAK_EVERY = [9000, 14000]
const SPEAK_RANGE = 170
// Lo que tarda Khalessi en aparecer o irse, y cuánto se aleja de Grace y cada cuánto cambia de sitio mientras Grace está sentada.
const CAT_FADE_MS = 700
const CAT_ROAM = { radius: 38, every: [4000, 8000] }
// Alto sobre los pies al que sale el bocadillo y el punto rojo de la cámara.
const HEAD = 38

const touches = (r, b) => r.x < b.x + b.width && r.x + r.w > b.x && r.y < b.y + b.height && r.y + r.h > b.y
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
const between = (range) => range[0] + Math.random() * (range[1] - range[0])

export default class GranNeighbours {
  // `bodies` son los cuerpos sólidos del valle `{ x, y, w, h }` y `travellerAt()` devuelve dónde tiene los pies la viajera ({ x, y }). `npcs` es
  // quien lleva a Lupe y a Khalessi en la entrada: mientras salen a la plaza, allí no se las ve.
  constructor(scene, bodies, travellerAt, npcs) {
    this.scene = scene
    this.game = scene.game
    this.travellerAt = travellerAt
    this.npcs = npcs
    this.nav = createNav({ bounds: TOWN_REGION, solids: bodies.filter((body) => touches(body, TOWN_REGION)), minY: TOWN_REGION.y })
    if (!scene.textures.exists('npc-ylonem-cam')) registerSheet(scene.textures, 'npc-ylonem-cam', ylonemSheet())
    this.people = Object.fromEntries(
      Object.entries(PEOPLE).map(([id, { sheet, post }]) => {
        const key = `npc-${id}`
        if (!scene.textures.exists(key)) registerSheet(scene.textures, key, characterSheet(sheet))
        // Su rutina manda: `arrived` impide el paseo propio de `lupeBrain`.
        const brain = createLupeBrain({ nav: this.nav, post })
        brain.arrived = true
        const actor = new NpcActor(scene, key, brain.x, brain.y, id === 'ylonem' ? 'npc-ylonem-cam' : null)
        return [id, { brain, actor, routine: createRoutine(ROUTINES[id]), sitting: null, filming: null }]
      }),
    )
    // Lupe en esta escena: su propio dibujo y su propio cerebro, ya que la de la entrada del valle puede estar en otro sitio.
    this.lupeBrain = createLupeBrain({ nav: this.nav, post: LUPE_ENTRY })
    this.lupe = new NpcActor(scene, 'npc-lupe', LUPE_ENTRY.x, LUPE_ENTRY.y)
    this.lupe.setVisible(false)
    this.arrival = createArrival()

    // Punto rojo de "grabando" sobre la cámara de Ylonem.
    this.rec = scene.add.rectangle(0, 0, 3, 3, Number.parseInt(PAL.tile.slice(1), 16)).setVisible(false)
    // Khalessi, que viene a ver a Grace cuando va a sentarse en el banco: su propio dibujo (la de la entrada se esconde mientras) y su estado de compañera.
    this.catState = createCompanion(0, 0)
    this.cat = new CatActor(scene, this.catState)
    this.cat.setVisible(false)
    this.visit = { phase: 'away', t: 0, leader: { x: 0, y: 0 }, roamIn: 0 }
    // Las palomas de la plaza.
    const homes = PIGEON_HOMES.map(({ x, y }) => this.nav.nearestFree(x, y)).filter(Boolean)
    this.flock = homes.length ? new PigeonFlock(scene, homes, PIGEON_COUNT, this.nav.free) : null

    this.clock = 0
    this.speakIn = between(SPEAK_EVERY)
    this.bubbleOpen = false
    this.onBubbleClosed = () => {
      this.bubbleOpen = false
    }
    this.game.events.on('bubble-closed', this.onBubbleClosed)
    scene.events.once('shutdown', () => this.destroy())
  }

  destroy() {
    this.game.events.off('bubble-closed', this.onBubbleClosed)
    Object.values(this.people).forEach(({ actor }) => actor.destroy())
    this.lupe.destroy()
    this.cat.destroy()
    this.rec.destroy()
    this.flock?.destroy()
  }

  // Los dibujos de esta escena, para recortarlos de los cristales encendidos de los edificios (`litWindows.js`).
  sprites() {
    return [this.lupe.sprite, this.cat.sprite, ...Object.values(this.people).map(({ actor }) => actor.sprite)]
  }

  // Ya se les presentó Lupe: pueden seguir su rutina y hablar por su cuenta.
  introduced() {
    return getStory(this.game).heard.includes(GRAN_ARRIVAL)
  }

  // Quién queda al alcance de la viajera para hablarle (el más cercano), o null. Con la llegada en marcha no se puede: la hace Lupe.
  talkTarget(x, y) {
    if (!this.introduced() || isArriving(this.arrival)) return null
    const near = Object.entries(this.people)
      .map(([id, { brain }]) => ({ id, gap: distance(brain, { x, y }) }))
      .filter(({ id, gap }) => gap <= TALK_RANGE && this.people[id].brain.state !== 'talking')
      .sort((a, b) => a.gap - b.gap)
    return near[0]?.id ?? null
  }

  // La conversación que toca: la que va con lo que está haciendo (grabando, dando de comer a las palomas) o su repetición breve.
  scriptFor(id) {
    const step = doingNow(this.people[id].routine)
    if (step?.kind === 'sit') return 'grace.palomas'
    if (step?.kind === 'film') return 'ylonem.grabando'
    return `${id}.repeticion`
  }

  // E ante uno de ellos: se para a mirarla (sentada o grabando, sin moverse de su sitio) y contesta.
  talk(id) {
    startTalk(this.people[id].brain, this.travellerAt())
    this.game.events.emit('talk', this.scriptFor(id))
  }

  // Al cerrarse el diálogo, cada uno vuelve a lo que hacía.
  onUnlock() {
    Object.values(this.people).forEach(({ brain }) => endTalk(brain))
  }

  // Saca a Lupe por el borde de la franja y la manda hacia ellos. Sin camino, aparece ya con ellos en lugar de quedarse a medias.
  startArrival() {
    this.npcs.setElsewhere(true)
    placeAt(this.lupeBrain, LUPE_ENTRY.x, LUPE_ENTRY.y)
    if (!startGuide(this.lupeBrain, LUPE_MEET, true)) {
      placeAt(this.lupeBrain, LUPE_MEET.x, LUPE_MEET.y)
      this.lupeBrain.arrived = true
    }
    this.lupe.setVisible(true)
  }

  endArrival() {
    this.lupe.setVisible(false)
    this.npcs.setElsewhere(false)
  }

  // La rutina echa a andar a uno hacia el sitio de su paso (sin camino, lo salta) o le hace empezar lo que va a hacer allí.
  runRoutine(person, delta, busy) {
    const { brain, routine } = person
    const event = stepRoutine(routine, delta, { busy, walking: brain.path.length > 0 || brain.state === 'routine' })
    if (event?.type === 'go') {
      const reachable = distance(brain, event.step.to) < 6 || walkTo(brain, event.step.to)
      if (!reachable) skipStep(routine)
      else if (event.step.kind === 'sit') this.startVisit(person)
    } else if (event?.type === 'begin') this.beginStep(person, event.step)
    else if (event?.type === 'end') this.endStep(person, event.step)
  }

  beginStep(person, step) {
    const { brain } = person
    brain.walking = false
    if (step.kind === 'sit') {
      Object.assign(brain, { x: step.bench.seat.x, y: step.bench.seat.y, facing: step.bench.seat.facing })
      person.sitting = step.bench.seat
      this.speakIn = between(SPEAK_EVERY) / 2
    } else if (step.kind === 'film') person.filming = step
  }

  endStep(person, step) {
    const { brain } = person
    if (step.kind === 'sit') {
      Object.assign(brain, { x: step.bench.front.x, y: step.bench.front.y })
      person.sitting = null
      this.endVisit()
    }
    person.filming = null
  }

  // Mientras hace su paso mantiene lo que lo define: sentada mira de frente, y grabando mira a lo que filma (aunque alguien se acerque).
  holdPose(person) {
    const { brain } = person
    if (brain.state === 'talking') return
    if (person.sitting) brain.facing = person.sitting.facing
    if (person.filming) brain.facing = facingFor(person.filming.look.x - brain.x, person.filming.look.y - brain.y)
  }

  // Khalessi viene a ver a Grace cuando va a sentarse: aparece con un fundido a su lado, la sigue andando y juega cerca del banco.
  startVisit(person) {
    if (this.visit.phase !== 'away' || !this.npcs.canSpareCat()) return
    const spot = this.nav.nearestFree(person.brain.x - 12, person.brain.y + 6) ?? { x: person.brain.x, y: person.brain.y }
    Object.assign(this.catState, { x: spot.x, y: spot.y, trail: [], pose: 'sit', meet: null })
    Object.assign(this.visit, { phase: 'in', t: 0, roamIn: 0, leader: { ...spot } })
    this.npcs.setCatAway(true)
    this.cat.setVisible(true)
  }

  endVisit() {
    if (this.visit.phase === 'away') return
    Object.assign(this.visit, { phase: 'out', t: 0 })
  }

  // Khalessi sigue a Grace mientras anda y, con Grace sentada, trota de un punto a otro alrededor del banco, se sienta y se asea.
  updateVisit(delta) {
    const { visit, catState } = this
    if (visit.phase === 'away') return
    visit.t += delta
    const { brain, sitting } = this.people.grace
    if (sitting) {
      visit.roamIn -= delta
      if (visit.roamIn <= 0) {
        const spot = this.nav.nearestFree(sitting.x + (Math.random() - 0.5) * 2 * CAT_ROAM.radius, sitting.y + 18 + Math.random() * 14)
        if (spot) visit.leader = spot
        visit.roamIn = between(CAT_ROAM.every)
      }
      updateCompanion(catState, delta, visit.leader, false)
    } else updateCompanion(catState, delta, brain, brain.walking)
    this.cat.render(catState)
    const alpha = visit.phase === 'out' ? Math.max(0, 1 - visit.t / CAT_FADE_MS) : Math.min(1, visit.t / CAT_FADE_MS)
    this.cat.sprite.setAlpha(alpha)
    this.cat.shadow.setAlpha(alpha)
    if (visit.phase === 'in' && alpha >= 1) visit.phase = 'here'
    if (visit.phase === 'out' && alpha <= 0) {
      visit.phase = 'away'
      this.cat.setVisible(false)
      this.npcs.setCatAway(false)
    }
  }

  // Grace, sentada, le dice cosas bonitas a Khalessi (o a las palomas si está sola) en un bocadillo; solo si la viajera está lo bastante cerca para verlo.
  speak(delta, traveller, locked) {
    const { sitting, brain } = this.people.grace
    if (!sitting || locked) return
    this.speakIn -= delta
    if (this.speakIn > 0 || this.bubbleOpen || this.npcs.bubbleOpen || distance(traveller, brain) > SPEAK_RANGE) return
    this.speakIn = between(SPEAK_EVERY)
    this.bubbleOpen = true
    this.game.events.emit('npc-bubble', this.visit.phase === 'here' ? 'graceCat' : 'gracePigeons')
  }

  publishBubble() {
    if (!this.bubbleOpen) return
    const { brain } = this.people.grace
    this.game.events.emit('bubble-anchor', screenAnchor(this.scene, brain.x, brain.y - HEAD))
  }

  // Dibuja a cada uno: sentada usa la pose sentada delante del banco, y Ylonem grabando, la hoja con la cámara y el punto rojo parpadeando.
  drawPeople(delta) {
    Object.values(this.people).forEach(({ brain, actor, sitting, filming }) => {
      actor.render({ ...brain, sitting: Boolean(sitting), alt: Boolean(filming) && !brain.walking }, delta, sitting?.depth)
    })
    const { brain, filming } = this.people.ylonem
    const recording = Boolean(filming) && brain.state !== 'talking' && Math.floor(this.clock / 450) % 2 === 0
    this.rec.setVisible(recording)
    if (recording) this.rec.setPosition(brain.x + (brain.facing === 'left' ? -3 : 3), brain.y - HEAD).setDepth(brain.y + 1)
  }

  // `locked` es que hay un diálogo o un panel abiertos: mientras tanto nadie empieza una conversación por su cuenta.
  update(delta, locked) {
    this.clock += delta
    const traveller = this.travellerAt()
    const story = getStory(this.game)
    const introduced = story.heard.includes(GRAN_ARRIVAL)
    const toDoor = distance(traveller, GRAN_DOOR)

    const event = stepArrival(this.arrival, delta, {
      due: granArrivalDue(story) && this.npcs.canLeave(),
      near: toDoor < TRIGGER_RANGE,
      far: toDoor > GIVE_UP_RANGE,
      arrived: this.lupeBrain.arrived,
      gap: distance(this.lupeBrain, traveller),
      locked,
    })
    if (event === 'start') this.startArrival()
    else if (event === 'talk') {
      startTalk(this.lupeBrain, traveller)
      this.game.events.emit('talk', GRAN_ARRIVAL)
    } else if (event === 'gone' || event === 'done') this.endArrival()

    if (isArriving(this.arrival)) {
      updateLupe(this.lupeBrain, delta, traveller)
      this.lupe.render(this.lupeBrain, delta)
      this.lupe.setAlpha(arrivalAlpha(this.arrival))
    }

    Object.values(this.people).forEach((person) => {
      updateLupe(person.brain, delta, traveller)
      // Hasta que Lupe los presenta (y mientras lo hace) se quedan quietos; después, cada uno con su rutina.
      if (introduced && !isArriving(this.arrival)) this.runRoutine(person, delta, person.brain.state === 'talking')
      this.holdPose(person)
    })
    this.drawPeople(delta)
    this.updateVisit(delta)
    this.speak(delta, traveller, locked)
    this.publishBubble()
    const { sitting } = this.people.grace
    this.flock?.update(delta, {
      source: sitting ? { hand: { x: sitting.x + 6, y: sitting.y - 12 }, feet: { x: sitting.x, y: sitting.y + 22 } } : null,
      scarers: [traveller, ...(this.visit.phase === 'away' ? [] : [this.catState])],
    })
  }
}
