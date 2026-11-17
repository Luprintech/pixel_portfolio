// Todo lo que se ajusta del ciclo de estaciones y del tiempo del valle, en un solo sitio. Las duraciones son milisegundos de juego ACTIVO
// (con la pestaña a la vista): ver `seasonClock.js`. Los números de aquí son los definitivos; para probar rápido se sube `TIME_SCALE`
// (con 30, una estación dura 40 s y un episodio de lluvia, un par de segundos) y se devuelve a 1 al terminar.
export const TIME_SCALE = 1

const SECOND = 1000
const MINUTE = 60 * SECOND

// Orden del ciclo. Después del invierno vuelve la primavera.
export const SEASONS = ['spring', 'summer', 'autumn', 'winter']

// Lo que dura cada estación y cuánto tarda en fundirse con la anterior al empezar.
export const SEASON_MS = 20 * MINUTE
export const SEASON_FADE_MS = 30 * SECOND

// Entre el final de un episodio (lluvia o nevada) y el inicio del siguiente pasa, como mínimo, esto. Cuenta también al cambiar de
// estación y al recargar: el tiempo desde el último episodio se guarda con la partida.
export const EPISODE_GAP_MS = 15 * MINUTE
// Desde que empieza una estación (o la partida) hasta que puede empezar el primer episodio: ni abrir el juego ni cambiar de estación
// disparan nada por sí solos.
export const MIN_LEAD_MS = 90 * SECOND
// Margen entre el final de un episodio y el final de la estación.
export const TAIL_MS = 20 * SECOND

// Por estación: cuántos episodios puede haber como máximo (`odds` son las probabilidades de 0, 1, 2... episodios, y suman 1), cuánto dura
// cada uno (`duration`, ms, de mínimo a máximo), de qué tipo es y con cuánta fuerza (0 a 1). Los límites son máximos: puede pasar una estación
// entera sin episodios.
export const EPISODES = {
  spring: { kind: 'rain', odds: [0.1, 0.4, 0.5], duration: [30 * SECOND, 45 * SECOND], strength: 0.55 },
  summer: { kind: 'rain', odds: [0.8, 0.2], duration: [20 * SECOND, 30 * SECOND], strength: 0.4 },
  autumn: { kind: 'rain', odds: [0.1, 0.4, 0.5], duration: [45 * SECOND, 60 * SECOND], strength: 0.8 },
  winter: { kind: 'snow', odds: [0.4, 0.6], duration: [40 * SECOND, 60 * SECOND], strength: 0.85 },
}

// Cómo entra y sale un episodio: las nubes se cierran un poco antes y se abren un poco después; la lluvia o la nieve suben y bajan en estos tiempos.
export const WEATHER_SHAPE = { cloudLead: 12 * SECOND, cloudTrail: 10 * SECOND, rampIn: 6 * SECOND, rampOut: 8 * SECOND }

// Nieve acumulada tras una nevada: se va posando mientras nieva (`settle`), se queda `hold` después de que acabe y se retira poco a poco en
// `melt`. Una nevada solo puede empezar si le da tiempo a derretirse antes de que acabe el invierno.
export const SNOW_COVER = { settle: 20 * SECOND, hold: 3 * MINUTE, melt: 2 * MINUTE }

// Cuánto se salta como máximo entre dos fotogramas al contar el tiempo activo: un salto mayor (pestaña oculta, ordenador dormido) no cuenta.
export const MAX_STEP_MS = 1000

// Cuánto se enseña el nombre de la estación junto al icono cuando cambia.
export const SEASON_LABEL_MS = 5000
