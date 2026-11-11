import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Editor from '../components/valle/Editor'
import Joystick from '../components/valle/Joystick'
import MusicControl from '../components/valle/MusicControl'
import AchievementToast from '../components/valle/AchievementToast'
import ArcadeMachine from '../components/valle/arcade/ArcadeMachine'
import CustomizeButton from '../components/valle/CustomizeButton'
import DialogueBox from '../components/valle/DialogueBox'
import FiguresViewer from '../components/valle/FiguresViewer'
import OptionsButton from '../components/valle/OptionsButton'
import OptionsDialog from '../components/valle/OptionsDialog'
import PrinterPanel from '../components/valle/PrinterPanel'
import RetroDesktop from '../components/valle/RetroDesktop'
import SaveToast from '../components/valle/SaveToast'
import SkyView from '../components/valle/SkyView'
import SmartTv from '../components/valle/SmartTv'
import WorldBubble from '../components/valle/WorldBubble'
import ZonePanel from '../components/valle/ZonePanel'
import ZoomControl from '../components/valle/ZoomControl'
import { defaultLook, randomLook, selectBody } from '../game/look'
import { DEFAULT_PET } from '../game/pet'
import { isReadyToEnter, playerFeatures } from '../game/player'
import { PAL } from '../game/palette'
import { MENU_THEME, gameById } from '../game/arcade/games'
import { loadSave } from '../game/save'
import { initialStory, reachNode, storyFeatures } from '../game/story/story'
import { updateStory } from '../game/story/storyStore'
import { clockOffset, valleSkyAt } from '../game/valleSky'
import { useThemeContext } from '../context/ThemeContext'
import { warmWorld } from '../game/worldAssets'
import { useAchievements } from '../hooks/useAchievements'
import { useJukebox } from '../hooks/useJukebox'
import { useUiSounds } from '../hooks/useUiSounds'
import { useValleSave } from '../hooks/useValleSave'
import { acquireAmbience, setAmbienceDuck, setAmbienceScene, thunder } from '../lib/ambience'
import { getEngine, startEngineIfAllowed } from '../lib/audioEngine'
import { playMeow } from '../lib/dialogueSound'
import { playPetSound } from '../lib/petSounds'
import { jukebox } from '../lib/jukebox'
import { setActivity, startMusicDirector } from '../lib/musicDirector'
import { playPrintDone, playPrintStep } from '../lib/printerSound'
import { tone } from '../lib/tone'
import { playUiSound } from '../lib/uiSounds'
import { useValleCopy } from '../lib/valleCopy'

// Todos los controles de la barra del valle miden lo mismo (36 px) y comparten la tipografía pequeña: iguales
// en web y en móvil, y más discretos sobre un mapa que se ve poco.
const HUD_SIZE = '2.25rem'
const HUD_BUTTON = 'px-btn px-btn--bone !min-h-[var(--ctl)] !px-3 !py-0 !text-sm'

// Texto del botón de acción según lo que tiene cerca la viajera: el telescopio, la salida de un interior o una puerta.
function nearLabel(near, copy) {
  if (near === 'telescope') return copy.hud.lookSky
  if (near === 'exit') return copy.hud.leave
  const action = copy.hud.actions[near.startsWith('bench:') ? 'bench' : near]
  if (action) return action
  return `${copy.hud.enter}: ${copy.zones[near]}`
}

// El exterior (viento, lluvia, pájaros) llega más suave a través de las paredes, y casi nada con la minicadena sonando.
const INDOOR_AMBIENCE = 0.35
const MUSIC_AMBIENCE = 0.12

const isTouch =() => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches

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
  // Guion de la conversación abierta (ver `game/dialogue/scripts.js`) o null.
  const [dialogue, setDialogue] = useState(null)
  const achievements = useAchievements()
  // Canal de la tele, o null si está apagada.
  const [tvChannel, setTvChannel] = useState(null)
  // Si la viajera está dentro de una casa, y el bocadillo de reacción de un personaje (o null).
  const [indoors, setIndoors] = useState(false)
  const [reaction, setReaction] = useState(null)
  // El ordenador de Lupe minimizado deja de bloquear el juego.
  const [pcMinimized, setPcMinimized] = useState(false)
  // Límites del zoom que publica la escena; hasta que existe, ambos botones valen.
  const [zoomState, setZoomState] = useState({ canIn: true, canOut: true })
  const hostRef = useRef(null)
  const skyRef = useRef(null)
  // La zona abierta, para los avisos del juego que llegan por eventos y no deben sonar encima de una actividad.
  const activeZone = useRef(null)
  const touch = isTouch()
  // El valle guardado (hora y posición) solo se reanuda al continuar: una aventura nueva empieza de cero.
  const [initialWorld] = useState(() => (mode === 'nueva' ? null : existing?.world ?? null))
  // La historia (bienvenida de Lupe, visita guiada, conversaciones escuchadas) también: una aventura nueva empieza por la bienvenida.
  const [initialStoryValue] = useState(() => (mode === 'nueva' ? initialStory() : existing?.story ?? initialStory()))
  // Copia de la historia que vive en el juego (ver `game/story/storyStore.js`): la página solo la lee para ofrecer las opciones que tocan.
  const [story, setStory] = useState(initialStoryValue)
  // Lo que la historia permite ofrecer y lo que la mascota de la viajera abre (ver `game/player.js`); el nombre rellena los textos.
  const dialogueFeatures = useMemo(() => ({ ...storyFeatures(story), ...playerFeatures({ pet, petName }) }), [story, pet, petName])
  const player = useMemo(() => ({ name, petName: pet.kind === 'ninguna' ? '' : petName, petKind: pet.kind, petBreed: pet.breed }), [name, pet.kind, pet.breed, petName])

  // Se declara antes que el efecto del juego: al salir, su limpieza guarda mientras la escena aún existe.
  const { saved, toast, saveNow, eraseSave } = useValleSave({ game, active: phase === 'play', name, look, pet, petName, autosavedText: copy.hud.autosaved })

  // La partida se escribe al entrar al valle, no mientras se edita: abandonar el creador
  // deja intacta la aventura anterior.
  const enterValley = useCallback(() => {
    // El creador ya avisa de lo que falta; esto evita entrar sin nombre por cualquier otro camino.
    if (!isReadyToEnter({ name, pet, petName })) return
    saveNow()
    setStarted(true)
    setPhase('play')
  }, [saveNow, name, pet, petName])

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
  const paused = useRef([])
  useEffect(() => {
    if (!started) return undefined
    let instance = null
    let cancelled = false
    setStatus('loading')
    import('../game/boot')
      .then(({ startGame }) => {
        if (cancelled || !hostRef.current) return
        applied.current = { look, pet }
        instance = startGame(hostRef.current, look, pet, pastel, initialWorld, initialStoryValue)
        instance.events.on('near', setNear)
        instance.events.on('enter', setZone)
        instance.registry.events.on('changedata-story', (_parent, value) => setStory(value))
        instance.events.on('talk', setDialogue)
        // Con una actividad abierta (ordenador, recreativa...) la casa calla: ni maullidos ni impresora compiten con ella.
        instance.events.on('meow', (variant) => !activeZone.current && playMeow(getEngine() ?? startEngineIfAllowed(), variant))
        instance.events.on('indoors', setIndoors)
        // La mascota de la viajera maúlla (o ladra) cuando le toca; con una actividad abierta calla, como la casa.
        instance.events.on('pet-sound', (kind, breed) => !activeZone.current && playPetSound(kind, breed))
        // El sonido ambiente sigue al cielo del valle, igual que en la portada.
        // También se guarda el último estado: la vista del telescopio lo lee para pintar el mismo cielo.
        instance.events.on('sky', (sky) => {
          skyRef.current = sky
          setAmbienceScene(sky)
        })
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
      setDialogue(null)
      setIndoors(false)
      setReaction(null)
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
      // Se pausa la escena que esté en marcha: el valle o, si la viajera está dentro de un edificio, su interior.
      paused.current = game.scene.getScenes(true).map((scene) => scene.scene.key)
      paused.current.forEach((key) => game.scene.pause(key))
      game.loop.sleep()
      return
    }
    game.loop.wake(true)
    paused.current.forEach((key) => game.scene.resume(key))
    paused.current = []
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

  // Música de la casa: el director (`lib/musicDirector.js`) calla la pista de fondo cuando una actividad tiene la suya, para que
  // no haya dos a la vez, y la devuelve al salir. El ordenador cuenta mientras no esté minimizado: minimizado se vuelve a la casa.
  useEffect(() => startMusicDirector(), [])
  // La recreativa avisa de qué suena en cada momento (el selector o el juego en marcha; ver `lib/chiptuneSongs.js`).
  const [arcadeTheme, setArcadeTheme] = useState(MENU_THEME)
  const activity = zone === 'pc' && !pcMinimized ? 'pc' : zone === 'console' ? arcadeTheme : null
  useEffect(() => {
    setActivity(activity)
    return () => setActivity(null)
  }, [activity])
  useEffect(() => {
    activeZone.current = zone
  }, [zone])
  // El exterior suena más suave dentro de casa y se calla con una actividad abierta; la minicadena también lo baja.
  const { playing: hifiPlaying } = useJukebox()
  useEffect(() => {
    setAmbienceDuck(zone ? 0 : hifiPlaying ? MUSIC_AMBIENCE : indoors ? INDOOR_AMBIENCE : 1)
    return () => setAmbienceDuck(1)
  }, [zone, hifiPlaying, indoors])

  // Con un panel o el diálogo de opciones abiertos el juego se bloquea: las flechas son del control en foco.
  const [optionsOpen, setOptionsOpen] = useState(false)
  useEffect(() => {
    game?.registry.set('locked', (!!zone && !(zone === 'pc' && pcMinimized)) || !!dialogue || optionsOpen)
  }, [game, zone, dialogue, optionsOpen, pcMinimized])
  useEffect(() => {
    if (zone !== 'pc') setPcMinimized(false)
  }, [zone])

  // Mirar por el telescopio da su logro al cerrar la vista del cielo, no al abrirla: así el aviso y su sonido se ven y se oyen con el valle
  // delante en lugar de quedar tapados por la vista.
  const unlockForSky = achievements.unlock
  const wasLooking = useRef(false)
  useEffect(() => {
    if (zone === 'telescope') wasLooking.current = true
    else if (wasLooking.current) {
      wasLooking.current = false
      unlockForSky('telescope')
    }
  }, [zone, unlockForSky])

  const closeZone = useCallback(() => setZone(null), [])
  // Al salir de la recreativa la viajera reaparece ante ella, mirándola.
  const closeArcade = useCallback(() => {
    setZone(null)
    game?.events.emit('interior-action', { type: 'arcade-exit' })
  }, [game])
  // Cada juego de la recreativa completado da su propio logro (el de la aventura es el de siempre, «retro»).
  const unlockAchievement = achievements.unlock
  const completeArcadeGame = useCallback((id) => unlockAchievement(gameById(id).achievement), [unlockAchievement])
  // La minicadena de la sala enseña si suena la música (la ponga ella o el Winamp del escritorio).
  useEffect(() => {
    if (!game) return undefined
    const sync = ({ playing }) => game.events.emit('interior-action', { type: 'music', on: playing })
    sync(jukebox.snapshot())
    return jukebox.subscribe(sync)
  }, [game])
  const selectChannel = useCallback((channel) => {
    setTvChannel(channel)
    game?.events.emit('interior-action', { type: 'tv', channel })
    setZone(null)
  }, [game])
  // La impresión corre en la sala, no en el panel: el panel solo la lanza (la sala la ve crecer capa a capa) y se cierra. La
  // sala avisa de cuándo suena la impresora y de cuándo termina; la figura se recoge allí, y el logro se da al recogerla.
  const startPrint = useCallback(() => {
    game?.events.emit('interior-action', { type: 'print-start' })
    setZone(null)
  }, [game])
  const { unlock } = achievements
  // La sala necesita saber si el premio de la impresora ya se entregó para no repetirlo al reimprimir.
  const makerRewarded = achievements.unlocked.has('maker')
  useEffect(() => {
    game?.registry.set('makerRewarded', makerRewarded)
  }, [game, makerRewarded])
  useEffect(() => {
    if (!game) return undefined
    const engine = () => getEngine() ?? startEngineIfAllowed()
    const done = ({ reward }) => reward && unlock('maker')
    // La impresora solo suena mientras imprime y siguiendo a la animación: cada movimiento del cabezal que avisa la sala.
    const step = (move) => !activeZone.current && playPrintStep(move)
    const finished = () => playPrintDone()
    // Al recoger la figura suena el efecto de objeto conseguido; el logro suena aparte, al darse (`useAchievements`).
    const item = () => playUiSound('item', engine())
    const react = (key) => setReaction({ key, id: Date.now() })
    game.events.on('figure-shown', done)
    game.events.on('print-step', step)
    game.events.on('print-done', finished)
    game.events.on('item-get', item)
    game.events.on('atreus-react', react)
    game.events.on('npc-bubble', react)
    return () => {
      game.events.off('figure-shown', done)
      game.events.off('print-step', step)
      game.events.off('print-done', finished)
      game.events.off('item-get', item)
      game.events.off('atreus-react', react)
      game.events.off('npc-bubble', react)
    }
  }, [game, unlock])
  // El bocadillo se quita solo; la escena deja de mandar su posición.
  const closeReaction = useCallback(() => {
    setReaction(null)
    game?.events.emit('bubble-closed')
  }, [game])
  const reactionText = reaction ? copy.bubbles[reaction.key][reaction.id % copy.bubbles[reaction.key].length] : null
  // Un guion puede acabar abriendo algo (el ordenador de Lupe abre su escritorio retro).
  // Las acciones `tour-*` son de la visita guiada de Lupe: las atiende el valle (`game/npc/ValleNpcs.js`) o, dentro de la casa, su visita
  // (`game/npc/InteriorLupe.js`).
  const closeDialogue = useCallback((action) => {
    setDialogue(null)
    if (action === 'desktop') setZone('pc')
    else if (action === 'tv') setZone('tv')
    else if (action === 'sky') setZone('telescope')
    else if (action === 'music') jukebox.toggle()
    // Abrir el ordenador desde la visita: Lupe espera (la parada queda contada) mientras se usa.
    else if (action === 'tour-pc') {
      game?.events.emit('npc-action', 'tour-linger')
      setZone('pc')
    } else if (action?.startsWith('tour-')) game?.events.emit('npc-action', action)
  }, [game])
  // Una página del diálogo pide algo al juego sin cerrarse (por ejemplo, que Khalessi conozca a la mascota).
  const cueDialogue = useCallback((cue) => game?.events.emit('npc-action', cue), [game])
  // La historia recuerda lo que Lupe ya ha contado: cada nodo que se abre y cuándo se llega a su última página.
  const reachDialogue = useCallback((id, finished) => game && updateStory(game, (current) => reachNode(current, id, finished)), [game])
  // Si aún no ha llegado ningún estado (se abre nada más entrar), se parte del cielo con que empieza la visita.
  const getSky = useCallback(() => skyRef.current || valleSkyAt(clockOffset(1), 1), [])
  const zoomView = useCallback((delta) => game?.events.emit('zoom', delta), [game])

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

        {!editing && <SaveToast message={toast} style={hudStyle} />}
        {!editing && <AchievementToast toast={achievements.toast} copy={copy} style={hudStyle} />}

        {/* En pantallas táctiles el aviso sube por encima del joystick y del botón A (ver `Joystick.jsx`), dentro del área segura,
            y puede partirse en dos líneas: nunca queda tapado por los controles. */}
        {near && !zone && !dialogue && !editing && (
          <div
            className="absolute left-1/2 z-10 flex w-max max-w-[calc(100%-2rem)] -translate-x-1/2 justify-center"
            style={{ bottom: touch ? 'var(--valle-prompt-bottom-touch)' : 'var(--valle-prompt-bottom)' }}
            role="status"
          >
            <button type="button" className="px-btn !h-auto !whitespace-normal !text-center" onClick={() => game?.events.emit('action')}>
              {`${touch ? '' : 'E · '}${nearLabel(near, copy)}`}
            </button>
          </div>
        )}
        {reactionText && !editing && <WorldBubble key={reaction.id} game={game} text={reactionText} onDone={closeReaction} />}

        {touch && status === 'ready' && !zone && !dialogue && !optionsOpen && !editing && <Joystick game={game} />}
        {zone === 'telescope' && !editing && <SkyView getSky={getSky} pastel={pastel} onClose={closeZone} />}
        {zone === 'pc' && !editing && <RetroDesktop onClose={closeZone} unlock={achievements.unlock} onMinimizedChange={setPcMinimized} />}
        {zone === 'console' && !editing && <ArcadeMachine unlocked={achievements.unlocked} onClose={closeArcade} onComplete={completeArcadeGame} onTheme={setArcadeTheme} />}
        {zone === 'tv' && !editing && <SmartTv channel={tvChannel} onSelect={selectChannel} onClose={closeZone} />}
        {zone === 'printer' && !editing && <PrinterPanel job={game?.registry.get('printJob')} claimed={makerRewarded} onStart={startPrint} onClose={closeZone} />}
        {zone === 'figures' && !editing && <FiguresViewer unlocked={achievements.unlocked} onClose={closeZone} />}
        {zone && zone !== 'telescope' && !['pc', 'console', 'tv', 'printer', 'figures'].includes(zone) && !editing && <ZonePanel zone={zone} onClose={closeZone} />}
        {dialogue && !editing && <DialogueBox key={dialogue} scriptId={dialogue} features={dialogueFeatures} player={player} onCue={cueDialogue} onReach={reachDialogue} onClose={closeDialogue} />}

        <OptionsDialog
          open={optionsOpen && !editing}
          onClose={() => setOptionsOpen(false)}
          saved={saved}
          onErase={() => {
            eraseSave()
            achievements.reload()
          }}
          achievements={achievements.unlocked}
          onSave={saveNow}
          actions={hudActions}
        />
      </div>
    </>
  )
}
