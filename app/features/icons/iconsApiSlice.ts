import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import {ROOT_URL} from "~/base/consts";
import {getFromLocalStorage} from "~/base/helpers";
import {type PageRequest, type Pagination, queryParamsFromRequest} from "~/types/pagination";

interface Icon {
    id: number;
    name: string;
    imageKey: string;
    imageUrl: string;
    price: number;
    available: boolean;
}

interface IconUpload {
    name: string;
    image: File|null;
    price: number;
    available: boolean;
}

export type { Icon, IconUpload };

// Define a service using a base URL and expected endpoints
export const iconsApiSlice = createApi({
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
    reducerPath: "iconsApi",
    tagTypes: ["Icons"],
    endpoints: build => ({
        getAllIcons: build.query<Pagination<Icon>, PageRequest>({
            query: (req : PageRequest) => `admin/icons${queryParamsFromRequest(req)}`,
            providesTags: ["Icons"],
        }),

        getIcon: build.query<Icon, { name: string }>({
            query: ({name}) => `icons/${name}`,
            providesTags: (_, __, {name}) => [{type: "Icons", id: name}],
        }),

        updateIcon: build.mutation<string, IconUpload>({
            query: (icon : IconUpload) => {
                return {
                    url: `admin/icons/${icon.name}`,
                    method: "POST",
                    body: icon,
                    formData: true,
                    headers: {
                        "Content-Type": "multipart/form-data;"
                    }
                };
            },
            invalidatesTags: (_, __, {name}) => [{type: "Icons", id: name}],
        }),

        createIcon: build.mutation<string, IconUpload>({
            query: (icon : IconUpload) => {
                return {
                    url: `admin/icons`,
                    method: "POST",
                    body: icon,
                    formData: true,
                    headers: {
                        "Content-Type": "multipart/form-data;"
                    }
                };
            },
            invalidatesTags: ["Icons"],
        }),

    }),
})

export const { useGetAllIconsQuery, useGetIconQuery, useUpdateIconMutation, useCreateIconMutation} = iconsApiSlice