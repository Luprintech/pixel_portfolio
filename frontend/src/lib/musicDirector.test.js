import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// El director depende de la pista de fondo, del reproductor de canciones y del sintetizador: se simulan los tres para ver solo
// sus decisiones (qué suena y cuándo, sin que dos pistas coincidan).
const mocks = vi.hoisted(() => {
  const state = { quietCallbacks: [], releases: 0, themes: [], playing: false, listeners: new Set(), gate: null }
  return state
})

vi.mock('./backgroundMusic', () => ({
  holdBackground: (onQuiet) => {
    mocks.quietCallbacks.push(onQuiet)
    return () => {
      mocks.releases += 1
    }
  },
}))
vi.mock('./chiptune', () => ({
  startTheme: (id) => {
    const theme = { id, stopped: false }
    mocks.themes.push(theme)
    return () => {
      theme.stopped = true
    }
  },
}))
vi.mock('./jukebox', () => ({
  jukebox: {
    snapshot: () => ({ playing: mocks.playing }),
    subscribe: (listener) => {
      mocks.listeners.add(listener)
      return () => mocks.listeners.delete(listener)
    },
  },
  setJukeboxGate: (fn) => {
    mocks.gate = fn
  },
}))

const { setActivity, startMusicDirector } = await import('./musicDirector')
const quiet = () => mocks.quietCallbacks.at(-1)()
const live = () => mocks.themes.filter((theme) => !theme.stopped).map((theme) => theme.id)
const jukebox = (playing) => {
  mocks.playing = playing
  mocks.listeners.forEach((listener) => listener({ playing }))
}

describe('director de la música de la casa', () => {
  let stop
  beforeEach(() => {
    vi.useFakeTimers()
    Object.assign(mocks, { quietCallbacks: [], releases: 0, themes: [], playing: false })
    stop = startMusicDirector()
  })
  afterEach(() => {
    stop()
    vi.useRealTimers()
  })

  it('sin actividad no toca nada: la pista de fondo sigue sola', () => {
    expect(mocks.quietCallbacks).toHaveLength(0)
    expect(live()).toEqual([])
  })

  it('con una actividad calla la de fondo y su canción no entra hasta que la de fondo ha callado', () => {
    setActivity('pc')
    expect(mocks.quietCallbacks).toHaveLength(1)
    expect(mocks.themes).toHaveLength(0)
    quiet()
    expect(live()).toEqual(['pc'])
  })

  it('al cerrar la actividad su canción se para y la de fondo vuelve (sin solaparse con ella)', () => {
    setActivity('adventure')
    quiet()
    setActivity(null)
    expect(live()).toEqual([])
    expect(mocks.releases).toBe(0)
    vi.advanceTimersByTime(200)
    expect(mocks.releases).toBe(1)
  })

  it('si se cierra antes de que la de fondo haya callado, nunca llega a sonar la de la actividad', () => {
    setActivity('pc')
    setActivity(null)
    expect(mocks.releases).toBe(1)
    quiet()
    expect(mocks.themes).toHaveLength(0)
  })

  it('con la minicadena sonando manda ella: la canción de la actividad se pausa y vuelve al apagarla', () => {
    setActivity('pc')
    quiet()
    jukebox(true)
    expect(live()).toEqual([])
    expect(mocks.releases).toBe(0)
    jukebox(false)
    expect(live()).toEqual(['pc'])
  })

  it('la minicadena sola también calla la pista de fondo y la devuelve al pararse', () => {
    jukebox(true)
    expect(mocks.quietCallbacks).toHaveLength(1)
    jukebox(false)
    expect(mocks.releases).toBe(1)
  })

  it('el reproductor espera a que la pista de fondo haya callado para arrancar', () => {
    jukebox(true)
    const start = vi.fn()
    mocks.gate(start)
    expect(start).not.toHaveBeenCalled()
    quiet()
    expect(start).toHaveBeenCalledTimes(1)
    mocks.gate(start)
    expect(start).toHaveBeenCalledTimes(2)
  })

  it('en la recreativa, pasar del selector a un juego y volver cambia de canción sin devolver nunca la pista de fondo', () => {
    setActivity('arcade')
    quiet()
    expect(live()).toEqual(['arcade'])
    ;['galactic', 'arcade', 'river', 'arcade', 'adventure'].forEach((id) => {
      setActivity(id)
      expect(live()).toEqual([id])
      expect(mocks.releases).toBe(0)
    })
    setActivity(null)
    vi.advanceTimersByTime(200)
    expect(live()).toEqual([])
    expect(mocks.releases).toBe(1)
  })

  it('cambiar de una actividad a otra deja una sola canción', () => {
    setActivity('pc')
    quiet()
    setActivity('adventure')
    expect(live()).toEqual(['adventure'])
  })
})
