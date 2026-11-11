import { useState } from 'react'
import { PROJECT_SHORTCUTS, launchTarget, projectLinks } from '../../../game/desktopProjects'
import { useValleCopy } from '../../../lib/valleCopy'
import PixelIcon from '../PixelIcon'

const BUTTON = { borderColor: '#7f9db9', background: 'linear-gradient(#ffffff, #dedbc8)' }

// Abre un destino en otra pestaña sin darle acceso a esta (`noopener`).
const openOutside = (url) => window.open(url, '_blank', 'noopener,noreferrer')

// Carpeta "Mis proyectos": cada proyecto es un acceso directo con su icono. Un clic (o un toque) lo selecciona y cuenta de qué va; un
// doble clic o Intro lo abre en otra pestaña. El panel de abajo ofrece lo mismo con botones, que es lo que usa quien toca la pantalla.
// Un proyecto en mantenimiento no abre nada y lo dice. Los datos están en `game/desktopProjects.js`.
export default function ProjectsFolder() {
  const { copy } = useValleCopy()
  const u = copy.desktop.projectsUi
  const [selected, setSelected] = useState(null)
  const project = PROJECT_SHORTCUTS.find((candidate) => candidate.id === selected)
  const links = project ? projectLinks(project) : []

  const open = (candidate) => {
    const target = launchTarget(candidate)
    setSelected(candidate.id)
    if (target) openOutside(target)
  }

  return (
    <div className="flex h-full min-h-[18rem] flex-col text-sm" style={{ background: '#fff', color: '#000' }}>
      <ul aria-label={u.label} className="flex flex-wrap content-start gap-2 overflow-auto p-3">
        {PROJECT_SHORTCUTS.map((candidate) => {
          const active = selected === candidate.id
          return (
            <li key={candidate.id}>
              <button
                type="button"
                data-sound="select"
                aria-pressed={active}
                className="flex w-28 flex-col items-center gap-1 rounded p-2 text-center"
                style={{ background: active ? '#316ac5' : 'transparent', color: active ? '#fff' : '#000' }}
                onClick={() => setSelected(candidate.id)}
                onDoubleClick={() => open(candidate)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return
                  event.preventDefault()
                  open(candidate)
                }}
              >
                <PixelIcon id={candidate.icon} size={44} />
                <span className="text-xs font-bold leading-tight">{u.items[candidate.id].name}</span>
                {candidate.status === 'maintenance' && <span className="text-[10px] italic">{u.status.maintenance}</span>}
              </button>
            </li>
          )
        })}
      </ul>
      <div className="mt-auto shrink-0 border-t p-3" style={{ borderColor: '#aca899', background: '#ece9d8' }} aria-live="polite">
        {project ? (
          <>
            <p className="font-bold">
              {u.items[project.id].name} <span className="text-xs font-normal">· {u.status[project.status]}</span>
            </p>
            <p className="mt-1 max-w-[62ch] text-xs leading-relaxed">{u.items[project.id].desc}</p>
            <p className="mt-2 flex flex-wrap items-center gap-2">
              {links.map((link) => (
                <a key={link.kind} href={link.url} target="_blank" rel="noopener noreferrer" className="rounded border px-3 py-1 text-xs" style={BUTTON}>
                  {u[link.kind]}
                  <span className="sr-only"> {copy.desktop.newTab}</span>
                </a>
              ))}
              {!links.length && <span className="text-xs italic">{u.noLink}</span>}
            </p>
          </>
        ) : (
          <p className="text-xs">{u.hint}</p>
        )}
      </div>
    </div>
  )
}
