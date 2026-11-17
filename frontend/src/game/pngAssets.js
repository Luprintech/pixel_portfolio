// Dibujos del valle que no se pintan con código sino que salen de un PNG ya a la resolución del juego (la grúa, el autobús de Aucorsa, la fuente de la plaza, el Triunfo de San Rafael y
// el quiosco de helados). Las imágenes se decodifican de forma asíncrona y los dibujos se preparan de forma síncrona
// (`worldAssets.js`): por eso `warmEntry` espera a `loadPngAssets` antes de pintar nada, y la escena solo arranca
// después de `warmEntry`. Sin Phaser.
import aucorsaBusUrl from './assets/aucorsaBus.png'
import fountainBaseUrl from './assets/fountainBase.png'
import kioskBackUrl from './assets/kioskBack.png'
import kioskFrontUrl from './assets/kioskFront.png'
import sanRafaelUrl from './assets/sanRafael.png'
import towTruckUrl from './assets/towTruck.png'

const URLS = { aucorsaBus: aucorsaBusUrl, fountainBase: fountainBaseUrl, kioskBack: kioskBackUrl, kioskFront: kioskFrontUrl, sanRafael: sanRafaelUrl, towTruck: towTruckUrl }
const images = {}
let loading = null

const loadOne = (name) =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      images[name] = img
      resolve()
    }
    // Si una imagen no carga, su dibujo queda transparente pero conserva su cuerpo sólido: el valle entra igual.
    img.onerror = () => resolve()
    img.src = URLS[name]
  })

export function loadPngAssets() {
  if (!loading) loading = typeof Image === 'undefined' ? Promise.resolve() : Promise.all(Object.keys(URLS).map(loadOne))
  return loading
}

// Copia la imagen `name` en el lienzo, con su esquina superior izquierda en (x, y). Sin la imagen no pinta nada.
export function drawPng(g, name, x = 0, y = 0) {
  if (images[name]) g.drawImage(images[name], x, y)
}
