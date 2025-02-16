import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import {ROOT_URL} from "~/base/consts";
import {getFromLocalStorage} from "~/base/helpers";
import type {Pagination, PageRequest} from "~/types/pagination";
import type {Attendance} from "~/features/attendance/attendanceApiSlice";

interface User {
    id: number;
    username: string;
    coins: number;
    cardRating: number;
    lineupRating: number;
    imgLink: string;
    selectedIcon: string;
    attendances?: Attendance[];
}

export type {User};

// Define a service using a base URL and expected endpoints
export const usersApiSlice = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: ROOT_URL,
        prepareHeaders: (headers, {}) => {
            headers.set("Content-Type", "application/json");

            const token = getFromLocalStorage("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }

            return headers;
        },
    }),
    reducerPath: "usersApi",
    tagTypes: ["Users"],
    endpoints: build => ({
        getUsers: build.query<Pagination<User>, PageRequest>({
            query: (req: PageRequest) => {
                let url = "ostaz/users";
                const queryParams = [];
                if (req.page) {
                    queryParams.push(`page=${req.page - 1}`);
                }
                if (req.size) {
                    queryParams.push(`size=${req.size}`);
                }
                if (req.search) {
                    queryParams.push(`search=${req.search}`);
                }

                if (queryParams.length > 0) {
                    url += `?${queryParams.join("&")}`;
                }

                return {url, method: "GET",};
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
    }),
})

export const {useGetUsersQuery, useGetUserQuery, useAddCoinsMutation, useRemoveCoinsMutation, useChangePasswordMutation, useCreateUserMutation} = usersApiSlice