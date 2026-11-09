# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Reclutadores y empresas que buscan un perfil full-stack, y clientes freelance que quieren encargar una web o un proyecto. Ambos pesan igual. Llegan a evaluar a Guadalupe Cano: miran proyectos, experiencia y formación, y deciden si contactarla. Una sesión breve debe bastar para descubrir un proyecto y contactar.

Una tercera audiencia, secundaria, lee el blog técnico del CMS.

## Product Purpose

Valle del Bucle es el portfolio personal de Guadalupe Cano (Lupe), desarrolladora web full-stack, bajo su marca Luprintech. Existe para presentarla profesionalmente y, ahora mismo, para conseguir empleo como desarrolladora. El éxito es que quien visita encuentre un proyecto real, entienda su perfil y le escriba.

Tiene dos formas de navegarlo con la misma información: un modo aventura (overworld pixel art con Phaser, en `/valle`) y un modo clásico (landing profesional en HTML, en `/clasico`). Ninguna mecánica de juego puede esconder información profesional.

## Positioning

Un portfolio que se recorre como un pequeño mundo cuyos lugares son etapas reales de Lupe, con una anfitriona (Lupe), su gata (Khalessi) y un avatar personalizable para quien visita. Otro portfolio podría copiar el pixel art, pero no esa mezcla autobiográfica ni el personaje y la mascota del visitante. Debe además funcionar como portfolio profesional sin jugar.

## Operating Context

- El contenido (proyectos y artículos) lo gestiona Lupe desde el CMS privado `/bitacora` y se guarda en PostgreSQL. Sale una sola vez de `/api/projects` y `/api/posts` y se pinta en ambos modos.
- Rutas públicas: `/` portada, `/valle`, `/clasico`, `/proyectos`, `/portfolio`, `/blog`, `/contacto`.
- La partida del visitante (nombre, aspecto, mascota) vive solo en `localStorage`, sin cuentas.
- Despliegue con Docker Compose (Nginx + Express + PostgreSQL) sin pipeline automatizado; CI de lint, tests y build en cada PR.

## Capabilities and Constraints

- Frontend React 19 + Vite; backend Express 5; Phaser 3 cargado de forma diferida solo en `/valle`.
- Textos en español e inglés (`valleCopy.js` y i18next). Texto visible por i18n, nunca incrustado.
- Frontend y backend separados; el contrato entre ambos es la API.
- Hecho: portada viva, creador de la viajera y su mascota, valle con plaza y edificios, sonido.
- Sin decidir (docs/VISION.md, sección 16): distribución final del mapa, estilo final de edificios, diseño del modo clásico, interiores, NPC y primer edificio completo (Taller del Código o casa).
- Lore y diálogos son borradores no publicables; las personas del entorno aparecen con seudónimos y no se nombran datos de terceros.
- Reparto de personajes: la viajera es el avatar del visitante, Lupe es la anfitriona y Khalessi es la gata de Lupe, nunca la mascota del visitante.

## Brand Commitments

- Nombre del proyecto: Valle del Bucle. Marca personal: Luprintech. Autora: Guadalupe Cano.
- Estética cute, cálida y pixel art, entre Stardew Valley y Zelda clásico, pero con identidad propia: sin reproducir sprites, mapas ni la web de referencia.
- No volver al diseño anterior (fucsia/cian, partículas, gradientes, "Neon Luminary").
- Comillas siempre rectas.
- Todo lo publicado es de autoría exclusiva de Guadalupe.

## Evidence on Hand

- Proyectos y artículos reales vía API y CMS.
- Documentos de producto: `docs/VISION.md`, `docs/LORE_Y_MUNDO.md`, `docs/DIALOGOS.md`, `docs/ESTADO.md`, `docs/IDENTIDAD-VISUAL.md` y `frontend/docs/DESIGN.md`.
- Láminas de estilo de Lupe en `img/` (fuera de git).
- Ausentes y no inventables: URLs de redes (YouTube, Instagram, TikTok y MakerWorld, sin verificar), fotos reales del cuarto, certificaciones, fechas completas de su recorrido y testimonios.

## Product Principles

1. El portfolio es profesional primero: quien no quiera jugar llega a proyectos y contacto sin fricción.
2. El mundo cuenta hechos reales de Lupe, con humor, sin inventar logros ni credenciales.
3. Una sola fuente de contenido para ambos modos; el juego añade personalidad, no duplica información.
4. Cada funcionalidad nueva debe mejorar la experiencia; si solo añade complejidad, se pospone.
5. Funciona en móvil y con teclado, y se entiende sin sonido.

## Accessibility & Inclusion

El modo clásico ofrece todo el contenido como HTML semántico e indexable. Contraste suficiente en ambos temas, foco visible, navegación por teclado y móvil, respeto de la preferencia de movimiento reducido y alternativa accesible a cualquier mecánica del juego. Criterio de referencia: WCAG, aplicado ya en el creador (objetivos de 44 px, reflow a 320 px, foco no tapado).
