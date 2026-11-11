// Textos de la visita guiada por dentro de la casa (guion en `docs/DIALOGOS.md`, sección 4b), por idioma. Las claves son las de
// `game/dialogue/tourScripts.js`. Se mezclan con el resto en `lib/dialogueCopy.js`. Lo que Lupe cuenta de sí misma sale de lo
// confirmado en `docs/LORE_Y_MUNDO.md`; lo que dice del ordenador, de las impresoras y de la sala es lo que existe hoy en el juego.
export const TOUR_COPY = {
  es: {
    lines: {
      // Retomar la visita desde el valle (cuando se dejó a medias).
      'inicio.retomar.1': 'Claro, retomamos donde lo dejamos.',
      'inicio.retomar.2': 'Ven conmigo: la casa sigue donde la dejamos.',
      'inicio.puerta_retomar.1': 'Otra vez en la puerta de casa.',
      'inicio.puerta_retomar.2': 'Si te parece, entramos y seguimos por donde lo dejamos.',

      // 1 · Entrada
      'tour.entrada.1': 'Esta es mi casa, {name}, o mejor dicho, mi cuarto gaming: aquí trabajo, juego e imprimo cosas.',
      'tour.entrada.2': 'Te la enseño por partes: las impresoras 3D, Atreus, mi ordenador y el rincón de Khalessi. Nada es obligatorio.',
      'tour.entrada.3': 'Si algo te llama la atención por el camino, párate a mirarlo.',
      'tour.entrada.4': 'Y si prefieres seguir por tu cuenta, dímelo y me quedo esperando.',

      // 2 · Impresoras 3D
      'tour.impresoras.1': 'Empezamos por el rincón maker: mis impresoras 3D, una Bambu Lab A1 y la A1 mini.',
      'tour.impresoras.2': 'Vi mi primera impresora 3D en 2009, en la escuela de arte. Aprendí algo de Blender e imprimí mi primera pieza: un elefante.',
      'tour.impresoras.3': 'La A1 mini es la que puedes usar aquí.',
      'tour.impresoras.4': 'Imprime una figura "de juego" y la vitrina de al lado guarda mis creaciones.',
      'tour.impresoras_imprimir.1': 'Acércate a la A1 mini y pulsa E para abrir su panel. Dale a imprimir y verás crecer la figura capa a capa.',
      'tour.impresoras_imprimir.1.touch': 'Acércate a la A1 mini y toca el botón de acción para abrir su panel. Dale a imprimir y verás crecer la figura capa a capa.',
      'tour.impresoras_imprimir.2': 'Aquí tarda unos veinte segundos. Al terminar sale un aviso verde sobre la impresora: recoge la figura.',
      'tour.impresoras_imprimir.3': 'Es un Pikachu, y es un regalo para ti. Puedes reimprimirlo cuando quieras.',
      'tour.impresoras_vitrina.1': 'La vitrina guarda figuras de personajes que me encantan, como Nezuko, Eren, Zelda o Tanjiro, y un Funko Pop que personalicé. Pulsa E para verlas de cerca.',
      'tour.impresoras_vitrina.1.touch': 'La vitrina guarda figuras de personajes que me encantan, como Nezuko, Eren, Zelda o Tanjiro, y un Funko Pop que personalicé. Toca el botón de acción para verlas de cerca.',
      'tour.impresoras_vitrina.2': 'Encima está el cartel de Luprintech: de día apagado, de noche encendido.',

      // 3 · Atreus
      'tour.atreus.1': 'Y este es Atreus, mi pareja. Si el cuarto gaming tiene alma, es en parte suya.',
      'tour.atreus.2': '¡Hola! Soy Atreus. Lupe y yo compartimos afición por la tecnología y los videojuegos.',
      'tour.atreus_consolas.1': 'La estantería de al lado es nuestra colección de consolas, de la Nintendo 64 a la Switch, de la PlayStation 1 a la 4, y una Xbox.',
      'tour.atreus_consolas.2': 'La recreativa tiene tres juegos: "La espada del Bucle", "Invasión Galáctica" y "Río en Peligro".',

      // 4 · Mi ordenador
      'tour.pc.1': 'Esta es mi zona de trabajo: aquí hago desarrollo web, de lo que ves en pantalla a lo que pasa por detrás.',
      'tour.pc.2': 'Mi relación con los ordenadores viene de lejos: con once o doce años buscaba soluciones en foros desde un ciber y acabé siendo "la informática" de mi entorno.',
      'tour.pc.3': 'Luego estudié Pedagogía, trabajé en asistencia en carretera y estudié Desarrollo de Aplicaciones Web. En 2024 pasé al desarrollo web a tiempo completo.',
      'tour.pc_escritorio.1': 'Este ordenador es un escritorio retro estilo Windows XP, con sus programas. Al encenderlo hay unos segundos de arranque (puedes saltarlos con E).',
      'tour.pc_escritorio.1.touch': 'Este ordenador es un escritorio retro estilo Windows XP, con sus programas. Al encenderlo hay unos segundos de arranque (puedes saltarlos tocando la pantalla).',
      'tour.pc_escritorio.2': 'Tienes "Mis proyectos", un Internet Explorer con buscador propio (prueba "proyectos", "Lupe" o "youtube") y accesos a mi YouTube y mi LinkedIn.',
      'tour.pc_escritorio.3': 'Para trastear: Winamp, Paint, una calculadora, el Bloc de notas y un Visual Studio Code con un proyecto de mentira.',
      'tour.pc_escritorio.4': 'Y hay un par de secretos escondidos. No te los cuento.',

      // 5 · Khalessi
      'tour.khalessi.1': 'Y ahora, la verdadera jefa de la casa: el rincón de Khalessi, con su caja, el rascador, el comedero y el arenero.',
      'tour.khalessi.2': 'meaw!',
      'tour.khalessi.3': 'Va a su aire por toda la casa. Si la ves cerca, acércate y pulsa E para saludarla; no prometo que te haga caso.',
      'tour.khalessi.3.touch': 'Va a su aire por toda la casa. Si la ves cerca, acércate y toca el botón de acción para saludarla; no prometo que te haga caso.',

      // 6 · Cierre
      'tour.cierre.1': 'Y hasta aquí la visita, {name}. Ya conoces lo principal: las impresoras, a Atreus, mi ordenador y a Khalessi.',
      'tour.cierre.2': 'Por la sala hay más que curiosear: las consolas y la recreativa, la tele, la minicadena y la lámpara de pie, que se enciende con E.',
      'tour.cierre.2.touch': 'Por la sala hay más que curiosear: las consolas y la recreativa, la tele, la minicadena y la lámpara de pie, que se enciende con el botón de acción.',
      'tour.cierre.3': 'Por la escalera de arriba a la izquierda se sube a la azotea, donde tengo mi telescopio.',
      'tour.cierre.4': 'Tu partida está en Opciones, el botón de la esquina. El modo clásico está en el menú.',
      'tour.cierre.5': 'A partir de aquí, el control es tuyo. Si quieres repasar algo, ven a hablar conmigo.',

      // Hablar con Lupe a mitad de visita y después
      'tour.pausa.1': '¿Seguimos con la visita o prefieres mirar por tu cuenta un rato?',
      'tour.ofrecer.1': '¿Te enseño la casa por partes o prefieres mirar por tu cuenta?',
      'tour.despues.1': 'Ya conoces la casa, pero sigue siendo tuya para explorar.',
      'tour.despues.2': 'Cuando quieras repasar algo, párate delante y pulsa E.',
      'tour.despues.2.touch': 'Cuando quieras repasar algo, párate delante y toca el botón de acción.',
    },
    options: {
      'inicio.opt.retomar': '¿Retomamos la visita?',
      'tour.opt.seguir': 'Sigamos',
      'tour.opt.calma': 'Déjame mirar esto con calma',
      'tour.opt.cuenta': 'Prefiero seguir por mi cuenta',
      'tour.opt.dejar': 'Dejar la visita',
      'tour.opt.imprimir': '¿Cómo imprimo una figura?',
      'tour.opt.vitrina': '¿Y las figuras de la vitrina?',
      'tour.opt.consolas': '¿Y las consolas y la recreativa?',
      'tour.opt.escritorio': '¿Qué hay en el ordenador?',
      'tour.opt.abrirpc': 'Abrir el ordenador',
      'tour.opt.gracias': 'Gracias por la visita',
    },
  },
  en: {
    lines: {
      'inicio.retomar.1': "Of course, let's pick up where we left off.",
      'inicio.retomar.2': 'Come with me: the house is right where we left it.',
      'inicio.puerta_retomar.1': "Back at the front door.",
      'inicio.puerta_retomar.2': "If you like, we'll go in and carry on from where we stopped.",

      'tour.entrada.1': 'This is my house, {name}, or rather my gaming room: I work, play and print things here.',
      'tour.entrada.2': 'I\'ll show you in parts: the 3D printers, Atreus, my computer and Khalessi\'s corner. Nothing is compulsory.',
      'tour.entrada.3': 'If something catches your eye on the way, stop and look.',
      'tour.entrada.4': 'And if you would rather go on alone, just say so and I will wait.',

      'tour.impresoras.1': 'We start with the maker corner: my 3D printers, a Bambu Lab A1 and the A1 mini.',
      'tour.impresoras.2': 'I saw my first 3D printer in 2009 at art school. I learned some Blender and printed my first piece: an elephant.',
      'tour.impresoras.3': 'The A1 mini is the one you can use here.',
      'tour.impresoras.4': 'It prints a game figure, and the display case next to it holds my creations.',
      'tour.impresoras_imprimir.1': 'Go up to the A1 mini and press E to open its panel. Hit print and watch the figure grow layer by layer.',
      'tour.impresoras_imprimir.1.touch': 'Go up to the A1 mini and tap the action button to open its panel. Hit print and watch the figure grow layer by layer.',
      'tour.impresoras_imprimir.2': 'Here it takes about twenty seconds. When done, a green alert appears over the printer: collect the figure.',
      'tour.impresoras_imprimir.3': 'It is a Pikachu, a gift for you. You can print it again whenever you like.',
      'tour.impresoras_vitrina.1': 'The display case holds figures of characters I love, like Nezuko, Eren, Zelda or Tanjiro, and a Funko Pop I customised. Press E to see them up close.',
      'tour.impresoras_vitrina.1.touch': 'The display case holds figures of characters I love, like Nezuko, Eren, Zelda or Tanjiro, and a Funko Pop I customised. Tap the action button to see them up close.',
      'tour.impresoras_vitrina.2': 'Above it is the Luprintech sign: off by day, lit at night.',

      'tour.atreus.1': "And this is Atreus, my partner. If the gaming room has a soul, part of it is his.",
      'tour.atreus.2': 'Hi! I\'m Atreus. Lupe and I share a love of technology and video games.',
      'tour.atreus_consolas.1': 'The shelf next to it is our console collection, from the Nintendo 64 to the Switch, PlayStation 1 to 4, and an Xbox.',
      'tour.atreus_consolas.2': 'The arcade has three games: "The Loop Sword", "Galactic Invasion" and "River in Danger".',

      'tour.pc.1': 'This is my work area: I do web development here, from what you see on screen to what happens behind it.',
      'tour.pc.2': 'My relationship with computers goes back far: at eleven or twelve I looked for fixes on forums from an internet café and ended up being "the IT person" around me.',
      'tour.pc.3': 'Then I studied Pedagogy, worked in roadside assistance and studied Web Application Development. In 2024 I went full-time in web development.',
      'tour.pc_escritorio.1': 'This computer is a retro Windows XP-style desktop with its own programs. Switching it on takes a few seconds of start-up (you can skip them with E).',
      'tour.pc_escritorio.1.touch': 'This computer is a retro Windows XP-style desktop with its own programs. Switching it on takes a few seconds of start-up (you can skip them by tapping the screen).',
      'tour.pc_escritorio.2': 'You will find "My projects", an Internet Explorer with its own search engine (try "projects", "Lupe" or "youtube") and shortcuts to my YouTube and LinkedIn.',
      'tour.pc_escritorio.3': 'To tinker with: Winamp, Paint, a calculator, Notepad and a Visual Studio Code with a pretend project.',
      'tour.pc_escritorio.4': 'And there are a couple of hidden secrets. I will not tell you.',

      'tour.khalessi.1': 'And now, the real boss of the house: Khalessi\'s corner, with her box, scratching post, food bowls and litter tray.',
      'tour.khalessi.2': 'meaw!',
      'tour.khalessi.3': 'She goes her own way around the house. If you see her nearby, go up and press E to say hi; I can\'t promise she\'ll pay attention.',
      'tour.khalessi.3.touch': 'She goes her own way around the house. If you see her nearby, go up and tap the action button to say hi; I can\'t promise she\'ll pay attention.',

      'tour.cierre.1': "And that's the tour, {name}. You now know the main things: the printers, Atreus, my computer and Khalessi.",
      'tour.cierre.2': 'There is more to poke around in the room: the consoles and the arcade, the TV, the mini hi-fi and the floor lamp, which turns on with E.',
      'tour.cierre.2.touch': 'There is more to poke around in the room: the consoles and the arcade, the TV, the mini hi-fi and the floor lamp, which turns on with the action button.',
      'tour.cierre.3': 'The stairs at the top left lead up to the roof, where my telescope is.',
      'tour.cierre.4': 'Your game is in Options, the corner button. Classic mode is in the menu.',
      'tour.cierre.5': 'From here on, you are in control. If you want to go over something, come and talk to me.',

      'tour.pausa.1': 'Shall we carry on with the tour, or would you rather look around by yourself for a while?',
      'tour.ofrecer.1': 'Shall I show you around the house, one part at a time, or would you rather look around on your own?',
      'tour.despues.1': "You know the house now, but it's still yours to explore.",
      'tour.despues.2': 'Whenever you want to go over something again, stand in front of it and press E.',
      'tour.despues.2.touch': 'Whenever you want to go over something again, stand in front of it and tap the action button.',
    },
    options: {
      'inicio.opt.retomar': 'Shall we pick the tour back up?',
      'tour.opt.seguir': "Let's go on",
      'tour.opt.calma': 'Let me have a good look first',
      'tour.opt.cuenta': "I'd rather carry on by myself",
      'tour.opt.dejar': 'Leave the tour',
      'tour.opt.imprimir': 'How do I print a figure?',
      'tour.opt.vitrina': 'And the figures in the display case?',
      'tour.opt.consolas': 'And the consoles and the arcade?',
      'tour.opt.escritorio': "What's on the computer?",
      'tour.opt.abrirpc': 'Open the computer',
      'tour.opt.gracias': 'Thanks for the tour',
    },
  },
}
