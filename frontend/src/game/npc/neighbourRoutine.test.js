import { describe, expect, it } from 'vitest'
import { PAUSE_MS, SKIP_MS, createRoutine, doingNow, endNow, routineState, setSteps, skipStep, stepRoutine } from './neighbourRoutine.js'

const steps = [
  { kind: 'sit', ms: [1000, 1000] },
  { kind: 'film', ms: [500, 500] },
]
const rng = () => 0

describe('rutina de un vecino', () => {
  it('espera, echa a andar, empieza al llegar y termina pasado su tiempo', () => {
    const routine = createRoutine(steps, rng, 100)
    expect(stepRoutine(routine, 50)).toBeNull()
    expect(stepRoutine(routine, 60)).toEqual({ type: 'go', step: steps[0] })
    expect(stepRoutine(routine, 16, { walking: true })).toBeNull()
    expect(stepRoutine(routine, 16, { walking: false })).toEqual({ type: 'begin', step: steps[0] })
    expect(doingNow(routine)).toBe(steps[0])
    expect(stepRoutine(routine, 900)).toBeNull()
    expect(stepRoutine(routine, 200)).toEqual({ type: 'end', step: steps[0] })
    expect(doingNow(routine)).toBeNull()
  })

  it('repite los pasos en orden', () => {
    const routine = createRoutine(steps, rng, 0)
    const kinds = []
    for (let i = 0; i < 12; i++) {
      const event = stepRoutine(routine, 5000)
      if (event?.type === 'go') kinds.push(event.step.kind)
    }
    expect(kinds.slice(0, 4)).toEqual(['sit', 'film', 'sit', 'film'])
  })

  it('una conversación congela los tiempos del paso y de la pausa', () => {
    const routine = createRoutine(steps, rng, 0)
    stepRoutine(routine, 10)
    stepRoutine(routine, 16)
    expect(routine.phase).toBe('doing')
    expect(stepRoutine(routine, 5000, { busy: true })).toBeNull()
    expect(doingNow(routine)).toBe(steps[0])
    expect(stepRoutine(routine, 5000)).toEqual({ type: 'end', step: steps[0] })
    expect(stepRoutine(routine, 5000, { busy: true })).toBeNull()
    expect(routine.phase).toBe('pause')
  })

  it('un paso sin camino se salta y deja una espera mayor', () => {
    const routine = createRoutine(steps, rng, 0)
    expect(stepRoutine(routine, 10).type).toBe('go')
    skipStep(routine)
    expect(routine.phase).toBe('pause')
    expect(routine.wait).toBe(SKIP_MS)
    expect(SKIP_MS).toBeGreaterThanOrEqual(PAUSE_MS[0])
  })

  it('la pausa entre pasos es la de la rutina', () => {
    const routine = createRoutine(steps, rng, 0, [20000, 20000])
    stepRoutine(routine, 10)
    stepRoutine(routine, 16)
    stepRoutine(routine, 1000)
    expect(routine.phase).toBe('pause')
    expect(routine.wait).toBe(20000)
  })

  it('cambiar la lista de pasos reinicia el recorrido sin cortar el paso en curso', () => {
    const routine = createRoutine(steps, rng, 0)
    stepRoutine(routine, 10)
    const other = [{ kind: 'home', home: true, ms: [10, 10] }]
    setSteps(routine, other)
    expect(routine.step).toBe(steps[0])
    expect(stepRoutine(routine, 16)).toEqual({ type: 'begin', step: steps[0] })
    stepRoutine(routine, 2000)
    expect(stepRoutine(routine, 5000)).toEqual({ type: 'go', step: other[0] })
    setSteps(routine, other)
    expect(routine.index).toBe(0)
  })

  it('expresa su estado con el vocabulario común: idle, walking, returning, activity e interaction', () => {
    const home = [{ kind: 'home', home: true, ms: [100, 100] }]
    const routine = createRoutine(home, rng, 0)
    expect(routineState(routine)).toBe('idle')
    stepRoutine(routine, 10)
    expect(routineState(routine)).toBe('returning')
    routine.step = steps[1]
    expect(routineState(routine)).toBe('walking')
    stepRoutine(routine, 16)
    expect(routineState(routine)).toBe('activity')
    expect(routineState(routine, true)).toBe('interaction')
  })

  it('cortar el paso en curso lo termina al fotograma siguiente, y no toca un paso que aún no ha empezado', () => {
    const routine = createRoutine(steps, rng, 0)
    stepRoutine(routine, 10)
    endNow(routine)
    expect(routine.phase).toBe('walking')
    stepRoutine(routine, 16)
    expect(routine.phase).toBe('doing')
    endNow(routine)
    expect(stepRoutine(routine, 16)).toEqual({ type: 'end', step: steps[0] })
  })
})
