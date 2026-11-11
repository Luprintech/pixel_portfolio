import { describe, expect, it } from 'vitest'
import { CONVERSATION, VISIT_TUNING, beginTalk, createVisit, isVisiting, startVisit, stepVisit, visitAlpha, visitDue } from './deckVisit.js'

const story = (extra) => ({ tour: 'none', heard: [], ...extra })
const run = (visit, ms, state) => {
  const events = []
  for (let t = 0; t < ms; t += 50) {
    const event = stepVisit(visit, 50, state)
    if (event) events.push(event)
  }
  return events
}

describe('visita de Lupe a la azotea', () => {
  it('toca la primera vez, no si ya se escuchó ni mientras guía la visita a la casa', () => {
    expect(visitDue(story())).toBe(true)
    expect(visitDue(story({ heard: [CONVERSATION] }))).toBe(false)
    expect(visitDue(story({ tour: 'accepted' }))).toBe(false)
  })

  it('aparece con un fundido, abre la conversación, espera a que se cierre y se va', () => {
    const visit = createVisit()
    startVisit(visit)
    expect(isVisiting(visit)).toBe(true)
    expect(visitAlpha(visit)).toBe(0)
    expect(run(visit, VISIT_TUNING.talkAfterMs + 100, { onDeck: true, locked: false })).toEqual(['talk'])
    expect(visit.phase).toBe('talking')
    expect(visitAlpha(visit)).toBe(1)
    // La conversación se abre y se cierra: solo entonces se despide.
    expect(run(visit, 200, { onDeck: true, locked: true })).toEqual([])
    expect(visit.phase).toBe('talking')
    run(visit, 50, { onDeck: true, locked: false })
    expect(visit.phase).toBe('leaving')
    expect(run(visit, VISIT_TUNING.fadeOutMs + 100, { onDeck: true, locked: false })).toEqual(['gone'])
    expect(isVisiting(visit)).toBe(false)
  })

  it('no empieza a hablar mientras haya algo abierto', () => {
    const visit = createVisit()
    startVisit(visit)
    expect(run(visit, 3000, { onDeck: true, locked: true })).toEqual([])
    expect(visit.phase).toBe('here')
  })

  it('si la viajera baja antes de la conversación, se cancela', () => {
    const visit = createVisit()
    startVisit(visit)
    expect(run(visit, 300, { onDeck: false, locked: false })).toEqual(['gone'])
    expect(visit.phase).toBe('away')
  })

  it('si la conversación nunca llega a bloquear el juego, se da por perdida y se va', () => {
    const visit = createVisit()
    startVisit(visit)
    beginTalk(visit)
    run(visit, VISIT_TUNING.lockWaitMs + 100, { onDeck: true, locked: false })
    expect(visit.phase).toBe('leaving')
  })
})
