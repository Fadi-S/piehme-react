import type {Route} from "./+types/login";
import Input from "~/components/input";
import Button from "~/components/button";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Login"},
    ];
}

export default function Login() {
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
                        <form action="/login" method="POST" className="space-y-6">
                            <Input
                                id="username"
                                name="username"
                                required={true}
                                label="Username"
                            />

                            <Input
                                id="password"
                                name="password"
                                required={true}
                                label="Password"
                            />

                            <div>
                                <Button type="submit">
                                    Sign In
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

