const MUTED = '#cfc5e0'

// Un campo del creador: su nombre y, debajo, las opciones.
export default function FieldGroup({ legend, children }) {
  return (
    <fieldset className="px-text min-w-0">
      <legend className="mb-3 text-base" style={{ color: MUTED }}>{legend}</legend>
      {children}
    </fieldset>
  )
}
