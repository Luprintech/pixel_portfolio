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
      'tour.entrada.1': 'Esta es mi casa, o mejor dicho, mi cuarto gaming. Aquí trabajo, juego, imprimo cosas y miro pantallas durante más tiempo del recomendable.',
      'tour.entrada.2': 'La sala es un resumen de mí: mis aficiones a un lado, mi trabajo al otro y una gata que se reparte entre los dos sin pedir permiso.',
      'tour.entrada.3': 'Te la enseño por partes: las impresoras 3D, Atreus, mi ordenador y el rincón de Khalessi. Nada es obligatorio: si algo te llama la atención por el camino, párate a mirarlo.',
      'tour.entrada.4': 'Y si en algún momento prefieres seguir por tu cuenta, me lo dices y listo. Yo me quedo esperando donde estemos.',

      // 2 · Impresoras 3D
      'tour.impresoras.1': 'Empezamos por el rincón maker. Estas son mis impresoras 3D: una Bambu Lab A1 y la A1 mini. En la vida real tengo tres, pero la tercera no ha cabido en el pixel.',
      'tour.impresoras.2': 'Me enganché a esto por pasar de una idea a algo que puedes coger con la mano. Diseño con Fusion 360 y modelo con Blender a nivel básico. Sigo aprendiendo mientras hago mis propios diseños.',
      'tour.impresoras.3': 'Lo que más hago son piezas paramétricas, soportes, carteles luminosos, pendientes y llaveros. Y también figuras: las creo con ayuda de IA, las imprimo y las pinto yo.',
      'tour.impresoras.4': 'Aquí puedes probar tú. La A1 mini imprime una figura de verdad (bueno, de verdad de juego) y la vitrina de al lado guarda mis creaciones.',
      'tour.impresoras_imprimir.1': 'Acércate a la A1 mini y pulsa E: se abre su panel. Dale a imprimir y verás cómo la figura va creciendo capa a capa en la propia máquina.',
      'tour.impresoras_imprimir.1.touch': 'Acércate a la A1 mini y toca el botón de acción: se abre su panel. Dale a imprimir y verás cómo la figura va creciendo capa a capa en la propia máquina.',
      'tour.impresoras_imprimir.2': 'En la vida real una impresión así tarda horas; aquí son unos veinte segundos. Cuando termine, saldrá un aviso verde sobre la impresora: recoge la figura y es tuya.',
      'tour.impresoras_imprimir.3': 'La recompensa es un Pikachu y el logro «Primera impresión». El Pikachu se queda en mi vitrina y, si te lo pasas bien, puedes reimprimirlo las veces que quieras.',
      'tour.impresoras_vitrina.1': 'La vitrina guarda figuras de personajes que me encantan, como Nezuko, Eren, Zelda o Tanjiro, y un Funko Pop que personalicé yo. Acércate y pulsa E para verlas de cerca.',
      'tour.impresoras_vitrina.1.touch': 'La vitrina guarda figuras de personajes que me encantan, como Nezuko, Eren, Zelda o Tanjiro, y un Funko Pop que personalicé yo. Acércate y toca el botón de acción para verlas de cerca.',
      'tour.impresoras_vitrina.2': 'Encima tiene el cartel de Luprintech, de la familia de los carteles luminosos que hago: de día está apagado y de noche se enciende.',

      // 3 · Atreus
      'tour.atreus.1': 'Y este es Atreus, mi pareja. Si el cuarto gaming tiene alma, es en parte suya.',
      'tour.atreus.2': '¡Hola! Me presento oficialmente: Atreus, residente de dos pantallas, unos cascos y una torre blanca que enseño más de lo necesario.',
      'tour.atreus.3': 'Compartimos setup, consolas y una afición enorme por la tecnología y los videojuegos. Lo mejor de estas cosas es tener a alguien al lado que entienda la ilusión que te hace.',
      'tour.atreus.4': 'Y que te deje la silla cuando necesitas enseñarle algo «un segundo». Spoiler: nunca es un segundo.',
      'tour.atreus.5': 'Puedes hablar con él cuando quieras, que tiene más historias de teclados y ratones de las que yo te contaría.',
      'tour.atreus_consolas.1': 'La estantería de al lado es nuestra colección de consolas: de la Nintendo 64 a la Switch, de la PlayStation 1 a la 4 y también hay una Xbox.',
      'tour.atreus_consolas.2': 'Y la recreativa tiene tres juegos: «La espada del Bucle», «Invasión Galáctica» y «Río en Peligro», con sus récords y sus logros, por si te pica el gusanillo.',

      // 4 · Mi ordenador
      'tour.pc.1': 'Esta es mi zona de trabajo. Desde aquí hago desarrollo web: aplicaciones completas, desde lo que ves en pantalla hasta lo que pasa por detrás.',
      'tour.pc.2': 'Mi relación con los ordenadores viene de lejos: con once o doce años buscaba soluciones en foros desde un ciber, compraba componentes e intentaba arreglar el ordenador de casa. Acabé siendo «la informática» de mi entorno.',
      'tour.pc.3': 'Luego estudié Pedagogía, trabajé en asistencia en carretera y, mientras trabajaba, estudié Desarrollo de Aplicaciones Web. En 2024 di el salto al desarrollo web a tiempo completo.',
      'tour.pc_escritorio.1': 'Este ordenador ya no es solo un listado de proyectos: es un escritorio retro, estilo Windows XP, con sus programas. Al encenderlo hay unos segundos de arranque (puedes saltarlos con E) y se abre una ventana de bienvenida.',
      'tour.pc_escritorio.1.touch': 'Este ordenador ya no es solo un listado de proyectos: es un escritorio retro, estilo Windows XP, con sus programas. Al encenderlo hay unos segundos de arranque (puedes saltarlos tocando la pantalla) y se abre una ventana de bienvenida.',
      'tour.pc_escritorio.2': 'Tienes «Mis proyectos», con su descripción, sus tecnologías y los enlaces disponibles, y un Internet Explorer con un buscador propio: prueba a buscar «proyectos», «Lupe» o «youtube». También hay accesos a mi YouTube de Luprintech y a mi LinkedIn.',
      'tour.pc_escritorio.3': 'Para trastear: Winamp, que pone la misma música que la minicadena; Paint, para dibujar; una calculadora; el Bloc de notas; y un Visual Studio Code con un proyecto de mentira, su terminal y su vista previa.',
      'tour.pc_escritorio.4': 'Y hay un par de secretos escondidos. No te los cuento, pero a los programadores nos encanta saludar al mundo.',

      // 5 · Khalessi
      'tour.khalessi.1': 'Y ahora, la verdadera jefa de la casa. Este es el rincón de Khalessi: su caja de cartón, el rascador, el comedero y el arenero.',
      'tour.khalessi.2': 'meaw!',
      'tour.khalessi.3': 'Es mi gata y la de Atreus. Va a su aire por toda la casa: pasea, come, se asea, afila las uñas en el rascador y se mete a dormir en su caja.',
      'tour.khalessi.4': 'A veces te trae una sardina de juguete y se la deja a Atreus a los pies. Él lo agradece con muchísima educación.',
      'tour.khalessi.5': 'Si la ves cerca, acércate y pulsa E para saludarla. No prometo que te haga caso.',
      'tour.khalessi.5.touch': 'Si la ves cerca, acércate y toca el botón de acción para saludarla. No prometo que te haga caso.',

      // 6 · Cierre
      'tour.cierre.1': 'Y hasta aquí la visita. Ya conoces lo principal: las impresoras, a Atreus, mi ordenador y a Khalessi.',
      'tour.cierre.2': 'Por la sala tienes más cosas con las que curiosear: la estantería de consolas y la recreativa, la tele con sus canales, la minicadena para poner música y la lámpara de pie, que se enciende con E.',
      'tour.cierre.2.touch': 'Por la sala tienes más cosas con las que curiosear: la estantería de consolas y la recreativa, la tele con sus canales, la minicadena para poner música y la lámpara de pie, que se enciende con el botón de acción.',
      'tour.cierre.3': 'Y por la escalera de arriba a la izquierda se sube a la azotea, donde tengo mi telescopio. El cielo es el mismo que ves por la ventana, a la hora que sea fuera.',
      'tour.cierre.4': 'Tus logros y tu partida están en Opciones, el botón de la esquina. Y si prefieres ver el portfolio sin jugar, el modo clásico está en el menú.',
      'tour.cierre.5': 'A partir de aquí, el control es tuyo. Yo me quedo por la sala; si quieres repasar algo, ven a hablar conmigo.',

      // Hablar con Lupe a mitad de visita y después
      'tour.pausa.1': '¿Seguimos con la visita o prefieres mirar por tu cuenta un rato?',
      'tour.despues.1': 'Ya conoces la casa, pero sigue siendo tuya para explorar.',
      'tour.despues.2': 'Cuando quieras repasar algo, párate delante y pulsa E: cada rincón tiene su propia conversación.',
      'tour.despues.2.touch': 'Cuando quieras repasar algo, párate delante y toca el botón de acción: cada rincón tiene su propia conversación.',
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

      'tour.entrada.1': 'This is my house, or rather, my gaming room. I work here, play, print things and stare at screens for longer than is advisable.',
      'tour.entrada.2': "The room is a summary of me: my hobbies on one side, my work on the other and a cat who splits her time between the two without asking permission.",
      'tour.entrada.3': "I'll show you around in parts: the 3D printers, Atreus, my computer and Khalessi's corner. None of it is compulsory: if something catches your eye on the way, stop and have a look.",
      'tour.entrada.4': "And if at any point you'd rather carry on by yourself, just say so. I'll wait wherever we are.",

      'tour.impresoras.1': "We'll start with the maker corner. These are my 3D printers: a Bambu Lab A1 and the A1 mini. In real life I have three, but the third one didn't fit in the pixels.",
      'tour.impresoras.2': 'I got hooked on going from an idea to something you can hold. I design with Fusion 360 and do basic modelling in Blender. I keep learning while I make my own designs.',
      'tour.impresoras.3': 'Mostly I make parametric parts, stands, light-up signs, earrings and keyrings. And figures too: I create them with the help of AI, print them and paint them myself.',
      'tour.impresoras.4': 'You can try it yourself. The A1 mini prints a real figure (well, game-real) and the display case next to it holds my creations.',
      'tour.impresoras_imprimir.1': "Go up to the A1 mini and press E: its panel opens. Hit print and you'll watch the figure grow layer by layer on the machine itself.",
      'tour.impresoras_imprimir.1.touch': "Go up to the A1 mini and tap the action button: its panel opens. Hit print and you'll watch the figure grow layer by layer on the machine itself.",
      'tour.impresoras_imprimir.2': "In real life a print like that takes hours; here it's about twenty seconds. When it finishes, a green alert appears over the printer: collect the figure and it's yours.",
      'tour.impresoras_imprimir.3': 'The reward is a Pikachu and the «First print» achievement. The Pikachu stays in my display case and, if you enjoy it, you can print it again as many times as you like.',
      'tour.impresoras_vitrina.1': 'The display case holds figures of characters I love, like Nezuko, Eren, Zelda or Tanjiro, and a Funko Pop I customised myself. Go up to it and press E to see them up close.',
      'tour.impresoras_vitrina.1.touch': 'The display case holds figures of characters I love, like Nezuko, Eren, Zelda or Tanjiro, and a Funko Pop I customised myself. Go up to it and tap the action button to see them up close.',
      'tour.impresoras_vitrina.2': "Above it is the Luprintech sign, one of the light-up signs I make: it's off by day and lights up at night.",

      'tour.atreus.1': "And this is Atreus, my partner. If the gaming room has a soul, part of it is his.",
      'tour.atreus.2': "Hi! Let me introduce myself properly: Atreus, resident of two screens, a pair of headphones and a white tower that I show off more than necessary.",
      'tour.atreus.3': "We share a setup, consoles and a huge love of technology and video games. The best thing about these hobbies is having someone beside you who understands why it excites you.",
      'tour.atreus.4': 'And who lets you have the chair when you need to show them something «for a second». Spoiler: it is never a second.',
      'tour.atreus.5': "You can talk to him whenever you like: he has more stories about keyboards and mice than I would tell you.",
      'tour.atreus_consolas.1': "The shelf next to him is our console collection: from the Nintendo 64 to the Switch, PlayStation 1 to 4, and there's an Xbox too.",
      'tour.atreus_consolas.2': 'And the arcade machine has three games: «The Loop Sword», «Galactic Invasion» and «River in Danger», with their high scores and achievements, in case you get the itch.',

      'tour.pc.1': "This is my work area. From here I do web development: complete applications, from what you see on screen to what happens behind it.",
      'tour.pc.2': "My relationship with computers goes back a long way: at eleven or twelve I looked for fixes on forums from an internet café, bought components and tried to repair the family computer. I ended up being «the IT person» around me.",
      'tour.pc.3': 'Later I studied Pedagogy, worked in roadside assistance and, while working, studied Web Application Development. In 2024 I made the leap to full-time web development.',
      'tour.pc_escritorio.1': "This computer is no longer just a list of projects: it's a retro desktop, Windows XP style, with its own programs. When you switch it on there are a few seconds of start-up (you can skip them with E) and a welcome window opens.",
      'tour.pc_escritorio.1.touch': "This computer is no longer just a list of projects: it's a retro desktop, Windows XP style, with its own programs. When you switch it on there are a few seconds of start-up (you can skip them by tapping the screen) and a welcome window opens.",
      'tour.pc_escritorio.2': "You'll find «My projects», with their description, technologies and the links available, and an Internet Explorer with its own search engine: try searching for «projects», «Lupe» or «youtube». There are also shortcuts to my Luprintech YouTube and my LinkedIn.",
      'tour.pc_escritorio.3': 'To tinker with: Winamp, which plays the same music as the mini hi-fi; Paint, to draw; a calculator; Notepad; and a Visual Studio Code with a pretend project, its terminal and its preview.',
      'tour.pc_escritorio.4': "And there are a couple of hidden secrets. I won't tell you, but we programmers love to say hello to the world.",

      'tour.khalessi.1': "And now, the real boss of the house. This is Khalessi's corner: her cardboard box, the scratching post, the food bowls and the litter tray.",
      'tour.khalessi.2': 'meaw!',
      'tour.khalessi.3': "She's my cat and Atreus's. She goes her own way around the house: she strolls, eats, washes, sharpens her claws on the scratching post and goes to sleep in her box.",
      'tour.khalessi.4': 'Sometimes she brings you a toy sardine and leaves it at Atreus\'s feet. He accepts it very politely.',
      'tour.khalessi.5': "If you see her nearby, go up and press E to say hi. I can't promise she'll pay attention.",
      'tour.khalessi.5.touch': "If you see her nearby, go up and tap the action button to say hi. I can't promise she'll pay attention.",

      'tour.cierre.1': "And that's the tour. You now know the main things: the printers, Atreus, my computer and Khalessi.",
      'tour.cierre.2': "There's more to poke around in the room: the console shelf and the arcade machine, the TV with its channels, the mini hi-fi for putting music on and the floor lamp, which turns on with E.",
      'tour.cierre.2.touch': "There's more to poke around in the room: the console shelf and the arcade machine, the TV with its channels, the mini hi-fi for putting music on and the floor lamp, which turns on with the action button.",
      'tour.cierre.3': "And the stairs at the top left lead up to the roof, where my telescope is. The sky is the same one you see through the window, whatever the time outside.",
      'tour.cierre.4': "Your achievements and your saved game are in Options, the button in the corner. And if you'd rather see the portfolio without playing, classic mode is in the menu.",
      'tour.cierre.5': "From here on, you're in control. I'll stay in the room; if you want to go over something again, come and talk to me.",

      'tour.pausa.1': 'Shall we carry on with the tour, or would you rather look around by yourself for a while?',
      'tour.despues.1': "You know the house now, but it's still yours to explore.",
      'tour.despues.2': 'Whenever you want to go over something again, stand in front of it and press E: every corner has its own conversation.',
      'tour.despues.2.touch': 'Whenever you want to go over something again, stand in front of it and tap the action button: every corner has its own conversation.',
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
