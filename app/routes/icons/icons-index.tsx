import Loading from "~/components/loading";
import Card from "~/components/card";
import {Table, Td, Th} from "~/components/table";
import {type Icon, useDeleteIconMutation, useGetAllIconsQuery} from "~/features/icons/iconsApiSlice";
import {Link, useSearchParams} from "react-router";
import React from "react";
import type {Route} from "./+types/icons-index";
import DeleteButton from "~/components/delete-button";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "All Icons"},
    ];
}

export default function IconsIndex() {
    const [searchParams, _] = useSearchParams();

    const page = parseInt(searchParams.get("page") || "1");

    const {data: icons, isLoading, refetch} = useGetAllIconsQuery({page});

    if (isLoading || !icons) {
        return <Loading/>
    }

    return (
        <div>
            <Card>
                <div className={"flex items-center justify-end"}>
                    <Link to="/icons/create"
                          className={"border px-3 py-1.5 rounded-md hover:bg-blue-200 text-blue-600 " +
                              "hover:text-blue-900"}>
                        Create Icon
                    </Link>
                </div>
                <Table
                    header={(
                        <tr>
                            <Th first>Icon</Th>
                            <Th>Name</Th>
                            <Th>Price</Th>
                            <Th>Available</Th>
                            <Th></Th>
                        </tr>
                    )}
                    body={(icon: Icon) => (
                        <tr key={icon.id}>
                            <Td first>
                                <img src={icon.imageUrl} className="w-24 h-auto"/>
                            </Td>
                            <Td>
                                <div className="text-gray-800">{icon.name}</div>
                            </Td>
                            <Td>
                                <div className="text-gray-800">${icon.price}</div>
                            </Td>
                            <Td>
                                <div className="flex items-center">

                                    <div className={"px-3 py-1.5 rounded-lg " +
                                        (icon.available ? "text-green-100 bg-green-700" : "text-red-100 bg-red-700")
                                    }>
                                        {icon.available ? "Yes" : "No"}
                                    </div>
                                </div>
                            </Td>
                            <Td>
                                <div className="flex items-center space-x-3">
                                    <a href={`/icons/${icon.id}/edit`}
                                       className="text-blue-600 hover:text-blue-900">
                                        Edit<span className="sr-only">, {icon.name}</span>
                                    </a>

                                    <DeleteButton
                                        useDeleteMutation={useDeleteIconMutation}
                                        onDelete={() => refetch()}
                                        itemKey="name"
                                        itemValue={icon.name}
                                    />
                                </div>
                            </Td>
                        </tr>
                    )}
                    pagination={icons}
                />
            </Card>
        </div>
    );
}