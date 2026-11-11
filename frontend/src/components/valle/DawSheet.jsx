import { useValleCopy } from '../../lib/valleCopy'

// Ficha profesional de DAW (IES Gran Capitán): se abre desde el ordenador del aula y desde las conversaciones del tablón y la pizarra.
// Es una lista de definiciones, para que los lectores de pantalla anuncien cada título con su texto.
export default function DawSheet() {
  const { copy } = useValleCopy()
  const { lead, items, note } = copy.dawSheet
  return (
    <div className="px-text space-y-3">
      <p className="text-[var(--text-secondary)]">{lead}</p>
      <dl className="space-y-3">
        {items.map(({ title, text }) => (
          <div key={title}>
            <dt className="font-semibold">{title}</dt>
            <dd className="max-w-[60ch] leading-relaxed">{text}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-[var(--text-secondary)]">{note}</p>
    </div>
  )
}
