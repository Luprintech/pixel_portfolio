import { useCallback, useRef, useState } from 'react'
import { loadAchievements, unlockAchievement } from '../game/achievements'
import { getEngine, startEngineIfAllowed } from '../lib/audioEngine'
import { playUiSound } from '../lib/uiSounds'

const TOAST_MS = 4200

// Logros desbloqueados y el aviso del último. `unlock(id)` es seguro de llamar varias veces: solo avisa y suena la primera.
// Este es el único sitio donde suena un logro: todos pasan por aquí, así el sonido es el mismo y no se repite por un mismo
// evento. Se decide fuera del actualizador de estado: ahí React puede ejecutarlo dos veces y el sonido saldría doble.
export function useAchievements() {
  const [unlocked, setUnlocked] = useState(loadAchievements)
  const [toast, setToast] = useState(null)
  const current = useRef(unlocked)

  const unlock = useCallback((id) => {
    const { next, isNew } = unlockAchievement(current.current, id)
    if (!isNew) return
    current.current = next
    setUnlocked(next)
    setToast({ id, key: Date.now() })
    playUiSound('achievement', getEngine() ?? startEngineIfAllowed())
    setTimeout(() => setToast((shown) => (shown && shown.id === id ? null : shown)), TOAST_MS)
  }, [])

  // Tras «Borrar partida» los logros se vuelven a leer (ya están borrados).
  const reload = useCallback(() => {
    current.current = loadAchievements()
    setUnlocked(current.current)
  }, [])
  return { unlocked, toast, unlock, reload }
}
