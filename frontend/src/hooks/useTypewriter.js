import { useCallback, useEffect, useState } from 'react'
import { revealCount } from '../game/dialogue/engine'

// Texto que se va escribiendo a `cps` caracteres por segundo. Con `cps` 0 (movimiento reducido) aparece entero de golpe.
// Devuelve cuántos caracteres se ven, si ya está completo y `finish`, que lo completa al momento.
export function useTypewriter(text, cps) {
  // El avance recuerda de qué texto es: al pasar de página no se ve ni un fotograma del avance de la anterior.
  const [progress, setProgress] = useState({ text: '', count: 0 })
  // Texto cuya escritura se saltó: se compara por valor para que una página nueva vuelva a escribirse desde cero.
  const [skipped, setSkipped] = useState(null)

  useEffect(() => {
    if (!cps) return undefined
    const start = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const count = revealCount(text, now - start, cps)
      setProgress({ text, count })
      if (count < text.length) frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [text, cps])

  const finish = useCallback(() => setSkipped(text), [text])
  const count = progress.text === text ? progress.count : 0
  const done = !cps || skipped === text || count >= text.length
  return { shown: done ? text.length : count, done, finish }
}
