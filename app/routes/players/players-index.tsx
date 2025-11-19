import Loading from "~/components/loading";
import Card from "~/components/card";
import {Table, Td, Th} from "~/components/table";
import {type Player, useGetAllPlayersQuery, useDeletePlayerMutation} from "~/features/players/playersApiSlice";
import {Link, useSearchParams} from "react-router";
import React, {useEffect} from "react";
import type {Route} from "./+types/players-index";
import DeleteButton from "~/components/delete-button";
import {useDebounce} from "~/base/helpers";
import Input from "~/components/input";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "All Players"},
    ];
}

export default function PlayersIndex() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = React.useState(searchParams.get("search") ?? "");
    const page = parseInt(searchParams.get("page") || "1");
    const debouncedSearchTerm = useDebounce(search, 100);

    const {data: players, isLoading, refetch} = useGetAllPlayersQuery({
        page, search: debouncedSearchTerm
    });

    useEffect(() => {
        const states: { search?: string } = {};
        if (debouncedSearchTerm) states.search = debouncedSearchTerm;
        setSearchParams(states);
    }, [debouncedSearchTerm]);

    if (isLoading || !players) {
        return <Loading/>
    }

    return (
        <div>
            <Card>
                <div className={"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"}>
                    <div className="w-full sm:w-auto flex items-start order-2 sm:order-1">
                        <Input
                            id="search"
                            placeholder="Search"
                            className="w-full sm:w-64"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Link to="/players/create"
                          className={"border px-3 py-1.5 rounded-md hover:bg-blue-200 text-blue-600 " +
                              "hover:text-blue-900 whitespace-nowrap self-end sm:self-auto order-1 sm:order-2"}>
                        Create Player
                    </Link>
                </div>
                <Table
                    header={(
                        <tr>
                            <Th first>Icon</Th>
                            <Th>Name</Th>
                            <Th>Price</Th>
                            <Th>Position</Th>
                            <Th>Club</Th>
                            <Th>League</Th>
                            <Th>Nationality</Th>
                            <Th>Rating</Th>
                            <Th>Available</Th>
                            <Th></Th>
                        </tr>
                    )}
                    body={(player: Player) => (
                        <tr key={player.id} className="text-center">
                            <Td>
                                <div className="flex justify-center">
                                    <img src={player.imageUrl} className="w-24 h-auto"/>
                                </div>
                            </Td>
                            <Td>
                                <div className="text-gray-800">{player.name}</div>
                            </Td>
                            <Td>
                                <div className="text-gray-800">${player.price}</div>
                            </Td>
                            <Td>
                                <div className="text-gray-800">{player.position}</div>
                            </Td>
                            <Td>
                                <div className="text-gray-800">{player.club}</div>
                            </Td>
                            <Td>
                                <div className="text-gray-800">{player.league}</div>
                            </Td>
                            <Td>
                                <div className="text-gray-800">{player.nationality}</div>
                            </Td>
                            <Td>
                                <div className="text-gray-800">{player.rating}</div>
                            </Td>
                            <Td>
                                <div className="flex justify-center">
                                    <div className={"px-3 py-1.5 rounded-lg " +
                                        (player.available ? "text-green-100 bg-green-700" : "text-red-100 bg-red-700")
                                    }>
                                        {player.available ? "Yes" : "No"}
                                    </div>
                                </div>
                            </Td>
                            <Td>
                                <div className="flex items-center justify-center space-x-3">
                                    <a href={`/players/${player.id}/edit`}
                                       className="text-blue-600 hover:text-blue-900">
                                        Edit<span className="sr-only">, {player.name}</span>
                                    </a>

                                    <DeleteButton
                                        useDeleteMutation={useDeletePlayerMutation}
                                        onDelete={() => refetch()}
                                        itemKey="id"
                                        itemValue={player.id}
                                    />
                                </div>
                            </Td>
                        </tr>
                    )}
                    pagination={players}
                />
            </Card>
        </div>
    );
}