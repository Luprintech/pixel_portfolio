import { useRef, useState } from 'react'
import { useValleCopy } from '../../../lib/valleCopy'

const COLORS = ['#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4', '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9']
const SIZES = [2, 5, 10]

// Paint de Windows XP: lienzo blanco para dibujar con el dedo o el ratón, paleta de colores, tres grosores, goma y «Nuevo».
export default function Paint() {
  const { copy } = useValleCopy()
  const p = copy.desktop.paintUi
  const canvasRef = useRef(null)
  const last = useRef(null)
  const [color, setColor] = useState(COLORS[0])
  const [size, setSize] = useState(SIZES[0])
  const [erase, setErase] = useState(false)

  // Punto del lienzo bajo el puntero, en las coordenadas del propio dibujo (el lienzo se estira con CSS).
  const point = (event) => {
    const box = canvasRef.current.getBoundingClientRect()
    return { x: ((event.clientX - box.left) / box.width) * canvasRef.current.width, y: ((event.clientY - box.top) / box.height) * canvasRef.current.height }
  }

  const stroke = (from, to) => {
    const g = canvasRef.current.getContext('2d')
    g.strokeStyle = erase ? '#ffffff' : color
    g.lineWidth = erase ? size * 2 : size
    g.lineCap = 'round'
    g.beginPath()
    g.moveTo(from.x, from.y)
    g.lineTo(to.x, to.y)
    g.stroke()
  }

  const down = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    last.current = point(event)
    stroke(last.current, last.current)
  }
  const move = (event) => {
    if (!last.current) return
    const next = point(event)
    stroke(last.current, next)
    last.current = next
  }
  const up = () => {
    last.current = null
  }
  const clear = () => {
    const c = canvasRef.current
    const g = c.getContext('2d')
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, c.width, c.height)
  }

  return (
    <div className="h-full space-y-2 overflow-auto p-2" style={{ background: '#ece9d8' }}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button type="button" className="rounded border px-2 py-1" style={{ borderColor: '#7f9db9', background: '#fff' }} onClick={clear}>{p.new}</button>
        <button type="button" aria-pressed={erase} className="rounded border px-2 py-1" style={{ borderColor: '#7f9db9', background: erase ? '#cfe3ff' : '#fff' }} onClick={() => setErase((on) => !on)}>{p.eraser}</button>
        {SIZES.map((s) => (
          <button key={s} type="button" aria-label={`${p.size} ${s}`} aria-pressed={size === s} className="grid h-7 w-7 place-items-center rounded border" style={{ borderColor: '#7f9db9', background: size === s ? '#cfe3ff' : '#fff' }} onClick={() => setSize(s)}>
            <span className="block rounded-full bg-black" style={{ width: s + 2, height: s + 2 }} />
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1" role="group" aria-label={p.colors}>
        {COLORS.map((c) => (
          <button key={c} type="button" aria-label={c} aria-pressed={color === c && !erase} className="h-6 w-6 border-2" style={{ background: c, borderColor: color === c && !erase ? '#316ac5' : '#808080' }} onClick={() => { setColor(c); setErase(false) }} />
        ))}
      </div>
      <canvas
        ref={canvasRef}
        width={360}
        height={240}
        aria-label={p.canvas}
        className="block w-full touch-none border-2"
        style={{ borderColor: '#808080', background: '#fff', cursor: 'crosshair' }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      />
    </div>
  )
}
