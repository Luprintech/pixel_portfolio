import { useEffect, useRef, useState } from 'react'
import { PAL } from '../../game/palette'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'
import { useSoundPrefs } from '../../hooks/useSoundPrefs'
import { tone } from '../../lib/tone'
import { useValleCopy } from '../../lib/valleCopy'
import VolumeSlider from './VolumeSlider'

// Ventana de opciones de la portada. Usa <dialog> nativo: el navegador atrapa el foco,
// cierra con Escape y devuelve el foco al botón que la abrió.
export default function OptionsDialog({ open, onClose, options, onChange, saved, onErase }) {
  const { copy } = useValleCopy()
  const sound = useSoundPrefs()
  const install = useInstallPrompt()
  const ref = useRef(null)
  const [asking, setAsking] = useState(false)
  const [erased, setErased] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      setAsking(false)
      setErased(false)
      dialog.showModal ? dialog.showModal() : dialog.setAttribute('open', '')
    } else if (!open && dialog.open) {
      dialog.close ? dialog.close() : dialog.removeAttribute('open')
    }
  }, [open])

  const erase = () => {
    onErase()
    setAsking(false)
    setErased(true)
  }

  // El cartel con pasos (iPhone) queda por debajo del diálogo modal: se cierra Opciones primero
  const installApp = () => {
    onClose()
    install.request()
  }

  const muted = { color: tone('muted', '#cfc5e0') }

  // En pantallas bajas (menos de 600 px de alto: móvil pequeño o horizontal) los textos de ayuda se ocultan a la vista para que
  // todo quepa sin desplazarse; el del volumen de efectos sigue ligado a su barra para lectores de pantalla.
  // Móvil: una columna compacta que cabe sin desplazarse. Desde tablet y móvil horizontal (sm), dos
  // columnas: los ajustes sueltos a la izquierda y el sonido, que es lo más alto, a la derecha.
  return (
    <dialog ref={ref} className="px-dialog" aria-labelledby="options-title" onClose={onClose}>
      <div
        className="px-frame p-4 sm:p-5 [@media(max-height:600px)]:p-3"
        style={{ background: tone('lavender', PAL.ink), color: tone('ink', PAL.bone), ['--px-ink']: tone('ink', '#0f0e22'), ['--px-ring']: tone('lavender-deep', PAL.saffron) }}
      >
        <h2 id="options-title" className="px-title text-3xl sm:text-4xl [@media(max-height:600px)]:text-3xl" style={{ color: tone('ink', PAL.bone) }}>{copy.options.title}</h2>

        <div className="px-text mt-3 grid gap-x-8 gap-y-4 sm:mt-4 sm:gap-y-6 sm:grid-cols-2 sm:grid-rows-[auto_auto_auto_1fr] [@media(max-height:600px)]:mt-2 [@media(max-height:600px)]:gap-y-2">
          <label className="flex cursor-pointer items-start gap-3 sm:col-start-1 sm:row-start-1">
            <input
              type="checkbox"
              className="px-check mt-0.5"
              checked={options.reduceMotion}
              onChange={(event) => onChange({ ...options, reduceMotion: event.target.checked })}
            />
            <span>
              {copy.options.motion}
              <span className="block text-xs leading-snug sm:text-sm [@media(max-height:600px)]:hidden" style={muted}>{copy.options.motionHint}</span>
            </span>
          </label>

          {/* El sonido ocupa todas las filas de su columna; la última (1fr) absorbe la altura que sobra,
              así los ajustes de la izquierda quedan pegados entre sí en vez de estirarse. */}
          <section className="sm:col-start-2 sm:row-span-4 sm:row-start-1">
            <h3 className="text-sm" style={muted}>{copy.options.soundTitle}</h3>
            {/* En móvil y tablet el general son las teclas físicas del dispositivo */}
            <div className="px-volume-bar">
              <VolumeSlider id="volume-master" label={copy.options.master} value={sound.master} onChange={sound.setMaster} />
            </div>
            <VolumeSlider id="volume-music" label={copy.options.music} value={sound.music} onChange={sound.setMusic} />
            <VolumeSlider
              id="volume-fx"
              label={copy.options.fx}
              hint={copy.options.fxHint}
              value={sound.fx}
              onChange={sound.setFx}
              onCommit={sound.previewFx}
            />
          </section>

          <section className="sm:col-start-1 sm:row-start-2">
            <h3 className="text-sm" style={muted}>{copy.options.saveTitle}</h3>
            {saved && !asking && (
              <button type="button" className="px-btn px-btn--bone mt-2" onClick={() => setAsking(true)}>{copy.options.erase}</button>
            )}
            {saved && asking && (
              <div role="alert" className="mt-2">
                <p className="text-sm">{copy.options.eraseAsk}</p>
                <div className="mt-2 flex flex-wrap gap-4">
                  <button type="button" className="px-btn" onClick={erase}>{copy.options.eraseYes}</button>
                  <button type="button" className="px-btn px-btn--bone" onClick={() => setAsking(false)}>{copy.options.eraseNo}</button>
                </div>
              </div>
            )}
            {!saved && <p className="mt-1 text-sm" role="status">{erased ? copy.options.erased : copy.options.noSave}</p>}
          </section>

          {install.available && (
            <section className="sm:col-start-1 sm:row-start-3">
              <h3 className="text-sm" style={muted}>{copy.options.installTitle}</h3>
              <p className="mt-1 text-xs leading-snug sm:text-sm [@media(max-height:600px)]:hidden">{copy.options.installHint}</p>
              <button type="button" className="px-btn px-btn--bone mt-2" onClick={installApp}>{copy.options.install}</button>
            </section>
          )}

          {/* Con la confirmación abierta el botón principal es "Sí, borrar"; cerrar pasa a secundario.
              En dos columnas queda bajo el sonido, que deja hueco, para que quepa en un móvil horizontal. */}
          <div className="sm:col-start-2 sm:row-start-5 sm:self-end">
            <button type="button" className={asking ? 'px-btn px-btn--bone' : 'px-btn'} onClick={onClose}>{copy.options.close}</button>
          </div>
        </div>
      </div>
    </dialog>
  )
}
