import { useTranslation } from 'react-i18next'

// Textos del Valle y del modo clásico. El contenido de proyectos y posts viene de la API.
export const TECHS = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'PHP', 'Laravel', 'MySQL',
  'TailwindCSS', 'HTML5', 'CSS3', 'Docker', 'Linux', 'Nginx', 'WordPress',
]

export const LINKS = {
  linkedin: 'https://www.linkedin.com/in/guadalupe-cano-moyano/',
  youtube: 'https://www.youtube.com/@Luprintech',
  cv: '/CV_Guadalupe_Cano.pdf',
}

const COPY = {
  es: {
    gameTitle: 'Valle del Bucle',
    tagline: 'El portfolio interactivo de Guadalupe Cano',
    studio: 'Luprintech',
    audio: { play: 'Activar música', mute: 'Silenciar música', volume: 'Volumen de la música' },
    menu: { continue: 'Continuar aventura', random: 'Nueva aventura', edit: 'Personalizar viajera', classic: 'Modo clásico' },
    shortcuts: 'Atajos',
    zones: {
      about: 'Casa de Sobre mí',
      projects: 'Casa de Proyectos',
      contact: 'Casa de Contacto',
      blog: 'Mazmorra del Blog',
      stack: 'Herrería del Stack',
    },
    sections: { about: 'Sobre mí', projects: 'Proyectos', contact: 'Contacto', blog: 'Blog', stack: 'Stack' },
    about: {
      role: 'Desarrolladora web full stack',
      bio: [
        'Trabajo con React, Node.js e integración de IA. Me gusta que lo que construyo salga a producción y siga funcionando después.',
        'También hago automatización con n8n y documentación técnica, para que otras personas puedan mantener lo que dejo hecho.',
      ],
      location: 'Córdoba, España',
      cv: 'Descargar CV',
      linkedin: 'LinkedIn',
      youtube: 'Canal de YouTube',
    },
    contact: {
      lead: 'Cuéntame qué necesitas y te respondo por correo.',
      form: 'Escribirme',
    },
    blog: { lead: 'Notas de lo que voy aprendiendo y construyendo.', all: 'Ver todos los posts', open: 'Bajar a la mazmorra', empty: 'Aún no hay posts publicados.' },
    projects: { all: 'Ver todos los proyectos', demo: 'Ver demo', code: 'Ver código', empty: 'Aún no hay proyectos publicados.', loading: 'Cargando proyectos…' },
    stackLead: 'Las herramientas que uso a diario.',
    hud: {
      enter: 'Entrar',
      close: 'Cerrar',
      exit: 'Salir',
      classic: 'Modo clásico',
      controls: 'Flechas o WASD para andar. Pisa una puerta para entrar.',
      touchControls: 'Mueve el joystick. Pisa una puerta para entrar.',
      loading: 'Preparando el valle…',
      error: 'No se pudo cargar el juego. Prueba el modo clásico.',
    },
    editor: {
      title: 'Tu viajera',
      random: 'Aleatoria',
      go: 'Entrar al valle',
      hint: 'Khalessi irá contigo.',
    },
    nav: { home: 'Inicio', classic: 'Clásico', projects: 'Proyectos', blog: 'Blog', contact: 'Contacto' },
    back: 'Volver al valle',
  },
  en: {
    gameTitle: 'Valle del Bucle',
    tagline: "Guadalupe Cano's interactive portfolio",
    studio: 'Luprintech',
    audio: { play: 'Turn music on', mute: 'Mute music', volume: 'Music volume' },
    menu: { continue: 'Continue adventure', random: 'New adventure', edit: 'Customize traveller', classic: 'Classic mode' },
    shortcuts: 'Shortcuts',
    zones: {
      about: 'About me house',
      projects: 'Projects house',
      contact: 'Contact house',
      blog: 'Blog dungeon',
      stack: 'Stack forge',
    },
    sections: { about: 'About me', projects: 'Projects', contact: 'Contact', blog: 'Blog', stack: 'Stack' },
    about: {
      role: 'Full stack web developer',
      bio: [
        'I work with React, Node.js and AI integration. I like what I build to reach production and keep working afterwards.',
        'I also do automation with n8n and technical documentation, so other people can maintain what I leave behind.',
      ],
      location: 'Córdoba, Spain',
      cv: 'Download CV',
      linkedin: 'LinkedIn',
      youtube: 'YouTube channel',
    },
    contact: {
      lead: 'Tell me what you need and I will reply by email.',
      form: 'Write to me',
    },
    blog: { lead: "Notes on what I'm learning and building.", all: 'See all posts', open: 'Go down the dungeon', empty: 'No posts published yet.' },
    projects: { all: 'See all projects', demo: 'View demo', code: 'View code', empty: 'No projects published yet.', loading: 'Loading projects…' },
    stackLead: 'The tools I use every day.',
    hud: {
      enter: 'Enter',
      close: 'Close',
      exit: 'Exit',
      classic: 'Classic mode',
      controls: 'Arrows or WASD to walk. Step on a door to go in.',
      touchControls: 'Move the joystick. Step on a door to go in.',
      loading: 'Getting the valley ready…',
      error: "The game couldn't load. Try classic mode.",
    },
    editor: {
      title: 'Your traveller',
      random: 'Random',
      go: 'Enter the valley',
      hint: 'Khalessi will come along.',
    },
    nav: { home: 'Home', classic: 'Classic', projects: 'Projects', blog: 'Blog', contact: 'Contact' },
    back: 'Back to the valley',
  },
}

export function useValleCopy() {
  const { i18n } = useTranslation()
  const lang = (i18n.resolvedLanguage || i18n.language || 'es').startsWith('en') ? 'en' : 'es'
  return { copy: COPY[lang], lang }
}
