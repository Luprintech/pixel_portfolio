import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useToolbarMenus } from './useToolbarMenus';

describe('useToolbarMenus', () => {
    it('abre un menú y cierra el anterior', () => {
        const { result } = renderHook(() => useToolbarMenus());

        act(() => result.current.open('link'));
        expect(result.current.isOpen('link')).toBe(true);

        act(() => result.current.open('image'));
        expect(result.current.isOpen('link')).toBe(false);
        expect(result.current.isOpen('image')).toBe(true);
    });

    it('alterna el mismo menú', () => {
        const { result } = renderHook(() => useToolbarMenus());

        act(() => result.current.toggle('color'));
        expect(result.current.openMenu).toBe('color');
        act(() => result.current.toggle('color'));
        expect(result.current.openMenu).toBeNull();
    });

    it('close con nombre solo cierra ese menú y sin nombre cierra el abierto', () => {
        const { result } = renderHook(() => useToolbarMenus());

        act(() => result.current.open('emoji'));
        act(() => result.current.close('insert'));
        expect(result.current.openMenu).toBe('emoji');

        act(() => result.current.close());
        expect(result.current.openMenu).toBeNull();
    });
});
