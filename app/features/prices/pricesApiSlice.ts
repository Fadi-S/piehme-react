import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import {ROOT_URL} from "~/base/consts";
import {defaultHeaders, getFromLocalStorage} from "~/base/helpers";
import {type PageRequest, type Pagination, queryParamsFromRequest} from "~/types/pagination";

interface Price {
    id: number;
    name: string;
    coins: number;
}

interface PriceUpload {
    name: string;
    coins: number;
}

export type { Price, PriceUpload };

// Define a service using a base URL and expected endpoints
export const pricesApiSlice = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: ROOT_URL,
        prepareHeaders: (headers, {}) => defaultHeaders(headers),
    }),
    reducerPath: "pricesApi",
    tagTypes: ["Prices"],
    endpoints: build => ({
        getAllPrices: build.query<Pagination<Price>, PageRequest>({
            query: (req : PageRequest) => `admin/prices${queryParamsFromRequest(req)}`,
            providesTags: ["Prices"],
        }),

        getPrice: build.query<Price, { id: number }>({
            query: ({id}) => `admin/prices/${id}`,
            providesTags: (_, __, {id}) => [{type: "Prices", id: id}],
        }),

        updatePrice: build.mutation<string, { price: PriceUpload, id: number }>({
            query: ({price, id}) => {

                return {
                    url: `admin/prices/${id}`,
                    method: "PUT",
                    body: price,
                };
            },
            invalidatesTags: (_, __, {id}) => [{type: "Prices", id: id}],
        }),

        deletePrice: build.mutation<string, { id: number }>({
            query: ({ id}) => {

                return {
                    url: `admin/prices/${id}`,
                    method: "DELETE",
                };
            },
            invalidatesTags: (_, __, {id}) => [{type: "Prices", id: id}],
        }),

        createPrice: build.mutation<string, PriceUpload>({
            query: (price : PriceUpload) => {
                return {
                    url: `admin/prices`,
                    method: "POST",
                    body: price,
                };
            },
            invalidatesTags: ["Prices"],
        }),

    }),
})

export const { useGetAllPricesQuery, useGetPriceQuery, useUpdatePriceMutation, useCreatePriceMutation} = pricesApiSlice