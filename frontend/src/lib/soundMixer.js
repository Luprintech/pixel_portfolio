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

// Volumen general: es el único control por el que pasa todo el sonido, así que silenciar o moverlo
// afecta a música, ambiente, mascotas y a cualquier sonido futuro sin que cada uno tenga que enterarse.
export const masterLevel = () => (prefs.muted ? 0 : prefs.master)
// Volumen propio de cada canal, sin el general (el motor de audio ya lo aplica en su nodo común).
export const channelLevels = () => ({ music: prefs.music, fx: prefs.fx })

// Volumen total de un canal, para los sonidos que no pasan por el motor (<audio> sin Web Audio).
// Silenciar lo apaga todo: música, sonido ambiente y efectos.
export const musicLevel = () => (prefs.muted ? 0 : prefs.master * prefs.music)
// `base` es lo fuerte que suena ese efecto con los volúmenes al máximo.
export const fxLevel = (base = 1) => (prefs.muted ? 0 : prefs.master * prefs.fx * base)
