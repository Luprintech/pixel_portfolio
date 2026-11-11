import { useCallback, useState } from 'react'
import { loadAchievements, unlockAchievement } from '../game/achievements'

const TOAST_MS = 4200

// Logros desbloqueados y el aviso del último. `unlock(id)` es seguro de llamar varias veces: solo avisa la primera.
export function useAchievements() {
  const [unlocked, setUnlocked] = useState(loadAchievements)
  const [toast, setToast] = useState(null)

  const unlock = useCallback((id) => {
    setUnlocked((current) => {
      const { next, isNew } = unlockAchievement(current, id)
      if (isNew) {
        setToast({ id, key: Date.now() })
        setTimeout(() => setToast((shown) => (shown && shown.id === id ? null : shown)), TOAST_MS)
      }
      return next
    })
  }, [])

  // Tras «Borrar partida» los logros se vuelven a leer (ya están borrados).
  const reload = useCallback(() => setUnlocked(loadAchievements()), [])
  return { unlocked, toast, unlock, reload }
}
