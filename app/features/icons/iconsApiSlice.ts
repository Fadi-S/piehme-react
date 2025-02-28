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

        getIcon: build.query<Icon, { id: number }>({
            query: ({id}) => `admin/icons/${id}`,
            providesTags: (_, __, {id}) => [{type: "Icons", id: id}],
        }),

        deleteIcon: build.mutation<Icon, { id: number }>({
            query: ({id}) => {
                return {
                    url: `admin/icons/${id}`,
                    method: "DELETE",
                };
            },
            invalidatesTags: (_, __, {id}) => [{type: "Icons", id: id}],
        }),

        updateIcon: build.mutation<string, { icon: IconUpload, id: number }>({
            query: ({icon, id}) => {
                let formData = new FormData();
                formData.set("name", icon.name);
                formData.set("price", icon.price.toString());
                formData.set("available", icon.available ? "1" : "0");

                if(icon.image)
                    formData.set("image", icon.image as Blob);

                return {
                    url: `admin/icons/${id}`,
                    method: "POST",
                    body: formData,
                    formData: true,
                    headers: {
                        "Content-Type": "multipart/form-data;"
                    }
                };
            },
            invalidatesTags: (_, __, {id}) => [{type: "Icons", id: id}],
        }),

        createIcon: build.mutation<string, IconUpload>({
            query: (icon : IconUpload) => {
                let formData = new FormData();
                formData.set("name", icon.name);
                formData.set("price", icon.price.toString());
                formData.set("available", icon.available ? "1" : "0");
                formData.set("image", icon.image as Blob);

                return {
                    url: `admin/icons`,
                    method: "POST",
                    body: formData,
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

export const { useGetAllIconsQuery, useGetIconQuery, useDeleteIconMutation, useUpdateIconMutation, useCreateIconMutation} = iconsApiSlice