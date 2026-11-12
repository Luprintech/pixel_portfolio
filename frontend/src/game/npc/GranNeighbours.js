// La vida del pueblo fuera de la casa de Lupe: Ylonem, Grace y Atreus (que sale a pasear), Khalessi cuando sale de casa y la llegada de Lupe a
// presentarles Gran Capitán a la viajera. Une los cerebros (los mismos de Lupe, `lupeBrain.js`, con una rejilla de caminos propia) con lo que se ve
// y con lo que se dice. Hasta que Lupe los presenta, Ylonem y Grace se quedan junto a la puerta del IES; después cada uno sigue su rutina
// (`neighbourRoutine.js`, pasos en `granPlaces.js`): Grace se sienta en un banco y, de pie junto a la fuente, esparce semillas a las palomas
// (`PigeonFlock.js`); Ylonem recorre el pueblo grabando lo que ve; Atreus pasea y vuelve a casa. Khalessi sale por su cuenta (`catOuting.js`).
// La escena solo le da el tiempo, el cielo, la posición de la viajera y si hay un diálogo abierto.
import { createNav } from '../interior/catNav.js'
import { CHARACTERS, characterSheet } from '../characters.js'
import { registerSheet } from '../sheetTexture.js'
import { ylonemSheet } from '../interior/ylonemSheet.js'
import { facingFor } from '../walk.js'
import { PAL } from '../palette.js'
import { getStory } from '../story/storyStore.js'
import { GRAN_ARRIVAL, granArrivalDue } from '../story/story.js'
import CatActor from './CatActor.js'
import NpcActor from './NpcActor.js'
import PigeonFlock from './PigeonFlock.js'
import TownBubbles from './TownBubbles.js'
import { OUTING, beginOuting, createOuting, dueToGoOut, isOut, updateOuting } from './catOuting.js'
import { arrivalAlpha, createArrival, isArriving, stepArrival } from './granArrival.js'
import {
  ATREUS_DOOR, ATREUS_PAUSE_MS, ATREUS_REST_MS, CAT_PLAZA, FOUNTAIN, GIVE_UP_RANGE, GRAN_DOOR, LUPE_ENTRY, LUPE_MEET, PEOPLE, PIGEON_COUNT, PIGEON_HOMES, ROUTINES, SUN_SPOTS,
  TOWN_REGION, TRIGGER_RANGE, WEATHER_ROUTINES, frontOf, isNight, isRaining, isSunset,
} from './granPlaces.js'
import { createLupeBrain, endTalk, placeAt, startGuide, startTalk, updateLupe, walkTo } from './lupeBrain.js'
import { createRoutine, doingNow, endNow, setSteps, skipStep, stepRoutine } from './neighbourRoutine.js'

// A qué distancia se puede hablar con ellos.
const TALK_RANGE = 26
// Cada cuánto, como mínimo, dice Grace algo bonito, y a qué distancia de la viajera lo dice (el bocadillo solo se ve si está en pantalla).
const SPEAK_EVERY = [9000, 14000]
const SPEAK_RANGE = 170
// Cuánto tarda en decir algo desde que empieza un paso (Ylonem y Atreus dicen una frase por paso) y a qué distancia de Khalessi le habla.
const STEP_SPEAK_IN = [1800, 3600]
const CAT_NEAR = 90
// Alto sobre los pies al que sale el bocadillo y el punto rojo de la cámara.
const HEAD = 38
// Destello de la cámara de Ylonem: cada cuánto y lo que dura.
const FLASH_EVERY = [3500, 6500]
const FLASH_MS = 140
// Cuánto se queda Atreus mirando a la viajera tras saludarla.
const GREET_MS = 2400
// Lo deprisa que se sienta o se levanta del banco (px/s).
const SLIDE_SPEED = 46
// Qué pasa por el pueblo a su paso: espacio que ocupa cada persona para las palomas y los gatos.
const BODY_R = 8
const WALKER_SCARE = 12
const SKIN = Number.parseInt(CHARACTERS.grace.skin.slice(1), 16)

const touches = (r, b) => r.x < b.x + b.width && r.x + r.w > b.x && r.y < b.y + b.height && r.y + r.h > b.y
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
const between = (range) => range[0] + Math.random() * (range[1] - range[0])
const capital = (word) => word[0].toUpperCase() + word.slice(1)

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
        const walker = id === 'atreus'
        // Atreus pasea desde su casa: empieza dentro (escondido) y su rutina espera mucho entre salidas y poco entre paradas.
        const routine = walker ? createRoutine(ROUTINES.atreus, Math.random, between([30000, 60000]), ATREUS_PAUSE_MS) : createRoutine(ROUTINES[id])
        if (walker) actor.setVisible(false)
        return [id, { brain, actor, routine, sitting: null, filming: null, feeding: null, hidden: walker, speakAt: 0, spoke: true, greetLeft: 0, flashIn: 0 }]
      }),
    )
    // Lupe en esta escena: su propio dibujo y su propio cerebro, ya que la de la entrada del valle puede estar en otro sitio.
    this.lupeBrain = createLupeBrain({ nav: this.nav, post: LUPE_ENTRY })
    this.lupe = new NpcActor(scene, 'npc-lupe', LUPE_ENTRY.x, LUPE_ENTRY.y)
    this.lupe.setVisible(false)
    this.arrival = createArrival()

    // Punto rojo de "grabando" y destello sobre la cámara de Ylonem; mano extendida de Grace cuando esparce semillas.
    this.rec = scene.add.rectangle(0, 0, 3, 3, Number.parseInt(PAL.tile.slice(1), 16)).setVisible(false)
    this.flash = scene.add.rectangle(0, 0, 5, 5, 0xffffff).setVisible(false)
    this.hand = scene.add.rectangle(0, 0, 3, 2, SKIN).setVisible(false)
    // Khalessi sale de casa por su cuenta: su propio dibujo y su estado de salida (la de la entrada se esconde mientras está fuera).
    this.outing = createOuting()
    this.cat = new CatActor(scene, this.outing)
    this.cat.setVisible(false)
    // Las palomas de la plaza.
    const homes = PIGEON_HOMES.map(({ x, y }) => this.nav.nearestFree(x, y)).filter(Boolean)
    this.flock = homes.length ? new PigeonFlock(scene, homes, PIGEON_COUNT, this.nav.free) : null
    this.bubbles = new TownBubbles(scene, () => this.npcs.bubbleOpen)

    this.clock = 0
    this.speakIn = between(SPEAK_EVERY)
    this.weatherKey = ''
    scene.events.once('shutdown', () => this.destroy())
  }

  destroy() {
    this.bubbles.destroy()
    Object.values(this.people).forEach(({ actor }) => actor.destroy())
    this.lupe.destroy()
    this.cat.destroy()
    this.rec.destroy()
    this.flash.destroy()
    this.hand.destroy()
    this.flock?.destroy()
  }

  // Los dibujos de esta escena, para recortarlos de los cristales encendidos de los edificios (`litWindows.js`).
  sprites() {
    return [this.lupe.sprite, this.cat.sprite, ...Object.values(this.people).map(({ actor }) => actor.sprite)]
  }

  // Ya se les presentó Lupe: Ylonem y Grace pueden seguir su rutina y hablar por su cuenta.
  introduced() {
    return getStory(this.game).heard.includes(GRAN_ARRIVAL)
  }

  // Atreus solo sale a pasear después de su parte principal (la visita a la casa) y mientras no hay una visita guiada en marcha.
  atreusMayWalk(story) {
    return story.stops.includes('atreus') && story.tour !== 'accepted'
  }

  // Quién queda al alcance de la viajera para hablarle (el más cercano), o null. Con la llegada en marcha no se puede: la hace Lupe.
  talkTarget(x, y) {
    if (isArriving(this.arrival)) return null
    const near = Object.entries(this.people)
      .filter(([id, { hidden }]) => (id === 'atreus' ? !hidden : this.introduced()))
      .map(([id, { brain }]) => ({ id, gap: distance(brain, { x, y }) }))
      .filter(({ id, gap }) => gap <= TALK_RANGE && this.people[id].brain.state !== 'talking')
      .sort((a, b) => a.gap - b.gap)
    return near[0]?.id ?? null
  }

  // La conversación que toca: la que va con lo que está haciendo (grabando, dando de comer a las palomas) o su repetición breve.
  scriptFor(id) {
    const step = doingNow(this.people[id].routine)
    if (step?.kind === 'feed') return 'grace.palomas'
    if (step?.kind === 'film') return 'ylonem.grabando'
    return `${id}.repeticion`
  }

  // E ante uno de ellos: se para a mirarla (sentada o grabando, sin moverse de su sitio) y contesta. Atreus no abre diálogo: saluda con un
  // bocadillo, porque su paseo no es una conversación (ver `docs/DIALOGOS.md`, "Atreus: frases de paseo").
  talk(id) {
    const person = this.people[id]
    startTalk(person.brain, this.travellerAt())
    if (id === 'atreus') {
      person.greetLeft = GREET_MS
      this.say(id, 'atreusWalk')
      return
    }
    this.game.events.emit('talk', this.scriptFor(id))
  }

  // Al cerrarse el diálogo, cada uno vuelve a lo que hacía.
  onUnlock() {
    Object.entries(this.people).forEach(([id, { brain }]) => {
      if (id !== 'atreus') endTalk(brain)
    })
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

  // El bocadillo de `id` (sobre su cabeza). Devuelve si ha salido: no sale con otro abierto.
  say(id, key) {
    const { brain } = this.people[id]
    return this.bubbles.say(key, () => ({ x: brain.x, y: brain.y - HEAD }))
  }

  // La rutina echa a andar a uno hacia el sitio de su paso (sin camino, lo salta) o le hace empezar lo que va a hacer allí.
  runRoutine(id, person, delta, busy) {
    const { brain, routine } = person
    const event = stepRoutine(routine, delta, { busy, walking: brain.path.length > 0 || brain.state === 'routine' })
    if (event?.type === 'go') this.goTo(id, person, event.step)
    else if (event?.type === 'begin') this.beginStep(id, person, event.step)
    else if (event?.type === 'end') this.endStep(id, person, event.step)
  }

  goTo(id, person, step) {
    const { brain, routine } = person
    person.slide = null
    // Atreus sale por la puerta de su casa: aparece en ella (sin camino que recorrer fuera de escena) y echa a andar desde ahí.
    if (id === 'atreus' && person.hidden) {
      placeAt(brain, ATREUS_DOOR.x, ATREUS_DOOR.y)
      person.hidden = false
      person.actor.setVisible(true)
    }
    const reachable = distance(brain, step.to) < 6 || walkTo(brain, step.to)
    if (!reachable) skipStep(routine)
    // Grace camina a un banco: es lo que llama a Khalessi (si está en casa y puede salir, sale en unos segundos).
    else if (id === 'grace' && step.kind === 'sit') this.outing.restLeft = Math.min(this.outing.restLeft, 3000)
  }

  beginStep(id, person, step) {
    const { brain } = person
    brain.walking = false
    person.spoke = false
    person.speakAt = this.clock + between(STEP_SPEAK_IN)
    if (step.kind === 'sit') {
      // Se sube al banco andando los pocos pasos que lo separan de su asiento, no de golpe.
      person.slide = { to: step.bench.seat, sit: true }
      this.speakIn = between(SPEAK_EVERY) / 2
    } else if (step.kind === 'film') {
      person.filming = step
      person.flashIn = between(FLASH_EVERY) / 2
    } else if (step.kind === 'feed') {
      person.feeding = step
      this.speakIn = between(SPEAK_EVERY) / 3
    } else if (step.home) {
      // Llega a su puerta y entra: desaparece ahí, a la vista y andando, no en mitad del camino.
      person.hidden = true
      person.actor.setVisible(false)
    }
  }

  endStep(id, person, step) {
    if (step.kind === 'sit') {
      person.sitting = null
      person.slide = { to: step.bench.front, sit: false }
    }
    // Atreus entra y descansa en casa hasta el próximo paseo (la pausa de la rutina de después del paso es la corta de entre paradas).
    if (step.home) person.routine.wait = between(ATREUS_REST_MS)
    person.filming = null
    person.feeding = null
    person.spoke = true
  }

  // Sentarse y levantarse del banco: unos pasos entre el sitio de delante y el asiento, con la marcha, a un paso corto.
  advanceSlide(person, delta) {
    const { brain, slide } = person
    if (!slide) return
    const dx = slide.to.x - brain.x
    const dy = slide.to.y - brain.y
    const left = Math.hypot(dx, dy)
    const step = (SLIDE_SPEED * delta) / 1000
    if (left <= step) {
      Object.assign(brain, { x: slide.to.x, y: slide.to.y, walking: false })
      if (slide.sit) {
        brain.facing = slide.to.facing
        person.sitting = slide.to
      }
      person.slide = null
      return
    }
    brain.x += (dx / left) * step
    brain.y += (dy / left) * step
    brain.facing = facingFor(dx, dy)
    brain.walking = true
  }

  // Mientras hace su paso mantiene lo que lo define: sentada mira de frente, grabando mira a lo que filma y esparciendo semillas mira hacia donde caen.
  holdPose(person) {
    const { brain } = person
    if (brain.state === 'talking') return
    if (person.sitting) brain.facing = person.sitting.facing
    const target = person.filming ?? person.feeding ?? doingNow(person.routine)
    if (target?.look && !brain.walking) brain.facing = facingFor(target.look.x - brain.x, target.look.y - brain.y)
  }

  // Cambia la rutina de cada uno según el tiempo: con lluvia se refugian (Ylonem y Grace en la fachada del IES; Atreus vuelve a casa), al atardecer
  // Ylonem va a filmar el cielo y, de noche, Atreus se recoge. Al cambiar el tiempo se corta el paso en curso (no se queda sentada bajo la lluvia).
  applyWeather(weather, atreusOk) {
    const key = `${weather.rain}|${weather.night}|${weather.sunset}|${atreusOk}`
    if (key === this.weatherKey) return
    const first = this.weatherKey === ''
    this.weatherKey = key
    const { ylonem, grace, atreus } = this.people
    const yWant = weather.rain ? WEATHER_ROUTINES.ylonemRain : weather.sunset ? WEATHER_ROUTINES.ylonemSunset : ROUTINES.ylonem
    const gWant = weather.rain ? WEATHER_ROUTINES.graceRain : ROUTINES.grace
    const aWant = weather.rain || weather.night || !atreusOk ? WEATHER_ROUTINES.atreusHome : ROUTINES.atreus
    ;[[ylonem, yWant], [grace, gWant], [atreus, aWant]].forEach(([person, want]) => {
      if (person.routine.steps === want) return
      setSteps(person.routine, want)
      if (!first) endNow(person.routine)
    })
  }

  // Khalessi sale de casa cuando toca (o cuando Grace va a un banco, que es lo que la llama): anda por los caminos hasta la plaza.
  startOuting() {
    // No sale durante la bienvenida (Lupe y ella esperan en la entrada) ni mientras algo la reclama junto a Lupe.
    if (getStory(this.game).welcome !== 'done' || !dueToGoOut(this.outing, this.catContext()) || !this.npcs.canSpareCat()) return
    const goal = this.nav.nearestFree(CAT_PLAZA.x, CAT_PLAZA.y)
    if (!goal || !beginOuting(this.outing, this.npcs.catSpot(), goal, this.nav)) {
      this.outing.restLeft = OUTING.restMs[0]
      return
    }
    this.npcs.setCatAway(true)
    this.cat.setVisible(true)
  }

  // Lo que Khalessi tiene alrededor: de quién huye, qué mira y qué le cierra el paso.
  catContext(extra = {}) {
    const weather = this.weather ?? {}
    const traveller = this.travellerAt()
    const { grace } = this.people
    const others = [traveller, ...Object.values(this.people).filter(({ hidden }) => !hidden).map(({ brain }) => brain)]
    return {
      nav: this.nav,
      home: this.npcs.catHome(),
      rain: weather.rain,
      night: weather.night,
      recalled: this.npcs.catRecalled(),
      others,
      grace: { x: grace.brain.x, y: grace.brain.y, sitting: Boolean(grace.sitting) },
      pigeons: this.flock?.flock.pigeons ?? [],
      sunSpots: SUN_SPOTS,
      fountain: FOUNTAIN,
      butterflies: extra.butterflies ?? [],
      traveller,
    }
  }

  updateCat(delta, extra) {
    const ctx = this.catContext(extra)
    if (isOut(this.outing)) {
      if (updateOuting(this.outing, delta, ctx) === 'home') {
        this.npcs.returnCat(this.outing.x, this.outing.y)
        this.cat.setVisible(false)
        return
      }
      this.cat.render(this.outing)
    } else {
      updateOuting(this.outing, delta, ctx)
      this.startOuting()
    }
  }

  // Grace le habla a Khalessi si la tiene a su lado, y a las palomas mientras les echa de comer; solo si la viajera está lo bastante cerca para
  // verlo. Ylonem y Atreus dicen una frase por paso (ver `beginStep`).
  speak(traveller, locked) {
    if (locked || this.bubbles.open) return
    const { grace, ylonem, atreus } = this.people
    if (this.clock >= this.graceSpeakAt && (grace.sitting || grace.feeding) && distance(traveller, grace.brain) <= SPEAK_RANGE) {
      const catBeside = isOut(this.outing) && distance(this.outing, grace.brain) < CAT_NEAR
      const key = grace.feeding ? 'gracePigeons' : catBeside ? 'graceCat' : null
      if (key && this.say('grace', key)) this.graceSpeakAt = this.clock + between(SPEAK_EVERY)
      else if (!key) this.graceSpeakAt = this.clock + 2000
    }
    ;[['ylonem', ylonem], ['atreus', atreus]].forEach(([id, person]) => {
      if (person.spoke || this.clock < person.speakAt || person.hidden || distance(traveller, person.brain) > SPEAK_RANGE) return
      const step = doingNow(person.routine)
      if (!step?.topic) return
      const catNear = isOut(this.outing) && distance(this.outing, person.brain) < CAT_NEAR
      const key = id === 'atreus' ? 'atreusWalk' : catNear && Math.random() < 0.5 ? 'ylonemCat' : `ylonem${capital(step.topic)}`
      if (this.say(id, key)) person.spoke = true
    })
  }

  // La mano extendida de Grace y las migas: de pie y esparciendo semillas, la mano sale hacia delante (sube y baja con cada puñado) y el puñado
  // cae delante de ella, entre las palomas.
  feedSource() {
    const { brain, feeding } = this.people.grace
    if (!feeding || brain.state === 'talking' || brain.walking) return null
    const side = brain.facing === 'left' ? -1 : brain.facing === 'right' ? 1 : 0
    const hand = { x: brain.x + side * 9 + (side ? 0 : 3), y: brain.y - (side ? 13 : 9) }
    return { hand, feet: frontOf(brain, feeding.look, 22) }
  }

  // Dibuja a cada uno: sentada usa la pose sentada delante del banco, y Ylonem grabando, la hoja con la cámara, el punto rojo y el destello.
  drawPeople(delta, source) {
    Object.values(this.people).forEach(({ brain, actor, sitting, filming, hidden }) => {
      if (hidden) return
      actor.render({ ...brain, sitting: Boolean(sitting), alt: Boolean(filming) && !brain.walking }, delta, sitting?.depth)
    })
    const { brain, filming } = this.people.ylonem
    const recording = Boolean(filming) && brain.state !== 'talking' && Math.floor(this.clock / 450) % 2 === 0
    this.rec.setVisible(recording)
    const ahead = brain.facing === 'left' ? -3 : 3
    if (recording) this.rec.setPosition(brain.x + ahead, brain.y - HEAD).setDepth(brain.y + 1)
    const person = this.people.ylonem
    person.flashIn -= delta
    if (filming && brain.state !== 'talking' && person.flashIn <= 0) {
      person.flashIn = between(FLASH_EVERY)
      person.flashLeft = FLASH_MS
    }
    person.flashLeft = Math.max(0, (person.flashLeft ?? 0) - delta)
    this.flash.setVisible(person.flashLeft > 0)
    if (person.flashLeft > 0) this.flash.setPosition(brain.x + ahead * 2.4, brain.y - HEAD + 2).setDepth(brain.y + 2)
    // La mano de Grace: un puñado cada vez que echa semillas, con la mano un píxel más arriba.
    this.hand.setVisible(Boolean(source))
    if (source) this.hand.setPosition(source.hand.x, source.hand.y - (Math.floor(this.clock / 420) % 2)).setDepth(this.people.grace.brain.y + 1)
  }

  // Quién anda por el pueblo ocupa su sitio ante las palomas, y quien pasa andando las espanta si se les echa encima.
  flockPeople(traveller) {
    const visible = Object.values(this.people).filter(({ hidden }) => !hidden)
    const bodies = visible.map(({ brain }) => ({ x: brain.x, y: brain.y, r: BODY_R }))
    const walkers = visible.filter(({ brain }) => brain.walking).map(({ brain }) => ({ x: brain.x, y: brain.y, range: WALKER_SCARE }))
    const cat = isOut(this.outing) ? [{ x: this.outing.x, y: this.outing.y }] : []
    return { bodies, scarers: [traveller, ...walkers, ...cat] }
  }

  // `locked` es que hay un diálogo o un panel abiertos: mientras tanto nadie empieza una conversación por su cuenta. `sky` es el estado del cielo
  // del fotograma anterior (o null) y `ambient` lo que haya de vida alrededor (mariposas).
  update(delta, locked, sky = null, ambient = {}) {
    this.clock += delta
    if (this.graceSpeakAt === undefined) this.graceSpeakAt = this.clock + between(SPEAK_EVERY)
    const traveller = this.travellerAt()
    const story = getStory(this.game)
    const introduced = story.heard.includes(GRAN_ARRIVAL)
    const toDoor = distance(traveller, GRAN_DOOR)
    const weather = { rain: isRaining(sky), night: isNight(sky), sunset: isSunset(sky) }
    this.weather = weather

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

    this.applyWeather(weather, this.atreusMayWalk(story))
    Object.entries(this.people).forEach(([id, person]) => {
      updateLupe(person.brain, delta, traveller)
      // Atreus se queda mirando a la viajera un momento tras saludarla y sigue.
      if (person.greetLeft > 0 && (person.greetLeft -= delta) <= 0) endTalk(person.brain)
      const active = id === 'atreus' ? true : introduced && !isArriving(this.arrival)
      if (active) {
        // Atreus no sale de casa con lluvia, de noche ni sin permiso de la historia: su rutina espera con el reloj parado.
        const frozen = id === 'atreus' && person.hidden && (weather.rain || weather.night || !this.atreusMayWalk(story) || isArriving(this.arrival))
        this.runRoutine(id, person, delta, person.brain.state === 'talking' || frozen)
      }
      this.advanceSlide(person, delta)
      this.holdPose(person)
    })
    const source = this.feedSource()
    this.drawPeople(delta, source)
    this.updateCat(delta, ambient)
    this.speak(traveller, locked)
    this.bubbles.publish()
    const { bodies, scarers } = this.flockPeople(traveller)
    this.flock?.update(delta, { source, scarers, bodies })
  }
}
