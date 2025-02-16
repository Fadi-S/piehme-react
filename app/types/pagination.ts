interface Pagination<T> {
    totalPages: number;
    totalElements: number;
    page: number;
    size: number;
    data: T[];
}

export function createEmptyPagination<T>(data: T[]): Pagination<T> {
    return {
        data,
        page: 1,
        size: data.length,
        totalElements: data.length,
        totalPages: 1,
    };
}

interface PageRequest {
    page?: number;
    size?: number;
    search?: string;
}

export type { Pagination, PageRequest };