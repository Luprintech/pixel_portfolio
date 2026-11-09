import { useSyncExternalStore } from 'react'
import { getSoundPrefs, subscribeSoundPrefs, updateSoundPrefs } from '../lib/soundMixer'
import { setMusicVolume } from '../lib/backgroundMusic'
import { previewFx } from '../lib/ambience'

// Los tres volúmenes del visitante (general, música y efectos) y cómo cambiarlos.
export function useSoundPrefs() {
  const prefs = useSyncExternalStore(subscribeSoundPrefs, getSoundPrefs)
  return {
    ...prefs,
    setMaster: (master) => updateSoundPrefs({ master, muted: false }),
    setMusic: setMusicVolume,
    setFx: (fx) => updateSoundPrefs({ fx, muted: false }),
    previewFx,
  }
}
