// Ayudas de color para sacar sombras, luces y contrastes del pelaje que elige la viajera.
import { shade, tint } from '../palette.js'

// Luminosidad percibida de 0 a 255.
export function lum(hex) {
  const n = parseInt(hex.slice(1), 16)
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)
}

// Un tono cercano al color: más oscuro si es claro y más claro si es oscuro, así un pelaje negro
// también enseña sus rayas y sus sombras.
export function contrast(hex, amount) {
  return lum(hex) > 110 ? shade(hex, 1 - amount) : tint(hex, amount)
}

// Devuelve `preferred` si se distingue sobre `surface`; si no, un tono que sí se vea.
export function readable(surface, preferred) {
  if (Math.abs(lum(surface) - lum(preferred)) >= 50) return preferred
  return lum(surface) < 110 ? '#e8c040' : '#2a1a1a'
}

// Nariz oscura, salvo sobre un hocico negro, donde pasa a rosa para no perderse.
export const noseOn = (muzzle) => (lum(muzzle) < 80 ? '#b07080' : '#1e1420')
