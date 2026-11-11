import { describe, expect, it } from 'vitest'
import { STARTER, TESTS, buildWorkerSource, evaluateUnsafe, summarize } from './codeChallenge.js'

const FIXED = `function crearSlug(titulo) {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}`

describe('reto de código', () => {
  it('el código de partida tiene un fallo real: aprueba algunas pruebas pero no todas', () => {
    const summary = summarize(evaluateUnsafe(STARTER))
    expect(summary.passed).toBe(false)
    expect(summary.ok).toBeGreaterThan(0)
    expect(summary.ok).toBeLessThan(summary.total)
    expect(summary.failed.length).toBeGreaterThan(2)
  })

  it('una solución correcta pasa las pruebas visibles y las ocultas', () => {
    expect(summarize(evaluateUnsafe(FIXED))).toMatchObject({ passed: true, ok: TESTS.length, hiddenFailed: 0 })
  })

  it('una solución distinta pero correcta también vale', () => {
    const alternative = "const crearSlug = (t) => t.normalize('NFD').replace(/\\p{Diacritic}/gu, '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).join('-')"
    expect(summarize(evaluateUnsafe(alternative)).passed).toBe(true)
  })

  it('escribir a mano las respuestas de las pruebas visibles no basta: las ocultas fallan', () => {
    const cheat = "function crearSlug(t) { return ({ 'Hola Mundo': 'hola-mundo', 'Valle del Bucle': 'valle-del-bucle', '¡Cómo se imprime en 3D!': 'como-se-imprime-en-3d', '  Hola   mundo  ': 'hola-mundo', 'React + Vite': 'react-vite', '': '' })[t] }"
    const summary = summarize(evaluateUnsafe(cheat))
    expect(summary.passed).toBe(false)
    expect(summary.hiddenFailed).toBeGreaterThan(0)
  })

  it('las pruebas ocultas no revelan lo recibido', () => {
    const { results } = evaluateUnsafe(STARTER)
    TESTS.filter((test) => test.hidden).forEach((test) => {
      expect(results.find((candidate) => candidate.id === test.id).got).toBeUndefined()
    })
  })

  it('un error de sintaxis, una función que falta o una excepción se informan sin romper', () => {
    expect(summarize(evaluateUnsafe('function crearSlug( {'))).toMatchObject({ passed: false, error: 'syntax' })
    expect(summarize(evaluateUnsafe('const otra = 1'))).toMatchObject({ passed: false, error: 'missing' })
    const throwing = summarize(evaluateUnsafe('function crearSlug(t) { if (t === "") throw new Error("vacío"); return t }'))
    expect(throwing.passed).toBe(false)
    expect(throwing.failed.find((result) => result.id === 'empty').threw).toBe('vacío')
  })

  it('un informe ausente o incompleto nunca aprueba', () => {
    expect(summarize(undefined).passed).toBe(false)
    expect(summarize({ results: [] }).passed).toBe(false)
  })

  it('el texto del Worker es JavaScript válido, incluso con código que trae comillas y saltos de línea', () => {
    const source = buildWorkerSource('const a = "x`\n</script>"; function crearSlug(t) { return t }')
    expect(() => new Function(source)).not.toThrow()
    expect(source).toContain('delete self[key]')
  })
})
