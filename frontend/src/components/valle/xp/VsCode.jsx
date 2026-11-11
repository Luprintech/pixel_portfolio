import { useEffect, useRef, useState } from 'react'
import { CHALLENGE_FILE, STARTER } from '../../../game/challenges/codeChallenge'
import { useCodeChallenge } from '../../../hooks/useCodeChallenge'
import { useValleCopy } from '../../../lib/valleCopy'
import TestsPanel from './TestsPanel'
import { FILES, ORDER, PROJECT, PROMPT, highlight, languageOf, parsePreview, runCommand } from './vscodeProject'

// Colores del tema oscuro de Visual Studio Code para cada tipo de texto.
const TOKEN = { plain: '#d4d4d4', keyword: '#569cd6', string: '#ce9178', comment: '#6a9955', tag: '#4ec9b0', number: '#b5cea8', prop: '#9cdcfe' }
const MONO = '"Cascadia Code", "Lucida Console", "Courier New", monospace'
const EDITOR = { fontFamily: MONO, fontSize: 12, lineHeight: '18px', padding: '8px 12px', tabSize: 2, whiteSpace: 'pre' }

const fileName = (path) => path.split('/').pop()

// Vista previa de la tarjeta de prueba: lee del código solo el nombre y el color y dibuja la tarjeta; el contador es del propio
// componente. No ejecuta el código escrito.
function Preview({ source, copy }) {
  const { name, color } = parsePreview(source)
  const [likes, setLikes] = useState(0)
  return (
    <div className="grid h-full place-items-center overflow-auto p-4" style={{ background: '#f1e6cf' }}>
      <div className="w-60 p-4" style={{ border: `4px solid ${color}`, boxShadow: '4px 4px 0 #1c1b3a', color: '#1c1b3a', fontFamily: 'monospace' }}>
        <h3 className="text-lg font-bold">{copy.greeting}, {name || '…'}</h3>
        <p className="mt-1 text-sm">{copy.welcome}</p>
        <button type="button" className="mt-3 px-3 py-1 text-sm" style={{ background: '#f2b134', boxShadow: '0 4px 0 #1c1b3a' }} onClick={() => setLikes((n) => n + 1)}>♥ {likes}</button>
      </div>
    </div>
  )
}

// Terminal integrada: una orden por línea, con su historial; solo entiende unas pocas (ver `runCommand`).
function Terminal({ files, onUnlock, onPreview, copy }) {
  const [lines, setLines] = useState([copy.terminalHint])
  const [input, setInput] = useState('')
  const endRef = useRef(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [lines])

  const submit = (event) => {
    event.preventDefault()
    const result = runCommand(input, files)
    setLines((current) => (result.clear ? [] : [...current, `${PROMPT} ${input}`, ...result.lines]))
    setInput('')
    if (result.preview) onPreview()
    if (result.unlock) onUnlock(result.unlock)
  }
  return (
    <div className="flex h-full flex-col overflow-hidden text-xs" style={{ background: '#1e1e1e', color: '#cccccc', fontFamily: MONO }}>
      <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-2" aria-live="polite">{lines.join('\n')}<span ref={endRef} /></pre>
      <form className="flex shrink-0 items-center gap-2 border-t px-2 py-1" style={{ borderColor: '#3c3c3c' }} onSubmit={submit}>
        <label htmlFor="vscode-terminal" style={{ color: '#4ec9b0' }}>{PROMPT}</label>
        <input id="vscode-terminal" value={input} onChange={(event) => setInput(event.target.value)} spellCheck="false" autoComplete="off" className="min-w-0 flex-1 bg-transparent outline-none" />
      </form>
    </div>
  )
}

// Visual Studio Code, en pequeño: explorador del proyecto `luprintech-portfolio`, pestañas, editor con resaltado de sintaxis
// (el texto es editable: se escribe sobre un cuadro transparente que lleva debajo la capa coloreada), terminal y vista previa.
// Reto: `src/slug.js` trae una función con un fallo; «Ejecutar pruebas» la valida de verdad (`useCodeChallenge`, en un entorno aislado)
// y, si pasa todas, da el logro «Código depurado». Easter egg: `npm run hello` en la terminal (el script está en package.json y el README lo menciona) da el logro «Hello, Developer!».
export default function VsCode({ onUnlock }) {
  const { copy } = useValleCopy()
  const v = copy.desktop.vscodeUi
  const c = copy.desktop.codeChallenge
  const challenge = useCodeChallenge(onUnlock)
  const [files, setFiles] = useState(FILES)
  const [tabs, setTabs] = useState([CHALLENGE_FILE])
  const [active, setActive] = useState(CHALLENGE_FILE)
  const [panel, setPanel] = useState('tests')
  const colorLayer = useRef(null)

  const open = (path) => {
    setTabs((current) => (current.includes(path) ? current : [...current, path]))
    setActive(path)
  }
  const closeTab = (path) => {
    const rest = tabs.filter((tab) => tab !== path)
    if (!rest.length) return
    setTabs(rest)
    if (active === path) setActive(rest[rest.length - 1])
  }
  const edit = (text) => setFiles((current) => ({ ...current, [active]: text }))
  const syncScroll = (event) => {
    colorLayer.current.scrollTop = event.target.scrollTop
    colorLayer.current.scrollLeft = event.target.scrollLeft
  }

  const runTests = () => {
    setPanel('tests')
    challenge.run(files[CHALLENGE_FILE])
  }
  const resetChallenge = () => setFiles((current) => ({ ...current, [CHALLENGE_FILE]: STARTER }))

  const lines = highlight(languageOf(active), files[active])
  return (
    <div className="flex h-full min-h-[18rem] flex-col text-xs" style={{ background: '#1e1e1e', color: '#cccccc' }}>
      <div className="flex min-h-0 flex-1">
        <nav aria-label={v.explorer} className="hidden w-40 shrink-0 flex-col overflow-auto border-r py-2 sm:flex" style={{ background: '#252526', borderColor: '#3c3c3c' }}>
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider">{v.explorer}</p>
          <p className="px-3 py-0.5 font-bold">▾ {PROJECT}</p>
          <p className="px-5 py-0.5">▾ src</p>
          {ORDER.map((path) => (
            <button key={path} type="button" className="truncate py-0.5 text-left" style={{ paddingLeft: path.startsWith('src/') ? '2.25rem' : '1.5rem', background: active === path ? '#37373d' : 'transparent', color: active === path ? '#fff' : '#cccccc' }} onClick={() => open(path)}>
              {fileName(path)}
            </button>
          ))}
        </nav>
        <div className="flex min-w-0 flex-1 flex-col">
          <div role="tablist" className="flex shrink-0 overflow-x-auto" style={{ background: '#252526' }}>
            {tabs.map((path) => (
              <span key={path} role="presentation" className="flex shrink-0 items-center gap-2 border-r px-3 py-1.5" style={{ borderColor: '#1e1e1e', background: active === path ? '#1e1e1e' : '#2d2d2d', color: active === path ? '#fff' : '#9d9d9d', borderTop: active === path ? '2px solid #007acc' : '2px solid transparent' }}>
                <button type="button" role="tab" aria-selected={active === path} onClick={() => setActive(path)}>{fileName(path)}</button>
                {tabs.length > 1 && <button type="button" aria-label={`${v.closeTab} ${fileName(path)}`} onClick={() => closeTab(path)}>×</button>}
              </span>
            ))}
          </div>
          {active === CHALLENGE_FILE && (
            <div className="flex shrink-0 items-center gap-2 px-2 py-1" style={{ background: '#2d2d2d' }}>
              <button type="button" data-sound="select" disabled={challenge.status === 'running'} className="rounded px-3 py-0.5 font-bold disabled:opacity-60" style={{ background: '#0e639c', color: '#fff' }} onClick={runTests}>▶ {c.run}</button>
              <button type="button" className="rounded px-2 py-0.5" style={{ background: '#3c3c3c', color: '#ccc' }} onClick={resetChallenge}>{c.reset}</button>
            </div>
          )}
          <div className="relative min-h-0 flex-1" style={{ background: '#1e1e1e' }}>
            <pre ref={colorLayer} aria-hidden="true" className="pointer-events-none absolute inset-0 m-0 overflow-hidden" style={EDITOR}>
              {lines.map((parts, i) => (
                <div key={i}>
                  {parts.map((part, j) => (
                    <span key={j} style={{ color: TOKEN[part.cls] }}>{part.text}</span>
                  ))}
                  {'​'}
                </div>
              ))}
            </pre>
            <textarea
              value={files[active]}
              onChange={(event) => edit(event.target.value)}
              onScroll={syncScroll}
              aria-label={`${v.editor}: ${fileName(active)}`}
              spellCheck="false"
              wrap="off"
              className="absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent outline-none"
              style={{ ...EDITOR, color: 'transparent', caretColor: '#ffffff' }}
            />
          </div>
        </div>
      </div>
      <div className="flex h-2/5 min-h-[7rem] shrink-0 flex-col border-t" style={{ borderColor: '#3c3c3c' }}>
        <div role="tablist" className="flex shrink-0 gap-1 px-2" style={{ background: '#252526' }}>
          {['tests', 'terminal', 'preview'].map((id) => (
            <button key={id} type="button" role="tab" aria-selected={panel === id} className="px-3 py-1 uppercase tracking-wide" style={{ borderBottom: panel === id ? '1px solid #007acc' : '1px solid transparent', color: panel === id ? '#fff' : '#9d9d9d' }} onClick={() => setPanel(id)}>
              {id === 'tests' ? c.tests : v[id]}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1">
          {panel === 'tests' && <TestsPanel challenge={challenge} copy={c} />}
          {panel === 'terminal' && <Terminal files={files} onUnlock={onUnlock} onPreview={() => setPanel('preview')} copy={v} />}
          {panel === 'preview' && <Preview source={files['src/App.jsx']} copy={v} />}
        </div>
      </div>
      <p className="flex shrink-0 justify-between px-2 py-0.5 text-[11px]" style={{ background: '#007acc', color: '#fff' }}>
        <span>⎇ main</span>
        <span>{languageOf(active) === 'js' ? 'JavaScript React' : languageOf(active).toUpperCase()}</span>
      </p>
    </div>
  )
}
