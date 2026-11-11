import { createElement, useEffect, useRef, useState } from 'react'
import { WALLPAPER, iconCells, visibleEntries } from '../../game/desktop'
import { lineText } from '../../lib/dialogueCopy'
import { playStartupSound } from '../../lib/petSounds'
import { useValleCopy } from '../../lib/valleCopy'
import { ProjectsBlock } from './Content'
import Browser from './xp/Browser'
import Calculator from './xp/Calculator'
import Notepad from './xp/Notepad'
import Paint from './xp/Paint'
import Winamp from './xp/Winamp'

// Este escritorio imita el aspecto de Windows XP (tema Luna) a petición de Lupe: barra de tareas azul, botón de inicio
// verde, menú de inicio de dos columnas y ventanas con barra de título azul. Es una maqueta: solo hay lo que funciona.
const FONT = 'Tahoma, Verdana, "Segoe UI", sans-serif'
const BOOT_MS = 3800
const XP = {
  titleBar: 'linear-gradient(180deg, #3d95ff 0%, #0058e6 8%, #0054e3 50%, #0a5fe8 88%, #0045b8 100%)',
  taskbar: 'linear-gradient(180deg, #3f8cf3 0%, #245edb 9%, #245edb 85%, #1941a5 100%)',
  start: 'linear-gradient(180deg, #5cc25c 0%, #3c9b3c 12%, #2e8b2e 85%, #276f27 100%)',
  tray: 'linear-gradient(180deg, #1290e8 0%, #0f84e0 50%, #0c6fc4 100%)',
  window: '#ece9d8',
}

// Ventana de proyectos y de bienvenida: contenido de texto oscuro sobre blanco, como las ventanas clásicas.
const windowBody = {
  background: '#ffffff',
  color: '#000000',
  ['--text-primary']: '#000000',
  ['--text-secondary']: '#333333',
  ['--bg-surface']: '#f5f4ea',
  ['--bg-elevated']: '#f5f4ea',
  ['--bg-secondary']: '#ece9d8',
  ['--border-color']: '#7f9db9',
  ['--px-ink']: '#0a246a',
  ['--px-ring']: '#7f9db9',
  ['--accent-primary']: '#0a246a',
  ['--accent-secondary']: '#0a246a',
}

// Icono de píxeles de 12×12 como SVG sin suavizar.
function PixelIcon({ id, size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true">
      {iconCells(id).map(({ x, y, color }) => (
        <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill={color} />
      ))}
    </svg>
  )
}

// Bandera de cuatro colores del botón de inicio, hecha de cuatro cuadrados.
function StartFlag() {
  return (
    <svg width="18" height="18" viewBox="0 0 4 4" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="0" y="0" width="2" height="2" fill="#f25022" />
      <rect x="2" y="0" width="2" height="2" fill="#7fba00" />
      <rect x="0" y="2" width="2" height="2" fill="#00a4ef" />
      <rect x="2" y="2" width="2" height="2" fill="#ffb900" />
    </svg>
  )
}

function XpWindow({ title, closeLabel, onClose, onFocus, className = '', style, children }) {
  return (
    <section role="dialog" aria-label={title} onMouseDown={onFocus} className={`absolute flex max-h-[calc(100%-2rem)] flex-col overflow-hidden rounded-t-lg ${className}`} style={{ background: XP.window, boxShadow: '0 0 0 3px #0054e3, 4px 6px 0 3px rgba(0,0,0,0.3)', fontFamily: FONT, ...style }}>
      <header className="flex items-center justify-between gap-2 px-2 py-1" style={{ background: XP.titleBar, color: '#fff' }}>
        <h2 className="text-sm font-bold" style={{ textShadow: '1px 1px 0 #0a246a' }}>{title}</h2>
        <button type="button" data-sound="back" aria-label={closeLabel} className="grid h-6 w-6 place-items-center rounded border border-white text-sm font-bold text-white" style={{ background: 'linear-gradient(180deg, #e8856b, #c4401f)' }} onClick={onClose}>
          ×
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm" style={windowBody}>{children}</div>
    </section>
  )
}

// Ventanas con sitio propio; el resto de programas se abren en cascada.
const WINDOW_CLASS = {
  welcome: 'left-1/2 top-[16%] w-[min(24rem,88%)] -translate-x-1/2',
  projects: 'bottom-3 left-24 right-3 top-3 sm:left-32',
}
const PROGRAMS = { ie: Browser, calculator: Calculator, paint: Paint, notepad: Notepad, winamp: Winamp }

const clock = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

// Pantalla de arranque: negro, el nombre del sistema y una barra de bloques azules que corren. Pulsar la salta.
function BootScreen({ title, hint, onSkip }) {
  return (
    <button type="button" className="absolute inset-0 grid place-items-center bg-black text-white" style={{ fontFamily: FONT }} onClick={onSkip}>
      <span className="flex flex-col items-center gap-6">
        <span className="flex items-center gap-4">
          <StartFlag />
          <span className="text-4xl font-bold italic tracking-tight">{title}</span>
        </span>
        <span className="relative block h-4 w-44 overflow-hidden rounded border-2 border-[#b3b3b3] bg-black" aria-hidden="true">
          <span className="xp-boot-bar absolute inset-y-0 flex gap-1" style={{ left: 0 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="block h-full w-3" style={{ background: 'linear-gradient(180deg, #8fb6ff, #2d5fd8)' }} />
            ))}
          </span>
        </span>
        <span className="text-xs opacity-60">{hint}</span>
      </span>
    </button>
  )
}

// Escritorio retro del ordenador de Lupe. Al entrar suena el arranque (la grabación de `public/sounds`), se ve la pantalla
// de inicio y luego el escritorio con el fondo de colinas floridas (`public/images`). Muestra solo contenido real: los
// proyectos salen de la API y los accesos a redes solo existen si tienen un enlace verificado (`game/desktop.js`).
// Esc cierra primero el menú, luego la ventana y por último el escritorio.
export default function RetroDesktop({ onClose }) {
  const { copy, lang } = useValleCopy()
  const d = copy.desktop
  const [booting, setBooting] = useState(true)
  const [windows, setWindows] = useState([])
  const [menu, setMenu] = useState(false)
  const [time, setTime] = useState(clock)
  const rootRef = useRef(null)
  const entries = visibleEntries()

  useEffect(() => {
    playStartupSound()
    // La imagen de fondo pesa más de un megabyte: se descarga durante la pantalla de arranque, no al enseñar el escritorio.
    new Image().src = WALLPAPER
    rootRef.current?.focus()
    const timer = setInterval(() => setTime(clock()), 30_000)
    return () => clearInterval(timer)
  }, [])

  // Pasado el arranque aparece la ventana de bienvenida.
  const finishBoot = () => {
    setBooting(false)
    setWindows((current) => (current.length ? current : ['welcome']))
  }
  useEffect(() => {
    const timer = setTimeout(finishBoot, BOOT_MS)
    return () => clearTimeout(timer)
  }, [])

  const openWindow = (id) => {
    setMenu(false)
    setWindows((current) => [...current.filter((open) => open !== id), id])
  }
  const closeWindow = (id) => setWindows((current) => current.filter((open) => open !== id))
  // Traer una ventana al frente: pasa al final de la lista, que es lo que se dibuja encima.
  const focusWindow = (id) => setWindows((current) => (current[current.length - 1] === id ? current : [...current.filter((open) => open !== id), id]))

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (booting) onClose()
        else if (menu) setMenu(false)
        else if (windows.length) setWindows((current) => current.slice(0, -1))
        else onClose()
      } else if (booting && (event.key === 'e' || event.key === 'E' || event.key === 'Enter')) {
        event.preventDefault()
        finishBoot()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [booting, menu, windows.length, onClose])

  return (
    <div ref={rootRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={d.screen} className="absolute inset-0 z-30 flex flex-col overflow-hidden outline-none" style={{ fontFamily: FONT, background: '#000' }}>
      {booting ? (
        <BootScreen title={d.bootTitle} hint={d.bootHint} onSkip={finishBoot} />
      ) : (
        <>
          <div className="relative min-h-0 flex-1 bg-cover bg-center [image-rendering:pixelated]" style={{ backgroundImage: `url(${WALLPAPER})` }} onClick={() => setMenu(false)}>
            <ul className="absolute left-3 top-3 flex flex-col gap-4">
              {entries.map((entry) => {
                const body = (
                  <>
                    <PixelIcon id={entry.id} />
                    <span className="px-1 text-xs text-white" style={{ textShadow: '1px 1px 1px #000, 0 0 3px #000' }}>{d[entry.id]}</span>
                  </>
                )
                return (
                  <li key={entry.id}>
                    {entry.kind === 'window' ? (
                      <button type="button" data-sound="select" className="flex w-20 flex-col items-center gap-1 text-center" onClick={() => openWindow(entry.id)}>{body}</button>
                    ) : (
                      <a data-sound="select" className="flex w-20 flex-col items-center gap-1 text-center" href={entry.url} target="_blank" rel="noopener noreferrer">
                        {body}
                        <span className="sr-only">{d.newTab}</span>
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>

            {windows.map((id, order) => (
              <XpWindow
                key={id}
                title={id === 'welcome' ? d.welcomeTitle : d[id]}
                closeLabel={d.closeWindow}
                onClose={() => closeWindow(id)}
                onFocus={() => focusWindow(id)}
                className={WINDOW_CLASS[id] ?? 'left-3 right-3 sm:left-auto sm:right-auto sm:w-[26rem]'}
                style={WINDOW_CLASS[id] ? undefined : { top: `${3 + order * 1.25}rem`, left: undefined, marginLeft: `calc(7rem + ${order * 1.25}rem)` }}
              >
                {id === 'welcome' && <p className="leading-relaxed">{d.welcome}</p>}
                {id === 'projects' && (
                  <>
                    <p className="mb-4 max-w-[60ch] leading-relaxed">{lineText(lang, 'pc.proyectos.1')}</p>
                    <ProjectsBlock />
                  </>
                )}
                {PROGRAMS[id] && createElement(PROGRAMS[id])}
              </XpWindow>
            ))}

            {menu && (
              <div role="menu" aria-label={d.menu} className="absolute bottom-0 left-0 w-[min(22rem,100%)] overflow-hidden rounded-t-lg" style={{ boxShadow: '0 0 0 2px #0054e3, 4px 0 0 2px rgba(0,0,0,0.3)' }}>
                <div className="flex items-center gap-3 px-3 py-2 text-white" style={{ background: XP.titleBar }}>
                  <span className="grid h-10 w-10 place-items-center rounded border-2 border-white bg-[#cfe3ff] text-xl">🙂</span>
                  <span className="text-lg font-bold" style={{ textShadow: '1px 1px 0 #0a246a' }}>{d.user}</span>
                </div>
                <ul className="bg-white p-1">
                  {entries.map((entry) => (
                    <li key={entry.id} role="none">
                      {entry.kind === 'window' ? (
                        <button type="button" role="menuitem" className="flex w-full items-center gap-3 p-2 text-left text-sm hover:bg-[#316ac5] hover:text-white" onClick={() => openWindow(entry.id)}>
                          <PixelIcon id={entry.id} size={28} />
                          {d[entry.id]}
                        </button>
                      ) : (
                        <a role="menuitem" className="flex w-full items-center gap-3 p-2 text-left text-sm hover:bg-[#316ac5] hover:text-white" href={entry.url} target="_blank" rel="noopener noreferrer">
                          <PixelIcon id={entry.id} size={28} />
                          {d[entry.id]}
                          <span className="sr-only">{d.newTab}</span>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end px-3 py-2" style={{ background: XP.titleBar }}>
                  <button type="button" role="menuitem" data-sound="back" className="flex items-center gap-2 text-sm text-white" onClick={onClose}>
                    <span className="grid h-6 w-6 place-items-center rounded border border-white text-xs font-bold" style={{ background: 'linear-gradient(180deg, #e8856b, #c4401f)' }}>⏻</span>
                    {d.shutdown}
                  </button>
                </div>
              </div>
            )}
          </div>

          <footer className="relative z-10 flex h-9 shrink-0 items-stretch" style={{ background: XP.taskbar }}>
            <button
              type="button"
              data-sound="select"
              aria-expanded={menu}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-r-2xl pl-3 pr-5 text-lg font-bold italic text-white"
              style={{ background: XP.start, textShadow: '1px 1px 2px #000', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)' }}
              onClick={() => setMenu((open) => !open)}
            >
              <StartFlag />
              {d.start}
            </button>
            <span className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden px-2">
              {windows.map((id, order) => (
                <button key={id} type="button" aria-pressed={order === windows.length - 1} className="max-w-[10rem] truncate rounded px-3 py-1 text-xs text-white" style={{ background: order === windows.length - 1 ? '#1e52b7' : '#3c81f3', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3)' }} onClick={() => focusWindow(id)}>
                  {id === 'welcome' ? d.welcomeTitle : d[id]}
                </button>
              ))}
            </span>
            <span className="flex items-center px-3 text-xs text-white" style={{ background: XP.tray, boxShadow: 'inset 1px 0 0 #0a4aa8' }}>{time}</span>
          </footer>
        </>
      )}
    </div>
  )
}
