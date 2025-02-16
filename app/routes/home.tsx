import type {Route} from "./+types/home";
import Card from "~/components/card";
import Input from "~/components/input";
import Button from "~/components/button";
import {Table, Td, Th} from "~/components/table";
import React, {useEffect} from "react";
import {useSearchParams} from "react-router";
import {useCreateUserMutation, useGetUsersQuery} from "~/features/users/usersApiSlice";
import type {User} from "~/features/users/usersApiSlice";
import {useDebounce} from "~/base/helpers";
import Loading from "~/components/loading";
import CoinsButton from "~/components/coins";
import Modal from "~/components/modal";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Piehme Cup"},
    ];
}

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page") ?? "1");

    const [search, setSearch] = React.useState(searchParams.get("search") ?? "");
    const debouncedSearchTerm = useDebounce(search, 100);

    const {data: users, isLoading, refetch} = useGetUsersQuery({page, search: debouncedSearchTerm});

    const [open, setOpen] = React.useState(false);
    const [createUser, {isLoading: isCreatingUser, isSuccess: isCreateUserSuccess, error}] = useCreateUserMutation();

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [errorMessage, setErrorMessage] = React.useState("");

    useEffect(() => {
        const states: {search?:string} = {};
        if(debouncedSearchTerm) states.search = debouncedSearchTerm;
        setSearchParams(states);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        if(isCreateUserSuccess) {
            setOpen(false);
            setUsername("");
            setPassword("");
            refetch();
        } else if(error) {
            // @ts-ignore
            setErrorMessage(error.data.message);
        }


    }, [isCreatingUser]);

    function submitCreateUser(e: React.FormEvent) {
        e.preventDefault();

        createUser({username, password});
    }


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
                        <Button onClick={() => setOpen(true)} type="button">Add user</Button>

                        <Modal
                            open={open}
                            onClose={() => setOpen(false)}
                            title="Add User"
                            footer={(
                                <div className="flex justify-between space-x-3">
                                    <Button disabled={isCreatingUser} type="submit" form="create-user">
                                        {isCreatingUser ? "Creating User..." : "Create User"}
                                    </Button>

                                    <Button color="gray" type="button" onClick={() => setOpen(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        >
                            <form onSubmit={submitCreateUser} className="space-y-3" id="create-user">
                                <Input
                                    label="Username"
                                    id="add-username"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                />
                                <Input
                                    label="Password"
                                    id="add-password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />

                                {errorMessage && <div className="text-red-600">{errorMessage}</div>}
                            </form>
                        </Modal>
                    </div>
                </div>

                <Table
                    header={<tr>
                        <Th>Name</Th>
                        <Th>Coins</Th>
                        <Th>Lienup Rating</Th>
                        <Th>Actions</Th>
                        <Th><span className="sr-only">View</span></Th>
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
                                    </div>
                                </div>
                            </Td>
                            <Td className="text-gray-700 font-semibold">${user.coins}</Td>
                            <Td>
                                <div className="mt-1 text-gray-500">{user.lineupRating}</div>
                            </Td>
                            <Td>
                                <div className="flex flex-col space-y-3 items-center justify-center">
                                    <CoinsButton onFinished={refetch} mode="add" username={user.username} />
                                    <CoinsButton onFinished={refetch} mode="remove" username={user.username} />
                                </div>
                            </Td>
                            <Td className="relative py-5 pl-3 text-right text-sm font-medium whitespace-nowrap">
                                <a href={`/users/${user.username}`} className="text-blue-600 hover:text-blue-900">
                                    View<span className="sr-only">, {user.username}</span>
                                </a>
                            </Td>
                        </tr>
                    )}
                />
            </Card>
        </div>
    );
}
