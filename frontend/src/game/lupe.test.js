import { describe, expect, it } from 'vitest'
import { composeAvatar } from './avatar/index.js'
import { isValidLook } from './look.js'
import { LUPE_LOOK } from './lupe.js'
import { lupeRows } from './lupePoses.js'
import { LETTERS } from './avatar/palette.js'

describe('Lupe', () => {
  it('su emblema y su melena no son opciones del creador', () => {
    expect(isValidLook(LUPE_LOOK)).toBe(false)
    expect(isValidLook({ ...LUPE_LOOK, hairStyle: 'ondulado' })).toBe(true)
  })

  it('se dibuja en las cuatro direcciones', () => {
    ;['down', 'left', 'right', 'up'].forEach((dir) => expect(composeAvatar(LUPE_LOOK, dir, 1).rows.length).toBeGreaterThan(0))
  })

  // La Trifuerza va en dorado fijo (letra Y): entera de frente, un canto de perfil y nada de espalda.
  const gold = (dir, pose) => composeAvatar(LUPE_LOOK, dir, pose).rows.join('').split('Y').length - 1

  it('enseña la Trifuerza solo desde donde se ve', () => {
    ;[0, 1, 2].forEach((pose) => {
      expect(gold('down', pose)).toBe(8)
      expect(gold('left', pose)).toBe(3)
      expect(gold('right', pose)).toBe(3)
      expect(gold('up', pose)).toBe(0)
    })
  })

  it('conserva la Trifuerza y solo usa letras conocidas en todas sus poses', () => {
    ;[['idle', 0], ['wave', 0], ['wave', 1], ['pet', 0], ['pet', 1]].forEach(([pose, step]) => {
      const rows = lupeRows(pose, step)
      expect(rows[20][9]).toBe('Y')
      expect(rows[22].slice(7, 12)).toBe('YYYYY')
      rows.forEach((row) => [...row].forEach((letter) => expect(letter === '.' || LETTERS.includes(letter)).toBe(true)))
    })
  })
})
