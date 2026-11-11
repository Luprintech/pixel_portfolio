import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DialogueBox from './DialogueBox'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ i18n: { resolvedLanguage: 'es' } }) }))
vi.mock('../../lib/audioEngine', () => ({ getEngine: () => null, startEngineIfAllowed: () => null }))
vi.mock('../../lib/petSounds', () => ({ playPetSound: vi.fn() }))
vi.mock('../../game/interior/portraits', () => ({ portraitUrl: () => null }))
vi.mock('../../lib/reducedMotion', () => ({ prefersReducedMotion: () => true }))

// El texto completo de la página va en un párrafo para lectores de pantalla, aunque el visible se escriba poco a poco.
const spoken = (container) => container.querySelector('.sr-only').textContent

function readWelcome(features, player) {
  const { container } = render(<DialogueBox scriptId="inicio.bienvenida" features={features} player={player} onClose={() => {}} />)
  const pages = [spoken(container)]
  for (let i = 0; i < 7; i++) {
    fireEvent.keyDown(window, { key: 'Enter' })
    pages.push(spoken(container))
  }
  return pages
}

describe('bienvenida de Lupe con nombre', () => {
  it('saluda a la viajera por su nombre', () => {
    const pages = readWelcome({}, { name: 'Ana', petName: '' })
    expect(pages[0]).toMatch(/^¡Hola, Ana! Soy Lupe/)
    expect(pages.join(' ')).not.toMatch(/Se llama/)
  })

  it('con un perro habla del perro por su nombre', () => {
    const text = readWelcome({ petDog: true }, { name: 'Ana', petName: 'Rex', petKind: 'perro', petBreed: 'corgi' }).join(' ')
    expect(text).toContain('¡Qué perro más bonito! Se llama Rex y es de raza Corgi, ¿verdad?')
    expect(text).not.toContain('gato')
  })

  it('con un gato habla del gato por su nombre', () => {
    const text = readWelcome({ petCat: true }, { name: 'Ana', petName: 'Miau', petKind: 'gato', petBreed: 'persa' }).join(' ')
    expect(text).toContain('¡Qué gato tan elegante! Se llama Miau y es de raza Persa, ¿verdad?')
    expect(text).not.toContain('perro')
  })
})
