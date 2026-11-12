import { useLayoutEffect, useState } from 'react'

// Escala a la que se pinta el lienzo de un juego para llenar la caja que lo contiene sin deformarlo. Se ajusta a pasos de un
// píxel físico (la pantalla de 1,25× o 2× también cuenta), así cada píxel del juego mide un número entero de píxeles reales y el
// dibujo se ve nítido; por debajo de 1 vuelve a pasos de un cuarto para que quepa en móviles pequeños.
// En el móvil (`fine`) se llena el monitor entero: la escala es la que cabe, recortada solo al píxel físico de la pantalla (la
// anchura del lienzo, `width`, es un número entero de píxeles reales). Cada píxel del juego mide entonces 4 o 5 píxeles reales,
// que no se nota, y no se pierde ni una franja del monitor. Sin bordes ni recortes: el lienzo y su caja tienen la misma proporción.
export function snapScale(raw, ratio = 1, fine = false, width = 1) {
  if (!Number.isFinite(raw) || raw <= 0) return 1
  if (fine) {
    const device = width * ratio
    return Math.max(0.5, Math.floor(raw * device) / device)
  }
  if (raw < 1) return Math.max(0.5, Math.floor(raw * 4) / 4)
  return Math.floor(raw * ratio) / ratio
}

export function useStageScale(boxRef, width, height, fine = false) {
  const [scale, setScale] = useState(2)
  useLayoutEffect(() => {
    const box = boxRef.current
    if (!box) return undefined
    const measure = () => setScale(snapScale(Math.min(box.clientWidth / width, box.clientHeight / height), window.devicePixelRatio || 1, fine, width))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    return () => observer.disconnect()
  }, [boxRef, width, height, fine])
  return scale
}
