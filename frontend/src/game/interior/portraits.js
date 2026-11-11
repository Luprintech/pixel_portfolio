// Retratos de quien habla en un diálogo: la cabeza del propio sprite del personaje (el mismo dibujo que se ve en el
// mundo, con los cascos de Atreus) o, en el caso de Khalessi, su figura entera. Se devuelven como imágenes pequeñas y la
// interfaz las amplía sin suavizar. Sin dependencias de Phaser ni de React.
import { avatarCanvas } from '../avatar/index.js'
import { ATREUS_LOOK } from '../atreus.js'
import { GRACE_LOOK } from '../grace.js'
import { LUPE_LOOK } from '../lupe.js'
import { khalessiSitCanvas } from '../pets/index.js'
import { makeCanvas } from '../pixelKit.js'
import { paintHeadset } from './atreusSheet.js'
import { YLONEM_LOOK } from '../ylonem.js'

// Zona de la cabeza dentro del fotograma de 18×34 de una persona: del borde del pelo al cuello.
const HEAD = { x: 0, y: 1, w: 18, h: 18 }

function headOf(frame) {
  const canvas = makeCanvas(HEAD.w, HEAD.h)
  canvas.getContext('2d').drawImage(frame, HEAD.x, HEAD.y, HEAD.w, HEAD.h, 0, 0, HEAD.w, HEAD.h)
  return canvas
}

function atreusFrame() {
  const frame = avatarCanvas(ATREUS_LOOK, 'down', 0)
  paintHeadset(frame.getContext('2d'), 'down')
  return frame
}

const PORTRAITS = {
  lupe: () => headOf(avatarCanvas(LUPE_LOOK, 'down', 0)),
  atreus: () => headOf(atreusFrame()),
  ylonem: () => headOf(avatarCanvas(YLONEM_LOOK, 'down', 0)),
  grace: () => headOf(avatarCanvas(GRACE_LOOK, 'down', 0)),
  khalessi: () => khalessiSitCanvas(false, 0),
}

const cache = new Map()

// Imagen del retrato como URL de datos, calculada una sola vez por personaje.
export function portraitUrl(who) {
  if (!PORTRAITS[who]) return null
  if (!cache.has(who)) cache.set(who, PORTRAITS[who]().toDataURL())
  return cache.get(who)
}
