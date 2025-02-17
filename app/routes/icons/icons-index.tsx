import Loading from "~/components/loading";
import Card from "~/components/card";
import {Table, Td, Th} from "~/components/table";
import {type Icon, useGetAllIconsQuery} from "~/features/icons/iconsApiSlice";
import {useSearchParams} from "react-router";
import React from "react";

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
                                <img src={icon.imageUrl} className="w-24 h-auto" />
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
                                <a href={`/icons/${icon.id}/edit`} className="text-blue-600 hover:text-blue-900">
                                    Edit<span className="sr-only">, {icon.name}</span>
                                </a>
                            </Td>
                        </tr>
                    )}
                    pagination={icons}
                />
            </Card>
        </div>
    );
}