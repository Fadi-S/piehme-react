import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import {ROOT_URL} from "~/base/consts";
import {getFromLocalStorage} from "~/base/helpers";
import type {Pagination, PageRequest} from "~/types/pagination";

interface User {
    id: number;
    username: string;
    coins: number;
    cardRating: number;
    lineupRating: number;
    imgLink: string;
    selectedIcon: string;
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
            query: (req : PageRequest) => {
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

    }),
})

export const { useGetUsersQuery } = usersApiSlice