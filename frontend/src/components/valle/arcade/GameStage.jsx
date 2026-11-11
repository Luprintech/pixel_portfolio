import { useEffect, useRef, useState } from 'react'
import { FRAME } from '../../../game/arcade/shared'
import { MODULES } from '../../../game/arcade/modules'
import { arcadeText } from '../../../lib/arcadeCopy'
import StageBubble from './StageBubble'
import { useStageScale } from './useStageScale'

const MAX_FRAME_MS = 50

// Qué cambia de una vista a otra: basta comparar su contenido, que es pequeño.
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// Pantalla de un juego de la recreativa: el lienzo, su bucle y el bocadillo del personaje que habla. Crea la partida al montarse
// (cambiar `runKey` la reinicia), la hace avanzar con el reloj de la pantalla mientras no esté en pausa, dibuja cada fotograma y
// avisa de lo que ocurre: la vista (`onView`), los sucesos del paso (`onEvents`, para sonido) y el resultado al terminar
// (`onFinish`). Lee las teclas y los botones táctiles de `input` ({ held, action, hold }). El juego en sí no sabe de nada de esto.
export default function GameStage({ gameId, runKey, paused, input, lang, ui, onView, onEvents, onFinish }) {
  const boxRef = useRef(null)
  const canvasRef = useRef(null)
  const pausedRef = useRef(paused)
  const callbacks = useRef({ onView, onEvents, onFinish })
  const [view, setView] = useState(null)
  const scale = useStageScale(boxRef, FRAME.width, FRAME.height)

  useEffect(() => {
    pausedRef.current = paused
    callbacks.current = { onView, onEvents, onFinish }
  })

  useEffect(() => {
    const game = MODULES[gameId]
    const state = game.create(game.seeds[runKey % game.seeds.length])
    const g = canvasRef.current.getContext('2d')
    let shown = game.view(state)
    let finished = false
    let last = performance.now()
    setView(shown)
    callbacks.current.onView(shown)
    const frame = requestAnimationFrame(function tick(now) {
      const dt = Math.min(MAX_FRAME_MS, now - last)
      last = now
      if (!pausedRef.current) {
        const { held } = input.current
        const dx = (held.has('right') ? 1 : 0) - (held.has('left') ? 1 : 0)
        const dy = (held.has('down') ? 1 : 0) - (held.has('up') ? 1 : 0)
        const events = game.step(state, { dx, dy, action: input.current.action, hold: input.current.hold }, dt)
        input.current.action = false
        if (events.length) callbacks.current.onEvents(events)
        const next = game.view(state)
        if (!same(next, shown)) {
          shown = next
          setView(next)
          callbacks.current.onView(next)
        }
        if (!finished && (next.status === 'won' || next.status === 'lost')) {
          finished = true
          callbacks.current.onFinish(game.result(state))
        }
      }
      game.draw(g, state, now)
      raf.id = requestAnimationFrame(tick)
    })
    const raf = { id: frame }
    return () => cancelAnimationFrame(raf.id)
  }, [gameId, runKey, input])

  const width = FRAME.width * scale
  const height = FRAME.height * scale
  const bubble = view?.bubble

  return (
    <div ref={boxRef} className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div className="relative shrink-0" style={{ width, height }}>
        <canvas
          ref={canvasRef}
          width={FRAME.width}
          height={FRAME.height}
          role="img"
          aria-label={ui.canvas}
          className="block [image-rendering:pixelated]"
          style={{ width, height }}
        />
        {bubble && <StageBubble x={bubble.x * scale} y={bubble.y * scale} width={width} text={arcadeText(lang, bubble.key)} more={bubble.more} fontSize={Math.min(22, Math.max(13, scale * 4.2))} />}
      </div>
    </div>
  )
}
