import { useCallback, useEffect, useRef, useState } from 'react';

const TOAST_MS = 4000;

// Aviso temporal: un mensaje nuevo sustituye al anterior y reinicia el temporizador
export function useToast() {
    const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }
    const timer = useRef(null);

    const showToast = useCallback((message, type = 'success') => {
        clearTimeout(timer.current);
        setToast({ message, type });
        timer.current = setTimeout(() => setToast(null), TOAST_MS);
    }, []);

    useEffect(() => () => clearTimeout(timer.current), []);

    return { toast, showToast };
}
