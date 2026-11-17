import { describe, expect, it } from 'vitest'
import { EPISODES, EPISODE_GAP_MS, MIN_LEAD_MS, SEASONS, SEASON_MS, SNOW_COVER } from './seasonConfig.js'
import SeasonClock from './seasonClock.js'
import { advanceSeason, climateOf, initialSeason, planSeason, sanitizeSeason } from './valleClimate.js'

const STEP = 1000

// Recorre `seasons` estaciones enteras de una partida nueva y devuelve todos los episodios con su tiempo absoluto de juego.
function episodesOver(seed, seasons) {
  let state = initialSeason()
  let plan = planSeason(state, seed)
  const all = []
  for (let s = 0; s < seasons; s++) {
    plan.forEach((e) => all.push({ ...e, season: SEASONS[state.season], at: s * SEASON_MS + e.start, until: s * SEASON_MS + e.end }))
    const next = advanceSeason(state, SEASON_MS - state.elapsed, seed, plan)
    state = next.state
    plan = next.plan
  }
  return all
}

describe('ciclo de estaciones', () => {
  it('va primavera, verano, otoño, invierno y vuelve a la primavera, y parte de la primavera sin datos', () => {
    expect(initialSeason().season).toBe(0)
    let state = initialSeason()
    const seen = []
    for (let i = 0; i < 9; i++) {
      seen.push(SEASONS[state.season])
      state = advanceSeason(state, SEASON_MS, 7).state
    }
    expect(seen).toEqual(['spring', 'summer', 'autumn', 'winter', 'spring', 'summer', 'autumn', 'winter', 'spring'])
    expect(SEASON_MS).toBe(20 * 60 * 1000)
  })

  it('un guardado dañado o fuera de rango se descarta y uno válido se acepta', () => {
    expect(sanitizeSeason(undefined)).toBeNull()
    expect(sanitizeSeason({ season: 7, cycle: 0, elapsed: 0, carry: 0 })).toBeNull()
    expect(sanitizeSeason({ season: 1, cycle: 0, elapsed: SEASON_MS, carry: 0 })).toBeNull()
    expect(sanitizeSeason({ season: 1, cycle: 0, elapsed: -5, carry: 0 })).toBeNull()
    expect(sanitizeSeason({ season: '1', cycle: 0, elapsed: 0, carry: 0 })).toBeNull()
    expect(sanitizeSeason({ season: 2, cycle: 3, elapsed: 1000, carry: 5e9 })).toEqual({ season: 2, cycle: 3, elapsed: 1000, carry: EPISODE_GAP_MS })
  })

  it('el mismo estado y semilla dan siempre el mismo plan', () => {
    const state = { season: 2, cycle: 6, elapsed: 0, carry: 1000 }
    expect(planSeason(state, 123)).toEqual(planSeason(state, 123))
  })
})

describe('episodios de lluvia y nieve', () => {
  it('respeta el máximo, la duración y el intervalo de 15 minutos, también entre estaciones', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const all = episodesOver(seed, 24)
      all.forEach((e, i) => {
        const [min, max] = EPISODES[e.season].duration
        expect(e.until - e.at, `semilla ${seed}`).toBeGreaterThanOrEqual(min - 1)
        expect(e.until - e.at, `semilla ${seed}`).toBeLessThanOrEqual(max + 1)
        if (i > 0) expect(e.at - all[i - 1].until, `semilla ${seed} episodio ${i}`).toBeGreaterThanOrEqual(EPISODE_GAP_MS - 1)
      })
      SEASONS.forEach((name) => {
        for (let s = 0; s < 24; s++) {
          if (SEASONS[s % 4] !== name) continue
          const inSeason = all.filter((e) => e.at >= s * SEASON_MS && e.at < (s + 1) * SEASON_MS)
          expect(inSeason.length, `${name} semilla ${seed}`).toBeLessThanOrEqual(EPISODES[name].odds.length - 1)
        }
      })
    }
  })

  it('el primer episodio nunca llega nada más abrir el juego ni al empezar una estación', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const first = planSeason(initialSeason(), seed)[0]
      if (first) expect(first.start).toBeGreaterThanOrEqual(MIN_LEAD_MS)
      for (let season = 0; season < 4; season++) {
        const plan = planSeason({ season, cycle: 5, elapsed: 0, carry: 0 }, seed)
        // Con un episodio recién terminado, el siguiente tiene que esperar el intervalo entero.
        if (plan[0]) expect(plan[0].start).toBeGreaterThanOrEqual(EPISODE_GAP_MS - 1)
      }
    }
  })

  it('hay semillas con y sin lluvia en verano y con y sin nevada en invierno, y casi siempre el valle está despejado', () => {
    const counts = { summer: [0, 0], winter: [0, 0] }
    for (let seed = 1; seed <= 400; seed++) {
      ;['summer', 'winter'].forEach((name) => {
        const state = { season: SEASONS.indexOf(name), cycle: 4 + SEASONS.indexOf(name), elapsed: 0, carry: EPISODE_GAP_MS }
        counts[name][planSeason(state, seed).length]++
      })
    }
    expect(counts.summer[0]).toBeGreaterThan(counts.summer[1])
    expect(counts.summer[1]).toBeGreaterThan(0)
    expect(counts.winter[0]).toBeGreaterThan(0)
    expect(counts.winter[1]).toBeGreaterThan(0)
  })

  it('el tiempo no llueve ni nieva fuera de los episodios y no se solapan lluvia y nieve', () => {
    for (let seed = 1; seed <= 12; seed++) {
      let state = initialSeason()
      let plan = planSeason(state, seed)
      for (let t = 0; t < 8 * SEASON_MS; t += 2000) {
        const climate = climateOf(state, plan)
        expect(climate.rain > 0 && climate.snow > 0).toBe(false)
        const inEpisode = plan.some((e) => state.elapsed >= e.start && state.elapsed <= e.end)
        if (!inEpisode) {
          expect(climate.rain).toBe(0)
          expect(climate.snow).toBe(0)
        }
        const next = advanceSeason(state, 2000, seed, plan)
        state = next.state
        plan = next.plan
      }
    }
  })
})

describe('nieve acumulada', () => {
  const winter = (seed) => ({ season: 3, cycle: 3, elapsed: 0, carry: EPISODE_GAP_MS, seed })

  it('se posa durante la nevada, se queda unos minutos y se retira poco a poco antes de que acabe el invierno', () => {
    let tested = 0
    for (let seed = 1; seed <= 200 && tested < 5; seed++) {
      const { seed: _s, ...state } = winter(seed)
      const plan = planSeason(state, seed)
      if (!plan.length) continue
      tested++
      const [snow] = plan
      const at = (elapsed) => climateOf({ ...state, elapsed }, plan).snowCover
      expect(at(snow.start - 1000)).toBe(0)
      expect(at(snow.end)).toBeGreaterThan(0.99)
      expect(at(snow.end + SNOW_COVER.hold - 1000)).toBeGreaterThan(0.99)
      const mid = at(snow.end + SNOW_COVER.hold + SNOW_COVER.melt / 2)
      expect(mid).toBeGreaterThan(0.05)
      expect(mid).toBeLessThan(0.95)
      expect(at(snow.end + SNOW_COVER.hold + SNOW_COVER.melt)).toBeLessThan(0.001)
      expect(snow.end + SNOW_COVER.hold + SNOW_COVER.melt).toBeLessThan(SEASON_MS)
      // Sin nevada, el invierno tiene escarcha (capa propia) pero ninguna nieve acumulada.
      expect(climateOf({ ...state, elapsed: 500000 }, []).snowCover).toBe(0)
      expect(climateOf({ ...state, elapsed: 500000 }, []).layers.frost).toBe(1)
    }
    expect(tested).toBeGreaterThan(0)
  })
})

describe('reloj de estaciones (solo tiempo activo)', () => {
  it('suma el tiempo activo y un salto grande (pestaña oculta, equipo dormido) no cuenta', () => {
    const clock = new SeasonClock({ seed: 1, now: 0, scale: 1 })
    for (let t = STEP; t <= 60 * STEP; t += STEP) clock.tick(t, false)
    expect(clock.snapshot().elapsed).toBe(60 * STEP)
    // Vuelve la pestaña después de una hora: la primera lectura es un salto y no suma.
    clock.tick(60 * STEP + 3_600_000, false)
    expect(clock.snapshot().elapsed).toBe(60 * STEP)
    clock.tick(60 * STEP + 3_600_000 + STEP, false)
    expect(clock.snapshot().elapsed).toBe(61 * STEP)
    // Con la pestaña oculta tampoco cuenta aunque las lecturas sean seguidas.
    clock.tick(60 * STEP + 3_600_000 + 2 * STEP, true)
    expect(clock.snapshot().elapsed).toBe(61 * STEP)
  })

  it('recargar retoma el progreso y el plan es el mismo (el cupo de episodios no se reinicia)', () => {
    const seed = 42
    const clock = new SeasonClock({ seed, now: 0, scale: 1 })
    clock.advance(SEASON_MS * 2 + 300000)
    const saved = JSON.parse(JSON.stringify(clock.snapshot()))
    const reloaded = new SeasonClock({ seed, saved, now: 0, scale: 1 })
    expect(reloaded.snapshot()).toEqual(saved)
    expect(reloaded.plan).toEqual(clock.plan)
    expect(reloaded.value.name).toBe(clock.value.name)
  })

  it('avisa al cambiar de estación y no al crearse', () => {
    const clock = new SeasonClock({ seed: 3, now: 0, scale: 1 })
    const seen = []
    clock.onChange((c) => seen.push(c.name))
    clock.advance(SEASON_MS - 1)
    expect(seen).toEqual([])
    clock.advance(2)
    expect(seen).toEqual(['summer'])
  })

  it('el cambio de estación se funde: primero conviven las dos y luego queda solo la nueva', () => {
    const clock = new SeasonClock({ seed: 3, now: 0, scale: 1 })
    clock.advance(SEASON_MS + 5000)
    expect(clock.value.name).toBe('summer')
    expect(clock.value.weights[0]).toBeGreaterThan(0)
    expect(clock.value.weights[1]).toBeGreaterThan(0)
    clock.advance(60000)
    expect(clock.value.weights).toEqual([0, 1, 0, 0])
  })
})
