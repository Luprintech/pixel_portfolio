import { afterEach, describe, expect, it, vi } from 'vitest'
import { PET_BREEDS } from '../game/pet'
import { petSound, playPetSound } from './petSounds'

describe('sonido de las mascotas', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('los gatos usan el maullido y los perros el ladrido, con una velocidad para cada raza', () => {
    PET_BREEDS.gato.forEach((breed) => expect(petSound('gato', breed).src).toBe('/sounds/Maullido%20gato.mp3'))
    PET_BREEDS.perro.forEach((breed) => expect(petSound('perro', breed).src).toBe('/sounds/Ladrido%20perro.mp3'))
  })

  it('las razas pequeñas suenan más agudas que las grandes', () => {
    expect(petSound('perro', 'teckel').rate).toBeGreaterThan(petSound('perro', 'pastor').rate)
    expect(petSound('gato', 'sphynx').rate).toBeGreaterThan(petSound('gato', 'maine').rate)
  })

  it('reproduce la grabación sin corregir el tono y empieza de nuevo si ya sonaba', async () => {
    const made = []
    class FakeAudio {
      constructor(src) {
        this.src = src
        this.paused = false
        made.push(this)
      }
      play() {
        return Promise.resolve()
      }
      pause() {
        this.paused = true
      }
    }
    vi.stubGlobal('Audio', FakeAudio)
    expect(await playPetSound('perro', 'teckel')).toBe(true)
    expect(made[0]).toMatchObject({ src: '/sounds/Ladrido%20perro.mp3', playbackRate: 1.2, preservesPitch: false })
    await playPetSound('perro', 'teckel')
    expect(made[0].paused).toBe(true)
  })

  it('devuelve false si el navegador no puede reproducirlo o no hay mascota', async () => {
    vi.stubGlobal('Audio', class {
      play() {
        return Promise.reject(new Error('bloqueado'))
      }
      pause() {}
    })
    expect(await playPetSound('gato', 'comun')).toBe(false)
    expect(await playPetSound('ninguna', null)).toBe(false)
  })
})
