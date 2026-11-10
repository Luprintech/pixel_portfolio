# CLAUDE.md

Contexto permanente para Claude Code en este repositorio. Léelo antes de tocar nada y, después, abre `docs/ESTADO.md` para saber en qué punto está el trabajo.

@AGENTS.md

## Qué es esto

Portfolio full-stack de Guadalupe Cano (Luprintech): SPA React + Vite, API Express, PostgreSQL y un CMS privado en `/bitacora`. Trabaja con la usuaria en **español**.

## Dónde está cada documento

| Tema | Archivo |
| --- | --- |
| Reglas de trabajo, comandos, variables de entorno, zonas delicadas | `AGENTS.md` (importado arriba) |
| Arquitectura, rutas, flujo de contenido, juego Phaser | `docs/ARCHITECTURE.md` |
| Sistema de diseño vigente (Valle del Bucle) | `frontend/docs/DESIGN.md` |
| Qué se ha hecho, qué falta y por qué se decidió cada cosa | `docs/ESTADO.md` |
| Visión de producto: a qué funcionalidades queremos llegar y en qué orden | `docs/VISION.md` |
| Lore y mundo: hechos, cronología, reparto con seudónimos y mapa de lugares (borrador, no publicar) | `docs/LORE_Y_MUNDO.md` |
| Guion de diálogos de cada interacción (borrador, no publicar) | `docs/DIALOGOS.md` |

## Hacia dónde vamos: visión de producto

`docs/VISION.md` recoge la visión de Valle del Bucle: pantalla de título animada, pueblo con zonas (plaza, Casa de Lupe, Taller del Código, Biblioteca de los Logs, Taberna del Debug, Oficina de Correos), interiores de edificios, mecánicas de aventura (interacción contextual, NPC, diario, viaje rápido, misiones opcionales, guardado en `localStorage`), un modo clásico rediseñado como landing profesional y una hoja de ruta por fases (con las capas de lore y diálogos de `LORE_Y_MUNDO.md` y `DIALOGOS.md`). Es la guía para programar en esa dirección, no una lista de requisitos cerrados.

- Antes de empezar una tarea de juego, de `/clasico` o de la portada, léelo y comprueba en qué fase de su hoja de ruta cae. Después mira `docs/ESTADO.md` para saber qué existe ya.
- Las propuestas del documento (nombres de zonas, mecánicas, estética del modo clásico) no son decisiones tomadas. Las pendientes están en su sección 16: si la tarea depende de una, pregunta a la usuaria antes de implementar.
- Prioridades que marca: el modo clásico debe funcionar como portfolio profesional sin jugar; el primer edificio completo será el Taller del Código; ninguna mecánica puede esconder información profesional.
- Aplica los criterios de su sección 17 a cada funcionalidad nueva y pospón la que añada complejidad sin mejorar la experiencia.
- `/clasico` sirve desde 2026-11-10 la web original de la usuaria (fucsia/cian, sin estética de videojuego), aislada en `frontend/src/clasico/`. Es la excepción explícita decidida por ella; no cambies su aspecto sin que lo pida. Su CSS vive en `frontend/src/clasico/clasico.css`, todo bajo `.clasico-root`, y no puede tener reglas sobre `html`, `body`, `*` ni `:root`.
- Los proyectos y artículos siguen saliendo una sola vez de `/api/projects` y `/api/posts`; no se duplican por modo.
- Al cerrar un bloque, anota en `docs/ESTADO.md` qué parte de la visión avanza.

## Personajes: quién es quién

Decidido el 2026-11-09 (detalle en `docs/VISION.md`, sección 6; pendientes en `docs/ESTADO.md`):

- **La viajera o el viajero** es el personaje personalizable de quien visita el portfolio, independiente de Lupe.
- **Lupe** es la anfitriona y guía del pueblo; no impone recorrido.
- **Khalessi** es la gata de Lupe y su pareja, no la mascota del visitante. No le asignes el papel de compañera de la viajera.
- Las mascotas del visitante (perro o gato, función futura) no sustituyen a Khalessi ni toman su nombre, historia o diálogos.
- La base visual del avatar está aprobada (2026-11-09): figura de 16×28, lienzo de 18×34. Las mascotas del visitante tienen el tamaño de lienzo de su raza (decidido el 2026-11-09). No fijes dimensiones nuevas de sprites de NPC sin hablarlo con la usuaria.

## Diseño vigente: "Valle del Bucle"

Desde 2026-11-08 el portfolio es un overworld pixel art estilo Zelda (Phaser 3) con un **modo clásico** en HTML real. La arquitectura (CMS, blog, API, BD) **no cambió**; solo la capa visual.

- `/` título, `/valle` el juego, `/clasico` la web original aislada (portada con scroll-snap; el resto de enlaces va a las páginas del sitio actual).
- El contenido sale **una sola vez** de `/api/projects` y `/api/posts` y se pinta en ambos modos (`components/valle/Content.jsx`).
- Paleta, fuentes y reglas: ver `frontend/docs/DESIGN.md`. No introduzcas colores fuera de los tokens de `frontend/src/index.css`.
- El CMS (`/bitacora`) conserva sus colores fijos a propósito; solo recibe tokens.

## Cosas que NO debes hacer

- No restaures el diseño anterior (fucsia/cian, partículas, gradientes, "Neon Luminary") fuera de `/clasico`. Se descartó por genérico para el resto del sitio; en `/clasico` la usuaria decidió conservarlo (2026-11-10), aislado en `frontend/src/clasico/`.
- Ya no existen `design/tokens.js`, `data/` ni las secciones del diseño anterior (Expertise, TechSkills, TerminalWidget, ToolsGrid, InteractiveAvatar, FeaturedProjects). No los recrees.
- No uses gradientes, halos radiales, sombras difuminadas ni colores fucsia/cian/violeta sueltos: usa tokens y sombras duras (`var(--px-ink)`).
- No cambies slugs públicos sin revisar `backend/lib/sitemap.js`.
- No importes Phaser fuera de `pages/Valle.jsx` (carga diferida a propósito para no pesar en el resto del sitio).
- Todo trabajo de diseño visual (portada, juego, `/clasico`, componentes) se hace cargando las skills `impeccable` y `ui-ux-pro-max` (y `frontend-design` si aplica). La usuaria no tiene que invocarlas cada vez: cárgalas tú al empezar cualquier tarea de diseño.

## Flujo de Git

Repositorio: https://github.com/Luprintech/pixel_portfolio (rama `main`). Nunca se commitea directo a `main`: cada funcionalidad va en su rama y entra por PR. El repo anterior (`mi-portfolio`) se conserva aparte como archivo y no se toca; en local su historial queda en la rama `legacy-main` y el remoto `legacy`.

**Cuando la usuaria dice "mergea"**, en este orden y parando si algo falla:

1. Pasan **todos** los tests: `npm test`, `npm run lint` y `npm run build` en `frontend/`, y `npm test` en `backend/`. Si algo falla, no se mergea: se informa con la salida del fallo.
2. Crear la rama (`feat/...`, `fix/...`, `docs/...`) desde `main` actualizada y commitear.
3. Subir la rama y abrir el PR con `gh pr create`.
4. Mergear el PR (squash).
5. Borrar la rama en remoto y en local, volver a `main` y actualizarla.

**Cuando dice "descarga del remoto al local"**: traer a `main` local lo que haya en `origin/main` (`git fetch` y `git pull --ff-only`). Si hay cambios locales sin commitear o `main` ha divergido, avisar antes de tocar nada; no sobrescribir trabajo local.

**Autoría**: todo lo que se commitea, se sube en un PR o se publica es de Guadalupe y solo de ella. Los commits y las descripciones de PR **no llevan** líneas `Co-Authored-By`, "Generated with" ni ninguna mención a Claude o a otra IA.

## Convenciones de código

El detalle de modularización y de comprobación visual está en `AGENTS.md` (buenas prácticas de código).

- Los comentarios van en **español**, con el tono de una persona que explica a la siguiente: el porqué de una decisión, una trampa o una restricción, no lo que ya dice el código. Sin banderines decorativos, sin emojis y sin frases de relleno.
- Nombres de variables, funciones y componentes claros; funciones pequeñas con una sola responsabilidad.
- Frontend y backend siguen separados (`frontend/` y `backend/`) y no comparten código. El contrato entre ambos es la API.
- Cada módulo hace una cosa: la UI no accede a datos directamente (pasa por `lib/` y `hooks/`), y en el backend las rutas solo reciben y responden (la lógica va en `lib/` y `utils/`).
- Nada de código muerto, duplicado ni `console.log` olvidados.
- Los textos visibles al usuario van por i18n, no incrustados en los componentes.

## Antes de cerrar un cambio

Frontend: `npm run build`, `npm run lint` y `npm test` desde `frontend/`. Backend: `npm test` y comprobar `GET /api/health`. Detalle completo en `AGENTS.md`.

## Estado del proyecto

`docs/ESTADO.md` recoge lo hecho, lo pendiente y las decisiones. Al cerrar cada bloque de trabajo (una funcionalidad, un refactor, una limpieza) se actualiza en el mismo PR: pasar lo terminado a "Hecho", anotar lo nuevo en "Pendiente" y añadir cada decisión con su motivo. Si cambia algo del diseño o de la arquitectura, actualizar también `frontend/docs/DESIGN.md` o `docs/ARCHITECTURE.md`.

## Pendientes conocidos

- Khalessi acompaña a Lupe en la portada (la visita, juega con mariposas y avellanas); no acompaña a la viajera ni sale en el creador. Siguen pendientes el retrato y el papel de Lupe dentro del valle (`docs/ESTADO.md`).
- Los bloques de contenido del blog (gradientes de `lib/gradients.js`, botones y avisos del editor) conservan colores propios: son opciones del autor, no el tema.
