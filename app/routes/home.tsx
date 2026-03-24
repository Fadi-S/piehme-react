import type { Route } from "./+types/home";
import Card from "~/components/card";
import Input from "~/components/input";
import Button from "~/components/button";
import { Table, Td, Th } from "~/components/table";
import React, { useEffect } from "react";
import { useSearchParams } from "react-router";
import {
    useConfirmMutation,
    useCreateUserMutation,
    useCreateUsersBulkMutation,
    useGetUsersQuery,
    useGetUsersNerfedQuery,
    useGetUsersByCoinsQuery
} from "~/features/users/usersApiSlice";
import type { User } from "~/features/users/usersApiSlice";
import { useDebounce, defaultHeaders } from "~/base/helpers";
import { ROOT_URL } from "~/base/consts";
import Loading from "~/components/loading";
import CoinsButton from "~/components/coins";
import Modal from "~/components/modal";
import If from "~/components/if";
import Textarea from "~/components/textarea";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Cup" },
    ];
}

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page") ?? "1");

    const [search, setSearch] = React.useState(searchParams.get("search") ?? "");
    const debouncedSearchTerm = useDebounce(search, 100);
    const initialSortParam = searchParams.get("sort") ?? "overall";
    const initialSort = initialSortParam === "default" ? "overall" : initialSortParam;
    const [sort, setSort] = React.useState<"overall" | "nerfed" | "coins">(
        initialSort === "nerfed" || initialSort === "coins" ? initialSort : "overall"
    );
    const previousFiltersRef = React.useRef({
        search: searchParams.get("search") ?? "",
        sort: initialSort === "nerfed" || initialSort === "coins" ? initialSort : "overall"
    });

    const { data: usersDefault, isLoading: isLoadingDefault, refetch: refetchDefault } = useGetUsersQuery({ page, search: debouncedSearchTerm });
    const { data: usersNerfed, isLoading: isLoadingNerfed, refetch: refetchNerfed } = useGetUsersNerfedQuery({ page, search: debouncedSearchTerm });
    const { data: usersCoins, isLoading: isLoadingCoins, refetch: refetchCoins } = useGetUsersByCoinsQuery({ page, search: debouncedSearchTerm });
    const users = sort === "coins" ? usersCoins : sort === "nerfed" ? usersNerfed : usersDefault;
    const isLoading = sort === "coins" ? isLoadingCoins : sort === "nerfed" ? isLoadingNerfed : isLoadingDefault;
    const refetch = sort === "coins" ? refetchCoins : sort === "nerfed" ? refetchNerfed : refetchDefault;

    const [open, setOpen] = React.useState(false);
    const [openBulk, setOpenBulk] = React.useState(false);
    const [createUser, { isLoading: isCreatingUser, isSuccess: isCreateUserSuccess, error }] = useCreateUserMutation();
    const [createUsersBulk, { isLoading: isCreatingUsersBulk, isSuccess: isCreateUsersBulkSuccess, error: errorBulk, data: usersPasswords }] = useCreateUsersBulkMutation();
    const [confirmUser, { isLoading: isConfirmLoading, isSuccess: isConfirmSuccess }] = useConfirmMutation();

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [errorMessage, setErrorMessage] = React.useState("");
    const [isExporting, setIsExporting] = React.useState(false);

    useEffect(() => {
        const nextParams = new URLSearchParams(searchParams);
        const previousFilters = previousFiltersRef.current;
        const filtersChanged = previousFilters.search !== debouncedSearchTerm || previousFilters.sort !== sort;

        if (debouncedSearchTerm) {
            nextParams.set("search", debouncedSearchTerm);
        } else {
            nextParams.delete("search");
        }

        if (sort !== "overall") {
            nextParams.set("sort", sort);
        } else {
            nextParams.delete("sort");
        }

        if (filtersChanged) {
            nextParams.delete("page");
        }

        const nextParamsString = nextParams.toString();
        const currentParamsString = searchParams.toString();

        previousFiltersRef.current = {
            search: debouncedSearchTerm,
            sort
        };

        if (nextParamsString !== currentParamsString) {
            setSearchParams(nextParams);
        }
    }, [debouncedSearchTerm, searchParams, setSearchParams, sort]);

    useEffect(() => {
        if (isConfirmSuccess) {
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

        confirmUser({ username: confirmUsername })
    }

    function submitCreateUser(e: React.FormEvent) {
        e.preventDefault();

        setErrorMessage("");

        createUser({ username, password });
    }


    function mapUsersWithPasswordsForCSV(usersPasswords: Map<String, String>) {
        let csv = "Username,Password\n";
        for (let [username, password] of Object.entries(usersPasswords)) {
            csv += `${username},${password}\n`;
        }
        return csv;
    }

    function getOverallScore(user: User) {
        return user.lineupRating + (user.chemistry ?? 0);
    }

    function getNerfedScore(user: User) {
        return user.lineupRating + Math.sqrt(Math.max(user.chemistry ?? 0, 0)) * 0.25;
    }

    function compareUsers(a: User, b: User) {
        if (sort === "coins") {
            return (b.totalCoinsEarned ?? 0) - (a.totalCoinsEarned ?? 0)
                || b.lineupRating - a.lineupRating
                || a.id - b.id;
        }

        if (sort === "nerfed") {
            return getNerfedScore(b) - getNerfedScore(a)
                || (b.totalCoinsEarned ?? 0) - (a.totalCoinsEarned ?? 0)
                || a.id - b.id;
        }

        return getOverallScore(b) - getOverallScore(a)
            || (b.totalCoinsEarned ?? 0) - (a.totalCoinsEarned ?? 0)
            || a.id - b.id;
    }

    function getActiveScore(user: User) {
        if (sort === "coins") {
            return user.totalCoinsEarned ?? 0;
        }

        if (sort === "nerfed") {
            return getNerfedScore(user);
        }

        return getOverallScore(user);
    }

    function formatDisplayedScore(user: User) {
        if (sort === "coins") {
            return getActiveScore(user);
        }

        if (sort === "nerfed") {
            return getNerfedScore(user).toFixed(2);
        }

        return Math.floor(getOverallScore(user));
    }

    async function fetchAllUsers() {
        const allUsersList: User[] = [];
        let page = 0;
        let hasMore = true;

        while (hasMore) {
            const headers = new Headers();
            defaultHeaders(headers);

            const usersPath = sort === "coins" ? "/ostaz/users/coins" : sort === "nerfed" ? "/ostaz/users/nerfed" : "/ostaz/users";

            const response = await fetch(`${ROOT_URL}${usersPath}?page=${page}&size=1000`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            allUsersList.push(...data.data);

            hasMore = data.data.length > 0;
            page++;
        }

        return allUsersList;
    }

    async function downloadUsersCSV() {
        setIsExporting(true);
        try {
            const allUsersList = await fetchAllUsers();
            const csv = mapUsersForCSV(allUsersList);
            const element = document.createElement("a");
            const file = new Blob([csv], { type: "text/csv" });
            element.href = URL.createObjectURL(file);
            element.download = "users_export.csv";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        } catch (error) {
            console.error("Error exporting CSV:", error);
        } finally {
            setIsExporting(false);
        }
    }

    function mapUsersForCSV(allUsersList: User[]) {
        if (!allUsersList || allUsersList.length === 0) return "";

        let csv = "Position,Username,Score,Coins\n";
        const filteredUsers = allUsersList.filter((user: User) => user.lineupRating > 0);

        const sortedUsers = [...filteredUsers].sort(compareUsers);

        let currentPosition = 1;
        let previousScore: number | null = null;
        let usersAtCurrentPosition = 0;

        sortedUsers.forEach((user: User) => {
            const score = getActiveScore(user);

            if (previousScore === null || score !== previousScore) {
                currentPosition += usersAtCurrentPosition;
                usersAtCurrentPosition = 1;
                previousScore = score;
            } else {
                usersAtCurrentPosition++;
            }

            csv += `${currentPosition},${user.username},${score},${user.coins}\n`;
        });

        return csv;
    }

    function downloadCSV() {
        const element = document.createElement("a");
        const file = new Blob([mapUsersWithPasswordsForCSV(usersPasswords!)], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = "users.csv";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }

    function submitCreateUserBulk(e: React.FormEvent) {
        e.preventDefault();

        setErrorMessage("");

        createUsersBulk({ usernames: username.split("\n") });
    }


    if (isLoading || !users) {
        return <Loading />;
    }

    const scoreHeader = sort === "nerfed" ? "Nerfed Rating" : "Overall Rating";

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
                        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1">
                            <button
                                type="button"
                                onClick={() => setSort("overall")}
                                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${sort === "overall" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"}`}
                            >
                                Overall Rating
                            </button>
                            <button
                                type="button"
                                onClick={() => setSort("nerfed")}
                                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${sort === "nerfed" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"}`}
                            >
                                Nerfed Rating
                            </button>
                            <button
                                type="button"
                                onClick={() => setSort("coins")}
                                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${sort === "coins" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"}`}
                            >
                                Earned Coins
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 flex items-center justify-between space-x-4">


                        <Button onClick={() => setOpen(true)} type="button" className="whitespace-nowrap">Add user</Button>

                        <Button color="heavy-green" onClick={() => setOpenBulk(true)} type="button" className="whitespace-nowrap">Add list</Button>

                        <Button color="light-blue" onClick={downloadUsersCSV} type="button" disabled={isExporting} className="whitespace-nowrap">
                            <div className="flex items-center">
                                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                                <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
                            </div>
                        </Button>

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
                                            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
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
                        <If condition={sort !== "coins"}>
                            <Th>Lienup Rating</Th>
                            <Th>Chemistry</Th>
                            <Th>{scoreHeader}</Th>
                        </If>
                        <If condition={sort === "coins"}>
                            <Th>Total Coins Earned</Th>
                        </If>
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
                                        <img alt="" src={user.imageUrl} className="size-11 rounded-full" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="font-medium text-gray-900">{user.username}</div>
                                    </div>
                                </div>
                            </Td>
                            <If condition={sort !== "coins"}>
                                <Td>
                                    <div className="mt-1 text-gray-500">{user.lineupRating}</div>
                                </Td>
                                <Td>
                                    <div className="mt-1 text-gray-500">{user.chemistry}</div>
                                </Td>
                                <Td>
                                    <div className="mt-1 text-gray-500">{formatDisplayedScore(user)}</div>
                                </Td>
                            </If>
                            <If condition={sort === "coins"}>
                                <Td>
                                    <div className="mt-1 text-gray-500">${user.totalCoinsEarned ?? 0}</div>
                                </Td>
                            </If>
                            <Td className="text-gray-700 font-semibold">${user.coins}</Td>
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
