import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { LIGHTS, TITLE_H, TITLE_W, drawTitle } from '../game/titleArt'
import { loadLook } from '../game/look'
import { PAL } from '../game/palette'
import { useValleCopy } from '../lib/valleCopy'

const DEFAULT_LOOK = { hair: '#8a3f2c', skin: '#f0c09a', dress: '#2f8f8b', trim: '#f2b134' }

export default function Title() {
  const { copy } = useValleCopy()
  const canvasRef = useRef(null)
  const [look] = useState(() => loadLook() || DEFAULT_LOOK)
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [lit, setLit] = useState(reduceMotion ? LIGHTS : 0)

  // Única animación de la pantalla: las ventanas del valle se encienden una a una.
  useEffect(() => {
    if (lit >= LIGHTS) return undefined
    const id = window.setTimeout(() => setLit((n) => n + 1), lit === 0 ? 700 : 450)
    return () => window.clearTimeout(id)
  }, [lit])

  useEffect(() => {
    if (canvasRef.current) drawTitle(canvasRef.current, look, lit)
  }, [look, lit])

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
        className="px-canvas absolute inset-0 -z-10 h-full w-full object-cover"
        style={{ objectPosition: '72% 100%' }}
        aria-hidden="true"
      />

      <div className="absolute right-4 top-4 z-10 rounded px-1" style={{ background: PAL.ink }}>
        <LanguageSwitcher />
      </div>

      <header className="px-4 pt-14 text-center sm:pt-10">
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
        className="px-frame z-10 mb-6 mt-8 self-stretch p-4 sm:mb-10 sm:ml-10 sm:w-[26rem] sm:self-start sm:p-5"
        style={{ background: PAL.ink, color: PAL.bone, ['--px-ink']: '#0f0e22', ['--px-ring']: PAL.saffron }}
      >
        <p className="px-text mb-4 max-w-[46ch] text-sm leading-relaxed sm:text-base" style={{ color: PAL.bone }}>
          {copy.intro}
        </p>
        <nav aria-label="Menú principal">
          <ul className="flex flex-col gap-4">
            <li>
              <Link className="px-btn w-full" to="/valle?modo=azar">{copy.menu.random}</Link>
            </li>
            <li>
              <Link className="px-btn px-btn--bone w-full" style={{ color: PAL.ink }} to="/valle?modo=editar">{copy.menu.edit}</Link>
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
    </div>
  )
}
