import { describe, expect, it } from 'vitest'
import { composeAvatar } from './avatar/index.js'
import { isValidLook } from './look.js'
import { LUPE_LOOK } from './lupe.js'

describe('Lupe', () => {
  it('su aspecto es una combinación válida del generador', () => {
    expect(isValidLook(LUPE_LOOK)).toBe(true)
  })

  it('se dibuja en las cuatro direcciones', () => {
    ;['down', 'left', 'right', 'up'].forEach((dir) => expect(composeAvatar(LUPE_LOOK, dir, 1).rows.length).toBeGreaterThan(0))
  })
})
