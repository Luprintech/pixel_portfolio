// Ejecuta el código que escribe la viajera sin dejarle tocar nada del juego ni del navegador. Tres capas:
//  1. Un iframe oculto con `sandbox="allow-scripts"` (sin `allow-same-origin`): su origen es opaco, así que no ve el DOM de la
//     página, ni cookies, ni `localStorage`, ni IndexedDB.
//  2. Una política CSP dentro del iframe (`default-src 'none'`): bloquea fetch, XHR, WebSocket, imágenes y cualquier otra red. Solo
//     deja evaluar texto (`unsafe-eval`) y crear el Worker desde un `blob:`.
//  3. El código corre en un Worker dentro del iframe, que además se vacía de red, almacenamiento y `postMessage` antes de empezar
//     (`buildWorkerSource`). Al ir en otro hilo, un bucle infinito no congela la página: pasado el tiempo se cierra el iframe y con
//     él el Worker.
// Cada ejecución crea un iframe nuevo y lo destruye al terminar: no queda estado entre una y otra.
import { buildWorkerSource } from '../game/challenges/codeChallenge'

export const SANDBOX_TIMEOUT_MS = 3000
export const MAX_CODE_LENGTH = 20_000

// Página del iframe: recibe el texto del Worker, lo crea y reenvía su respuesta a la página. Es código nuestro, no de la viajera.
const FRAME = `<!doctype html><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; worker-src blob:">
<script>
addEventListener('message', function (event) {
  if (event.source !== parent || typeof event.data !== 'string') return
  try {
    var worker = new Worker(URL.createObjectURL(new Blob([event.data], { type: 'text/javascript' })))
    worker.onmessage = function (reply) { parent.postMessage({ sandbox: true, report: reply.data }, '*') }
    worker.onerror = function (error) { parent.postMessage({ sandbox: true, report: { error: 'syntax', message: String(error.message || '').slice(0, 160) } }, '*'); error.preventDefault() }
  } catch (error) {
    parent.postMessage({ sandbox: true, report: { error: 'unavailable' } }, '*')
  }
})
parent.postMessage({ sandbox: 'ready' }, '*')
</script>`

// Lanza el código en el aislamiento y devuelve el informe de `evaluate` (`{ results }` o `{ error }`). Nunca rechaza: un fallo del
// entorno se informa como `{ error: 'unavailable' }` y uno de tiempo como `{ error: 'timeout' }`.
export function runInSandbox(code, { timeoutMs = SANDBOX_TIMEOUT_MS } = {}) {
  if (typeof document === 'undefined' || typeof Worker === 'undefined') return Promise.resolve({ error: 'unavailable' })
  if (code.length > MAX_CODE_LENGTH) return Promise.resolve({ error: 'unavailable' })
  return new Promise((resolve) => {
    const frame = document.createElement('iframe')
    frame.setAttribute('sandbox', 'allow-scripts')
    frame.setAttribute('aria-hidden', 'true')
    frame.tabIndex = -1
    frame.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden'
    let timer = 0
    const finish = (report) => {
      clearTimeout(timer)
      window.removeEventListener('message', onMessage)
      frame.remove()
      resolve(report)
    }
    function onMessage(event) {
      if (event.source !== frame.contentWindow || !event.data?.sandbox) return
      if (event.data.sandbox === 'ready') frame.contentWindow.postMessage(buildWorkerSource(code), '*')
      else finish(event.data.report)
    }
    window.addEventListener('message', onMessage)
    timer = setTimeout(() => finish({ error: 'timeout' }), timeoutMs)
    frame.srcdoc = FRAME
    document.body.appendChild(frame)
  })
}
