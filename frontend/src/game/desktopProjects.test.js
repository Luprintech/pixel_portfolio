import { describe, expect, it } from 'vitest'
import { DESKTOP_ENTRIES, ICONS, iconCells } from './desktop.js'
import { PROJECT_SHORTCUTS, launchTarget, projectLinks } from './desktopProjects.js'

const hostOf = (url) => new URL(url).hostname.replace(/^www\./, '')

describe('accesos directos de proyectos', () => {
  const byId = (id) => PROJECT_SHORTCUTS.find((project) => project.id === id)

  it('cada proyecto tiene su icono propio', () => {
    PROJECT_SHORTCUTS.forEach((project) => {
      expect(ICONS[project.icon], project.id).toBeDefined()
      expect(iconCells(project.icon).length, project.id).toBeGreaterThan(20)
    })
    expect(new Set(PROJECT_SHORTCUTS.map((project) => project.icon)).size).toBe(PROJECT_SHORTCUTS.length)
  })

  it('lleva a los enlaces exactos de cada proyecto', () => {
    expect(launchTarget(byId('ahi'))).toBe('https://ahiestalapelicula.com')
    expect(launchTarget(byId('openclaw'))).toBe('https://github.com/Luprintech/openclaw-nas-docker')
    expect(projectLinks(byId('filamentos')).map((link) => link.url)).toEqual(['https://filamentos.luprintech.com/', 'https://github.com/Luprintech/filamentOS'])
  })

  it('Vocacción está en mantenimiento y no enlaza a nada', () => {
    expect(byId('vocaccion').status).toBe('maintenance')
    expect(projectLinks(byId('vocaccion'))).toEqual([])
    expect(launchTarget(byId('vocaccion'))).toBeNull()
  })

  it('todos los enlaces son https y ninguno es la web principal luprintech.com', () => {
    const urls = [...PROJECT_SHORTCUTS.flatMap((project) => [project.url, project.repo]), ...DESKTOP_ENTRIES.map((entry) => entry.url)].filter(Boolean)
    urls.forEach((url) => {
      expect(url.startsWith('https://'), url).toBe(true)
      expect(hostOf(url), url).not.toBe('luprintech.com')
    })
  })

  it('los ids no se repiten', () => {
    expect(new Set(PROJECT_SHORTCUTS.map((project) => project.id)).size).toBe(PROJECT_SHORTCUTS.length)
  })
})
