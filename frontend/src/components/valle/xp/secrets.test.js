import { describe, expect, it } from 'vitest'
import { isHelloWorld } from './secrets.js'

describe('logro «Hola, mundo»', () => {
  it('se da al escribir «Hola, mundo» ignorando mayúsculas y espacios de los extremos', () => {
    ;['Hola, mundo', 'hola, mundo', '  HOLA, MUNDO  ', '\nHola, mundo\n'].forEach((text) => expect(isHelloWorld(text), text).toBe(true))
  })

  it('no se da con otro texto parecido', () => {
    ;['Hola mundo', 'Hola, mundo!', 'Hola,  mundo', 'hola', '', 'Hola, mundo. Adiós'].forEach((text) => expect(isHelloWorld(text), text).toBe(false))
  })
})
