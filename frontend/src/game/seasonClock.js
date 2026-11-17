// Reloj de las estaciones del valle: cuenta SOLO tiempo de juego activo. Un salto grande entre dos lecturas (la pestaña estuvo oculta, el equipo
// dormido o el juego cerrado) no suma nada, así que ni esconder la pestaña ni dejarlo para otro día adelantan el ciclo. No depende de Phaser: lo
// lee `SkyLayer` y también el interior de las casas, porque dentro de una casa el tiempo también pasa.
import { MAX_STEP_MS, TIME_SCALE } from './seasonConfig.js'
import { advanceSeason, climateOf, initialSeason, planSeason, sanitizeSeason } from './valleClimate.js'

export default class SeasonClock {
  // `saved` es lo que guardó la partida (`snapshot`), o nada: sin datos, primavera.
  constructor({ seed, saved, now = performance.now(), scale = TIME_SCALE }) {
    this.seed = seed
    this.scale = scale
    this.state = sanitizeSeason(saved) ?? initialSeason()
    this.plan = planSeason(this.state, seed)
    this.last = now
    this.listeners = new Set()
    this.value = climateOf(this.state, this.plan)
  }

  // Avisa cuando cambia de estación (no al crearse).
  onChange(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // Lee el reloj: suma lo que ha pasado desde la lectura anterior si es un paso normal de juego, y devuelve el clima de ahora.
  tick(now = performance.now(), hidden = typeof document !== 'undefined' && document.hidden) {
    const gap = now - this.last
    this.last = now
    if (gap > 0 && gap <= MAX_STEP_MS && !hidden) this.advance(gap * this.scale)
    return this.value
  }

  advance(dt) {
    const before = this.state.cycle
    const next = advanceSeason(this.state, dt, this.seed, this.plan)
    this.state = next.state
    this.plan = next.plan
    this.value = climateOf(this.state, this.plan)
    if (this.state.cycle !== before) this.listeners.forEach((listener) => listener(this.value))
  }

  // Lo que se guarda con la partida: de aquí se retoma el progreso exacto, sin reiniciar el cupo de episodios.
  snapshot() {
    const { season, cycle, elapsed, carry } = this.state
    // Se redondea hacia abajo: redondear hacia arriba podría dar justo la duración de la estación, que no es un estado válido.
    return { season, cycle, elapsed: Math.floor(elapsed), carry: Math.ceil(carry) }
  }
}
