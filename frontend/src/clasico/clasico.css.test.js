import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { describe, expect, it } from 'vitest'

// Este CSS se carga con el chunk diferido de /clasico y se queda en la página mientras dure la sesión:
// cualquier regla sin prefijo se contagiaría al valle y a la portada. Se lee como texto a propósito.
// Vitest se ejecuta desde frontend/. No se usa `?raw` porque el procesado de CSS de Vitest lo devuelve vacío.
const source = readFileSync(resolve(process.cwd(), 'src/clasico/clasico.css'), 'utf8')
const css = source.replace(/\/\*[\s\S]*?\*\//g, '')

const KEYFRAME_STEP = /^(from|to|[\d.]+%)(\s*,\s*(from|to|[\d.]+%))*$/

// Preámbulos de regla ("selector { ... }"), sin los pasos internos de @keyframes ni las @-reglas
function selectorPreambles() {
  return [...css.matchAll(/([^{}]+)\{/g)]
    .map((match) => match[1].trim())
    .filter((preamble) => !preamble.startsWith('@') && !KEYFRAME_STEP.test(preamble))
}

describe('clasico.css', () => {
  it('cuelga todo de .clasico-root', () => {
    const selectors = selectorPreambles().flatMap((preamble) => preamble.split(',').map((s) => s.trim()))
    expect(selectors.length).toBeGreaterThan(0)
    expect(selectors.filter((selector) => !selector.startsWith('.clasico-root'))).toEqual([])
  })

  it('no tiene reglas sueltas sobre html, body, :root ni el selector universal', () => {
    const bare = selectorPreambles()
      .flatMap((preamble) => preamble.split(',').map((s) => s.trim()))
      .filter((selector) => /^(html|body|:root|\*)/.test(selector))
    expect(bare).toEqual([])
  })

  it('prefija los keyframes con clasico- para no chocar con los del resto del sitio', () => {
    const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1])
    expect(names.length).toBeGreaterThan(0)
    expect(names.filter((name) => !name.startsWith('clasico-'))).toEqual([])
  })
})
