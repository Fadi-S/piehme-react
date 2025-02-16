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

export function queryParamsFromRequest(req: PageRequest): string {
    const queryParams = [];
    if (req.page) {
        queryParams.push(`page=${req.page - 1}`);
    }
    if (req.size) {
        queryParams.push(`size=${req.size}`);
    }
    if (req.search) {
        queryParams.push(`search=${req.search}`);
    }

    if (queryParams.length === 0) {
        return "";
    }

    return `?${queryParams.join("&")}`;
}

interface PageRequest {
    page?: number;
    size?: number;
    search?: string;
}

export type { Pagination, PageRequest };