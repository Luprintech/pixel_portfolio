// Geranios y matas de flores compartidos por los edificios: el patio cordobés y la casa de Lupe los llevan en macetas,
// jardineras y balcones. Los colores salen de las ilustraciones de la usuaria.
import { dot, hash2 } from '../pixelKit.js'

export const LEAF = { deep: '#1a2c10', dark: '#2a4614', mid: '#3f6a1c', light: '#6a9a24', hi: '#a8c840' }
export const FLOWERS = {
  red: ['#98251a', '#e8302a', '#f85040', '#ff9a88'],
  pink: ['#c0507c', '#f070a8', '#f888b8', '#ffd0e4'],
  yellow: ['#c08a00', '#f0b800', '#f8d808', '#fff27a'],
  purple: ['#6a2a7a', '#a24aa8', '#c870c8', '#f0b8f0'],
  blue: ['#1a4a9a', '#3a80d8', '#70b0f0', '#c8e4ff'],
}

// Mata de geranios: un bulto redondeado del color de la flor en sombra, salpicado de flores (un píxel de color con su
// brillo encima) y con las hojas asomando por abajo y por los lados. `kinds` reparte los colores entre las flores; todo
// sale de una semilla fija para que la mata sea siempre la misma.
export function flowerClump(g, cx, top, w, h, kinds, seed = 0) {
  const rx = w / 2
  const ry = h / 2
  const cy = top + ry
  const inside = (x, y) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1.05
  const ramp = (x, y) => FLOWERS[kinds[Math.floor(hash2(Math.floor(x / 3), Math.floor(y / 3), seed + 5) * kinds.length)]]
  for (let y = top; y < top + h; y++) {
    for (let x = Math.floor(cx - rx); x < Math.ceil(cx + rx); x++) {
      if (!inside(x, y)) continue
      const dy = (y + 0.5 - cy) / ry
      const side = Math.abs((x + 0.5 - cx) / rx) > 0.8
      if (dy > 0.5 || (side && dy > -0.2 && hash2(x, y, seed) < 0.7)) {
        const n = hash2(x, y, seed + 1)
        dot(g, x, y, n < 0.4 ? LEAF.dark : n < 0.85 ? LEAF.mid : LEAF.light)
      } else dot(g, x, y, ramp(x, y)[1])
    }
  }
  // Flores: rejilla desfasada con un poco de azar; cada una es su color con el brillo arriba y la sombra a la derecha.
  for (let y = top; y < top + h - 1; y += 2) {
    for (let x = Math.floor(cx - rx) + ((y - top) % 4 ? 1 : 0); x < cx + rx; x += 2) {
      const fx = x + (hash2(x, y, seed + 9) < 0.3 ? 1 : 0)
      if (!inside(fx, y) || !inside(fx, y + 1) || (y + 1.5 - cy) / ry > 0.55) continue
      const [dark, , base, light] = ramp(fx, y)
      dot(g, fx, y, light)
      dot(g, fx, y + 1, base)
      if (inside(fx + 1, y + 1) && hash2(fx, y, seed + 2) < 0.5) dot(g, fx + 1, y + 1, dark)
    }
  }
}

// Geranios sueltos, para matas pequeñas (jardineras y macetas): un bulto de hojas y, encima, flores redondas de 3×3 (brillo en
// el centro, cruz del color de la flor y sombra abajo a la derecha) repartidas en tresbolillo. Con flores de 2×2 en una
// jardinera estrecha la mata se leía a rayas.
export function geraniums(g, cx, top, w, h, kind, seed = 0) {
  const rx = w / 2
  const ry = h / 2
  const cy = top + ry
  const inside = (x, y, k = 1) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= k
  for (let y = top; y < top + h; y++) {
    for (let x = Math.floor(cx - rx); x < Math.ceil(cx + rx); x++) {
      if (!inside(x, y, 1.02)) continue
      const n = hash2(x, y, seed)
      dot(g, x, y, n < 0.35 ? LEAF.dark : n < 0.8 ? LEAF.mid : LEAF.light)
    }
  }
  const [dark, mid, base, light] = FLOWERS[kind]
  for (let y = top + 1, row = 0; y < top + h * 0.7; y += 3, row++) {
    for (let x = Math.floor(cx - rx) + 1 + (row % 2 ? 1 : 0); x < cx + rx - 1; x += 3) {
      const fx = x + (hash2(x, y, seed + 3) < 0.25 ? 1 : 0)
      if (!inside(fx, y, 0.75)) continue
      ;[[0, -1], [-1, 0], [1, 0], [0, 1]].forEach(([dx, dy]) => dot(g, fx + dx, y + dy, base))
      dot(g, fx, y, light)
      dot(g, fx - 1, y - 1, mid)
      dot(g, fx + 1, y + 1, dark)
    }
  }
}
