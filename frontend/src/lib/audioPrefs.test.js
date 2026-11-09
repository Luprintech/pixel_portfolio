import { beforeEach, describe, expect, it } from 'vitest'
import { clampVolume, loadAudioPrefs, saveAudioPrefs } from './audioPrefs'

describe('audioPrefs', () => {
  beforeEach(() => localStorage.clear())

  it('empieza apagada y a medio volumen', () => {
    expect(loadAudioPrefs()).toEqual({ on: false, volume: 0.5 })
  })

  it('recuerda lo que eligió el visitante', () => {
    saveAudioPrefs({ on: true, volume: 0.8 })
    expect(loadAudioPrefs()).toEqual({ on: true, volume: 0.8 })
  })

  it('mantiene el volumen entre 0 y 1', () => {
    expect(clampVolume(3)).toBe(1)
    expect(clampVolume(-2)).toBe(0)
    expect(clampVolume('0.25')).toBe(0.25)
    expect(clampVolume('abc')).toBe(0.5)
  })

  it('ignora datos guardados que no son válidos', () => {
    localStorage.setItem('valle-del-bucle:audio', '{no es json')
    expect(loadAudioPrefs()).toEqual({ on: false, volume: 0.5 })
    localStorage.setItem('valle-del-bucle:audio', JSON.stringify({ on: 'sí', volume: 9 }))
    expect(loadAudioPrefs()).toEqual({ on: false, volume: 1 })
  })
})
