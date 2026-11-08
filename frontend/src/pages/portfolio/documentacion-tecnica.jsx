import { motion as Motion } from "framer-motion";
import { FaYoutube } from "react-icons/fa";
import { Trans, useTranslation } from "react-i18next";

export default function PortfolioDocumentacion() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-28 px-6 md:px-16 relative overflow-x-hidden selection:bg-[var(--accent-secondary)]/30">
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-[var(--accent-secondary)]/10 rounded-none mix-blend-screen animate-pulse pointer-events-none z-0" />
      <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none z-0" />

      <Motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-4xl mx-auto text-center mb-12"
      >
        <h1 className="typo-title text-4xl md:text-5xl font-extrabold mb-6 text-[var(--text-primary)] ">
          {t('portfolio.docs_title')}
        </h1>
      </Motion.div>

      <div className="relative z-10 max-w-4xl mx-auto mb-16">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 sm:p-8 md:p-12 rounded-none shadow-[var(--card-shadow)] text-[var(--text-secondary)] text-lg leading-relaxed ">
          <p className="typo-body mb-6 text-justify">{t('portfolio.docs_desc')}</p>

          <h3 className="typo-title text-xl font-bold text-[var(--accent-secondary)] mb-4 mt-8">{t('portfolio.docs_examples_title')}</h3>
          <ul className="typo-body list-disc list-inside space-y-3 mb-8 text-[var(--text-muted)] marker:text-[var(--accent-primary)]">
            <li><Trans i18nKey="portfolio.docs_ex1" components={{ highlight: <span className="text-gray-200 font-medium" /> }} /></li>
            <li><Trans i18nKey="portfolio.docs_ex2" components={{ highlight: <span className="text-gray-200 font-medium" /> }} /></li>
            <li><Trans i18nKey="portfolio.docs_ex3" components={{ highlight: <span className="text-gray-200 font-medium" /> }} /></li>
            <li><Trans i18nKey="portfolio.docs_ex4" components={{ highlight: <span className="text-gray-200 font-medium" /> }} /></li>
            <li><Trans i18nKey="portfolio.docs_ex5" components={{ highlight: <span className="text-gray-200 font-medium" /> }} /></li>
          </ul>

          <div className="p-4 bg-[var(--bg-elevated)] rounded-none border-l-4 border-[var(--accent-primary)] border border-[var(--border-subtle)]">
            <p className="typo-body text-[var(--accent-secondary)] font-medium italic">
              {t('portfolio.docs_quote')}
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta YouTube */}
      <Motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-4xl mx-auto bg-[var(--bg-surface)] border border-[var(--accent-primary)]/30 rounded-none p-6 sm:p-10 text-center shadow-[var(--card-shadow)] transition-all "
      >
        <FaYoutube className="text-6xl text-red-500 mx-auto mb-6" />
        <h2 className="typo-title text-2xl font-bold mb-8 text-[var(--text-primary)]">{t('portfolio.docs_yt_title')}</h2>
        <a
          href="https://www.youtube.com/@Luprintech"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-none text-[#1c1b3a] font-bold transition-all bg-[var(--accent-primary)]"
        >
          <FaYoutube className="text-xl" />
          {t('portfolio.docs_yt_btn')}
        </a>
      </Motion.div>
    </div>
  );
}
