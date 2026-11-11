import { useRef } from 'react'
import { FONT, XP } from './theme'
import { TITLE_BAR } from './windows'

const CONTROL = 'grid h-[22px] w-[22px] place-items-center rounded-[3px] border border-white text-xs font-bold leading-none text-white'

// Botón de la barra de título (minimizar, maximizar, cerrar). Los pulsa sin iniciar un arrastre: `stop` evita que el clic
// llegue a la barra.
function Control({ label, onClick, children, danger = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={CONTROL}
      style={{ background: danger ? 'linear-gradient(180deg, #e8856b, #c4401f)' : 'linear-gradient(180deg, #5c97f5, #2b5fd0)' }}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// Ventana de Windows XP gestionada por `useWindowManager`: barra de título que arrastra, minimizar, maximizar o restaurar y
// cerrar, foco al pulsar en cualquier parte y contenido que se queda montado aunque esté minimizada (conserva su estado).
// `win` es `{ rect, minimized, maximized }`. Arrastrar solo ocurre desde la barra de título y fuera de sus botones, así no se
// confunde con seleccionar texto del contenido ni con pulsar sus controles.
export default function XpWindow({ win, z = 1, title, icon = null, active, labels, onFocus, onMove, onMinimize, onMaximize, onClose, children, bodyClass = '' }) {
  const drag = useRef(null)
  const { rect, minimized, maximized } = win

  const start = (event) => {
    onFocus()
    if (maximized || event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { dx: event.clientX - rect.x, dy: event.clientY - rect.y }
  }
  const move = (event) => {
    if (drag.current) onMove(event.clientX - drag.current.dx, event.clientY - drag.current.dy)
  }
  const end = () => {
    drag.current = null
  }

  const style = maximized ? { left: 0, top: 0, width: '100%', height: '100%' } : { left: rect.x, top: rect.y, width: rect.w, height: rect.h }
  return (
    <section
      role="dialog"
      aria-label={title}
      hidden={minimized}
      className={`absolute flex flex-col overflow-hidden ${maximized ? '' : 'rounded-t-lg'}`}
      style={{ ...style, background: XP.window, fontFamily: FONT, boxShadow: maximized ? 'none' : `0 0 0 3px ${active ? '#0054e3' : '#6c8ccb'}, 4px 6px 0 3px rgba(0,0,0,0.3)`, zIndex: z, display: minimized ? 'none' : undefined }}
      onPointerDown={onFocus}
    >
      <header
        className="flex shrink-0 select-none items-center gap-2 px-2"
        style={{ height: TITLE_BAR, background: active ? XP.titleBar : XP.titleOff, color: '#fff', touchAction: 'none', cursor: maximized ? 'default' : 'move' }}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onDoubleClick={onMaximize}
      >
        {icon}
        <h2 className="min-w-0 flex-1 truncate text-sm font-bold" style={{ textShadow: '1px 1px 0 #0a246a' }}>{title}</h2>
        <Control label={labels.minimize} onClick={onMinimize}>_</Control>
        <Control label={maximized ? labels.restore : labels.maximize} onClick={onMaximize}>{maximized ? '❐' : '□'}</Control>
        <Control label={labels.close} onClick={onClose} danger>×</Control>
      </header>
      <div className={`min-h-0 flex-1 ${bodyClass || 'overflow-auto'}`} style={{ background: '#ffffff', color: '#000' }}>{children}</div>
    </section>
  )
}
