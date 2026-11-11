import { describe, expect, it } from 'vitest'
import { DIALOGUE_COPY } from '../../lib/dialogueCopy'
import { CONSOLES } from './consoles.js'

describe('consolas de la estantería', () => {
  it('son las once que cuenta Lupe, con id único y un dibujo cada una', () => {
    const ids = CONSOLES.map((item) => item.id)
    expect(new Set(ids).size).toBe(11)
    expect(ids).toEqual(['n64', 'gbc', 'ds3', 'gamecube', 'wii', 'switch', 'ps1', 'ps2', 'ps3', 'ps4', 'xbox'])
    CONSOLES.forEach((item) => expect(typeof item.draw).toBe('function'))
  })

  it('la estantería ya no tiene conversación propia', () => {
    expect(Object.keys(DIALOGUE_COPY.es.lines).filter((key) => key.startsWith('consolas.'))).toEqual([])
  })
})
