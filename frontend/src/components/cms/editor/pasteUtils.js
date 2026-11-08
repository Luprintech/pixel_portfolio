// Limpieza del HTML que llega al pegar contenido desde fuera del editor.

// Las tablas de Word, Google Docs o Sheets traen atributos que rompen el esquema de Tiptap.
export function cleanPastedTableHtml(html) {
            // Limpiar tablas pegadas de Word/Google Docs/sitios externos
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Remover atributos problemáticos que rompen el schema de TipTap
            doc.querySelectorAll('table, tbody, thead, tr, td, th, colgroup, col').forEach(el => {
                el.removeAttribute('class');
                el.removeAttribute('width');
                el.removeAttribute('height');
                el.removeAttribute('style');
                el.removeAttribute('data-sheets-value');
                el.removeAttribute('data-sheets-formula');
                // Mantener colspan/rowspan que son estructurales
            });

            // Eliminar colgroup completo (TipTap no lo usa)
            doc.querySelectorAll('colgroup').forEach(el => el.remove());

            return doc.body.innerHTML;
}
