import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import {ROOT_URL} from "~/base/consts";
import {defaultHeaders, getFromLocalStorage} from "~/base/helpers";
import {type PageRequest, type Pagination, queryParamsFromRequest} from "~/types/pagination";

interface Attendance {
    id: number;
    createdAt: string;
    date: string;
    description: string;
    approved: boolean;
    coins: number;
    userId?: number;
    username?: string;
}

export type { Attendance };

// Define a service using a base URL and expected endpoints
export const attendanceApiSlice = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: ROOT_URL,
        prepareHeaders: (headers, {}) => defaultHeaders(headers),
    }),
    reducerPath: "attendanceApi",
    tagTypes: ["Attendances", "Users"],
    endpoints: build => ({
        getAttendances: build.query<Pagination<Attendance>, PageRequest>({
            query: (req: PageRequest) => {
                let url = "ostaz/attendances";
                url += queryParamsFromRequest(req);

                return {url, method: "GET"};
            },
        }),

        approveAttendance: build.mutation<string, { attendanceId: number, username:string }>({
            query: ({attendanceId}) => {
                return {
                    url: `ostaz/attendances/${attendanceId}`,
                    method: "PATCH",
                };
            },
            invalidatesTags: (_, __, {username}) => [{type: "Users", id: username}],
        }),

        deleteAttendance: build.mutation<string, { attendanceId: number, username:string }>({
            query: ({attendanceId}) => {
                return {
                    url: `ostaz/attendances/${attendanceId}`,
                    method: "DELETE",
                };
            },
            invalidatesTags: (_, __, {username}) => [{type: "Users", id: username}],
        }),
    }),
})

export const {useGetAttendancesQuery, useApproveAttendanceMutation, useDeleteAttendanceMutation} = attendanceApiSlice