import { describe, expect, it } from 'vitest'
import { TITLE_BAR, closeWindow, dragRect, fitRect, focusWindow, minimizeWindow, moveWindow, openRect, openWindow, refitWindows, taskbarClick, toggleMaximize } from './windows.js'

const AREA = { w: 800, h: 500 }
const SIZE = { w: 300, h: 200 }
const empty = { windows: [], active: null }
const ids = (state) => state.windows.map((win) => win.id)

function three() {
  let s = openWindow(empty, 'a', SIZE, AREA)
  s = openWindow(s, 'b', SIZE, AREA)
  return openWindow(s, 'c', SIZE, AREA)
}

describe('gestor de ventanas', () => {
  it('abre ventanas dentro del área, en cascada y la última al frente', () => {
    const s = three()
    expect(ids(s)).toEqual(['a', 'b', 'c'])
    expect(s.active).toBe('c')
    s.windows.forEach(({ rect }) => {
      expect(rect.x).toBeGreaterThanOrEqual(0)
      expect(rect.y).toBeGreaterThanOrEqual(0)
      expect(rect.x + rect.w).toBeLessThanOrEqual(AREA.w)
      expect(rect.y + rect.h).toBeLessThanOrEqual(AREA.h)
    })
    expect(s.windows[1].rect.x).not.toBe(s.windows[0].rect.x)
  })

  it('una ventana mayor que el área se recorta para caber', () => {
    expect(openRect({ w: 2000, h: 2000 }, 0, AREA).w).toBeLessThan(AREA.w)
    expect(fitRect({ x: 500, y: 400, w: 600, h: 300 }, AREA)).toEqual({ x: 200, y: 200, w: 600, h: 300 })
  })

  it('abrir una ventana ya abierta la restaura y la trae al frente sin duplicarla', () => {
    let s = minimizeWindow(three(), 'a')
    s = openWindow(s, 'a', SIZE, AREA)
    expect(ids(s)).toEqual(['b', 'c', 'a'])
    expect(s.windows.at(-1).minimized).toBe(false)
    expect(s.active).toBe('a')
  })

  it('minimizar pasa el foco a la siguiente visible y mantiene la ventana (y su contenido)', () => {
    const s = minimizeWindow(three(), 'c')
    expect(s.active).toBe('b')
    expect(ids(s)).toContain('c')
    expect(s.windows.find((win) => win.id === 'c').minimized).toBe(true)
  })

  it('cerrar quita la ventana y da el foco a la de encima', () => {
    const s = closeWindow(three(), 'c')
    expect(ids(s)).toEqual(['a', 'b'])
    expect(s.active).toBe('b')
    expect(closeWindow(openWindow(empty, 'a', SIZE, AREA), 'a').active).toBe(null)
  })

  it('enfocar reordena la superposición', () => {
    expect(ids(focusWindow(three(), 'a'))).toEqual(['b', 'c', 'a'])
  })

  it('maximizar y restaurar conservan el rectángulo de antes', () => {
    let s = three()
    const before = s.windows[0].rect
    s = toggleMaximize(s, 'a')
    expect(s.windows[0].maximized).toBe(true)
    s = toggleMaximize(s, 'a')
    expect(s.windows[0].maximized).toBe(false)
    expect(s.windows[0].rect).toEqual(before)
  })

  it('arrastrar mueve la ventana pero no la deja salir del área ni perder la barra de título', () => {
    const s = moveWindow(three(), 'c', 99999, 99999, AREA)
    const { rect } = s.windows.find((win) => win.id === 'c')
    expect(rect.x).toBeLessThan(AREA.w)
    expect(rect.y).toBeLessThanOrEqual(AREA.h - TITLE_BAR)
    const up = moveWindow(s, 'c', -99999, -99999, AREA).windows.find((win) => win.id === 'c').rect
    expect(up.y).toBe(0)
    expect(up.x + up.w).toBeGreaterThan(0)
    expect(dragRect({ x: 0, y: 0, w: 300, h: 200 }, 10, 10, AREA)).toMatchObject({ x: 10, y: 10 })
  })

  it('una ventana maximizada no se arrastra', () => {
    let s = toggleMaximize(three(), 'a')
    const before = s.windows.find((win) => win.id === 'a').rect
    s = moveWindow(s, 'a', 5, 5, AREA)
    expect(s.windows.find((win) => win.id === 'a').rect).toEqual(before)
  })

  it('al cambiar el área, las ventanas se recolocan dentro', () => {
    const s = refitWindows(three(), { w: 320, h: 220 })
    s.windows.forEach(({ rect }) => {
      expect(rect.x + rect.w).toBeLessThanOrEqual(320)
      expect(rect.y + rect.h).toBeLessThanOrEqual(220)
    })
  })

  it('la barra de tareas restaura, minimiza o trae al frente según el caso', () => {
    let s = minimizeWindow(three(), 'a')
    s = taskbarClick(s, 'a')
    expect(s.active).toBe('a')
    expect(s.windows.at(-1).minimized).toBe(false)
    s = taskbarClick(s, 'a')
    expect(s.windows.find((win) => win.id === 'a').minimized).toBe(true)
    s = taskbarClick(s, 'b')
    expect(s.active).toBe('b')
  })
})
