import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { lazy, Suspense } from "react";
import ProtectedRoute from "../components/cms/ProtectedRoute";
import { GameThemeScope } from "../context/GameThemeContext";

// Páginas del portfolio (lazy)
const Title                  = lazy(() => import("../pages/Title"));
const Valle                  = lazy(() => import("../pages/Valle"));
// La web original de /clasico vive aislada en su carpeta; su CSS solo entra con este chunk diferido.
const Clasico                = lazy(() => import("../clasico/ClasicoHome"));
const Cv                     = lazy(() => import("../pages/Cv"));
const Portfolio              = lazy(() => import("../pages/Portfolio"));
const PortfolioDesarrolloWeb = lazy(() => import("../pages/portfolio/desarrollo-web"));
const PortfolioDocumentacion = lazy(() => import("../pages/portfolio/documentacion-tecnica"));
const Blog                   = lazy(() => import("../pages/Blog"));
const BlogPost               = lazy(() => import("../pages/BlogPost"));
const BlogPostPreview        = lazy(() => import("../pages/BlogPostPreview"));
const Contact                = lazy(() => import("../pages/Contact"));
const PoliticaCookies        = lazy(() => import("../pages/PoliticaCookies"));
const PoliticaPrivacidad     = lazy(() => import("../pages/PoliticaPrivacidad"));
const NotFound               = lazy(() => import("../pages/NotFound"));

// Páginas del CMS /bitacora (lazy)
const BitacoraLogin          = lazy(() => import("../pages/cms/BitacoraLogin"));
const BitacoraLayout         = lazy(() => import("../pages/cms/BitacoraLayout"));
const BitacoraHome           = lazy(() => import("../pages/cms/BitacoraHome"));
const BitacoraPosts          = lazy(() => import("../pages/cms/BitacoraPosts"));
const BitacoraPostEditor     = lazy(() => import("../pages/cms/BitacoraPostEditor"));
const BitacoraProjects       = lazy(() => import("../pages/cms/BitacoraProjects"));
const BitacoraProjectEditor  = lazy(() => import("../pages/cms/BitacoraProjectEditor"));
const BitacoraImages         = lazy(() => import("../pages/cms/BitacoraImages"));
const BitacoraChat           = lazy(() => import("../pages/cms/BitacoraChat"));
const BitacoraCV             = lazy(() => import("../pages/cms/BitacoraCV"));
const BitacoraUsers          = lazy(() => import("../pages/cms/BitacoraUsers"));
const BitacoraMiPerfil       = lazy(() => import("../pages/cms/BitacoraMiPerfil"));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-[var(--accent-primary)]/30 border-t-[var(--accent-primary)] rounded-none animate-spin" />
      <div className="absolute inset-0 w-16 h-16 border-4 border-[var(--accent-secondary)]/30 border-t-[var(--accent-secondary)] rounded-none animate-spin animation-delay-150" />
    </div>
  </div>
);

// Animación de transición entre páginas
const pageTransition = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -8 },
  transition: { duration: 0.4, ease: "easeInOut" },
};

export default function AppRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* Portfolio */}
          {/* El tema del juego (Aventura o Cozy) solo existe en la portada y el valle */}
          {/* Con su propio Suspense, el tema ya está puesto mientras carga el chunk: la pantalla de carga sale en el tema elegido */}
          <Route element={<GameThemeScope><Suspense fallback={<PageLoader />}><Outlet /></Suspense></GameThemeScope>}>
            <Route path="/" element={<Title />} />
            <Route path="/valle" element={<Valle />} />
          </Route>
          <Route path="/cv" element={<Cv />} />
          {/* Sin Motion.div: el transform del envoltorio rompería el position: fixed de la barra original */}
          <Route path="/clasico" element={<Clasico />} />
          <Route path="/sobre-mi" element={<Navigate to="/clasico#about" replace />} />
          <Route path="/portfolio" element={<Motion.div {...pageTransition}><Portfolio /></Motion.div>} />
          <Route path="/proyectos"                       element={<Motion.div {...pageTransition}><PortfolioDesarrolloWeb /></Motion.div>} />
          <Route path="/portfolio/desarrollo-web"        element={<Navigate to="/proyectos" replace />} />
          <Route path="/portfolio/documentacion-tecnica" element={<Motion.div {...pageTransition}><PortfolioDocumentacion /></Motion.div>} />
          <Route path="/blog"           element={<Motion.div {...pageTransition}><Blog /></Motion.div>} />
          <Route path="/blog/preview"   element={<BlogPostPreview />} />
          <Route path="/blog/:slug"     element={<Motion.div {...pageTransition}><BlogPost /></Motion.div>} />
          <Route path="/contacto"   element={<Motion.div {...pageTransition}><Contact /></Motion.div>} />
          <Route path="/politica-cookies"    element={<Motion.div {...pageTransition}><PoliticaCookies /></Motion.div>} />
          <Route path="/politica-privacidad" element={<Motion.div {...pageTransition}><PoliticaPrivacidad /></Motion.div>} />

          {/* CMS /bitacora */}
          <Route path="/bitacora">
            {/* Login: index route, accesible sin autenticación */}
            <Route index element={<BitacoraLogin />} />

            {/* Layout protegido (pathless): aplica ProtectedRoute + BitacoraLayout a todos los hijos */}
            <Route element={<ProtectedRoute><BitacoraLayout /></ProtectedRoute>}>
              <Route path="inicio"                  element={<BitacoraHome />} />
              <Route path="posts"                   element={<BitacoraPosts />} />
              <Route path="posts/nuevo"             element={<BitacoraPostEditor />} />
              <Route path="posts/editar/:slug"      element={<BitacoraPostEditor />} />
              <Route path="proyectos"               element={<BitacoraProjects />} />
              <Route path="proyectos/nuevo"         element={<BitacoraProjectEditor />} />
              <Route path="proyectos/editar/:id"    element={<BitacoraProjectEditor />} />
              <Route path="imagenes"                element={<BitacoraImages />} />
              <Route path="cv"                      element={<BitacoraCV />} />
              <Route path="chat"                    element={<BitacoraChat />} />
              <Route path="usuarios"                element={<BitacoraUsers />} />
              <Route path="mi-perfil"               element={<BitacoraMiPerfil />} />
            </Route>
          </Route>

          {/* 404: catch-all */}
          <Route path="*" element={<Motion.div {...pageTransition}><NotFound /></Motion.div>} />

        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
