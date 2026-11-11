import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { WALLPAPER, iconCells, iconSize, visibleEntries } from '../../game/desktop'
import { lineText } from '../../lib/dialogueCopy'
import { playStartupSound } from '../../lib/petSounds'
import { useValleCopy } from '../../lib/valleCopy'
import { ProjectsBlock } from './Content'
import Browser from './xp/Browser'
import Calculator from './xp/Calculator'
import Notepad from './xp/Notepad'
import Paint from './xp/Paint'
import VsCode from './xp/VsCode'
import Winamp from './xp/Winamp'
import XpWindow from './xp/XpWindow'
import { FONT, XP } from './xp/theme'
import { useWindowManager } from './xp/windows'

// Programas del escritorio: tamaño con el que se abren y qué dibujan. Los que tienen `padded` llevan margen alrededor del
// texto; los demás ocupan toda la ventana. `onUnlock` es el sistema de logros del juego.
const PROGRAMS = {
  welcome: { size: { w: 340, h: 170 }, padded: true },
  projects: { size: { w: 580, h: 440 }, padded: true },
  ie: { size: { w: 640, h: 460 }, Component: Browser },
  winamp: { size: { w: 340, h: 340 }, Component: Winamp },
  paint: { size: { w: 440, h: 400 }, Component: Paint },
  calculator: { size: { w: 250, h: 360 }, Component: Calculator },
  notepad: { size: { w: 460, h: 340 }, Component: Notepad },
  vscode: { size: { w: 820, h: 520 }, Component: VsCode },
}
const BOOT_MS = 3800
const PC_SIZE = { w: 960, h: 640 }
const clock = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

// Mide un elemento y avisa cuando cambia (para que las ventanas se mantengan dentro del escritorio).
function useAreaSize() {
  const [node, setNode] = useState(null)
  const [area, setArea] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    if (!node) return undefined
    const measure = () => setArea({ w: node.clientWidth, h: node.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])
  return [area, setNode]
}

function PixelIcon({ id, size = 40 }) {
  const side = iconSize(id)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${side} ${side}`} shapeRendering="crispEdges" aria-hidden="true">
      {iconCells(id).map(({ x, y, color }) => (
        <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill={color} />
      ))}
    </svg>
  )
}

// Bandera de cuatro colores del botón de inicio, hecha de cuatro cuadrados.
function StartFlag({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 4 4" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="0" y="0" width="2" height="2" fill="#f25022" />
      <rect x="2" y="0" width="2" height="2" fill="#7fba00" />
      <rect x="0" y="2" width="2" height="2" fill="#00a4ef" />
      <rect x="2" y="2" width="2" height="2" fill="#ffb900" />
    </svg>
  )
}

// Pantalla de arranque: negro, el nombre del sistema y una barra de bloques azules que corren. Pulsar la salta.
function BootScreen({ title, hint, onSkip }) {
  return (
    <button type="button" className="absolute inset-0 z-50 grid place-items-center bg-black text-white" style={{ fontFamily: FONT }} onClick={onSkip}>
      <span className="flex flex-col items-center gap-6">
        <span className="flex items-center gap-4">
          <StartFlag size={36} />
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

// El escritorio en sí: arranque, fondo, iconos, ventanas de programas (con su gestor), barra de tareas y menú de inicio.
// `active` es si la ventana del ordenador está a la vista (minimizada, no atiende a Esc). Esc cierra primero el menú, luego
// la ventana de arriba y, por último, apaga el equipo.
function Desktop({ active, onExit, unlock }) {
  const { copy, lang } = useValleCopy()
  const d = copy.desktop
  const [pane, setPane] = useAreaSize()
  const wm = useWindowManager(pane)
  const [booting, setBooting] = useState(true)
  const [menu, setMenu] = useState(false)
  const [time, setTime] = useState(clock)
  const entries = visibleEntries()
  const { refit, open } = wm
  const labels = { minimize: d.minimize, maximize: d.maximize, restore: d.restore, close: d.closeWindow }

  const finishBoot = useCallback(() => {
    setBooting(false)
    open('welcome', PROGRAMS.welcome.size)
  }, [open])

  useEffect(() => {
    playStartupSound()
    // La imagen de fondo pesa más de un megabyte: se descarga durante el arranque, no al enseñar el escritorio.
    new Image().src = WALLPAPER
    const timer = setInterval(() => setTime(clock()), 30_000)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => {
    const timer = setTimeout(finishBoot, BOOT_MS)
    return () => clearTimeout(timer)
  }, [finishBoot])
  useEffect(() => {
    if (pane.w) refit(pane)
  }, [pane, refit])

  useEffect(() => {
    if (!active) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (booting || (!menu && !wm.active)) onExit()
        else if (menu) setMenu(false)
        else wm.close(wm.active)
      } else if (booting && (event.key === 'e' || event.key === 'E' || event.key === 'Enter')) {
        event.preventDefault()
        finishBoot()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, booting, menu, wm, onExit, finishBoot])

  const launch = (id) => {
    setMenu(false)
    open(id, PROGRAMS[id].size)
  }
  const title = (id) => (id === 'welcome' ? d.welcomeTitle : d[id])

  const bodyOf = (id) => {
    const { Component, padded } = PROGRAMS[id]
    if (id === 'welcome') return <p className="p-4 text-sm leading-relaxed">{d.welcome}</p>
    if (id === 'projects') {
      return (
        <div className="p-4 text-sm" style={{ ['--text-primary']: '#000', ['--text-secondary']: '#333', ['--bg-surface']: '#f5f4ea', ['--bg-elevated']: '#f5f4ea', ['--bg-secondary']: '#ece9d8', ['--border-color']: '#7f9db9', ['--px-ink']: '#0a246a', ['--px-ring']: '#7f9db9', ['--accent-primary']: '#0a246a', ['--accent-secondary']: '#0a246a' }}>
          <p className="mb-4 max-w-[60ch] leading-relaxed">{lineText(lang, 'pc.proyectos.1')}</p>
          <ProjectsBlock />
        </div>
      )
    }
    return padded ? null : <Component onUnlock={unlock} />
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden" style={{ fontFamily: FONT, background: '#000' }}>
      {booting && <BootScreen title={d.bootTitle} hint={d.bootHint} onSkip={finishBoot} />}
      <div ref={setPane} className="relative min-h-0 flex-1 overflow-hidden bg-cover bg-center [image-rendering:pixelated]" style={{ backgroundImage: `url(${WALLPAPER})` }} onPointerDown={() => setMenu(false)}>
        <ul className="absolute left-3 top-3 flex max-h-[calc(100%-1.5rem)] flex-col flex-wrap content-start gap-3">
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
                  <button type="button" data-sound="select" className="flex w-20 flex-col items-center gap-1 text-center" onClick={() => launch(entry.id)}>{body}</button>
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

        {[...wm.windows].sort((a, b) => a.id.localeCompare(b.id)).map((win) => (
          <XpWindow
            key={win.id}
            win={win}
            z={wm.windows.findIndex((candidate) => candidate.id === win.id) + 1}
            title={title(win.id)}
            icon={win.id === 'welcome' ? null : <PixelIcon id={win.id === 'projects' ? 'projects' : win.id} size={16} />}
            active={wm.active === win.id}
            labels={labels}
            onFocus={() => wm.focus(win.id)}
            onMove={(x, y) => wm.move(win.id, x, y)}
            onMinimize={() => wm.minimize(win.id)}
            onMaximize={() => wm.maximize(win.id)}
            onClose={() => wm.close(win.id)}
          >
            {bodyOf(win.id)}
          </XpWindow>
        ))}

        {menu && (
          <div role="menu" aria-label={d.menu} className="absolute bottom-0 left-0 z-50 w-[min(22rem,100%)] overflow-hidden rounded-t-lg" style={{ boxShadow: '0 0 0 2px #0054e3, 4px 0 0 2px rgba(0,0,0,0.3)' }}>
            <div className="flex items-center gap-3 px-3 py-2 text-white" style={{ background: XP.titleBar }}>
              <span className="grid h-10 w-10 place-items-center rounded border-2 border-white bg-[#cfe3ff] text-xl">🙂</span>
              <span className="text-lg font-bold" style={{ textShadow: '1px 1px 0 #0a246a' }}>{d.user}</span>
            </div>
            <ul className="max-h-64 overflow-y-auto bg-white p-1">
              {entries.map((entry) => (
                <li key={entry.id} role="none">
                  {entry.kind === 'window' ? (
                    <button type="button" role="menuitem" className="flex w-full items-center gap-3 p-2 text-left text-sm hover:bg-[#316ac5] hover:text-white" onClick={() => launch(entry.id)}>
                      <PixelIcon id={entry.id} size={24} />
                      {d[entry.id]}
                    </button>
                  ) : (
                    <a role="menuitem" className="flex w-full items-center gap-3 p-2 text-left text-sm hover:bg-[#316ac5] hover:text-white" href={entry.url} target="_blank" rel="noopener noreferrer">
                      <PixelIcon id={entry.id} size={24} />
                      {d[entry.id]}
                      <span className="sr-only">{d.newTab}</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex justify-end px-3 py-2" style={{ background: XP.titleBar }}>
              <button type="button" role="menuitem" data-sound="back" className="flex items-center gap-2 text-sm text-white" onClick={onExit}>
                <span className="grid h-6 w-6 place-items-center rounded border border-white text-xs font-bold" style={{ background: 'linear-gradient(180deg, #e8856b, #c4401f)' }}>⏻</span>
                {d.shutdown}
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="relative z-10 flex h-9 shrink-0 items-stretch" style={{ background: 'linear-gradient(180deg, #3f8cf3 0%, #245edb 9%, #245edb 85%, #1941a5 100%)' }}>
        <button
          type="button"
          data-sound="select"
          aria-expanded={menu}
          aria-haspopup="menu"
          className="flex items-center gap-2 rounded-r-2xl pl-3 pr-5 text-lg font-bold italic text-white"
          style={{ background: 'linear-gradient(180deg, #5cc25c 0%, #3c9b3c 12%, #2e8b2e 85%, #276f27 100%)', textShadow: '1px 1px 2px #000', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)' }}
          onClick={() => setMenu((open) => !open)}
        >
          <StartFlag />
          {d.start}
        </button>
        <span className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden px-2">
          {wm.windows.map((win) => (
            <button
              key={win.id}
              type="button"
              aria-pressed={wm.active === win.id}
              className="flex max-w-[10rem] items-center gap-1 truncate rounded px-2 py-1 text-xs text-white"
              style={{ background: wm.active === win.id ? '#1e52b7' : '#3c81f3', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3)', opacity: win.minimized ? 0.75 : 1 }}
              onClick={() => wm.taskbar(win.id)}
            >
              {win.id !== 'welcome' && <PixelIcon id={win.id} size={14} />}
              <span className="truncate">{title(win.id)}</span>
            </button>
          ))}
        </span>
        <span className="flex items-center px-3 text-xs text-white" style={{ background: 'linear-gradient(180deg, #1290e8 0%, #0f84e0 50%, #0c6fc4 100%)', boxShadow: 'inset 1px 0 0 #0a4aa8' }}>{time}</span>
      </footer>
    </div>
  )
}

// El ordenador de Lupe: una ventana de Windows XP, centrada sobre el juego (no a pantalla completa del navegador), que se arrastra,
// minimiza, maximiza (al área de la aplicación) y cierra. Dentro, el arranque y el escritorio con sus programas. Al minimizar
// se conserva todo (el escritorio sigue montado) y un botón abajo la restaura; con ella minimizada el juego vuelve a
// atender al teclado (`onMinimizedChange`).
export default function RetroDesktop({ onClose, unlock, onMinimizedChange }) {
  const { copy } = useValleCopy()
  const d = copy.desktop
  const [area, setArea] = useAreaSize()
  const wm = useWindowManager(area)
  const { open, refit } = wm
  const win = wm.windows.find((candidate) => candidate.id === 'pc')
  const minimized = Boolean(win?.minimized)

  useEffect(() => {
    if (area.w && !win) open('pc', PC_SIZE)
  }, [area.w, win, open])
  useEffect(() => {
    if (area.w) refit(area)
  }, [area, refit])
  useEffect(() => {
    onMinimizedChange?.(minimized)
  }, [minimized, onMinimizedChange])

  const labels = { minimize: d.minimize, maximize: d.maximize, restore: d.restore, close: d.shutdown }
  return (
    <div ref={setArea} className="absolute inset-0 z-30" style={{ background: minimized ? 'transparent' : 'rgba(15,14,34,0.7)', pointerEvents: minimized ? 'none' : 'auto' }}>
      {win && (
        <XpWindow
          win={win}
          z={2}
          title={d.screen}
          icon={<StartFlag size={16} />}
          active
          labels={labels}
          bodyClass="overflow-hidden"
          onFocus={() => {}}
          onMove={(x, y) => wm.move('pc', x, y)}
          onMinimize={() => wm.minimize('pc')}
          onMaximize={() => wm.maximize('pc')}
          onClose={onClose}
        >
          <Desktop active={!minimized} onExit={onClose} unlock={unlock} />
        </XpWindow>
      )}
      {minimized && (
        <button type="button" data-sound="select" className="pointer-events-auto absolute bottom-3 left-3 z-50 flex items-center gap-2 rounded px-3 py-2 text-sm font-bold text-white" style={{ background: XP.titleBar, fontFamily: FONT, boxShadow: '0 0 0 2px #0a246a' }} onClick={() => wm.focus('pc')}>
          <StartFlag size={16} />
          {d.restoreComputer}
        </button>
      )}
    </div>
  )
}
