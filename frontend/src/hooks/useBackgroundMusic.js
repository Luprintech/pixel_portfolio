import { useCallback, useEffect, useRef, useState } from 'react'
import { clampVolume, loadAudioPrefs, saveAudioPrefs } from '../lib/audioPrefs'

// Música de fondo en bucle con volumen y silencio. No descarga nada hasta que el visitante la enciende,
// y si el archivo no existe la interfaz de sonido no aparece (`available` es false).
export function useBackgroundMusic(src) {
  const audioRef = useRef(null)
  const [prefs, setPrefs] = useState(loadAudioPrefs)
  const [available, setAvailable] = useState(false)
  const [playing, setPlaying] = useState(false)
  const prefsRef = useRef(prefs)
  prefsRef.current = prefs

  const remember = useCallback((next) => {
    prefsRef.current = next
    setPrefs(next)
    saveAudioPrefs(next)
  }, [])

  const start = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return false
    audio.volume = prefsRef.current.volume
    try {
      await audio.play()
      setPlaying(true)
      return true
    } catch {
      // El navegador exige un gesto del usuario antes de dejar sonar: se queda en silencio.
      setPlaying(false)
      return false
    }
  }, [])

  const stop = useCallback(() => {
    audioRef.current?.pause()
    setPlaying(false)
  }, [])

  // Comprueba que la pista existe antes de enseñar los controles. En desarrollo un archivo que falta
  // devuelve la página de inicio con 200, así que se mira también el tipo de contenido.
  useEffect(() => {
    let cancelled = false
    const audio = new Audio()
    audio.src = src
    audio.loop = true
    audio.preload = 'none'
    audioRef.current = audio
    fetch(src, { method: 'HEAD' })
      .then((response) => {
        if (cancelled) return
        const isAudio = response.ok && (response.headers.get('content-type') || '').startsWith('audio')
        setAvailable(isAudio)
        if (isAudio && prefsRef.current.on) start()
      })
      .catch(() => {
        if (!cancelled) setAvailable(false)
      })
    return () => {
      cancelled = true
      audio.pause()
      audioRef.current = null
    }
  }, [src, start])

  const toggle = useCallback(() => {
    if (playing) {
      remember({ ...prefsRef.current, on: false })
      stop()
      return
    }
    const volume = prefsRef.current.volume > 0 ? prefsRef.current.volume : 0.5
    remember({ on: true, volume })
    start()
  }, [playing, remember, start, stop])

  const setVolume = useCallback(
    (value) => {
      const volume = clampVolume(value)
      if (audioRef.current) audioRef.current.volume = volume
      if (volume === 0) {
        remember({ on: false, volume })
        stop()
        return
      }
      remember({ on: true, volume })
      if (!playing) start()
    },
    [playing, remember, start, stop],
  )

  return { available, playing, volume: prefs.volume, toggle, setVolume }
}
