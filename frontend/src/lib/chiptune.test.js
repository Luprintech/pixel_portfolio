import { describe, expect, it } from 'vitest'
import { songEvents, voiceBeats } from './chiptune'
import { THEMES } from './chiptuneSongs'

describe('música retro de las actividades', () => {
  it('hay una canción para el ordenador y otra para la aventura de la recreativa, distintas entre sí', () => {
    expect(Object.keys(THEMES).sort()).toEqual(['adventure', 'pc'])
    expect(THEMES.pc).not.toBe(THEMES.adventure)
    expect(THEMES.pc.bpm).not.toBe(THEMES.adventure.bpm)
  })

  it('todas las voces de cada canción suman los mismos pulsos, así el bucle cierra sin saltos', () => {
    Object.entries(THEMES).forEach(([id, song]) => {
      song.voices.forEach((voice, i) => expect(voiceBeats(voice), `${id}, voz ${i}`).toBeCloseTo(song.loopBeats, 6))
    })
  })

  it('las notas caen dentro de la vuelta y tienen una frecuencia audible', () => {
    Object.entries(THEMES).forEach(([id, song]) => {
      const { events, length } = songEvents(song)
      expect(length).toBeCloseTo((song.loopBeats * 60) / song.bpm, 6)
      expect(events.length, id).toBeGreaterThan(40)
      events.forEach((event) => {
        expect(event.at, id).toBeGreaterThanOrEqual(0)
        expect(event.at + event.length, id).toBeLessThanOrEqual(length + 1e-6)
        expect(event.freq, id).toBeGreaterThan(20)
        expect(event.volume, id).toBeLessThanOrEqual(0.15)
      })
    })
  })

  it('un silencio no genera nota', () => {
    const song = { bpm: 60, loopBeats: 3, voices: [{ type: 'square', volume: 0.1, notes: [[69, 1], [null, 1], [69, 1]] }] }
    const { events } = songEvents(song)
    expect(events.map((event) => event.at)).toEqual([0, 2])
    expect(events[0].freq).toBeCloseTo(440, 6)
  })
})
