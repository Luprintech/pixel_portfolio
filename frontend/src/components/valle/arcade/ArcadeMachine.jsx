import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GAMES, MENU_THEME, gameById } from '../../../game/arcade/games'
import { FRAME } from '../../../game/arcade/shared'
import { loadScores, recordResult } from '../../../game/arcade/scores'
import { PAL } from '../../../game/palette'
import { arcadeGame, arcadeText, arcadeUi } from '../../../lib/arcadeCopy'
import { playArcadeSound } from '../../../lib/arcadeSound'
import { getEngine, startEngineIfAllowed } from '../../../lib/audioEngine'
import { useValleCopy } from '../../../lib/valleCopy'
import GameSelect from './GameSelect'
import { CoinSlot, Joystick, Led, PushButton } from './CabinetDecor'
import GameStage from './GameStage'
import TouchPad from './TouchPad'

const DIRECTIONS = {
  ArrowUp: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', s: 'down', S: 'down',
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
}
const ACTION_KEYS = new Set(['e', 'E', ' ', 'Enter'])
const isTouch = () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

// Texto de una estadística de la pantalla de resultados.
const statValue = (key, value) => (key === 'time' ? clock(value) : value)

// Panel dentro del monitor (pausa y resultados): cubre solo la pantalla de la máquina y, si no cupiera, se desplaza por dentro.
function Overlay({ children, label }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center overflow-y-auto p-[2cqw]" style={{ background: 'rgba(15,14,34,0.82)', fontSize: 'max(12px, 2.4cqw)' }}>
      <section role="dialog" aria-modal="true" aria-label={label} className="w-full max-w-[26em] p-[2.4cqw] text-center" style={{ background: PAL.ink2, color: PAL.bone, boxShadow: `0 0 0 3px ${PAL.stone}, 0 0 0 6px ${PAL.ink}` }}>
        {children}
      </section>
    </div>
  )
}

// La recreativa de la casa de Lupe: una ventana centrada con el frontal de una máquina de los 80 (marquesina, monitor y panel de
// mandos) sobre el valle oscurecido. Dentro del monitor van el menú de tres juegos y, al elegir uno, el juego mismo, con pausa,
// reinicio, salida al menú y controles (teclado o cruceta táctil), más la pantalla de resultados con récord. Gestiona el teclado de
// todo el panel (captura las teclas antes de que lleguen al valle, que está parado detrás) y avisa de lo que pasa fuera: la
// canción que toca (`onTheme`), el logro de un juego completado (`onComplete`) y la salida (`onClose`). Los juegos están en
// `game/arcade/` y esta pieza no sabe cómo son por dentro.
export default function ArcadeMachine({ unlocked, onClose, onComplete, onTheme }) {
  const { lang, copy } = useValleCopy()
  const ui = arcadeUi(lang)
  const rootRef = useRef(null)
  const input = useRef({ held: new Set(), action: false, hold: false })
  const touch = isTouch()

  const [screen, setScreen] = useState('select')
  const [selected, setSelected] = useState(0)
  const [gameId, setGameId] = useState(null)
  const [runKey, setRunKey] = useState(0)
  const [paused, setPaused] = useState(false)
  const [view, setView] = useState(null)
  const [outcome, setOutcome] = useState(null)
  const [scores, setScores] = useState(loadScores)
  const scoresRef = useRef(scores)

  const game = gameId ? gameById(gameId) : null
  const games = useMemo(() => Object.fromEntries(GAMES.map(({ id }) => [id, arcadeGame(lang, id)])), [lang])

  // La música sigue a lo que se está haciendo: el selector tiene la suya y cada juego, la suya.
  useEffect(() => {
    onTheme(screen === 'play' && game ? game.theme : MENU_THEME)
  }, [screen, game, onTheme])

  const releaseKeys = useCallback(() => {
    input.current.held.clear()
    input.current.action = false
    input.current.hold = false
  }, [])

  const startGame = useCallback((id) => {
    releaseKeys()
    setGameId(id)
    setRunKey((key) => key + 1)
    setPaused(false)
    setOutcome(null)
    setView(null)
    setScreen('play')
  }, [releaseKeys])

  const backToSelector = useCallback(() => {
    releaseKeys()
    setPaused(false)
    setOutcome(null)
    setScreen('select')
  }, [releaseKeys])

  const restart = useCallback(() => {
    releaseKeys()
    setRunKey((key) => key + 1)
    setPaused(false)
    setOutcome(null)
    setView(null)
  }, [releaseKeys])

  // Fin de partida: se anota el resultado (récord y juego completado) y, si se ganó, se da el logro del juego.
  const finish = useCallback((result) => {
    releaseKeys()
    const { next, record } = recordResult(scoresRef.current, gameId, result)
    scoresRef.current = next
    setScores(next)
    setOutcome({ ...result, record })
    if (result.won) onComplete(gameId)
  }, [gameId, onComplete, releaseKeys])

  const playEvents = useCallback((events) => {
    const engine = getEngine() ?? startEngineIfAllowed()
    events.forEach(({ type }) => playArcadeSound(engine, type))
  }, [])

  // Estado del teclado en una referencia: el manejador es siempre el mismo y no se vuelve a registrar en cada cambio.
  const mode = outcome ? 'over' : screen === 'select' ? 'select' : paused ? 'paused' : 'play'
  const live = useRef({})
  useEffect(() => {
    live.current = { mode, selected, onClose, startGame, backToSelector }
  })

  // Con el teclado manda esta pantalla: las teclas del juego no llegan al valle (se corta antes de que las vea) y fuera del juego
  // E, Espacio o Enter pulsan el botón con el foco.
  useEffect(() => {
    const focusables = () => [...(rootRef.current?.querySelectorAll('[data-arcade]') ?? [])]
    const down = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const dir = DIRECTIONS[event.key]
      const act = ACTION_KEYS.has(event.key)
      const esc = event.key === 'Escape'
      if (!dir && !act && !esc) return
      event.preventDefault()
      event.stopPropagation()
      const { mode: now, selected: current } = live.current
      if (esc) {
        if (event.repeat) return
        if (now === 'select') live.current.onClose()
        else if (now === 'play') setPaused(true)
        else if (now === 'paused') setPaused(false)
        else live.current.backToSelector()
      } else if (now === 'play') {
        if (dir) input.current.held.add(dir)
        else {
          if (!event.repeat) input.current.action = true
          input.current.hold = true
        }
      } else if (now === 'select' && dir) {
        const step = dir === 'left' || dir === 'up' ? -1 : 1
        setSelected(Math.min(GAMES.length - 1, Math.max(0, current + step)))
      } else if (act && !event.repeat) {
        const target = focusables().find((node) => node === document.activeElement) ?? focusables()[0]
        target?.click()
      } else if (dir && (now === 'paused' || now === 'over')) {
        const items = focusables()
        const at = items.indexOf(document.activeElement)
        const step = dir === 'left' || dir === 'up' ? -1 : 1
        items[(at + step + items.length) % items.length]?.focus()
      }
    }
    const up = (event) => {
      const dir = DIRECTIONS[event.key]
      if (dir) input.current.held.delete(dir)
      else if (ACTION_KEYS.has(event.key)) input.current.hold = false
    }
    // Con la pestaña oculta o la ventana sin foco se pausa y se sueltan las teclas, para que nada quede pulsado.
    const away = () => {
      releaseKeys()
      if (live.current.mode === 'play') setPaused(true)
    }
    const hidden = () => document.hidden && away()
    window.addEventListener('keydown', down, true)
    window.addEventListener('keyup', up, true)
    window.addEventListener('blur', away)
    document.addEventListener('visibilitychange', hidden)
    return () => {
      window.removeEventListener('keydown', down, true)
      window.removeEventListener('keyup', up, true)
      window.removeEventListener('blur', away)
      document.removeEventListener('visibilitychange', hidden)
    }
  }, [releaseKeys])

  // Al abrir un panel (pausa o resultados) el foco va a su primer botón, y al volver al juego se suelta.
  useEffect(() => {
    if (mode === 'paused' || mode === 'over') rootRef.current?.querySelector('[data-overlay] [data-arcade]')?.focus()
    else if (mode === 'play') document.activeElement?.blur?.()
  }, [mode])

  const direction = useCallback((dir, on) => (on ? input.current.held.add(dir) : input.current.held.delete(dir)), [])
  const action = useCallback((on) => {
    if (on) input.current.action = true
    input.current.hold = on
  }, [])
  const resume = useCallback(() => setPaused(false), [])
  const continueDead = useCallback(() => {
    input.current.action = true
  }, [])

  const title = screen === 'play' && game ? games[gameId].title : ui.title
  const achievement = game ? copy.achievements.items[game.achievement] : null
  const showHud = view?.hud?.length > 0
  // Alto que ocupan marquesina, marco y panel: el monitor nunca es más alto que lo que queda de pantalla, y así la máquina entera
  // cabe sin desplazar la página.
  const chrome = touch ? '23rem' : '16rem'

  // Pausa, reinicio y salida al menú. En pantalla táctil van dentro de la franja de estado (menos mandos sueltos); en escritorio, en el
  // panel de mandos junto al joystick de adorno.
  const compact = touch ? '!min-h-8 !px-2 !text-xs' : '!min-h-10 !px-3 !text-sm'
  const controls = (
    <div className={`flex min-w-0 items-center justify-center gap-2 ${touch ? 'w-full' : 'flex-1 flex-wrap'}`}>
      <button type="button" className={`px-btn px-btn--bone ${compact}`} aria-label={ui.pause} data-sound="select" onClick={() => setPaused((p) => !p)} disabled={Boolean(outcome)}>
        <span aria-hidden="true">{paused ? '▶' : '❚❚'}</span>
        <span>{paused ? ui.resume : ui.pause}</span>
      </button>
      <button type="button" className={`px-btn px-btn--bone ${compact}`} aria-label={ui.restart} data-sound="select" onClick={restart}>
        <span aria-hidden="true">↻</span>
        <span>{ui.restart}</span>
      </button>
      <button type="button" data-sound="back" className={`px-btn px-btn--bone ${compact}`} onClick={backToSelector}>
        <span aria-hidden="true">◀</span>
        <span>{ui.exitGame}</span>
      </button>
    </div>
  )

  return (
    <div ref={rootRef} className="absolute inset-0 z-30 grid place-items-center p-2" style={{ background: 'rgba(15,14,34,0.62)' }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ui.title}
        className="flex max-h-full min-h-0 flex-col gap-2 overflow-y-auto p-3"
        style={{ width: `min(100%, 64rem, calc((100dvh - ${chrome}) * 1.25 + 1.5rem))`, minWidth: 'min(100%, 18rem)', background: PAL.ink2, boxShadow: `0 0 0 3px ${PAL.stone}, 0 0 0 7px ${PAL.ink}, 8px 8px 0 7px ${PAL.ink}` }}
      >
        <header className="flex items-center gap-2" style={{ color: PAL.bone }}>
          <Led color={PAL.tile} />
          <Led color={PAL.saffron} delay={400} />
          <h2 className="px-text min-w-0 flex-1 truncate px-2 py-1 text-center text-sm font-semibold uppercase tracking-wider sm:text-base" style={{ background: PAL.ink, color: PAL.saffronLight, boxShadow: `inset 0 0 0 2px ${PAL.stone}` }}>
            {title}
          </h2>
          <Led color={PAL.lagoonLight} delay={800} />
          <button type="button" data-sound="back" aria-label={ui.exitMachine} className="px-btn !min-h-10 !px-3 !text-sm" onClick={onClose}>
            <span aria-hidden="true">✕</span>
            <span className="hidden sm:inline">{ui.exitMachine}</span>
          </button>
        </header>

        <div className="p-2" style={{ background: PAL.ink, boxShadow: `inset 0 0 0 2px ${PAL.stone}` }}>
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${FRAME.width} / ${FRAME.height}`, background: '#000', containerType: 'inline-size', boxShadow: `0 0 0 3px ${PAL.stone}` }}>
            {screen === 'select' && <GameSelect ui={ui} games={games} scores={scores} unlocked={unlocked} selected={selected} onSelect={setSelected} onPlay={startGame} />}
            {screen === 'play' && (
              <>
                <GameStage key={`${gameId}:${runKey}`} gameId={gameId} runKey={runKey} paused={paused || Boolean(outcome)} input={input} lang={lang} ui={ui} onView={setView} onEvents={playEvents} onFinish={finish} />
                {paused && !outcome && (
                  <div data-overlay className="contents">
                    <Overlay label={ui.paused}>
                      <h3 className="px-text mb-[1.5cqw] text-[1.6em] font-semibold" style={{ color: PAL.saffronLight }}>{ui.paused}</h3>
                      <p className="px-text mb-[2cqw]">{games[gameId].controls}</p>
                      <div className="flex flex-col gap-2">
                        <button type="button" data-arcade data-sound="confirm" className="px-btn !min-h-10" onClick={resume}>{ui.resume}</button>
                        <button type="button" data-arcade data-sound="select" className="px-btn px-btn--bone !min-h-10" onClick={restart}>{ui.restart}</button>
                        <button type="button" data-arcade data-sound="back" className="px-btn px-btn--bone !min-h-10" onClick={backToSelector}>{ui.toSelector}</button>
                      </div>
                    </Overlay>
                  </div>
                )}
                {outcome && (
                  <div data-overlay className="contents">
                    <Overlay label={outcome.won ? ui.won : ui.lost}>
                      <h3 className="px-text text-[1.6em] font-semibold" style={{ color: outcome.won ? PAL.saffronLight : PAL.rose }}>{outcome.won ? ui.won : ui.lost}</h3>
                      <p className="px-text mb-1" style={{ opacity: 0.8 }}>{games[gameId].title}</p>
                      <p className="px-text text-[2em] font-semibold leading-none" style={{ color: PAL.saffronLight }}>{outcome.score}</p>
                      <p className="px-text mb-2">{ui.score}{outcome.record && <strong style={{ color: PAL.meadow }}> · {ui.record}</strong>}</p>
                      <dl className="mb-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-left">
                        {outcome.stats.map(({ key, value }) => (
                          <div key={key} className="contents">
                            <dt style={{ opacity: 0.8 }}>{ui.stats[key]}</dt>
                            <dd className="text-right font-semibold">{statValue(key, value)}</dd>
                          </div>
                        ))}
                      </dl>
                      {outcome.reward && <p className="px-text mb-1" style={{ color: PAL.lagoonLight }}>{ui.reward}: {ui.rewards[outcome.reward]}</p>}
                      {outcome.won && achievement && <p className="px-text mb-2" style={{ color: PAL.meadow }}>★ {ui.achievement}: {achievement.name}</p>}
                      <div className="flex flex-col gap-2">
                        <button type="button" data-arcade data-sound="confirm" className="px-btn !min-h-10" onClick={restart}>{ui.again}</button>
                        <button type="button" data-arcade data-sound="back" className="px-btn px-btn--bone !min-h-10" onClick={backToSelector}>{ui.toSelector}</button>
                      </div>
                    </Overlay>
                  </div>
                )}
              </>
            )}
            <div aria-hidden="true" className="arcade-crt absolute inset-0 z-30" />
          </div>
        </div>

        {/* Franja de estado de alto fijo: los avisos y el marcador cambian de texto sin mover ni encoger el monitor. En táctil lleva además
            los botones de pausa, reinicio y salida, con el aviso encima. */}
        <div className={`px-text flex ${touch && screen === 'play' ? 'h-[4.5rem] gap-1' : 'h-12'} flex-col items-center justify-center overflow-hidden px-2 text-center text-sm leading-tight`} style={{ background: PAL.ink, color: PAL.bone, boxShadow: `inset 0 0 0 2px ${PAL.stone}` }}>
          {screen === 'play' ? (
            <>
              <p aria-live="polite" className="line-clamp-1 w-full">
                {view?.status === 'dead' ? `${ui.dead} ${ui.deadKey}.` : view?.message ? arcadeText(lang, view.message) : ''}
              </p>
              {showHud && <p className="w-full truncate text-xs" style={{ color: PAL.saffronLight }}>{view.hud.map(({ key, value }) => `${ui.hud[key]} ${value}`).join(' · ')}</p>}
              {touch && controls}
            </>
          ) : (
            !touch && <p className="text-xs" style={{ opacity: 0.8 }}>{ui.hintMenu}</p>
          )}
        </div>

        {/* Panel de mandos: los botones de pausa, reinicio y menú son reales; el joystick y los pulsadores grandes, adorno. */}
        <div className={`${touch && screen === 'play' ? 'hidden' : 'flex'} items-center justify-between gap-2`} style={{ color: PAL.bone }}>
          {screen === 'play' ? (
            <>
              {!touch && <Joystick />}
              {!touch && controls}
              {!touch && (
                <div className="flex gap-1">
                  <PushButton color={PAL.tile} shade={PAL.tileDark} />
                  <PushButton color={PAL.saffron} shade={PAL.tileDark} />
                </div>
              )}
            </>
          ) : (
            <div className="flex w-full items-center justify-between gap-2">
              <Joystick />
              <CoinSlot />
              <div className="flex gap-1">
                <PushButton color={PAL.tile} shade={PAL.tileDark} />
                <PushButton color={PAL.saffron} shade={PAL.tileDark} />
                <PushButton color={PAL.lagoonLight} shade={PAL.lagoon} />
              </div>
            </div>
          )}
        </div>

        {screen === 'play' && touch && (
          <>
            {view?.status === 'dead' && (
              <button type="button" className="px-btn mx-auto !min-h-10" onClick={continueDead}>
                {ui.deadKey}
              </button>
            )}
            <TouchPad labels={ui.pad} action={ui.actionLabel} horizontal={game.pad === 'horizontal'} onDirection={direction} onAction={action} />
          </>
        )}
        {screen === 'play' && !touch && <p className="px-text text-center text-xs" style={{ color: PAL.bone, opacity: 0.75 }}>{games[gameId].controls}</p>}
      </div>
    </div>
  )
}
