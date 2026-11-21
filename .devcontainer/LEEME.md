# Desarrollo en GitHub Codespaces

El Codespace trae todo lo necesario para ver la web en directo mientras se programa, desde cualquier dispositivo: Node 20, PostgreSQL 16 con los datos de ejemplo, el backend, el frontend con recarga en caliente y Claude Code.

## Antes del primer Codespace: secretos

Opcional, pero recomendable. En GitHub: **Settings → Codespaces → Secrets → New secret**, y en cada uno da acceso al repositorio `pixel_portfolio`:

| Secreto | Para qué |
| --- | --- |
| `CMS_USERNAME` | Usuario de `/bitacora` |
| `CMS_PASSWORD` | Contraseña de `/bitacora` |
| `JWT_SECRET` | Firma de las sesiones del CMS (una cadena larga aleatoria) |
| `GEMINI_API_KEY` | Solo si quieres probar el chat |

Si no creas ninguno, el Codespace inventa un `JWT_SECRET` y una contraseña para el usuario `admin`, y los deja en `backend/.env`.

## Abrirlo

En la página del repositorio: **Code → Codespaces → Create codespace on main** (o sobre la rama en la que estés trabajando). La primera vez tarda unos minutos porque instala dependencias; después se reanuda en segundos.

Al abrirse, una terminal arranca sola el backend y el frontend (`.devcontainer/arrancar.sh`). En la pestaña **Puertos** aparece "Web (Vite)" en el 5173: el icono del globo abre la web en una pestaña nueva. Esa URL es privada, solo entra tu cuenta de GitHub, y sirve igual en la tablet o en el móvil con la sesión de GitHub iniciada.

Si cierras esa terminal, los servidores se paran. Para relanzarlos:

```bash
bash .devcontainer/arrancar.sh
```

## Trabajar con Claude Code

En una terminal nueva del Codespace:

```bash
claude
```

La primera vez pide iniciar sesión con tu cuenta de Claude. Los cambios que haga se ven al momento en la pestaña de la web, sin commit ni CI de por medio.

Para darle instrucciones desde la app de Claude en el móvil mientras miras la web, ejecuta `/remote-control` dentro de esa sesión de Claude Code.

## Qué tener en cuenta

- **La base de datos es una copia de desarrollo.** Los proyectos que añadas aquí desde `/bitacora` no aparecen en la web publicada. Sobrevive a parar y reanudar el Codespace, pero se pierde si lo borras.
- **Las subidas del CMS caen en `frontend/public/posts/`**, dentro del repositorio. Revisa `git status` antes de commitear para no subir imágenes de prueba.
- **Las horas cuentan mientras está encendido**, no por lo que tenga dentro: backend, frontend y base consumen lo mismo que el Codespace vacío. Deja el apagado automático en 30 minutos (Settings → Codespaces → Default idle timeout) y páralo a mano cuando acabes.
- La máquina de 2 núcleos sobra para esto. El build y la batería completa de tests los sigue haciendo el CI de GitHub.
