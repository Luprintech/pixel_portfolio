import { describe, expect, it } from 'vitest'
import { homeNav } from '../interior/homeNav.js'
import { INTERACTIONS, homeRoom } from '../interior/homeLayout.js'
import { TOUR_STOPS, completeStop, initialStory, nextStop, setTour } from '../story/story.js'
import { SCRIPTS } from '../dialogue/scripts.js'
import { DIALOGUE_COPY } from '../../lib/dialogueCopy.js'
import { AFTER_TALK, LUPE_MIN_Y, OFFER_TALK, PAUSE_TALK, TOUR, applyTourAction, canTalkTo, closeWithoutChoice, createHomeTour, snapSpots, stopTalk, talkToLupe, updateHomeTour } from './homeTour.js'

const nav = homeNav(LUPE_MIN_Y)
const spots = snapSpots(nav)
const START = { ...initialStory(), welcome: 'done', tour: 'accepted' }

// La viajera aparece junto a la puerta, donde la deja el valle.
const traveller = () => ({ ...homeRoom().spawn })

// Avanza la visita `ms` milisegundos con la viajera en `at`. Devuelve el primer suceso de conversación que ocurra.
function run(tour, at, ms, locked = false, step = 50) {
  let event = null
  for (let t = 0; t < ms; t += step) event = updateHomeTour(tour, step, at, locked) ?? event
  return event
}

// Lleva a la viajera pegada a Lupe y espera la conversación de la parada.
function approach(tour, ms = 20000) {
  let event = null
  for (let t = 0; t < ms && !event; t += 50) {
    const { x, y } = tour.brain
    event = updateHomeTour(tour, 50, { x: x + 10, y: y + 10 }, false)
  }
  return event
}

describe('sitios de la visita', () => {
  it('están en suelo libre y se llega a todos desde la entrada', () => {
    TOUR_STOPS.forEach((id) => {
      expect(nav.free(spots[id].x, spots[id].y), id).toBe(true)
      expect(nav.path(spots.entrada, spots[id]), id).not.toBeNull()
    })
  })

  it('Lupe espera cerca de lo que presenta (a menos de 70 px de la interacción)', () => {
    const anchor = (id) => INTERACTIONS.find((interaction) => interaction.id === id).anchor
    const near = { impresoras: 'printerMini', atreus: 'atreus', pc: 'pc', khalessi: 'khalessi' }
    Object.entries(near).forEach(([stop, interaction]) => {
      const a = anchor(interaction)
      expect(Math.hypot(spots[stop].x - a.x, spots[stop].y - a.y), stop).toBeLessThan(70)
    })
  })

  it('la entrada queda a unos pasos de donde aparece la viajera: hay que acercarse', () => {
    const gap = Math.hypot(spots.entrada.x - traveller().x, spots.entrada.y - traveller().y)
    expect(gap).toBeGreaterThan(TOUR.reach)
    expect(gap).toBeLessThan(TOUR.talkRange + 20)
  })
})

describe('visita por dentro de la casa', () => {
  it('Lupe espera en la entrada y no habla hasta que la viajera se acerca y pasa el fundido', () => {
    const tour = createHomeTour({ nav, story: START })
    expect(tour.phase).toBe('arrived')
    expect(tour.stop).toBe('entrada')
    const far = { x: tour.brain.x + 200, y: tour.brain.y + 100 }
    expect(run(tour, far, 3000)).toBeNull()
    expect(run(tour, { x: tour.brain.x + 10, y: tour.brain.y + 10 }, 100)).toEqual({ type: 'talk', id: 'tour.entrada' })
    expect(tour.phase).toBe('talking')
  })

  it('no abre nada mientras haya un diálogo o un panel abierto', () => {
    const tour = createHomeTour({ nav, story: START })
    const near = { x: tour.brain.x + 10, y: tour.brain.y + 10 }
    expect(run(tour, near, 3000, true)).toBeNull()
    expect(run(tour, near, 100, false)).not.toBeNull()
  })

  it('cerrar con Esc no cuenta la parada y no se reabre sola hasta que la viajera se aleje y vuelva', () => {
    const tour = createHomeTour({ nav, story: START })
    const near = { x: tour.brain.x + 10, y: tour.brain.y + 10 }
    run(tour, near, 1000)
    closeWithoutChoice(tour)
    expect(tour.phase).toBe('arrived')
    expect(nextStop(START)).toBe('entrada')
    expect(run(tour, near, 3000)).toBeNull()
    run(tour, { x: near.x + 150, y: near.y }, 200)
    expect(run(tour, near, 200)).toEqual({ type: 'talk', id: 'tour.entrada' })
  })

  it('con E ante Lupe se reabre la parada que quedó a medias', () => {
    const tour = createHomeTour({ nav, story: START })
    const near = { x: tour.brain.x + 10, y: tour.brain.y + 10 }
    run(tour, near, 1000)
    closeWithoutChoice(tour)
    expect(canTalkTo(tour, near)).toBe(true)
    expect(talkToLupe(tour, near)).toEqual({ type: 'talk', id: 'tour.entrada' })
  })

  it('«Sigamos» cuenta la parada y Lupe echa a andar hacia la siguiente por un camino libre; solo habla al llegar la viajera', () => {
    const tour = createHomeTour({ nav, story: START })
    run(tour, { x: tour.brain.x + 10, y: tour.brain.y + 10 }, 1000)
    const story = applyTourAction(tour, 'tour-next', START)
    expect(story.stops).toEqual(['entrada'])
    expect(tour.phase).toBe('leading')
    expect(tour.stop).toBe('impresoras')
    // Cada fotograma de su camino pisa suelo libre.
    let event = null
    for (let t = 0; t < 30000 && !event; t += 50) {
      const { x, y } = tour.brain
      event = updateHomeTour(tour, 50, { x: x + 12, y: y + 12 }, false)
      expect(nav.free(tour.brain.x, tour.brain.y)).toBe(true)
    }
    expect(event).toEqual({ type: 'talk', id: 'tour.impresoras' })
    expect(Math.hypot(tour.brain.x - spots.impresoras.x, tour.brain.y - spots.impresoras.y)).toBeLessThan(2)
  })

  it('si la viajera se queda atrás, Lupe se para a esperarla y no abandona nunca la visita', () => {
    const tour = createHomeTour({ nav, story: START })
    run(tour, { x: tour.brain.x + 10, y: tour.brain.y + 10 }, 1000)
    applyTourAction(tour, 'tour-next', START)
    const left = { x: 40, y: 250 }
    run(tour, left, 120000)
    expect(tour.brain.abandoned).toBe(false)
    expect(['waiting', 'guiding']).toContain(tour.brain.state)
    expect(tour.phase).toBe('leading')
  })

  it('recorre las seis paradas en orden y la visita queda completada; después Lupe solo conversa', () => {
    const tour = createHomeTour({ nav, story: START })
    let story = START
    const seen = []
    for (let i = 0; i < TOUR_STOPS.length; i++) {
      const event = approach(tour)
      seen.push(event.id)
      story = applyTourAction(tour, i === TOUR_STOPS.length - 1 ? 'tour-finish' : 'tour-next', story)
    }
    expect(seen).toEqual(TOUR_STOPS.map(stopTalk))
    expect(story.tour).toBe('completed')
    expect(story.stops).toEqual(TOUR_STOPS)
    expect(tour.phase).toBe('done')
    expect(tour.brain.walking).toBe(false)
    expect(talkToLupe(tour, { x: tour.brain.x, y: tour.brain.y })).toEqual({ type: 'talk', id: AFTER_TALK })
  })

  it('mirar con calma cuenta la parada y deja a Lupe esperando; hablar con ella ofrece seguir y retoma por la siguiente', () => {
    const tour = createHomeTour({ nav, story: START })
    approach(tour)
    let story = applyTourAction(tour, 'tour-next', START)
    approach(tour)
    story = applyTourAction(tour, 'tour-linger', story)
    expect(story.stops).toEqual(['entrada', 'impresoras'])
    expect(story.tour).toBe('accepted')
    expect(tour.phase).toBe('paused')
    const at = { x: tour.brain.x + 10, y: tour.brain.y }
    const spot = { x: tour.brain.x, y: tour.brain.y }
    expect(run(tour, at, 5000)).toBeNull()
    expect({ x: tour.brain.x, y: tour.brain.y }).toEqual(spot)
    expect(talkToLupe(tour, at)).toEqual({ type: 'talk', id: PAUSE_TALK })
    story = applyTourAction(tour, 'tour-resume', story)
    expect(tour.phase).toBe('leading')
    expect(tour.stop).toBe('atreus')
    expect(story.tour).toBe('accepted')
  })

  it('dejar la visita la deja con lo ya visto y sin insistir, y se retoma por la siguiente parada', () => {
    const tour = createHomeTour({ nav, story: START })
    approach(tour)
    let story = applyTourAction(tour, 'tour-next', START)
    approach(tour)
    story = applyTourAction(tour, 'tour-leave', story)
    expect(story.tour).toBe('cancelled')
    expect(story.stops).toEqual(['entrada', 'impresoras'])
    talkToLupe(tour, { x: tour.brain.x, y: tour.brain.y })
    story = applyTourAction(tour, 'tour-resume', story)
    expect(story.tour).toBe('accepted')
    expect(tour.stop).toBe('atreus')
  })

  it('hablar con Lupe a mitad de camino la para, y cerrar con Esc la deja seguir', () => {
    const tour = createHomeTour({ nav, story: START })
    approach(tour)
    applyTourAction(tour, 'tour-next', START)
    run(tour, { x: tour.brain.x + 10, y: tour.brain.y + 10 }, 400)
    expect(tour.phase).toBe('leading')
    expect(talkToLupe(tour, { x: tour.brain.x, y: tour.brain.y })).toEqual({ type: 'talk', id: PAUSE_TALK })
    expect(tour.brain.state).toBe('talking')
    closeWithoutChoice(tour)
    expect(tour.phase).toBe('leading')
    expect(tour.brain.state).toBe('guiding')
  })

  it('pausar a mitad de camino no cuenta ninguna parada', () => {
    const tour = createHomeTour({ nav, story: START })
    approach(tour)
    let story = applyTourAction(tour, 'tour-next', START)
    run(tour, { x: tour.brain.x + 10, y: tour.brain.y + 10 }, 400)
    talkToLupe(tour, { x: tour.brain.x, y: tour.brain.y })
    story = applyTourAction(tour, 'tour-linger', story)
    expect(story.stops).toEqual(['entrada'])
    expect(tour.phase).toBe('paused')
  })

  it('con avance guardado Lupe aparece en la entrada y va directa a la parada que toca', () => {
    const saved = setTour(completeStop(completeStop(START, 'entrada'), 'impresoras'), 'accepted')
    const tour = createHomeTour({ nav, story: saved })
    expect(tour.stop).toBe('atreus')
    expect(tour.phase).toBe('leading')
    expect(approach(tour)).toEqual({ type: 'talk', id: 'tour.atreus' })
  })

  it('una acción que no es de la visita no cambia nada', () => {
    const tour = createHomeTour({ nav, story: START })
    run(tour, { x: tour.brain.x + 10, y: tour.brain.y + 10 }, 1000)
    expect(applyTourAction(tour, 'desktop', START)).toBe(START)
    expect(tour.phase).toBe('arrived')
  })

  it('con todas las paradas hechas no hay nada que guiar', () => {
    const done = { ...START, tour: 'completed', stops: [...TOUR_STOPS] }
    expect(createHomeTour({ nav, story: done }).phase).toBe('done')
  })
})

describe('guion y textos de la visita', () => {
  const talks = [...TOUR_STOPS.map(stopTalk), PAUSE_TALK, AFTER_TALK]
  const nodes = Object.entries(SCRIPTS).filter(([id]) => id.startsWith('tour.'))

  it('hay una conversación por parada, la de pausa y la de después', () => {
    talks.forEach((id) => expect(SCRIPTS[id], id).toBeTruthy())
  })

  it('todas las páginas y opciones tienen texto en español e inglés', () => {
    nodes.forEach(([id, node]) => {
      node.pages.forEach((page) => {
        ;['es', 'en'].forEach((lang) => expect(DIALOGUE_COPY[lang].lines[page.text], `${lang} ${page.text}`).toBeTruthy())
      })
      ;(node.options ?? []).forEach((option) => {
        ;['es', 'en'].forEach((lang) => expect(DIALOGUE_COPY[lang].options[option.label], `${lang} ${id}/${option.label}`).toBeTruthy())
      })
    })
  })

  it('cada parada deja seguir, mirar con calma y seguir por su cuenta; la última solo se cierra con su despedida', () => {
    ;['tour.entrada', 'tour.impresoras', 'tour.atreus', 'tour.pc', 'tour.khalessi'].forEach((id) => {
      const actions = SCRIPTS[id].options.map((option) => option.action)
      expect(actions, id).toEqual(expect.arrayContaining(['tour-next', 'tour-linger', 'tour-leave']))
    })
    expect(SCRIPTS['tour.cierre'].options.map((option) => option.action)).toEqual(['tour-finish'])
  })

  it('las preguntas opcionales de una parada vuelven a su menú, con las mismas salidas', () => {
    ;[['tour.impresoras', 'tour.impresoras_imprimir', 'tour.impresoras_vitrina'], ['tour.atreus', 'tour.atreus_consolas'], ['tour.pc', 'tour.pc_escritorio']].forEach(([main, ...extra]) => {
      const exits = SCRIPTS[main].options.map((option) => option.id)
      extra.forEach((id) => expect(SCRIPTS[id].options.map((option) => option.id), id).toEqual(exits))
    })
  })

  it('la conversación de Atreus mantiene su voz y la de Khalessi lleva su maullido', () => {
    expect(SCRIPTS['tour.atreus'].pages.map((page) => page.who)).toEqual(['lupe', 'atreus'])
    expect(SCRIPTS['tour.khalessi'].pages[1]).toMatchObject({ who: 'khalessi', sfx: 'meow' })
  })

  it('no inventa funciones del ordenador: cita los programas que existen', () => {
    const text = ['es', 'en'].map((lang) => Object.entries(DIALOGUE_COPY[lang].lines).filter(([key]) => key.startsWith('tour.pc_escritorio')).map(([, value]) => value).join(' '))
    text.forEach((value) => ['Winamp', 'Paint', 'Visual Studio Code', 'Internet Explorer'].forEach((name) => expect(value).toContain(name)))
    // Habla de los dos retos sin desvelar secretos ni soluciones.
    expect(text[0]).toContain('ciberseguridad')
    expect(text[1]).toContain('cybersecurity')
    text.forEach((value) => expect(value.toLowerCase()).not.toMatch(/secret|bucle-seguro|césar|caesar/))
  })

  it('las líneas que piden pulsar la tecla E tienen su variante para pantallas táctiles', () => {
    ;['es', 'en'].forEach((lang) => {
      const lines = DIALOGUE_COPY[lang].lines
      Object.entries(lines)
        .filter(([key, value]) => key.startsWith('tour.') && !key.endsWith('.touch') && /\bE\b/.test(value))
        .forEach(([key]) => {
          expect(lines[`${key}.touch`], `${lang} ${key}`).toBeTruthy()
          expect(lines[`${key}.touch`]).not.toMatch(/\bE\b/)
        })
    })
  })
})

describe('Lupe acude a lo que la viajera mira por su cuenta', () => {
  // Con la entrada ya contada y la viajera junto a Atreus sin que le toque, Lupe va allí y lo presenta.
  it('si la viajera se acerca a Atreus, Lupe va a su lado y abre su conversación', () => {
    let story = completeStop(START, 'entrada')
    const tour = createHomeTour({ nav, story })
    expect(tour.stop).toBe('impresoras')
    const atAtreus = { x: spots.atreus.x - 8, y: spots.atreus.y }
    let event = null
    for (let t = 0; t < 40000 && !event; t += 50) event = updateHomeTour(tour, 50, atAtreus, false, story)
    expect(tour.stop).toBe('atreus')
    expect(event).toEqual({ type: 'talk', id: 'tour.atreus' })
    expect(Math.hypot(tour.brain.x - spots.atreus.x, tour.brain.y - spots.atreus.y)).toBeLessThan(TOUR.talkRange)
    story = applyTourAction(tour, 'tour-next', story)
    expect(story.stops).toEqual(['entrada', 'atreus'])
    // La visita sigue por lo que falta, empezando por lo que viene detrás de Atreus.
    expect(tour.stop).toBe('pc')
  })

  it('lo mismo con el ordenador, también tras dejar la visita para explorar', () => {
    let story = completeStop(START, 'entrada')
    const tour = createHomeTour({ nav, story })
    story = { ...applyTourAction(tour, 'tour-leave', story), tour: 'pending' }
    // Una visita interrumpida y retomada en la casa: Lupe está quieta y sale al encuentro de lo que se mire.
    const paused = createHomeTour({ nav, story, resident: true })
    const atPc = { x: spots.pc.x + 6, y: spots.pc.y }
    let event = null
    for (let t = 0; t < 40000 && !event; t += 50) event = updateHomeTour(paused, 50, atPc, false, story)
    expect(paused.stop).toBe('pc')
    expect(event).toEqual({ type: 'talk', id: 'tour.pc' })
  })

  it('no se acerca a nada ya contado ni mientras habla, y no hay vaivén entre dos', () => {
    const story = { ...completeStop(completeStop(START, 'entrada'), 'atreus') }
    const tour = createHomeTour({ nav, story })
    const atAtreus = { x: spots.atreus.x, y: spots.atreus.y }
    run(tour, atAtreus, 1000)
    expect(tour.stop).not.toBe('atreus')
    const picks = new Set()
    for (let t = 0; t < 4000; t += 50) {
      updateHomeTour(tour, 50, spots.pc, false, story)
      picks.add(tour.stop)
    }
    expect(picks.size).toBeLessThanOrEqual(2)
  })
})

describe('Lupe residente (sin visita en marcha)', () => {
  const near = (tour) => ({ x: tour.brain.x + 10, y: tour.brain.y + 10 })

  it('está quieta, no abre nada sola ni sale al encuentro de lo que se mira si rechazó la visita', () => {
    const story = { ...START, tour: 'cancelled' }
    const tour = createHomeTour({ nav, story, resident: true })
    expect(tour.phase).toBe('paused')
    expect(run(tour, near(tour), 3000, false)).toBeNull()
    const atAtreus = { x: spots.atreus.x, y: spots.atreus.y }
    for (let t = 0; t < 5000; t += 50) updateHomeTour(tour, 50, atAtreus, false, story)
    expect(tour.stop).toBe('entrada')
    expect(tour.phase).toBe('paused')
  })

  it('al hablarle sin visita empezada la ofrece; con visita empezada pregunta si se sigue', () => {
    const fresh = createHomeTour({ nav, story: { ...START, tour: 'cancelled' }, resident: true })
    expect(talkToLupe(fresh, near(fresh))).toEqual({ type: 'talk', id: OFFER_TALK })
    const started = createHomeTour({ nav, story: { ...completeStop(START, 'entrada'), tour: 'cancelled' }, resident: true })
    expect(talkToLupe(started, near(started))).toEqual({ type: 'talk', id: PAUSE_TALK })
  })

  it('aceptar la oferta pone la visita en marcha por la primera parada', () => {
    const story = { ...START, tour: 'cancelled' }
    const tour = createHomeTour({ nav, story, resident: true })
    talkToLupe(tour, near(tour))
    const next = applyTourAction(tour, 'tour-resume', story)
    expect(next.tour).toBe('accepted')
    expect(tour.stop).toBe('entrada')
    expect(tour.started).toBe(true)
  })

  it('con la visita completada habla de lo ya visto y no ofrece nada', () => {
    const tour = createHomeTour({ nav, story: { ...START, tour: 'completed', stops: [...TOUR_STOPS] }, resident: true })
    expect(tour.phase).toBe('done')
    expect(talkToLupe(tour, near(tour))).toEqual({ type: 'talk', id: AFTER_TALK })
  })

  it('la oferta tiene texto en los dos idiomas y opciones válidas', () => {
    ;['es', 'en'].forEach((lang) => expect(DIALOGUE_COPY[lang].lines['tour.ofrecer.1'], lang).toBeTruthy())
    expect(SCRIPTS['tour.ofrecer'].options.map((o) => o.action)).toEqual(['tour-resume', 'tour-leave'])
  })
})
