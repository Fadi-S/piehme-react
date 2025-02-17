import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import {ROOT_URL} from "~/base/consts";
import {getFromLocalStorage} from "~/base/helpers";
import {type PageRequest, type Pagination, queryParamsFromRequest} from "~/types/pagination";

interface Player {
    id: number;
    name: string;
    imageKey: string;
    imageUrl: string;
    position: string;
    rating: number;
    price: number;
    available: boolean;
}

interface PlayerUpload {
    name: string;
    image: File|null;
    price: number;
    available: boolean;
    position: string;
    rating: number;
}

export type { Player, PlayerUpload };

// Define a service using a base URL and expected endpoints
export const playersApiSlice = createApi({
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
    reducerPath: "playersApi",
    tagTypes: ["Players"],
    endpoints: build => ({
        getAllPlayers: build.query<Pagination<Player>, PageRequest>({
            query: (req : PageRequest) => `admin/players${queryParamsFromRequest(req)}`,
            providesTags: ["Players"],
        }),

        getPlayer: build.query<Player, { id: number }>({
            query: ({id}) => `admin/players/${id}`,
            providesTags: (_, __, {id}) => [{type: "Players", id: id}],
        }),

        updatePlayer: build.mutation<string, { player: PlayerUpload, id: number }>({
            query: ({player, id}) => {
                let formData = new FormData();
                formData.set("name", player.name);
                formData.set("position", player.position);
                formData.set("price", player.price.toString());
                formData.set("rating", player.rating.toString());
                formData.set("available", player.available ? "1" : "0");

                if(player.image)
                    formData.set("image", player.image as Blob);

                return {
                    url: `admin/players/${id}`,
                    method: "PUT",
                    body: formData,
                    formData: true,
                    headers: {
                        "Content-Type": "multipart/form-data;"
                    }
                };
            },
            invalidatesTags: (_, __, {id}) => [{type: "Players", id: id}],
        }),

        createPlayer: build.mutation<string, PlayerUpload>({
            query: (player : PlayerUpload) => {
                let formData = new FormData();
                formData.set("name", player.name);
                formData.set("position", player.position);
                formData.set("price", player.price.toString());
                formData.set("rating", player.rating.toString());
                formData.set("available", player.available ? "1" : "0");
                formData.set("image", player.image as Blob);

                return {
                    url: `admin/players`,
                    method: "POST",
                    body: formData,
                    formData: true,
                    headers: {
                        "Content-Type": "multipart/form-data;"
                    }
                };
            },
            invalidatesTags: ["Players"],
        }),

    }),
})

export const { useGetAllPlayersQuery, useGetPlayerQuery, useUpdatePlayerMutation, useCreatePlayerMutation} = playersApiSlice