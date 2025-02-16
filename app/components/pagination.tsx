import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { NavLink as Link } from "react-router";
import { useMemo } from "react";

interface PaginationProps {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    queryParam?: string;
}

export type { PaginationProps };

export default function Pagination({
                                       page,
                                       size,
                                       totalElements,
                                       totalPages,
                                       queryParam = "page",
                                   }: PaginationProps) {
    const url = window.location.pathname;

    const buildPageUrl = (pg: number) =>
        `${url}?${new URLSearchParams({ [queryParam]: pg.toString() }).toString()}`;

    const nextPageUrl = useMemo(() => {
        if (page === totalPages) return window.location.href;
        return buildPageUrl(page + 1);
    }, [page, totalPages]);

    const prevPageUrl = useMemo(() => {
        if (page === 1) return window.location.href;
        return buildPageUrl(page - 1);
    }, [page]);

    // Function to determine which pages to display with ellipsis
    const paginationRange = (): (number | string)[] => {
        const totalNumbersToShow = 5; // Display 5 numbers in the range (including first, last, and current)
        const buffer = 2; // Numbers around the current page
        const range: (number | string)[] = [];

        if (totalPages <= totalNumbersToShow) {
            // If the total number of pages is less than or equal to the number of numbers to show
            for (let i = 1; i <= totalPages; i++) {
                range.push(i);
            }
            return range;
        }

        const left = Math.max(2, page - buffer);
        const right = Math.min(totalPages - 1, page + buffer);

        range.push(1); // First page

        if (left > 2) range.push("..."); // Left ellipsis

        for (let i = left; i <= right; i++) {
            range.push(i);
        }

        if (right < totalPages - 1) range.push("..."); // Right ellipsis

        range.push(totalPages); // Last page

        return range;
    };

    const pages = paginationRange();

    if(totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <Link
                    onClick={page <= 1 ? (e) => e.preventDefault() : undefined}
                    to={prevPageUrl}
                    className={
                        "relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" +
                        (page <= 1 ? " cursor-default" : "")
                    }
                >
                    Previous
                </Link>
                <Link
                    onClick={page === totalPages ? (e) => e.preventDefault() : undefined}
                    to={nextPageUrl}
                    className={
                        "relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" +
                        (page === totalPages ? " cursor-default" : "")
                    }
                >
                    Next
                </Link>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(page - 1) * size + 1}</span> to{" "}
                        <span className="font-medium">{Math.min(page * size, totalElements)}</span> of{" "}
                        <span className="font-medium">{totalElements}</span> results
                    </p>
                </div>
                <div>
                    <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                        <Link
                            to={prevPageUrl}
                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                                page === 1 ? "cursor-default" : ""
                            }`}
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
                        </Link>

                        {pages.map((pg, idx) => {
                            if (pg === "...") {
                                return (
                                    <span
                                        key={idx}
                                        className="cursor-default relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300"
                                    >
                    ...
                  </span>
                                );
                            }

                            return (
                                <Link
                                    key={idx}
                                    to={buildPageUrl(pg as number)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                        page === pg
                                            ? "z-10 bg-blue-600 text-white cursor-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                    }`}
                                >
                                    {pg}
                                </Link>
                            );
                        })}

                        <Link
                            to={nextPageUrl}
                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                                page === totalPages ? "cursor-default" : ""
                            }`}
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    );
}