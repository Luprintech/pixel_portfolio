// Dónde está Lupe cuando nadie la lleva a ningún sitio, en píxeles del mapa. Todos los puntos están sobre el camino y dentro
// de la zona de `valleNav.js` (lo comprueba `lupePlaces.test.js`).
//
// Mientras la visita a la casa no se ha hecho espera junto a la entrada, con Khalessi, y da un paseo corto por el
// camino. Cuando ya enseñó la casa, su sitio pasa a ser el de su puerta: vive allí y no hace falta traerla.
export const ENTRANCE = {
  post: { x: 595, y: 757 },
  spots: [{ x: 566, y: 724 }, { x: 640, y: 724 }],
}

export const HOME = {
  post: { x: 512, y: 718 },
  spots: [{ x: 548, y: 724 }],
}

// Hasta dónde guía la visita: junto a la puerta de la casa, sin taparla.
export const TOUR_GOAL = HOME.post

export const placesFor = (story) => (story.tour === 'completed' ? HOME : ENTRANCE)
