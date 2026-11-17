// Fuente de la plaza, inspirada en la de Las Tendillas de Córdoba: el Gran Capitán a caballo en bronce sobre un pedestal de
// ladrillo con medallones y gradas de piedra clara, en el centro de un estanque redondo. Es la ilustración de la usuaria
// (`docs/referencias/fuente-gran-capitan-original.webp`), reducida con vecino más cercano a su rejilla nativa (cada píxel del
// dibujo ocupaba 7×7 en el original), así que el caballo y el jinete salen tal cual. De la copia del juego se quitaron los
// surtidores pintados y se rehízo el agua en su sitio: los surtidores son ahora animados (`fountainJets.js`). Sin lógica de juego.
import { makeCanvas } from './pixelKit.js'
import { drawPng } from './pngAssets.js'

export const FOUNTAIN_SIZE = { w: 142, h: 152 }

// Suelo que ocupa el estanque: la elipse del pretil a media altura de su murete, en píxeles del dibujo.
const BASIN = { cx: 71, cy: 111, rx: 70, ry: 31 }
const BODY_BANDS = 5

// Cuerpo sólido: el pretil entero, aproximado por franjas horizontales que siguen la elipse (un solo rectángulo dejaba esquinas
// invisibles donde la viajera se quedaba enganchada al rodearla). Medido desde el punto de apoyo, el centro de la base del dibujo.
function basinBodies() {
  const { cy, rx, ry } = BASIN
  const centre = cy - FOUNTAIN_SIZE.h
  const bandH = (ry * 2) / BODY_BANDS
  return Array.from({ length: BODY_BANDS }, (_, i) => {
    const top = -ry + i * bandH
    const bottom = top + bandH
    // Ancho de la elipse en el borde de la franja más cercano al centro, para que no queden huecos en la curva.
    const near = top < 0 && bottom > 0 ? 0 : Math.min(Math.abs(top), Math.abs(bottom))
    const half = Math.round(rx * Math.sqrt(1 - (near / ry) ** 2)) - 1
    return { l: -half, r: half, t: Math.round(centre + top), b: Math.round(centre + bottom) }
  })
}

export const FOUNTAIN_BODY = basinBodies()

// Lo que puede tapar entera a una figura que pasa por detrás: el pedestal y la estatua, medidos desde el punto de apoyo. El
// estanque solo le tapa los pies, así que no cuenta (ver `seeThrough.js`).
export const FOUNTAIN_OCCLUDER = { l: -36, r: 36, t: -FOUNTAIN_SIZE.h, b: -38 }

export function granCapitanFountain() {
  const canvas = makeCanvas(FOUNTAIN_SIZE.w, FOUNTAIN_SIZE.h)
  drawPng(canvas.getContext('2d'), 'fountainBase')
  return { canvas, body: FOUNTAIN_BODY, seeThrough: FOUNTAIN_OCCLUDER, jets: true, painted: true }
}
