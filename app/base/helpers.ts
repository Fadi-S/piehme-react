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