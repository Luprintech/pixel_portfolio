// Vista del cielo por el telescopio de la casa de Lupe. Pinta, sobre un lienzo de 320×180 como el de la portada, el
// cielo con el estado que publica el valle (hora y tiempo) usando los mismos pintores que la portada: franjas, sol y
// luna, estrellas, nubes, pájaros y estrellas fugaces. Solo añade lo propio del telescopio: un campo de estrellas más
// denso y el marco redondo del ocular. Funciones puras de (estado del cielo, milisegundos); sin React ni Phaser.
import { PAL } from './palette.js'
import { rect } from './pixelKit.js'
import { birdsAt, cloudsAt, shootingStar } from './titleMotion.js'
import { HORIZON } from './titleSky.js'
import { paintBird, paintCelestial, paintCloud, paintRain, paintShootingStar, paintSky, paintSnow, paintStars, starField } from './titleSkyPaint.js'

export const VIEW_W = 320
export const VIEW_H = 180
// El ocular: un círculo centrado que deja a los lados el marco oscuro.
const LENS = { cx: VIEW_W / 2, cy: VIEW_H / 2, r: 86 }
const FRAME = '#14132e'

// La portada pinta el cielo hasta el horizonte (HORIZON = 112) y debajo pone el paisaje. Por el telescopio no hay
// paisaje: el cielo se baja `SKY_SHIFT` píxeles para que el horizonte quede en el borde inferior del ocular y por
// encima se prolonga la franja más alta.
const SKY_SHIFT = VIEW_H - HORIZON
// Con el telescopio se ve más cielo que a simple vista: unas 140 estrellas, repartidas por todo el ocular. Se dan en
// las coordenadas del cielo de la portada, por eso empiezan por encima del 0.
const STARS = starField(140, 21, { top: -SKY_SHIFT, depth: VIEW_H - 4 })

// Qué se está viendo, para el texto de la vista: la clave es la de `copy.sky.kinds`.
export function skyKind(sky) {
  if (sky.snow > 0.3) return 'snow'
  if (sky.rain > 0.3) return 'rain'
  const night = sky.dark > 0.5
  if (sky.cloud > 0.5) return night ? 'cloudyNight' : 'cloudyDay'
  return night ? 'clearNight' : 'clearDay'
}

// Cuánto se ven las estrellas: la noche las enciende y las nubes las apagan.
export const starVisibility = (sky) => sky.dark * (1 - sky.cloud * 0.8)

// Marco del ocular: fuera del círculo todo es oscuro y el borde lleva un aro de latón de dos píxeles, a fila
// entera y sin suavizar.
function paintEyepiece(g) {
  const { cx, cy, r } = LENS
  for (let y = 0; y < VIEW_H; y++) {
    const dy = y + 0.5 - cy
    const outer = Math.sqrt(Math.max(0, r * r - dy * dy))
    const inner = Math.sqrt(Math.max(0, (r - 2) * (r - 2) - dy * dy))
    if (outer === 0) {
      rect(g, 0, y, VIEW_W, 1, FRAME)
      continue
    }
    const left = Math.round(cx - outer)
    const right = Math.round(cx + outer)
    rect(g, 0, y, left, 1, FRAME)
    rect(g, right, y, VIEW_W - right, 1, FRAME)
    const ringLeft = Math.round(cx - inner)
    const ringRight = Math.round(cx + inner)
    rect(g, left, y, ringLeft - left, 1, dy < 0 ? PAL.saffronLight : PAL.saffron)
    rect(g, ringRight, y, right - ringRight, 1, dy < 0 ? PAL.saffron : '#8a6422')
  }
}

// Las nubes se ven más grandes y repartidas en altura que en la portada, como corresponde a mirar con aumento.
// Con el cielo cubierto se pinta una segunda capa, más al fondo y desfasada en el tiempo: son muchas más nubes.
const FAR_LAYER_MS = 45000
function paintCloudsUp(g, sky, ms, still) {
  const clock = still ? 0 : ms
  if (sky.cloud > 0.5) {
    cloudsAt(clock + FAR_LAYER_MS, sky.cloud).forEach((c) => paintCloud(g, c.x, 45 + (c.y - 28) * 1.8, c.scale * 1.15, sky))
  }
  cloudsAt(clock, sky.cloud).forEach((c) => paintCloud(g, c.x, 30 + (c.y - 28) * 2.2, c.scale * 1.5, sky))
}

// Pájaros: la bandada de la portada, subida al centro del ocular, que es por donde cruza a lo ancho.
function paintBirdsUp(g, sky, ms) {
  if (sky.dark < 0.6 && sky.rain < 0.3 && sky.snow < 0.3) birdsAt(ms).forEach((b) => paintBird(g, { ...b, y: b.y - 6 }))
}

// Un fotograma de la vista. `ms` es el reloj de la propia vista: hace avanzar nubes, pájaros y estrellas fugaces.
// Con `still` (movimiento reducido) no hay nada en movimiento: las nubes se quedan quietas, sin pájaros ni fugaces.
export function paintSkyView(g, sky, ms, still = false) {
  g.globalAlpha = 1
  rect(g, 0, 0, VIEW_W, SKY_SHIFT, sky.bands[0])
  g.save()
  g.translate(0, SKY_SHIFT)
  paintSky(g, sky)
  const night = starVisibility(sky)
  if (night > 0.05) paintStars(g, ms, still, night, STARS)
  paintCelestial(g, sky)
  g.restore()
  paintCloudsUp(g, sky, ms, still)
  if (!still) paintBirdsUp(g, sky, ms)
  if (!still && night > 0.3) {
    // La portada reparte las fugaces por todo el ancho; aquí se juntan hacia el centro para que caigan dentro del círculo.
    const star = shootingStar(ms)
    if (star) paintShootingStar(g, { ...star, x: LENS.cx + (star.x - 160) * 0.55, y: star.y + 40 })
  }
  paintRain(g, sky, ms)
  paintSnow(g, sky, ms)
  paintEyepiece(g)
}
