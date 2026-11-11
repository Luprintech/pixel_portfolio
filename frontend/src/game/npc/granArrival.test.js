import { describe, expect, it } from 'vitest'
import { ARRIVAL_TUNING, arrivalAlpha, createArrival, isArriving, stepArrival } from './granArrival.js'
import { GIVE_UP_RANGE, GRAN_DOOR, LUPE_ENTRY, LUPE_MEET, PEOPLE, TOWN_REGION, TRIGGER_RANGE } from './granPlaces.js'

const idle = { due: true, near: true, far: false, arrived: false, gap: 200, locked: false }

describe('llegada de Lupe al IES Gran Capitán', () => {
  it('empieza al acercarse a la puerta, solo si toca y no hay un diálogo abierto', () => {
    expect(stepArrival(createArrival(), 16, { ...idle, due: false })).toBeNull()
    expect(stepArrival(createArrival(), 16, { ...idle, near: false })).toBeNull()
    expect(stepArrival(createArrival(), 16, { ...idle, locked: true })).toBeNull()
    const arrival = createArrival()
    expect(stepArrival(arrival, 16, idle)).toBe('start')
    expect(arrival.phase).toBe('walking')
  })

  it('anda, espera a la viajera y abre la conversación cuando está al lado', () => {
    const arrival = createArrival()
    stepArrival(arrival, 16, idle)
    expect(stepArrival(arrival, 16, { ...idle, arrived: false, gap: 10 })).toBeNull()
    expect(stepArrival(arrival, 16, { ...idle, arrived: true, gap: 200 })).toBeNull()
    expect(arrival.phase).toBe('waiting')
    expect(stepArrival(arrival, 16, { ...idle, arrived: true, gap: ARRIVAL_TUNING.talkRange - 1 })).toBe('talk')
    expect(arrival.phase).toBe('talking')
  })

  it('al cerrarse el diálogo Lupe se desvanece y la llegada termina', () => {
    const arrival = createArrival()
    stepArrival(arrival, 16, idle)
    stepArrival(arrival, 16, { ...idle, arrived: true, gap: 10 })
    expect(arrival.phase).toBe('talking')
    stepArrival(arrival, 16, { ...idle, locked: true })
    stepArrival(arrival, 16, idle)
    expect(arrival.phase).toBe('leaving')
    expect(stepArrival(arrival, ARRIVAL_TUNING.fadeOutMs, idle)).toBe('done')
    expect(isArriving(arrival)).toBe(false)
  })

  it('si la página no llega a bloquear el juego, se da por hecha pasado el tope', () => {
    const arrival = createArrival()
    stepArrival(arrival, 16, idle)
    stepArrival(arrival, 16, { ...idle, arrived: true, gap: 10 })
    stepArrival(arrival, ARRIVAL_TUNING.lockWaitMs + 1, idle)
    expect(arrival.phase).toBe('leaving')
  })

  it('si la viajera se aleja antes de hablar, se cancela y puede volver a darse', () => {
    const arrival = createArrival()
    stepArrival(arrival, 16, idle)
    expect(stepArrival(arrival, 16, { ...idle, far: true })).toBe('gone')
    expect(stepArrival(arrival, 16, idle)).toBe('start')
  })

  it('Lupe aparece con un fundido y se va con otro', () => {
    expect(arrivalAlpha({ phase: 'away', t: 0 })).toBe(0)
    expect(arrivalAlpha({ phase: 'walking', t: ARRIVAL_TUNING.fadeInMs / 2 })).toBeCloseTo(0.5)
    expect(arrivalAlpha({ phase: 'talking', t: 0 })).toBe(1)
    expect(arrivalAlpha({ phase: 'leaving', t: ARRIVAL_TUNING.fadeOutMs })).toBe(0)
  })
})

describe('sitios de los alrededores del IES', () => {
  const inside = ({ x, y }) => x > TOWN_REGION.x && x < TOWN_REGION.x + TOWN_REGION.width && y > TOWN_REGION.y && y < TOWN_REGION.y + TOWN_REGION.height

  it('todos los puntos caen dentro de la rejilla de caminos', () => {
    const points = [LUPE_ENTRY, LUPE_MEET, ...Object.values(PEOPLE).map(({ post }) => post)]
    points.forEach((point) => expect(inside(point), JSON.stringify(point)).toBe(true))
  })

  it('el disparo está dentro de la zona y el abandono más lejos', () => {
    expect(TRIGGER_RANGE).toBeLessThan(GIVE_UP_RANGE)
    expect(Math.hypot(LUPE_MEET.x - GRAN_DOOR.x, LUPE_MEET.y - GRAN_DOOR.y)).toBeLessThan(TRIGGER_RANGE)
  })
})
