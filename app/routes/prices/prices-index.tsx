import Loading from "~/components/loading";
import Card from "~/components/card";
import {Table, Td, Th} from "~/components/table";
import {type Price, useGetAllPricesQuery} from "~/features/prices/pricesApiSlice";
import {Link, useSearchParams} from "react-router";
import React from "react";
import type {Route} from "./+types/prices-index";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "All Prices"},
    ];
}

export default function PricesIndex() {
    const [searchParams, _] = useSearchParams();

    const page = parseInt(searchParams.get("page") || "1");

    const {data: prices, isLoading, refetch} = useGetAllPricesQuery({page});

    if (isLoading || !prices) {
        return <Loading/>
    }

    return (
        <div>
            <Card>
                <div className={"flex items-center justify-end"}>
                    <Link to="/prices/create"
                          className={"border px-3 py-1.5 rounded-md hover:bg-blue-200 text-blue-600 " +
                              "hover:text-blue-900"}>
                        Create Price
                    </Link>
                </div>
                <Table
                    header={(
                        <tr>
                            <Th first>Name</Th>
                            <Th>Coins</Th>
                            <Th></Th>
                        </tr>
                    )}
                    body={(price: Price) => (
                        <tr key={price.id}>
                            <Td first>
                                <div className="text-gray-800">{price.name}</div>
                            </Td>
                            <Td>
                                <div className="text-gray-800">${price.coins}</div>
                            </Td>
                            <Td>
                                <a href={`/prices/${price.id}/edit`} className="text-blue-600 hover:text-blue-900">
                                    Edit<span className="sr-only">, {price.name}</span>
                                </a>
                            </Td>
                        </tr>
                    )}
                    pagination={prices}
                />
            </Card>
        </div>
    );
}