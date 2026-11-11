import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { advance, choose, openNode, view } from '../../game/dialogue/engine'
import { FEATURES, SCRIPTS } from '../../game/dialogue/scripts'
import { portraitUrl } from '../../game/interior/portraits'
import { PAL } from '../../game/palette'
import { useTypewriter } from '../../hooks/useTypewriter'
import { getEngine, startEngineIfAllowed } from '../../lib/audioEngine'
import { DIALOGUE_COPY, lineText, optionText } from '../../lib/dialogueCopy'
import { isSpoken, playBlip } from '../../lib/dialogueSound'
import { playPetSound } from '../../lib/petSounds'
import { prefersReducedMotion } from '../../lib/reducedMotion'
import { tone } from '../../lib/tone'
import { useValleCopy } from '../../lib/valleCopy'

// Velocidad de escritura (caracteres por segundo) y cada cuántas letras que suenan va un pitido.
const TYPE_CPS = 42
const BLIP_EVERY = 2
const MAX_BLIPS_PER_FRAME = 8

const engine = () => getEngine() ?? startEngineIfAllowed()

// Caja de conversación al estilo de los juegos de granja: nombre de quien habla en una pestaña, texto que se escribe con
// su pitido, retrato a la derecha y, al final, las opciones. Sirve a cualquier personaje u objeto: solo necesita un id de
// guion (`game/dialogue/scripts.js`). Con la caja abierta, E o Enter avanzan (o completan el texto si aún se escribe),
// Esc cierra, ↑ y ↓ eligen opción y tocar la caja avanza. `onClose` recibe la acción con la que acabó el guion, si la hay.
// `features` activa las opciones con `when` que dependen de la historia, y `onReach(id, última)` avisa de cada nodo que se abre y
// de cuándo se llega a su última página (la historia recuerda así lo escuchado).
export default function DialogueBox({ scriptId, features: extra, onReach, onClose }) {
  const { lang } = useValleCopy()
  const copy = DIALOGUE_COPY[lang] ?? DIALOGUE_COPY.es
  const [state, setState] = useState(() => openNode(scriptId))
  const [selected, setSelected] = useState(0)
  const optionRefs = useRef([])

  const features = useMemo(() => ({ ...FEATURES, ...extra }), [extra])
  const { page, last, options } = view(SCRIPTS, state, features)
  const touch = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
  const text = lineText(lang, page.text, touch)
  // Con movimiento reducido el texto aparece entero y sin pitidos.
  const cps = prefersReducedMotion() ? 0 : TYPE_CPS
  const { shown, done, finish } = useTypewriter(text, cps)

  // Un pitido por cada dos letras que suenan, por las letras recién escritas.
  const lastShown = useRef({ text: '', count: 0 })
  useEffect(() => {
    const previous = lastShown.current.text === text ? lastShown.current.count : 0
    lastShown.current = { text, count: shown }
    // La página que lleva su propio maullido no suena a pitidos de 8 bits mientras se escribe.
    if (!cps || page.sfx === 'meow') return
    // Al tocar la caja el texto se completa de golpe: sonar todas las letras a la vez apila decenas de tonos en el mismo
    // instante y satura (el ruido "roto"). Un avance normal son una o dos letras por fotograma; más que eso, no suena.
    if (shown - previous > MAX_BLIPS_PER_FRAME) return
    for (let i = previous; i < shown; i++) {
      if (isSpoken(text[i]) && i % BLIP_EVERY === 0) playBlip(engine(), page.who, text[i])
    }
  }, [shown, text, page.who, page.sfx, cps])

  useEffect(() => {
    onReach?.(state.id, last)
  }, [state.id, last, onReach])

  // Algunas páginas llevan un efecto de sonido propio (el maullido de Khalessi) que suena al abrirse. Es la grabación del
  // gato de verdad, la misma de la portada, no el maullido sintetizado.
  useEffect(() => {
    if (page.sfx !== 'meow') return
    engine()
    playPetSound('gato', 'comun')
  }, [page.sfx, state])

  // Cada página nueva empieza con la primera opción marcada.
  useEffect(() => setSelected(0), [state])
  useEffect(() => {
    if (done && options.length) optionRefs.current[selected]?.focus()
  }, [done, options.length, selected])

  const next = useCallback(() => {
    if (!done) return finish()
    if (options.length) {
      const result = choose(SCRIPTS, state, options[selected].id, features)
      return result.done ? onClose(result.action) : setState(result.state)
    }
    const result = advance(SCRIPTS, state, features)
    return result.done ? onClose(result.action) : setState(result.state)
  }, [done, finish, options, selected, state, features, onClose])

  const pick = useCallback((id) => {
    const result = choose(SCRIPTS, state, id, features)
    if (result.done) onClose(result.action)
    else setState(result.state)
  }, [state, features, onClose])

  useEffect(() => {
    const onKey = (event) => {
      const key = event.key
      if (key === 'Escape') {
        event.preventDefault()
        onClose()
      } else if (key === 'e' || key === 'E' || key === 'Enter') {
        // Se atiende aquí y se evita la pulsación nativa: con una opción enfocada, Enter la activaría dos veces.
        event.preventDefault()
        if (!event.repeat) next()
      } else if ((key === 'ArrowDown' || key === 'ArrowUp') && done && options.length) {
        event.preventDefault()
        setSelected((current) => (current + (key === 'ArrowDown' ? 1 : -1) + options.length) % options.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, onClose, done, options.length])

  const speaker = copy.speakers[page.who] ?? page.who
  const portrait = portraitUrl(page.who)

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-4 sm:pb-6" role="presentation">
      <section
        role="dialog"
        aria-label={`${copy.ui.label}: ${speaker}`}
        className="px-frame pointer-events-auto relative w-full max-w-3xl"
        style={{ background: tone('ivory', PAL.bone), color: PAL.ink, ['--px-ring']: tone('lavender-deep', PAL.saffron), ['--px-ink']: tone('ink', PAL.ink) }}
        onClick={(event) => {
          if (!event.target.closest('button')) next()
        }}
      >
        <p
          className="px-text absolute -top-5 left-4 px-3 py-0.5 text-base font-semibold"
          style={{ background: PAL.saffron, color: PAL.ink, boxShadow: `0 0 0 3px ${PAL.ink}` }}
        >
          {speaker}
        </p>
        <div className="flex items-stretch gap-4 p-4 pt-5 sm:p-5 sm:pt-6">
          <div className="min-w-0 flex-1">
            {/* El texto completo va para lectores de pantalla; lo que se escribe poco a poco no se anuncia. */}
            <p className="sr-only" aria-live="polite">{text}</p>
            <p className="px-text min-h-[4.5rem] text-lg leading-snug sm:min-h-[5.25rem] sm:text-xl" aria-hidden="true">
              {text.slice(0, shown)}
              <span className="opacity-0">{text.slice(shown)}</span>
            </p>
            {done && options.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2" role="group" aria-label={copy.ui.label}>
                {options.map((option, index) => (
                  <li key={option.id}>
                    <button
                      ref={(node) => {
                        optionRefs.current[index] = node
                      }}
                      type="button"
                      data-sound="pick"
                      className="px-btn px-btn--bone !min-h-[2.25rem] !w-full !justify-start !px-3 !py-1 !text-base"
                      aria-current={index === selected ? 'true' : undefined}
                      style={index === selected ? { background: PAL.saffronLight } : undefined}
                      onMouseEnter={() => setSelected(index)}
                      onClick={() => pick(option.id)}
                    >
                      <span aria-hidden="true">{index === selected ? '▶' : ' '}</span>
                      {optionText(lang, option.label)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="px-text mt-2 flex items-center justify-between gap-3 text-xs opacity-70" aria-hidden="true">
              <span>{touch ? copy.ui.touchHint : copy.ui.hint}</span>
              {done && !options.length && <span className="px-dialogue-caret">▼</span>}
            </p>
          </div>
          {portrait && (
            <div className="hidden shrink-0 items-end sm:flex" aria-hidden="false">
              <img
                src={portrait}
                alt={`${copy.ui.portrait} ${speaker}`}
                className="h-24 w-auto border-4 [image-rendering:pixelated]"
                style={{ borderColor: PAL.ink, background: tone('powder', PAL.rose) }}
              />
            </div>
          )}
        </div>
        <button
          type="button"
          data-sound="back"
          className="px-btn px-btn--bone absolute -top-5 right-4 !min-h-[2rem] !px-3 !py-0 !text-sm"
          onClick={() => onClose()}
        >
          {copy.ui.close}
        </button>
      </section>
    </div>
  )
}
