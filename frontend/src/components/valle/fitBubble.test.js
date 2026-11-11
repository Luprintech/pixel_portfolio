import { describe, expect, it } from 'vitest'
import { readingTime } from './fitBubble'

describe('tiempo de lectura de un bocadillo', () => {
  it('nunca baja de tres segundos y crece con el texto', () => {
    expect(readingTime('Hola')).toBeGreaterThanOrEqual(3200)
    expect(readingTime('a'.repeat(120))).toBeGreaterThan(readingTime('a'.repeat(40)))
  })

  it('da tiempo de sobra para leer las reacciones de Atreus', async () => {
    const { COPY } = await import('../../lib/valleCopy')
    Object.values(COPY).forEach((copy) => {
      copy.bubbles.sardine.forEach((line) => {
        // Unas 15 letras por segundo es una lectura tranquila.
        expect(readingTime(line), line).toBeGreaterThanOrEqual((line.length / 15) * 1000)
      })
    })
  })
})
