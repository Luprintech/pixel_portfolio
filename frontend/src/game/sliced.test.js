import { describe, expect, it } from 'vitest'
import { Job, drain, runSliced } from './sliced.js'

function* count(to) {
  for (let i = 0; i < to; i++) yield i
  return to
}

describe('sliced', () => {
  it('drain termina un generador y devuelve su resultado', () => {
    expect(drain(count(5))).toBe(5)
  })

  it('un trabajo avanza por porciones y se calcula una sola vez', () => {
    let runs = 0
    const work = new Job(function* make() {
      runs += 1
      yield
      yield
      return 'listo'
    })
    expect(work.step()).toBe(false)
    expect(work.step()).toBe(false)
    expect(work.step()).toBe(true)
    expect(work.value).toBe('listo')
    expect(work.get()).toBe('listo')
    expect(runs).toBe(1)
  })

  it('get termina lo que quede aunque otro lo haya empezado', () => {
    const work = new Job(() => count(10))
    work.step()
    work.step()
    expect(work.get()).toBe(10)
    expect(work.done).toBe(true)
  })

  it('un trabajo puede esperar a otro con steps()', () => {
    const inner = new Job(() => count(3))
    const outer = new Job(function* make() {
      const value = yield* inner.steps()
      return value + 1
    })
    expect(outer.get()).toBe(4)
  })

  it('runSliced reparte la lista y se cumple al terminar todos', async () => {
    const works = [new Job(() => count(50)), new Job(() => count(50))]
    await runSliced(works, { budgetMs: 1, gapMs: 1 })
    expect(works.every((w) => w.done)).toBe(true)
  })
})
