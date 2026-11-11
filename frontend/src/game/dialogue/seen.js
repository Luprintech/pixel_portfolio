// Qué conversaciones se han abierto ya, para que las repeticiones sustituyan a las presentaciones en visitas
// posteriores. Se guarda en el navegador, aparte de la partida; `clearSave` lo borra con ella.
const SEEN_KEY = 'valle-del-bucle:seen'

export function loadSeen() {
  try {
    const raw = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]')
    return new Set(Array.isArray(raw) ? raw.filter((id) => typeof id === 'string') : [])
  } catch {
    return new Set()
  }
}

// Marca una conversación como vista y devuelve el conjunto actualizado. Sin almacenamiento disponible, solo vale en memoria.
export function markSeen(seen, id) {
  const next = new Set(seen).add(id)
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...next]))
  } catch {
    // Almacenamiento bloqueado o lleno: la repetición solo durará hasta recargar.
  }
  return next
}

export function clearSeen() {
  try {
    localStorage.removeItem(SEEN_KEY)
  } catch {
    // Nada que borrar si el almacenamiento no está disponible.
  }
}
