import { useEffect, useRef, useState } from 'react'
import { useThemeContext } from '../../../context/ThemeContext'
import { lightenWorld, softenCanvas } from '../../../game/titleSoften'
import { paintMeadow } from './meadow'

// Tope de la ampliación: a partir de aquí un sprite ocupa media pantalla y deja de ser un detalle.
const MAX_SCALE = 14

// Una escena pintada a la resolución del juego dentro de una caja que da el diseño. La ampliación es
// el mayor entero con el que caben `minCols` x `minRows` píxeles de juego (así un sprite nunca se
// corta, ni siquiera girado ni andando) y el prado se alarga hasta llenar la caja entera. El prado se
// pinta una vez por tamaño; `paint(g, { cols, rows })` dibuja encima en cada cambio y debe ser
// estable (useCallback), porque con la marcha se repinta unas siete veces por segundo.
export function useStageScene({ minCols, minRows, paint }) {
  const boxRef = useRef(null)
  const canvasRef = useRef(null)
  const meadowRef = useRef(null)
  const [size, setSize] = useState({ scale: 4, cols: minCols, rows: minRows })
  // En el tema valle el prado se aclara un poco y se suaviza, como el de la portada; la figura se dibuja
  // después y conserva su color.
  const pastel = useThemeContext().theme === 'valle'

  useEffect(() => {
    const box = boxRef.current
    const measure = () => {
      const { clientWidth: width, clientHeight: height } = box
      if (!width || !height) return
      const scale = Math.max(2, Math.min(Math.floor(width / minCols), Math.floor(height / minRows), MAX_SCALE))
      const next = { scale, cols: Math.ceil(width / scale), rows: Math.ceil(height / scale) }
      setSize((prev) => (prev.scale === next.scale && prev.cols === next.cols && prev.rows === next.rows ? prev : next))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    return () => observer.disconnect()
  }, [minCols, minRows])

  useEffect(() => {
    const meadow = document.createElement('canvas')
    meadow.width = size.cols
    meadow.height = size.rows
    paintMeadow(meadow.getContext('2d'), size.cols, size.rows)
    if (pastel) softenCanvas(lightenWorld(meadow))
    meadowRef.current = meadow
  }, [size, pastel])

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = size.cols
    canvas.height = size.rows
    const g = canvas.getContext('2d')
    g.drawImage(meadowRef.current, 0, 0)
    paint(g, size)
  }, [size, paint, pastel])

  return { boxRef, canvasRef, size }
}
