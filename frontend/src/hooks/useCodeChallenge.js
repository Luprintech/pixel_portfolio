import { useCallback, useEffect, useRef, useState } from 'react'
import { CHALLENGE_ACHIEVEMENT, summarize } from '../game/challenges/codeChallenge'
import { runInSandbox } from '../lib/codeSandbox'

// Estado del reto de código: `status` es 'idle', 'running' o 'done'; `summary` es el resumen de la última ejecución. `run(code)`
// lanza las pruebas en el aislamiento y, solo si pasan todas, pide el logro (`onUnlock` es idempotente: repetir el reto no lo
// concede otra vez). Si se vuelve a ejecutar mientras otra sigue en marcha, solo cuenta la última.
export function useCodeChallenge(onUnlock) {
  const [state, setState] = useState({ status: 'idle', summary: null })
  const latest = useRef(0)
  const mounted = useRef(true)
  useEffect(() => () => { mounted.current = false }, [])

  const run = useCallback(async (code) => {
    const id = ++latest.current
    setState((current) => ({ ...current, status: 'running' }))
    const summary = summarize(await runInSandbox(code))
    if (!mounted.current || id !== latest.current) return
    setState({ status: 'done', summary })
    if (summary.passed) onUnlock?.(CHALLENGE_ACHIEVEMENT)
  }, [onUnlock])

  return { ...state, run }
}
