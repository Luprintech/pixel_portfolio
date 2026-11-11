import { useLayoutEffect, useState } from 'react'

// Escala a la que se pinta el lienzo de un juego para llenar la caja que lo contiene sin deformarlo. Se ajusta a pasos de un
// píxel físico (la pantalla de 1,25× o 2× también cuenta), así cada píxel del juego mide un número entero de píxeles reales y el
// dibujo se ve nítido; por debajo de 1 vuelve a pasos de un cuarto para que quepa en móviles pequeños.
export function snapScale(raw, ratio = 1) {
  if (!Number.isFinite(raw) || raw <= 0) return 1
  if (raw < 1) return Math.max(0.5, Math.floor(raw * 4) / 4)
  return Math.floor(raw * ratio) / ratio
}

export function useStageScale(boxRef, width, height) {
  const [scale, setScale] = useState(2)
  useLayoutEffect(() => {
    const box = boxRef.current
    if (!box) return undefined
    const measure = () => setScale(snapScale(Math.min(box.clientWidth / width, box.clientHeight / height), window.devicePixelRatio || 1))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    return () => observer.disconnect()
  }, [boxRef, width, height])
  return scale
}
