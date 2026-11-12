import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GAMES, MENU_THEME, gameById } from '../../../game/arcade/games'
import { FRAME } from '../../../game/arcade/shared'
import { loadScores, recordResult } from '../../../game/arcade/scores'
import { rewardCoins, rewardFor } from '../../../game/arcade/rewards'
import { grantReward, insertCoin, loadWallet, saveWallet, spendCredit } from '../../../game/arcade/wallet'
import { PAL } from '../../../game/palette'
import { arcadeControls, arcadeGame, arcadeText, arcadeUi } from '../../../lib/arcadeCopy'
import { playArcadeSound } from '../../../lib/arcadeSound'
import { getEngine, startEngineIfAllowed } from '../../../lib/audioEngine'
import { useValleCopy } from '../../../lib/valleCopy'
import GameSelect from './GameSelect'
import { CoinButton, ControlPanel, Joystick, Led, PushButton } from './CabinetDecor'
import GameStage from './GameStage'
import { ActionPad, MoveZone } from './TouchPad'
import { useLandscape } from './useLandscape'

const DIRECTIONS = {
  ArrowUp: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', s: 'down', S: 'down',
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
}
// Espacio es la acción (espada, disparo, hablar); E e Intro siguen valiendo para quien ya los usaba. Shift mantenido es el escudo.
const ACTION_KEYS = new Set(['e', 'E', ' ', 'Enter'])
const GUARD_KEY = 'Shift'
const NOTICE_MS = 2600
const isTouch = () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

// Texto de una estadística de la pantalla de resultados.
const statValue = (key, value) => (key === 'time' ? clock(value) : value)

// Panel dentro del monitor (pausa y resultados): cubre solo la pantalla de la máquina y, si no cupiera, se desplaza por dentro.
function Overlay({ children, label }) {
  return (
    <div data-scroll className="absolute inset-0 z-20 grid touch-pan-y place-items-center overflow-y-auto overscroll-contain p-[2cqw]" style={{ background: 'rgba(15,14,34,0.82)', fontSize: 'max(12px, 2.4cqw)' }}>
      <section role="dialog" aria-modal="true" aria-label={label} className="w-full max-w-[26em] p-[2.4cqw] text-center" style={{ background: PAL.ink2, color: PAL.bone, boxShadow: `0 0 0 3px ${PAL.stone}, 0 0 0 6px ${PAL.ink}` }}>
        {children}
      </section>
    </div>
  )
}

// La recreativa de la casa de Lupe: una ventana centrada con el frontal de una máquina de los 80 (marquesina, monitor y panel de
// mandos) sobre el valle oscurecido. Dentro del monitor van el menú de tres juegos y, al elegir uno, el juego mismo, con pausa,
// reinicio, salida al menú y controles (teclado o mandos táctiles), más la pantalla de resultados con récord. Gestiona el teclado de
// todo el panel (captura las teclas antes de que lleguen al valle, que está parado detrás) y avisa de lo que pasa fuera: la
// canción que toca (`onTheme`), el logro de un juego completado (`onComplete`) y la salida (`onClose`). Los juegos están en
// `game/arcade/` y esta pieza no sabe cómo son por dentro.
export default function ArcadeMachine({ unlocked, onClose, onComplete, onTheme }) {
  const { lang, copy } = useValleCopy()
  const ui = arcadeUi(lang)
  const rootRef = useRef(null)
  const input = useRef({ held: new Set(), action: false, hold: false, guard: false })
  const touch = isTouch()
  const landscape = useLandscape()

  const [screen, setScreen] = useState('select')
  const [selected, setSelected] = useState(0)
  const [gameId, setGameId] = useState(null)
  const [runKey, setRunKey] = useState(0)
  const [paused, setPaused] = useState(false)
  const [view, setView] = useState(null)
  const [outcome, setOutcome] = useState(null)
  const [scores, setScores] = useState(loadScores)
  const scoresRef = useRef(scores)
  // Monedas: saldo, créditos cargados y recompensas ya entregadas. Se guardan al cambiar (ver `game/arcade/wallet.js`).
  const [wallet, setWallet] = useState(loadWallet)
  const walletRef = useRef(wallet)
  // Avisos breves: `notice` en el selector (moneda insertada, sin saldo) y `toast` sobre el monitor al ganar una moneda.
  const [notice, setNotice] = useState(null)
  const [toast, setToast] = useState(null)
  const timers = useRef({})

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
    input.current.guard = false
  }, [])

  useEffect(() => {
    const pending = timers.current
    return () => Object.values(pending).forEach(clearTimeout)
  }, [])

  const commitWallet = useCallback((next) => {
    walletRef.current = next
    setWallet(next)
    saveWallet(next)
  }, [])

  const flash = useCallback((slot, setter, value) => {
    clearTimeout(timers.current[slot])
    setter(value)
    timers.current[slot] = setTimeout(() => setter(null), NOTICE_MS)
  }, [])

  // Insertar moneda: -1 moneda del saldo, +1 crédito en la máquina. Suena la moneda; si no se puede, un zumbido y el motivo.
  const insertCoinNow = useCallback(() => {
    const engine = getEngine() ?? startEngineIfAllowed()
    const { wallet: next, ok, reason } = insertCoin(walletRef.current)
    if (ok) {
      commitWallet(next)
      playArcadeSound(engine, 'coin')
      flash('notice', setNotice, { text: ui.coinInserted, ok: true })
    } else {
      playArcadeSound(engine, 'noCoin')
      flash('notice', setNotice, { text: reason === 'full' ? ui.creditsFull : ui.noCoins })
    }
  }, [commitWallet, flash, ui])

  // Cada partida cuesta un crédito. Sin él no se empieza (ni se reinicia): se avisa y la interfaz sigue usable.
  const payCredit = useCallback(() => {
    const { wallet: next, ok } = spendCredit(walletRef.current)
    if (ok) commitWallet(next)
    else {
      playArcadeSound(getEngine() ?? startEngineIfAllowed(), 'noCoin')
      flash('notice', setNotice, { text: ui.noCredit })
    }
    return ok
  }, [commitWallet, flash, ui])

  const startGame = useCallback((id) => {
    if (!payCredit()) return
    releaseKeys()
    setGameId(id)
    setRunKey((key) => key + 1)
    setPaused(false)
    setOutcome(null)
    setView(null)
    setScreen('play')
  }, [payCredit, releaseKeys])

  const backToSelector = useCallback(() => {
    releaseKeys()
    setPaused(false)
    setOutcome(null)
    setScreen('select')
  }, [releaseKeys])

  const restart = useCallback(() => {
    if (!payCredit()) return
    releaseKeys()
    setRunKey((key) => key + 1)
    setPaused(false)
    setOutcome(null)
    setView(null)
  }, [payCredit, releaseKeys])

  // Fin de partida: se anota el resultado (récord y juego completado) y, si se ganó, se da el logro del juego.
  const finish = useCallback((result) => {
    releaseKeys()
    const { next, record } = recordResult(scoresRef.current, gameId, result)
    scoresRef.current = next
    setScores(next)
    setOutcome({ ...result, record })
    if (result.won) onComplete(gameId)
  }, [gameId, onComplete, releaseKeys])

  // Sonido de cada suceso y recompensas por hitos: la moneda de un hito se da una sola vez por partida guardada.
  const gameRef = useRef(gameId)
  useEffect(() => {
    gameRef.current = gameId
  })
  const playEvents = useCallback((events) => {
    const engine = getEngine() ?? startEngineIfAllowed()
    events.forEach((event) => {
      playArcadeSound(engine, event.type)
      const id = rewardFor(gameRef.current, event)
      if (!id) return
      const { wallet: next, gained } = grantReward(walletRef.current, id, rewardCoins(id))
      if (gained < 1) return
      commitWallet(next)
      playArcadeSound(engine, 'coin')
      flash('toast', setToast, { text: `+${gained} ${ui.coinWon}` })
    })
  }, [commitWallet, flash, ui])

  // Estado del teclado en una referencia: el manejador es siempre el mismo y no se vuelve a registrar en cada cambio.
  const mode = outcome ? 'over' : paused ? 'paused' : screen === 'select' ? 'select' : 'play'
  const live = useRef({})
  useEffect(() => {
    live.current = { mode, selected, onClose, startGame, backToSelector }
  })

  // Con el teclado manda esta pantalla: las teclas del juego no llegan al valle (se corta antes de que las vea) y fuera del juego
  // E, Espacio o Enter pulsan el botón con el foco.
  useEffect(() => {
    const focusables = () => [...(rootRef.current?.querySelectorAll('[data-arcade]:not(:disabled)') ?? [])]
    const down = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const dir = DIRECTIONS[event.key]
      const act = ACTION_KEYS.has(event.key)
      const esc = event.key === 'Escape'
      const guard = event.key === GUARD_KEY
      if (!dir && !act && !esc && !guard) return
      event.preventDefault()
      event.stopPropagation()
      const { mode: now, selected: current } = live.current
      if (guard) {
        if (now === 'play') input.current.guard = true
      } else if (esc) {
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
      else if (event.key === GUARD_KEY) input.current.guard = false
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

  // En táctil la partida no se puede desplazar ni arrastrar: se bloquea el rebote de la página y se corta el arrastre del dedo en
  // toda la máquina (salvo en los paneles con desplazamiento propio, marcados con `data-scroll`). Sin esto, empujar el joystick hacia
  // arriba puede recargar la página o encoger la ventana del navegador. Un gesto que arranca en el borde del sistema (la barra de
  // inicio) no lo controla la web, por eso los mandos quedan separados de los bordes.
  useEffect(() => {
    if (!touch) return undefined
    const root = rootRef.current
    const { documentElement: html, body } = document
    const before = [html.style.overscrollBehavior, body.style.overscrollBehavior]
    html.style.overscrollBehavior = 'none'
    body.style.overscrollBehavior = 'none'
    const stop = (event) => {
      if (event.cancelable && !event.target.closest?.('[data-scroll]')) event.preventDefault()
    }
    root.addEventListener('touchmove', stop, { passive: false })
    return () => {
      root.removeEventListener('touchmove', stop)
      html.style.overscrollBehavior = before[0]
      body.style.overscrollBehavior = before[1]
    }
  }, [touch])

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
  const guard = useCallback((on) => {
    input.current.guard = on
  }, [])
  const resume = useCallback(() => setPaused(false), [])

  const playing = screen === 'play' && game
  const title = playing ? games[gameId].title : ui.title
  const achievement = game ? copy.achievements.items[game.achievement] : null
  const showHud = view?.hud?.length > 0
  // En táctil horizontal los mandos van a los lados del monitor; en vertical, debajo.
  const sideZones = touch && landscape && playing
  const big = touch ? '!min-h-12' : '!min-h-10'
  const safe = (side) => `max(0.25rem, env(safe-area-inset-${side}, 0px))`
  // Alto que ocupan cabecera, franja de estado y marcos: el monitor nunca es más alto que lo que queda de pantalla, y así la máquina
  // entera cabe sin desplazar la página. En táctil vertical el monitor ocupa todo el ancho y los mandos se reparten el resto.
  const chrome = touch ? '6rem' : '16rem'
  const insets = 'env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)'
  const monitorWidth = touch ? `min(100%, calc((100dvh - ${insets} - ${chrome}) * 1.25))` : `min(100%, 64rem, calc((100dvh - ${chrome}) * 1.25 + 1.5rem))`

  // Pausa, reinicio y salida al menú en el panel de mandos del escritorio, junto al joystick de adorno. En táctil están en el
  // botón de opciones de la marquesina.
  const controls = (
    <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-2">
      <button type="button" className="px-btn px-btn--bone !min-h-10 !px-3 !text-sm" aria-label={ui.pause} data-sound="select" onClick={() => setPaused((p) => !p)} disabled={Boolean(outcome)}>
        <span aria-hidden="true">{paused ? '▶' : '❚❚'}</span>
        <span>{paused ? ui.resume : ui.pause}</span>
      </button>
      <button type="button" className="px-btn px-btn--bone !min-h-10 !px-3 !text-sm" aria-label={ui.restart} data-sound="select" onClick={restart}>
        <span aria-hidden="true">↻</span>
        <span>{ui.restart}</span>
      </button>
      <button type="button" data-sound="back" className="px-btn px-btn--bone !min-h-10 !px-3 !text-sm" onClick={backToSelector}>
        <span aria-hidden="true">◀</span>
        <span>{ui.exitGame}</span>
      </button>
    </div>
  )

  const moveZone = playing && touch && <MoveZone labels={ui.pad} horizontal={game.pad === 'horizontal'} onDirection={direction} />
  const actionZone = playing && touch && <ActionPad labels={ui} guard={game.guard} onAction={action} onGuard={guard} />

  // Botón de moneda del panel de mandos. Sin crédito parpadea como invitación a pulsarlo.
  const coin = { label: ui.coinButton, coins: wallet.coins, flash: wallet.credits < 1 && screen === 'select', onInsert: insertCoinNow }

  const frame = touch
    ? `mx-auto flex h-full min-h-0 w-full select-none gap-2 p-1 ${touch && landscape ? 'flex-row justify-center' : 'max-w-[36rem] flex-col'}`
    : 'flex max-h-full min-h-0 flex-col gap-2 overflow-y-auto p-3'

  return (
    <div
      ref={rootRef}
      className={`absolute inset-0 z-30 ${touch ? 'flex' : 'grid place-items-center p-2'}`}
      style={{
        background: 'rgba(15,14,34,0.62)',
        touchAction: 'manipulation',
        ...(touch && { paddingTop: safe('top'), paddingBottom: safe('bottom'), paddingLeft: safe('left'), paddingRight: safe('right') }),
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ui.title}
        className={frame}
        style={{
          ...(touch ? {} : { width: monitorWidth, minWidth: 'min(100%, 18rem)' }),
          background: PAL.ink2,
          boxShadow: touch ? `0 0 0 3px ${PAL.stone}, 0 0 0 5px ${PAL.ink}` : `0 0 0 3px ${PAL.stone}, 0 0 0 7px ${PAL.ink}, 8px 8px 0 7px ${PAL.ink}`,
        }}
      >
        {sideZones && <div className="min-w-0 flex-1 self-stretch">{moveZone}</div>}

        <div className={touch && landscape ? 'flex min-h-0 flex-none flex-col justify-center gap-1.5' : 'contents'} style={touch && landscape ? { width: monitorWidth } : undefined}>
          <header className="flex items-center gap-2" style={{ color: PAL.bone }}>
            <Led color={PAL.tile} />
            <Led color={PAL.saffron} delay={400} />
            <h2 className="px-text min-w-0 flex-1 truncate px-2 py-1 text-center text-sm font-semibold uppercase tracking-wider sm:text-base" style={{ background: PAL.ink, color: PAL.saffronLight, boxShadow: `inset 0 0 0 2px ${PAL.stone}` }}>
              {title}
            </h2>
            <Led color={PAL.lagoonLight} delay={800} />
            {touch ? (
              <button type="button" data-sound="select" aria-label={ui.options} aria-haspopup="dialog" aria-expanded={paused} className={`px-btn !px-3 !text-sm ${landscape ? '!min-h-8' : '!min-h-10'}`} onClick={() => setPaused(true)} disabled={Boolean(outcome)}>
                <span aria-hidden="true">☰</span>
                <span>{ui.options}</span>
              </button>
            ) : (
              <button type="button" data-sound="back" aria-label={ui.exitMachine} className="px-btn !min-h-10 !px-3 !text-sm" onClick={onClose}>
                <span aria-hidden="true">✕</span>
                <span className="hidden sm:inline">{ui.exitMachine}</span>
              </button>
            )}
          </header>

          {/* En táctil el área de juego llena todo el monitor: sin bordes interiores, solo queda el marco exterior de la máquina. */}
          <div className={touch ? '' : 'p-2'} style={{ background: PAL.ink, boxShadow: touch ? undefined : `inset 0 0 0 2px ${PAL.stone}` }}>
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${FRAME.width} / ${FRAME.height}`, background: '#000', containerType: 'inline-size', boxShadow: touch ? undefined : `0 0 0 3px ${PAL.stone}` }}>
              {screen === 'select' && <GameSelect ui={ui} games={games} scores={scores} unlocked={unlocked} selected={selected} touch={touch} credits={wallet.credits} notice={notice} onSelect={setSelected} onPlay={startGame} />}
              {screen === 'play' && (
                <GameStage key={`${gameId}:${runKey}`} gameId={gameId} runKey={runKey} paused={paused || Boolean(outcome)} input={input} lang={lang} ui={ui} touch={touch} onView={setView} onEvents={playEvents} onFinish={finish} />
              )}
              {paused && !outcome && (
                <div data-overlay className="contents">
                  <Overlay label={touch ? ui.options : ui.paused}>
                    <h3 className="px-text mb-[1.5cqw] text-[1.6em] font-semibold" style={{ color: PAL.saffronLight }}>{touch ? ui.options : ui.paused}</h3>
                    {touch && playing && <p className="px-text mb-[2cqw]" style={{ opacity: 0.8 }}>{ui.paused}</p>}
                    {playing && <p className="px-text mb-[2cqw]">{arcadeControls(lang, gameId, touch)}</p>}
                    <div className="flex flex-col gap-2">
                      <button type="button" data-arcade data-sound="confirm" className={`px-btn ${big}`} onClick={resume}>{playing ? ui.resume : ui.back}</button>
                      {playing && <button type="button" data-arcade data-sound="select" disabled={wallet.credits < 1} className={`px-btn px-btn--bone ${big}`} onClick={restart}>{ui.restartCost}</button>}
                      {playing ? (
                        <button type="button" data-arcade data-sound="back" className={`px-btn px-btn--bone ${big}`} onClick={backToSelector}>{touch ? ui.exitGame : ui.toSelector}</button>
                      ) : (
                        <button type="button" data-arcade data-sound="back" className={`px-btn px-btn--bone ${big}`} onClick={onClose}>{ui.exitMachine}</button>
                      )}
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
                    <p className="px-text mb-1" style={{ opacity: 0.8 }}>{ui.coins}: {wallet.coins} · {ui.credits}: {wallet.credits}</p>
                    {outcome.reward && <p className="px-text mb-1" style={{ color: PAL.lagoonLight }}>{ui.reward}: {ui.rewards[outcome.reward]}</p>}
                    {outcome.won && achievement && <p className="px-text mb-2" style={{ color: PAL.meadow }}>★ {ui.achievement}: {achievement.name}</p>}
                    <div className="flex flex-col gap-2">
                      <button type="button" data-arcade data-sound="confirm" disabled={wallet.credits < 1} className={`px-btn ${big}`} onClick={restart}>{ui.againCost}</button>
                      <button type="button" data-arcade data-sound="back" className={`px-btn px-btn--bone ${big}`} onClick={backToSelector}>{ui.toSelector}</button>
                    </div>
                  </Overlay>
                </div>
              )}
              {toast && (
                <p role="status" className="px-text absolute right-[2cqw] top-[2cqw] z-40 px-[1.6cqw] py-[0.8cqw] font-semibold" style={{ background: PAL.ink, color: PAL.saffronLight, boxShadow: `0 0 0 2px ${PAL.saffron}, 0 0 0 4px ${PAL.ink}`, fontSize: 'max(12px, 2.4cqw)' }}>
                  ★ {toast.text}
                </p>
              )}
              <div aria-hidden="true" className="arcade-crt absolute inset-0 z-30" />
            </div>
          </div>

          {/* Franja de estado de alto fijo: los avisos y el marcador cambian de texto sin mover ni encoger el monitor. En el selector
              táctil no hace falta y se quita para dejar sitio. */}
          {!(touch && !playing) && (
            <div className={`px-text flex ${touch ? (landscape ? 'h-9' : 'h-10') : 'h-12'} flex-col items-center justify-center overflow-hidden px-2 text-center text-sm leading-tight`} style={{ background: PAL.ink, color: PAL.bone, boxShadow: `inset 0 0 0 2px ${PAL.stone}` }}>
              {playing ? (
                <>
                  <p aria-live="polite" className="line-clamp-1 w-full">
                    {view?.status === 'dead' ? (touch ? ui.deadTouch : `${ui.dead} ${ui.deadKey}.`) : view?.message ? arcadeText(lang, view.message, touch) : ''}
                  </p>
                  {showHud && <p className="w-full truncate text-xs" style={{ color: PAL.saffronLight }}>{view.hud.map(({ key, value }) => `${ui.hud[key]} ${value}`).join(' · ')}</p>}
                </>
              ) : (
                <p className="text-xs" style={{ opacity: 0.8 }}>{ui.hintMenu}</p>
              )}
            </div>
          )}

          {/* Panel de mandos del escritorio: pausa, reinicio y menú son botones reales; el joystick y los pulsadores grandes, adorno. */}
          {!touch && (
            <div className="flex items-center justify-between gap-2" style={{ color: PAL.bone }}>
              {playing ? (
                <>
                  <Joystick />
                  {controls}
                  <div className="flex gap-1">
                    <PushButton color={PAL.tile} shade={PAL.tileDark} />
                    <PushButton color={PAL.saffron} shade={PAL.tileDark} />
                  </div>
                </>
              ) : (
                <ControlPanel compact coin={coin} className="w-full" />
              )}
            </div>
          )}

          {/* Selector táctil en vertical: el frontal conserva la ranura y los pulsadores de adorno. */}
          {touch && !playing && !landscape && <ControlPanel art coin={coin} className="min-h-[9rem] flex-1" />}
          {touch && !playing && landscape && <CoinButton {...coin} className="self-center" />}

          {/* Mandos táctiles en vertical: ocupan el resto de la altura, con la zona de movimiento a la izquierda y la acción a la
              derecha, separadas, y un margen abajo para que el pulgar no toque la barra de gestos del sistema. */}
          {playing && touch && !landscape && (
            <div className="flex min-h-[9rem] flex-1 gap-3 pb-3">
              <div className="min-w-0 flex-[3]">{moveZone}</div>
              <div className="min-w-0 flex-[2]">{actionZone}</div>
            </div>
          )}
        </div>

        {sideZones && <div className="min-w-0 flex-1 self-stretch">{actionZone}</div>}

        {playing && !touch && <p className="px-text text-center text-xs" style={{ color: PAL.bone, opacity: 0.75 }}>{arcadeControls(lang, gameId, false)}</p>}
      </div>
    </div>
  )
}
