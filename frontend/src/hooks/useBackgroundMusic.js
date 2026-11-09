import { useEffect, useSyncExternalStore } from 'react'
import { acquireMusic, getMusicSnapshot, subscribeMusic } from '../lib/backgroundMusic'
import { getSoundPrefs, subscribeSoundPrefs, updateSoundPrefs } from '../lib/soundMixer'

// Música de fondo en bucle, y el botón de silencio y la barra de volumen general de la pantalla: el
// silencio apaga todo el sonido (música, ambiente y efectos) y el volumen es el mismo que el de
// Opciones. La pista es una sola para toda la visita (ver `lib/backgroundMusic`); este hook la pide
// mientras el componente está en pantalla. Si el archivo no existe la interfaz de sonido no aparece.
export function useBackgroundMusic() {
  useEffect(() => acquireMusic(), [])
  const { available, playing } = useSyncExternalStore(subscribeMusic, getMusicSnapshot)
  const { master, muted } = useSyncExternalStore(subscribeSoundPrefs, getSoundPrefs)
  return {
    available,
    playing,
    muted,
    volume: master,
    toggle: () => updateSoundPrefs({ muted: !muted }),
    // Mover la barra con el sonido silenciado lo reactiva.
    setVolume: (value) => updateSoundPrefs({ master: value, muted: false }),
  }
}
