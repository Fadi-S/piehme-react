import {type Action, type ThunkAction} from "@reduxjs/toolkit"
import { combineSlices, configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
// import { scoreSlice } from "../features/score/scoreSlice"
// import { authenticationApiSlice } from "../features/quizzes/authenticationApiSlice"
import { authenticationApiSlice, authSlice } from "~/features/authentication/authenticationApiSlice";
import { usersApiSlice } from "~/features/users/usersApiSlice";
import {attendanceApiSlice} from "~/features/attendance/attendanceApiSlice";

const rootReducer = combineSlices(
    authenticationApiSlice,
    authSlice,
    usersApiSlice,
    attendanceApiSlice
)
export type RootState = ReturnType<typeof rootReducer>

export const makeStore = (preloadedState?: Partial<RootState>) => {
    const store = configureStore({
        reducer: rootReducer,

        middleware: getDefaultMiddleware => {
            return getDefaultMiddleware()
                .concat(authenticationApiSlice.middleware)
                .concat(usersApiSlice.middleware)
                .concat(attendanceApiSlice.middleware)
        },
        preloadedState
    })
    setupListeners(store.dispatch)
    return store
}

export const store = makeStore()

// Infer the type of `store`
export type AppStore = typeof store
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"]
export type AppThunk<ThunkReturnType = void> = ThunkAction<
    ThunkReturnType,
    RootState,
    unknown,
    Action
>
