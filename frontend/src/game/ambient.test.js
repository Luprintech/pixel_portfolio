import { describe, expect, it } from 'vitest'
import { BIRDS, FALLING, birdsOut, butterfliesAt, createAmbient, fallPosition, newFall, perchesOf, stepAmbient } from './ambient.js'

const seeded = (seed = 5) => {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}
const clear = { dark: 0, rain: 0, autumn: 0, winter: 0, wind: 0 }
const traveller = { x: 500, y: 500 }
const perches = [{ x: 600, y: 520 }, { x: 420, y: 430 }, { x: 540, y: 640 }, { x: 900, y: 900 }]
const run = (a, ms, ctx, step = 50) => {
  for (let t = 0; t < ms; t += step) stepAmbient(a, step, { traveller, perches, ...ctx })
}

describe('pájaros', () => {
  it('solo hay de día y sin lluvia ni nevada', () => {
    expect(birdsOut(clear)).toBe(true)
    expect(birdsOut({ ...clear, dark: 0.8 })).toBe(false)
    expect(birdsOut({ ...clear, rain: 0.6 })).toBe(false)
    expect(birdsOut({ ...clear, winter: 0.9 })).toBe(false)
    expect(birdsOut(null)).toBe(false)
  })

  it('llegan desde fuera de la pantalla, vuelan por encima del suelo y acaban posados en una percha cercana', () => {
    const a = createAmbient(seeded())
    let sawFlying = false
    let farEnough = true
    let landed = null
    for (let t = 0; t < 120000 && !landed; t += 50) {
      stepAmbient(a, 50, { sky: clear, traveller, perches })
      a.birds.forEach((bird) => {
        if (bird.state === 'fly') {
          sawFlying ||= bird.z > 0
          if (bird.x === a.birds[0].x && t < 100) farEnough &&= Math.hypot(bird.x - traveller.x, bird.y - traveller.y) >= BIRDS.spawnDistance * 0.9
        }
        if (bird.state === 'perch') landed = bird
      })
    }
    expect(sawFlying).toBe(true)
    expect(farEnough).toBe(true)
    expect(landed).toBeTruthy()
    expect(landed.z).toBe(0)
    // Solo se posa en perchas que están a una distancia razonable de la viajera (la lejana no cuenta).
    expect(landed.perch.x).not.toBe(900)
  })

  it('no hay más de los permitidos a la vez', () => {
    const a = createAmbient(seeded(9))
    let most = 0
    for (let t = 0; t < 400000; t += 50) {
      stepAmbient(a, 50, { sky: clear, traveller, perches })
      most = Math.max(most, a.birds.length)
    }
    expect(most).toBeLessThanOrEqual(BIRDS.max)
    expect(most).toBeGreaterThan(0)
  })

  it('echan a volar si alguien se acerca a la percha y se alejan de él', () => {
    const a = createAmbient(seeded(3))
    a.nextBird = 0
    let bird = null
    for (let t = 0; t < 120000 && !bird; t += 50) {
      stepAmbient(a, 50, { sky: clear, traveller, perches })
      bird = a.birds.find((b) => b.state === 'perch')
    }
    expect(bird).toBeTruthy()
    const intruder = { x: bird.perch.x + 10, y: bird.perch.y }
    stepAmbient(a, 50, { sky: clear, traveller, perches, scarers: [intruder] })
    expect(bird.state).toBe('away')
    const before = Math.hypot(bird.x - intruder.x, bird.y - intruder.y)
    run(a, 2000, { sky: clear, scarers: [intruder] })
    expect(Math.hypot(bird.x - intruder.x, bird.y - intruder.y)).toBeGreaterThan(before)
  })

  it('con "reducir movimiento" o con mal tiempo no salen, y los que hay se van', () => {
    const quiet = createAmbient(seeded())
    run(quiet, 120000, { sky: clear, enabled: false })
    expect(quiet.birds).toHaveLength(0)
    const a = createAmbient(seeded(2))
    a.nextBird = 0
    run(a, 30000, { sky: clear })
    expect(a.birds.length).toBeGreaterThan(0)
    run(a, 60000, { sky: { ...clear, rain: 0.9 } })
    expect(a.birds).toHaveLength(0)
  })

  it('las perchas son las copas de los árboles más las que da la escena', () => {
    const list = perchesOf([{ x: 2, y: 10 }], [{ x: 5, y: 5, depth: 6 }], 16)
    expect(list).toEqual([{ x: 40, y: 128, depth: 176.5 }, { x: 5, y: 5, depth: 6 }])
  })
})

describe('mariposas', () => {
  const gardens = [{ x: 100, y: 200, r: 24 }, { x: 400, y: 300, r: 30 }]
  it('revolotean cerca de su jardín, sin alejarse, y se mueven con el tiempo', () => {
    const at = (ms) => butterfliesAt(gardens, ms, clear)
    expect(at(0)).toHaveLength(4)
    for (let ms = 0; ms < 60000; ms += 700) {
      at(ms).slice(0, 2).forEach((b) => expect(Math.hypot(b.x - 100, b.y - 200)).toBeLessThan(24 + 8))
      at(ms).slice(2).forEach((b) => expect(Math.hypot(b.x - 400, b.y - 300)).toBeLessThan(30 + 8))
    }
    expect(at(0)[0].x).not.toBe(at(3000)[0].x)
  })

  it('solo hay de día y con el valle en primavera: ni de noche, ni con lluvia (otoño), ni con nieve', () => {
    expect(butterfliesAt(gardens, 1000, { dark: 0.9, autumn: 0, winter: 0 })).toHaveLength(0)
    expect(butterfliesAt(gardens, 1000, { dark: 0, autumn: 0.9, winter: 0 })).toHaveLength(0)
    expect(butterfliesAt(gardens, 1000, { dark: 0, autumn: 0, winter: 0.9 })).toHaveLength(0)
    expect(butterfliesAt(gardens, 1000, null)).toHaveLength(0)
  })
})

describe('caída de pétalos, hojas y manzanas', () => {
  const tree = { x: 300, y: 400, height: 50 }
  it('en primavera caen pétalos, en otoño hojas y alguna manzana, y en invierno nada', () => {
    expect(FALLING.winter).toBeNull()
    expect(newFall(tree, 'winter', 0, seeded())).toBeNull()
    const rng = seeded(4)
    const springBits = Array.from({ length: 40 }, () => newFall(tree, 'spring', 0, rng))
    expect(springBits.every((bit) => !bit.fruit)).toBe(true)
    const autumnBits = Array.from({ length: 80 }, () => newFall(tree, 'autumn', 0, rng))
    expect(autumnBits.some((bit) => bit.fruit)).toBe(true)
    expect(autumnBits.filter((bit) => bit.fruit).length).toBeLessThan(40)
  })

  it('caen desde la copa hasta el pie del árbol, y con viento se desvían más', () => {
    const calm = newFall(tree, 'spring', 0, seeded(6))
    const windy = newFall(tree, 'spring', 1, seeded(6))
    expect(calm.from.y).toBeLessThan(tree.y)
    expect(calm.to.y).toBeGreaterThanOrEqual(tree.y)
    expect(Math.abs(windy.to.x - windy.from.x)).toBeGreaterThan(Math.abs(calm.to.x - calm.from.x))
    expect(fallPosition(calm, 0)).toEqual({ x: calm.from.x + Math.sin(calm.sway) * 3, y: calm.from.y })
    const end = fallPosition(calm, 1)
    expect(end.y).toBeCloseTo(calm.to.y, 5)
  })
})
