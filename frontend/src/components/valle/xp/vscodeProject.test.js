import { describe, expect, it } from 'vitest'
import { FILES, HELLO, ORDER, highlight, languageOf, parsePreview, runCommand } from './vscodeProject.js'

describe('proyecto ficticio', () => {
  it('tiene sus archivos, incluido el del reto, y todos tienen contenido', () => {
    expect(ORDER).toEqual(['src/slug.js', 'src/App.jsx', 'src/index.css', 'package.json', 'README.md'])
    ORDER.forEach((path) => expect(FILES[path].length, path).toBeGreaterThan(50))
  })

  it('el package.json es un JSON válido con el script del easter egg', () => {
    const pkg = JSON.parse(FILES['package.json'])
    expect(pkg.name).toBe('luprintech-portfolio')
    expect(pkg.scripts.hello).toContain(HELLO)
    expect(pkg.dependencies.react).toBeTruthy()
  })

  it('el README anuncia los scripts, incluido el que dice hola', () => {
    expect(FILES['README.md']).toContain('npm run hello')
  })

  it('reconoce el lenguaje de cada archivo', () => {
    expect(ORDER.map(languageOf)).toEqual(['js', 'js', 'css', 'json', 'md'])
  })
})

describe('resaltado', () => {
  const kinds = (lang, text) => highlight(lang, text).flat().map((part) => part.cls)

  it('distingue cadenas, palabras clave, comentarios y etiquetas de JSX', () => {
    const found = new Set(kinds('js', FILES['src/App.jsx']))
    ;['keyword', 'string', 'comment', 'tag', 'plain'].forEach((cls) => expect(found.has(cls), cls).toBe(true))
  })

  it('distingue propiedades y colores en CSS y claves en JSON', () => {
    expect(new Set(kinds('css', FILES['src/index.css'])).has('prop')).toBe(true)
    expect(new Set(kinds('css', FILES['src/index.css'])).has('number')).toBe(true)
    expect(new Set(kinds('json', FILES['package.json'])).has('prop')).toBe(true)
  })

  it('no pierde ni cambia ningún carácter', () => {
    ORDER.forEach((path) => {
      const joined = highlight(languageOf(path), FILES[path]).map((line) => line.map((part) => part.text).join('')).join('\n')
      expect(joined, path).toBe(FILES[path])
    })
  })
})

describe('vista previa', () => {
  it('lee el nombre y el color del código', () => {
    expect(parsePreview(FILES['src/App.jsx'])).toEqual({ name: 'Lupe', color: '#f2b134' })
    expect(parsePreview("const name = 'Atreus'\nconst color = 'teal'")).toEqual({ name: 'Atreus', color: 'teal' })
  })

  it('ignora valores peligrosos o mal formados y usa los de reserva', () => {
    expect(parsePreview("const color = 'red; background: url(x)'").color).toBe('#1c1b3a')
    expect(parsePreview('nada').name).toBe('')
  })
})

describe('terminal', () => {
  it('ejecutar `npm run hello` imprime el saludo y da el logro', () => {
    const result = runCommand('npm run hello', FILES)
    expect(result.lines).toContain(HELLO)
    expect(result.unlock).toBe('developer')
  })

  it('si se edita el script, el logro ya no sale', () => {
    const files = { ...FILES, 'package.json': FILES['package.json'].replace(HELLO, 'Adiós') }
    expect(runCommand('npm run hello', files).unlock).toBeUndefined()
  })

  it('arranca y construye de mentira, y avisa de un script que no existe', () => {
    expect(runCommand('npm run dev', FILES).preview).toBe(true)
    expect(runCommand('npm run build', FILES).lines.join(' ')).toContain('construido')
    expect(runCommand('npm run nada', FILES).lines[0]).toContain('Missing script')
  })

  it('lista, lee archivos y entiende los errores', () => {
    expect(runCommand('ls', FILES).lines[0]).toContain('package.json')
    expect(runCommand('cat README.md', FILES).lines[0]).toBe('# luprintech-portfolio')
    expect(runCommand('cat nada.txt', FILES).lines[0]).toContain('No existe')
    expect(runCommand('rm -rf /', FILES).lines[0]).toContain('no encontrada')
    expect(runCommand('clear', FILES).clear).toBe(true)
    expect(runCommand('', FILES).lines).toEqual([])
  })

  it('un package.json roto da un error claro', () => {
    expect(runCommand('npm run dev', { ...FILES, 'package.json': '{roto' }).lines[0]).toContain('JSON')
  })
})
