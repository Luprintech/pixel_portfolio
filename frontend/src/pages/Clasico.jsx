import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { AboutBlock, ContactBlock, PostsBlock, ProjectsBlock, StackBlock } from '../components/valle/Content'
import { useValleCopy } from '../lib/valleCopy'

function Section({ id, title, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="px-frame p-5 sm:p-7">
      <h2 id={`${id}-title`} className="px-title mb-4 text-4xl sm:text-5xl">{title}</h2>
      {children}
    </section>
  )
}

// Modo clásico: HTML real, indexable y legible sin juego. Mismo contenido que el valle.
export default function Clasico() {
  const { copy } = useValleCopy()
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 pb-16 pt-28 sm:px-6">
      <Helmet>
        <title>Guadalupe Cano | Desarrolladora web full stack (modo clásico)</title>
        <meta
          name="description"
          content="Portfolio de Guadalupe Cano: desarrolladora web full stack con React, Node.js e IA. Sobre mí, stack, proyectos, blog y contacto en una sola página."
        />
        <link rel="canonical" href="https://guadalupecano.es/clasico" />
      </Helmet>

      <header>
        <h1 className="px-title text-6xl sm:text-8xl">Guadalupe Cano</h1>
        <p className="px-text mt-3 text-lg text-[var(--text-secondary)]">{copy.about.role}</p>
        <p className="px-text mt-4">
          <Link className="px-btn" to="/valle?modo=azar">{copy.back}</Link>
        </p>
      </header>

      <Section id="sobre-mi" title={copy.sections.about}><AboutBlock /></Section>
      <Section id="stack" title={copy.sections.stack}><StackBlock /></Section>
      <Section id="proyectos" title={copy.sections.projects}><ProjectsBlock /></Section>
      <Section id="blog" title={copy.sections.blog}><PostsBlock limit={4} /></Section>
      <Section id="contacto" title={copy.sections.contact}><ContactBlock /></Section>
    </div>
  )
}
