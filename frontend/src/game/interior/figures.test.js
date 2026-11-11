import { describe, expect, it } from 'vitest'
import { EREN, EREN_MINI, FIGURES, NEZUKO, NEZUKO_MINI, TANJIRO, ZELDA, ZELDA_MINI, FUNKO, FUNKO_MINI } from './figures.js'

describe('figuras de personajes', () => {
  it('los mapas de 16×16 y los de la balda (8×10) están completos', () => {
    ;[TANJIRO, NEZUKO, EREN, ZELDA, FUNKO].forEach((map) => {
      expect(map).toHaveLength(16)
      map.forEach((row) => expect(row).toHaveLength(16))
    })
    ;[FUNKO_MINI, NEZUKO_MINI, EREN_MINI, ZELDA_MINI].forEach((map) => {
      expect(map).toHaveLength(10)
      map.forEach((row) => expect(row).toHaveLength(8))
    })
  })

  it('la vitrina ofrece a Nezuko, Eren y Zelda, y la A1 imprime a Tanjiro', () => {
    const ids = FIGURES.map((figure) => figure.id)
    ;['nezuko', 'eren', 'zelda', 'tanjiro', 'funko', 'luprintech'].forEach((id) => expect(ids).toContain(id))
    expect(ids).not.toContain('lightbox')
    expect(ids).not.toContain('keyrings')
  })

  it('el Funko abre el vídeo y todas las figuras de la vitrina traen su dibujo de 8×10', () => {
    expect(FIGURES.find((figure) => figure.id === 'funko').href).toMatch(/^https:\/\/youtu\.be\/Ox06KB95vbM/)
    FIGURES.filter((figure) => figure.shelf).forEach(({ shelf }) => {
      expect(shelf).toHaveLength(10)
      shelf.forEach((row) => expect(row).toHaveLength(8))
    })
  })
})
