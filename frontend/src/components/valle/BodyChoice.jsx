import { LOOK_STYLES } from '../../game/look'

// Elegir el avatar (mujer u hombre): dos botones iguales. Cada avatar guarda su propio aspecto, así
// que alternar no deshace lo ya elegido en el otro.
export default function BodyChoice({ look, label, names, onPick }) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-2 gap-4">
      {LOOK_STYLES.body.map((body) => (
        <button
          key={body}
          type="button"
          aria-pressed={look.body === body}
          className={`px-btn !min-h-[52px] ${look.body === body ? '' : 'px-btn--bone'}`}
          onClick={() => look.body !== body && onPick(body)}
        >
          {names[body]}
        </button>
      ))}
    </div>
  )
}
