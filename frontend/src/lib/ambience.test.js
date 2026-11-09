import { describe, expect, it } from 'vitest'
import { ambienceLevels } from './ambience'

describe('ambienceLevels', () => {
  it('de día soplan el viento y cantan los pájaros, sin grillos', () => {
    const levels = ambienceLevels({ dark: 0, rain: 0, storm: 0, wind: 0.25 })
    expect(levels.birds).toBe(1)
    expect(levels.crickets).toBe(0)
    expect(levels.rain).toBe(0)
    expect(levels.wind).toBeGreaterThan(0)
  })

  it('de noche cantan los grillos y callan los pájaros', () => {
    const levels = ambienceLevels({ dark: 1, rain: 0, storm: 0, wind: 0.25 })
    expect(levels.crickets).toBe(1)
    expect(levels.birds).toBe(0)
  })

  it('con lluvia callan pájaros y grillos, y en tormenta el viento es más fuerte', () => {
    const rain = ambienceLevels({ dark: 0.5, rain: 0.65, storm: 0, wind: 0.6 })
    const storm = ambienceLevels({ dark: 0.5, rain: 1, storm: 1, wind: 0.9 })
    expect(rain.rain).toBeCloseTo(0.65)
    expect(storm.birds).toBe(0)
    expect(storm.crickets).toBe(0)
    expect(storm.wind).toBeGreaterThan(rain.wind)
  })

  it('con nieve callan pájaros y grillos y suenan las campanitas de escarcha', () => {
    const snow = ambienceLevels({ dark: 1, rain: 0, storm: 0, wind: 0.35, winter: 1 })
    expect(snow.crickets).toBe(0)
    expect(snow.birds).toBe(0)
    expect(snow.chimes).toBe(1)
    expect(ambienceLevels({ dark: 0, rain: 0, wind: 0.25 }).chimes).toBe(0)
  })

  it('todos los niveles quedan entre 0 y 1', () => {
    for (let dark = 0; dark <= 1; dark += 0.25) {
      for (let rain = 0; rain <= 1; rain += 0.25) {
        Object.values(ambienceLevels({ dark, rain, storm: rain, wind: 1 })).forEach((v) => {
          expect(v).toBeGreaterThanOrEqual(0)
          expect(v).toBeLessThanOrEqual(1)
        })
      }
    }
  })
})
