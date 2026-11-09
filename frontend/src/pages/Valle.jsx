import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Editor from '../components/valle/Editor'
import Joystick from '../components/valle/Joystick'
import MusicControl from '../components/valle/MusicControl'
import CustomizeButton from '../components/valle/CustomizeButton'
import OptionsButton from '../components/valle/OptionsButton'
import OptionsDialog from '../components/valle/OptionsDialog'
import ZonePanel from '../components/valle/ZonePanel'
import ZoomControl from '../components/valle/ZoomControl'
import { defaultLook, randomLook, selectBody } from '../game/look'
import { DEFAULT_PET } from '../game/pet'
import { PAL } from '../game/palette'
import { clearSave, loadSave, sanitizeName, writeSave } from '../game/save'
import { useThemeContext } from '../context/ThemeContext'
import { warmWorld } from '../game/worldAssets'
import { useUiSounds } from '../hooks/useUiSounds'
import { acquireAmbience, setAmbienceScene, thunder } from '../lib/ambience'
import { tone } from '../lib/tone'
import { useValleCopy } from '../lib/valleCopy'

// Todos los controles de la barra del valle miden lo mismo (36 px) y comparten la tipografía pequeña: iguales
// en web y en móvil, y más discretos sobre un mapa que se ve poco.
const HUD_SIZE = '2.25rem'
const HUD_BUTTON = 'px-btn px-btn--bone !min-h-[var(--ctl)] !px-3 !py-0 !text-sm'

const isTouch = () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches

export default function Valle() {
  const { copy } = useValleCopy()
  useUiSounds()
  const [params] = useSearchParams()
  const mode = params.get('modo')
  // El tema se lee al entrar al valle, igual que el aspecto: dentro no hay botón para cambiarlo.
  const pastel = useThemeContext().theme === 'valle'

  // "Nueva aventura" abre el creador; "Continuar" va directa al valle, donde el botón "Personalizar aspecto"
  // vuelve a abrirlo.
  const [existing] = useState(loadSave)
  const [look, setLook] = useState(() => (mode === 'nueva' ? randomLook() : existing?.look || randomLook()))
  const [pet, setPet] = useState(() => (mode === 'nueva' ? DEFAULT_PET : existing?.pet || DEFAULT_PET))
  const [name, setName] = useState(() => (mode === 'nueva' ? '' : existing?.name || ''))
  const [petName, setPetName] = useState(() => (mode === 'nueva' ? '' : existing?.petName || ''))
  // Aspecto guardado del avatar que no está seleccionado; el seleccionado vive en `look`.
  const [otherLooks, setOtherLooks] = useState({})
  const [phase, setPhase] = useState(mode === 'nueva' ? 'editor' : 'play')
  // El juego se crea la primera vez que se entra al valle y ya no se destruye: personalizar solo lo pausa.
  const [started, setStarted] = useState(mode !== 'nueva')
  const [slow, setSlow] = useState(false)
  const [status, setStatus] = useState('loading')
  const [game, setGame] = useState(null)
  const [near, setNear] = useState(null)
  const [zone, setZone] = useState(null)
  // Límites del zoom que publica la escena; hasta que existe, ambos botones valen.
  const [zoomState, setZoomState] = useState({ canIn: true, canOut: true })
  const hostRef = useRef(null)
  const touch = isTouch()

  // La partida se escribe al entrar al valle, no mientras se edita: abandonar el creador
  // deja intacta la aventura anterior.
  const enterValley = useCallback(() => {
    writeSave({ name: sanitizeName(name), look, pet, petName })
    setStarted(true)
    setPhase('play')
  }, [name, look, pet, petName])

  const selectAvatar = useCallback((body) => {
    if (body === look.body) return
    setOtherLooks((prev) => ({ ...prev, [look.body]: look }))
    setLook(selectBody(otherLooks, body))
  }, [look, otherLooks])

  // Restablecer y "al azar" afectan solo al avatar seleccionado.
  const reset = useCallback(() => {
    setLook(defaultLook(look.body))
    setPet(DEFAULT_PET)
    setName('')
    setPetName('')
  }, [look.body])

  const randomize = useCallback(() => setLook({ ...randomLook(), body: look.body }), [look.body])

  // Mientras se elige el aspecto (o ya en el valle, si se llega directo) se adelanta lo que tarda en cargarse:
  // el código de Phaser y los dibujos del mundo. Los dibujos van a porciones de pocos milisegundos (ver
  // game/sliced.js) para que el creador no se congele en un móvil; se empieza pasado un instante, con el creador
  // ya pintado y sin que el visitante haya tocado nada.
  useEffect(() => {
    const timer = setTimeout(() => {
      import('../game/boot').catch(() => {})
      warmWorld(pastel)
    }, 1200)
    return () => clearTimeout(timer)
  }, [pastel])

  // Phaser se carga solo aquí: el resto del sitio no paga su peso.
  const applied = useRef({ look, pet })
  useEffect(() => {
    if (!started) return undefined
    let instance = null
    let cancelled = false
    setStatus('loading')
    import('../game/boot')
      .then(({ startGame }) => {
        if (cancelled || !hostRef.current) return
        applied.current = { look, pet }
        instance = startGame(hostRef.current, look, pet, pastel)
        instance.events.on('near', setNear)
        instance.events.on('enter', setZone)
        // El sonido ambiente sigue al cielo del valle, igual que en la portada.
        instance.events.on('sky', setAmbienceScene)
        instance.events.on('thunder', thunder)
        // La escena puede haber publicado ya el zoom antes de que escuchemos: se lee el valor actual y se siguen los cambios.
        const syncZoom = (_parent, value) => value && setZoomState(value)
        syncZoom(null, instance.registry.get('zoom'))
        instance.registry.events.on('changedata-zoom', syncZoom)
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
    // El tema se fija al entrar al valle; el aspecto cambia después con `appearance`, sin reiniciar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started])

  // El texto de carga solo sale si tarda (0,3 s): casi siempre el mundo ya está listo y no hay nada que mostrar.
  useEffect(() => {
    if (status !== 'loading' || !started) return undefined
    const timer = setTimeout(() => setSlow(true), 300)
    return () => clearTimeout(timer)
  }, [status, started])

  // Al personalizar, el juego se duerme donde está; al volver despierta y la viajera cambia de aspecto sin moverse.
  useEffect(() => {
    if (!game) return
    if (phase === 'editor') {
      game.scene.pause('valle')
      game.loop.sleep()
      return
    }
    game.loop.wake(true)
    game.scene.resume('valle')
    game.scale.refresh()
    if (applied.current.look !== look || applied.current.pet !== pet) {
      applied.current = { look, pet }
      game.events.emit('appearance', look, pet)
    }
  }, [phase, game, look, pet])

  // El sonido ambiente solo suena dentro del valle, no mientras se personaliza.
  useEffect(() => {
    if (!started || phase !== 'play') return undefined
    return acquireAmbience()
  }, [started, phase])

  // Con un panel o el diálogo de opciones abiertos el juego se bloquea: las flechas son del control en foco.
  const [optionsOpen, setOptionsOpen] = useState(false)
  useEffect(() => {
    game?.registry.set('locked', !!zone || optionsOpen)
  }, [game, zone, optionsOpen])

  const closeZone = useCallback(() => setZone(null), [])
  const zoomView = useCallback((delta) => game?.events.emit('zoom', delta), [game])

  // Las opciones son las mismas que en la portada: el sonido se guarda en el navegador y "Borrar partida" borra la
  // guardada (la de esta visita se vuelve a escribir al cambiar el aspecto o el nombre).
  const [saved, setSaved] = useState(() => !!loadSave())
  const eraseSave = useCallback(() => {
    clearSave()
    setSaved(false)
  }, [])

  const hudStyle = {
    background: tone('lavender', PAL.ink),
    color: tone('ink', PAL.bone),
    boxShadow: `0 0 0 3px ${tone('ink', PAL.ink)}, 0 0 0 6px ${tone('lavender-deep', PAL.saffron)}`,
  }

  // Modo clásico y salir: en la barra desde tablet, y en el diálogo de opciones en móvil.
  const hudActions = (
    <>
      <Link className={HUD_BUTTON} style={{ color: PAL.ink }} to="/clasico">{copy.hud.classic}</Link>
      <Link className={HUD_BUTTON} data-sound="back" style={{ color: PAL.ink }} to="/">{copy.hud.exit}</Link>
    </>
  )

  const editing = phase === 'editor'

  // El juego y el creador conviven: al personalizar, el mundo sigue montado (invisible y dormido) para volver
  // exactamente al mismo sitio. Conserva su tamaño, así el lienzo no se redimensiona al ocultarse.
  return (
    <>
      {editing && (
        <>
          <Helmet><title>{copy.editor.title} | Valle del Bucle</title></Helmet>
          <Editor
            look={look}
            pet={pet}
            onPet={setPet}
            petName={petName}
            onPetName={setPetName}
            name={name}
            replacing={mode === 'nueva' && !!existing && !started}
            returning={started}
            onChange={setLook}
            onBody={selectAvatar}
            onName={setName}
            onRandom={randomize}
            onReset={reset}
            onDone={enterValley}
          />
        </>
      )}

      <div
        className={editing ? 'pointer-events-none invisible fixed inset-0 -z-10 overflow-hidden' : 'relative h-dvh w-full overflow-hidden'}
        style={{ background: tone('lavender', PAL.ink) }}
        aria-hidden={editing}
      >
        {!editing && (
          <Helmet>
            <title>Valle del Bucle | Juego</title>
            <meta name="robots" content="noindex, follow" />
          </Helmet>
        )}

        <div ref={hostRef} className="valle-host absolute inset-0" aria-hidden={!!zone} />

        {status === 'loading' && started && slow && (
          <p className="px-text absolute inset-0 grid place-items-center text-xl" style={{ color: tone('ink', PAL.bone) }} role="status">{copy.hud.loading}</p>
        )}
        {status === 'error' && (
          <p className="px-text absolute inset-0 z-10 grid place-items-center p-6 text-center text-lg" style={{ color: tone('ink', PAL.bone) }} role="alert">
            <span>
              {copy.hud.error}{' '}
              <Link className="px-link" to="/clasico">{copy.hud.classic}</Link>
            </span>
          </p>
        )}

        {!editing && (
          <nav aria-label="Valle" className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between gap-3" style={{ '--ctl': HUD_SIZE }}>
            <span className="flex items-center gap-3">
              <ZoomControl
                labels={copy.hud.zoom}
                canIn={status === 'ready' && zoomState.canIn}
                canOut={status === 'ready' && zoomState.canOut}
                onZoom={zoomView}
                className="!min-h-[var(--ctl)] !w-[var(--ctl)]"
              />
              <p className="px-text hidden max-w-[22rem] px-3 py-1 text-sm lg:block" style={hudStyle}>
                {touch ? copy.hud.touchControls : copy.hud.controls}
              </p>
            </span>
            <span className="flex-1" />
            <span className="flex flex-wrap items-center justify-end gap-2">
              <MusicControl track="valley" flush />
              <CustomizeButton label={copy.hud.customize} onClick={() => setPhase('editor')} className="!min-h-[var(--ctl)] !w-[var(--ctl)]" />
              {/* Bajo 768 px estos dos botones ocuparían una fila más de la vista: pasan al diálogo de opciones. */}
              <span className="hidden items-center gap-2 md:flex">{hudActions}</span>
              {/* Las opciones van las últimas, en la esquina. */}
              <OptionsButton label={copy.menu.options} onClick={() => setOptionsOpen(true)} className="!min-h-[var(--ctl)] !w-[var(--ctl)]" />
            </span>
          </nav>
        )}

        {near && !zone && !editing && (
          <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2" role="status">
            <button type="button" className="px-btn" onClick={() => game?.events.emit('action')}>
              {copy.hud.enter}: {copy.zones[near]}
            </button>
          </div>
        )}

        {touch && status === 'ready' && !zone && !optionsOpen && !editing && <Joystick game={game} />}
        {zone && !editing && <ZonePanel zone={zone} onClose={closeZone} />}

        <OptionsDialog
          open={optionsOpen && !editing}
          onClose={() => setOptionsOpen(false)}
          saved={saved}
          onErase={eraseSave}
          actions={hudActions}
        />
      </div>
    </>
  )
}
