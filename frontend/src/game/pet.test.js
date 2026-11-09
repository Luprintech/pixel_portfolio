import { describe, expect, it } from 'vitest'
import { DEFAULT_PET, PET_BREEDS, PET_COLORS, PET_KINDS, PET_NAMES, isValidPet, petOfBreed, petOfKind, upgradePet } from './pet'
import { CAT_BREEDS } from './pets/cats'
import { DOG_BREEDS } from './pets/dogs'

const everyPet = () => Object.entries(PET_BREEDS).flatMap(([kind, breeds]) => breeds.map((breed) => petOfBreed(kind, breed)))

describe('mascota', () => {
  it('hay cinco razas de perro y cinco de gato', () => {
    expect(PET_BREEDS.perro).toHaveLength(5)
    expect(PET_BREEDS.gato).toHaveLength(5)
  })

  it('cada raza tiene su dibujo y su nombre en los dos idiomas', () => {
    PET_BREEDS.gato.forEach((id) => expect(CAT_BREEDS[id]).toBeDefined())
    PET_BREEDS.perro.forEach((id) => expect(DOG_BREEDS[id]).toBeDefined())
    ;['es', 'en'].forEach((lang) => {
      PET_KINDS.forEach((kind) => expect(PET_NAMES[lang].kinds[kind]).toBeTruthy())
      Object.entries(PET_BREEDS).forEach(([kind, ids]) => ids.forEach((id) => expect(PET_NAMES[lang][kind][id]).toBeTruthy()))
      Object.keys(PET_COLORS).forEach((role) => PET_COLORS[role].forEach((hex) => expect(PET_NAMES[lang][role][hex]).toBeTruthy()))
    })
  })

  it('los colores de partida de cada raza están en las paletas', () => {
    everyPet().forEach((pet) => expect(isValidPet(pet)).toBe(true))
  })

  it('cada raza tiene su propio tamaño de lienzo dentro de su especie', () => {
    const sizes = (breeds) => Object.values(breeds).map(({ spec }) => `${spec.w}x${spec.h}`)
    expect(new Set(sizes(DOG_BREEDS)).size).toBeGreaterThanOrEqual(4)
    expect(new Set(sizes(CAT_BREEDS)).size).toBeGreaterThanOrEqual(4)
  })

  it('el pastor es el perro más alto y el teckel el más bajo', () => {
    const heights = Object.fromEntries(Object.entries(DOG_BREEDS).map(([id, { spec }]) => [id, spec.h]))
    expect(Math.max(...Object.values(heights))).toBe(heights.pastor)
    expect(Math.min(...Object.values(heights))).toBe(heights.teckel)
  })

  it('cualquier combinación de colores da colores válidos para todas las partes', () => {
    const hex = /^#[0-9a-f]{6}$/
    const catsAndDogs = [...Object.values(CAT_BREEDS), ...Object.values(DOG_BREEDS)]
    catsAndDogs.forEach(({ colors }) => {
      PET_COLORS.coat.forEach((coat) => PET_COLORS.marks.forEach((marks) => {
        Object.values(colors(coat, marks)).filter(Boolean).forEach((color) => expect(color).toMatch(hex))
      }))
    })
  })

  it('Khalessi no es una opción de la viajera', () => {
    expect(PET_BREEDS.gato).not.toContain('khalessi')
    expect(isValidPet({ kind: 'gato', breed: 'khalessi', coat: '#46414f', marks: '#f4efe3' })).toBe(false)
  })

  it('valida especie, raza y colores a la vez', () => {
    expect(isValidPet(DEFAULT_PET)).toBe(true)
    expect(isValidPet(petOfBreed('perro', 'pastor'))).toBe(true)
    expect(isValidPet({ ...petOfBreed('perro', 'pastor'), breed: 'persa' })).toBe(false)
    expect(isValidPet({ ...petOfBreed('perro', 'pastor'), coat: '#123456' })).toBe(false)
    expect(isValidPet({ ...DEFAULT_PET, breed: 'pastor' })).toBe(false)
    expect(isValidPet(null)).toBe(false)
  })

  it('cambiar de especie parte de su primera raza con sus colores', () => {
    expect(petOfKind('gato')).toEqual({ kind: 'gato', breed: 'comun', coat: '#e49a52', marks: '#f4efe3' })
    expect(petOfKind('ninguna')).toEqual(DEFAULT_PET)
  })

  it('una mascota inválida se queda en sin mascota', () => {
    expect(upgradePet({ kind: 'dragon', breed: 'x' })).toEqual(DEFAULT_PET)
    expect(upgradePet({ kind: 'perro', variant: 'husky' })).toEqual(DEFAULT_PET)
    expect(upgradePet(undefined)).toEqual(DEFAULT_PET)
  })
})
