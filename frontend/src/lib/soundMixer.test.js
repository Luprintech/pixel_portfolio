import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fxLevel, getSoundPrefs, musicLevel, subscribeSoundPrefs, updateSoundPrefs } from './soundMixer'

describe('soundMixer', () => {
  beforeEach(() => updateSoundPrefs({ muted: false, master: 1, music: 0.5, fx: 0.7 }))

  it('avisa a todos los que escuchan cuando cambia el volumen general', () => {
    const barOnScreen = vi.fn()
    const options = vi.fn()
    const stops = [subscribeSoundPrefs(barOnScreen), subscribeSoundPrefs(options)]
    updateSoundPrefs({ master: 0.3 })
    expect(barOnScreen).toHaveBeenCalledTimes(1)
    expect(options).toHaveBeenCalledTimes(1)
    expect(getSoundPrefs().master).toBe(0.3)
    stops.forEach((stop) => stop())
  })

  it('el volumen real es el de cada canal por el general', () => {
    updateSoundPrefs({ master: 0.5, music: 0.8, fx: 0.4 })
    expect(musicLevel()).toBeCloseTo(0.4)
    expect(fxLevel()).toBeCloseTo(0.2)
    expect(fxLevel(0.5)).toBeCloseTo(0.1)
  })

  it('los volúmenes se mantienen entre 0 y 1', () => {
    updateSoundPrefs({ master: 5, music: -1 })
    expect(getSoundPrefs().master).toBe(1)
    expect(getSoundPrefs().music).toBe(0)
  })

  it('silenciar apaga música y efectos, y al reactivarlo vuelven a su volumen', () => {
    updateSoundPrefs({ master: 0.5, music: 0.8, fx: 0.4, muted: true })
    expect(musicLevel()).toBe(0)
    expect(fxLevel()).toBe(0)
    expect(fxLevel(0.8)).toBe(0)
    updateSoundPrefs({ muted: false })
    expect(musicLevel()).toBeCloseTo(0.4)
    expect(fxLevel()).toBeCloseTo(0.2)
  })
})
