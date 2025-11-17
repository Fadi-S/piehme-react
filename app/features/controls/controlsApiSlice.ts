import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import {ROOT_URL} from "~/base/consts";
import {defaultHeaders, getFromLocalStorage} from "~/base/helpers";

interface Control {
    id: number;
    name: string;
    visible: boolean;
    role: string;
}

export type { Control };

// Define a service using a base URL and expected endpoints
export const controlsApiSlice = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: ROOT_URL,
        prepareHeaders: (headers, {}) => defaultHeaders(headers),
    }),
    reducerPath: "controlsApi",
    tagTypes: ["Controls"],
    endpoints: build => ({
        getAllControls: build.query<Control[], void>({
            query: () => `ostaz/buttons-visibility`,
            providesTags: ["Controls"],
        }),

        changeVisibilty: build.mutation<string, { name: string, visible: boolean }>({
            query: ({name, visible}) => {
                return {
                    url: `ostaz/buttons-visibility/${name}/${visible ? 1 : 0}`,
                    method: "PUT",
                };
            },
            invalidatesTags: ["Controls"],
        }),

    }),
})

export const { useGetAllControlsQuery, useChangeVisibiltyMutation} = controlsApiSlice