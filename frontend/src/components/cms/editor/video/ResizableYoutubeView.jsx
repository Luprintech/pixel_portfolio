// Vista React del vídeo de YouTube con tiradores para cambiar el tamaño.
import { useRef } from 'react';
import RichBlockFrame from '../RichBlockFrame';

export function ResizableYoutubeView({ node, updateAttributes, selected, deleteNode }) {
    const containerRef = useRef(null);
    const startData = useRef(null);

    const width  = node.attrs.width  || 640;
    const height = node.attrs.height || 360;

    function startResize(e) {
        e.preventDefault();
        e.stopPropagation();
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        startData.current = {
            startX: e.clientX,
            startW: rect.width,
            startH: rect.height,
            ratio:  rect.width / rect.height,
        };
        function onMove(ev) {
            const { startX, startW, ratio } = startData.current;
            const newW = Math.max(200, startW + (ev.clientX - startX));
            const newH = Math.round(newW / ratio);
            updateAttributes({ width: Math.round(newW), height: newH });
        }
        function onUp() {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup',   onUp);
        }
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup',   onUp);
    }

    // Construir URL de embed
    const src = node.attrs.src || '';
    let embedUrl = src;
    try {
        const u = new URL(src);
        if (u.hostname.includes('youtube')) {
            const id = u.searchParams.get('v') || u.pathname.replace('/', '');
            embedUrl = `https://www.youtube-nocookie.com/embed/${id}`;
        } else if (u.hostname.includes('youtu.be')) {
            embedUrl = `https://www.youtube-nocookie.com/embed${u.pathname}`;
        }
    } catch {
        embedUrl = src;
    }

    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            wrapperClassName="my-4"
            dragHandle
            frameClassName="inline-block"
        >
            <div
                ref={containerRef}
                className={`relative group rounded-xl overflow-hidden ${selected ? 'ring-2 ring-fuchsia-500' : ''}`}
                style={{ width: `${width}px`, maxWidth: '100%' }}
            >
                <iframe
                    src={embedUrl}
                    style={{ width: '100%', height: `${height}px` }}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="block rounded-xl"
                />
                {/* Tirador de la esquina inferior derecha para cambiar el tamaño */}
                <div
                    className={`absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize bg-fuchsia-500/80 rounded-tl-lg flex items-center justify-center
                        ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                    onMouseDown={startResize}
                    style={{ zIndex: 10 }}
                >
                    <svg className="w-3 h-3 text-white" viewBox="0 0 8 8" fill="currentColor">
                        <path d="M0 8L8 0v2L2 8H0zm4 0L8 4v2L6 8H4zm2 0h2v-2L8 6v2z"/>
                    </svg>
                </div>
            </div>
        </RichBlockFrame>
    );
}
