import { describe, expect, it } from 'vitest'
import { CAT_HOME, CAT_NEAR, endHuddle, huddleCat, scaredCat, startHuddle, startScare } from './titleCat.js'

describe('susto de Khalessi', () => {
  const scare = startScare({ x: CAT_HOME[0], y: CAT_HOME[1] }, 1000)
  const at = (local) => scaredCat(scare, 1000 + local)

  it('corre hacia Lupe asustada y se queda quieta con miedo', () => {
    const running = at(300)
    expect(running).toMatchObject({ scared: true, walking: true, comfort: null })
    expect(running.x).toBeLessThan(CAT_HOME[0])
    expect(at(scare.fearEnd - 100)).toMatchObject({ scared: true, walking: false })
  })

  it('al salir de detrás se acerca a Lupe, sin miedo, y ella la consuela en dos frases', () => {
    const { from, to } = scare.comfort
    expect(at(scare.fearEnd + 200)).toMatchObject({ scared: false, walking: true, comfort: null })
    expect(at(from + 100)).toMatchObject({ scared: false, comfort: 'comfort1', x: CAT_NEAR[0], y: CAT_NEAR[1] })
    expect(at(to - 100).comfort).toBe('comfort2')
  })

  it('termina cuando la ruta acaba y deja de devolver gata', () => {
    expect(at(scare.route.ms - 100)).not.toBeNull()
    expect(at(scare.route.ms + 1)).toBeNull()
  })
})

describe('Khalessi con frío', () => {
  const huddle = startHuddle({ x: CAT_HOME[0], y: CAT_HOME[1] }, 2000)

  it('corre hacia Lupe, se sienta pegada a ella y tirita', () => {
    const running = huddleCat(huddle, 2000 + 200)
    expect(running).toMatchObject({ walking: true, shiver: false })
    expect(running.x).toBeLessThan(CAT_HOME[0])
    expect(huddleCat(huddle, 2000 + huddle.route.ms + 50)).toMatchObject({ x: CAT_NEAR[0], y: CAT_NEAR[1], sit: 'sit', shiver: true, walking: false })
    // Sigue allí tanto como dure la nevada.
    expect(huddleCat(huddle, 2000 + huddle.route.ms + 600000)).toMatchObject({ shiver: true })
  })

  it('al parar de nevar vuelve a casa andando, sin temblar, y entonces deja de devolver gata', () => {
    const leaving = endHuddle(50000)
    const walking = huddleCat(leaving, 50000 + 100)
    expect(walking.walking).toBe(true)
    expect(walking.shiver).toBeUndefined()
    expect(huddleCat(leaving, 50000 + leaving.route.ms - 50)).not.toBeNull()
    expect(huddleCat(leaving, 50000 + leaving.route.ms + 1)).toBeNull()
  })

  it('nunca se teletransporta: el trayecto va a paso de carrera, no a saltos', () => {
    let last = huddleCat(huddle, 2000)
    for (let t = 2050; t < 2000 + huddle.route.ms; t += 50) {
      const now = huddleCat(huddle, t)
      expect(Math.hypot(now.x - last.x, now.y - last.y)).toBeLessThan(2)
      last = now
    }
  })
})
