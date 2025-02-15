import {useEffect, useState} from "react";

export const getFromLocalStorage = (key: string) => {
    if (!key || typeof window === 'undefined') {
        return ""
    }
    return localStorage.getItem(key)
}

export const setToLocalStorage = (key: string, value: string) => {
    if (!key || typeof window === 'undefined') {
        return
    }
    localStorage.setItem(key, value);
}

export const removeFromLocalStorage = (key: string) => {
    if (!key || typeof window === 'undefined') {
        return
    }
    localStorage.removeItem(key);
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
    let inThrottle: boolean = false;
    return function (this: any, ...args: any[]) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    } as T;
}

export function useDebounce(value: string, delay: number): string {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
