import { useState } from 'react'

// Operaciones de la calculadora. `÷` entre cero da un error que se limpia con C.
const OPS = { '+': (a, b) => a + b, '-': (a, b) => a - b, '×': (a, b) => a * b, '÷': (a, b) => (b === 0 ? NaN : a / b) }

const KEYS = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', '=', '+']

const format = (value) => (Number.isFinite(value) ? String(Number(value.toFixed(10))) : 'Error')

// Calculadora de Windows XP: dígitos, las cuatro operaciones, borrar y cambiar de signo. Cada pulsación aplica la operación
// pendiente (sin jerarquía, como las calculadoras sencillas).
export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [pending, setPending] = useState(null)
  const [fresh, setFresh] = useState(true)

  const press = (key) => {
    if (display === 'Error' && key !== 'C') return
    if (/\d/.test(key)) {
      setDisplay(fresh || display === '0' ? key : display + key)
      setFresh(false)
    } else if (key === '.') {
      if (fresh) setDisplay('0.')
      else if (!display.includes('.')) setDisplay(`${display}.`)
      setFresh(false)
    } else if (key === 'C') {
      setDisplay('0')
      setPending(null)
      setFresh(true)
    } else if (key === '±') {
      setDisplay(display.startsWith('-') ? display.slice(1) : display === '0' ? display : `-${display}`)
    } else {
      const current = Number(display)
      const result = pending ? OPS[pending.op](pending.value, current) : current
      setDisplay(format(result))
      setPending(key === '=' || !Number.isFinite(result) ? null : { op: key, value: result })
      setFresh(true)
    }
  }

  const button = (key, extra = '') => (
    <button key={key} type="button" className={`rounded border py-2 text-base font-semibold ${extra}`} style={{ borderColor: '#003c74', background: /\d|\./.test(key) ? '#fff' : '#d6e4f7', color: '#003c74' }} onClick={() => press(key)}>
      {key}
    </button>
  )

  return (
    <div className="mx-auto w-56 space-y-2" style={{ background: '#ece9d8', margin: '-1rem auto', padding: '1rem' }}>
      <output aria-live="polite" aria-label="Resultado" className="block overflow-hidden rounded border-2 px-2 py-1 text-right text-2xl" style={{ borderColor: '#7f9db9', background: '#fff', fontFamily: '"Courier New", monospace' }}>{display}</output>
      <div className="grid grid-cols-4 gap-1">
        {button('C', 'col-span-2 !bg-[#f4c7c3]')}
        {button('±', 'col-span-2')}
        {KEYS.map((key) => button(key))}
      </div>
    </div>
  )
}
