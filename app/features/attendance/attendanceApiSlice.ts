import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import {ROOT_URL} from "~/base/consts";
import {getFromLocalStorage} from "~/base/helpers";

interface Attendance {
    id: number;
    createdAt: string;
    description: string;
    approved: boolean;
    coins: number;
}

export type { Attendance };

// Define a service using a base URL and expected endpoints
export const attendanceApiSlice = createApi({
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
    reducerPath: "attendanceApi",
    tagTypes: ["Attendances", "Users"],
    endpoints: build => ({
        getAttendances: build.query<Attendance, void>({
            query: () => `ostaz/attendances`,
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