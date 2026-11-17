// Dónde está lo que vive en el río y a su orilla: los nenúfares, los juncos, los puntos de pesca (cada uno con su poste) y la caña
// olvidada. Todo sale de la forma del río (`river.js`) y de una semilla fija, así que es siempre lo mismo y las pruebas lo pueden
// comprobar. Sin dependencias de Phaser ni de React; las coordenadas son teselas (decimales) salvo que se diga que son píxeles.
import { seeded } from './palette.js'
import { RIVER_SAMPLES, riverAt, riverNear, signedDistance } from './river.js'
import { shiftX, shiftY } from './mapRows.js'

const TILE = 16

// Los cinco sitios donde se puede pescar: `at` es el punto del río (en teselas; se toma el más cercano de la línea central) y `side` la
// orilla (-1 o 1 sobre la normal de `riverAt`). Los nombres son los que usa el monedero para recordar el hallazgo de la primera captura
// de cada sitio. `manantial` está en la cabecera, en la orilla este del tramo por el que el río baja del borde norte, frente a la curva. `recodo` y `desembocadura`, en la orilla sur del último tramo, antes de que el río salga por el borde este.
export const FISH_SPOT_DEFS = [
  { id: 'manantial', at: [shiftX(60), shiftY(10.8)], side: -1 },
  { id: 'ribera', at: [shiftX(53), shiftY(22.5)], side: -1 },
  { id: 'pasarela', at: [shiftX(57), shiftY(35.5)], side: 1 },
  { id: 'recodo', at: [shiftX(55), shiftY(36)], side: -1 },
  { id: 'desembocadura', at: [shiftX(59), shiftY(39)], side: -1 },
]

// La caña olvidada, apoyada en una piedra en la orilla este, al sur del puente romano. Punto de apoyo (centro de la base).
export const ROD_SPOT = { id: 'cana', at: [shiftX(58.5), shiftY(31.5)] }

const facingOf = (dx, dy) => (Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down')

// Puntos de pesca con todo lo que hace falta: dónde se coloca la viajera (`stand`, píxeles), hacia dónde mira, dónde cae el corcho
// (`water`, píxeles dentro del agua) y dónde va el poste (en teselas, a un lado de la viajera).
export function fishSpots() {
  return FISH_SPOT_DEFS.map(({ id, at, side }) => {
    const river = riverAt(riverNear(at[0], at[1]))
    const stand = { x: river.x + side * river.nx * (river.half + 11), y: river.y + side * river.ny * (river.half + 11) }
    const water = { x: river.x + side * river.nx * river.half * 0.5, y: river.y + side * river.ny * river.half * 0.5 }
    const along = { x: -river.ny, y: river.nx }
    return {
      id,
      stand,
      water,
      facing: facingOf(water.x - stand.x, water.y - stand.y),
      post: [(stand.x + along.x * 20) / TILE, (stand.y + along.y * 20) / TILE + 0.5],
    }
  })
}

// Objetos del río y sus orillas como entradas de `PROPS`: nenúfares sobre el agua y juncos en la orilla. `isFree(tx, ty)` dice si una
// tesela de tierra puede llevar decorado (sin camino, plaza, edificio ni puente) y `keepOut(x, y, radius)` si un punto cae demasiado cerca
// de un puente o de la caña. Los puntos de pesca quedan despejados.
export function riverProps(isFree, keepOut) {
  const rand = seeded(88)
  const props = []
  const spots = fishSpots()
  const clear = (x, y, radius) => !keepOut(x, y, radius) && spots.every((spot) => Math.hypot(spot.stand.x - x * TILE, spot.stand.y - y * TILE) > radius * TILE * 1.2)
  // Nenúfares: grupos de dos a cuatro hojas repartidos por el río, en el tercio central del cauce y lejos de los puentes.
  for (let c = 0; c < 12; c++) {
    const river = riverAt(0.1 + (c / 12) * 0.84 + rand() * 0.04)
    const across = (rand() - 0.5) * river.half * 0.9
    const count = 2 + Math.floor(rand() * 3)
    for (let k = 0; k < count; k++) {
      const x = river.x + river.nx * across + (rand() - 0.5) * 30
      const y = river.y + river.ny * across + (rand() - 0.5) * 22
      if (signedDistance(x, y) < 9 || !clear(x / TILE, y / TILE, 2.6)) continue
      props.push({ kind: 'lily', at: [x / TILE, y / TILE + 0.3], variant: rand() < 0.45 ? 1 + Math.floor(rand() * 2) : 0 })
    }
  }
  // Juncos: manojos sueltos a lo largo de las dos orillas, sin cubrir caminos ni los sitios de pesca.
  for (let i = 0; i < 64; i++) {
    const river = riverAt(0.04 + (i / 64) * 0.92 + rand() * 0.015)
    const side = i % 2 === 0 ? 1 : -1
    const reach = river.half + 3 + rand() * 5
    const x = river.x + side * river.nx * reach
    const y = river.y + side * river.ny * reach
    if (!isFree(Math.floor(x / TILE), Math.floor(y / TILE)) || !clear(x / TILE, y / TILE, 2.2)) continue
    props.push({ kind: 'reeds', at: [x / TILE, y / TILE + 0.7], variant: rand() < 0.5 ? 0 : 1 })
  }
  // Postes de pesca junto a cada sitio, y la caña olvidada.
  spots.forEach((spot) => props.push({ kind: 'fishPost', at: spot.post, spot: spot.id }))
  props.push({ kind: 'rod', at: ROD_SPOT.at, collect: ROD_SPOT.id })
  return props
}

// Un punto al azar dentro del agua, alejado de la orilla (para que un pez no se asome por la hierba): lo usan los peces al elegir adónde ir.
export function randomWaterPoint(rand, margin = 8) {
  for (let tries = 0; tries < 30; tries++) {
    const sample = RIVER_SAMPLES[Math.floor(rand() * RIVER_SAMPLES.length)]
    const angle = rand() * Math.PI * 2
    const spread = rand() * sample.half
    const x = sample.x + Math.cos(angle) * spread
    const y = sample.y + Math.sin(angle) * spread
    if (signedDistance(x, y) > margin) return { x, y }
  }
  const middle = RIVER_SAMPLES[Math.floor(RIVER_SAMPLES.length / 2)]
  return { x: middle.x, y: middle.y }
}
