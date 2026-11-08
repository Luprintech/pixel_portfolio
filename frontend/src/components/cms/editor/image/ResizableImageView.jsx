// Vista React de la imagen del editor: redimensionado, alineación, pie de foto y anotaciones.
import { useRef, useState } from 'react';
import RichBlockFrame from '../RichBlockFrame';
import { ImageToolbar } from './ImageToolbar';
import { TextAnnotationPanel } from './TextAnnotationPanel';
import { getTextAnnotationPixelSize, normalizeImageCornerRadius, normalizeImageBorderWidth, normalizeImageShadow, normalizeImageHover, getImageShadowValue } from './imageHelpers';
import { renderImageAnnotation } from './renderImageAnnotation';
import { useImageAnnotations } from './useImageAnnotations';
import { useImageToolbarPosition } from './useImageToolbarPosition';

export function ResizableImageView({ node, updateAttributes, selected, deleteNode }) {
    const containerRef = useRef(null);
    const [resizing, setResizing]   = useState(false);
    const [captionFocused, setCaptionFocused] = useState(false);
    const startData = useRef(null);
    const annotationState = useImageAnnotations({
        rawAnnotations: node.attrs.annotations,
        updateAttributes,
        selected,
        containerRef,
    });
    const {
        overlayRef, annotations, selectedAnnotation, selectedAnnotationId, setSelectedAnnotationId,
        annotationMode, setAnnotationMode, draftAnnotation, handleAnnotationPointerDown, startTextAnnotationDrag,
    } = annotationState;
    const imageToolbarStyle = useImageToolbarPosition(selected, containerRef);

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
                {selected && imageToolbarStyle ? (
                    <ImageToolbar
                        style={imageToolbarStyle}
                        annotations={annotationState}
                        appearance={{ imageCornerRadius, imageBorderWidth, imageBorderColor, imageShadow, imageHover }}
                        updateAttributes={updateAttributes}
                    />
                ) : null}
                {selectedAnnotation?.type === 'text' ? <TextAnnotationPanel annotations={annotationState} /> : null}
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
