import { beforeEach, describe, expect, it } from 'vitest'
import { loadGameOptions, saveGameOptions } from './gameOptions'

describe('gameOptions', () => {
  beforeEach(() => localStorage.clear())

  it('por defecto no fuerza el movimiento reducido', () => {
    expect(loadGameOptions()).toEqual({ reduceMotion: false })
  })

  it('recuerda la elección', () => {
    saveGameOptions({ reduceMotion: true })
    expect(loadGameOptions()).toEqual({ reduceMotion: true })
  })

  it('ignora datos dañados o con otro tipo', () => {
    localStorage.setItem('valle-del-bucle:options', '{no es json')
    expect(loadGameOptions()).toEqual({ reduceMotion: false })
    localStorage.setItem('valle-del-bucle:options', JSON.stringify({ reduceMotion: 'sí' }))
    expect(loadGameOptions()).toEqual({ reduceMotion: false })
  })
})
