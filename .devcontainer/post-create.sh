#!/usr/bin/env bash
# Se ejecuta una sola vez, al crear el Codespace: instala dependencias y deja
# un backend/.env de desarrollo para que el servidor arranque sin tocar nada.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Instalando dependencias del backend..."
(cd backend && npm ci)
echo "Instalando dependencias del frontend..."
(cd frontend && npm ci)

ENV_FILE=backend/.env
if [ -f "$ENV_FILE" ]; then
  echo "backend/.env ya existe: no se toca."
  exit 0
fi

{
  echo "# Generado por .devcontainer/post-create.sh. Solo para el Codespace."
  echo "NODE_ENV=development"
  echo "PORT=3000"
  # El dominio real y no la URL del Codespace: el backend regenera con él
  # frontend/public/sitemap.xml al arrancar, y ese archivo está en el repo.
  # El CORS ya acepta la URL del Codespace por su cuenta (backend/config/cors.js).
  echo "FRONTEND_URL=https://guadalupecano.es"
  echo "PGHOST=127.0.0.1"
  echo "PGPORT=5432"
  echo "PGUSER=portfolio"
  echo "PGPASSWORD=portfolio"
  echo "PGDATABASE=portfolio_cms"
} > "$ENV_FILE"

# Si las credenciales llegan como secretos de Codespaces ya están en el entorno
# del proceso y dotenv no las pisa, así que solo se inventan las que falten.
if [ -z "${JWT_SECRET:-}" ]; then
  echo "JWT_SECRET=$(openssl rand -hex 32)" >> "$ENV_FILE"
fi
if [ -z "${CMS_USERNAME:-}" ]; then
  echo "CMS_USERNAME=admin" >> "$ENV_FILE"
fi
if [ -z "${CMS_PASSWORD:-}" ]; then
  echo "CMS_PASSWORD=$(openssl rand -base64 18 | tr -d '/+=')" >> "$ENV_FILE"
  echo "Sin secreto CMS_PASSWORD: se ha generado una contraseña. Está en backend/.env."
fi

echo "backend/.env creado."
