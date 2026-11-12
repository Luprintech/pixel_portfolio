// La pesca como máquina de estados pura: se echa la caña, se espera a que pique, se tira a tiempo y sale algo. Sin Phaser, sin
// React y sin tiempo real (el reloj lo da quien llama, en milisegundos), así que se prueba entera. Está pensada para crecer: la tabla de
// capturas (`CATCHES`) y las reglas de `rollCatch` son lo único que habría que ampliar para tener más peces, cebos o zonas.

// Fases de un lance: 'cast' (la caña vuela), 'wait' (el corcho flota), 'bite' (pica: hay poco tiempo para tirar) y las tres finales:
// 'reel' (se tiró a tiempo), 'early' (se tiró antes de que picara y el pez se asustó) y 'miss' (picó y no se tiró a tiempo).
export const CAST_MS = 600
export const BITE_MS = 1100
export const WAIT_RANGE = [1500, 3800]
export const FINAL_PHASES = ['reel', 'early', 'miss']

// Qué se puede sacar y con qué peso. `junk` son cosas que no son peces: pequeños hallazgos del río. La moneda arcade no está aquí: es el
// premio de la primera captura de cada sitio (ver `rollCatch`).
export const CATCHES = [
  { id: 'barbo', weight: 34 },
  { id: 'boga', weight: 26 },
  { id: 'carpa', weight: 14 },
  { id: 'cangrejo', weight: 8 },
  { id: 'bota', weight: 8, junk: true },
  { id: 'botella', weight: 6, junk: true },
]

export const COIN_FIND = 'moneda'

// Lance nuevo. `rng` es una función que da números en [0, 1): así el tiempo de espera es repetible en las pruebas.
export function startCast(rng) {
  const [min, max] = WAIT_RANGE
  return { phase: 'cast', ms: 0, wait: min + rng() * (max - min) }
}

// Avanza el lance `dt` ms. `pull` es si se acaba de pulsar la acción. Devuelve los sucesos (`bite`, `reel`, `early`, `miss`) para el
// sonido y los avisos. Un lance terminado no cambia más.
export function stepCast(cast, dt, pull) {
  const events = []
  if (FINAL_PHASES.includes(cast.phase)) return events
  cast.ms += dt
  if (cast.phase === 'cast') {
    if (cast.ms >= CAST_MS) {
      cast.phase = 'wait'
      cast.ms = 0
    }
    return events
  }
  if (cast.phase === 'wait') {
    if (pull) {
      cast.phase = 'early'
      cast.ms = 0
      events.push({ type: 'early' })
    } else if (cast.ms >= cast.wait) {
      cast.phase = 'bite'
      cast.ms = 0
      events.push({ type: 'bite' })
    }
    return events
  }
  if (pull) {
    cast.phase = 'reel'
    cast.ms = 0
    events.push({ type: 'reel' })
  } else if (cast.ms >= BITE_MS) {
    cast.phase = 'miss'
    cast.ms = 0
    events.push({ type: 'miss' })
  }
  return events
}

// Qué sale al tirar a tiempo. La primera vez que se pesca en cada sitio (`firstHere`) lo que sale es una moneda arcade enganchada en
// el anzuelo; después, algo de la tabla por peso. Devuelve `{ id, junk, coin }`.
export function rollCatch(rng, { firstHere = false } = {}) {
  if (firstHere) return { id: COIN_FIND, junk: false, coin: true }
  const total = CATCHES.reduce((sum, item) => sum + item.weight, 0)
  let roll = rng() * total
  for (const item of CATCHES) {
    roll -= item.weight
    if (roll < 0) return { id: item.id, junk: Boolean(item.junk), coin: false }
  }
  return { id: CATCHES[0].id, junk: false, coin: false }
}
