import { Link } from 'react-router-dom'
import useSWR from 'swr'
import { useProjects } from '../../hooks/useProjects'
import { LINKS, TECHS, useValleCopy } from '../../lib/valleCopy'

// Bloques de contenido compartidos: el juego y el modo clásico pintan lo mismo.

export function AboutBlock() {
  const { copy } = useValleCopy()
  return (
    <div className="px-text space-y-3">
      <p className="text-[var(--text-secondary)]">{copy.about.role}. {copy.about.location}.</p>
      {copy.about.bio.map((line) => (
        <p key={line} className="max-w-[60ch] leading-relaxed">{line}</p>
      ))}
      <p className="flex flex-wrap gap-x-5 gap-y-2 pt-2">
        <a className="px-link" href={LINKS.cv} target="_blank" rel="noopener noreferrer">{copy.about.cv}</a>
        <a className="px-link" href={LINKS.linkedin} target="_blank" rel="noopener noreferrer">{copy.about.linkedin}</a>
        <a className="px-link" href={LINKS.youtube} target="_blank" rel="noopener noreferrer">{copy.about.youtube}</a>
      </p>
    </div>
  )
}

export function StackBlock() {
  const { copy } = useValleCopy()
  return (
    <div className="px-text space-y-3">
      <p className="text-[var(--text-secondary)]">{copy.stackLead}</p>
      <ul className="flex flex-wrap gap-2">
        {TECHS.map((tech) => (
          <li key={tech} className="px-chip">{tech}</li>
        ))}
      </ul>
    </div>
  )
}

export function ProjectsBlock({ limit, onNavigate }) {
  const { copy, lang } = useValleCopy()
  const { projects, loading, error } = useProjects()
  const list = limit ? projects.slice(0, limit) : projects

  if (loading) return <p className="px-text text-[var(--text-secondary)]">{copy.projects.loading}</p>
  if (error || list.length === 0) return <p className="px-text text-[var(--text-secondary)]">{copy.projects.empty}</p>

  return (
    <div className="px-text space-y-5">
      <ul className="space-y-5">
        {list.map((project) => {
          const description = lang === 'en' && project.description_en ? project.description_en : project.description
          return (
            <li key={project.id} className="px-frame px-frame--quiet p-4">
              <h3 className="px-title text-2xl">{project.title}</h3>
              {description && <p className="mt-2 max-w-[62ch] leading-relaxed text-[var(--text-secondary)]">{description}</p>}
              {Array.isArray(project.tech) && project.tech.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <li key={tech} className="px-chip">{tech}</li>
                  ))}
                </ul>
              )}
              <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {project.demo && <a className="px-link" href={project.demo} target="_blank" rel="noopener noreferrer">{copy.projects.demo}</a>}
                {project.github && <a className="px-link" href={project.github} target="_blank" rel="noopener noreferrer">{copy.projects.code}</a>}
              </p>
            </li>
          )
        })}
      </ul>
      {limit && (
        <Link className="px-link inline-block" to="/proyectos" onClick={onNavigate}>{copy.projects.all}</Link>
      )}
    </div>
  )
}

export function PostsBlock({ limit = 4, onNavigate }) {
  const { copy } = useValleCopy()
  const { data, isLoading } = useSWR('/api/posts')
  const posts = (Array.isArray(data) ? data : [])
    .slice()
    .sort((a, b) => Date.parse(b?.date || 0) - Date.parse(a?.date || 0))
    .slice(0, limit)

  if (isLoading) return <p className="px-text text-[var(--text-secondary)]">…</p>

  return (
    <div className="px-text space-y-4">
      <p className="text-[var(--text-secondary)]">{copy.blog.lead}</p>
      {posts.length === 0 ? (
        <p>{copy.blog.empty}</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link className="px-link text-lg" to={`/blog/${post.slug}`} onClick={onNavigate}>{post.title}</Link>
              {post.excerpt && <p className="max-w-[62ch] text-[var(--text-secondary)]">{post.excerpt}</p>}
            </li>
          ))}
        </ul>
      )}
      <Link className="px-btn" to="/blog" onClick={onNavigate}>{copy.blog.all}</Link>
    </div>
  )
}

export function ContactBlock({ onNavigate }) {
  const { copy } = useValleCopy()
  return (
    <div className="px-text space-y-4">
      <p className="max-w-[60ch]">{copy.contact.lead}</p>
      <p className="flex flex-wrap items-center gap-4">
        <Link className="px-btn" to="/contacto" onClick={onNavigate}>{copy.contact.form}</Link>
        <a className="px-link" href={LINKS.linkedin} target="_blank" rel="noopener noreferrer">{copy.about.linkedin}</a>
      </p>
    </div>
  )
}
