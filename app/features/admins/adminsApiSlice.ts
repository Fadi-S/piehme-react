import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import {ROOT_URL} from "~/base/consts";
import {getFromLocalStorage} from "~/base/helpers";
import {type PageRequest, type Pagination, queryParamsFromRequest} from "~/types/pagination";

interface Admin {
    id: number;
    username: string;
    role: Role;
    schoolYear: SchoolYear;
}

interface SchoolYear {
    id: number;
    name: string;
}

enum Role {
    ADMIN = "ADMIN",
    OSTAZ = "OSTAZ",
}

interface AdminForm {
    username: string;
    role: Role;
    password: string;
    schoolYear: number;
}

export type { Admin, AdminForm, SchoolYear };
export {Role};

// Define a service using a base URL and expected endpoints
export const adminsApiSlice = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: ROOT_URL,
        prepareHeaders: (headers, {}) => {
            const token = getFromLocalStorage("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            
            headers.set("Content-Type", "application/json");

            return headers;
        },
    }),
    reducerPath: "adminsApi",
    tagTypes: ["Admins", "SchoolYears"],
    endpoints: build => ({
        getAllAdmins: build.query<Pagination<Admin>, PageRequest>({
            query: (req : PageRequest) => `admin/admins${queryParamsFromRequest(req)}`,
            providesTags: ["Admins"],
        }),

        getAllSchoolYears: build.query<SchoolYear[], void>({
            query: () => `admin/schoolYears`,
            providesTags: ["SchoolYears"],
        }),

        getAdmin: build.query<Admin, { id: number }>({
            query: ({id}) => `admin/admins/${id}`,
            providesTags: (_, __, {id}) => [{type: "Admins", id: id}],
        }),

        updateAdmin: build.mutation<string, { admin: AdminForm, id: number }>({
            query: ({admin, id}) => {
                return {
                    url: `admin/admins/${id}`,
                    method: "PATCH",
                    body: admin
                };
            },
            invalidatesTags: (_, __, {id}) => [{type: "Admins", id: id}],
        }),

        createAdmin: build.mutation<string, AdminForm>({
            query: (admin : AdminForm) => {
                return {
                    url: `admin/admins`,
                    method: "POST",
                    body: admin,
                };
            },
            invalidatesTags: ["Admins"],
        }),

    }),
})

export const { useGetAllAdminsQuery, useGetAdminQuery, useGetAllSchoolYearsQuery, useUpdateAdminMutation, useCreateAdminMutation} = adminsApiSlice