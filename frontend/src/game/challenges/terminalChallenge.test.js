import { describe, expect, it } from 'vitest'
import { CHALLENGE_COPY } from '../../lib/challengeCopy.js'
import { CIPHERTEXT, HOME, PASSWORD, TERMINAL_ACHIEVEMENT, TREE, execute, initialState, nodeAt, resolve, shortPath } from './terminalChallenge.js'

const T = CHALLENGE_COPY.es.terminalUi

// Escribe varias órdenes seguidas y devuelve el último resultado y todo lo que se desbloqueó por el camino.
function play(...inputs) {
  let state = initialState()
  const unlocked = []
  let last
  inputs.forEach((input) => {
    last = execute(state, input, T)
    state = last.state
    if (last.unlock) unlocked.push(last.unlock)
  })
  return { state, last, unlocked }
}

const decode = (text, shift = 3) => text.replace(/[a-z]/g, (ch) => String.fromCharCode(((ch.charCodeAt(0) - 97 - shift + 26) % 26) + 97))

describe('rutas', () => {
  it('resuelve rutas absolutas, relativas, con ~, . y ..', () => {
    expect(resolve(HOME, 'Descargas')).toEqual(['home', 'lupe', 'Descargas'])
    expect(resolve(HOME, '..')).toEqual(['home'])
    expect(resolve(HOME, '/var/log')).toEqual(['var', 'log'])
    expect(resolve('/var/log', '~')).toEqual(['home', 'lupe'])
    expect(resolve('/var/log', '~/Descargas/../apuntes.txt')).toEqual(['home', 'lupe', 'apuntes.txt'])
    expect(resolve(HOME, '../../..')).toEqual([])
  })

  it('el prompt escribe la casa como ~', () => {
    expect(shortPath(HOME)).toBe('~')
    expect(shortPath(`${HOME}/Descargas`)).toBe('~/Descargas')
    expect(shortPath('/var/log')).toBe('/var/log')
  })
})

describe('terminal del reto de ciberseguridad', () => {
  it('cada archivo del sistema tiene contenido y todo contenido corresponde a un archivo', () => {
    const files = []
    const walk = (node, path) => Object.entries(node.children).forEach(([name, child]) => (child.type === 'dir' ? walk(child, `${path}/${name}`) : files.push(`${path}/${name}`)))
    walk(TREE, '')
    files.forEach((path) => {
      expect(Object.keys(T.files), path).toContain(path)
      expect(CHALLENGE_COPY.en.terminalUi.files[path], path).toBeDefined()
    })
    Object.keys(T.files).forEach((path) => expect(nodeAt(resolve('/', path))?.type, path).toBe('file'))
  })

  it('help, pwd y clear funcionan', () => {
    expect(play('help').last.lines).toBe(T.help)
    expect(play('pwd').last.lines).toEqual([HOME])
    expect(play('clear').last.clear).toBe(true)
    expect(play('cd /var/log', 'pwd').last.lines).toEqual(['/var/log'])
  })

  it('ls enseña lo visible y solo con -a lo oculto; las carpetas llevan barra', () => {
    expect(play('ls').last.lines[0]).toContain('README.txt')
    expect(play('ls').last.lines[0]).toContain('Descargas/')
    expect(play('ls /home/sysadmin').last.lines[0]).not.toContain('.cache')
    expect(play('ls -a /home/sysadmin').last.lines[0]).toContain('.cache/')
    expect(play('ls /tmp/../opt').last.lines[0]).toBe('backup/')
  })

  it('cd y cat avisan con claridad cuando algo no existe o no es lo que se espera', () => {
    expect(play('cd nada').last.lines[0]).toContain('nada')
    expect(play('cd README.txt').last.lines[0]).toContain('archivo')
    expect(play('cat').last.lines[0]).toContain('Uso')
    expect(play('cat Descargas').last.lines[0]).toContain('carpeta')
    expect(play('cat noexiste.txt').last.lines[0]).toContain('noexiste.txt')
    expect(play('sudo rm -rf /').last.lines[0]).toContain('sudo')
    expect(play('').last.lines).toEqual([])
  })

  it('la contraseña no aparece en ningún archivo, solo su cifrado', () => {
    Object.values(T.files).flat().forEach((line) => expect(line.toLowerCase()).not.toContain(PASSWORD))
    expect(Object.values(T.files).flat().some((line) => line.includes(CIPHERTEXT))).toBe(true)
    expect(decode(CIPHERTEXT)).toBe(PASSWORD)
  })

  it('el camino de pistas lleva de un archivo al siguiente hasta la clave', () => {
    const text = (path) => T.files[path].join('\n')
    expect(text('/home/lupe/README.txt')).toContain('/var/log')
    expect(text('/var/log/auth.log')).toContain('/home/sysadmin/.cache')
    expect(text('/home/sysadmin/.cache/notas.txt')).toContain('/opt/backup')
    expect(text('/opt/backup/clave.enc')).toContain(CIPHERTEXT)
  })

  it('resolver el reto concede el logro una sola vez por orden y deja repetir', () => {
    const solved = play('cat README.txt', 'cat /var/log/auth.log', 'cd /home/sysadmin', 'ls -a', 'cd .cache', 'cat notas.txt', 'cat /opt/backup/clave.enc', `unlock ${PASSWORD}`)
    expect(solved.unlocked).toEqual([TERMINAL_ACHIEVEMENT])
    expect(solved.state.solved).toBe(true)
    // La orden se puede repetir: el logro en sí lo protege el sistema de logros (`unlockAchievement` es idempotente).
    expect(play(`UNLOCK  ${PASSWORD.toUpperCase()} `).unlocked).toEqual([TERMINAL_ACHIEVEMENT])
  })

  it('una contraseña equivocada no desbloquea nada y a la segunda ofrece ayuda', () => {
    const first = play('unlock 1234')
    expect(first.unlocked).toEqual([])
    expect(first.last.lines).toEqual([T.denied])
    const second = play('unlock 1234', 'unlock hunter2')
    expect(second.last.lines).toEqual([T.denied, T.deniedHint])
    expect(play('unlock').last.lines).toEqual([T.unlockUsage])
  })

  it('leer el archivo cifrado sin descifrar no basta', () => {
    expect(play('cat /opt/backup/clave.enc', `unlock ${CIPHERTEXT}`).unlocked).toEqual([])
  })

  it('hint avanza con lo ya leído y nunca dice la contraseña', () => {
    expect(play('hint').last.lines).toEqual([T.hints[0]])
    expect(play('cat README.txt', 'hint').last.lines).toEqual([T.hints[1]])
    expect(play('cat README.txt', 'cat /var/log/auth.log', 'hint').last.lines).toEqual([T.hints[2]])
    expect(play('cat README.txt', 'cat /var/log/auth.log', 'cat /home/sysadmin/.cache/notas.txt', 'hint').last.lines).toEqual([T.hints[3]])
    expect(play('cat README.txt', 'cat /var/log/auth.log', 'cat /home/sysadmin/.cache/notas.txt', 'cat /opt/backup/clave.enc', 'hint').last.lines).toEqual([T.hints[4]])
    ;[...T.hints, ...CHALLENGE_COPY.en.terminalUi.hints].forEach((hint) => expect(hint.toLowerCase()).not.toContain(PASSWORD))
  })

  it('los dos idiomas tienen las mismas claves de texto', () => {
    expect(Object.keys(CHALLENGE_COPY.en.terminalUi).sort()).toEqual(Object.keys(T).sort())
    expect(Object.keys(CHALLENGE_COPY.en.codeChallenge).sort()).toEqual(Object.keys(CHALLENGE_COPY.es.codeChallenge).sort())
    expect(Object.keys(CHALLENGE_COPY.en.codeChallenge.hints).sort()).toEqual(Object.keys(CHALLENGE_COPY.es.codeChallenge.hints).sort())
  })
})
