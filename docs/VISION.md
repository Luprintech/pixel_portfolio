# Valle del Bucle — Visión de producto y dirección de diseño

**Proyecto:** Portfolio interactivo de Guadalupe Cano (Luprintech)  
**Estado:** Diseño y desarrollo inicial  
**Fecha:** 8 de noviembre de 2026  
**Tipo:** Documento de visión, decisiones y propuestas de implementación

---

## 1. Objetivo del proyecto

Valle del Bucle es el portfolio personal de Guadalupe Cano, desarrolladora web Full Stack.

El objetivo es crear una web profesional con dos formas de navegación:

1. **Modo aventura:** un mundo pixel art explorable, inspirado visualmente en los RPG clásicos, donde los visitantes descubren proyectos, experiencia y contenido interactuando con edificios y personajes.
2. **Modo clásico:** una landing profesional, moderna, accesible y responsive que presenta todo el contenido sin necesidad de jugar.

Ambos modos deben compartir la misma información, gestionada desde el CMS existente.

El juego debe aportar personalidad y una experiencia diferente, sin dificultar el acceso a la información profesional.

## 2. Identidad del proyecto

### Decisiones confirmadas

- Nombre del proyecto: **Valle del Bucle**.
- Marca personal: **Luprintech**.
- Autora: Guadalupe Cano.
- Inspiración visual: Stardew Valley y Zelda clásico.
- Estética: pixel art rural, acogedor, colorido y con elementos de aventura.
- Mantener dos experiencias: modo aventura y modo clásico.
- Conservar la arquitectura y el CMS existentes.
- Evitar replicar el diseño de otros portfolios.

### Identidad visual

El mundo debe tener personalidad propia.

Se busca un valle rural con casas, talleres, árboles, caminos, flores, agua y diferentes zonas temáticas.

La referencia principal para la ambientación es Stardew Valley. Zelda clásico sirve de inspiración para la exploración, el movimiento, las interacciones y el diseño de pequeñas aventuras.

No se deben reproducir mapas, sprites, edificios, personajes, interfaces ni otros elementos protegidos de esos juegos.

### Referencia externa

Portfolio de Alejandro Blanco:

https://alexxblaro16.github.io/

Esta web fue una inspiración inicial para la idea de un portfolio explorable.

No debe utilizarse como plantilla visual ni funcional.

Evitar especialmente reproducir su combinación de:

- Pantalla inicial oscurecida con menú centrado.
- Misma distribución y denominación de opciones.
- Presentación del nombre como función de código.
- Distribución de edificios o elementos que recuerde demasiado a su escenario.

La identidad de Valle del Bucle debe desarrollarse de forma independiente.

---

## 3. Pantalla de inicio

### Estado actual

Existe una portada pixel art con paisaje al atardecer, montañas, edificios, personaje y mascota.

Permite acceder al valle, personalizar la viajera y utilizar el modo clásico.

### Propuesta de mejora

Transformar la portada en una pantalla de título de videojuego, con un paisaje animado.

**Composición propuesta:**

- Nombre «Valle del Bucle» como elemento principal.
- Pequeña referencia a Luprintech.
- Subtítulo: «El portfolio interactivo de Guadalupe Cano».
- Paisaje pixel art con profundidad visual.
- Personaje principal y mascota visibles.
- Menú reconocible, sin ocupar excesivamente el escenario.

### Opciones de navegación propuestas

- Nueva aventura.
- Continuar explorando, si existe progreso guardado.
- Personalizar personaje.
- Explorar portfolio clásico.
- Opciones.

No es necesario que todas las opciones aparezcan desde la primera versión.

### Animaciones

Implementar progresivamente:

- Nubes con movimiento lento.
- Humo de chimeneas.
- Árboles o vegetación con movimiento sutil.
- Pájaros u otros elementos ambientales.
- Animaciones de espera de personaje y mascota.
- Pequeños efectos al seleccionar opciones.

Se deben respetar las preferencias de movimiento reducido del usuario.

### Audio

Como mejora posterior, incluir música original o con licencia compatible y pequeños efectos ambientales.

El sonido debe comenzar desactivado y poder controlarse fácilmente.

No bloquear la entrada al portfolio mediante introducciones obligatorias.

---

## 4. Mundo explorable

### Objetivo

Crear un pueblo con zonas reconocibles y edificios que representen partes reales del portfolio.

El escenario debe ofrecer una sensación de exploración, pero la navegación debe seguir siendo sencilla.

### Estructura propuesta

Diseñar primero un mapa conceptual antes de incorporar nuevos edificios.

Zonas sugeridas:

**Plaza central**

Punto de entrada y centro de navegación del pueblo.

Contiene señales, accesos a otras zonas y posiblemente un NPC de bienvenida.

**Casa de Lupe — Sobre mí**

Espacio dedicado a:

- Presentación personal.
- Formación.
- Trayectoria profesional.
- Experiencia.
- Curriculum.
- Enlaces profesionales.

**Taller del Código — Proyectos**

Espacio donde los proyectos aparecen representados mediante máquinas, mesas de trabajo u objetos interactivos.

Cada objeto abre una ficha con:

- Nombre y descripción.
- Problema que resuelve.
- Tecnologías utilizadas.
- Capturas reales.
- Funcionalidades.
- Enlace a GitHub, si existe.
- Enlace a demo, si existe.

Los proyectos deben obtenerse de la API existente.

**Biblioteca de los Logs — Blog**

Biblioteca donde los artículos se representan mediante libros o estanterías.

Debe permitir consultar artículos recientes, buscar contenido y acceder a los posts completos.

El contenido seguirá procediendo del CMS.

**Taberna del Debug — Experiencia y habilidades**

Espacio para presentar tecnologías, herramientas, experiencia profesional y conocimientos.

Puede incluir NPC con diálogos breves.

No sustituir la información estructurada y accesible del portfolio.

**Oficina de Correos — Contacto**

Edificio donde se encuentra el formulario de contacto.

Debe reutilizar el sistema de envío y validación existente.

### Posibles zonas futuras

- Bosque de los Bugs.
- Laboratorio de IA.
- Zona de impresión 3D.
- Sala de servidores.
- Museo de proyectos.

Estos nombres y lugares son propuestas, no decisiones definitivas.

## 5. Diseño de escenarios

### Mejoras prioritarias

El escenario actual necesita mayor variedad visual.

Trabajar en:

- Caminos con bordes y esquinas naturales.
- Variaciones de terreno.
- Árboles de distintos tamaños y tipos.
- Arbustos, flores y vegetación agrupada.
- Sombras pixeladas consistentes.
- Señales y carteles.
- Rocas, vallas y pequeños objetos decorativos.
- Agua y animaciones sencillas.
- Edificios con siluetas diferenciadas.

Evitar llenar el mapa de decoración sin función ni una distribución coherente.

### Escala gráfica

Definir una escala de tiles y sprites y mantenerla en todos los elementos.

Respetar:

- Proporciones consistentes.
- Paleta controlada.
- Contornos coherentes.
- Pixel art nítido.
- Animaciones adecuadas a la resolución.
- Ausencia de suavizado que difumine los píxeles.

La escala concreta deberá decidirse revisando los sprites y el mapa existentes.

---

## 6. Personaje y mascota

### Estado actual

Existe un sistema de personaje personalizable y una mascota.

Los sprites se generan por código.

### Mejoras propuestas

- Completar animaciones de frente, espalda y laterales.
- Animaciones de caminar e inactividad.
- Mejorar transiciones entre direcciones.
- Mantener las opciones de personalización.
- Permitir que la mascota acompañe al personaje.
- Añadir pequeñas animaciones de la mascota.
- Evitar que la mascota bloquee el movimiento.

La personalización debe conservarse al navegar por el mundo.

No es necesario incorporar cuentas de usuario para almacenar las preferencias.

---

## 7. Interiores de edificios

Los edificios deberían tener interiores propios.

### Propuesta técnica

Crear una plantilla reutilizable de escenas interiores con:

- Punto de entrada.
- Punto de salida.
- Colisiones.
- Objetos interactivos.
- Eventos de interacción.
- Cámara y límites del escenario.
- Integración con paneles React.

Cada interior tendrá decoración y contenido propios, pero compartirá mecanismos de navegación.

### Prioridad

Empezar por un solo edificio completamente funcional: el Taller del Código.

Después reutilizar lo aprendido para crear la casa, biblioteca y resto de edificios.

---

## 8. Mecánicas de aventura

Estas funcionalidades son propuestas para implementar progresivamente.

### Interacciones contextuales

Mostrar una indicación cuando el jugador esté cerca de una puerta, objeto o NPC.

Ejemplos:

- E — Entrar.
- E — Examinar.
- E — Hablar.

Incluir equivalentes para controles táctiles y una alternativa accesible fuera del canvas.

### NPC

Personajes que ofrecen explicaciones breves y enlaces a contenido real.

Los diálogos deben ser opcionales y poder omitirse.

### Diario de aventuras

Menú desde el que consultar:

- Mapa del pueblo.
- Proyectos descubiertos.
- Lugares visitados.
- Accesos directos a secciones.

### Viaje rápido

Permitir desplazarse directamente a edificios o zonas.

No obligar al visitante a recorrer el mapa repetidamente para encontrar información.

### Misiones opcionales

Pequeña introducción con tres objetivos:

1. Conocer a Lupe.
2. Descubrir un proyecto.
3. Visitar la biblioteca.

Las misiones no deben bloquear ninguna sección.

### Guardado

Para preferencias y progreso básico, valorar `localStorage`.

No introducir autenticación ni nuevas tablas de base de datos sin una necesidad real.

### Cofres y secretos

Añadir elementos opcionales que descubran recursos, tutoriales o proyectos.

Nunca ocultar información profesional importante detrás de una mecánica de juego.

---

## 9. Modo clásico

### Decisión de diseño

El modo clásico debe dejar de parecer una página pixel art formada por tarjetas de videojuego.

Debe convertirse en una landing profesional independiente visualmente.

### Diseño propuesto

- Composición moderna y limpia.
- Tipografía legible.
- Espaciado equilibrado.
- Diseño completamente responsive.
- Tarjetas de proyectos con capturas reales.
- Paleta relacionada con la marca, sin necesidad de reproducir el estilo pixel art.
- Pequeños guiños visuales a Valle del Bucle, utilizados con moderación.

La estética definitiva del modo clásico queda pendiente de concretar.

### Estructura

**Hero**

Nombre completo, profesión, presentación breve y acciones visibles.

**Sobre mí**

Trayectoria, formación y especialización.

**Proyectos destacados**

Aplicaciones reales con capturas, tecnologías, descripción y enlaces.

**Experiencia y stack**

Información estructurada y fácil de consultar.

**Blog**

Últimos artículos publicados.

**Contacto**

Formulario y enlaces profesionales.

### Requisitos

- HTML semántico.
- SEO.
- Accesibilidad.
- Navegación por teclado.
- Metadatos para compartir.
- Buena velocidad de carga.
- Contenido accesible sin Phaser.
- Diseño usable en móviles.

Este modo es prioritario porque debe funcionar como portfolio profesional incluso para quienes no quieran jugar.

---

## 10. Arquitectura existente

La arquitectura documentada no debe sustituirse.

### Frontend

React + Vite.

### Juego

Phaser 3, cargado de forma diferida.

### Backend

Express.

### Persistencia

PostgreSQL para contenido dinámico.

### CMS

Panel privado `/bitacora`.

### Contenido

- `/api/projects`
- `/api/posts`

El contenido profesional debe seguir teniendo una única fuente de datos.

No duplicar proyectos, artículos o descripciones para cada modo.

### Estructura documentada

- `frontend/src/game/world.js`: datos del mundo.
- `frontend/src/game/ValleScene.js`: escena del juego.
- `frontend/src/game/sprites.js`: generación de sprites.
- `frontend/src/components/valle/`: interfaz asociada al juego.
- `frontend/src/components/valle/Content.jsx`: contenido compartido.
- `frontend/src/pages/Valle.jsx`: integración de Phaser.

La escena debe encargarse del mundo interactivo y React de presentar los contenidos complejos.

Evitar introducir lógica de acceso a datos dentro de sprites o escenas.

Antes de modificar estas piezas, revisar su implementación real.

---

## 11. Reglas técnicas y de mantenimiento

Respetar `CLAUDE.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `frontend/docs/DESIGN.md` y `docs/ESTADO.md`.

### Diseño

- Reutilizar los tokens de diseño existentes.
- No restaurar el antiguo tema Neon Luminary.
- Evitar gradientes, halos y sombras difuminadas en la experiencia pixel art.
- Mantener consistencia entre sprites, paneles y escenarios.
- No introducir nuevos estilos sin revisar el sistema de diseño.

### Código

- Componentes pequeños y reutilizables.
- Separación entre vista, lógica y acceso a datos.
- Textos visibles mediante i18n.
- Mantener idiomas español e inglés.
- No añadir dependencias innecesarias.
- Respetar las rutas y contratos de API existentes.

### Git

- Trabajar con ramas de funcionalidad.
- No hacer commits directamente en `main`.
- Crear PR según el flujo documentado.
- Respetar las convenciones de autoría del repositorio.

### Validaciones

Antes de cerrar cambios, ejecutar las pruebas y comprobaciones indicadas en `CLAUDE.md` y `AGENTS.md`.

Actualizar `docs/ESTADO.md` al finalizar cada bloque.

Si cambia la arquitectura o el diseño, actualizar también sus documentos correspondientes.

---

## 12. Hoja de ruta sugerida

### Fase 1 — Identidad y bases visuales

- Definir composición definitiva de la portada.
- Revisar paleta, escala y estilo de sprites.
- Diseñar distribución general del valle.
- Crear criterios para edificios, terreno y vegetación.

**Resultado esperado:** identidad visual consistente.

### Fase 2 — Portfolio profesional

- Rediseñar `/clasico` como landing.
- Mejorar tarjetas de proyectos.
- Integrar contenidos reales.
- Revisar responsive, accesibilidad y SEO.

**Resultado esperado:** portfolio completo y presentable sin jugar.

### Fase 3 — Primer edificio completo

- Implementar el Taller del Código.
- Crear interior interactivo.
- Conectar proyectos reales.
- Añadir navegación de entrada y salida.

**Resultado esperado:** primer recorrido completo desde el valle hasta un proyecto.

### Fase 4 — Expansión del pueblo

- Casa de Lupe.
- Biblioteca.
- Taberna.
- Oficina de Correos.
- Señalización y decoración.

**Resultado esperado:** todas las secciones principales accesibles desde el mapa.

### Fase 5 — Experiencia de aventura

- NPC.
- Mapa.
- Viaje rápido.
- Diario.
- Animaciones de mascota.
- Misiones opcionales.

**Resultado esperado:** exploración agradable sin obstaculizar la navegación.

### Fase 6 — Pulido y publicación

- Rendimiento.
- Accesibilidad.
- Soporte móvil.
- Pruebas de navegación.
- Música y efectos opcionales.
- Revisión SEO.
- Pruebas del modo clásico y aventura.

**Resultado esperado:** experiencia estable y preparada para visitantes reales.

---

## 13. Decisiones pendientes

Antes de implementar nuevas funcionalidades extensas, definir:

1. Distribución definitiva del mapa.
2. Escala de tiles y sprites.
3. Estilo final de los edificios.
4. Diseño definitivo del modo clásico.
5. Comportamiento de los interiores.
6. Apariencia de NPC y mascotas.
7. Qué mecánicas se incluyen en la primera versión pública.

No tomar automáticamente las propuestas de este documento como requisitos cerrados.

---

## 14. Criterios para evaluar cada cambio

Antes de incorporar una nueva funcionalidad, comprobar:

- ¿Ayuda a descubrir información profesional?
- ¿Encaja con el estilo visual del valle?
- ¿Mantiene la navegación sencilla?
- ¿Funciona correctamente en móvil?
- ¿Tiene una alternativa accesible?
- ¿Reutiliza los sistemas existentes?
- ¿Aporta algo propio en lugar de copiar una referencia?
- ¿Es mantenible sin complicar innecesariamente el proyecto?

Si una funcionalidad añade complejidad sin mejorar la experiencia, posponerla.

---

## 15. Instrucciones para Claude Code

Este archivo representa la visión de producto y las propuestas de diseño de Valle del Bucle.

No implica implementar todas las funcionalidades descritas.

Antes de realizar cambios:

1. Leer `CLAUDE.md` y la documentación técnica vigente.
2. Consultar `docs/ESTADO.md`.
3. Identificar qué funcionalidades ya existen.
4. Comparar la tarea solicitada con esta visión.
5. Conservar la arquitectura actual.
6. Implementar en bloques pequeños y comprobables.
7. Evitar rediseños globales no solicitados.
8. Actualizar la documentación correspondiente.

**Principio del proyecto:** Valle del Bucle debe sentirse como un pequeño mundo que invita a explorar el trabajo de Guadalupe Cano, manteniendo siempre la utilidad y claridad de un portfolio profesional.
