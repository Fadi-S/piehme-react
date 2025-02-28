import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import {ROOT_URL} from "~/base/consts";
import {getFromLocalStorage} from "~/base/helpers";
import {type Pagination, type PageRequest, queryParamsFromRequest} from "~/types/pagination";
import type {Attendance} from "~/features/attendance/attendanceApiSlice";

interface User {
    id: number;
    username: string;
    coins: number;
    cardRating: number;
    lineupRating: number;
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
        prepareHeaders: (headers, {}) => {
            const token = getFromLocalStorage("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }

            if (headers.get("Content-Type") === "multipart/form-data;") {
                headers.delete("Content-Type");
            } else {
                headers.set("Content-Type", "application/json");
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
                url += queryParamsFromRequest(req);

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

        deleteUser: build.mutation<void, { username:string }>({
            query: ({username}) => {
                return {
                    url: `ostaz/users/${username}`,
                    method: "DELETE",
                };
            },
            invalidatesTags: (_, __, {username}) => [{type: "Users", id: username}],
        }),
    }),
})

export const {useGetUsersQuery, useGetUserQuery, useDeleteUserMutation, useConfirmMutation, useChangeImageMutation, useAddCoinsMutation, useRemoveCoinsMutation, useChangePasswordMutation, useCreateUserMutation} = usersApiSlice