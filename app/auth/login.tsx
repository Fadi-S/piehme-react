import type {Route} from "./+types/login";
import Input from "~/components/input";
import Button from "~/components/button";
import {useLoginMutation, setUsername as setUsernameReducer, setToken, setUserId} from "~/features/authentication/authenticationApiSlice";
import React, {useEffect} from "react";
import {useAppDispatch} from "~/base/hooks";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Login"},
    ];
}

export default function Login() {

    const [login, {isLoading, isSuccess, isError, error, data}] = useLoginMutation();
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");

    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const dispatch = useAppDispatch();

    function submit(e: React.FormEvent) {
        e.preventDefault();

        login({username, password});
    }

    useEffect(() => {
        if (isSuccess && data) {
            dispatch(setToken(data.jwttoken));
            dispatch(setUsernameReducer(data.username));
            dispatch(setUserId(data.userId));

            setErrorMessage(null);

            window.location.href = "/";
        }
        if(isError && error) {
            // @ts-ignore
            setErrorMessage(error.data?.message);
        }
    }, [isSuccess, isLoading]);

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <img
                        alt="Your Company"
                        src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                        className="mx-auto h-10 w-auto"
                    />
                    <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        Sign in to your account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
                    <div className="bg-white px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
                        <form onSubmit={submit} className="space-y-6">
                            <Input
                                id="username"
                                name="username"
                                required={true}
                                label="Username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />

                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required={true}
                                label="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />

                            <div>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Loading..." : "Sign In"}
                                </Button>
                            </div>

                            {errorMessage && <div className="text-red-600 text-sm/6">{errorMessage}</div>}
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

