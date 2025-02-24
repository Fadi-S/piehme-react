import Loading from "~/components/loading";
import Card from "~/components/card";
import {Table, Td, Th} from "~/components/table";
import {type Admin, useGetAllAdminsQuery} from "~/features/admins/adminsApiSlice";
import {Link, useSearchParams} from "react-router";
import React from "react";
import type {Route} from "./+types/admins-index";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "All Admins"},
    ];
}

export default function AdminsIndex() {
    const [searchParams, _] = useSearchParams();

    const page = parseInt(searchParams.get("page") || "1");

    const {data: admins, isLoading, refetch} = useGetAllAdminsQuery({page});

    if (isLoading || !admins) {
        return <Loading/>
    }

    return (
        <div>
            <Card>
                <div className={"flex items-center justify-end"}>
                    <Link to="/admins/create"
                          className={"border px-3 py-1.5 rounded-md hover:bg-blue-200 text-blue-600 " +
                              "hover:text-blue-900"}>
                        Create Admin
                    </Link>
                </div>
                <Table
                    header={(
                        <tr>
                            <Th first>Username</Th>
                            <Th>Role</Th>
                            <Th></Th>
                        </tr>
                    )}
                    body={(admin: Admin) => (
                        <tr key={admin.id}>
                            <Td first>
                                <div className="text-gray-800">{admin.username}</div>
                            </Td>
                            <Td>
                                <div className="text-gray-800">{admin.role}</div>
                            </Td>
                            <Td>
                                <a href={`/admins/${admin.id}/edit`} className="text-blue-600 hover:text-blue-900">
                                    Edit<span className="sr-only">, {admin.username}</span>
                                </a>
                            </Td>
                        </tr>
                    )}
                    pagination={admins}
                />
            </Card>
        </div>
    );
}