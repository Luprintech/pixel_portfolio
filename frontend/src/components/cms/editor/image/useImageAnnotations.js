import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clamp01, parseImageAnnotations, createAnnotationId, normalizeAnnotationShape } from './imageHelpers';

// Estado y gestos de las anotaciones (rectángulo, círculo, flecha y texto) sobre una imagen del editor
export function useImageAnnotations({ rawAnnotations, updateAttributes, selected, containerRef }) {
    const overlayRef = useRef(null);
    const [annotationMode, setAnnotationMode] = useState(false);
    const [annotationTool, setAnnotationTool] = useState('rect');
    const [annotationColor, setAnnotationColor] = useState('#ff4d4f');
    const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
    const [annotationPanelPosition, setAnnotationPanelPosition] = useState({ x: 12, y: 64 });
    const [draftAnnotation, setDraftAnnotation] = useState(null);
    const annotations = useMemo(
        () => parseImageAnnotations(rawAnnotations).map(normalizeAnnotationShape).filter(Boolean),
        [rawAnnotations],
    );
    const selectedAnnotation = useMemo(
        () => annotations.find(shape => shape.id === selectedAnnotationId) || null,
        [annotations, selectedAnnotationId],
    );

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

    return {
        overlayRef,
        annotations,
        selectedAnnotation,
        selectedAnnotationId,
        setSelectedAnnotationId,
        annotationMode,
        setAnnotationMode,
        annotationTool,
        setAnnotationTool,
        annotationColor,
        setAnnotationColor,
        annotationPanelPosition,
        draftAnnotation,
        setDraftAnnotation,
        updateAnnotationById,
        removeAnnotationById,
        handleAnnotationPointerDown,
        removeLastAnnotation,
        clearAnnotations,
        startTextAnnotationDrag,
        startAnnotationPanelDrag,
    };
}
