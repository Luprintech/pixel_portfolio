import { describe, expect, it } from 'vitest'
import { IDLE_AFTER_MS, createIdle, playOffset, takeSound, updateIdle } from './idle.js'
import { sitSpec } from './rest.js'

const run = (idle, kind, ms, extra = {}) => {
  const poses = new Set()
  for (let t = 0; t < ms; t += 100) poses.add(updateIdle(idle, 100, { still: IDLE_AFTER_MS + t, kind, ...extra }).pose)
  return poses
}

describe('mascota parada', () => {
  it('sigue de pie hasta llevar un rato parada y vuelve a ello al echar a andar', () => {
    const idle = createIdle(() => 0.5)
    expect(updateIdle(idle, 100, { still: IDLE_AFTER_MS - 1, kind: 'gato' }).pose).toBe('stand')
    expect(updateIdle(idle, 100, { still: IDLE_AFTER_MS, kind: 'gato' }).pose).toBe('sit')
    expect(updateIdle(idle, 100, { still: 0, kind: 'gato' }).pose).toBe('stand')
  })

  it('el gato se sienta, se asea, maúlla y juega', () => {
    const idle = createIdle(() => 0.5)
    let meows = 0
    const poses = new Set()
    for (let t = 0; t < 20000; t += 100) {
      poses.add(updateIdle(idle, 100, { still: IDLE_AFTER_MS + t, kind: 'gato' }).pose)
      if (takeSound(idle)) meows++
    }
    expect([...poses].sort()).toEqual(['meow', 'play', 'sit', 'wash'])
    expect(meows).toBeGreaterThan(0)
  })

  it('el perro se sienta y juega, sin aseo ni maullido', () => {
    expect([...run(createIdle(() => 0.5), 'perro', 20000)].sort()).toEqual(['play', 'sit'])
  })

  it('el maullido suena una sola vez por turno', () => {
    const idle = createIdle(() => 0.5)
    idle.sound = true
    expect(takeSound(idle)).toBe(true)
    expect(takeSound(idle)).toBeNull()
  })

  it('una postura forzada manda sobre la rutina', () => {
    const idle = createIdle()
    expect(updateIdle(idle, 100, { still: 0, kind: 'perro', forced: 'play' }).pose).toBe('play')
    expect(updateIdle(idle, 100, { still: 0, kind: 'perro', forced: null }).pose).toBe('stand')
  })

  it('los saltitos suben y bajan sin salirse de unos píxeles', () => {
    for (let t = 0; t < 4000; t += 50) {
      const { dx, dy } = playOffset(t)
      expect(Math.abs(dx)).toBeLessThanOrEqual(5)
      expect(dy).toBeLessThanOrEqual(0)
      expect(dy).toBeGreaterThanOrEqual(-3)
    }
  })
})

describe('postura de sentado', () => {
  const spec = { w: 26, h: 16, body: { cx: 10, cy: 10, rx: 7, ry: 3.6 }, legs: { y: 12, h: 3 }, spots: [[4, 8, 3, 2]], stripes: [[7, 7]] }

  it('baja el cuerpo y acorta las patas dejando los pies en su sitio', () => {
    const sat = sitSpec(spec)
    expect(sat.body.cy).toBe(12)
    expect(sat.legs.y + sat.legs.h).toBe(spec.legs.y + spec.legs.h)
    expect(sat.legs.h).toBe(1)
    expect(sat.spots[0][1]).toBe(10)
  })

  it('con patas muy cortas baja solo un píxel y deja el original intacto', () => {
    const short = { ...spec, legs: { y: 12, h: 2 } }
    expect(sitSpec(short).legs.h).toBe(1)
    expect(short.body.cy).toBe(10)
  })
})
