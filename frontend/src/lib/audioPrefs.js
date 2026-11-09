// Preferencias de sonido del visitante, guardadas en el navegador: tres volúmenes (general, música y
// efectos) y si todo el sonido está silenciado. La música suena si su volumen no es cero, pero los
// navegadores no dejan sonar nada sin un gesto del usuario: suena en cuanto hay el primero.
const STORAGE_KEY = 'valle-del-bucle:audio'
const DEFAULTS = { muted: false, master: 1, music: 0.5, fx: 0.7 }

export const clampVolume = (value, fallback = DEFAULTS.music) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(1, Math.max(0, number))
}

// Las versiones anteriores guardaban el volumen de la música como `volume`.
export function loadAudioPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    const saved = JSON.parse(raw)
    return {
      muted: saved.muted === true,
      master: clampVolume(saved.master, DEFAULTS.master),
      music: clampVolume(saved.music ?? saved.volume, DEFAULTS.music),
      fx: clampVolume(saved.fx, DEFAULTS.fx),
    }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveAudioPrefs(prefs) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        muted: prefs.muted === true,
        master: clampVolume(prefs.master, DEFAULTS.master),
        music: clampVolume(prefs.music),
        fx: clampVolume(prefs.fx, DEFAULTS.fx),
      }),
    )
  } catch {
    // Sin almacenamiento disponible: las preferencias duran solo esta visita.
  }
}
