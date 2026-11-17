import { describe, expect, it } from 'vitest'
import { CAR_START, playCarStart, startCarEngine } from './carSound'

// Contexto de audio de mentira: apunta los osciladores creados y los valores que reciben sus parámetros.
function fakeEngine() {
  const param = () => ({ values: [], setValueAtTime(v) { this.values.push(v) }, linearRampToValueAtTime(v) { this.values.push(v) }, setTargetAtTime(v) { this.values.push(v) }, cancelScheduledValues() {} })
  const node = () => ({ connect() {}, disconnect() {} })
  const oscillators = []
  const ctx = {
    currentTime: 0,
    createOscillator() {
      const osc = { ...node(), type: 'sine', frequency: param(), started: false, stoppedAt: null, start() { this.started = true }, stop(at) { this.stoppedAt = at } }
      oscillators.push(osc)
      return osc
    },
    createGain: () => ({ ...node(), gain: param() }),
    createBiquadFilter: () => ({ ...node(), type: 'lowpass', frequency: param(), Q: param() }),
  }
  return { engine: { ctx, fx: node() }, oscillators }
}

describe('playCarStart', () => {
  it('suena el motor de arranque y el ralentí que coge', () => {
    const { engine, oscillators } = fakeEngine()
    expect(playCarStart(engine)).toBe(true)
    expect(oscillators).toHaveLength(CAR_START.length)
    expect(oscillators.every((osc) => osc.started)).toBe(true)
  })

  it('sin motor de audio no hace nada', () => {
    expect(playCarStart(null)).toBe(false)
  })

  it('es grave, como un motor, y dura menos de un segundo y medio', () => {
    CAR_START.forEach((note) => expect(note.freq).toBeLessThan(400))
    expect(Math.max(...CAR_START.map((note) => note.at + note.length))).toBeLessThan(1.5)
  })
})

describe('startCarEngine', () => {
  it('el tono sube al acelerar y se apaga al parar', () => {
    const { engine, oscillators } = fakeEngine()
    const motor = startCarEngine(engine)
    expect(oscillators.length).toBeGreaterThan(0)
    expect(oscillators.every((osc) => osc.started)).toBe(true)
    const [first] = oscillators
    motor.setThrottle(0)
    const idle = first.frequency.values.at(-1)
    motor.setThrottle(1)
    expect(first.frequency.values.at(-1)).toBeGreaterThan(idle)
    motor.stop()
    expect(oscillators.every((osc) => osc.stoppedAt !== null)).toBe(true)
  })

  it('sin motor de audio devuelve un mando que no hace nada', () => {
    const motor = startCarEngine(null)
    expect(() => {
      motor.setThrottle(1)
      motor.stop()
    }).not.toThrow()
  })
})
