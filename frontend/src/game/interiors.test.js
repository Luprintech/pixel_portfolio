import { describe, expect, it } from 'vitest'
import { BUILDINGS, TILE } from './world.js'
import { EXIT_ID, WALL_ROWS, roomOf } from './interiors.js'
import { advanceWalk, facingFor, inputVector } from './walk.js'

describe('salas interiores', () => {
  it('cada edificio tiene una sala con la salida y el punto de entrada dentro del suelo', () => {
    BUILDINGS.forEach((b) => {
      const room = roomOf(b)
      const { bounds, spawn, exit } = room
      expect(room.width).toBe(room.cols * TILE)
      expect(bounds.y).toBe(WALL_ROWS * TILE)
      expect(spawn.x, b.id).toBeGreaterThan(bounds.x)
      expect(spawn.x, b.id).toBeLessThan(bounds.x + bounds.width)
      expect(spawn.y, b.id).toBeLessThan(bounds.y + bounds.height)
      expect(exit.x, b.id).toBeGreaterThanOrEqual(bounds.x)
      expect(exit.x + exit.width, b.id).toBeLessThanOrEqual(bounds.x + bounds.width)
    })
  })

  it('al entrar la viajera queda fuera de la zona de salida, para que no salga el botón de golpe', () => {
    BUILDINGS.forEach((b) => {
      const { spawn, exit } = roomOf(b)
      const inside = spawn.x >= exit.x && spawn.x <= exit.x + exit.width && spawn.y >= exit.y && spawn.y <= exit.y + exit.height
      expect(inside, b.id).toBe(false)
    })
  })

  it('la salida no se llama como ningún edificio', () => {
    expect(BUILDINGS.some((b) => b.id === EXIT_ID)).toBe(false)
  })

  it('las salas siguen al tamaño del edificio dentro de unos límites', () => {
    const small = roomOf({ w: 4, h: 4 })
    const big = roomOf({ w: 30, h: 30 })
    expect([small.cols, small.rows]).toEqual([8, 7])
    expect([big.cols, big.rows]).toEqual([14, 10])
  })
})

describe('marcha', () => {
  const controls = (down = {}) => ({
    cursors: { left: { isDown: !!down.left }, right: { isDown: !!down.right }, up: { isDown: !!down.up }, down: { isDown: !!down.down } },
    keys: { A: { isDown: false }, D: { isDown: false }, W: { isDown: false }, S: { isDown: false } },
  })

  it('las teclas mandan sobre el joystick, que solo vale si no hay teclas', () => {
    const { cursors, keys } = controls({ left: true })
    expect(inputVector(cursors, keys, { x: 1, y: 1 })).toEqual({ x: -1, y: 0 })
    const idle = controls()
    expect(inputVector(idle.cursors, idle.keys, { x: 0.5, y: -0.5 })).toEqual({ x: 0.5, y: -0.5 })
  })

  it('mira hacia el eje con más empuje', () => {
    expect(facingFor(-1, 0.4)).toBe('left')
    expect(facingFor(0.2, -1)).toBe('up')
    expect(facingFor(0, 1)).toBe('down')
  })

  it('el ciclo avanza con el tiempo y vuelve al reposo al parar', () => {
    const state = { timer: 0, step: 0 }
    advanceWalk(state, true, 100)
    expect(state.step).toBe(0)
    advanceWalk(state, true, 100)
    expect(state.step).toBe(1)
    advanceWalk(state, false, 16)
    expect(state.step).toBe(0)
  })
})
