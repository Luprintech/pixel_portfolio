import { describe, expect, it } from 'vitest'
import { composeAvatar } from './avatar/index.js'
import { isValidLook } from './look.js'
import { LUPE_LOOK } from './lupe.js'
import { lupeRows } from './lupePoses.js'
import { LETTERS } from './avatar/palette.js'

describe('Lupe', () => {
  it('su aspecto es una combinación válida del generador', () => {
    expect(isValidLook(LUPE_LOOK)).toBe(true)
  })

  it('se dibuja en las cuatro direcciones', () => {
    ;['down', 'left', 'right', 'up'].forEach((dir) => expect(composeAvatar(LUPE_LOOK, dir, 1).rows.length).toBeGreaterThan(0))
  })

  it('lleva el collar con el rubí y las mangas abullonadas en todas sus poses', () => {
    ;[['idle', 0], ['wave', 0], ['wave', 1], ['pet', 0], ['pet', 1]].forEach(([pose, step]) => {
      const rows = lupeRows(pose, step)
      expect(rows.join('')).toContain('J')
      expect(rows[19].slice(6, 12)).toBe('TTJJTT')
      rows.forEach((row) => [...row].forEach((letter) => expect(letter === '.' || LETTERS.includes(letter)).toBe(true)))
    })
  })
})
