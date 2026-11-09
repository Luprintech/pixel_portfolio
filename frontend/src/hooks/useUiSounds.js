import { useEffect } from 'react'
import { getEngine, startEngineIfAllowed } from '../lib/audioEngine'
import { playUiSound, uiSoundFor } from '../lib/uiSounds'

// Un solo oyente de clics para toda la pantalla del juego: así cada botón suena sin llevar su propio
// `onClick` y los botones nuevos suenan solos. Va en la fase de captura para sonar aunque el botón
// navegue o cierre el diálogo en el mismo clic.
export function useUiSounds() {
  useEffect(() => {
    const onClick = (event) => {
      const control = event.target.closest?.('button, a, [data-sound]')
      const sound = uiSoundFor(control)
      if (!sound) return
      playUiSound(sound, getEngine() ?? startEngineIfAllowed())
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])
}
