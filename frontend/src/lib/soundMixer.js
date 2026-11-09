// Mezclador de sonido: guarda los tres volúmenes del visitante y avisa a quien los usa. La música, el
// sonido ambiente y los efectos suenan a su volumen propio multiplicado por el general.
import { clampVolume, loadAudioPrefs, saveAudioPrefs } from './audioPrefs'

let prefs = loadAudioPrefs()
const listeners = new Set()

export const getSoundPrefs = () => prefs

export function updateSoundPrefs(patch) {
  const next = { ...prefs, ...patch }
  prefs = {
    muted: next.muted === true,
    master: clampVolume(next.master, 1),
    music: clampVolume(next.music),
    fx: clampVolume(next.fx, 0.7),
  }
  saveAudioPrefs(prefs)
  listeners.forEach((listener) => listener())
}

export const subscribeSoundPrefs = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Silenciar lo apaga todo: música, sonido ambiente y efectos.
export const musicLevel = () => (prefs.muted ? 0 : prefs.master * prefs.music)
// `base` es lo fuerte que suena ese efecto con los volúmenes al máximo.
export const fxLevel = (base = 1) => (prefs.muted ? 0 : prefs.master * prefs.fx * base)
