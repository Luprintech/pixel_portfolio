import { describe, expect, it } from 'vitest'
import { initialStory, newTalkFor, reachNode, recoverStory, sanitizeStory, setTour, storyFeatures, tourOffered } from './story.js'

describe('memoria de la historia', () => {
  it('una partida nueva empieza con la bienvenida pendiente y sin visita', () => {
    expect(initialStory()).toEqual({ welcome: 'pending', tour: 'none', heard: [], explained: [] })
  })

  it('solo acepta lo que tiene forma de historia', () => {
    expect(sanitizeStory(null)).toBeNull()
    expect(sanitizeStory('x')).toBeNull()
    expect(sanitizeStory({ welcome: 'otra', tour: 'flotando', heard: 'no', explained: [3, 'ok', '<b>'] })).toEqual({ welcome: 'pending', tour: 'none', heard: [], explained: ['ok'] })
    expect(sanitizeStory({ welcome: 'done', tour: 'completed', heard: ['a.b', 'a.b'], explained: [] })).toEqual({ welcome: 'done', tour: 'completed', heard: ['a.b'], explained: [] })
  })

  it('acota la lista de conversaciones', () => {
    const heard = Array.from({ length: 500 }, (_, i) => `n${i}`)
    expect(sanitizeStory({ heard }).heard.length).toBeLessThanOrEqual(200)
  })

  it('una visita en curso se recupera como pendiente y el resto no cambia', () => {
    const story = { ...initialStory(), welcome: 'done', tour: 'accepted' }
    expect(recoverStory(story).tour).toBe('pending')
    ;['none', 'pending', 'completed', 'cancelled'].forEach((tour) => {
      const same = { ...story, tour }
      expect(recoverStory(same)).toBe(same)
    })
  })

  it('abrir un diálogo lo marca como escuchado, pero la bienvenida solo se completa al llegar a su última página', () => {
    const opened = reachNode(initialStory(), 'inicio.bienvenida')
    expect(opened.heard).toEqual(['inicio.bienvenida'])
    expect(opened.welcome).toBe('pending')
    expect(reachNode(opened, 'inicio.bienvenida', true).welcome).toBe('done')
  })

  it('una pregunta contestada no se vuelve a ofrecer, y la repetición no duplica nada', () => {
    let story = reachNode(initialStory(), 'inicio.dedicas', true)
    story = reachNode(story, 'inicio.dedicas', true)
    expect(story.explained).toEqual(['dedicas'])
    expect(story.heard).toEqual(['inicio.dedicas'])
    expect(storyFeatures(story)).toMatchObject({ offerDedicas: false, offerEncontrar: true })
    expect(reachNode(initialStory(), 'inicio.dedicas').explained).toEqual([])
  })

  it('la exclamación de Lupe sale hasta que escucha su conversación nueva y no vuelve', () => {
    expect(newTalkFor('lupe', initialStory())).toBe('inicio.bienvenida')
    expect(newTalkFor('lupe', reachNode(initialStory(), 'inicio.bienvenida'))).toBeNull()
    expect(newTalkFor('desconocido', initialStory())).toBeNull()
  })

  it('la visita se ofrece mientras no esté hecha ni en marcha', () => {
    const offered = ['none', 'pending', 'accepted', 'completed', 'cancelled'].filter((tour) => tourOffered(setTour(initialStory(), tour)))
    expect(offered).toEqual(['none', 'pending', 'cancelled'])
  })

  it('cambiar a la misma visita devuelve el mismo objeto', () => {
    const story = initialStory()
    expect(setTour(story, 'none')).toBe(story)
  })
})
