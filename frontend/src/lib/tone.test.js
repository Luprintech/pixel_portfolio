import { describe, expect, it } from 'vitest'
import { tone } from './tone.js'

describe('tone', () => {
  it('pide la variable del tema y deja el color de siempre como alternativa', () => {
    expect(tone('ink', '#1c1b3a')).toBe('var(--t-ink, #1c1b3a)')
  })
})
