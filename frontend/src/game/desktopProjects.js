// Accesos directos a proyectos de la carpeta "Mis proyectos" del escritorio. Es solo datos: para añadir un proyecto basta una
// entrada aquí (con su icono en `desktop.js` y su nombre y descripción en `lib/valleCopy.js`, `desktop.projectsUi.items`).
//
// `status: 'public'` abre `url` (la web) o, si no la hay, `repo` (el repositorio). `status: 'maintenance'` no enlaza a nada: se
// enseña su estado, para no llevar a una versión pública incompleta. Los enlaces son exactamente los que dio Lupe o constan en
// `frontend/public/projects.json`; no se inventa ninguno. Sin Phaser ni React.
export const PROJECT_SHORTCUTS = [
  { id: 'ahi', icon: 'ahi', status: 'public', url: 'https://ahiestalapelicula.com' },
  { id: 'filamentos', icon: 'filamentos', status: 'public', url: 'https://filamentos.luprintech.com/', repo: 'https://github.com/Luprintech/filamentOS' },
  { id: 'openclaw', icon: 'openclaw', status: 'public', repo: 'https://github.com/Luprintech/openclaw-nas-docker' },
  { id: 'vocaccion', icon: 'vocaccion', status: 'maintenance' },
]

// Enlaces que ofrece un proyecto, en el orden en que se muestran: la web y el repositorio. Uno en mantenimiento no ofrece ninguno.
export function projectLinks(project) {
  if (project.status !== 'public') return []
  return [project.url && { kind: 'web', url: project.url }, project.repo && { kind: 'repo', url: project.repo }].filter(Boolean)
}

// Destino del doble clic: la web y, si no la tiene, el repositorio. `null` si no hay nada que abrir.
export const launchTarget = (project) => projectLinks(project)[0]?.url ?? null
