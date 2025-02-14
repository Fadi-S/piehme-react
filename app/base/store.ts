import type { Action, ThunkAction } from "@reduxjs/toolkit"
import { combineSlices, configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
// import { scoreSlice } from "../features/score/scoreSlice"
// import { authenticationApiSlice } from "../features/quizzes/authenticationApiSlice"
import { authenticationApiSlice } from "~/features/authentication/authenticationApiSlice";

const rootReducer = combineSlices(
    authenticationApiSlice
)
export type RootState = ReturnType<typeof rootReducer>

export const makeStore = (preloadedState?: Partial<RootState>) => {
    const store = configureStore({
        reducer: rootReducer,

        middleware: getDefaultMiddleware => {
            return getDefaultMiddleware()
                .concat(authenticationApiSlice.middleware)
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
