import { describe, expect, it } from 'vitest'
import { DIALOGUE_COPY, lineText, optionText } from '../../lib/dialogueCopy.js'
import { blipFrequency, isSpoken } from '../../lib/dialogueSound.js'
import { advance, choose, openNode, revealCount, view } from './engine.js'
import { FEATURES, SCRIPTS, TALKS, talkFor } from './scripts.js'

describe('motor de diálogos', () => {
  const scripts = {
    a: { pages: [{ who: 'x', text: 'a.1' }, { who: 'y', text: 'a.2' }], options: [{ id: 'go', label: 'l', to: 'b' }, { id: 'hidden', label: 'h', when: 'extra', action: 'extra' }, { id: 'bye', label: 'b', close: true }] },
    b: { pages: [{ who: 'x', text: 'b.1' }], action: 'open' },
  }

  it('muestra una página cada vez y las opciones solo en la última', () => {
    const first = view(scripts, openNode('a'))
    expect(first.page.text).toBe('a.1')
    expect(first.options).toEqual([])
    const last = view(scripts, advance(scripts, openNode('a')).state)
    expect(last.page.text).toBe('a.2')
    expect(last.options.map((o) => o.id)).toEqual(['go', 'bye'])
  })

  it('oculta las opciones cuyo recurso no está activo y las muestra al activarlo', () => {
    const state = { id: 'a', index: 1 }
    expect(view(scripts, state, {}).options.some((o) => o.id === 'hidden')).toBe(false)
    expect(view(scripts, state, { extra: true }).options.some((o) => o.id === 'hidden')).toBe(true)
    // Una opción oculta no se puede elegir aunque se pida por su id.
    expect(choose(scripts, state, 'hidden', {}).state).toEqual(state)
  })

  it('con opciones no avanza solo: hay que elegir; sin ellas, acaba y devuelve la acción', () => {
    expect(advance(scripts, { id: 'a', index: 1 }).state).toEqual({ id: 'a', index: 1 })
    expect(advance(scripts, { id: 'b', index: 0 })).toEqual({ state: null, done: true, action: 'open' })
  })

  it('una opción lleva a otro nodo, cierra o dispara una acción', () => {
    expect(choose(scripts, { id: 'a', index: 1 }, 'go').state).toEqual({ id: 'b', index: 0 })
    expect(choose(scripts, { id: 'a', index: 1 }, 'bye')).toMatchObject({ state: null, done: true })
    expect(choose(scripts, { id: 'a', index: 1 }, 'hidden', { extra: true })).toMatchObject({ done: true, action: 'extra' })
  })

  it('no se puede elegir antes de llegar a la última página', () => {
    expect(choose(scripts, { id: 'a', index: 0 }, 'go').state).toEqual({ id: 'a', index: 0 })
  })

  it('la escritura progresiva avanza con el tiempo y con 0 caracteres por segundo se ve entera', () => {
    expect(revealCount('hola', 0, 40)).toBe(0)
    expect(revealCount('hola', 50, 40)).toBe(2)
    expect(revealCount('hola', 5000, 40)).toBe(4)
    expect(revealCount('hola', 10, 0)).toBe(4)
  })
})

describe('guiones de la casa', () => {
  const pages = Object.entries(SCRIPTS).flatMap(([id, node]) => node.pages.map((page) => ({ id, ...page })))
  const options = Object.entries(SCRIPTS).flatMap(([id, node]) => (node.options ?? []).map((option) => ({ id, ...option })))

  it('están los diálogos que pide el guion', () => {
    ;['casa.entrada', 'casa.atreus_setup', 'casa.atreus_perifericos', 'casa.atreus_repeticion', 'casa.khalessi', 'casa.khalessi_reposo', 'casa.television', 'maker.presentacion', 'consolas.presentacion', 'pc.abrir'].forEach((id) => {
      expect(SCRIPTS[id], id).toBeTruthy()
    })
  })

  it('cada página tiene su texto en español e inglés', () => {
    pages.forEach(({ id, text }) => {
      expect(DIALOGUE_COPY.es.lines[text], `${id}: ${text} (es)`).toBeTruthy()
      expect(DIALOGUE_COPY.en.lines[text], `${id}: ${text} (en)`).toBeTruthy()
    })
  })

  it('cada opción tiene su etiqueta en los dos idiomas y lleva a un nodo que existe', () => {
    options.forEach(({ id, label, to }) => {
      expect(DIALOGUE_COPY.es.options[label], `${id}: ${label} (es)`).toBeTruthy()
      expect(DIALOGUE_COPY.en.options[label], `${id}: ${label} (en)`).toBeTruthy()
      if (to) expect(SCRIPTS[to], `${id} -> ${to}`).toBeTruthy()
    })
  })

  it('quien habla es Atreus, Lupe o Khalessi, y tiene nombre en los dos idiomas', () => {
    pages.forEach(({ who }) => {
      expect(DIALOGUE_COPY.es.speakers[who], who).toBeTruthy()
      expect(DIALOGUE_COPY.en.speakers[who], who).toBeTruthy()
    })
  })

  it('las opciones con recurso pendiente no se ofrecen mientras no esté activo', () => {
    const pending = options.filter((option) => option.when && option.when in FEATURES)
    expect(pending.length).toBeGreaterThan(0)
    pending.forEach(({ when }) => expect(FEATURES[when]).toBe(false))
    // Con la galería sin activar, "Ver trabajos" no sale en ninguna página de la impresora.
    Object.keys(SCRIPTS)
      .filter((id) => id.startsWith('maker.'))
      .forEach((id) => {
        const node = SCRIPTS[id]
        const shown = view(SCRIPTS, { id, index: node.pages.length - 1 }, FEATURES).options
        expect(shown.some((option) => option.id === 'trabajos'), id).toBe(false)
      })
  })

  it('todo diálogo con opciones ofrece una forma de cerrar o seguir', () => {
    Object.entries(SCRIPTS).forEach(([id, node]) => {
      if (node.options) expect(node.options.some((option) => option.close || option.to || option.action), id).toBe(true)
    })
  })

  it('texto del guion: usa las frases documentadas y el español de reserva', () => {
    expect(lineText('es', 'casa.entrada.1')).toContain('Yo soy Atreus')
    expect(lineText('xx', 'casa.khalessi.1')).toBe('meaw!')
    expect(optionText('en', 'casa.opt.setup')).toBe('The gaming room')
    expect(DIALOGUE_COPY.es.lines['consolas.nintendo.1']).toContain('Nintendo 64, Game Boy Color, Nintendo 3DS, Wii, GameCube y Nintendo Switch')
    expect(DIALOGUE_COPY.es.lines['consolas.playstation.1']).toContain('PlayStation 1, 2, 3 y 4')
    expect(DIALOGUE_COPY.es.lines['consolas.otras.1']).toBe('Y también tenemos una Xbox.')
    expect(DIALOGUE_COPY.es.lines['consolas.playstation.1']).toContain('PlayStation 1, 2, 3 y 4')
  })
})

describe('qué conversación abre cada cosa', () => {
  it('Atreus se presenta la primera vez y repite después, sin quitar las opciones', () => {
    expect(talkFor('atreus', new Set())).toBe('casa.entrada')
    expect(talkFor('atreus', new Set(['casa.entrada']))).toBe('casa.atreus_repeticion')
    const options = view(SCRIPTS, { id: 'casa.atreus_repeticion', index: 0 }).options.map((option) => option.id)
    expect(options).toEqual(['setup', 'perifericos', 'seguir'])
  })

  it('la impresora y las consolas repiten tras la primera visita', () => {
    expect(talkFor('printer', new Set())).toBe('maker.presentacion')
    expect(talkFor('printer', new Set(['maker.presentacion']))).toBe('maker.repeticion')
    expect(talkFor('shelf', new Set(['consolas.presentacion']))).toBe('consolas.repeticion')
  })

  it('Khalessi alterna el maullido y el descanso', () => {
    expect([0, 1, 2, 3].map((visits) => talkFor('khalessi', new Set(), visits))).toEqual(['casa.khalessi', 'casa.khalessi_reposo', 'casa.khalessi', 'casa.khalessi_reposo'])
  })

  it('una interacción desconocida no abre nada y todas las conocidas apuntan a un guion', () => {
    expect(talkFor('nada', new Set())).toBe(null)
    Object.values(TALKS).forEach((talk) => {
      expect(SCRIPTS[talk.first]).toBeTruthy()
      if (talk.again) expect(SCRIPTS[talk.again]).toBeTruthy()
      if (talk.rest) expect(SCRIPTS[talk.rest]).toBeTruthy()
    })
  })
})

describe('voz', () => {
  it('solo suenan letras y números, y cada letra siempre da la misma nota', () => {
    expect(isSpoken('a')).toBe(true)
    expect(isSpoken('ñ')).toBe(true)
    expect(isSpoken(' ')).toBe(false)
    expect(isSpoken('¡')).toBe(false)
    expect(blipFrequency('lupe', 'a')).toBe(blipFrequency('lupe', 'a'))
  })

  it('la voz de Lupe es más aguda que la de Atreus', () => {
    expect(blipFrequency('lupe', 'a')).toBeGreaterThan(blipFrequency('atreus', 'a'))
  })
})

describe('estantería: primeros recuerdos y recreativa', () => {
  it('la opción lleva a dos páginas de Lupe con las frases del guion, y no se inventa ningún otro recuerdo', () => {
    const talk = SCRIPTS['consolas.recuerdos']
    expect(talk.pages.map((page) => page.who)).toEqual(['lupe', 'lupe'])
    expect(DIALOGUE_COPY.es.lines['consolas.recuerdos.1']).toBe('La primera consola a la que jugué fue una Atari 2600. Todavía recuerdo juegos como Megamania y River Raid II.')
    expect(DIALOGUE_COPY.es.lines['consolas.recuerdos.2']).toBe('De hecho, si te apetece probar algo parecido, tenemos una recreativa en casa. Acércate y echa una partida.')
    expect(DIALOGUE_COPY.en.lines['consolas.recuerdos.1']).toContain('Atari 2600')
  })

  it('se puede elegir desde todas las páginas de la estantería, que mantienen sus opciones', () => {
    ;['consolas.presentacion', 'consolas.nintendo', 'consolas.playstation', 'consolas.otras', 'consolas.recuerdos', 'consolas.repeticion'].forEach((id) => {
      expect(SCRIPTS[id].options.map((option) => option.id), id).toEqual(['nintendo', 'playstation', 'otras', 'recuerdos', 'volver'])
    })
    expect(SCRIPTS['consolas.presentacion'].options.find((option) => option.id === 'recuerdos').to).toBe('consolas.recuerdos')
  })
})
