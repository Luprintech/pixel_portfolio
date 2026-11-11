import { describe, expect, it } from 'vitest'
import { fillPlayer, lineText } from '../lib/dialogueCopy.js'
import { advance, choose, openNode, view } from './dialogue/engine.js'
import { SCRIPTS } from './dialogue/scripts.js'
import { isReadyToEnter, missingNames, playerFeatures } from './player.js'

const NO_PET = { kind: 'ninguna', breed: null, coat: null, marks: null }
const dog = { ...NO_PET, kind: 'perro', breed: 'corgi' }
const cat = { ...NO_PET, kind: 'gato', breed: 'comun' }

describe('entrar al valle', () => {
  it('pide el nombre, y el de la mascota solo si hay mascota', () => {
    expect(missingNames({ name: '', pet: NO_PET, petName: '' })).toEqual({ name: true, petName: false })
    expect(missingNames({ name: 'Ana', pet: dog, petName: '' })).toEqual({ name: false, petName: true })
    expect(isReadyToEnter({ name: 'Ana', pet: NO_PET, petName: '' })).toBe(true)
    expect(isReadyToEnter({ name: 'Ana', pet: cat, petName: 'Miau' })).toBe(true)
  })

  it('un nombre de solo espacios o símbolos no vale', () => {
    expect(isReadyToEnter({ name: '   ', pet: NO_PET, petName: '' })).toBe(false)
    expect(isReadyToEnter({ name: '!!!', pet: NO_PET, petName: '' })).toBe(false)
  })
})

describe('mascota en los diálogos', () => {
  it('solo activa el perro o el gato si tiene nombre', () => {
    expect(playerFeatures({ pet: dog, petName: 'Rex' })).toEqual({ petDog: true, petCat: false })
    expect(playerFeatures({ pet: cat, petName: 'Miau' })).toEqual({ petDog: false, petCat: true })
    expect(playerFeatures({ pet: cat, petName: '' })).toEqual({ petDog: false, petCat: false })
    expect(playerFeatures({ pet: NO_PET, petName: 'Rex' })).toEqual({ petDog: false, petCat: false })
  })

  const welcomePages = (features) => {
    const keys = []
    let state = openNode('inicio.bienvenida')
    for (;;) {
      const { page, last } = view(SCRIPTS, state, features)
      keys.push(page.text)
      if (last) return keys
      state = advance(SCRIPTS, state, features).state
    }
  }

  it('la bienvenida añade las páginas de la mascota y no las demás', () => {
    expect(welcomePages({})).toHaveLength(6)
    expect(welcomePages({ petDog: true }).filter((key) => key.includes('perro'))).toHaveLength(2)
    expect(welcomePages({ petCat: true }).filter((key) => key.includes('gato'))).toHaveLength(2)
    expect(welcomePages({ petCat: true })).toHaveLength(8)
  })

  it('las opciones solo salen en la última página visible', () => {
    const features = { petDog: true }
    let state = openNode('inicio.bienvenida')
    for (let i = 0; i < 7; i++) state = advance(SCRIPTS, state, features).state
    expect(view(SCRIPTS, state, features).options).toHaveLength(4)
    expect(choose(SCRIPTS, { id: 'inicio.bienvenida', index: 1 }, 'casa', features).state.index).toBe(1)
  })
})

describe('nombre en los textos', () => {
  it('sustituye el nombre de la viajera y el de la mascota', () => {
    expect(lineText('es', 'inicio.bienvenida.1', false, { name: 'Ana' })).toMatch(/^¡Hola, Ana! Soy Lupe/)
    expect(lineText('es', 'inicio.bienvenida.perro.1', false, { name: 'Ana', petName: 'Rex', breed: 'Corgi' })).toContain('Se llama Rex y es de raza Corgi, ¿verdad?')
    expect(lineText('en', 'inicio.bienvenida.gato.1', false, { petName: 'Miau' })).toContain('Its name is Miau')
  })

  it('sin nombre quita también la coma y la frase sigue entera', () => {
    expect(lineText('es', 'inicio.bienvenida.1', false, {})).toMatch(/^¡Hola! Soy Lupe/)
    expect(lineText('es', 'tour.entrada.1')).toMatch(/^Esta es mi casa, o mejor dicho/)
    expect(lineText('en', 'inicio.regreso.1')).toMatch(/^So good to see you again! /)
  })

  it('un nombre con símbolos de reemplazo se escribe tal cual', () => {
    expect(fillPlayer('Hola, {name}', { name: "O'$&Neil" })).toBe("Hola, O'$&Neil")
  })

  it('ningún texto deja una marca sin rellenar', () => {
    for (const lang of ['es', 'en']) {
      const text = lineText(lang, 'tour.cierre.1', false, { name: 'Ana' })
      expect(text).not.toMatch(/[{}]/)
    }
  })
})

describe('convenciones de las conversaciones', () => {
  it('ninguna línea ni opción usa comillas angulares', async () => {
    const { DIALOGUE_COPY } = await import('../lib/dialogueCopy.js')
    for (const lang of ['es', 'en']) {
      const all = [...Object.values(DIALOGUE_COPY[lang].lines), ...Object.values(DIALOGUE_COPY[lang].options)]
      expect(all.filter((text) => /[«»]/.test(text))).toEqual([])
    }
  })

  it('Lupe no habla de logros al enseñar a imprimir y los explica después', async () => {
    const { DIALOGUE_COPY } = await import('../lib/dialogueCopy.js')
    for (const lang of ['es', 'en']) {
      const lines = DIALOGUE_COPY[lang].lines
      ;[1, 2, 3].forEach((n) => expect(lines[`tour.impresoras_imprimir.${n}`]).not.toMatch(/logro|achievement/i))
      expect(lines['logros.sistema.3']).toMatch(/Opciones|Options/)
    }
  })
})
