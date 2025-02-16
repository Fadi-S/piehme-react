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
            if (value === debouncedValue) return;
            
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-UK", {
        year: "numeric",
        month: "2-digit",
        day: "numeric",
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        weekday: "short",
    });
}
