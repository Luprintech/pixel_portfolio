import { Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import LuprinCat from "./Luprincat";
import useScrollSpy from "../hooks/useScrollSpy";
import { scrollToSection } from "./ScrollSnapContainer";

const HOME_SECTIONS = ["hero"];
const SNAP_ROOT_ID = "snap-root";

const LINK_CLASS = "typo-label px-3 py-2 rounded transition hover:text-fuchsia-300";
const MOBILE_LINK_CLASS = "typo-label block py-2 border-b border-[var(--border-default)] text-[var(--text-primary)] transition";

function getSectionLinkClass(isActive) {
  return `typo-label px-3 py-2 rounded transition ${
    isActive
      ? "text-[var(--accent-secondary)] bg-[var(--accent-secondary-dim)]"
      : "hover:text-fuchsia-300"
  }`;
}

function getMobileSectionLinkClass(isActive) {
  return `typo-label block py-2 border-b border-[var(--border-default)] transition ${
    isActive
      ? "text-[var(--accent-secondary)] font-semibold"
      : "text-[var(--text-primary)]"
  }`;
}

// Barra de la web original. Solo vive dentro de /clasico, así que "inicio" siempre es la sección hero
// del contenedor snap; el resto de enlaces salen a las páginas del sitio actual.
export default function ClasicoNavbar() {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeSection = useScrollSpy(HOME_SECTIONS);

  // Gato holográfico: se invoca pulsando cinco veces el logo
  const [catVisible, setCatVisible] = useState(false);
  const clickTimeoutRef = useRef(null);
  const clickCountRef = useRef(0);

  useEffect(() => () => clearTimeout(clickTimeoutRef.current), []);

  const handleLogoClick = () => {
    clickCountRef.current += 1;
    clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 2000);
    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      setCatVisible(true);
    }
  };

  const goToHero = useCallback(() => {
    setMenuOpen(false);
    if (!scrollToSection(document.getElementById(SNAP_ROOT_ID), "hero")) return;
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  useEffect(() => {
    const snapRoot = document.getElementById(SNAP_ROOT_ID);
    const scrollTarget = snapRoot || window;
    const handleScroll = () => {
      const offset = snapRoot ? snapRoot.scrollTop : window.scrollY;
      setIsScrolled(offset > 10);
    };

    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => scrollTarget.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav
        className={`
          fixed w-full z-30 backdrop-blur-xl transition-all duration-300
          ${
            isScrolled
              ? "bg-[var(--nav-bg-scrolled)] border-b border-[var(--nav-border)] shadow-[var(--shadow-nav)]"
              : "bg-transparent"
          }
        `}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-3 xs:px-5 md:px-7 h-20">
          {/* Logo */}
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="typo-title max-w-[160px] truncate font-extrabold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400 select-none cursor-pointer transition-transform duration-300 hover:scale-[1.02] sm:max-w-none sm:text-xl md:text-2xl"
              onClick={(e) => { e.stopPropagation(); handleLogoClick(); goToHero(); }}
            >
              Guadalupe <span className="text-cyan-300 font-extrabold">Cano</span>
            </span>
          </div>

          {/* Navegación desktop */}
          <div className="hidden md:flex gap-2 items-center text-base font-medium">
            <button type="button" onClick={goToHero} className={getSectionLinkClass(activeSection === "hero")}>{t("nav.home")}</button>
            <Link to="/proyectos" className={LINK_CLASS}>{t("nav.projects")}</Link>
            <Link to="/blog" className={LINK_CLASS}>Blog</Link>
            <Link to="/contacto" className={LINK_CLASS}>{t("nav.contact")}</Link>

            <div className="h-5 w-px bg-[var(--border-default)] mx-2 hidden lg:block" />

            {/* Salidas hacia el juego y la portada */}
            <Link to="/valle" className={`${LINK_CLASS} text-[var(--accent-secondary)]`}>{t("nav.valley")}</Link>
            <Link to="/" className={`${LINK_CLASS} text-[var(--text-muted)]`}>{t("nav.title")}</Link>

            <div className="h-5 w-px bg-[var(--border-default)] mx-2 hidden lg:block" />

            <LanguageSwitcher />
          </div>

          {/* Móvil: solo la hamburguesa, el resto vive en el cajón */}
          <div className="md:hidden flex items-center gap-2">
            <button
              className="flex items-center justify-center w-9 h-9 text-[var(--text-primary)] focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={t("nav.menu_open")}
              aria-expanded={menuOpen}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="3" y1="6"  x2="21" y2="6"  />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        <AnimatePresence>
          {menuOpen && (
            <Motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="md:hidden bg-[var(--nav-bg-mobile)] shadow-xl rounded-b-2xl border-t border-[var(--nav-border)] px-4 py-3"
            >
              <button type="button" className={`${getMobileSectionLinkClass(activeSection === "hero")} w-full text-left`} onClick={goToHero}>{t("nav.home")}</button>
              <Link to="/proyectos" className={MOBILE_LINK_CLASS} onClick={closeMenu}>{t("nav.projects")}</Link>
              <Link to="/blog" className={MOBILE_LINK_CLASS} onClick={closeMenu}>Blog</Link>
              <Link to="/contacto" className={MOBILE_LINK_CLASS} onClick={closeMenu}>{t("nav.contact")}</Link>
              <Link to="/valle" className={`${MOBILE_LINK_CLASS} text-[var(--accent-secondary)]`} onClick={closeMenu}>{t("nav.valley")}</Link>
              <Link to="/" className={`${MOBILE_LINK_CLASS} text-[var(--text-muted)]`} onClick={closeMenu}>{t("nav.title")}</Link>

              {/* Selector de idioma dentro del cajón */}
              <div className="pt-3 pb-1 flex items-center justify-between">
                <span className="typo-label text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  {t("nav.language")}
                </span>
                <LanguageSwitcher />
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </nav>

      {catVisible && <LuprinCat onClose={() => setCatVisible(false)} />}
    </>
  );
}
