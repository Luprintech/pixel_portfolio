import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient gradient */}
      <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 text-center max-w-xl mx-auto"
      >
        <p className="text-8xl md:text-9xl font-extrabold text-[var(--text-primary)] leading-none mb-4">
          404
        </p>

        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">
          {t("notfound.title", "Página no encontrada")}
        </h1>

        <p className="text-[var(--text-secondary)] mb-10 leading-relaxed">
          {t("notfound.desc", "La ruta que buscas no existe o ha sido movida.")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-8 py-3 rounded-none font-semibold text-[#1c1b3a] shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-1 bg-[var(--accent-primary)]"
          >
            {t("notfound.go_home", "Volver al inicio")}
          </Link>
          <Link
            to="/contacto"
            className="px-8 py-3 rounded-none font-semibold text-[var(--accent-secondary)] border border-[var(--accent-secondary)]/50 bg-[var(--bg-elevated)] hover:bg-[var(--accent-secondary-dim)] transition-all duration-300 hover:-translate-y-1"
          >
            {t("notfound.contact", "Contacto")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
