import { describe, expect, it } from 'vitest'
import { BITE_MS, CAST_MS, CATCHES, COIN_FIND, FINAL_PHASES, WAIT_RANGE, rollCatch, startCast, stepCast } from './fishing.js'
import { addItem, hasItem, initialStory, recordCatch, sanitizeStory } from './story/story.js'

// Avanza un lance a pasos de 50 ms hasta que `until(cast)` se cumple o se acaban los pasos, y devuelve todos los sucesos.
function run(cast, until, pullAt = () => false, limit = 400) {
  const events = []
  for (let i = 0; i < limit && !until(cast); i++) events.push(...stepCast(cast, 50, pullAt(cast)))
  return events
}

describe('lance', () => {
  it('echa la caña, espera un tiempo aleatorio acotado y pica', () => {
    const early = startCast(() => 0)
    const late = startCast(() => 0.999)
    expect(early.wait).toBe(WAIT_RANGE[0])
    expect(late.wait).toBeLessThan(WAIT_RANGE[1])
    expect(early.phase).toBe('cast')
    const events = run(early, (c) => c.phase === 'bite')
    expect(events).toEqual([{ type: 'bite' }])
    expect(early.phase).toBe('bite')
  })

  it('tirar mientras pica saca algo', () => {
    const cast = startCast(() => 0.2)
    run(cast, (c) => c.phase === 'bite')
    const events = stepCast(cast, 50, true)
    expect(events).toEqual([{ type: 'reel' }])
    expect(cast.phase).toBe('reel')
  })

  it('tirar antes de que pique asusta al pez, y dejar pasar el tiempo de picar lo pierde', () => {
    const hasty = startCast(() => 0.5)
    run(hasty, (c) => c.phase === 'wait')
    expect(stepCast(hasty, 50, true)).toEqual([{ type: 'early' }])
    expect(hasty.phase).toBe('early')
    const slow = startCast(() => 0.5)
    run(slow, (c) => c.phase === 'bite')
    const events = run(slow, (c) => FINAL_PHASES.includes(c.phase))
    expect(events).toEqual([{ type: 'miss' }])
    expect(CAST_MS + BITE_MS).toBeGreaterThan(0)
  })

  it('al lanzar, pulsar enseguida no cuenta: la caña aún vuela', () => {
    const cast = startCast(() => 0.5)
    expect(stepCast(cast, 50, true)).toEqual([])
    expect(cast.phase).toBe('cast')
  })

  it('un lance terminado no cambia', () => {
    const cast = { phase: 'miss', ms: 0, wait: 0 }
    expect(stepCast(cast, 1000, true)).toEqual([])
    expect(cast.phase).toBe('miss')
  })
})

describe('capturas', () => {
  it('la primera vez en cada sitio sale una moneda arcade', () => {
    expect(rollCatch(() => 0.5, { firstHere: true })).toEqual({ id: COIN_FIND, junk: false, coin: true })
  })

  it('lo demás sale de la tabla, según el peso, y siempre es algo que existe', () => {
    const total = CATCHES.reduce((sum, item) => sum + item.weight, 0)
    const seen = new Set()
    for (let i = 0; i < total; i++) {
      const got = rollCatch(() => (i + 0.5) / total)
      expect(CATCHES.some((item) => item.id === got.id)).toBe(true)
      expect(got.coin).toBe(false)
      seen.add(got.id)
    }
    expect([...seen].sort()).toEqual(CATCHES.map((item) => item.id).sort())
    expect(rollCatch(() => 0).id).toBe(CATCHES[0].id)
    expect(rollCatch(() => 0.9999999).id).toBe(CATCHES.at(-1).id)
  })

  it('hay peces y hallazgos que no son peces', () => {
    expect(CATCHES.some((item) => !item.junk)).toBe(true)
    expect(CATCHES.some((item) => item.junk)).toBe(true)
  })
})

describe('inventario y capturas guardados en la historia', () => {
  it('una partida nueva no tiene caña ni capturas, y la caña se guarda una sola vez', () => {
    const story = initialStory()
    expect(hasItem(story, 'cana')).toBe(false)
    const withRod = addItem(story, 'cana')
    expect(hasItem(withRod, 'cana')).toBe(true)
    expect(addItem(withRod, 'cana')).toBe(withRod)
    expect(story.items).toEqual([])
  })

  it('cuenta las capturas por tipo y guarda en qué sitios ya hubo hallazgo', () => {
    let story = initialStory()
    story = recordCatch(story, 'barbo')
    story = recordCatch(story, 'barbo')
    story = recordCatch(story, 'bota')
    expect(story.catches).toEqual({ barbo: 2, bota: 1 })
  })

  it('al leer lo guardado se descartan items y capturas raros, y las partidas antiguas se leen sin ellos', () => {
    const clean = sanitizeStory({ welcome: 'done', tour: 'none', items: ['cana', 'cana', 7, 'MAL!'], catches: { barbo: 3, 'x y': 2, boga: -1, carpa: 'mucho' } })
    expect(clean.items).toEqual(['cana'])
    expect(clean.catches).toEqual({ barbo: 3 })
    const old = sanitizeStory({ welcome: 'done', tour: 'none', stops: [], heard: [], explained: [] })
    expect(old.items).toEqual([])
    expect(old.catches).toEqual({})
  })
})
