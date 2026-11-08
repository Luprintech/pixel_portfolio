import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTheme } from "../hooks/useTheme";
import { useValleCopy } from "../lib/valleCopy";

const linkClass = ({ isActive }) =>
  `px-text px-3 py-2 text-base transition-colors ${
    isActive
      ? "bg-[var(--accent-primary)] text-[#1c1b3a]"
      : "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
  }`;

/* Interruptor día/noche: dos píxeles, sin iconos de librería. */
function ThemeToggleButton() {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  return (
    <button
      id="theme-toggle-btn"
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="px-btn px-btn--ghost !min-h-[40px] !px-3"
    >
      <span
        aria-hidden="true"
        className="block h-4 w-4"
        style={{
          background: isDark ? "#f2b134" : "#1c1b3a",
          clipPath: isDark
            ? "polygon(0 25%,25% 25%,25% 0,75% 0,75% 25%,100% 25%,100% 75%,75% 75%,75% 100%,25% 100%,25% 75%,0 75%)"
            : "polygon(25% 0,75% 0,75% 25%,50% 25%,50% 75%,75% 75%,75% 100%,25% 100%,0 75%,0 25%)",
        }}
      />
    </button>
  );
}

/* Barra de las páginas clásicas (la portada y el juego tienen su propia interfaz). */
export default function Navbar() {
  const { copy } = useValleCopy();
  const [open, setOpen] = useState(false);

  const items = [
    ["/", copy.nav.home, true],
    ["/clasico", copy.nav.classic],
    ["/proyectos", copy.nav.projects],
    ["/blog", copy.nav.blog],
    ["/contacto", copy.nav.contact],
  ];

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 top-0 z-30 border-b-[6px] border-[var(--px-ink)] bg-[var(--nav-bg-scrolled)] shadow-[0_4px_0_var(--accent-primary)]"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="px-title text-3xl leading-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-secondary)]">
          Valle del Bucle
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {items.map(([to, label, end]) => (
            <li key={to}>
              <NavLink to={to} end={end} className={linkClass}>{label}</NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggleButton />
          <LanguageSwitcher />
          <button
            type="button"
            className="px-btn px-btn--ghost !min-h-[40px] !px-3 md:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label="Menú"
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true" className="block h-3 w-5 border-y-[3px] border-current">
              <span className="block h-[3px] translate-y-[3px] bg-current" />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <ul id="menu-movil" className="border-t-[3px] border-[var(--px-ink)] bg-[var(--nav-bg-mobile)] p-3 md:hidden">
          {items.map(([to, label, end]) => (
            <li key={to}>
              <NavLink to={to} end={end} className={(s) => `${linkClass(s)} block`} onClick={() => setOpen(false)}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
