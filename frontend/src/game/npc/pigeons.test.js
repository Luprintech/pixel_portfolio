import { describe, expect, it } from 'vitest'
import { FLOCK, createFlock, stepFlock } from './pigeons.js'

// Un suelo libre salvo un muro corto: x entre 100 y 110, de y 0 a 150, no se pisa.
const free = (x, y) => !(x > 100 && x < 110 && y < 150) && x > 0 && x < 300 && y > 0 && y < 300
const homes = [{ x: 50, y: 50 }, { x: 70, y: 60 }]
const seeded = () => {
  let s = 7
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}
const run = (flock, ms, ctx) => {
  for (let t = 0; t < ms; t += 50) stepFlock(flock, 50, { free, ...ctx })
}

describe('palomas', () => {
  it('sin nadie que dé de comida, picotean cerca de su rincón y nunca pisan donde no se puede', () => {
    const flock = createFlock(homes, 4, seeded())
    run(flock, 30000, {})
    flock.pigeons.forEach((p) => {
      expect(free(p.x, p.y)).toBe(true)
      expect(Math.hypot(p.x - p.home.x, p.y - p.home.y)).toBeLessThan(FLOCK.roamRadius * 2)
    })
  })

  it('quien da de comida lanza migas, y las palomas se juntan y se las comen', () => {
    const flock = createFlock(homes, 4, seeded())
    const source = { hand: { x: 200, y: 180 }, feet: { x: 200, y: 200 } }
    run(flock, 20000, { source })
    flock.pigeons.forEach((p) => expect(Math.hypot(p.x - source.feet.x, p.y - source.feet.y)).toBeLessThan(120))
    expect(flock.crumbs.length).toBeLessThan(8)
  })

  it('las migas no se acumulan cuando se dejan de lanzar: se comen o caducan', () => {
    const flock = createFlock(homes, 3, seeded())
    run(flock, 6000, { source: { hand: { x: 60, y: 40 }, feet: { x: 60, y: 60 } } })
    run(flock, FLOCK.crumbLifeMs + 4000, {})
    expect(flock.crumbs).toHaveLength(0)
  })

  it('echan a volar si alguien se acerca, y vuelan hacia un sitio libre más lejos de él', () => {
    const flock = createFlock([{ x: 50, y: 50 }], 1, seeded())
    const [pigeon] = flock.pigeons
    const intruder = { x: pigeon.x + 10, y: pigeon.y }
    stepFlock(flock, 50, { free, scarers: [intruder] })
    expect(pigeon.state).toBe('fly')
    const before = Math.hypot(pigeon.target.x - intruder.x, pigeon.target.y - intruder.y)
    expect(before).toBeGreaterThan(FLOCK.scareRange)
    expect(free(pigeon.target.x, pigeon.target.y)).toBe(true)
    run(flock, FLOCK.flyMs + 200, {})
    expect(pigeon.state).not.toBe('fly')
    expect(pigeon.h).toBe(0)
  })

  it('tras un susto no se acercan a la comida hasta que pasa el tiempo', () => {
    const flock = createFlock([{ x: 50, y: 50 }], 1, seeded())
    const [pigeon] = flock.pigeons
    stepFlock(flock, 50, { free, scarers: [{ x: pigeon.x + 5, y: pigeon.y }] })
    expect(pigeon.scared).toBeGreaterThan(0)
    run(flock, FLOCK.scaredMs + 500, {})
    expect(pigeon.scared).toBe(0)
  })

  it('un susto de poco alcance (alguien que pasa andando) solo espanta a las que tiene muy cerca', () => {
    const flock = createFlock([{ x: 50, y: 50 }], 2, seeded())
    const [near, far] = flock.pigeons
    Object.assign(far, { x: near.x + 20, y: near.y })
    stepFlock(flock, 50, { free, scarers: [{ x: near.x + 4, y: near.y, range: 9 }] })
    expect(near.state).toBe('fly')
    expect(far.state).not.toBe('fly')
  })

  it('ninguna paloma pisa donde hay una persona o un gato, ni al andar ni al posarse', () => {
    const flock = createFlock(homes, 6, seeded())
    const source = { hand: { x: 200, y: 180 }, feet: { x: 200, y: 200 } }
    const bodies = [{ x: 200, y: 200, r: 9 }]
    for (let t = 0; t < 40000; t += 50) {
      stepFlock(flock, 50, { free, source, bodies })
      flock.pigeons.filter((p) => p.state !== 'fly').forEach((p) => expect(Math.hypot(p.x - 200, p.y - 200)).toBeGreaterThanOrEqual(9))
    }
  })

  it('si alguien llega y se queda justo encima de una paloma, ella se aparta en lugar de quedarse dentro', () => {
    const flock = createFlock([{ x: 200, y: 200 }], 1, seeded())
    const [pigeon] = flock.pigeons
    Object.assign(pigeon, { x: 202, y: 201 })
    stepFlock(flock, 50, { free, bodies: [{ x: 200, y: 200, r: 9 }] })
    expect(pigeon.state).toBe('fly')
    expect(Math.hypot(pigeon.target.x - 200, pigeon.target.y - 200)).toBeGreaterThanOrEqual(9)
  })
})
