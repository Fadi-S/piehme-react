import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import {ROOT_URL} from "~/base/consts";

interface SchoolYear {
    id: number;
    name: string;
}

// Define a service using a base URL and expected endpoints
export const userGuestApiSlice = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: ROOT_URL,
        prepareHeaders: (headers, {}) => {
            headers.set("Content-Type", "application/json");

            return headers;
        },
    }),
    reducerPath: "userGuestApi",
    tagTypes: [],
    endpoints: build => ({
        register: build.mutation<void, { username:string, password: string, schoolYear: string }>({
            query: ({username, password, schoolYear}) => {
                return {
                    url: `register`,
                    method: "POST",
                    body: {password, username, schoolYear},
                };
            },
        }),

        getSchoolYears: build.query<SchoolYear[], void>({
            query: () => {
                return {
                    url: `schoolYears`,
                    method: "GET",
                };
            },
        }),
    }),
})

export const { useRegisterMutation, useGetSchoolYearsQuery } = userGuestApiSlice