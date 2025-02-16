import React from "react";
import If from "~/components/if";
import Pagination from "~/components/pagination";
import type {Pagination as PaginationType} from "~/types/pagination";
import {ArchiveBoxIcon} from "@heroicons/react/24/outline";

interface TableProps {
    header?: React.ReactNode;
    body: (item :any) => React.ReactNode;
    pagination: PaginationType<any>
}

function Table({pagination, header, body} : TableProps) {
    return (
        <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <If
                        condition={pagination.data.length > 0}
                        replacement={(
                            <div className="text-center">
                                <ArchiveBoxIcon className="mx-auto size-12 text-gray-400" />

                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No results found</h3>
                            </div>
                        )}
                    >
                        <table className="min-w-full divide-y divide-gray-300">
                            <If condition={!!header}>
                                <thead>{header}</thead>
                            </If>
                            <tbody className="divide-y divide-gray-200 bg-white">
                            {pagination.data.map((item) => body(item))}
                            </tbody>
                        </table>

                        <Pagination size={pagination.size} page={pagination.page + 1} totalPages={pagination.totalPages}
                                    totalElements={pagination.totalElements}/>
                    </If>
                </div>
            </div>
        </div>
    )
}

interface TdProps {
    className?: string;
    children?: React.ReactNode;
    first?: boolean;
    last?: boolean;
}

function Td({className, children, first, last}: TdProps) {
    return <td
        className={"px-3 py-5 text-sm whitespace-nowrap text-gray-500 " + (first ? "pl-4 sm:pl-0 " : "") + (last ? "pr-4 sm:pr-0 " : "") + className}>{children}</td>
}

function Th({className, children, first, last}: TdProps) {
    return <th scope="col" className={"py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 " + (first ? "pl-4 sm:pl-0 " : "") + (last ? "pr-4 sm:pr-0 " : "") + className}>{children}</th>
}


export {Table , Td, Th};