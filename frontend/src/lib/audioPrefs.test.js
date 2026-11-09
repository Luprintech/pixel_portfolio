import { beforeEach, describe, expect, it } from 'vitest'
import { clampVolume, loadAudioPrefs, saveAudioPrefs } from './audioPrefs'

const DEFAULTS = { muted: false, master: 1, music: 0.5, fx: 0.7 }

describe('audioPrefs', () => {
  beforeEach(() => localStorage.clear())

  it('empieza encendida, con el general al máximo y la música a medio volumen', () => {
    expect(loadAudioPrefs()).toEqual(DEFAULTS)
  })

  it('recuerda lo que eligió el visitante', () => {
    saveAudioPrefs({ muted: true, master: 0.6, music: 0.8, fx: 0.3 })
    expect(loadAudioPrefs()).toEqual({ muted: true, master: 0.6, music: 0.8, fx: 0.3 })
  })

  it('recoge el volumen que guardaban las versiones anteriores como el de la música', () => {
    localStorage.setItem('valle-del-bucle:audio', JSON.stringify({ on: false, volume: 0.25 }))
    expect(loadAudioPrefs()).toEqual({ ...DEFAULTS, music: 0.25 })
  })

  it('mantiene el volumen entre 0 y 1', () => {
    expect(clampVolume(3)).toBe(1)
    expect(clampVolume(-2)).toBe(0)
    expect(clampVolume('0.25')).toBe(0.25)
    expect(clampVolume('abc')).toBe(0.5)
    expect(clampVolume('abc', 1)).toBe(1)
  })

  it('ignora datos guardados que no son válidos', () => {
    localStorage.setItem('valle-del-bucle:audio', '{no es json')
    expect(loadAudioPrefs()).toEqual(DEFAULTS)
    localStorage.setItem('valle-del-bucle:audio', JSON.stringify({ on: false, music: 9, fx: 'x', master: -1 }))
    expect(loadAudioPrefs()).toEqual({ muted: false, master: 0, music: 1, fx: 0.7 })
  })
})
