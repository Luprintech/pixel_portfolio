import { describe, expect, it } from 'vitest'
import { TOUR_STOPS, completeStop, initialStory, newTalkFor, nextStop, reachNode, recoverStory, sanitizeStory, setTour, storyFeatures, tourOffered, tourStarted } from './story.js'

describe('memoria de la historia', () => {
  it('una partida nueva empieza con la bienvenida pendiente y sin visita', () => {
    expect(initialStory()).toEqual({ welcome: 'pending', tour: 'none', stops: [], heard: [], explained: [] })
  })

  it('solo acepta lo que tiene forma de historia', () => {
    expect(sanitizeStory(null)).toBeNull()
    expect(sanitizeStory('x')).toBeNull()
    expect(sanitizeStory({ welcome: 'otra', tour: 'flotando', heard: 'no', explained: [3, 'ok', '<b>'] })).toEqual({ welcome: 'pending', tour: 'none', stops: [], heard: [], explained: ['ok'] })
    expect(sanitizeStory({ welcome: 'done', tour: 'completed', heard: ['a.b', 'a.b'], explained: [] })).toEqual({ welcome: 'done', tour: 'completed', stops: TOUR_STOPS, heard: ['a.b'], explained: [] })
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

  it('las paradas guardadas solo valen en orden y sin huecos; una visita completada las tiene todas', () => {
    expect(sanitizeStory({ stops: ['entrada', 'impresoras'] }).stops).toEqual(['entrada', 'impresoras'])
    expect(sanitizeStory({ stops: ['impresoras', 'entrada'] }).stops).toEqual(['entrada', 'impresoras'])
    expect(sanitizeStory({ stops: ['entrada', 'pc'] }).stops).toEqual(['entrada', 'pc'])
    expect(sanitizeStory({ stops: ['atreus', 'volar', 'atreus'] }).stops).toEqual(['atreus'])
    expect(sanitizeStory({ stops: 'no' }).stops).toEqual([])
    // Las partidas de antes de las paradas ya tenían la visita completada.
    expect(sanitizeStory({ tour: 'completed' }).stops).toEqual(TOUR_STOPS)
  })

  it('completa las paradas una a una y la última completa la visita; una repetida o desconocida no hace nada', () => {
    let story = { ...initialStory(), tour: 'accepted' }
    expect(nextStop(story)).toBe('entrada')
    expect(completeStop(story, 'volar')).toBe(story)
    TOUR_STOPS.slice(0, -1).forEach((id) => {
      story = completeStop(story, id)
      expect(story.tour).toBe('accepted')
    })
    expect(nextStop(story)).toBe('cierre')
    story = completeStop(story, 'cierre')
    expect(story.tour).toBe('completed')
    expect(nextStop(story)).toBeNull()
    expect(completeStop(story, 'cierre')).toBe(story)
  })

  it('una parada pedida antes de tiempo cuenta y la visita sigue por la primera que falta', () => {
    let story = { ...initialStory(), tour: 'accepted' }
    story = completeStop(story, 'atreus')
    expect(story.stops).toEqual(['atreus'])
    expect(nextStop(story)).toBe('entrada')
    story = completeStop(completeStop(story, 'entrada'), 'impresoras')
    expect(story.stops).toEqual(['entrada', 'impresoras', 'atreus'])
    expect(nextStop(story)).toBe('pc')
    expect(completeStop(story, 'atreus')).toBe(story)
  })

  it('con paradas hechas y la visita sin terminar se ofrece retomarla, no empezar otra', () => {
    const partial = completeStop({ ...initialStory(), tour: 'pending' }, 'entrada')
    expect(tourStarted(partial)).toBe(true)
    expect(storyFeatures(partial)).toMatchObject({ offerTour: false, offerResume: true })
    expect(storyFeatures(initialStory())).toMatchObject({ offerTour: true, offerResume: false })
    expect(storyFeatures({ ...partial, tour: 'completed' })).toMatchObject({ offerTour: false, offerResume: false })
  })
})

describe('entrar por la azotea', () => {
  it('Lupe recibe a quien no ha hecho ni rechazado la visita', async () => {
    const { tourOnRoofEntry } = await import('./story.js')
    expect(tourOnRoofEntry({ tour: 'none' })).toBe(true)
    expect(tourOnRoofEntry({ tour: 'pending' })).toBe(true)
    expect(tourOnRoofEntry({ tour: 'cancelled' })).toBe(false)
    expect(tourOnRoofEntry({ tour: 'completed' })).toBe(false)
  })
})

describe('siguiente parada tras una pedida antes de tiempo', () => {
  it('sigue por la que viene detrás y deja el cierre para el final', () => {
    const base = { ...initialStory(), tour: 'accepted' }
    const atreus = completeStop(base, 'atreus')
    expect(nextStop(atreus, 'atreus')).toBe('pc')
    const late = completeStop(completeStop(completeStop(atreus, 'pc'), 'khalessi'), 'impresoras')
    expect(nextStop(late, 'impresoras')).toBe('entrada')
    expect(nextStop(completeStop(late, 'entrada'), 'entrada')).toBe('cierre')
  })
})
