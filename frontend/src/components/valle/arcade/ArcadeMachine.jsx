import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GAMES, MENU_THEME, gameById } from '../../../game/arcade/games'
import { loadScores, recordResult } from '../../../game/arcade/scores'
import { PAL } from '../../../game/palette'
import { arcadeGame, arcadeText, arcadeUi } from '../../../lib/arcadeCopy'
import { playArcadeSound } from '../../../lib/arcadeSound'
import { getEngine, startEngineIfAllowed } from '../../../lib/audioEngine'
import { useValleCopy } from '../../../lib/valleCopy'
import GameSelect from './GameSelect'
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

function Overlay({ children, label }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center overflow-y-auto p-3" style={{ background: 'rgba(15,14,34,0.78)' }}>
      <section role="dialog" aria-modal="true" aria-label={label} className="w-full max-w-sm p-4 text-center" style={{ background: PAL.ink2, color: PAL.bone, boxShadow: `0 0 0 3px ${PAL.stone}, 0 0 0 6px ${PAL.ink}` }}>
        {children}
      </section>
    </div>
  )
}

// La recreativa de la casa de Lupe: un selector con tres juegos y, al elegir uno, su pantalla con pausa, reinicio, salida al
// selector y controles visibles (teclado o cruceta táctil), más la pantalla de resultados con récord. Gestiona el teclado de
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

  return (
    <div ref={rootRef} role="dialog" aria-modal="true" aria-label={ui.title} className="absolute inset-0 z-30 flex flex-col" style={{ background: PAL.ink }}>
      <header className="flex flex-wrap items-center gap-2 px-3 pb-2 pt-3" style={{ color: PAL.bone }}>
        <h2 className="px-text min-w-0 flex-1 truncate text-lg font-semibold sm:text-xl" style={{ color: PAL.saffronLight }}>
          {title}
        </h2>
        {screen === 'play' && (
          <>
            <button type="button" className="px-btn px-btn--bone !min-h-11 !px-3 !text-sm" aria-label={ui.pause} data-sound="select" onClick={() => setPaused((p) => !p)} disabled={Boolean(outcome)}>
              <span aria-hidden="true">{paused ? '▶' : '❚❚'}</span>
              <span className="hidden sm:inline">{paused ? ui.resume : ui.pause}</span>
            </button>
            <button type="button" className="px-btn px-btn--bone !min-h-11 !px-3 !text-sm" aria-label={ui.restart} data-sound="select" onClick={restart}>
              <span aria-hidden="true">↻</span>
              <span className="hidden sm:inline">{ui.restart}</span>
            </button>
          </>
        )}
        <button type="button" data-sound="back" className="px-btn !min-h-11 !px-3 !text-sm" onClick={screen === 'play' ? backToSelector : onClose}>
          <span aria-hidden="true">✕</span>
          <span>{screen === 'play' ? ui.exitGame : ui.exitMachine}</span>
        </button>
      </header>

      {screen === 'select' && <GameSelect ui={ui} games={games} scores={scores} unlocked={unlocked} selected={selected} onSelect={setSelected} onPlay={startGame} />}

      {screen === 'play' && (
        <div className="relative flex min-h-0 flex-1 flex-col items-center gap-2 pb-2">
          <GameStage key={`${gameId}:${runKey}`} gameId={gameId} runKey={runKey} paused={paused || Boolean(outcome)} input={input} lang={lang} ui={ui} onView={setView} onEvents={playEvents} onFinish={finish} />

          <div className="flex min-h-[3.25rem] w-full max-w-xl flex-col items-center justify-center gap-1 px-3 text-center" style={{ color: PAL.bone }}>
            <p className="px-text text-base" aria-live="polite">
              {view?.status === 'dead' ? `${ui.dead} ${ui.deadKey}.` : view?.message ? arcadeText(lang, view.message) : ''}
            </p>
            {showHud && (
              <p className="px-text text-sm" style={{ color: PAL.saffronLight }}>
                {view.hud.map(({ key, value }) => `${ui.hud[key]} ${value}`).join(' · ')}
              </p>
            )}
          </div>

          {view?.status === 'dead' && touch && (
            <button type="button" className="px-btn" onClick={continueDead}>
              {ui.deadKey}
            </button>
          )}
          {touch ? <TouchPad labels={ui.pad} action={ui.actionLabel} horizontal={game.pad === 'horizontal'} onDirection={direction} onAction={action} /> : <p className="px-text px-3 text-center text-xs" style={{ color: PAL.bone, opacity: 0.75 }}>{games[gameId].controls}</p>}

          {paused && !outcome && (
            <div data-overlay className="contents">
              <Overlay label={ui.paused}>
                <h3 className="px-text mb-3 text-2xl font-semibold" style={{ color: PAL.saffronLight }}>{ui.paused}</h3>
                <p className="px-text mb-4 text-sm">{games[gameId].controls}</p>
                <div className="flex flex-col gap-3">
                  <button type="button" data-arcade data-sound="confirm" className="px-btn" onClick={resume}>{ui.resume}</button>
                  <button type="button" data-arcade data-sound="select" className="px-btn px-btn--bone" onClick={restart}>{ui.restart}</button>
                  <button type="button" data-arcade data-sound="back" className="px-btn px-btn--bone" onClick={backToSelector}>{ui.toSelector}</button>
                </div>
              </Overlay>
            </div>
          )}

          {outcome && (
            <div data-overlay className="contents">
              <Overlay label={outcome.won ? ui.won : ui.lost}>
                <h3 className="px-text text-2xl font-semibold" style={{ color: outcome.won ? PAL.saffronLight : PAL.rose }}>{outcome.won ? ui.won : ui.lost}</h3>
                <p className="px-text mb-3 text-sm" style={{ opacity: 0.8 }}>{games[gameId].title}</p>
                <p className="px-text text-3xl font-semibold" style={{ color: PAL.saffronLight }}>{outcome.score}</p>
                <p className="px-text mb-3 text-sm">{ui.score}{outcome.record && <strong style={{ color: PAL.meadow }}> · {ui.record}</strong>}</p>
                <dl className="mb-3 grid grid-cols-2 gap-x-3 gap-y-1 text-left text-sm">
                  {outcome.stats.map(({ key, value }) => (
                    <div key={key} className="contents">
                      <dt style={{ opacity: 0.8 }}>{ui.stats[key]}</dt>
                      <dd className="text-right font-semibold">{statValue(key, value)}</dd>
                    </div>
                  ))}
                </dl>
                {outcome.reward && <p className="px-text mb-2 text-sm" style={{ color: PAL.lagoonLight }}>{ui.reward}: {ui.rewards[outcome.reward]}</p>}
                {outcome.won && achievement && <p className="px-text mb-3 text-sm" style={{ color: PAL.meadow }}>★ {ui.achievement}: {achievement.name}</p>}
                <div className="flex flex-col gap-3">
                  <button type="button" data-arcade data-sound="confirm" className="px-btn" onClick={restart}>{ui.again}</button>
                  <button type="button" data-arcade data-sound="back" className="px-btn px-btn--bone" onClick={backToSelector}>{ui.toSelector}</button>
                </div>
              </Overlay>
            </div>
          )}
        </div>
      )}

      {screen === 'select' && !touch && (
        <p className="px-text px-3 pb-3 text-center text-xs" style={{ color: PAL.bone, opacity: 0.75 }}>
          {ui.hintMenu}
        </p>
      )}
    </div>
  )
}
