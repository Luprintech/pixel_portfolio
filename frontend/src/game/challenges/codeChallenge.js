// Reto de programación del Visual Studio Code del ordenador de Lupe: una función con un fallo que la viajera arregla y valida con
// pruebas reales. Aquí está solo lo que no depende de React ni del navegador: el archivo de partida, las pruebas y el programa que
// las ejecuta. Dónde y cómo se ejecuta (un iframe sin permisos con un Worker) está en `lib/codeSandbox.js`.
export const CHALLENGE_FILE = 'src/slug.js'
export const CHALLENGE_FUNCTION = 'crearSlug'
export const CHALLENGE_ACHIEVEMENT = 'debugged'

export const STARTER = `// Taller del Código · Reto
// Esta función convierte el título de un artículo en la dirección de su
// página: "¡Hola, Mundo!" debería quedar en "hola-mundo".
// Tiene un fallo. Arréglala y pulsa "Ejecutar pruebas".

function crearSlug(titulo) {
  const limpio = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .replace(' ', '-')
  return limpio
}
`

// Pruebas. Las ocultas no enseñan ni lo esperado ni lo recibido, para que no se pueda aprobar escribiendo las respuestas a mano.
export const TESTS = [
  { id: 'basic', input: 'Hola Mundo', expected: 'hola-mundo' },
  { id: 'spaces', input: 'Valle del Bucle', expected: 'valle-del-bucle' },
  { id: 'symbols', input: '¡Cómo se imprime en 3D!', expected: 'como-se-imprime-en-3d' },
  { id: 'edges', input: '  Hola   mundo  ', expected: 'hola-mundo' },
  { id: 'plus', input: 'React + Vite', expected: 'react-vite' },
  { id: 'empty', input: '', expected: '' },
  { id: 'hiddenAccents', input: 'Ñandú & Árbol', expected: 'nandu-arbol', hidden: true },
  { id: 'hiddenDashes', input: 'a---b', expected: 'a-b', hidden: true },
  { id: 'hiddenOnlySymbols', input: '¡¿?!', expected: '', hidden: true },
]

// Programa que evalúa el código de la viajera. Se guarda como texto porque se entrega tal cual a un Worker: no puede usar nada de
// fuera. Devuelve `{ error }` si el código no se puede ejecutar (`syntax`, `missing`) o `{ results }` con una entrada por prueba.
// La función se llama una vez por prueba, cada una con su `try`, para que una excepción no tumbe a las demás. Un bucle infinito
// no se corta aquí: lo corta quien lo lanza, cerrando el Worker.
export const HARNESS_SOURCE = `
function evaluate(code, tests, name) {
  var fn
  try {
    fn = new Function('"use strict";\\n' + code + '\\n;return typeof ' + name + ' === "function" ? ' + name + ' : undefined;')()
  } catch (error) {
    return { error: 'syntax', message: String((error && error.message) || error).slice(0, 160) }
  }
  if (typeof fn !== 'function') return { error: 'missing' }
  var results = tests.map(function (test) {
    try {
      var got = fn(test.input)
      var shown = typeof got === 'string' ? got : String(got)
      return { id: test.id, ok: got === test.expected, got: test.hidden ? undefined : shown.slice(0, 80) }
    } catch (error) {
      return { id: test.id, ok: false, threw: test.hidden ? undefined : String((error && error.message) || error).slice(0, 120) }
    }
  })
  return { results: results }
}
`

// Texto completo del Worker. Antes de ejecutar nada quita del entorno todo lo que daría acceso a red, almacenamiento u otros
// hilos y guarda `postMessage` para que el código de la viajera no pueda enviar un resultado falso. (La barrera principal es el
// iframe sin permisos y con CSP que lo contiene; esto es una segunda capa.)
export function buildWorkerSource(code, tests = TESTS, name = CHALLENGE_FUNCTION) {
  return `(function () {
${HARNESS_SOURCE}
var post = self.postMessage.bind(self)
;['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'importScripts', 'indexedDB', 'caches', 'BroadcastChannel', 'SharedWorker', 'Worker', 'postMessage', 'close'].forEach(function (key) {
  try { delete self[key] } catch (error) { /* ya no está */ }
  try { Object.defineProperty(self, key, { value: undefined, configurable: false, writable: false }) } catch (error) { /* ya no está */ }
})
post(evaluate(${JSON.stringify(code)}, ${JSON.stringify(tests)}, ${JSON.stringify(name)}))
})()`
}

// Ejecuta el programa de pruebas directamente, sin aislamiento. Solo para las pruebas automáticas del propio reto, con código
// nuestro: en el juego el código de la viajera pasa siempre por `lib/codeSandbox.js`.
export function evaluateUnsafe(code, tests = TESTS, name = CHALLENGE_FUNCTION) {
  return new Function(`${HARNESS_SOURCE}\nreturn evaluate`)()(code, tests, name)
}

// Resumen de un informe de ejecución: si se aprueba y qué pruebas fallan, separando las visibles de las ocultas.
export function summarize(report) {
  if (!report || report.error) return { passed: false, error: report?.error ?? 'unavailable', message: report?.message, failed: [], hiddenFailed: 0, total: TESTS.length, ok: 0 }
  const hidden = new Set(TESTS.filter((test) => test.hidden).map((test) => test.id))
  const failed = report.results.filter((result) => !result.ok && !hidden.has(result.id))
  const hiddenFailed = report.results.filter((result) => !result.ok && hidden.has(result.id)).length
  const ok = report.results.filter((result) => result.ok).length
  return { passed: report.results.length === TESTS.length && ok === TESTS.length, error: null, failed, hiddenFailed, total: TESTS.length, ok }
}
