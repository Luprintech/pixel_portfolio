import { describe, expect, it } from 'vitest'
import { createNav } from '../interior/catNav.js'
import { OUTING, beginOuting, createOuting, dueToGoOut, isOut, mayGoOut, updateOuting } from './catOuting.js'

// Un suelo de 400×300 con un muro vertical en x 150..170 de y 0 a 200: el camino rodea por abajo.
const nav = createNav({ bounds: { x: 0, y: 0, width: 400, height: 300 }, solids: [{ x: 150, y: 0, w: 20, h: 200 }], minY: 0 })
const seeded = () => {
  let s = 11
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}
const home = { x: 40, y: 80 }
const plaza = { x: 300, y: 100 }
const base = (extra = {}) => ({ nav, home, fountain: { x: 300, y: 120 }, sunSpots: [{ x: 320, y: 60 }], pigeons: [], others: [], ...extra })
const run = (o, ms, ctx, step = 50) => {
  const events = []
  for (let t = 0; t < ms; t += step) {
    const event = updateOuting(o, step, typeof ctx === 'function' ? ctx() : ctx)
    if (event) events.push(event)
  }
  return events
}
const walkable = (p) => !(p.x > 150 - 7 && p.x < 170 + 7 && p.y < 200 + 2)

describe('salida de Khalessi al pueblo', () => {
  it('sale andando desde donde está Lupe, rodea el muro y nunca atraviesa nada ni salta de un sitio a otro', () => {
    const o = createOuting(seeded())
    expect(beginOuting(o, home, plaza, nav)).toBe(true)
    expect(o.phase).toBe('going')
    let last = { x: o.x, y: o.y }
    let maxJump = 0
    for (let t = 0; t < 40000 && o.phase === 'going'; t += 50) {
      updateOuting(o, 50, base())
      maxJump = Math.max(maxJump, Math.hypot(o.x - last.x, o.y - last.y))
      expect(walkable(o), `pisa el muro en ${o.x},${o.y}`).toBe(true)
      last = { x: o.x, y: o.y }
    }
    expect(o.phase).toBe('stay')
    expect(Math.hypot(o.x - plaza.x, o.y - plaza.y)).toBeLessThan(6)
    // Con 50 ms a 50 px/s da pasos de 2,5 px: ninguno puede ser un teletransporte.
    expect(maxJump).toBeLessThanOrEqual((OUTING.walkSpeed * 50) / 1000 + 0.01)
  })

  it('en la plaza encadena actividades distintas y al acabar el tiempo vuelve con Lupe y avisa una sola vez', () => {
    const o = createOuting(seeded())
    beginOuting(o, home, plaza, nav)
    o.stayLeft = 60000
    const kinds = new Set()
    const events = run(o, 200000, () => {
      if (o.activity) kinds.add(o.activity.kind)
      return base({ grace: { x: 260, y: 120, sitting: true }, traveller: { x: 330, y: 140 }, pigeons: [{ x: 280, y: 90, state: 'peck' }] })
    })
    expect(kinds.size).toBeGreaterThanOrEqual(3)
    expect(events).toEqual(['home'])
    expect(o.phase).toBe('home')
    expect(Math.hypot(o.x - home.x, o.y - home.y)).toBeLessThanOrEqual(OUTING.homeReach + 1)
  })

  it('junto a Grace elige quedarse a su lado más veces que cualquier otra cosa', () => {
    const counts = {}
    for (let seed = 1; seed < 80; seed++) {
      const o = createOuting(() => ((seed * 9301 + 49297) % 233280) / 233280)
      beginOuting(o, plaza, { x: 301, y: 101 }, nav)
      o.phase = 'stay'
      updateOuting(o, 50, base({ grace: { x: 260, y: 120, sitting: true }, pigeons: [{ x: 280, y: 90, state: 'peck' }], traveller: { x: 330, y: 140 } }))
      if (o.activity) counts[o.activity.kind] = (counts[o.activity.kind] ?? 0) + 1
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
    expect(top).toBe('bench')
  })

  it('persigue a una paloma corriendo, y sin Grace sentada no va a su banco', () => {
    const o = createOuting(seeded())
    beginOuting(o, plaza, { x: 301, y: 101 }, nav)
    o.phase = 'stay'
    const seen = new Set()
    for (let i = 0; i < 40; i++) {
      o.activity = null
      o.lastKind = null
      updateOuting(o, 50, base({ grace: { x: 260, y: 120, sitting: false }, pigeons: [{ x: 280, y: 90, state: 'peck' }] }))
      if (o.activity) seen.add(o.activity.kind)
    }
    expect(seen.has('bench')).toBe(false)
    expect(seen.has('chase')).toBe(true)
    const chase = createOuting(seeded())
    beginOuting(chase, plaza, { x: 301, y: 101 }, nav)
    chase.phase = 'stay'
    for (let i = 0; i < 40 && chase.activity?.kind !== 'chase'; i++) {
      chase.activity = null
      chase.lastKind = null
      updateOuting(chase, 50, base({ pigeons: [{ x: 200, y: 250, state: 'peck' }] }))
    }
    expect(chase.activity.kind).toBe('chase')
    expect(chase.speed).toBe(OUTING.runSpeed)
  })

  it('si llueve o es de noche vuelve a casa al terminar lo que hace, y no sale', () => {
    const o = createOuting(seeded())
    beginOuting(o, home, plaza, nav)
    run(o, 30000, base())
    expect(o.phase).toBe('stay')
    const events = run(o, 120000, base({ rain: true }))
    expect(events).toEqual(['home'])
    expect(mayGoOut({ rain: true })).toBe(false)
    expect(mayGoOut({ night: true })).toBe(false)
    expect(mayGoOut({ recalled: true })).toBe(false)
    expect(mayGoOut({})).toBe(true)
    o.restLeft = 0
    expect(dueToGoOut(o, { rain: true })).toBe(false)
    expect(dueToGoOut(o, {})).toBe(true)
  })

  it('cede el paso a quien le cierra el camino, sin atravesarlo', () => {
    const o = createOuting(seeded())
    beginOuting(o, { x: 40, y: 250 }, { x: 140, y: 250 }, nav)
    const blocker = { x: 90, y: 250 }
    let closest = Infinity
    run(o, 6000, () => {
      closest = Math.min(closest, Math.hypot(o.x - blocker.x, o.y - blocker.y))
      return base({ others: [blocker] })
    })
    expect(closest).toBeGreaterThanOrEqual(OUTING.gap - 3)
    expect(o.x).toBeLessThan(blocker.x)
  })

  it('en casa cuenta el descanso y no se considera fuera', () => {
    const o = createOuting(seeded())
    expect(isOut(o)).toBe(false)
    const before = o.restLeft
    run(o, 1000, base())
    expect(o.restLeft).toBe(before - 1000)
  })
})
