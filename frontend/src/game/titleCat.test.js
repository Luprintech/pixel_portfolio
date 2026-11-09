import { describe, expect, it } from 'vitest'
import { CAT_HOME, CAT_NEAR, scaredCat, startScare } from './titleCat.js'

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
