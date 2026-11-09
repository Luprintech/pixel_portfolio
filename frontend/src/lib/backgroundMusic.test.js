import { describe, expect, it } from 'vitest'
import { TRACKS } from './backgroundMusic'

describe('pistas de música', () => {
  it('la portada y el creador suenan con Welcome y el valle con Valle Exploration', () => {
    expect(decodeURIComponent(TRACKS.welcome)).toBe('/audio/Welcome Valle del Bucle.mp3')
    expect(decodeURIComponent(TRACKS.valley)).toBe('/audio/Valle Exploration.mp3')
  })

  it('los nombres con espacios van codificados para que la URL sea válida', () => {
    Object.values(TRACKS).forEach((src) => expect(src).not.toMatch(/\s/))
  })
})
