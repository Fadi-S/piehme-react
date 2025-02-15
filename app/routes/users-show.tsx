import {useParams} from "react-router";
import {useChangePasswordMutation, useGetUserQuery} from "~/features/users/usersApiSlice";
import Loading from "~/components/loading";
import Card from "~/components/card";
import React, {useEffect} from "react";
import CoinsButton from "~/components/coins";
import Input from "~/components/input";
import Button from "~/components/button";

export default function ShowUser() {
    const {username} = useParams<{ username: string }>();

    // @ts-ignore
    const {data: user, isLoading, refetch} = useGetUserQuery({username});

    const [password, setPassword] = React.useState("");
    const [changePassword, {isLoading: isPasswordLoading, isSuccess:isPasswordSuccess, error}] = useChangePasswordMutation();
    const [changePasswordMessage, setMessage] = React.useState({message: "", success: false});

    function submitChangePassword(e: React.FormEvent) {
        e.preventDefault();

        // @ts-ignore
        changePassword({username, password});
    }

    useEffect(() => {
        if(isPasswordSuccess) {
            setMessage({message: "Password changed successfully", success: true});

            setPassword("");
        } else if(error) {
            // @ts-ignore
            setMessage({message: error!.data.message, success: false});
        }

        setTimeout(() => setMessage({message: "", success: false}), 5000);
    }, [isPasswordLoading]);

    if (isLoading || !user) {
        return <Loading/>;
    }

    return (
        <div>
            <Card>
                <div className="px-4 sm:px-0">
                    <h3 className="text-base/7 font-semibold text-gray-900">User Information</h3>
                </div>
                <div className="mt-6 border-t border-gray-100">
                    <dl className="divide-y divide-gray-100">
                        <Detail title="">
                            <img src={user.imgLink} alt={`${user.username}'s image`} />
                        </Detail>

                        <Detail title="Username" value={user.username} />

                        <Detail title="Coins" value={`$${user.coins}`} />

                        <Detail title="Actions">
                            <div className="flex space-x-4">
                                <CoinsButton mode="add" username={user.username} onFinished={refetch} />
                                <CoinsButton mode="remove" username={user.username} onFinished={refetch} />
                            </div>
                        </Detail>

                        <Detail title="Change Password">
                            <form onSubmit={submitChangePassword} className="space-y-3">
                                <Input
                                    id="password"
                                    placeholder="New Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />

                                <div className="flex items-start">
                                    <Button disabled={isPasswordLoading} type="submit" width="w-full sm:w-auto">
                                        {isPasswordLoading ? "Loading..." : "Change Password"}
                                    </Button>
                                </div>
                            </form>

                            {changePasswordMessage.message && (
                                <div className={`mt-3 text-sm/6 ${changePasswordMessage.success ? "text-green-600" : "text-red-600"}`}>
                                    {changePasswordMessage.message}
                                </div>
                            )}
                        </Detail>
                    </dl>
                </div>
            </Card>
        </div>
    );
}

function Detail({title, value, children} : {title: string, value?: string, children?: React.ReactNode}) {
    return (
        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">{title}</dt>
            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {children === undefined ? value : children}
            </dd>
        </div>
    );

}