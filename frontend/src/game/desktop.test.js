import { beforeEach, describe, expect, it } from 'vitest'
import { DESKTOP_ENTRIES, ICONS, iconCells, iconSize, visibleEntries } from './desktop.js'
import { clearSeen, loadSeen, markSeen } from './dialogue/seen.js'

describe('escritorio retro', () => {
  it('solo muestra los accesos con enlace verificado, y siempre las ventanas propias', () => {
    const shown = visibleEntries()
    expect(shown.every((entry) => entry.kind === 'window' || entry.url)).toBe(true)
    expect(shown.some((entry) => entry.id === 'projects')).toBe(true)
    // Las redes sin enlace exacto quedan preparadas pero ocultas: ningún botón que no lleve a ningún sitio.
    const pending = DESKTOP_ENTRIES.filter((entry) => entry.kind === 'link' && !entry.url).map((entry) => entry.id)
    expect(pending.length).toBeGreaterThan(0)
    pending.forEach((id) => expect(shown.some((entry) => entry.id === id)).toBe(false))
  })

  it('un acceso preparado aparece en cuanto se le pone enlace', () => {
    const entries = [{ id: 'x', kind: 'link', url: null }, { id: 'y', kind: 'link', url: 'https://example.com/y' }]
    expect(visibleEntries(entries).map((entry) => entry.id)).toEqual(['y'])
  })

  it('todos los accesos tienen icono, cuadrado y dentro de su cuadrícula', () => {
    DESKTOP_ENTRIES.forEach((entry) => expect(iconCells(entry.id).length, entry.id).toBeGreaterThan(20))
    Object.entries(ICONS).forEach(([id, rows]) => {
      expect(rows.length, id).toBe(12)
      rows.forEach((row) => expect(row.length, id).toBe(12))
    })
    ;['ie', 'calculator', 'paint', 'notepad', 'winamp', 'vscode'].forEach((id) => {
      const side = iconSize(id)
      expect(side).toBe(16)
      iconCells(id).forEach(({ x, y }) => {
        expect(x, id).toBeGreaterThanOrEqual(0)
        expect(x, id).toBeLessThan(side)
        expect(y, id).toBeGreaterThanOrEqual(0)
        expect(y, id).toBeLessThan(side)
      })
    })
  })

  it('los programas del escritorio incluyen el editor de código', () => {
    expect(DESKTOP_ENTRIES.map((entry) => entry.id)).toEqual(expect.arrayContaining(['ie', 'winamp', 'paint', 'calculator', 'notepad', 'vscode']))
  })

  it('los enlaces externos son https', () => {
    DESKTOP_ENTRIES.filter((entry) => entry.url).forEach((entry) => expect(entry.url.startsWith('https://')).toBe(true))
  })
})

describe('conversaciones vistas', () => {
  beforeEach(() => {
    const store = new Map()
    globalThis.localStorage = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
    }
  })

  it('se recuerdan entre visitas y se pueden borrar', () => {
    expect(loadSeen().size).toBe(0)
    const seen = markSeen(new Set(), 'casa.entrada')
    expect(seen.has('casa.entrada')).toBe(true)
    expect(loadSeen().has('casa.entrada')).toBe(true)
    clearSeen()
    expect(loadSeen().size).toBe(0)
  })

  it('un contenido dañado se ignora', () => {
    globalThis.localStorage.setItem('valle-del-bucle:seen', '{no es json')
    expect(loadSeen().size).toBe(0)
  })

  it('sin almacenamiento sigue funcionando en memoria', () => {
    globalThis.localStorage = { getItem: () => { throw new Error('bloqueado') }, setItem: () => { throw new Error('bloqueado') }, removeItem: () => { throw new Error('bloqueado') } }
    expect(loadSeen().size).toBe(0)
    expect(markSeen(new Set(), 'a').has('a')).toBe(true)
    expect(() => clearSeen()).not.toThrow()
  })
})
