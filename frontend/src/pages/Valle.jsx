import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Editor from '../components/valle/Editor'
import Joystick from '../components/valle/Joystick'
import ZonePanel from '../components/valle/ZonePanel'
import { loadLook, randomLook, saveLook } from '../game/look'
import { PAL } from '../game/palette'
import { useValleCopy } from '../lib/valleCopy'

const isTouch = () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches

export default function Valle() {
  const { copy } = useValleCopy()
  const [params] = useSearchParams()
  const mode = params.get('modo')

  const [look, setLook] = useState(() => {
    const next = mode === 'azar' ? randomLook() : loadLook() || randomLook()
    saveLook(next)
    return next
  })
  const [phase, setPhase] = useState(mode === 'editar' ? 'editor' : 'play')
  const [status, setStatus] = useState('loading')
  const [game, setGame] = useState(null)
  const [near, setNear] = useState(null)
  const [zone, setZone] = useState(null)
  const hostRef = useRef(null)
  const touch = isTouch()

  const updateLook = useCallback((next) => {
    setLook(next)
    saveLook(next)
  }, [])

  // Phaser se carga solo aquí: el resto del sitio no paga su peso.
  useEffect(() => {
    if (phase !== 'play') return undefined
    let instance = null
    let cancelled = false
    setStatus('loading')
    import('../game/boot')
      .then(({ startGame }) => {
        if (cancelled || !hostRef.current) return
        instance = startGame(hostRef.current, look)
        instance.events.on('near', setNear)
        instance.events.on('enter', setZone)
        setGame(instance)
        setStatus('ready')
      })
      .catch(() => !cancelled && setStatus('error'))
    return () => {
      cancelled = true
      instance?.destroy(true)
      setGame(null)
      setNear(null)
      setZone(null)
    }
    // El aspecto se fija al entrar; cambiarlo exige volver al editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => {
    game?.registry.set('locked', !!zone)
  }, [game, zone])

  const closeZone = useCallback(() => setZone(null), [])

  if (phase === 'editor') {
    return (
      <>
        <Helmet><title>{copy.editor.title} | Valle del Bucle</title></Helmet>
        <Editor look={look} onChange={updateLook} onRandom={() => updateLook(randomLook())} onDone={() => setPhase('play')} />
      </>
    )
  }

  const hudStyle = { background: PAL.ink, color: PAL.bone, boxShadow: `0 0 0 3px ${PAL.ink}, 0 0 0 6px ${PAL.saffron}` }

  return (
    <div className="relative h-dvh w-full overflow-hidden" style={{ background: PAL.ink }}>
      <Helmet>
        <title>Valle del Bucle | Juego</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div ref={hostRef} className="absolute inset-0" aria-hidden={!!zone} />

      {status === 'loading' && (
        <p className="px-text absolute inset-0 grid place-items-center text-xl" style={{ color: PAL.bone }} role="status">{copy.hud.loading}</p>
      )}
      {status === 'error' && (
        <p className="px-text absolute inset-0 z-10 grid place-items-center p-6 text-center text-lg" style={{ color: PAL.bone }} role="alert">
          <span>
            {copy.hud.error}{' '}
            <Link className="px-link" to="/clasico">{copy.hud.classic}</Link>
          </span>
        </p>
      )}

      <nav aria-label="Valle" className="absolute left-4 right-4 top-4 z-10 flex items-start justify-between gap-3">
        <p className="px-text hidden max-w-[22rem] px-3 py-1 text-sm sm:block" style={hudStyle}>
          {touch ? copy.hud.touchControls : copy.hud.controls}
        </p>
        <span className="flex-1 sm:hidden" />
        <span className="flex gap-4">
          <button type="button" className="px-btn px-btn--bone !min-h-[40px]" style={{ color: PAL.ink }} onClick={() => setPhase('editor')}>
            {copy.menu.edit}
          </button>
          <Link className="px-btn px-btn--bone !min-h-[40px]" style={{ color: PAL.ink }} to="/clasico">{copy.hud.classic}</Link>
          <Link className="px-btn px-btn--bone !min-h-[40px]" style={{ color: PAL.ink }} to="/">{copy.hud.exit}</Link>
        </span>
      </nav>

      {near && !zone && (
        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2" role="status">
          <button type="button" className="px-btn" onClick={() => game?.events.emit('action')}>
            {copy.hud.enter}: {copy.zones[near]}
          </button>
        </div>
      )}

      {touch && status === 'ready' && !zone && <Joystick game={game} />}
      {zone && <ZonePanel zone={zone} onClose={closeZone} />}
    </div>
  )
}
