import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import LanguageSwitcher from '../components/LanguageSwitcher'
import LupeBubble from '../components/valle/LupeBubble'
import MusicControl from '../components/valle/MusicControl'
import { LUPE_X, LUPE_Y, TITLE_H, TITLE_W, createTitleScene } from '../game/titleArt'
import OptionsDialog from '../components/valle/OptionsDialog'
import { PAL } from '../game/palette'
import { clearSave, loadSave } from '../game/save'
import { acquireAmbience, setAmbienceScene, thunder } from '../lib/ambience'
import { loadGameOptions, saveGameOptions, prefersReducedMotion } from '../lib/gameOptions'
import { playPetSound } from '../lib/petSounds'
import { useValleCopy } from '../lib/valleCopy'

// 20 fotogramas por segundo bastan para el pixel art y gastan poco.
const FRAME_MS = 50

// Los bocadillos de Lupe salen de su cabeza.
const LUPE_ANCHOR = { x: LUPE_X + 9, y: LUPE_Y + 2 }
// Contorno duro de tinta alrededor del texto suelto sobre el cielo: se lee con cualquier hora y tiempo.
const OUTLINE = [[-2, 0], [2, 0], [0, -2], [0, 2], [-2, -2], [2, -2], [-2, 2], [2, 2]].map(([x, y]) => `${x}px ${y}px 0 ${PAL.ink}`).join(', ')

const LUPE_LINE = (key, who, anchor) => ({ key, who, anchor })

export default function Title() {
  const { copy } = useValleCopy()
  const canvasRef = useRef(null)
  const menuRef = useRef(null)
  const rootRef = useRef(null)
  const [saved, setSaved] = useState(loadSave)
  const [options, setOptions] = useState(loadGameOptions)
  const [optionsOpen, setOptionsOpen] = useState(false)
  // Cada visita tiene su semilla: con ella, su hora del día de partida y su tiempo.
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 31))
  const reduceMotion = prefersReducedMotion(options)
  // Lo que se dice ahora y por dónde está quien lo dice.
  const [line, setLine] = useState(null)

  const changeOptions = (next) => {
    setOptions(next)
    saveGameOptions(next)
  }
  const eraseSave = () => {
    clearSave()
    setSaved(null)
  }

  useEffect(() => acquireAmbience(), [])

  // "journey1..3" cambian según haya partida guardada o no; el resto de frases salen tal cual.
  const lineKey = line?.key.replace(/^journey(\d)$/, saved ? 'journeyBack$1' : 'journeyNew$1')
  const lineText = lineKey ? copy.lupe[lineKey] : null

  // El lienzo termina justo donde empieza el menú, sea cual sea la altura de este (con o sin partida
  // guardada, con la fuente cargada o no): se mide y se deja en `--menu-h`, que usan el lienzo y el título.
  useEffect(() => {
    const root = rootRef.current
    const menu = menuRef.current
    if (!root || !menu) return undefined
    const fit = () => {
      const space = root.getBoundingClientRect().bottom - menu.getBoundingClientRect().top
      // Diez píxeles más por el doble anillo del marco, que sobresale del menú.
      root.style.setProperty('--menu-h', `${Math.round(space + 10)}px`)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(menu)
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  // El valle está vivo: pasa el día y la noche, llueve o truena, Lupe y la gata pasean y caen pétalos.
  // El sonido ambiente sigue al cielo. Con movimiento reducido se pinta una sola imagen en reposo.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const scene = createTitleScene(canvas, seed)
    if (reduceMotion) {
      const still = scene.draw(0, true)
      rootRef.current.style.background = still.skyTop
      setAmbienceScene(still)
      // Con la imagen quieta, Lupe deja puesto el mensaje que más ayuda: cómo empezar.
      setLine(LUPE_LINE('journey1', 'lupe', LUPE_ANCHOR))
      return undefined
    }
    const start = performance.now()
    let shown = ''
    let last = -FRAME_MS
    let frame = requestAnimationFrame(function tick(now) {
      if (now - last >= FRAME_MS) {
        last = now
        const sky = scene.draw(now - start)
        rootRef.current.style.background = sky.skyTop
        setAmbienceScene(sky)
        sky.thunder.forEach(thunder)
        // Khalessi maúlla cuando le toca; Lupe y ella hablan una a una, y el bocadillo solo cambia con la frase.
        if (sky.events.includes('meow')) playPetSound('gato', 'comun')
        if (sky.events.includes('scared')) playPetSound('gatoAsustado', 'comun')
        const say = sky.life.say
        const key = say ? `${say.who}:${say.key}` : ''
        if (key !== shown) {
          shown = key
          const anchor = say?.who === 'khalessi' ? { x: sky.life.cat.x + 12, y: sky.life.cat.y - 2 } : LUPE_ANCHOR
          setLine(say ? LUPE_LINE(say.key, say.who, anchor) : null)
        }
      }
      frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [seed, reduceMotion])

  return (
    <div ref={rootRef} className="relative isolate flex min-h-dvh flex-col justify-between overflow-hidden" style={{ background: PAL.ink }}>
      <Helmet>
        <title>Valle del Bucle | Guadalupe Cano, desarrolladora web full stack</title>
        <meta
          name="description"
          content="Portfolio de Guadalupe Cano (Luprintech) en formato juego: pasea por el Valle del Bucle y entra en cada casa. También disponible en modo clásico."
        />
        <link rel="canonical" href="https://guadalupecano.es/" />
      </Helmet>

      {/* El lienzo se amplía para llenar el hueco, pero nunca tanto que se recorten los lados: con
          `max-h-[106vw]` siempre se ven al menos 170 de los 320 px de ancho de la escena, que deja
          asomar la copa del árbol de la izquierda (la app instalada es más alta que el navegador y antes
          se acercaba tanto que desaparecía). Si sobra altura, el lienzo se queda sobre el menú y lo de
          encima se rellena con el color del cielo (rootRef). */}
      <canvas
        ref={canvasRef}
        width={TITLE_W}
        height={TITLE_H}
        className="px-canvas absolute inset-x-0 bottom-[var(--menu-h,17rem)] -z-10 h-[calc(100%-var(--menu-h,17rem))] max-h-[106vw] w-full object-cover sm:bottom-0 sm:h-full"

        style={{ objectPosition: '72% 100%' }}
        aria-hidden="true"
      />

      {lineText && <LupeBubble text={lineText} anchor={line.anchor} canvasRef={canvasRef} avoidRef={menuRef} />}
      <p className="sr-only">{copy.lupe.sr}</p>

      <div className="absolute left-4 top-4 z-10">
        <MusicControl />
      </div>

      <div className="absolute right-4 top-4 z-10 rounded px-1" style={{ background: PAL.ink }}>
        <LanguageSwitcher />
      </div>

      <header className="px-title-header px-4 pt-[4.75rem] text-center sm:pt-10">
        <h1
          className="px-title mx-auto text-[clamp(3.25rem,13vw,7.5rem)]"
          style={{ color: PAL.bone, textShadow: `0 4px 0 ${PAL.ink}, 3px 4px 0 ${PAL.ink}, -3px 4px 0 ${PAL.ink}` }}
        >
          {copy.gameTitle}
        </h1>
        {/* Bajo el título en todos los tamaños; en móvil usa la versión corta para que quepa. */}
        <p className="px-text mx-auto -mt-1 px-3 text-base sm:-mt-2 sm:text-lg" style={{ color: PAL.saffron, textShadow: OUTLINE }}>
          <span className="sm:hidden">{copy.taglineShort}</span>
          <span className="hidden sm:inline">{copy.tagline}</span>
        </p>
      </header>

      {/* En móvil el menú va abajo, pegado al borde; en sm+ el contenedor desaparece (contents). */}
      <div className="z-10 mt-8 flex flex-col sm:mt-0 sm:contents">
        <section
          ref={menuRef}
          aria-label={copy.gameTitle}
          className="px-frame px-title-menu z-10 self-stretch p-4 sm:mb-10 sm:ml-10 sm:mt-8 sm:w-[19rem] sm:self-start sm:p-5"
          style={{ background: PAL.ink, color: PAL.bone, ['--px-ink']: '#0f0e22', ['--px-ring']: PAL.saffron }}
        >
          <nav aria-label="Menú principal">
            <ul className="flex flex-col gap-4">
              {saved && (
                <li>
                  <Link className="px-btn w-full" to="/valle?modo=continuar">{copy.menu.continue}</Link>
                </li>
              )}
              <li>
                {/* Con partida guardada, "Nueva aventura" deja de ser la opción principal. */}
                <Link
                  className={saved ? 'px-btn px-btn--bone w-full' : 'px-btn w-full'}
                  style={saved ? { color: PAL.ink } : undefined}
                  to="/valle?modo=nueva"
                >
                  {copy.menu.newGame}
                </Link>
              </li>
              <li>
                <button type="button" className="px-btn px-btn--bone w-full" style={{ color: PAL.ink }} onClick={() => setOptionsOpen(true)}>
                  {copy.menu.options}
                </button>
              </li>
              <li>
                <Link className="px-btn px-btn--bone w-full" style={{ color: PAL.ink }} to="/clasico">{copy.menu.classic}</Link>
              </li>
            </ul>
          </nav>
          <p className="px-text mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm" style={{ color: '#cfc5e0' }}>
            <span className="sr-only">{copy.shortcuts}</span>
            <Link className="px-link" to="/proyectos">{copy.sections.projects}</Link>
            <Link className="px-link" to="/contacto">{copy.sections.contact}</Link>
            <Link className="px-link" to="/cv">{copy.sections.cv}</Link>
          </p>
        </section>
      </div>

      <OptionsDialog
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        options={options}
        onChange={changeOptions}
        saved={!!saved}
        onErase={eraseSave}
      />
    </div>
  )
}
