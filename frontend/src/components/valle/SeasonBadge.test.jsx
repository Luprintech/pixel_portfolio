import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { COPY } from '../../lib/valleCopy'
import SeasonBadge from './SeasonBadge'

const copy = COPY.es.hud.season

describe('indicador de estación', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  const visibleName = (container) => container.querySelector('[role="status"]:not(.sr-only)')

  it('en compacto es solo el icono, con el nombre accesible, y no enseña la etiqueta al entrar', () => {
    const { container } = render(<SeasonBadge season="summer" changes={0} copy={copy} />)
    expect(screen.getByRole('button', { name: 'Estación: Verano' })).toBeTruthy()
    expect(visibleName(container)).toBeNull()
  })

  it('enseña el nombre con el ratón, con el teclado y al tocar, y lo quita solo', () => {
    const { container } = render(<SeasonBadge season="autumn" changes={0} copy={copy} />)
    const button = screen.getByRole('button')
    fireEvent.mouseEnter(button)
    expect(visibleName(container).textContent).toBe('Otoño')
    fireEvent.mouseLeave(button)
    expect(visibleName(container)).toBeNull()
    fireEvent.focus(button)
    expect(visibleName(container)).not.toBeNull()
    fireEvent.blur(button)
    fireEvent.click(button)
    expect(visibleName(container)).not.toBeNull()
    act(() => vi.advanceTimersByTime(6000))
    expect(visibleName(container)).toBeNull()
  })

  it('al cambiar de estación enseña el nombre unos segundos y vuelve al icono', () => {
    const { container, rerender } = render(<SeasonBadge season="spring" changes={0} copy={copy} />)
    expect(visibleName(container)).toBeNull()
    rerender(<SeasonBadge season="summer" changes={1} copy={copy} />)
    expect(visibleName(container).textContent).toBe('Verano')
    act(() => vi.advanceTimersByTime(6000))
    expect(visibleName(container)).toBeNull()
  })

  it('los nombres existen en los dos idiomas', () => {
    ;['es', 'en'].forEach((lang) => ['spring', 'summer', 'autumn', 'winter'].forEach((name) => expect(COPY[lang].hud.season.names[name], `${name} ${lang}`).toBeTruthy()))
  })
})
