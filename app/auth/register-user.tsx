import type {Route} from "./+types/login";
import Input from "~/components/input";
import Button from "~/components/button";
import {
    useLoginMutation,
    setUsername as setUsernameReducer,
    setToken,
    setUserId,
    setRole
} from "~/features/authentication/authenticationApiSlice";
import React, {useEffect} from "react";
import {useAppDispatch} from "~/base/hooks";
import Logo from "~/components/logo";
import {useGetSchoolYearsQuery, useRegisterMutation} from "~/features/users/userGuestApiSlice";
import Select from "~/components/select";
import Loading from "~/components/loading";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Register to Piehme Cup"},
    ];
}

export default function RegisterUser() {

    const [register, {isLoading, isSuccess, isError, error, data}] = useRegisterMutation();

    const {data: schoolYears, isLoading: isSchoolYearsLoading} = useGetSchoolYearsQuery();

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [schoolYear, setSchoolYear] = React.useState("");

    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [message, setMessage] = React.useState<string | null>(null);

    function submit(e: React.FormEvent) {
        e.preventDefault();

        register({username, password, schoolYear});
    }

    useEffect(() => {
        if (isSuccess && data) {
            setMessage("Account created successfully");
            setPassword("");
            setUsername("");
            setSchoolYear("");
        }
        if(isError && error) {
            // @ts-ignore
            setErrorMessage(error.data?.message);
        }
    }, [isSuccess, isLoading]);

    if(isSchoolYearsLoading || !schoolYears) {
        return <Loading />;
    }

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <Logo className="mx-auto h-10 w-auto" />
                    <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        Create an Account in Piehme Cup
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
                    <div className="bg-white px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
                        <form onSubmit={submit} className="space-y-6">
                            <Input
                                id="username"
                                name="username"
                                required
                                label="Username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />

                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                label="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />

                            <Select
                                id="schoolYear"
                                name="schoolYear"
                                required
                                placeholder="--Select School Year--"
                                label="Osra"
                                options={
                                    schoolYears.map(schoolYear => ({
                                        value: schoolYear.name,
                                        label: schoolYear.name,
                                    }))
                                }
                                onChange={e => setSchoolYear(e.target.value)}
                            />

                            <div>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Loading..." : "Sign In"}
                                </Button>
                            </div>

                            {errorMessage && <div className="text-red-600 text-sm/6">{errorMessage}</div>}
                            {message && <div className="text-green-600 text-sm/6">{message}</div>}
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

