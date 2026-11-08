import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { useRef, useState } from 'react';
import PdfPreview from '../../../shared/PdfPreview';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';

// DocumentAttachment: documentos adjuntos (PDF, ZIP, DOCX)
function formatFileSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

function DocumentView({ node, updateAttributes, selected, deleteNode }) {
    const isPdf = node.attrs.fileType === 'pdf';
    const mode = node.attrs.displayMode || (isPdf ? 'embed' : 'link');
    const ICONS = { pdf: '📄', zip: '📦', docx: '📝' };
    const wrapRef = useRef(null);
    const [resizing, setResizing] = useState(false);
    const startData = useRef(null);

    function startResize(e, corner) {
        e.preventDefault();
        e.stopPropagation();
        const el = wrapRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        startData.current = {
            corner,
            startX: e.clientX,
            startY: e.clientY,
            startW: rect.width,
            startH: node.attrs.embedHeight || 500,
        };
        setResizing(true);

        function onMove(ev) {
            const { corner: c, startX, startY, startW, startH } = startData.current;
            const dx = c.includes('r') ? ev.clientX - startX : startX - ev.clientX;
            const dy = c.includes('b') ? ev.clientY - startY : startY - ev.clientY;
            const newW = Math.max(300, startW + dx);
            const newH = Math.max(200, Math.round(startH + dy));
            updateAttributes({ embedWidth: Math.round(newW), embedHeight: newH });
        }
        function onUp() {
            setResizing(false);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        }
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }

    const embedWidth = node.attrs.embedWidth || null;
    const handleCls = 'absolute w-3 h-3 bg-fuchsia-500 border-2 border-white rounded-full z-10';

    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            frameClassName="w-full"
        >
            <div
                ref={wrapRef}
                className={`relative group border border-[var(--border-color)] rounded-xl overflow-hidden ${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-transparent' : ''}`}
                contentEditable={false}
                style={{ width: embedWidth ? `${embedWidth}px` : '100%', maxWidth: '100%', cursor: resizing ? 'nwse-resize' : 'default' }}
            >
                {/* Tiradores para cambiar el tamaño */}
                {isPdf && mode === 'embed' && (
                    <div className={`${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                        <div className={`${handleCls} top-[-6px] left-[-6px] cursor-nwse-resize`} onMouseDown={e => startResize(e, 'tl')} />
                        <div className={`${handleCls} top-[-6px] right-[-6px] cursor-nesw-resize`} onMouseDown={e => startResize(e, 'tr')} />
                        <div className={`${handleCls} bottom-[-6px] left-[-6px] cursor-nesw-resize`} onMouseDown={e => startResize(e, 'bl')} />
                        <div className={`${handleCls} bottom-[-6px] right-[-6px] cursor-nwse-resize`} onMouseDown={e => startResize(e, 'br')} />
                    </div>
                )}
                {/* PDF carousel viewer */}
                {isPdf && mode === 'embed' && (
                    <div className="bg-[var(--bg-primary)]/70 p-2">
                        <PdfPreview
                            src={node.attrs.src}
                            title={node.attrs.filename || 'Documento PDF'}
                            height={node.attrs.embedHeight || 500}
                        />
                    </div>
                )}

                {/* Bottom bar: always visible */}
                <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-elevated)]">
                    <span className="text-2xl">{ICONS[node.attrs.fileType] || '📎'}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{node.attrs.filename}</p>
                        <div className="flex items-center gap-2">
                            {node.attrs.fileSize > 0 && (
                                <p className="text-xs text-[var(--text-muted)]">{formatFileSize(node.attrs.fileSize)}</p>
                            )}
                            {isPdf && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-fuchsia-500/15 text-fuchsia-400 font-medium">
                                    {mode === 'embed' ? 'Incrustado' : 'Enlace'}
                                </span>
                            )}
                        </div>
                    </div>
                    {mode !== 'embed' && (
                        <a
                            href={node.attrs.src}
                            download={node.attrs.filename}
                            className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg text-sm font-medium transition-colors"
                            contentEditable={false}
                        >
                            Descargar
                        </a>
                    )}
                </div>

                {/* Controles de edición, solo con el bloque seleccionado */}
                {selected && (
                    <div className="px-4 py-3 border-t border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2"
                         contentEditable={false}
                         onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                        {isPdf && (
                            <div>
                                <label className="text-[10px] uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">Modo de visualización</label>
                                <div className="flex gap-1.5">
                                    <button type="button"
                                        onClick={() => updateAttributes({ displayMode: 'embed' })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            mode === 'embed' ? 'bg-fuchsia-500 text-white' : 'bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)]'
                                        }`}>
                                        📄 Incrustado (LinkedIn)
                                    </button>
                                    <button type="button"
                                        onClick={() => updateAttributes({ displayMode: 'link' })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            mode === 'link' ? 'bg-fuchsia-500 text-white' : 'bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)]'
                                        }`}>
                                        🔗 Solo enlace
                                    </button>
                                </div>
                            </div>
                        )}
                        {isPdf && mode === 'embed' && (
                            <div className="flex items-center gap-2">
                                <label className="text-[10px] text-[var(--text-muted)]">Altura:</label>
                                <input type="range" min="200" max="800" step="50"
                                    value={node.attrs.embedHeight || 500}
                                    onChange={e => updateAttributes({ embedHeight: Number(e.target.value) })}
                                    className="flex-1 h-1 accent-fuchsia-500" />
                                <span className="text-[10px] text-[var(--text-muted)] font-mono w-10">{node.attrs.embedHeight || 500}px</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </RichBlockFrame>
    );
}

export const DocumentAttachmentExtension = Node.create({
    name: 'documentAttachment',
    group: 'block',
    atom: true,
    addAttributes() {
        return {
            src: {
                default: '',
                parseHTML: el => el.getAttribute('data-src') || el.getAttribute('src') || '',
            },
            filename: {
                default: '',
                parseHTML: el => el.getAttribute('data-filename') || el.getAttribute('filename') || '',
            },
            fileType: {
                default: '',
                parseHTML: el => el.getAttribute('data-file-type') || el.getAttribute('filetype') || '',
            },
            fileSize: {
                default: 0,
                parseHTML: el => parseInt(el.getAttribute('data-file-size') || el.getAttribute('filesize')) || 0,
            },
            displayMode: {
                default: 'embed',
                parseHTML: el => el.getAttribute('data-display-mode') || el.getAttribute('displaymode') || 'embed',
            },
            embedHeight: {
                default: 500,
                parseHTML: el => parseInt(el.getAttribute('data-embed-height') || el.getAttribute('embedheight')) || 500,
            },
            embedWidth: {
                default: null,
                parseHTML: el => {
                    const v = el.getAttribute('data-embed-width') || el.getAttribute('embedwidth');
                    return v ? parseInt(v) : null;
                },
            },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    parseHTML() { return [{ tag: 'div[data-document]' }, { tag: 'div[data-block="document"]' }]; },
    renderHTML({ node, HTMLAttributes }) {
        const isPdf = node.attrs.fileType === 'pdf';
        const mode = node.attrs.displayMode || (isPdf ? 'embed' : 'link');
        const height = node.attrs.embedHeight || 500;
        const width = node.attrs.embedWidth;

        const containerStyle = [
            'border:1px solid var(--border-color,rgba(255,255,255,0.1))',
            'border-radius:12px',
            'overflow:hidden',
            'margin:16px 0',
            width ? `width:${width}px;max-width:100%` : '',
        ].filter(Boolean).join(';');

        const containerAttrs = mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, {
            'data-block': 'document',
            'data-version': '1',
            'data-document': '',
            'data-src': node.attrs.src,
            'data-title': node.attrs.filename,
            'data-filename': node.attrs.filename,
            'data-file-type': node.attrs.fileType,
            'data-display': mode,
            'data-display-mode': mode,
            'data-embed-height': String(height),
            ...(width ? { 'data-embed-width': String(width) } : {}),
            style: containerStyle,
        }));

        return ['div', containerAttrs];
    },
    addNodeView() { return ReactNodeViewRenderer(DocumentView); },
    addCommands() {
        return {
            insertDocument: (attrs) => ({ commands }) => commands.insertContent({
                type: this.name,
                attrs,
            }),
        };
    },
});
