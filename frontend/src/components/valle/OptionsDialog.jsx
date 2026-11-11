import { useEffect, useRef, useState } from 'react'
import { ACHIEVEMENT_IDS, SECRET_IDS } from '../../game/achievements'
import { PAL } from '../../game/palette'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'
import { useSoundPrefs } from '../../hooks/useSoundPrefs'
import { tone } from '../../lib/tone'
import { useValleCopy } from '../../lib/valleCopy'
import VolumeSlider from './VolumeSlider'

// Todos los botones del diálogo miden lo mismo (`--ctl`, definido en el marco) y usan el mismo texto: antes cada
// uno tenía su propio alto y la columna se veía descompensada.
const BTN = '!min-h-[var(--ctl)] !px-3 !py-0 !text-sm'

// Ventana de opciones de la portada. Usa <dialog> nativo: el navegador atrapa el foco,
// cierra con Escape y devuelve el foco al botón que la abrió. `onSave` (solo en el valle) guarda la partida y
// devuelve si pudo; sin él no hay botón de guardar.
export default function OptionsDialog({ open, onClose, saved, onErase, onSave = null, actions = null, achievements = null }) {
  const { copy } = useValleCopy()
  const sound = useSoundPrefs()
  const install = useInstallPrompt()
  const ref = useRef(null)
  const [asking, setAsking] = useState(false)
  const [erased, setErased] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      setAsking(false)
      setErased(false)
      setJustSaved(false)
      dialog.showModal ? dialog.showModal() : dialog.setAttribute('open', '')
      // El foco empieza en el título y no en "Cerrar": así, al abrir con un toque, el botón no sale con el aro de foco.
      dialog.querySelector('#options-title')?.focus()
    } else if (!open && dialog.open) {
      dialog.close ? dialog.close() : dialog.removeAttribute('open')
    }
  }, [open])

  const erase = () => {
    onErase()
    setAsking(false)
    setErased(true)
    setJustSaved(false)
  }

  const save = () => {
    setJustSaved(onSave())
    setErased(false)
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
        style={{ background: tone('lavender', PAL.ink), color: tone('ink', PAL.bone), ['--ctl']: '2.75rem', ['--px-ink']: tone('ink', '#0f0e22'), ['--px-ring']: tone('lavender-deep', PAL.saffron) }}
      >
        {/* "Cerrar" va en la esquina superior derecha, a la altura del título: siempre a la vista, sin
            tener que bajar hasta el final del diálogo. Con la confirmación de borrado abierta pasa a
            secundario, porque el botón principal es "Sí, borrar". */}
        <div className="flex items-center justify-between gap-3">
          <h2 id="options-title" tabIndex={-1} className="px-title text-3xl outline-none sm:text-4xl [@media(max-height:600px)]:text-3xl" style={{ color: tone('ink', PAL.bone) }}>{copy.options.title}</h2>
          <button type="button" data-sound="back" className={`${asking ? 'px-btn px-btn--bone' : 'px-btn'} ${BTN}`} onClick={onClose}>{copy.options.close}</button>
        </div>

        <div className="px-text mt-4 grid gap-x-8 gap-y-4 sm:mt-4 sm:gap-y-6 sm:grid-cols-2 sm:grid-rows-[auto_auto_auto_1fr] [@media(max-height:600px)]:mt-2 [@media(max-height:600px)]:gap-y-2">
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

          <section className="sm:col-start-1 sm:row-start-1">
            <h3 className="text-sm" style={muted}>{copy.options.saveTitle}</h3>
            {onSave && !asking && (
              <>
                <button type="button" className={`px-btn mt-2 w-full ${BTN}`} onClick={save}>{copy.options.save}</button>
                {justSaved && <p className="mt-1 text-sm" role="status">{copy.options.savedNow}</p>}
                <p className="mt-1 text-xs leading-snug sm:text-sm [@media(max-height:600px)]:hidden">{copy.options.autosaveHint}</p>
              </>
            )}
            {saved && !asking && (
              <button type="button" className={`px-btn px-btn--bone mt-2 w-full ${BTN}`} onClick={() => setAsking(true)}>{copy.options.erase}</button>
            )}
            {saved && asking && (
              <div role="alert" className="mt-2">
                <p className="text-sm">{copy.options.eraseAsk}</p>
                <div className="mt-2 flex flex-wrap gap-4">
                  <button type="button" className={`px-btn ${BTN}`} onClick={erase}>{copy.options.eraseYes}</button>
                  <button type="button" data-sound="back" className={`px-btn px-btn--bone ${BTN}`} onClick={() => setAsking(false)}>{copy.options.eraseNo}</button>
                </div>
              </div>
            )}
            {!saved && !justSaved && <p className="mt-1 text-sm" role="status">{erased ? copy.options.erased : copy.options.noSave}</p>}
          </section>

          {achievements && (
            <section className="sm:col-start-1">
              <h3 className="text-sm" style={muted}>{copy.achievements.title} ({achievements.size}/{ACHIEVEMENT_IDS.length})</h3>
              <ul className="mt-2 space-y-1">
                {ACHIEVEMENT_IDS.map((id) => {
                  const done = achievements.has(id)
                  const item = copy.achievements.items[id]
                  const hidden = !done && SECRET_IDS.includes(id)
                  return (
                    <li key={id} className="flex items-start gap-2 text-sm" style={{ opacity: done ? 1 : 0.6 }}>
                      <span aria-hidden="true">{done ? '★' : '☆'}</span>
                      <span>
                        <strong>{hidden ? '???' : item.name}</strong>
                        <span className="block text-xs">{hidden ? copy.achievements.secret : done ? item.desc : `${copy.achievements.locked}: ${item.desc}`}</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {install.available && (
            <section className="sm:col-start-1 sm:row-start-2">
              <h3 className="text-sm" style={muted}>{copy.options.installTitle}</h3>
              <p className="mt-1 text-xs leading-snug sm:text-sm [@media(max-height:600px)]:hidden">{copy.options.installHint}</p>
              <button type="button" className={`px-btn px-btn--bone mt-2 w-full ${BTN}`} onClick={installApp}>{copy.options.install}</button>
            </section>
          )}

          {/* Acciones de la pantalla que abre el diálogo (en el valle, las que no caben en la barra de un móvil). */}
          {actions && (
            <section className="md:hidden">
              <h3 className="text-sm" style={muted}>{copy.options.valleTitle}</h3>
              <div className="mt-2 grid grid-cols-2 gap-2">{actions}</div>
            </section>
          )}
        </div>
      </div>
    </dialog>
  )
}
