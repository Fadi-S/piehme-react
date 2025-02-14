import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import {ROOT_URL} from "~/base/consts";
import {createSlice} from "@reduxjs/toolkit";
import {getFromLocalStorage, removeFromLocalStorage, setToLocalStorage} from "~/base/helpers";


const initialState : LoginApiResponse = {
    jwttoken: getFromLocalStorage('token') || undefined,
    username: getFromLocalStorage('username') || undefined,
    userId: getFromLocalStorage('userId') || undefined,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setToken: (state, action) => {
            state.jwttoken = action.payload;
            setToLocalStorage('token', action.payload);
        },
        setUsername: (state, action) => {
            state.username = action.payload;
            setToLocalStorage('username', JSON.stringify(action.payload));
        },
        setUserId: (state, action) => {
            state.userId = action.payload;
            setToLocalStorage('userId', JSON.stringify(action.payload));
        },
        clearAuth: (state) => {
            state.jwttoken = undefined;
            state.username = undefined;
            state.userId = undefined;

            removeFromLocalStorage('token');
            removeFromLocalStorage('user');
            removeFromLocalStorage('authorities');
        },
    },
});

export const {setToken, setUsername, setUserId, clearAuth} = authSlice.actions;

export { authSlice };

interface LoginApiResponse {
    jwttoken?: string;
    username?: string;
    userId?: string;
}

interface LoginApiRequest {
    username: string;
    password: string;
}

// Define a service using a base URL and expected endpoints
export const authenticationApiSlice = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: ROOT_URL,
        prepareHeaders: (headers, {}) => {
            headers.set("Content-Type", "application/json");

            return headers;
        },
    }),
    reducerPath: "authenticationApi",
    tagTypes: ["Auth"],
    endpoints: build => ({
        login: build.mutation<LoginApiResponse, LoginApiRequest>({
            query: (req : LoginApiRequest) => {
                return {
                        url: `admin/login`,
                        method: "POST",
                        body: {username: req.username, password: req.password},
                    };
            },

        }),

    }),
})

export const { useLoginMutation} = authenticationApiSlice