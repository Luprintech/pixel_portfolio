// Vista React de la imagen del editor: redimensionado, alineación, pie de foto y anotaciones.
import Color from '@tiptap/extension-color';
import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import RichBlockFrame from '../RichBlockFrame';
import { IMAGE_ANNOTATION_COLORS, IMAGE_SHADOW_OPTIONS, IMAGE_HOVER_OPTIONS, getTextAnnotationPixelSize, normalizeImageCornerRadius, normalizeImageBorderWidth, normalizeImageShadow, normalizeImageHover, getImageShadowValue, clamp01, parseImageAnnotations, createAnnotationId, normalizeAnnotationShape } from './imageHelpers';
import { renderImageAnnotation } from './renderImageAnnotation';

export function ResizableImageView({ node, updateAttributes, selected, deleteNode }) {
    const containerRef = useRef(null);
    const overlayRef = useRef(null);
    const [resizing, setResizing]   = useState(false);
    const [captionFocused, setCaptionFocused] = useState(false);
    const [annotationMode, setAnnotationMode] = useState(false);
    const [annotationTool, setAnnotationTool] = useState('rect');
    const [annotationColor, setAnnotationColor] = useState('#ff4d4f');
    const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
    const [annotationPanelPosition, setAnnotationPanelPosition] = useState({ x: 12, y: 64 });
    const [draftAnnotation, setDraftAnnotation] = useState(null);
    const [imageToolbarStyle, setImageToolbarStyle] = useState(null);
    const startData = useRef(null);
    const annotations = useMemo(
        () => parseImageAnnotations(node.attrs.annotations).map(normalizeAnnotationShape).filter(Boolean),
        [node.attrs.annotations],
    );
    const selectedAnnotation = useMemo(
        () => annotations.find(shape => shape.id === selectedAnnotationId) || null,
        [annotations, selectedAnnotationId],
    );

    const width  = node.attrs.width  || 'auto';
    const height = node.attrs.height || 'auto';
    const imageCornerRadius = normalizeImageCornerRadius(node.attrs.cornerRadius);
    const imageBorderWidth = normalizeImageBorderWidth(node.attrs.borderWidth);
    const imageBorderColor = node.attrs.borderColor || '#000000';
    const imageShadow = normalizeImageShadow(node.attrs.shadowStyle);
    const imageHover = normalizeImageHover(node.attrs.hoverEffect);
    const imageFrameStyle = {
        borderRadius: `${imageCornerRadius}px`,
        border: imageBorderWidth > 0 ? `${imageBorderWidth}px solid ${imageBorderColor}` : 'none',
        boxShadow: getImageShadowValue(imageShadow),
    };

    const commitAnnotations = useCallback((nextAnnotations) => {
        updateAttributes({ annotations: nextAnnotations });
    }, [updateAttributes]);

    const updateAnnotationById = useCallback((annotationId, updater) => {
        if (!annotationId) return;
        const nextAnnotations = annotations.map(shape => {
            if (shape.id !== annotationId) return shape;
            const nextShape = typeof updater === 'function' ? updater(shape) : { ...shape, ...updater };
            return normalizeAnnotationShape(nextShape);
        }).filter(Boolean);
        commitAnnotations(nextAnnotations);
    }, [annotations, commitAnnotations]);

    const removeAnnotationById = useCallback((annotationId) => {
        if (!annotationId) return;
        commitAnnotations(annotations.filter(shape => shape.id !== annotationId));
        setSelectedAnnotationId(current => current === annotationId ? null : current);
    }, [annotations, commitAnnotations]);

    useEffect(() => {
        if (!selectedAnnotationId) return;
        if (!annotations.some(shape => shape.id === selectedAnnotationId)) {
            setSelectedAnnotationId(null);
        }
    }, [annotations, selectedAnnotationId]);

    useEffect(() => {
        if (selected) return;
        setAnnotationMode(false);
        setDraftAnnotation(null);
        setSelectedAnnotationId(null);
    }, [selected]);

    useEffect(() => {
        if (selectedAnnotation?.color) {
            setAnnotationColor(selectedAnnotation.color);
        }
    }, [selectedAnnotation]);

    useEffect(() => {
        if (!selectedAnnotationId) return undefined;

        function handleDeleteSelectedAnnotation(event) {
            const target = event.target;
            const isEditableTarget = target instanceof HTMLElement && (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            );

            if (isEditableTarget) return;
            if (event.key !== 'Delete' && event.key !== 'Supr') return;

            event.preventDefault();
            removeAnnotationById(selectedAnnotationId);
        }

        window.addEventListener('keydown', handleDeleteSelectedAnnotation);
        return () => window.removeEventListener('keydown', handleDeleteSelectedAnnotation);
    }, [removeAnnotationById, selectedAnnotationId]);

    useEffect(() => {
        if (!selected) {
            setImageToolbarStyle(null);
            return undefined;
        }

        function updateImageToolbarPosition() {
            const editorRoot = containerRef.current?.closest('[data-rich-editor-root="true"]');
            const toolbar = editorRoot?.querySelector('[data-rich-editor-toolbar="true"]');
            if (!toolbar) return;

            const rect = toolbar.getBoundingClientRect();
            setImageToolbarStyle({
                position: 'fixed',
                top: rect.bottom + 8,
                left: rect.left,
                width: rect.width,
            });
        }

        updateImageToolbarPosition();
        window.addEventListener('resize', updateImageToolbarPosition);
        window.addEventListener('scroll', updateImageToolbarPosition, true);

        return () => {
            window.removeEventListener('resize', updateImageToolbarPosition);
            window.removeEventListener('scroll', updateImageToolbarPosition, true);
        };
    }, [selected]);

    function getNormalizedCoordinates(event) {
        const rect = overlayRef.current?.getBoundingClientRect();
        if (!rect || !rect.width || !rect.height) return null;
        return {
            x: clamp01((event.clientX - rect.left) / rect.width),
            y: clamp01((event.clientY - rect.top) / rect.height),
        };
    }

    function handleAnnotationPointerDown(event) {
        if (!selected || !annotationMode) return;
        event.preventDefault();
        event.stopPropagation();

        const start = getNormalizedCoordinates(event);
        if (!start) return;

        if (annotationTool === 'text') {
            const nextTextAnnotation = normalizeAnnotationShape({
                id: createAnnotationId(),
                type: 'text',
                color: '#000000',
                fontSize: 5,
                fontWeight: '700',
                fontStyle: 'normal',
                textDecoration: 'none',
                text: 'Texto',
                x: start.x,
                y: start.y,
            });

            if (nextTextAnnotation) {
                commitAnnotations([...annotations, nextTextAnnotation]);
                setSelectedAnnotationId(nextTextAnnotation.id);
            }

            return;
        }

        const nextDraft = annotationTool === 'arrow'
            ? { id: createAnnotationId(), type: 'arrow', color: annotationColor, strokeWidth: 3, x: start.x, y: start.y, x2: start.x, y2: start.y }
            : { id: createAnnotationId(), type: annotationTool, color: annotationColor, strokeWidth: 3, x: start.x, y: start.y, width: 0, height: 0 };

        setDraftAnnotation(nextDraft);

        function onMove(moveEvent) {
            const current = getNormalizedCoordinates(moveEvent);
            if (!current) return;

            setDraftAnnotation(prev => {
                if (!prev) return prev;
                if (prev.type === 'arrow') {
                    return { ...prev, x2: current.x, y2: current.y };
                }

                const x = Math.min(prev.x, current.x);
                const y = Math.min(prev.y, current.y);
                return {
                    ...prev,
                    x,
                    y,
                    width: Math.abs(current.x - prev.x),
                    height: Math.abs(current.y - prev.y),
                };
            });
        }

        function onUp(upEvent) {
            const end = getNormalizedCoordinates(upEvent);
            setDraftAnnotation(prev => {
                if (!prev || !end) return null;

                const normalized = prev.type === 'arrow'
                    ? normalizeAnnotationShape({ ...prev, x2: end.x, y2: end.y })
                    : normalizeAnnotationShape({
                        ...prev,
                        x: Math.min(prev.x, end.x),
                        y: Math.min(prev.y, end.y),
                        width: Math.abs(end.x - prev.x),
                        height: Math.abs(end.y - prev.y),
                    });

                const isMeaningful = normalized?.type === 'arrow'
                    ? Math.abs((normalized.x2 || 0) - normalized.x) > 0.01 || Math.abs((normalized.y2 || 0) - normalized.y) > 0.01
                    : (normalized?.width || 0) > 0.02 && (normalized?.height || 0) > 0.02;

                if (normalized && isMeaningful) {
                    commitAnnotations([...annotations, normalized]);
                }

                return null;
            });

            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        }

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp, { once: false });
    }

    function removeLastAnnotation() {
        if (annotations.length === 0) return;
        commitAnnotations(annotations.slice(0, -1));
    }

    function clearAnnotations() {
        commitAnnotations([]);
        setSelectedAnnotationId(null);
    }

    function startTextAnnotationDrag(event, annotationId) {
        event.preventDefault();
        event.stopPropagation();

        const annotation = annotations.find(shape => shape.id === annotationId && shape.type === 'text');
        const start = getNormalizedCoordinates(event);
        if (!annotation || !start) return;

        setSelectedAnnotationId(annotationId);

        const deltaX = start.x - (annotation.x || 0);
        const deltaY = start.y - (annotation.y || 0);

        function onMove(moveEvent) {
            const current = getNormalizedCoordinates(moveEvent);
            if (!current) return;

            updateAnnotationById(annotationId, prev => ({
                ...prev,
                x: clamp01(current.x - deltaX),
                y: clamp01(current.y - deltaY),
            }));
        }

        function onUp() {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        }

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    }

    function startAnnotationPanelDrag(event) {
        event.preventDefault();
        event.stopPropagation();

        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        const startX = event.clientX;
        const startY = event.clientY;
        const initialX = annotationPanelPosition.x;
        const initialY = annotationPanelPosition.y;

        function onMove(moveEvent) {
            const nextX = Math.max(0, Math.min(containerRect.width - 220, initialX + (moveEvent.clientX - startX)));
            const nextY = Math.max(0, Math.min(containerRect.height - 80, initialY + (moveEvent.clientY - startY)));
            setAnnotationPanelPosition({ x: nextX, y: nextY });
        }

        function onUp() {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        }

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    }

    function startResize(e, corner) {
        e.preventDefault();
        e.stopPropagation();
        const img = containerRef.current?.querySelector('img');
        if (!img) return;
        const rect = img.getBoundingClientRect();
        startData.current = {
            corner,
            startX: e.clientX,
            startY: e.clientY,
            startW: rect.width,
            startH: rect.height,
            ratio:  rect.width / rect.height,
        };
        setResizing(true);

        function onMove(ev) {
            const { corner, startX, startY, startW, ratio } = startData.current;
            let dx = ev.clientX - startX;
            let dy = ev.clientY - startY;

            const widthDirection = corner === 'br' || corner === 'tr' ? 1 : -1;
            const dominantDelta = Math.abs(dx) >= Math.abs(dy) * ratio ? dx : dy * ratio;
            const nextWidth = startW + dominantDelta * widthDirection;
            const newW = Math.max(80, nextWidth);
            const newH = Math.max(40, Math.round(newW / ratio));

            updateAttributes({ width: Math.round(newW), height: Math.round(newH) });
        }

        function onUp() {
            setResizing(false);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup',   onUp);
        }

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup',   onUp);
    }

    const handleStyle = 'absolute w-3 h-3 bg-fuchsia-500 border-2 border-white rounded-full z-10 cursor-nwse-resize';

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
                className={`relative inline-block group ${selected ? 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-transparent' : ''}`}
                style={{ cursor: resizing ? 'nwse-resize' : 'default', ...imageFrameStyle }}
            >
                {selected && imageToolbarStyle ? createPortal(
                <div
                    contentEditable={false}
                    className="z-[110] flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950/95 px-2 py-1.5 text-[10px] text-slate-200 shadow-2xl backdrop-blur"
                    style={imageToolbarStyle}
                    onMouseDown={e => e.stopPropagation()}
                >
                    <button
                        type="button"
                        onClick={() => {
                            setAnnotationMode(current => !current);
                            setDraftAnnotation(null);
                            setSelectedAnnotationId(null);
                        }}
                        className={`rounded-md px-2 py-1 font-semibold transition-colors ${annotationMode ? 'bg-fuchsia-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                        {annotationMode ? 'Cerrar anotación' : 'Anotar'}
                    </button>
                    <div className="h-4 w-px bg-white/10" />
                    {['rect', 'circle', 'arrow', 'text'].map(tool => (
                        <button
                            key={tool}
                            type="button"
                            onClick={() => { setAnnotationTool(tool); setAnnotationMode(true); }}
                            className={`rounded-md px-2 py-1 uppercase tracking-wide transition-colors ${annotationTool === tool ? 'bg-cyan-500/20 text-cyan-200' : 'bg-white/5 hover:bg-white/10'}`}
                        >
                            {tool === 'rect' ? 'Rect' : tool === 'circle' ? 'Círculo' : tool === 'arrow' ? 'Flecha' : 'Texto'}
                        </button>
                    ))}
                    <div className="flex items-center gap-1">
                        {IMAGE_ANNOTATION_COLORS.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => {
                                    setAnnotationColor(color);
                                    if (selectedAnnotation) {
                                        updateAnnotationById(selectedAnnotation.id, { color });
                                    }
                                }}
                                className={`h-4 w-4 rounded-full border ${annotationColor === color ? 'scale-110 border-white' : 'border-white/25'}`}
                                style={{ backgroundColor: color }}
                                aria-label={`Seleccionar color ${color}`}
                            />
                        ))}
                    </div>
                    <label className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1 text-[11px]">
                        <span className="uppercase tracking-wide text-slate-300">Color</span>
                        <input
                            type="color"
                            value={annotationColor}
                            onChange={(event) => {
                                const color = event.target.value;
                                setAnnotationColor(color);
                                if (selectedAnnotation) {
                                    updateAnnotationById(selectedAnnotation.id, { color });
                                }
                            }}
                            className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                            aria-label="Seleccionar cualquier color para la anotación"
                        />
                    </label>
                    <button type="button" onClick={removeLastAnnotation} className="rounded-md px-2 py-1 bg-white/5 hover:bg-white/10">Deshacer</button>
                    <button type="button" onClick={clearAnnotations} className="rounded-md px-2 py-1 bg-white/5 hover:bg-white/10">Limpiar</button>
                    <div className="h-4 w-px bg-white/10" />
                    <label className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1 text-[11px]">
                        <span>Radio</span>
                        <input type="range" min="0" max="48" step="2" value={imageCornerRadius} onChange={e => updateAttributes({ cornerRadius: Number(e.target.value) })} className="w-20" />
                        <span className="font-mono">{imageCornerRadius}px</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1 text-[11px]">
                        <span>Borde</span>
                        <input type="range" min="0" max="12" step="1" value={imageBorderWidth} onChange={e => updateAttributes({ borderWidth: Number(e.target.value) })} className="w-16" />
                        <span className="font-mono">{imageBorderWidth}px</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1 text-[11px]">
                        <span>Color borde</span>
                        <input type="color" value={imageBorderColor} onChange={e => updateAttributes({ borderColor: e.target.value, borderWidth: imageBorderWidth || 1 })} className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0" />
                    </label>
                    <label className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1 text-[11px]">
                        <span>Sombra</span>
                        <select value={imageShadow} onChange={e => updateAttributes({ shadowStyle: e.target.value })} className="rounded-md border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none">
                            {IMAGE_SHADOW_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </label>
                    <label className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1 text-[11px]">
                        <span>Hover</span>
                        <select value={imageHover} onChange={e => updateAttributes({ hoverEffect: e.target.value })} className="rounded-md border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none">
                            {IMAGE_HOVER_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </label>
                </div>, document.body) : null}
                {selectedAnnotation?.type === 'text' ? (
                    <div
                        contentEditable={false}
                        className="absolute z-20 w-[min(92vw,420px)] rounded-2xl border border-white/10 bg-slate-950/92 p-3 text-xs text-slate-100 shadow-2xl backdrop-blur"
                        style={{ left: `${annotationPanelPosition.x}px`, top: `${annotationPanelPosition.y}px` }}
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <div
                            className="mb-2 flex cursor-move items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2"
                            onPointerDown={startAnnotationPanelDrag}
                        >
                            <p className="font-semibold text-cyan-200">Editar texto anotado</p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => removeAnnotationById(selectedAnnotation.id)}
                                    className="rounded-md border border-red-400/25 bg-red-500/10 px-2 py-1 text-[11px] font-semibold text-red-200 hover:bg-red-500/20"
                                >
                                    Eliminar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedAnnotationId(null)}
                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-sm font-bold text-slate-200 hover:bg-white/10"
                                    aria-label="Cerrar editor de anotación"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <label className="mb-3 block">
                            <span className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Texto</span>
                            <input
                                type="text"
                                value={selectedAnnotation.text || ''}
                                onChange={e => updateAnnotationById(selectedAnnotation.id, { text: e.target.value || 'Texto' })}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
                                placeholder="Escribe la anotación"
                            />
                        </label>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
                            <label className="block">
                                <span className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Tamaño</span>
                                <input
                                    type="range"
                                    min="3"
                                    max="10"
                                    step="0.5"
                                    value={selectedAnnotation.fontSize || 5}
                                    onChange={e => updateAnnotationById(selectedAnnotation.id, { fontSize: Number(e.target.value) })}
                                    className="w-full"
                                />
                                <span className="mt-1 block text-[11px] text-slate-400">{Number(selectedAnnotation.fontSize || 5).toFixed(1)}</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateAnnotationById(selectedAnnotation.id, { fontWeight: selectedAnnotation.fontWeight === '700' ? '400' : '700' })}
                                    className={`rounded-md px-2.5 py-2 font-bold ${selectedAnnotation.fontWeight === '700' ? 'bg-cyan-500/20 text-cyan-200' : 'bg-white/5 hover:bg-white/10'}`}
                                >
                                    B
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateAnnotationById(selectedAnnotation.id, { fontStyle: selectedAnnotation.fontStyle === 'italic' ? 'normal' : 'italic' })}
                                    className={`rounded-md px-2.5 py-2 italic ${selectedAnnotation.fontStyle === 'italic' ? 'bg-cyan-500/20 text-cyan-200' : 'bg-white/5 hover:bg-white/10'}`}
                                >
                                    I
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateAnnotationById(selectedAnnotation.id, { textDecoration: selectedAnnotation.textDecoration === 'underline' ? 'none' : 'underline' })}
                                    className={`rounded-md px-2.5 py-2 underline ${selectedAnnotation.textDecoration === 'underline' ? 'bg-cyan-500/20 text-cyan-200' : 'bg-white/5 hover:bg-white/10'}`}
                                >
                                    U
                                </button>
                            </div>
                        </div>
                        <p className="mt-3 text-[11px] text-slate-400">Consejo: arrastra el texto directamente sobre la captura para recolocarlo.</p>
                    </div>
                ) : null}
                    <img
                        src={node.attrs.src}
                    alt={node.attrs.alt || ''}
                    title={node.attrs.title || ''}
                    loading="lazy"
                    decoding="async"
                    style={{
                        width:  width  !== 'auto' ? `${width}px`  : 'auto',
                        height: height !== 'auto' ? `${height}px` : 'auto',
                        maxWidth: '100%',
                        display: 'block',
                        borderRadius: `${imageCornerRadius}px`,
                    }}
                        className={imageHover === 'zoom' ? 'transition-transform duration-300 hover:scale-[1.02]' : imageHover === 'lift' ? 'transition-transform duration-300 hover:-translate-y-1' : ''}
                        draggable={false}
                        onPointerDown={() => {
                            if (!selected) return;
                            if (!annotationMode) {
                                setSelectedAnnotationId(null);
                            }
                        }}
                    />
                <svg
                    ref={overlayRef}
                    className={`absolute inset-0 h-full w-full ${(selected && annotationMode) ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`}
                    style={{ borderRadius: `${imageCornerRadius}px` }}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    onPointerDown={handleAnnotationPointerDown}
                >
                    {annotations.filter(shape => shape.type !== 'text').map(shape => renderImageAnnotation(shape, 'editor-image', {
                        selected: selectedAnnotationId === shape.id,
                        interactive: true,
                        onSelect: (_event, selectedShape) => {
                            setSelectedAnnotationId(selectedShape.id);
                            setAnnotationMode(true);
                        },
                    }))}
                    {draftAnnotation ? renderImageAnnotation(draftAnnotation, 'editor-image-draft') : null}
                </svg>
                <div className="pointer-events-none absolute inset-0 z-10" style={{ borderRadius: `${imageCornerRadius}px` }}>
                    {annotations.filter(shape => shape.type === 'text').map(shape => (
                        <button
                            key={shape.id}
                            type="button"
                            onPointerDown={event => startTextAnnotationDrag(event, shape.id)}
                            onClick={event => {
                                event.preventDefault();
                                event.stopPropagation();
                                setSelectedAnnotationId(shape.id);
                                setAnnotationMode(true);
                            }}
                            className="pointer-events-auto absolute bg-transparent p-0 text-left leading-none transition-opacity hover:opacity-85"
                            style={{
                                left: `${(shape.x || 0) * 100}%`,
                                top: `${(shape.y || 0) * 100}%`,
                                color: shape.color || '#000000',
                                fontSize: `${getTextAnnotationPixelSize(shape.fontSize)}px`,
                                fontWeight: shape.fontWeight || '700',
                                fontStyle: shape.fontStyle || 'normal',
                                textDecoration: shape.textDecoration || 'none',
                                textShadow: selectedAnnotationId === shape.id
                                    ? '0 0 1px #22d3ee, 0 0 10px rgba(34,211,238,0.35)'
                                    : '0 0 1px rgba(255,255,255,0.72)',
                                transform: 'translate(0, 0)',
                                pointerEvents: 'auto',
                                background: 'transparent',
                            }}
                        >
                            {shape.text}
                        </button>
                    ))}
                </div>
                {/* Handles de resize: visibles al seleccionar o hacer hover */}
                <div className={`${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    <div className={`${handleStyle} top-[-6px] left-[-6px]  cursor-nwse-resize`} onMouseDown={e => startResize(e, 'tl')} />
                    <div className={`${handleStyle} top-[-6px] right-[-6px] cursor-nesw-resize`} onMouseDown={e => startResize(e, 'tr')} />
                    <div className={`${handleStyle} bottom-[-6px] left-[-6px]  cursor-nesw-resize`} onMouseDown={e => startResize(e, 'bl')} />
                    <div className={`${handleStyle} bottom-[-6px] right-[-6px] cursor-nwse-resize`} onMouseDown={e => startResize(e, 'br')} />
                </div>
            </div>
            {/* Pie de foto editable; separado del alt (accesibilidad). */}
            <div
                contentEditable={false}
                className="w-full mt-2"
                onMouseDown={e => e.stopPropagation()}
            >
                <input
                    type="text"
                    value={node.attrs.caption || ''}
                    placeholder="Añadir pie de foto…"
                    onFocus={() => setCaptionFocused(true)}
                    onBlur={() => setCaptionFocused(false)}
                    onChange={e => updateAttributes({ caption: e.target.value })}
                    className={`w-full text-xs text-center italic bg-transparent outline-none transition-all
                        placeholder-gray-600 text-gray-400
                        ${captionFocused
                            ? 'border-b border-fuchsia-500/60 pb-0.5'
                            : 'border-b border-transparent hover:border-gray-600/40 pb-0.5'}
                    `}
                    style={{ caretColor: 'var(--text-primary)' }}
                />
            </div>
        </RichBlockFrame>
    );
}
