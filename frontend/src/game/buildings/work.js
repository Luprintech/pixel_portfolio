// Lugares de trabajo: laboratorio de DAW y ciberseguridad, taller de proyectos, asistencia en carretera,
// tienda (Copos) y el bar Mihrab.
import { PAL } from '../palette.js'
import { dot, hash2, rect } from '../pixelKit.js'
import { STONE0, STONE1, STONE2, WOOD0, WOOD1, WOOD2, WOOD3, chimney, doorAt, finish, hipRoof, iconAt, newSprite, signBoard, wall, windowAt } from './shared.js'

// DAW y ciberseguridad: casa baja con una pantalla enorme en la ventana y antena en el tejado.
export function labSprite() {
  const s = newSprite(160, 80)
  const { g } = s
  chimney(g, 128, 6, 22)
  wall(g, { x: 4, y: 36, w: 152, h: 44 })
  hipRoof(g, { x: 0, y: 18, w: 160, rows: 4, color: '#5c5a7a', inset: 4 })
  // Antena con dos varillas.
  rect(g, 96, 0, 1, 20, STONE1)
  rect(g, 92, 4, 9, 1, STONE2)
  rect(g, 94, 9, 5, 1, STONE2)
  // Ventana-pantalla con código.
  windowAt(s, 68, 46, 36, 22, { screen: '#1f3f78' })
  iconAt(g, 74, 50, 'code', '#8fd3dd', 2)
  rect(g, 90, 52, 10, 1, '#8fd3dd')
  rect(g, 90, 56, 7, 1, '#f8d77a')
  rect(g, 90, 60, 9, 1, '#8fd3dd')
  windowAt(s, 118, 48, 16, 20, { shutters: PAL.teal, flowers: true })
  doorAt(s, 28, 77, { w: 12, h: 21 })
  signBoard(g, 22, 40, 24, 7, { color: '#2e2d5a', ink: '#8fd3dd', icon: null })
  rect(g, 26, 43, 3, 1, '#8fd3dd')
  rect(g, 31, 43, 6, 1, '#f8d77a')
  return finish(s)
}

// Taller de proyectos: un gran engranaje sobre el tejado y una ventana de banco de trabajo encendida.
export function workshopSprite() {
  const s = newSprite(144, 112)
  const { g } = s
  chimney(g, 112, 22, 32)
  wall(g, { x: 4, y: 52, w: 136, h: 60 })
  hipRoof(g, { x: 0, y: 32, w: 144, rows: 5, color: '#c85a48', inset: 4 })
  iconAt(g, 54, 4, 'gear', PAL.saffron, 5)
  iconAt(g, 55, 5, 'gear', '#c4872a', 5)
  iconAt(g, 54, 3, 'gear', PAL.saffronLight, 5)
  // Banco de trabajo visto por una ventana ancha.
  windowAt(s, 18, 64, 52, 30, { screen: '#f2c570' })
  rect(g, 20, 84, 48, 4, WOOD1)
  rect(g, 20, 84, 48, 1, WOOD3)
  rect(g, 24, 88, 3, 6, WOOD0)
  rect(g, 60, 88, 3, 6, WOOD0)
  rect(g, 28, 78, 8, 6, '#7a789a')
  rect(g, 44, 74, 2, 10, STONE0)
  rect(g, 41, 72, 8, 3, STONE1)
  rect(g, 54, 80, 8, 4, PAL.tile)
  doorAt(s, 100, 109, { w: 14, h: 24, glow: true })
  windowAt(s, 120, 68, 12, 14, { shutters: PAL.saffron })
  return finish(s)
}

// Asistencia en carretera: cochera con persiana medio subida, rótulo de grúa y franja amarilla y negra.
export function garageSprite() {
  const s = newSprite(176, 96)
  const { g } = s
  wall(g, { x: 4, y: 44, w: 168, h: 52, base: '#d6c8aa', dark: '#b8aa8c' })
  hipRoof(g, { x: 0, y: 28, w: 176, rows: 4, color: '#8a74b4', inset: 4 })
  // Persiana: lamas grises, la mitad subida enseña el interior oscuro.
  rect(g, 18, 56, 64, 38, WOOD0)
  rect(g, 20, 58, 60, 34, '#2a2438')
  for (let y = 58; y < 76; y += 3) {
    rect(g, 20, y, 60, 2, '#a8a6bc')
    rect(g, 20, y + 2, 60, 1, '#7a789a')
  }
  rect(g, 20, 76, 60, 1, STONE0)
  signBoard(g, 94, 46, 28, 10, { color: '#f2b134', ink: WOOD0, icon: null })
  iconAt(g, 99, 47, 'hook', WOOD0)
  rect(g, 108, 51, 10, 1, WOOD0)
  doorAt(s, 128, 93, { w: 12, h: 22, color: '#6fa3b8' })
  windowAt(s, 148, 62, 16, 16, { flowers: true })
  for (let x = 4; x < 172; x += 8) {
    rect(g, x, 90, 4, 4, '#f2b134')
    rect(g, x + 4, 90, 4, 4, WOOD0)
  }
  return finish(s)
}

// Tienda con toldo de rayas azules y blancas, escaparate de fruta y un congelador al lado.
export function shopSprite() {
  const s = newSprite(176, 96)
  const { g } = s
  wall(g, { x: 4, y: 40, w: 168, h: 56 })
  hipRoof(g, { x: 0, y: 24, w: 176, rows: 4, color: '#4a5a9a', inset: 4 })
  signBoard(g, 18, 42, 26, 12, { icon: 'cart', color: '#f4e8c8', ink: '#3a4a8a' })
  // Toldo con el borde festoneado.
  for (let x = 12; x < 112; x += 6) {
    const stripe = Math.floor((x - 12) / 6) % 2 ? '#f6f0e0' : '#4a6ac0'
    rect(g, x, 58, 6, 10, stripe)
    rect(g, x, 68, 6, 2, stripe)
    rect(g, x + 1, 70, 4, 1, stripe)
    rect(g, x, 58, 6, 1, '#2a3a7a')
  }
  windowAt(s, 18, 74, 36, 16, { screen: '#3a2a4a' })
  for (let i = 0; i < 9; i++) {
    const x = 20 + i * 4
    rect(g, x, 82, 3, 6, [PAL.tile, PAL.saffron, '#62b04a', PAL.tile, PAL.saffronLight][i % 5])
    dot(g, x, 82, '#ffffff')
  }
  rect(g, 18, 88, 36, 2, WOOD1)
  doorAt(s, 118, 93, { w: 12, h: 22, color: WOOD2 })
  // Congelador con un copo de nieve.
  rect(g, 142, 66, 26, 28, '#a9d0e6')
  rect(g, 142, 66, 26, 3, '#d3f0f2')
  rect(g, 142, 91, 26, 3, '#6fb3c6')
  rect(g, 143, 69, 24, 22, '#e6f6fb')
  iconAt(g, 151, 74, 'snow', '#6fb3c6', 1)
  rect(g, 154, 84, 8, 1, '#a9d0e6')
  return finish(s)
}

// Mihrab, el bar: arcos cálidos con luces, toldo rosa y enredadera con flores por el tejado.
export function barSprite() {
  const s = newSprite(224, 128)
  const { g } = s
  wall(g, { x: 4, y: 58, w: 216, h: 70, base: '#e8c8a0', dark: '#c9a580' })
  hipRoof(g, { x: 0, y: 36, w: 224, rows: 5, color: '#9b4a78', inset: 4 })
  ;[22, 152].forEach((x) => {
    rect(g, x - 2, 76, 52, 48, WOOD0)
    rect(g, x, 74, 48, 2, WOOD0)
    windowAt(s, x, 78, 48, 44, { screen: '#d9893a' })
    // Barra, taburetes y botellas vistos desde fuera.
    rect(g, x + 2, 104, 44, 4, WOOD1)
    rect(g, x + 2, 104, 44, 1, WOOD3)
    for (let i = 0; i < 4; i++) rect(g, x + 6 + i * 9, 92, 3, 12, [PAL.teal, PAL.tile, PAL.saffronLight, PAL.plum][i])
    for (let i = 0; i < 5; i++) dot(g, x + 4 + i * 9, 82 + (i % 2), '#fff6a8')
  })
  doorAt(s, 104, 125, { w: 16, h: 26, glow: true })
  // Toldo a rayas rosas.
  for (let x = 14; x < 210; x += 6) {
    if (x > 92 && x < 128) continue
    const stripe = Math.floor(x / 6) % 2 ? '#f6f0e0' : '#e07a9c'
    rect(g, x, 66, 6, 6, stripe)
    rect(g, x + 1, 72, 4, 1, stripe)
  }
  // Enredadera con flores a la izquierda del tejado y por la fachada.
  for (let i = 0; i < 90; i++) {
    const x = 4 + Math.floor(hash2(i, 1, 7) * 72)
    const y = 36 + Math.floor(hash2(i, 2, 7) * 56)
    dot(g, x, y, hash2(i, 3, 7) > 0.45 ? '#e0709a' : '#4f7f3f')
  }
  rect(g, 4, 124, 216, 1, STONE0)
  return finish(s)
}
