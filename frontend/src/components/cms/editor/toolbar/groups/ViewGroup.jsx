// Código fuente, cambio de tema, vista previa y pantalla completa.
import { ToolBtn } from '../ToolbarParts';

export default function ViewGroup({
    fullscreen,
    isDark,
    markdownMode,
    onToggleFullscreen,
    setShowPreview,
    toggleMarkdownMode,
    toggleTheme,
}) {
    return (
        <>
            {/* Markdown / Source toggle */}
            <ToolBtn onClick={toggleMarkdownMode} active={markdownMode} title={markdownMode ? 'Modo visual' : 'Modo código fuente'}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
            </ToolBtn>

            {/* Theme toggle */}
            <ToolBtn onClick={toggleTheme} title={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}>
                {isDark ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                )}
            </ToolBtn>

            {/* Preview y pantalla completa */}
            <div className="ml-auto flex items-center gap-1">
                <ToolBtn onClick={() => setShowPreview(true)} title="Vista previa (Ctrl+P)">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </ToolBtn>
                <ToolBtn onClick={onToggleFullscreen} title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
                    {fullscreen
                        ? <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                        : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>}
                </ToolBtn>
            </div>
        </>
    );
}
