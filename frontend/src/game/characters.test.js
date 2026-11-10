import { describe, expect, it } from 'vitest'
import { DIRS, POSES, composeAvatar } from './avatar/index.js'
import { LETTERS } from './avatar/palette.js'
import { ATREUS_LOOK } from './atreus.js'
import { CHARACTERS } from './characters.js'
import { isValidLook, upgradeLook } from './look.js'

const rowsOf = (look, dir, pose) => composeAvatar(look, dir, pose).rows
const count = (rows, letter) => rows.join('').split(letter).length - 1

describe('personajes con aspecto fijo', () => {
  it('se dibujan en las cuatro direcciones y las tres poses con el lienzo de la viajera', () => {
    Object.values(CHARACTERS).forEach((look) =>
      DIRS.forEach((dir) => {
        for (let pose = 0; pose < POSES; pose++) {
          const { rows, width, height } = composeAvatar(look, dir, pose)
          expect([width, height]).toEqual([18, 34])
          rows.forEach((row) => [...row].forEach((letter) => expect(letter === '.' || LETTERS.includes(letter)).toBe(true)))
        }
      }),
    )
  })

  it('las piezas propias de Atreus no son opciones del creador', () => {
    expect(isValidLook(ATREUS_LOOK)).toBe(false)
    const asTraveller = upgradeLook(ATREUS_LOOK)
    expect(asTraveller).toBeNull()
  })

  it('Atreus lleva bigote y perilla en frente y perfil, y nada de vello de espalda', () => {
    expect(count(rowsOf(ATREUS_LOOK, 'down', 0), 'K')).toBeGreaterThan(0)
    expect(count(rowsOf(ATREUS_LOOK, 'right', 0), 'K')).toBeGreaterThan(0)
    expect(count(rowsOf(ATREUS_LOOK, 'up', 0), 'K')).toBe(0)
  })

  it('el pendiente de Atreus solo se ve de frente y desde su lado izquierdo', () => {
    expect(count(rowsOf(ATREUS_LOOK, 'down', 0), 'A')).toBe(1)
    expect(count(rowsOf(ATREUS_LOOK, 'left', 0), 'A')).toBe(1)
    expect(count(rowsOf(ATREUS_LOOK, 'right', 0), 'A')).toBe(0)
    expect(count(rowsOf(ATREUS_LOOK, 'up', 0), 'A')).toBe(0)
  })

  it('los pies de Atreus no se mueven de fila al caminar', () => {
    DIRS.forEach((dir) => {
      const bottoms = [0, 1, 2].map((pose) => rowsOf(ATREUS_LOOK, dir, pose).findLastIndex((row) => /[^.]/.test(row)))
      expect(new Set(bottoms).size).toBe(1)
    })
  })
})
