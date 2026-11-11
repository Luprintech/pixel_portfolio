import { useCallback, useEffect, useRef, useState } from 'react'
import { clearSave, loadSave, writeSave } from '../game/save'
import { getStory } from '../game/story/storyStore'

// Cada cuánto se guarda sola la partida mientras se juega, y cuánto se ve el aviso.
export const AUTOSAVE_MS = 60_000
const TOAST_MS = 2800

// Guardado de la partida del valle: a mano (Opciones), automático cada minuto con un aviso breve, y en silencio al
// cerrar o abandonar la página. Junto al aspecto guarda la hora del valle y la posición (`snapshot` de la escena).
// `active` es "se está jugando": con el creador abierto no se guarda, porque el aspecto aún es un borrador.
export function useValleSave({ game, active, name, look, pet, petName, autosavedText }) {
  const [saved, setSaved] = useState(() => !!loadSave())
  const [toast, setToast] = useState(null)
  // Tras "Borrar partida" nada se vuelve a guardar solo hasta que la persona guarde o vuelva a entrar al valle:
  // si no, la partida borrada reaparecería al minuto.
  const erased = useRef(false)

  const write = useCallback(() => {
    // Con el juego ya destruido no hay estado del valle que guardar: se deja la partida como estaba en lugar de
    // reescribirla sin hora ni posición.
    const scene = game ? game.scene.getScene('valle') : null
    if (game && !scene) return false
    return writeSave({ name, look, pet, petName, world: scene?.snapshot(), story: game ? getStory(game) : undefined })
  }, [game, name, look, pet, petName])

  // Guardado explícito: de la persona (Opciones) o al confirmar el creador. Devuelve si pudo guardar.
  const saveNow = useCallback(() => {
    erased.current = false
    const ok = write()
    if (ok) setSaved(true)
    return ok
  }, [write])

  const eraseSave = useCallback(() => {
    clearSave()
    erased.current = true
    setSaved(false)
  }, [])

  useEffect(() => {
    if (!game || !active) return undefined
    const timer = setInterval(() => {
      if (erased.current || !write()) return
      setSaved(true)
      setToast({ id: Date.now(), text: autosavedText })
    }, AUTOSAVE_MS)
    // `pagehide` cubre recargar y cerrar la pestaña; la limpieza, salir del valle por un enlace de la página.
    const quiet = () => {
      if (!erased.current) write()
    }
    window.addEventListener('pagehide', quiet)
    return () => {
      clearInterval(timer)
      window.removeEventListener('pagehide', quiet)
      quiet()
    }
  }, [game, active, write, autosavedText])

  // La historia se guarda en cuanto cambia (bienvenida, visita guiada, conversaciones): si la página se cierra a mitad, la
  // partida recupera un estado coherente sin esperar al guardado de cada minuto.
  useEffect(() => {
    if (!game || !active) return undefined
    const onStory = () => {
      if (!erased.current) write()
    }
    game.registry.events.on('changedata-story', onStory)
    return () => game.registry.events.off('changedata-story', onStory)
  }, [game, active, write])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), TOAST_MS)
    return () => clearTimeout(timer)
  }, [toast])

  return { saved, toast, saveNow, eraseSave }
}
