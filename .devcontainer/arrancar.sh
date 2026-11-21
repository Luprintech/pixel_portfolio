#!/usr/bin/env bash
# Levanta backend y frontend en la misma terminal. Ctrl+C para los dos.
# Se lanza solo al abrir el Codespace; para relanzarlo: bash .devcontainer/arrancar.sh
set -uo pipefail
cd "$(dirname "$0")/.."

api_viva() { curl -sf http://localhost:3000/api/health >/dev/null; }
puerto_ocupado() { (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; }

# Cada vez que se abre el Codespace desde otro dispositivo se vuelve a ejecutar
# este script: si ya hay servidores, no se lanza otra copia.
if puerto_ocupado 5173; then
  echo "La web ya está en marcha en otra terminal (puerto 5173)."
  exit 0
fi

# Al salir (Ctrl+C o cerrar la terminal) se para también el backend.
trap 'kill 0 2>/dev/null' EXIT

if api_viva; then
  echo "El backend ya está en marcha: solo se lanza el frontend."
else
  echo "Arrancando backend..."
  (cd backend && npm start 2>&1 | sed -u 's/^/[api] /') &
  # El backend tarda unos segundos en crear las tablas y sembrar los datos la
  # primera vez; Vite arranca después para que la primera carga no dé 502.
  for _ in $(seq 1 60); do
    api_viva && break
    sleep 1
  done
  api_viva || echo "Aviso: el backend no responde en /api/health. Revisa las líneas [api]."
fi

echo "Arrancando frontend..."
cd frontend && npm run dev
