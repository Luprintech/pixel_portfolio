import { TESTS } from '../../../game/challenges/codeChallenge'

const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '')
const quote = (value) => JSON.stringify(value)

// Resultado de las pruebas del reto, con el aspecto de la salida de un corredor de pruebas: una línea por prueba visible, con lo
// esperado y lo recibido si falla, y una pista que orienta sin dar la solución. Las ocultas solo se cuentan.
export default function TestsPanel({ challenge, copy }) {
  const { status, summary } = challenge
  const byId = new Map((summary?.failed ?? []).map((result) => [result.id, result]))
  const visible = TESTS.filter((test) => !test.hidden)

  let body
  if (status === 'running') body = <p>{copy.running}</p>
  else if (!summary) body = <p>{copy.idle}</p>
  else if (summary.error) body = <p style={{ color: '#f48771' }}>{fill(copy.errors[summary.error] ?? copy.errors.unavailable, { message: summary.message ?? '' })}</p>
  else {
    body = (
      <>
        <p className="mb-1 font-bold" style={{ color: summary.passed ? '#89d185' : '#e5c07b' }}>{fill(copy.summary, { ok: summary.ok, total: summary.total })}</p>
        <ul className="space-y-1">
          {visible.map((test) => {
            const failure = byId.get(test.id)
            return (
              <li key={test.id}>
                <span style={{ color: failure ? '#f48771' : '#89d185' }}>{failure ? '✗' : '✓'}</span> crearSlug({quote(test.input)})
                {failure && (
                  <span className="block pl-4" style={{ color: '#9d9d9d' }}>
                    {failure.threw
                      ? `${copy.threw}: ${failure.threw}`
                      : `${copy.expected} ${quote(test.expected)} · ${copy.got} ${quote(failure.got)}`}
                    <span className="block" style={{ color: '#e5c07b' }}>→ {copy.hints[test.id]}</span>
                  </span>
                )}
              </li>
            )
          })}
        </ul>
        {summary.hiddenFailed > 0 && <p className="mt-2" style={{ color: '#e5c07b' }}>{copy.hiddenFailed}</p>}
        {summary.passed && <p className="mt-2 font-bold" style={{ color: '#89d185' }}>★ {copy.pass}</p>}
      </>
    )
  }
  return <div className="h-full overflow-auto p-2 text-xs" style={{ background: '#1e1e1e', color: '#cccccc' }} aria-live="polite">{body}</div>
}
