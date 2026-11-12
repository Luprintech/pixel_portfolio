import { describe, expect, it } from 'vitest'
import { COPY } from '../lib/valleCopy.js'
import { SPOTS_COPY } from '../lib/valleSpotsCopy.js'
import { SCRIPTS } from './dialogue/scripts.js'
import { FRUIT_KINDS, FRUIT_NAMES, FRUIT_STATES, fruitSeasonOf, fruitTalkId, isFruitTree } from './fruitTrees.js'

describe('frutales por estaciones', () => {
  // Los dibujos no se prueban aquí: jsdom no tiene lienzo 2D. Se miran en el navegador (ver `docs/ESTADO.md`).
  it('hay un estado por estación del valle y la estación sale del cielo', () => {
    expect(FRUIT_STATES).toEqual(['spring', 'autumn', 'winter'])
    FRUIT_KINDS.forEach((kind) => expect(isFruitTree(kind)).toBe(true))
    expect(isFruitTree('bench')).toBe(false)
    expect(fruitSeasonOf({ autumn: 0, winter: 0 })).toBe('spring')
    expect(fruitSeasonOf({ autumn: 0.8, winter: 0 })).toBe('autumn')
    expect(fruitSeasonOf({ autumn: 0, winter: 0.9 })).toBe('winter')
    expect(fruitSeasonOf({ autumn: 0.2, winter: 0.5 })).toBe('winter')
    expect(fruitSeasonOf(null)).toBe('spring')
  })

  it('mirar un frutal abre una conversación que existe en las tres estaciones y en los dos idiomas', () => {
    Object.values(FRUIT_NAMES).forEach((name) => {
      FRUIT_STATES.forEach((season) => {
        const id = `valle.${name}.${season}`
        const sky = { spring: {}, autumn: { autumn: 1 }, winter: { winter: 1 } }[season]
        expect(fruitTalkId(name, sky)).toBe(id)
        const script = SCRIPTS[id]
        expect(script, id).toBeTruthy()
        script.pages.forEach((page) => {
          ;['es', 'en'].forEach((lang) => expect(SPOTS_COPY[lang].lines[page.text], `${page.text} ${lang}`).toBeTruthy())
        })
      })
    })
  })

  it('las etiquetas del botón existen en los dos idiomas', () => {
    ;['es', 'en'].forEach((lang) => {
      Object.values(FRUIT_NAMES).forEach((name) => expect(COPY[lang].hud.actions[`tree:${name}`], `${name} ${lang}`).toBeTruthy())
    })
  })
})
