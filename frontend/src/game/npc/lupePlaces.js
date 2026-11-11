import { tourStarted } from '../story/story.js'

// Dónde está Lupe cuando nadie la lleva a ningún sitio, en píxeles del mapa. Todos los puntos están sobre el camino y dentro
// de la zona de `valleNav.js` (lo comprueba `lupePlaces.test.js`).
//
// Mientras la visita a la casa no se ha empezado espera en el cruce de caminos de la entrada, con Khalessi, y da un paseo corto
// por el camino. La viajera llega a pie por el arco del sur (`ARRIVAL` en `world.js`) y se la encuentra allí. Cuando ya
// enseñó la casa, su sitio pasa a ser el de su puerta: vive allí y no hace falta traerla.
export const ENTRANCE = {
  post: { x: 608, y: 712 },
  spots: [{ x: 566, y: 724 }, { x: 640, y: 724 }],
}

export const HOME = {
  post: { x: 512, y: 718 },
  spots: [{ x: 548, y: 724 }],
}

// Hasta dónde guía la visita: pegada a la puerta de la casa (a un lado, sin taparla), para que la viajera que la sigue
// quede también junto a la puerta y entrar sea natural.
export const TOUR_GOAL = { x: 506, y: 716 }

// Donde se detiene para entrar en casa cuando la viajera acepta verla: sobre la baldosa de la puerta.
export const HOME_DOOR = { x: 488, y: 716 }

// Vive en su puerta cuando ya enseñó la casa o la dejó a medias (así no vuelve sola a la entrada tras salir de ella).
export const placesFor = (story) => (story.tour === 'completed' || tourStarted(story) ? HOME : ENTRANCE)
