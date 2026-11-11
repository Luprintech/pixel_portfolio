import { describe, expect, it } from 'vitest'
import { FURNITURE, framesOf } from './index.js'
import { MAX_PIECE, MINI_STAGES, SWEEPS, armFor, miniFrameInfo, miniStageFrames, printedRows } from './maker.js'

describe('impresoras Bambu', () => {
  it('la pieza crece capa a capa: nunca baja, sube un máximo de una fila por movimiento y acaba entera', () => {
    let previous = 0
    for (let stage = 0; stage < MINI_STAGES; stage++) {
      for (let sweep = 0; sweep < SWEEPS; sweep++) {
        const rows = printedRows(stage, sweep)
        expect(rows).toBeGreaterThanOrEqual(previous)
        expect(rows - previous).toBeLessThanOrEqual(1)
        previous = rows
      }
    }
    expect(previous).toBe(MAX_PIECE)
  })

  it('el eje sube con la pieza y la boquilla siempre toca la última capa', () => {
    const top = 54
    let arm = Infinity
    for (let rows = 0; rows <= MAX_PIECE; rows++) {
      const next = armFor(top, rows)
      expect(next).toBeLessThan(arm)
      arm = next
      // La punta de la boquilla (15 filas bajo el brazo) cae sobre la última capa impresa.
      expect(next + 15).toBe(top - 2 - rows)
    }
  })

  it('cada tanda de la mini tiene sus movimientos y todos son fotogramas del dibujo', () => {
    const { frames } = FURNITURE.printerMini
    const all = Array.from({ length: MINI_STAGES }, (_, stage) => miniStageFrames(stage)).flat()
    expect(new Set(all).size).toBe(MINI_STAGES * SWEEPS)
    all.forEach((frame) => {
      expect(frame).toBeGreaterThanOrEqual(1)
      expect(frame).toBeLessThan(frames - 1)
    })
    expect(FURNITURE.printerMini.modes.done).toEqual([frames - 1])
    expect(miniFrameInfo(1)).toEqual({ stage: 0, sweep: 0 })
    expect(miniFrameInfo(miniStageFrames(5)[2])).toEqual({ stage: 5, sweep: 2 })
  })

  it('la A1 recorre sus fotogramas y se detiene un momento en la pieza acabada', () => {
    const { sequence, frames } = FURNITURE.printerA1
    expect(framesOf('printerA1')).toBe(frames)
    sequence.forEach((frame) => {
      expect(frame).toBeGreaterThanOrEqual(0)
      expect(frame).toBeLessThan(frames)
    })
    expect(new Set(sequence).size).toBe(frames)
    expect(sequence.at(-1)).toBe(frames - 1)
  })
})
