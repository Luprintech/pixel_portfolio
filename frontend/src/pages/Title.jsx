import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import LanguageSwitcher from '../components/LanguageSwitcher'
import MusicControl from '../components/valle/MusicControl'
import { TITLE_H, TITLE_W, createTitleScene } from '../game/titleArt'
import OptionsDialog from '../components/valle/OptionsDialog'
import { DEFAULT_LOOK } from '../game/look'
import { PAL } from '../game/palette'
import { clearSave, loadSave } from '../game/save'
import { loadGameOptions, saveGameOptions } from '../lib/gameOptions'
import { useValleCopy } from '../lib/valleCopy'

// 20 fotogramas por segundo bastan para el pixel art y gastan poco.
const FRAME_MS = 50

export default function Title() {
  const { copy } = useValleCopy()
  const canvasRef = useRef(null)
  const [saved, setSaved] = useState(loadSave)
  const [options, setOptions] = useState(loadGameOptions)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const look = saved?.look || DEFAULT_LOOK
  const systemReduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const reduceMotion = systemReduce || options.reduceMotion

  const changeOptions = (next) => {
    setOptions(next)
    saveGameOptions(next)
  }
  const eraseSave = () => {
    clearSave()
    setSaved(null)
  }

  // El valle está vivo: la gata pasea, caen estrellas fugaces y pétalos, y la viajera parpadea.
  // Con movimiento reducido se pinta una sola imagen en reposo.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const scene = createTitleScene(canvas, look)
    if (reduceMotion) {
      scene.draw(0, true)
      return undefined
    }
    const start = performance.now()
    let last = -FRAME_MS
    let frame = requestAnimationFrame(function tick(now) {
      if (now - last >= FRAME_MS) {
        last = now
        scene.draw(now - start)
      }
      frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [look, reduceMotion])

  return (
    <div className="relative isolate flex min-h-dvh flex-col justify-between overflow-hidden" style={{ background: PAL.ink }}>
      <Helmet>
        <title>Valle del Bucle | Guadalupe Cano, desarrolladora web full stack</title>
        <meta
          name="description"
          content="Portfolio de Guadalupe Cano (Luprintech) en formato juego: pasea por el Valle del Bucle y entra en cada casa. También disponible en modo clásico."
        />
        <link rel="canonical" href="https://guadalupecano.es/" />
      </Helmet>

      <canvas
        ref={canvasRef}
        width={TITLE_W}
        height={TITLE_H}
        className={`px-canvas absolute inset-x-0 top-0 -z-10 w-full object-cover sm:bottom-0 sm:h-full ${
          saved ? 'bottom-[26.25rem] h-[calc(100%-26.25rem)]' : 'bottom-[21.25rem] h-[calc(100%-21.25rem)]'
        }`}
        style={{ objectPosition: '72% 100%' }}
        aria-hidden="true"
      />

      <div className="absolute left-4 top-4 z-10">
        <MusicControl />
      </div>

      <div className="absolute right-4 top-4 z-10 rounded px-1" style={{ background: PAL.ink }}>
        <LanguageSwitcher />
      </div>

      <header className="px-4 pt-[4.75rem] text-center sm:pt-10">
        <h1
          className="px-title mx-auto text-[clamp(3.25rem,13vw,7.5rem)]"
          style={{ color: PAL.bone, textShadow: `0 4px 0 ${PAL.ink}, 3px 4px 0 ${PAL.ink}, -3px 4px 0 ${PAL.ink}` }}
        >
          {copy.gameTitle}
        </h1>
        <p className="px-text mx-auto mt-3 inline-block px-3 py-1 text-base sm:text-lg" style={{ background: PAL.ink, color: PAL.bone }}>
          {copy.tagline}
        </p>
      </header>

      <section
        aria-label={copy.gameTitle}
        className="px-frame z-10 mb-6 mt-8 self-stretch p-4 sm:mb-10 sm:ml-10 sm:w-[19rem] sm:self-start sm:p-5"
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
              {/* Con partida guardada, «Nueva aventura» deja de ser la opción principal. */}
              <Link
                className={saved ? 'px-btn px-btn--bone w-full' : 'px-btn w-full'}
                style={saved ? { color: PAL.ink } : undefined}
                to="/valle?modo=nueva"
              >
                {copy.menu.newGame}
              </Link>
            </li>
            <li>
              <Link className="px-btn px-btn--bone w-full" style={{ color: PAL.ink }} to="/valle?modo=editar">{copy.menu.edit}</Link>
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
        <p className="px-text mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: '#cfc5e0' }}>
          <span className="sr-only">{copy.shortcuts}</span>
          <Link className="px-link" to="/proyectos">{copy.sections.projects}</Link>
          <Link className="px-link" to="/blog">{copy.sections.blog}</Link>
          <Link className="px-link" to="/contacto">{copy.sections.contact}</Link>
        </p>
      </section>

      <OptionsDialog
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        options={options}
        onChange={changeOptions}
        saved={!!saved}
        onErase={eraseSave}
      />

      {/* Firma de estudio, como en las pantallas de título de los juegos. */}
      <p
        className="px-text absolute bottom-2 right-3 z-10 px-2 py-0.5 text-sm"
        style={{ background: PAL.ink, color: PAL.bone }}
      >
        {copy.studio}
      </p>
    </div>
  )
}
