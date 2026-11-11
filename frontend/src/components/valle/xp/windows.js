// Gestor de ventanas reutilizable del escritorio de Windows XP: qué ventanas hay, su posición y tamaño, cuál está al frente y
// cuáles minimizadas o maximizadas. Las funciones son puras (reciben el estado y devuelven el nuevo) y el hook solo las
// engancha a React; así se prueban sin navegador. El orden de la lista es el de superposición: la última está encima.
import { useCallback, useState } from 'react'

export const TITLE_BAR = 28
const MARGIN = 8

const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max))

// Rectángulo que cabe en `area`: no se sale por ningún lado y conserva su tamaño si cabe (si no, se recorta).
export function fitRect(rect, area) {
  const w = Math.min(rect.w, area.w)
  const h = Math.min(rect.h, area.h)
  return { w, h, x: clamp(rect.x, 0, area.w - w), y: clamp(rect.y, 0, area.h - h) }
}

// Al arrastrar, el borde superior no baja de la barra de título más allá del área y la ventana no se pierde por los lados.
export function dragRect(rect, x, y, area) {
  return { ...rect, x: clamp(x, -(rect.w - 80), area.w - 80), y: clamp(y, 0, area.h - TITLE_BAR) }
}

// Ventana nueva centrada, desplazada en cascada según cuántas hay ya, y ajustada al área.
export function openRect(size, count, area) {
  const w = Math.min(size.w, area.w - MARGIN * 2)
  const h = Math.min(size.h, area.h - MARGIN * 2)
  const step = (count % 6) * 24
  return fitRect({ w, h, x: Math.round((area.w - w) / 2) - 60 + step, y: Math.round((area.h - h) / 2) - 40 + step }, area)
}

const top = (list, except) => [...list].reverse().find((win) => !win.minimized && win.id !== except)?.id ?? null

// Abre una ventana (o, si ya está abierta, la restaura y la trae al frente).
export function openWindow(state, id, size, area) {
  const existing = state.windows.find((win) => win.id === id)
  const rest = state.windows.filter((win) => win.id !== id)
  const win = existing ? { ...existing, minimized: false } : { id, minimized: false, maximized: false, rect: openRect(size, state.windows.length, area) }
  return { windows: [...rest, win], active: id }
}

export function closeWindow(state, id) {
  const windows = state.windows.filter((win) => win.id !== id)
  return { windows, active: state.active === id ? top(windows) : state.active }
}

export function minimizeWindow(state, id) {
  const windows = state.windows.map((win) => (win.id === id ? { ...win, minimized: true } : win))
  return { windows, active: state.active === id ? top(windows, id) : state.active }
}

export function focusWindow(state, id) {
  const win = state.windows.find((candidate) => candidate.id === id)
  if (!win) return state
  return { windows: [...state.windows.filter((candidate) => candidate.id !== id), { ...win, minimized: false }], active: id }
}

export const toggleMaximize = (state, id) => ({ ...state, windows: state.windows.map((win) => (win.id === id ? { ...win, maximized: !win.maximized } : win)) })

export function moveWindow(state, id, x, y, area) {
  return { ...state, windows: state.windows.map((win) => (win.id === id && !win.maximized ? { ...win, rect: dragRect(win.rect, x, y, area) } : win)) }
}

// El área cambió de tamaño: cada ventana se recoloca dentro de ella.
export const refitWindows = (state, area) => ({ ...state, windows: state.windows.map((win) => ({ ...win, rect: fitRect(win.rect, area) })) })

// Lo que hace un botón de la barra de tareas: restaura una ventana minimizada, minimiza la que ya está al frente y trae al
// frente la que está detrás.
export function taskbarClick(state, id) {
  const win = state.windows.find((candidate) => candidate.id === id)
  if (!win) return state
  if (win.minimized) return focusWindow(state, id)
  return state.active === id ? minimizeWindow(state, id) : focusWindow(state, id)
}

export function useWindowManager(area) {
  const [state, setState] = useState({ windows: [], active: null })
  return {
    ...state,
    open: useCallback((id, size) => setState((s) => openWindow(s, id, size, area)), [area]),
    close: useCallback((id) => setState((s) => closeWindow(s, id)), []),
    minimize: useCallback((id) => setState((s) => minimizeWindow(s, id)), []),
    focus: useCallback((id) => setState((s) => focusWindow(s, id)), []),
    maximize: useCallback((id) => setState((s) => toggleMaximize(s, id)), []),
    move: useCallback((id, x, y) => setState((s) => moveWindow(s, id, x, y, area)), [area]),
    refit: useCallback((next) => setState((s) => refitWindows(s, next)), []),
    taskbar: useCallback((id) => setState((s) => taskbarClick(s, id)), []),
  }
}
