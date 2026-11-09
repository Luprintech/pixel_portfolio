import { useEffect, useState } from 'react'

// Lo mismo que tarda el juego en cambiar de paso al caminar (`stepTimer` en ValleScene).
const STEP_MS = 140
// Reposo, paso, reposo, paso contrario: la viajera recorre los cuatro; la mascota, dos fotogramas.
export const STEPS = 4

// Paso actual de una marcha en el sitio, para que la vista previa camine sin desplazarse. Cada escena
// lleva su propio reloj: así solo se repinta ella y no el creador entero. Parado, siempre es el 0.
export function useWalkStep(active) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!active) return undefined
    const timer = setInterval(() => setStep((value) => (value + 1) % STEPS), STEP_MS)
    return () => clearInterval(timer)
  }, [active])

  return active ? step : 0
}
