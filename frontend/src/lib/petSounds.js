// Sonido de las mascotas del creador: el maullido de los gatos y el ladrido de los perros, grabaciones
// de `public/sounds/`. Solo suenan al pulsar el botón, que es el gesto que los navegadores exigen para
// dar audio. Cada raza afina la voz según su tamaño cambiando la velocidad de reproducción: las
// pequeñas suenan más agudas y las grandes más graves.

const SOUNDS = {
  gato: '/sounds/Maullido gato.mp3',
  perro: '/sounds/Ladrido perro.mp3',
}

// Velocidad de cada raza respecto a la grabación: por encima de 1 es más agudo, por debajo, más grave.
const RATE = {
  collie: 1,
  pastor: 0.85,
  beagle: 1.1,
  husky: 0.95,
  teckel: 1.2,
  comun: 1,
  persa: 0.92,
  maine: 0.82,
  sphynx: 1.15,
  bengala: 1.05,
}

// Qué grabación suena y a qué velocidad, aparte del audio para poder comprobarlo sin un navegador.
export function petSound(kind, breed) {
  return { src: encodeURI(SOUNDS[kind]), rate: RATE[breed] ?? 1 }
}

let playing = null

// Hace sonar a la mascota; si ya estaba sonando, empieza de nuevo. Devuelve una promesa con false si
// el navegador no puede reproducirlo (sin audio, o archivo que no carga).
export async function playPetSound(kind, breed) {
  if (typeof Audio === 'undefined' || !SOUNDS[kind]) return false
  const { src, rate } = petSound(kind, breed)
  playing?.pause()
  const audio = new Audio(src)
  // Sin esto el navegador corrige el tono al cambiar la velocidad y todas las razas sonarían igual.
  audio.preservesPitch = false
  audio.playbackRate = rate
  audio.volume = 0.8
  playing = audio
  try {
    await audio.play()
    return true
  } catch {
    return false
  }
}
