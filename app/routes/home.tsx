import type {Route} from "./+types/home";
import Card from "~/components/card";
import Input from "~/components/input";
import Button from "~/components/button";
import {Table, Td, Th} from "~/components/table";
import React, {useEffect} from "react";
import {useSearchParams} from "react-router";
import {
    useConfirmMutation,
    useCreateUserMutation,
    useCreateUsersBulkMutation,
    useGetUsersQuery,
    useGetUsersByCoinsQuery
} from "~/features/users/usersApiSlice";
import type {User} from "~/features/users/usersApiSlice";
import {useDebounce} from "~/base/helpers";
import Loading from "~/components/loading";
import CoinsButton from "~/components/coins";
import Modal from "~/components/modal";
import If from "~/components/if";
import Textarea from "~/components/textarea";
import {ArrowDownTrayIcon} from "@heroicons/react/24/outline";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Cup"},
    ];
}

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page") ?? "1");

    const [search, setSearch] = React.useState(searchParams.get("search") ?? "");
    const debouncedSearchTerm = useDebounce(search, 100);
    const initialSort = (searchParams.get("sort") ?? "default") as "default" | "coins";
    const [sort, setSort] = React.useState<"default" | "coins">(initialSort);

    const {data: usersDefault, isLoading: isLoadingDefault, refetch: refetchDefault} = useGetUsersQuery({page, search: debouncedSearchTerm});
    const {data: usersCoins, isLoading: isLoadingCoins, refetch: refetchCoins} = useGetUsersByCoinsQuery({page, search: debouncedSearchTerm});
    const users = sort === "coins" ? usersCoins : usersDefault;
    const isLoading = sort === "coins" ? isLoadingCoins : isLoadingDefault;
    const refetch = sort === "coins" ? refetchCoins : refetchDefault;

    const [open, setOpen] = React.useState(false);
    const [openBulk, setOpenBulk] = React.useState(false);
    const [createUser, {isLoading: isCreatingUser, isSuccess: isCreateUserSuccess, error}] = useCreateUserMutation();
    const [createUsersBulk, {isLoading: isCreatingUsersBulk, isSuccess: isCreateUsersBulkSuccess, error: errorBulk, data: usersPasswords}] = useCreateUsersBulkMutation();
    const [confirmUser, {isLoading: isConfirmLoading, isSuccess: isConfirmSuccess}] = useConfirmMutation();

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [errorMessage, setErrorMessage] = React.useState("");

    useEffect(() => {
        const states: { search?: string; sort?: string } = {};
        if (debouncedSearchTerm) states.search = debouncedSearchTerm;
        if (sort && sort !== "default") states.sort = sort;
        setSearchParams(states);
    }, [debouncedSearchTerm, sort]);

    useEffect(() => {
        if(isConfirmSuccess) {
            refetch();
        }
    }, [isConfirmLoading]);

    useEffect(() => {
        if (isCreateUserSuccess) {
            setOpen(false);
            setUsername("");
            setPassword("");
            refetch();
        } else { // @ts-ignore
            if (error && error.data) {
                // @ts-ignore
                setErrorMessage(error.data.message);
            }
        }
    }, [isCreatingUser]);

    useEffect(() => {
        if (isCreateUsersBulkSuccess) {
            setUsername("");
            refetch();
        } else { // @ts-ignore
            if (errorBulk && errorBulk.data) {
                // @ts-ignore
                setErrorMessage(errorBulk.data.message);
            }
        }
    }, [isCreatingUsersBulk]);

    function submitConfirm(e: React.FormEvent, confirmUsername: string) {
        e.preventDefault();

        confirmUser({username: confirmUsername})
    }

    function submitCreateUser(e: React.FormEvent) {
        e.preventDefault();

        setErrorMessage("");

        createUser({username, password});
    }


    function mapUsersWithPasswordsForCSV(usersPasswords : Map<String, String>) {
        let csv = "Username,Password\n";
        for (let [username, password] of Object.entries(usersPasswords)) {
            csv += `${username},${password}\n`;
        }
        return csv;
    }

    function downloadCSV() {
        const element = document.createElement("a");
        const file = new Blob([mapUsersWithPasswordsForCSV(usersPasswords!)], {type: "text/plain"});
        element.href = URL.createObjectURL(file);
        element.download = "users.csv";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }

    function submitCreateUserBulk(e: React.FormEvent) {
        e.preventDefault();

        setErrorMessage("");

        createUsersBulk({usernames: username.split("\n")});
    }


    if (isLoading || !users) {
        return <Loading/>;
    }

    return (
        <div>
            <Card>
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="w-full sm:w-auto flex items-start">
                        <Input
                            id="search"
                            placeholder="Search"
                            className="w-full sm:w-64"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="order-first sm:order-none w-full sm:w-auto flex justify-center mt-4 sm:mt-0">
                        <Button
                            color={sort === "coins" ? "light-blue" : "gray"}
                            type="button"
                            onClick={() => setSort(prev => (prev === "coins" ? "default" : "coins"))}
                        >
                            {sort === "coins" ? "Sort by Overall Rating" : "Sort by Earned Coins"}
                        </Button>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 flex items-center justify-between space-x-4">
                        

                        <Button onClick={() => setOpen(true)} type="button" className="whitespace-nowrap">Add user</Button>

                        <Button color="heavy-green" onClick={() => setOpenBulk(true)} type="button" className="whitespace-nowrap">Add list</Button>

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

                        <Modal
                            open={openBulk}
                            onClose={() => setOpenBulk(false)}
                            title="Add Users from List"
                            footer={(
                                <div className="flex justify-between space-x-3">
                                    <Button disabled={isCreatingUsersBulk} type="submit" form="create-users-bulk">
                                        {isCreatingUsersBulk ? "Creating Users..." : "Create Users"}
                                    </Button>

                                    <Button color="gray" type="button" onClick={() => setOpenBulk(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        >
                            {usersPasswords && (
                                <div className="my-4">
                                    <div className="text-green-600">Users Created Successfully</div>

                                    <table className="w-full my-3">
                                        <thead>
                                        <tr className="border">
                                            <th className="px-2 py-1.5 border">Username</th>
                                            <th className="px-2 py-1.5 border">Password</th>
                                        </tr>
                                        </thead>

                                        <tbody>
                                        {Object.entries(usersPasswords).slice(0, 5).map(([username, password]) => (
                                            <tr className="border" key={username}>
                                                <td className="border px-2 py-1.5">{username}</td>
                                                <td className="border px-2 py-1.5">{password}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>

                                    {Object.entries(usersPasswords).length > 5 && (
                                        <div className="text-gray-500 mb-2">Showing 5 users out
                                            of {Object.entries(usersPasswords).length}</div>
                                    )}

                                    <Button color="heavy-green" type="button" onClick={downloadCSV}>
                                        <div className="flex items-center">
                                            <ArrowDownTrayIcon className="w-5 h-5 mr-2"/>
                                            <span>Download CSV</span>
                                        </div>
                                    </Button>
                                </div>
                            )}

                            <form onSubmit={submitCreateUserBulk} className="space-y-3" id="create-users-bulk">
                                <Textarea
                                    label="Usernames"
                                    id="add-usernames-bulk"
                                    value={username}
                                    rows={10}
                                    onChange={e => setUsername(e.target.value)}
                                />

                                {errorMessage && <div className="text-red-600">{errorMessage}</div>}
                            </form>
                        </Modal>

                    </div>
                </div>

                <Table
                    header={<tr className="text-center">
                        <Th>ID</Th>
                        <Th>Name</Th>
                        <Th>Lienup Rating</Th>
                        <Th>Chemistry</Th>
                        <Th>Overall Rating</Th>
                        <Th>Current Coins</Th>
                        <Th>Modify</Th>
                        <Th><span className="sr-only">View</span></Th>
                    </tr>}
                    pagination={users!}
                    body={(user: User) => (
                        <tr key={user.id} className="text-center">
                            <Td>{user.id}</Td>
                            <Td>
                                <div className="flex items-center justify-center">
                                    <div className="size-11 shrink-0">
                                        <img alt="" src={user.imageUrl} className="size-11 rounded-full"/>
                                    </div>
                                    <div className="ml-4">
                                        <div className="font-medium text-gray-900">{user.username}</div>
                                    </div>
                                </div>
                            </Td>
                            <Td>
                                <div className="mt-1 text-gray-500">{user.lineupRating}</div>
                            </Td>
                            <Td>
                                <div className="mt-1 text-gray-500">{user.chemistry}</div>
                            </Td>
                            <Td>
                                <div className="mt-1 text-gray-500">{Math.floor((user.lineupRating + (user.chemistry ?? 0)))}</div>
                            </Td>
                            <Td className="text-gray-700 font-semibold">${user.coins}</Td>
                            <Td>
                                <div className="flex flex-col space-y-3 items-center justify-center">
                                    <CoinsButton onFinished={refetch} mode="add" username={user.username}/>
                                    <CoinsButton onFinished={refetch} mode="remove" username={user.username}/>
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
