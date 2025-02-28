import {useParams} from "react-router";
import {
    useChangeImageMutation,
    useChangePasswordMutation,
    useDeleteUserMutation,
    useGetUserQuery
} from "~/features/users/usersApiSlice";
import Loading from "~/components/loading";
import Card from "~/components/card";
import React, {useEffect, useState} from "react";
import CoinsButton from "~/components/coins";
import Input from "~/components/input";
import Button from "~/components/button";
import {Table, Td, Th} from "~/components/table";
import {createEmptyPagination} from "~/types/pagination";
import If from "~/components/if";
import {CheckCircleIcon} from "@heroicons/react/24/outline";
import {useApproveAttendanceMutation, useDeleteAttendanceMutation, type Attendance} from "~/features/attendance/attendanceApiSlice";
import {formatDate} from "~/base/helpers";
import Modal from "~/components/modal";
import FileInput from "~/components/file-input";
import type {Route} from "./+types/home";
import {useDeleteIconMutation} from "~/features/icons/iconsApiSlice";
import DeleteButton from "~/components/delete-button";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "View User"},
    ];
}

export default function ShowUser() {
    const {username} = useParams<{ username: string }>();

    // @ts-ignore
    const {data: user, isLoading, refetch} = useGetUserQuery({username});

    const [password, setPassword] = React.useState("");
    const [changePassword, {isLoading: isPasswordLoading, isSuccess:isPasswordSuccess, error}] = useChangePasswordMutation();
    const [changePasswordMessage, setMessage] = React.useState({message: "", success: false});

    const [approveAttendance, {isLoading: isApproveLoading, isSuccess: isApprovedSuccess}] = useApproveAttendanceMutation();
    const [deleteAttendance, {isLoading: isDeleteLoading, isSuccess: isDeleteSuccess}] = useDeleteAttendanceMutation();

    const [changeImage, {isLoading: isImageLoading, isSuccess: isImageSuccess}] = useChangeImageMutation();
    const [openChangeImage, setChangeImage] = React.useState(false);
    const [image, setImage] = useState<File | null>(null);

    function submitChangeImage(e: React.FormEvent) {
        e.preventDefault();

        // @ts-ignore
        changeImage({username, image});
    }

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


    useEffect(() => {
        if(isImageSuccess) {
            setChangeImage(false);
            setImage(null);
            refetch();
        }
    }, [isImageLoading]);

    useEffect(() => {
        if (isApprovedSuccess || isDeleteSuccess) refetch();
    }, [isApproveLoading, isDeleteLoading]);

    if (isLoading || !user) {
        return <Loading/>;
    }

    return (
        <div className="space-y-8">
            <Card>
                <div className="flex items-center justify-end">
                    <DeleteButton
                        className="border border-red-600 hover:bg-red-100 rounded px-2 py-1.5"
                        useDeleteMutation={useDeleteUserMutation}
                        onDelete={() => window.location.href = "/"}
                        itemKey="username"
                        itemValue={user.username}
                    />
                </div>

                <div className="px-4 sm:px-0">
                    <h3 className="text-base/7 font-semibold text-gray-900">User Information</h3>
                </div>
                <div className="mt-6 border-t border-gray-100">
                    <dl className="divide-y divide-gray-100">
                        <Detail title="">
                            <div className="flex items-start justify-start space-x-6">
                                <img src={user.imageUrl} alt={`${user.username}'s image`} className="w-32" />

                                <Button onClick={() => setChangeImage(true)} color="gray" width="w-auto mt-3">
                                    Change Image
                                </Button>
                            </div>

                            <Modal open={openChangeImage} onClose={() => setChangeImage(false)}
                                   title="Change Image for User"
                                   footer={(
                                       <Button type="submit" form="change-picture-form" disabled={isImageLoading}>
                                             {isImageLoading ? "Loading..." : "Save"}
                                       </Button>
                                   )}
                            >
                                <form onSubmit={submitChangeImage} id="change-picture-form" encType="multipart/form-data">
                                    <FileInput id="change" files={image ? [image] : []} onChange={(files) => setImage(files[0].file)} />
                                </form>

                            </Modal>
                        </Detail>

                        <Detail title="Username" value={user.username} />

                        <Detail title="Coins" value={`$${user.coins}`} />
                        <Detail title="Rating" value={`${user.lineupRating}`} />

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

            <Card title="Attendance">
                <Table
                    header={(
                        <tr>
                            <Th first>Description</Th>
                            <Th>Date</Th>
                            <Th>Coins</Th>
                            <Th>Approved</Th>
                            <Th>Delete</Th>
                        </tr>
                    )}
                    body={(attendance : Attendance) => (
                        <tr key={attendance.id + "-" + (attendance.approved ? "1" : "0")}>
                            <Td first>{attendance.description}</Td>
                            <Td>{formatDate(attendance.createdAt)}</Td>
                            <Td>${attendance.coins}</Td>
                            <Td>
                                <If
                                    condition={! attendance.approved}
                                    replacement={(
                                        <div className="flex items-center">
                                        <div className="flex items-center space-x-1 bg-green-800 text-green-100 rounded-md px-3 py-1.5 text-sm/6">
                                            <span>Approved</span>
                                            <CheckCircleIcon className="w-6 h-6" />
                                        </div>
                                        </div>
                                    )}
                                >
                                    <Button width="w-auto" color="green" onClick={() => approveAttendance({attendanceId: attendance.id, username: user.username})}>
                                        Approve
                                    </Button>
                                </If>
                            </Td>

                            <Td>
                                <Button width="w-auto" color="red" onClick={() => deleteAttendance({attendanceId: attendance.id, username: user.username})}>
                                    Delete
                                </Button>
                            </Td>
                        </tr>
                    )}
                    pagination={createEmptyPagination(user.attendances!)}
                />
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