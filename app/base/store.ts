import {type Action, type ThunkAction} from "@reduxjs/toolkit"
import { combineSlices, configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { authenticationApiSlice, authSlice } from "~/features/authentication/authenticationApiSlice";
import { usersApiSlice } from "~/features/users/usersApiSlice";
import {attendanceApiSlice} from "~/features/attendance/attendanceApiSlice";
import {controlsApiSlice} from "~/features/controls/controlsApiSlice";
import {iconsApiSlice} from "~/features/icons/iconsApiSlice";
import {playersApiSlice} from "~/features/players/playersApiSlice";
import {pricesApiSlice} from "~/features/prices/pricesApiSlice";
import {adminsApiSlice} from "~/features/admins/adminsApiSlice";
import {userGuestApiSlice} from "~/features/users/userGuestApiSlice";
import {quizzesApiSlice} from "~/features/quizzes/quizzesApiSlice";

const rootReducer = combineSlices(
    authenticationApiSlice,
    authSlice,
    usersApiSlice,
    attendanceApiSlice,
    controlsApiSlice,
    iconsApiSlice,
    playersApiSlice,
    pricesApiSlice,
    adminsApiSlice,
    userGuestApiSlice,
    quizzesApiSlice
)
export type RootState = ReturnType<typeof rootReducer>

export const makeStore = (preloadedState?: Partial<RootState>) => {
    const store = configureStore({
        reducer: rootReducer,

        middleware: getDefaultMiddleware => {
            return getDefaultMiddleware({
                serializableCheck: false
            })
                .concat(authenticationApiSlice.middleware)
                .concat(usersApiSlice.middleware)
                .concat(userGuestApiSlice.middleware)
                .concat(attendanceApiSlice.middleware)
                .concat(controlsApiSlice.middleware)
                .concat(iconsApiSlice.middleware)
                .concat(playersApiSlice.middleware)
                .concat(pricesApiSlice.middleware)
                .concat(adminsApiSlice.middleware)
                .concat(quizzesApiSlice.middleware)
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
