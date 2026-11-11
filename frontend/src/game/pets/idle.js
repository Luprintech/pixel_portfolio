// Qué hace la mascota de la viajera cuando esta se queda parada, como un animal normal: el gato se sienta, se asea, maúlla y
// juega; el perro se sienta y juega. Sin Phaser: devuelve la postura y un pequeño movimiento, y la escena lo dibuja. Con la
// viajera en marcha vuelve a seguirla de inmediato.

// Rato que la viajera tiene que llevar parada antes de que la mascota empiece a hacer cosas.
export const IDLE_AFTER_MS = 2500

// Rutinas: postura y cuánto dura (ms). 'meow' es un instante: suena una vez al empezar. Se repiten en bucle.
const ROUTINES = {
  gato: [['sit', 2200], ['wash', 3200], ['sit', 1400], ['meow', 1100], ['play', 2600], ['sit', 2000]],
  perro: [['sit', 3200], ['play', 2800], ['sit', 2600], ['play', 2200]],
}

export const createIdle = (rng = Math.random) => ({ pose: 'stand', t: 0, step: 0, left: 0, forced: null, sound: null, rng })

function enter(idle, kind, index) {
  const routine = ROUTINES[kind]
  const [pose, ms] = routine[index % routine.length]
  idle.step = index % routine.length
  idle.pose = pose
  idle.t = 0
  // Cada vuelta dura un poco distinto para que no parezca un reloj.
  idle.left = ms * (0.85 + idle.rng() * 0.3)
  if (pose === 'meow') idle.sound = true
}

// `still` es cuánto lleva parada la viajera; `forced` ('sit' o 'play') manda sobre la rutina (por ejemplo, ante Khalessi).
export function updateIdle(idle, dt, { still, kind, forced = null }) {
  const routine = ROUTINES[kind]
  idle.forced = forced
  if (!routine) {
    idle.pose = 'stand'
    return idle
  }
  if (forced) {
    if (idle.pose !== forced) Object.assign(idle, { pose: forced, t: 0 })
    idle.t += dt
    return idle
  }
  if (still < IDLE_AFTER_MS) {
    Object.assign(idle, { pose: 'stand', t: 0, step: 0, left: 0 })
    return idle
  }
  if (idle.pose === 'stand' || idle.left <= 0) enter(idle, kind, idle.pose === 'stand' ? 0 : idle.step + 1)
  idle.t += dt
  idle.left -= dt
  return idle
}

// Quien dibuja recoge el maullido una sola vez.
export function takeSound(idle) {
  const sound = idle.sound
  idle.sound = null
  return sound
}

// Desplazamiento del juego: saltitos y un ir y venir corto, mirando hacia donde va.
export function playOffset(t) {
  const swing = Math.sin(t / 380)
  return { dx: Math.round(swing * 5), dy: -Math.round(Math.abs(Math.sin(t / 130)) * 3), face: Math.cos(t / 380) >= 0 ? 'right' : 'left' }
}
