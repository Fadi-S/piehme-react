interface Pagination<T> {
    totalPages: number;
    totalElements: number;
    page: number;
    size: number;
    data: T[];
}

interface PageRequest {
    page?: number;
    size?: number;
    search?: string;
}

export type { Pagination, PageRequest };