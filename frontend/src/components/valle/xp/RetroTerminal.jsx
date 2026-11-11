import { useEffect, useRef, useState } from 'react'
import { execute, initialState, shortPath } from '../../../game/challenges/terminalChallenge'
import { useValleCopy } from '../../../lib/valleCopy'

const MONO = '"Cascadia Code", "Lucida Console", "Courier New", monospace'
const QUICK = ['help', 'ls', 'pwd', 'hint', 'clear']
const prompt = (cwd) => `lupe@taller:${shortPath(cwd)}$`

// Terminal retro (fósforo verde sobre negro) con el reto de ciberseguridad: un sistema de archivos inventado, sin acceso al equipo
// real (ver `game/challenges/terminalChallenge.js`). El historial de órdenes se recorre con las flechas arriba y abajo y, para quien
// toca la pantalla, unos botones lanzan las órdenes que no necesitan argumentos. Al cerrar la ventana el reto vuelve a empezar.
export default function RetroTerminal({ onUnlock }) {
  const { copy } = useValleCopy()
  const t = copy.desktop.terminalUi
  const [state, setState] = useState(initialState)
  const [lines, setLines] = useState(t.banner)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState({ entries: [], index: 0 })
  const inputRef = useRef(null)
  const endRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [lines])

  const run = (text) => {
    const result = execute(state, text, t)
    setState(result.state)
    setLines((current) => (result.clear ? [] : [...current, `${prompt(state.cwd)} ${text}`, ...result.lines]))
    if (text.trim()) setHistory((h) => ({ entries: [...h.entries, text], index: h.entries.length + 1 }))
    if (result.unlock) onUnlock(result.unlock)
  }
  const submit = (event) => {
    event.preventDefault()
    run(input)
    setInput('')
  }
  const browse = (event) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    const index = Math.min(history.entries.length, Math.max(0, history.index + (event.key === 'ArrowUp' ? -1 : 1)))
    setHistory((h) => ({ ...h, index }))
    setInput(history.entries[index] ?? '')
  }

  return (
    <div className="flex h-full min-h-[16rem] flex-col text-xs" style={{ background: '#050805', color: '#7dff8a', fontFamily: MONO }} onClick={() => inputRef.current?.focus()}>
      <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words p-3 leading-relaxed" aria-live="polite">
        {lines.join('\n')}
        <span ref={endRef} />
      </pre>
      <div className="flex shrink-0 flex-wrap gap-1 border-t px-2 py-1" style={{ borderColor: '#1d3a21' }} role="group" aria-label={t.quick}>
        {QUICK.map((command) => (
          <button key={command} type="button" className="rounded border px-2 py-0.5" style={{ borderColor: '#2f6a37', color: '#7dff8a' }} onClick={() => run(command)}>
            {command}
          </button>
        ))}
      </div>
      <form className="flex shrink-0 items-center gap-2 border-t px-2 py-1.5" style={{ borderColor: '#1d3a21' }} onSubmit={submit}>
        <label htmlFor="retro-terminal-input" className="shrink-0">{prompt(state.cwd)}</label>
        <input
          ref={inputRef}
          id="retro-terminal-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={browse}
          spellCheck="false"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          aria-label={t.input}
          className="min-w-0 flex-1 bg-transparent outline-none"
          style={{ caretColor: '#7dff8a' }}
        />
      </form>
    </div>
  )
}
