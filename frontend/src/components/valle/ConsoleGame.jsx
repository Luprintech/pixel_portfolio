import { useCallback, useEffect, useRef, useState } from 'react'
import { createGame, step } from '../../game/retro/logic'
import { drawGame } from '../../game/retro/render'
import { HEIGHT, WIDTH } from '../../game/retro/world'
import { PAL } from '../../game/palette'
import { getEngine, startEngineIfAllowed } from '../../lib/audioEngine'
import { retroText, retroUi } from '../../lib/retroCopy'
import { playRetroSound } from '../../lib/retroSound'
import { useValleCopy } from '../../lib/valleCopy'

const KEYS = {
  ArrowUp: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', s: 'down', S: 'down',
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
}
const ACTION_KEYS = new Set(['e', 'E', ' ', 'Enter'])
const MAX_FRAME_MS = 50

// Entero más grande al que cabe el lienzo en la pantalla, dejando sitio al texto y a los controles táctiles.
const scaleFor = () => Math.max(1, Math.floor(Math.min(window.innerWidth / WIDTH, (window.innerHeight - 190) / HEIGHT)))

// Lo que la pantalla muestra además del lienzo: el mensaje, la línea del sabio y si se ha acabado la partida.
const uiOf = (state) => ({
  message: state.message?.key ?? null,
  dialog: state.dialog ? state.dialog.lines[state.dialog.index] : null,
  over: state.over,
})

// Cruceta táctil y botón A: se leen como las teclas.
function TouchPad({ labels, onDirection, onAction }) {
  const hold = (dir, on) => (event) => {
    event.preventDefault()
    onDirection(dir, on)
  }
  const button = (dir, symbol, className) => (
    <button
      key={dir}
      type="button"
      aria-label={labels[dir]}
      className={`px-btn px-btn--bone !min-h-12 !w-12 !p-0 ${className}`}
      onPointerDown={hold(dir, true)}
      onPointerUp={hold(dir, false)}
      onPointerLeave={hold(dir, false)}
      onPointerCancel={hold(dir, false)}
      onContextMenu={(event) => event.preventDefault()}
    >
      {symbol}
    </button>
  )
  return (
    <div className="flex w-full max-w-md items-center justify-between px-4">
      <div className="grid grid-cols-3 grid-rows-3 gap-1">
        {button('up', '▲', 'col-start-2 row-start-1')}
        {button('left', '◀', 'col-start-1 row-start-2')}
        {button('right', '▶', 'col-start-3 row-start-2')}
        {button('down', '▼', 'col-start-2 row-start-3')}
      </div>
      <button type="button" className="px-btn !min-h-16 !w-16 !rounded-full !p-0 text-xl" onPointerDown={(event) => { event.preventDefault(); onAction() }}>
        A
      </button>
    </div>
  )
}

// Juego retro de la consola de Lupe: una aventura de pantallas estilo 8 bits con un sabio, un bosque, una mazmorra con
// monstruos, cofres, una espada, una llave y un jefe. La lógica (`game/retro/logic.js`) no sabe de teclas ni de lienzo; esto
// las lee, la hace avanzar con el reloj de la pantalla y dibuja el resultado. Esc sale; con el diálogo, E avanza.
export default function ConsoleGame({ onClose, onWin }) {
  const { lang } = useValleCopy()
  const ui = retroUi(lang)
  const canvasRef = useRef(null)
  const stateRef = useRef(createGame())
  const held = useRef(new Set())
  const actionRef = useRef(false)
  const [view, setView] = useState(() => uiOf(stateRef.current))
  const [scale, setScale] = useState(scaleFor)
  const touch = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches

  useEffect(() => {
    const onResize = () => setScale(scaleFor())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const restart = useCallback(() => {
    stateRef.current = createGame()
    setView(uiOf(stateRef.current))
  }, [])

  useEffect(() => {
    const down = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      } else if (KEYS[event.key]) {
        event.preventDefault()
        held.current.add(KEYS[event.key])
      } else if (ACTION_KEYS.has(event.key) && !event.repeat) {
        event.preventDefault()
        if (stateRef.current.over) restart()
        else actionRef.current = true
      }
    }
    const up = (event) => {
      if (KEYS[event.key]) held.current.delete(KEYS[event.key])
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [onClose, restart])

  // Bucle: avanza el juego con el tiempo real (acotado, para que una pestaña dormida no dé un salto) y lo dibuja.
  useEffect(() => {
    const g = canvasRef.current.getContext('2d')
    let last = performance.now()
    let shown = uiOf(stateRef.current)
    let frame = requestAnimationFrame(function tick(now) {
      const dt = Math.min(MAX_FRAME_MS, now - last)
      last = now
      const state = stateRef.current
      const dx = (held.current.has('right') ? 1 : 0) - (held.current.has('left') ? 1 : 0)
      const dy = (held.current.has('down') ? 1 : 0) - (held.current.has('up') ? 1 : 0)
      const events = step(state, { dx, dy, action: actionRef.current }, dt)
      actionRef.current = false
      if (events.length) {
        const engine = getEngine() ?? startEngineIfAllowed()
        events.forEach(({ type }) => {
          playRetroSound(engine, type)
          if (type === 'win') onWin?.()
        })
      }
      drawGame(g, state, now)
      const next = uiOf(state)
      if (next.message !== shown.message || next.dialog !== shown.dialog || next.over !== shown.over) {
        shown = next
        setView(next)
      }
      frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [onWin])

  const direction = useCallback((dir, on) => (on ? held.current.add(dir) : held.current.delete(dir)), [])
  const act = useCallback(() => {
    if (stateRef.current.over) restart()
    else actionRef.current = true
  }, [restart])

  const text = view.over === 'dead' ? ui.dead : view.dialog ? retroText(lang, view.dialog) : view.message ? retroText(lang, view.message) : ''

  return (
    <div role="dialog" aria-modal="true" aria-label={ui.title} className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 p-3" style={{ background: PAL.ink }}>
      <button type="button" data-sound="back" className="px-btn px-btn--bone absolute right-3 top-3 !min-h-9 !py-0" style={{ color: PAL.ink }} onClick={onClose}>
        {ui.close}
      </button>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} aria-label={ui.canvas} role="img" className="[image-rendering:pixelated]" style={{ width: WIDTH * scale, height: HEIGHT * scale, boxShadow: `0 0 0 4px ${PAL.stone}, 0 0 0 8px ${PAL.ink2}` }} />
      <p className="px-text min-h-[3.25rem] w-full max-w-xl px-3 py-2 text-center text-base" style={{ color: PAL.bone }} aria-live="polite">
        {text}
        {view.dialog && <span aria-hidden="true"> ▼</span>}
      </p>
      {view.over && (
        <div className="flex flex-col items-center gap-2">
          {view.over === 'won' && <p className="px-text text-lg font-semibold" style={{ color: PAL.saffronLight }}>{ui.won}</p>}
          <button type="button" className="px-btn" onClick={restart}>{ui.restart}</button>
        </div>
      )}
      {touch ? <TouchPad labels={ui.pad} onDirection={direction} onAction={act} /> : <p className="px-text text-xs" style={{ color: PAL.bone, opacity: 0.7 }}>{ui.hint}</p>}
    </div>
  )
}
