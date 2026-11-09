import { describe, expect, it } from 'vitest'
import { DAY_MS, LIGHTS, WEATHER_MS, lightningAt, rainDrops, skyAt, strikesBetween, windowsLit } from './titleSky.js'

const SEEDS = [1, 7, 42, 1234, 99999, 2 ** 30, 314159265]

describe('titleSky', () => {
  it('el valle pasa a otoño cuando llueve y vuelve a primavera cuando para', () => {
    const autumn = new Set()
    SEEDS.forEach((seed) => {
      for (let ms = 0; ms < WEATHER_MS * 8; ms += 1000) {
        const sky = skyAt(ms, seed)
        expect(sky.autumn).toBeGreaterThanOrEqual(0)
        expect(sky.autumn).toBeLessThanOrEqual(1)
        if (sky.rain === 0) expect(sky.autumn).toBe(0)
        if (sky.rain >= 0.65) expect(sky.autumn).toBe(1)
        autumn.add(sky.autumn > 0.5)
      }
    })
    expect(autumn.size).toBe(2)
  })

  it('el arcoíris sale de día, al secarse el tiempo tras la lluvia, y nunca con lluvia fuerte', () => {
    let seen = 0
    SEEDS.forEach((seed) => {
      for (let ms = 0; ms < WEATHER_MS * 12; ms += 500) {
        const sky = skyAt(ms, seed)
        expect(sky.rainbow).toBeGreaterThanOrEqual(0)
        expect(sky.rainbow).toBeLessThanOrEqual(1)
        if (sky.dark === 1) expect(sky.rainbow).toBe(0)
        if (sky.rainbow > 0.5) {
          seen += 1
          expect(sky.storm).toBe(0)
        }
      }
    })
    expect(seen).toBeGreaterThan(0)
  })

  it('cada semilla empieza a una hora distinta y el día da la vuelta', () => {
    const phases = new Set(SEEDS.map((seed) => skyAt(0, seed).phase.toFixed(2)))
    expect(phases.size).toBeGreaterThan(3)
    SEEDS.forEach((seed) => expect(skyAt(DAY_MS, seed).phase).toBeCloseTo(skyAt(0, seed).phase, 5))
  })

  it('a lo largo del día hay noche con luna y día con sol', () => {
    let nights = 0
    let days = 0
    for (let ms = 0; ms < DAY_MS; ms += 500) {
      const sky = skyAt(ms, 5)
      expect(sky.bands).toHaveLength(6)
      sky.bands.forEach((color) => expect(color).toMatch(/^#[0-9a-f]{6}$/))
      if (sky.dark === 1) {
        nights += 1
        expect(sky.sun).toBeNull()
        expect(sky.moon).not.toBeNull()
      }
      if (sky.dark === 0) {
        days += 1
        expect(sky.moon).toBeNull()
        expect(sky.sun).not.toBeNull()
      }
    }
    expect(nights).toBeGreaterThan(20)
    expect(days).toBeGreaterThan(20)
  })

  it('el sol recorre el cielo de izquierda a derecha', () => {
    const xs = []
    for (let ms = 0; ms < DAY_MS; ms += 250) {
      const { sun } = skyAt(ms, 5)
      if (sun) xs.push(sun.x)
    }
    expect(xs[0]).toBeLessThan(40)
    expect(xs[xs.length - 1]).toBeGreaterThan(280)
    expect([...xs].sort((a, b) => a - b)).toEqual(xs)
  })

  it('el tiempo varía entre visitas y sus niveles quedan entre 0 y 1', () => {
    const rainy = new Set()
    SEEDS.forEach((seed) => {
      for (let ms = 0; ms < WEATHER_MS * 6; ms += 1500) {
        const sky = skyAt(ms, seed)
        ;[sky.cloud, sky.rain, sky.storm, sky.wind, sky.gloom].forEach((v) => {
          expect(v).toBeGreaterThanOrEqual(0)
          expect(v).toBeLessThanOrEqual(1)
        })
        rainy.add(sky.rain > 0.3)
      }
    })
    expect(rainy.size).toBe(2)
  })

  it('con movimiento reducido no hay lluvia ni tormenta', () => {
    SEEDS.forEach((seed) => {
      const sky = skyAt(6000, seed, true)
      expect(sky.rain).toBe(0)
      expect(sky.storm).toBe(0)
    })
  })

  it('las ventanas se encienden con la oscuridad', () => {
    expect(windowsLit(0)).toBe(0)
    expect(windowsLit(0.29)).toBe(0)
    expect(windowsLit(0.4)).toBeGreaterThan(0)
    expect(windowsLit(1)).toBe(LIGHTS)
  })

  it('hay rayos solo en tormenta y cada uno lleva su trueno', () => {
    let strikes = 0
    SEEDS.forEach((seed) => {
      for (let ms = 0; ms < WEATHER_MS * 8; ms += 1000) {
        strikesBetween(ms, ms + 1000, seed).forEach((strike) => {
          strikes += 1
          expect(skyAt(strike.time, seed).storm).toBeGreaterThanOrEqual(0.6)
          expect(strike.delay).toBeGreaterThanOrEqual(0.3)
          expect(strike.delay).toBeLessThanOrEqual(2.5)
          expect(lightningAt(strike.time + 20, seed).flash).toBeGreaterThan(0.5)
        })
      }
    })
    expect(strikes).toBeGreaterThan(0)
  })

  it('el destello se apaga enseguida', () => {
    SEEDS.forEach((seed) => {
      const [strike] = strikesBetween(0, WEATHER_MS * 8, seed)
      if (strike) expect(lightningAt(strike.time + 600, seed)).toBeNull()
    })
  })

  it('llueven más gotas cuanto más llueve y todas dentro de la imagen', () => {
    expect(rainDrops(0, 0)).toHaveLength(0)
    expect(rainDrops(0, 1).length).toBeGreaterThan(rainDrops(0, 0.5).length)
    rainDrops(4321, 1).forEach(({ x, y }) => {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(320)
      expect(y).toBeGreaterThanOrEqual(-5)
      expect(y).toBeLessThanOrEqual(185)
    })
  })
})
