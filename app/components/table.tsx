import React from "react";
import If from "~/components/if";
import Pagination from "~/components/pagination";
import type { Pagination as PaginationType } from "~/types/pagination";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";

interface TableProps {
    header?: React.ReactNode;
    body: (item: any) => React.ReactNode;
    pagination: PaginationType<any>;
}

function Table({ pagination, header, body }: TableProps) {
    return (
        <div className="mt-8 flow-root max-w-full px-2 sm:px-4">
            <If
                condition={pagination.data.length > 0}
                replacement={
                    <div className="text-center">
                        <ArchiveBoxIcon className="mx-auto size-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No results</h3>
                    </div>
                }
            >
                <>
                    <div className="-mx-2 -my-2 sm:-mx-4">
                        <div className="overflow-x-auto px-2 sm:px-4">
                            <div className="inline-block min-w-full py-2 align-middle">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <If condition={!!header}>
                                        <thead>{header}</thead>
                                    </If>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                    {pagination.data.map((item) => body(item))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <Pagination
                        size={pagination.size}
                        page={pagination.page + 1}
                        totalPages={pagination.totalPages}
                        totalElements={pagination.totalElements}
                    />
                </>
            </If>
        </div>
    );
}

interface TdProps {
    className?: string;
    children?: React.ReactNode;
    first?: boolean;
    last?: boolean;
}

function Td({ className, children, first, last }: TdProps) {
    return (
        <td
            className={
                "px-3 py-5 text-center items-center text-sm whitespace-nowrap text-gray-500 " +
                (first ? "pl-4 sm:pl-0 " : "") +
                (last ? "pr-4 sm:pr-0 " : "") +
                className
            }
        >
            {children}
        </td>
    );
}

function Th({ className, children, first, last }: TdProps) {
    return (
        <th
            scope="col"
            className={
                "py-3.5 pr-3 pl-4 text-center text-sm font-semibold text-gray-900 " +
                (first ? "pl-4 sm:pl-0 " : "") +
                (last ? "pr-4 sm:pr-0 " : "") +
                className
            }
        >
            {children}
        </th>
    );
}

export { Table, Td, Th };