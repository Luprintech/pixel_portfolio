import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UI_SOUNDS, playUiSound, uiSoundFor } from './uiSounds'

function element(html) {
  const holder = document.createElement('div')
  holder.innerHTML = html
  return holder.firstElementChild
}

describe('uiSoundFor', () => {
  it('el botón principal confirma y el secundario y los enlaces solo seleccionan', () => {
    expect(uiSoundFor(element('<button class="px-btn">Empezar</button>'))).toBe('confirm')
    expect(uiSoundFor(element('<button class="px-btn px-btn--bone">Opciones</button>'))).toBe('select')
    expect(uiSoundFor(element('<a class="px-link" href="/cv">CV</a>'))).toBe('select')
  })

  it('las pestañas y los interruptores tienen su propio sonido', () => {
    expect(uiSoundFor(element('<button role="tab" class="px-btn">Cuerpo</button>'))).toBe('tab')
    expect(uiSoundFor(element('<button aria-pressed="false" class="px-pick">Gorro</button>'))).toBe('pick')
  })

  it('data-sound manda sobre lo demás y "off" calla el botón', () => {
    expect(uiSoundFor(element('<a class="px-btn" data-sound="back">Volver</a>'))).toBe('back')
    expect(uiSoundFor(element('<button class="px-btn" data-sound="off">Mudo</button>'))).toBeNull()
  })

  it('no suena nada en botones deshabilitados ni en elementos ajenos al juego', () => {
    expect(uiSoundFor(element('<button class="px-btn" disabled>No</button>'))).toBeNull()
    expect(uiSoundFor(element('<button class="px-btn" aria-disabled="true">No</button>'))).toBeNull()
    expect(uiSoundFor(element('<button class="otra-cosa">Hola</button>'))).toBeNull()
    expect(uiSoundFor(null)).toBeNull()
  })
})

describe('UI_SOUNDS', () => {
  it('cada nota tiene frecuencia, duración y volumen razonables', () => {
    Object.values(UI_SOUNDS).flat().forEach((note) => {
      expect(['square', 'triangle']).toContain(note.type)
      expect(note.freq).toBeGreaterThan(100)
      expect(note.length).toBeGreaterThan(0)
      expect(note.volume).toBeLessThanOrEqual(0.35)
    })
  })
})

describe('playUiSound', () => {
  let engine
  beforeEach(() => {
    vi.spyOn(performance, 'now').mockReturnValue(10_000)
    const param = () => ({ setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() })
    engine = {
      fx: {},
      ctx: {
        currentTime: 1,
        createOscillator: vi.fn(() => ({ frequency: param(), connect: vi.fn(), start: vi.fn(), stop: vi.fn() })),
        createGain: vi.fn(() => ({ gain: param(), connect: vi.fn() })),
      },
    }
  })

  it('programa una voz por nota y las manda al bus de efectos', () => {
    expect(playUiSound('confirm', engine)).toBe(true)
    expect(engine.ctx.createOscillator).toHaveBeenCalledTimes(UI_SOUNDS.confirm.length)
    expect(engine.ctx.createGain.mock.results[0].value.connect).toHaveBeenCalledWith(engine.fx)
  })

  it('ignora un sonido desconocido, la falta de motor y una repetición inmediata', () => {
    expect(playUiSound('nada', engine)).toBe(false)
    expect(playUiSound('select', null)).toBe(false)
    performance.now.mockReturnValue(20_000)
    expect(playUiSound('select', engine)).toBe(true)
    performance.now.mockReturnValue(20_010)
    expect(playUiSound('select', engine)).toBe(false)
  })
})
