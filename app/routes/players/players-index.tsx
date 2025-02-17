import Loading from "~/components/loading";
import Card from "~/components/card";
import {Table, Td, Th} from "~/components/table";
import {type Player, useGetAllPlayersQuery} from "~/features/players/playersApiSlice";
import {Link, useSearchParams} from "react-router";
import React from "react";

export default function PlayersIndex() {
    const [searchParams, _] = useSearchParams();

    const page = parseInt(searchParams.get("page") || "1");

    const {data: players, isLoading} = useGetAllPlayersQuery({page});

    if (isLoading || !players) {
        return <Loading/>
    }

    return (
        <div>
            <Card>
                <div className={"flex items-center justify-end"}>
                    <Link to="/players/create"
                          className={"border px-3 py-1.5 rounded-md hover:bg-blue-200 text-blue-600 " +
                              "hover:text-blue-900"}>
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
                            <Th>Rating</Th>
                            <Th>Available</Th>
                            <Th></Th>
                        </tr>
                    )}
                    body={(player: Player) => (
                        <tr key={player.id}>
                            <Td first>
                                <img src={player.imageUrl} className="w-24 h-auto" />
                            </Td>
                            <Td>
                                <div className="text-gray-800">{player.name}</div>
                            </Td>
                            <Td>
                                <div className="text-gray-800">${player.price}</div>
                            </Td>
                            <Td>
                                <div className="text-gray-800">${player.position}</div>
                            </Td>
                            <Td>
                                <div className="text-gray-800">${player.rating}</div>
                            </Td>
                            <Td>
                                <div className="flex items-center">

                                <div className={"px-3 py-1.5 rounded-lg " +
                                    (player.available ? "text-green-100 bg-green-700" : "text-red-100 bg-red-700")
                                }>
                                    {player.available ? "Yes" : "No"}
                                </div>
                                </div>
                            </Td>
                            <Td>
                                <a href={`/players/${player.id}/edit`} className="text-blue-600 hover:text-blue-900">
                                    Edit<span className="sr-only">, {player.name}</span>
                                </a>
                            </Td>
                        </tr>
                    )}
                    pagination={players}
                />
            </Card>
        </div>
    );
}