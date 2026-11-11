import { describe, expect, it } from 'vitest'
import { PRINT_MS, idleJob, jobAt, printView, progressOf, startJob } from './printJob.js'

describe('trabajo de impresión', () => {
  it('empieza en reposo y no avanza sin lanzarse', () => {
    const job = idleJob()
    expect(jobAt(job, 1e9)).toBe(job)
    expect(progressOf(job, 1e9)).toBe(0)
    expect(printView(job, 1e9, 8)).toEqual({ kind: 'idle', stage: 0 })
  })

  it('imprime capa a capa durante PRINT_MS y entonces queda terminada', () => {
    const job = startJob(1000)
    expect(printView(job, 1000, 8)).toEqual({ kind: 'printing', stage: 0 })
    expect(printView(job, 1000 + PRINT_MS / 2, 8)).toEqual({ kind: 'printing', stage: 4 })
    expect(printView(job, 1000 + PRINT_MS - 1, 8)).toEqual({ kind: 'printing', stage: 7 })
    expect(jobAt(job, 1000 + PRINT_MS - 1)).toBe(job)
    expect(jobAt(job, 1000 + PRINT_MS)).toEqual({ state: 'done', startedAt: 1000 })
    expect(printView(job, 1000 + PRINT_MS, 8)).toEqual({ kind: 'done', stage: 7 })
  })

  it('una impresión terminada sigue terminada hasta que se recoge', () => {
    const done = jobAt(startJob(0), PRINT_MS)
    expect(jobAt(done, PRINT_MS * 50)).toBe(done)
    expect(progressOf(done, 0)).toBe(1)
  })

  it('el avance nunca sale de 0 a 1', () => {
    const job = startJob(5000)
    expect(progressOf(job, 0)).toBe(0)
    expect(progressOf(job, 5000 + PRINT_MS * 3)).toBe(1)
  })
})
