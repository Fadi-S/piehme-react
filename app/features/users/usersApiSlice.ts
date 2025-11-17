import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import {ROOT_URL} from "~/base/consts";
import {defaultHeadersFileUpload, getFromLocalStorage} from "~/base/helpers";
import {type Pagination, type PageRequest, queryParamsFromRequest} from "~/types/pagination";
import type {Attendance} from "~/features/attendance/attendanceApiSlice";

interface User {
    id: number;
    username: string;
    coins: number;
    cardRating: number;
    lineupRating: number;
    leaderboardBoolean: boolean;
    imageUrl: string;
    imageKey: string;
    selectedIcon: string;
    confirmed: Boolean;
    attendances?: Attendance[];
}

export type {User};

// Define a service using a base URL and expected endpoints
export const usersApiSlice = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: ROOT_URL,
        prepareHeaders: (headers, {}) => defaultHeadersFileUpload(headers),
    }),
    reducerPath: "usersApi",
    tagTypes: ["Users"],
    endpoints: build => ({
        getUsers: build.query<Pagination<User>, PageRequest>({
            query: (req: PageRequest) => {
                let url = "ostaz/users";
                url += queryParamsFromRequest(req);

                return {url, method: "GET",};
            },

        }),

        // Get users sorted by coins
        getUsersCoins: build.query<Pagination<User>, PageRequest>({
            query: (req: PageRequest) => {
                let url = "ostaz/users/coins";
                url += queryParamsFromRequest(req);

                return { url, method: "GET" };
            },
        }),

        getUser: build.query<User, { username: string }>({
            query: ({username}) => `ostaz/users/${username}`,
            providesTags: (_, __, {username}) => [{type: "Users", id: username}],
        }),

        addCoins: build.mutation<number, { username: string, coins: number }>({
            query: ({username, coins}) => {
                return {
                    url: `ostaz/users/${username}/coins/add`,
                    method: "POST",
                    body: {coins},
                };
            },
            invalidatesTags: (_, __, {username}) => [{type: "Users", id: username}],
        }),

        changeImage: build.mutation<void, { username: string, image: File }>({
            query: ({username, image}) => {
                const formData = new FormData();
                formData.append("image", image);
                return {
                    url: `ostaz/users/${username}/change-image`,
                    method: "PUT",
                    body: formData,
                    formData: true,
                    headers: {
                        "Content-Type": "multipart/form-data;"
                    }
                };
            },
            invalidatesTags: (_, __, {username}) => [{type: "Users", id: username}],
        }),

        removeCoins: build.mutation<number, { username: string, coins: number }>({
            query: ({username, coins}) => {
                return {
                    url: `ostaz/users/${username}/coins/remove`,
                    method: "POST",
                    body: {coins},
                };
            },
        }),
        changePassword: build.mutation<void, { username:string, password: string }>({
            query: ({username, password}) => {
                return {
                    url: `ostaz/users/${username}/change-password`,
                    method: "POST",
                    body: {password},
                };
            },
        }),

        confirm: build.mutation<void, { username:string }>({
            query: ({username}) => {
                return {
                    url: `ostaz/users/${username}/confirm`,
                    method: "POST",
                };
            },
        }),

        createUser: build.mutation<void, { username:string, password: string }>({
            query: ({username, password}) => {
                return {
                    url: `ostaz/users`,
                    method: "POST",
                    body: {username, password},
                };
            },
            invalidatesTags: ["Users"],
        }),

        createUsersBulk: build.mutation<Map<String, String>, { usernames: string[] }>({
            query: ({usernames}) => {
                return {
                    url: `ostaz/users/bulk`,
                    method: "POST",
                    body: {users: usernames},
                };
            },
            invalidatesTags: ["Users"],
        }),

        deleteUser: build.mutation<void, { username:string }>({
            query: ({username}) => {
                return {
                    url: `ostaz/users/${username}`,
                    method: "DELETE",
                };
            },
            invalidatesTags: (_, __, {username}) => [{type: "Users", id: username}],
        }),

        showInLeaderboard: build.mutation<number, { userId: number }>({
            query: ({userId}) => {
                return {
                    url: `ostaz/users/leaderboard/show/${userId}`,
                    method: "PATCH",
                };
            },
            invalidatesTags: (_, __, {userId}) => [{type: "Users", id: userId}],
        }),

        hideFromLeaderboard: build.mutation<number, { userId: number }>({
            query: ({userId}) => {
                return {
                    url: `ostaz/users/leaderboard/hide/${userId}`,
                    method: "PATCH",
                };
            },
            invalidatesTags: (_, __, {userId}) => [{type: "Users", id: userId}],
        }),
    }),
})

export const {useGetUsersQuery, useGetUsersCoinsQuery, useGetUserQuery, useDeleteUserMutation, useConfirmMutation, useChangeImageMutation, useAddCoinsMutation, useRemoveCoinsMutation, useChangePasswordMutation, useCreateUserMutation, useShowInLeaderboardMutation, useHideFromLeaderboardMutation} = usersApiSlice;

