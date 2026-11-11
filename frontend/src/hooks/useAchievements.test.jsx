import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const sound = vi.hoisted(() => vi.fn())
vi.mock('../lib/uiSounds', () => ({ playUiSound: sound }))
vi.mock('../lib/audioEngine', () => ({ getEngine: () => ({ fake: true }), startEngineIfAllowed: () => null }))

const { useAchievements } = await import('./useAchievements')

describe('logros', () => {
  beforeEach(() => {
    localStorage.clear()
    sound.mockClear()
  })

  it('al desbloquear un logro suena el sonido de logro una sola vez, aunque se pida varias', () => {
    const { result } = renderHook(() => useAchievements())
    act(() => {
      result.current.unlock('maker')
      result.current.unlock('maker')
    })
    act(() => result.current.unlock('maker'))
    expect(sound).toHaveBeenCalledTimes(1)
    expect(sound).toHaveBeenCalledWith('achievement', { fake: true })
    expect(result.current.unlocked.has('maker')).toBe(true)
    expect(result.current.toast?.id).toBe('maker')
  })

  it('cada logro distinto suena una vez con el mismo sonido', () => {
    const { result } = renderHook(() => useAchievements())
    act(() => result.current.unlock('maker'))
    act(() => result.current.unlock('retro'))
    expect(sound).toHaveBeenCalledTimes(2)
    expect(sound.mock.calls.every(([name]) => name === 'achievement')).toBe(true)
  })

  it('un logro ya conseguido en otra visita no vuelve a sonar, y uno desconocido tampoco', () => {
    localStorage.setItem('valle-del-bucle:achievements', JSON.stringify(['retro']))
    const { result } = renderHook(() => useAchievements())
    act(() => result.current.unlock('retro'))
    act(() => result.current.unlock('no-existe'))
    expect(sound).not.toHaveBeenCalled()
  })

  it('tras borrar la partida el logro vuelve a poder desbloquearse', () => {
    const { result } = renderHook(() => useAchievements())
    act(() => result.current.unlock('retro'))
    localStorage.clear()
    act(() => result.current.reload())
    act(() => result.current.unlock('retro'))
    expect(sound).toHaveBeenCalledTimes(2)
  })
})
