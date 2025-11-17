import {useEffect, useState} from "react";

export const getFromLocalStorage = (key: string) => {
    if (!key || typeof window === 'undefined') {
        return ""
    }
    return localStorage.getItem(key)
}

export const getToken = () => {
    return getFromLocalStorage("token");
}

export const defaultHeaders = (headers : Headers) => {
    const token = getFromLocalStorage("token");
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");

    return headers;
}

export const defaultHeadersFileUpload = (headers : Headers) => {
    const token = getFromLocalStorage("token");
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    if (headers.get("Content-Type") === "multipart/form-data;") {
        headers.delete("Content-Type");
    } else {
        headers.set("Content-Type", "application/json");
    }

    return headers;
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

export function formatDate(date: Date): string {
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

export function formatDateString(date: string): string {
    return formatDate(new Date(date));
}


export function formatDateOnlyString(date: string): string {
    return new Date(date).toLocaleDateString("en-UK", {
        year: "numeric",
        month: "2-digit",
        day: "numeric",
        weekday: "short",
    });
}


