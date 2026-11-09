import { afterEach, describe, expect, it, vi } from 'vitest'
import { prefersReducedMotion } from './reducedMotion'

describe('prefersReducedMotion', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('sigue lo que pide el sistema', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    expect(prefersReducedMotion()).toBe(true)
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    expect(prefersReducedMotion()).toBe(false)
  })

  it('sin matchMedia no reduce nada', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(prefersReducedMotion()).toBe(false)
  })
})
