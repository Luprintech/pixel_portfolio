// Barra de volumen con su nombre y su porcentaje. `onCommit` avisa al soltarla: sirve para dejar oír
// cómo suena lo que se acaba de ajustar.
export default function VolumeSlider({ id, label, hint, value, onChange, onCommit }) {
  const percent = Math.round(value * 100)
  return (
    <div className="px-text mt-4">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id}>{label}</label>
        <span aria-hidden="true" style={{ color: '#cfc5e0' }}>{percent} %</span>
      </div>
      <input
        id={id}
        type="range"
        min="0"
        max="100"
        step="5"
        value={percent}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        aria-valuetext={`${percent} %`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="px-range w-full"
      />
      {hint && <p id={`${id}-hint`} className="text-sm" style={{ color: '#cfc5e0' }}>{hint}</p>}
    </div>
  )
}
