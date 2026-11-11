import { describe, expect, it } from 'vitest'
import { CHAR_MS, LINE_PAUSE_MS, linesAt, typedCount } from './loadingConsole'

const LINES = ['> uno', '> dos']

describe('linesAt', () => {
  it('al empezar ya se ve la primera línea, aún vacía', () => {
    expect(linesAt(LINES, 0)).toEqual([''])
  })

  it('escribe cada línea letra a letra', () => {
    expect(linesAt(LINES, CHAR_MS * 3)).toEqual(['> u'])
  })

  it('la segunda línea sale tras escribir la primera y una pausa', () => {
    const start = LINES[0].length * CHAR_MS + LINE_PAUSE_MS
    expect(linesAt(LINES, start - 1)).toEqual(['> uno'])
    expect(linesAt(LINES, start + CHAR_MS * 3)).toEqual(['> uno', '> d'])
  })

  it('con todo el tiempo del mundo salen todas completas', () => {
    expect(linesAt(LINES, Infinity)).toEqual(LINES)
  })
})

describe('typedCount', () => {
  it('suma las letras visibles de todas las líneas', () => {
    expect(typedCount(['> uno', '> d'])).toBe(8)
  })
})
