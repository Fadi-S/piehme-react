import type {Route} from "./+types/home";
import Card from "~/components/card";
import Input from "~/components/input";
import Button from "~/components/button";
import {Table, Td, Th} from "~/components/table";
import React, {useCallback, useEffect} from "react";
import {useSearchParams} from "react-router";
import {useGetUsersQuery} from "~/features/users/usersApiSlice";
import type {User} from "~/features/users/usersApiSlice";
import {throttle, useDebounce} from "~/base/helpers";
import Loading from "~/components/loading";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Seyam Kebir Cup"},
    ];
}

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page") ?? "1");

    const [search, setSearch] = React.useState(searchParams.get("search") ?? "");
    const debouncedSearchTerm = useDebounce(search, 200);

    const {data: users, isLoading} = useGetUsersQuery({page, search: debouncedSearchTerm});

    useEffect(() => {
        const states: {search?:string} = {};
        if(debouncedSearchTerm) states.search = debouncedSearchTerm;
        setSearchParams(states);
    }, [debouncedSearchTerm]);

    if (isLoading || !users) {
        return <Loading />;
    }

    return (
        <div>
            <Card>
                <div className="sm:flex sm:items-center">
                    <div className="w-full flex items-start">
                        <Input
                            id="search"
                            placeholder="Search"
                            className="w-full sm:w-64"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <Button type="button">Add user</Button>
                    </div>
                </div>

                <Table
                    header={<tr>
                        <Th>Name</Th>
                        <Th>Title</Th>
                        <Th>Status</Th>
                        <Th><span className="sr-only">Edit</span></Th>
                    </tr>}
                    pagination={users!}
                    body={(user : User) => (
                        <tr key={user.id}>
                            <Td first>
                                <div className="flex items-center">
                                    <div className="size-11 shrink-0">
                                        <img alt="" src={user.imgLink} className="size-11 rounded-full"/>
                                    </div>
                                    <div className="ml-4">
                                        <div className="font-medium text-gray-900">{user.username}</div>
                                        <div className="mt-1 text-gray-500">{user.username}</div>
                                    </div>
                                </div>
                            </Td>
                            <Td>
                                <div className="text-gray-900">{user.cardRating}</div>
                                <div className="mt-1 text-gray-500">{user.lineupRating}</div>
                            </Td>
                            <Td>{user.coins}</Td>
                            <Td className="relative py-5 pl-3 text-right text-sm font-medium whitespace-nowrap">
                                <a href={`/users/${user.username}`} className="text-indigo-600 hover:text-indigo-900">
                                    Edit<span className="sr-only">, {user.username}</span>
                                </a>
                            </Td>
                        </tr>
                    )}
                />
            </Card>
        </div>
    );
}
