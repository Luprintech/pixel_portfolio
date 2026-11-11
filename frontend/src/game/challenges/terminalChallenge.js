// Reto de ciberseguridad de la terminal del ordenador de Lupe: un sistema de archivos inventado, con unas pocas órdenes, en el que
// una pista lleva a la siguiente hasta una contraseña escondida. Es una simulación: no toca el sistema operativo ni archivos de
// nadie. Todo es puro (el estado entra y sale), sin React ni Phaser; los textos vienen de `lib/challengeCopy.js`.
//
// Camino de la solución (sin la contraseña en claro en ningún archivo):
//   README.txt -> /var/log/auth.log -> /home/sysadmin/.cache/notas.txt (carpeta oculta) -> /opt/backup/clave.enc (cifrada con César)
//   -> descifrar a mano y escribir `unlock <clave>`.
export const TERMINAL_ACHIEVEMENT = 'access'
export const HOME = '/home/lupe'

// La clave se compara en minúsculas y sin espacios alrededor. En ningún archivo aparece tal cual: `clave.enc` guarda su cifrado
// César de desplazamiento 3 (cada letra, tres más adelante). Hay una prueba que lo comprueba.
export const PASSWORD = 'bucle-seguro'
export const CIPHERTEXT = 'exfoh-vhjxur'

const dir = (children) => ({ type: 'dir', children })
const file = () => ({ type: 'file' })

// Solo la forma del sistema de archivos; el contenido de cada archivo está en el texto, por su ruta absoluta.
export const TREE = dir({
  home: dir({
    lupe: dir({ 'README.txt': file(), 'apuntes.txt': file(), Descargas: dir({ 'lista.txt': file() }) }),
    sysadmin: dir({ 'informe.txt': file(), '.cache': dir({ 'notas.txt': file() }) }),
  }),
  var: dir({ log: dir({ 'auth.log': file(), 'sistema.log': file() }) }),
  opt: dir({ backup: dir({ 'clave.enc': file() }) }),
  tmp: dir({ 'basura.txt': file() }),
})

// Resuelve una ruta (absoluta o relativa a `cwd`, con `~`, `.` y `..`) a una lista de nombres.
export function resolve(cwd, input = '') {
  const text = input.trim()
  const start = text.startsWith('/') ? [] : text.startsWith('~') ? HOME.split('/').filter(Boolean) : cwd.split('/').filter(Boolean)
  const parts = [...start]
  text.replace(/^~/, '').split('/').forEach((part) => {
    if (!part || part === '.') return
    if (part === '..') parts.pop()
    else parts.push(part)
  })
  return parts
}

export const pathOf = (parts) => `/${parts.join('/')}`

export function nodeAt(parts) {
  return parts.reduce((node, part) => (node?.type === 'dir' ? node.children[part] : undefined), TREE)
}

// Ruta para el aviso del prompt: la casa se escribe `~`.
export function shortPath(cwd) {
  return cwd === HOME ? '~' : cwd.startsWith(`${HOME}/`) ? `~${cwd.slice(HOME.length)}` : cwd
}

export const initialState = () => ({ cwd: HOME, read: [], solved: false, wrong: 0 })

const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '')
const sorted = (names) => [...names].sort((a, b) => a.localeCompare(b))

// Qué pista dar según lo que ya se ha leído: de la más inicial a la última, sin decir nunca la contraseña.
export function nextHint(state, t) {
  const read = new Set(state.read)
  const step = ['/home/lupe/README.txt', '/var/log/auth.log', '/home/sysadmin/.cache/notas.txt', '/opt/backup/clave.enc'].findIndex((path) => !read.has(path))
  return t.hints[step === -1 ? 4 : step]
}

// Ejecuta una línea escrita. Devuelve `{ state, lines, clear?, unlock? }`. `t` es el texto del reto en el idioma activo.
export function execute(state, input, t) {
  const text = input.trim()
  if (!text) return { state, lines: [] }
  const [rawCommand, ...args] = text.split(/\s+/)
  const command = rawCommand.toLowerCase()

  if (command === 'help') return { state, lines: t.help }
  if (command === 'clear') return { state, lines: [], clear: true }
  if (command === 'pwd') return { state, lines: [state.cwd] }
  if (command === 'hint') return { state, lines: [nextHint(state, t)] }

  if (command === 'ls') {
    const all = args.some((arg) => /^-\w*a\w*$/.test(arg))
    const target = args.find((arg) => !arg.startsWith('-'))
    const parts = target ? resolve(state.cwd, target) : resolve(state.cwd)
    const node = nodeAt(parts)
    if (!node) return { state, lines: [fill(t.noSuchPath, { path: target })] }
    if (node.type === 'file') return { state, lines: [target] }
    const names = Object.keys(node.children).filter((name) => all || !name.startsWith('.'))
    const shown = (all ? ['.', '..', ...names] : names)
    const decorated = sorted(shown).map((name) => (node.children[name]?.type === 'dir' ? `${name}/` : name))
    return { state, lines: [decorated.join('  ') || t.emptyDir] }
  }

  if (command === 'cd') {
    const parts = resolve(state.cwd, args[0] ?? '~')
    const node = nodeAt(parts)
    if (!node) return { state, lines: [fill(t.noSuchPath, { path: args[0] })] }
    if (node.type === 'file') return { state, lines: [fill(t.notADir, { path: args[0] })] }
    return { state: { ...state, cwd: pathOf(parts) }, lines: [] }
  }

  if (command === 'cat') {
    if (!args[0]) return { state, lines: [t.catUsage] }
    const parts = resolve(state.cwd, args[0])
    const node = nodeAt(parts)
    if (!node) return { state, lines: [fill(t.noSuchPath, { path: args[0] })] }
    if (node.type === 'dir') return { state, lines: [fill(t.isADir, { path: args[0] })] }
    const path = pathOf(parts)
    const next = state.read.includes(path) ? state : { ...state, read: [...state.read, path] }
    return { state: next, lines: t.files[path] ?? [] }
  }

  if (command === 'unlock') {
    if (!args.length) return { state, lines: [t.unlockUsage] }
    if (args.join(' ').trim().toLowerCase() === PASSWORD) return { state: { ...state, solved: true }, lines: t.solved, unlock: TERMINAL_ACHIEVEMENT }
    return { state: { ...state, wrong: state.wrong + 1 }, lines: [t.denied, state.wrong >= 1 ? t.deniedHint : ''].filter(Boolean) }
  }

  return { state, lines: [fill(t.unknownCommand, { command: rawCommand })] }
}
