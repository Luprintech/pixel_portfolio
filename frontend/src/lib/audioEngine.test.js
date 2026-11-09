import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Un AudioContext de mentira: apunta lo que se le pide para comprobar el cableado sin audio real.
function installFakeAudio() {
  const made = []
  const node = () => ({ connect: vi.fn(), disconnect: vi.fn() })
  class FakeContext {
    constructor() {
      this.state = 'suspended'
      this.currentTime = 0
      this.destination = node()
      this.resume = vi.fn(() => {
        this.state = 'running'
        return Promise.resolve()
      })
      made.push(this)
    }

    createGain() {
      return {
        ...node(),
        gain: { value: 1, cancelScheduledValues: vi.fn(), setValueAtTime: vi.fn(), setTargetAtTime(value) { this.value = value } },
      }
    }

    createBuffer() {
      return {}
    }

    createBufferSource() {
      return { ...node(), start: vi.fn(), stop: vi.fn(), playbackRate: { value: 1 } }
    }

    decodeAudioData(_data, resolve) {
      resolve({ decoded: true })
    }
  }
  vi.stubGlobal('AudioContext', FakeContext)
  return made
}

const touch = (name = 'touchend') => document.dispatchEvent(new Event(name, { bubbles: true }))

describe('motor de audio', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('no crea el contexto hasta el primer gesto, y con un toque en iPhone ya vale', async () => {
    const made = installFakeAudio()
    const { getEngine, onEngineGesture } = await import('./audioEngine')
    const heard = vi.fn()
    onEngineGesture(heard)
    expect(getEngine()).toBeNull()
    expect(made).toHaveLength(0)
    touch('touchend')
    expect(getEngine()).not.toBeNull()
    expect(made).toHaveLength(1)
    expect(made[0].resume).toHaveBeenCalled()
    expect(heard).toHaveBeenCalledTimes(1)
  })

  it('cualquier gesto (toque, clic, puntero o tecla) desbloquea el audio y solo hay un contexto', async () => {
    const made = installFakeAudio()
    const { onEngineGesture } = await import('./audioEngine')
    onEngineGesture(() => {})
    ;['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'].forEach((name) => touch(name))
    expect(made).toHaveLength(1)
  })

  it('música y efectos pasan por un nodo general que lleva el volumen general y el silencio', async () => {
    const made = installFakeAudio()
    const { getEngine, onEngineGesture } = await import('./audioEngine')
    const { updateSoundPrefs } = await import('./soundMixer')
    onEngineGesture(() => {})
    touch()
    const { master, music, fx } = getEngine()
    // Todo desemboca en el nodo general y solo él llega a la salida.
    expect(music.connect).toHaveBeenCalledWith(master)
    expect(fx.connect).toHaveBeenCalledWith(master)
    expect(master.connect).toHaveBeenCalledWith(made[0].destination)
    expect(music.connect).not.toHaveBeenCalledWith(made[0].destination)
    expect(fx.connect).not.toHaveBeenCalledWith(made[0].destination)

    updateSoundPrefs({ master: 0.5, music: 0.8, fx: 0.4, muted: false })
    expect(master.gain.value).toBeCloseTo(0.5)
    expect(music.gain.value).toBeCloseTo(0.8)
    expect(fx.gain.value).toBeCloseTo(0.4)
    // Mover el general no toca los canales: lo que cambia es el nodo común.
    updateSoundPrefs({ master: 0.2 })
    expect(master.gain.value).toBeCloseTo(0.2)
    expect(music.gain.value).toBeCloseTo(0.8)
    updateSoundPrefs({ muted: true })
    expect(master.gain.value).toBe(0)
    updateSoundPrefs({ muted: false })
    expect(master.gain.value).toBeCloseTo(0.2)
  })

  it('al ajustar un volumen se borra lo que hubiera programado, para que un fundido a medias no lo pise', async () => {
    installFakeAudio()
    const { getEngine, onEngineGesture, refreshLevels } = await import('./audioEngine')
    onEngineGesture(() => {})
    touch()
    const { master, music, fx } = getEngine()
    ;[master, music, fx].forEach((node) => node.gain.cancelScheduledValues.mockClear())
    refreshLevels()
    ;[master, music, fx].forEach((node) => expect(node.gain.cancelScheduledValues).toHaveBeenCalledTimes(1))
  })

  it('sin Web Audio no hay motor y nada falla', async () => {
    vi.stubGlobal('AudioContext', undefined)
    vi.stubGlobal('webkitAudioContext', undefined)
    const { getEngine, onEngineGesture } = await import('./audioEngine')
    const heard = vi.fn()
    onEngineGesture(heard)
    touch()
    expect(getEngine()).toBeNull()
    expect(heard).toHaveBeenCalled()
  })

  it('las mascotas suenan por el bus de efectos, con la velocidad de su raza', async () => {
    installFakeAudio()
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) })))
    const { getEngine, onEngineGesture } = await import('./audioEngine')
    const { playPetSound } = await import('./petSounds')
    onEngineGesture(() => {})
    touch()
    const engine = getEngine()
    const sources = []
    const create = engine.ctx.createBufferSource.bind(engine.ctx)
    engine.ctx.createBufferSource = () => {
      const source = create()
      sources.push(source)
      return source
    }
    expect(await playPetSound('perro', 'teckel')).toBe(true)
    expect(sources[0].playbackRate.value).toBe(1.2)
    expect(sources[0].start).toHaveBeenCalled()
    // Una segunda vez corta la primera y empieza de nuevo.
    await playPetSound('perro', 'teckel')
    expect(sources[0].stop).toHaveBeenCalled()
    expect(sources).toHaveLength(2)
  })
})
