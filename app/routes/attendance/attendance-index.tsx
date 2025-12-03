import type {Route} from "../+types/home";
import Card from "~/components/card";
import {Table, Td, Th} from "~/components/table";
import React, {useEffect} from "react";
import Loading from "~/components/loading";
import {Link, useSearchParams} from "react-router";
import {
    type Attendance,
    useApproveAttendanceMutation, useDeleteAttendanceMutation,
    useGetAttendancesQuery
} from "~/features/attendance/attendanceApiSlice";
import {formatDate, formatDateOnlyString, formatDateString} from "~/base/helpers";
import If from "~/components/if";
import {CheckCircleIcon, TrashIcon} from "@heroicons/react/24/outline";
import Button from "~/components/button";
import { Input } from "node_modules/@headlessui/react/dist/components/input/input";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Attendances"},
    ];
}

export default function AttendanceIndex() {
    const [searchParams, _] = useSearchParams();

    const page = parseInt(searchParams.get("page") ?? "1");

    const {data: attendances, isLoading, refetch} = useGetAttendancesQuery({page});

    const [approveAttendance, {isLoading: isApproveLoading, isSuccess: isApprovedSuccess}] = useApproveAttendanceMutation();
    const [deleteAttendance, {isLoading: isDeleteLoading, isSuccess: isDeleteSuccess}] = useDeleteAttendanceMutation();

    useEffect(() => {
        if (isApprovedSuccess || isDeleteSuccess) refetch();
    }, [isApproveLoading, isDeleteLoading]);

    if (isLoading || !attendances) {
        return <Loading />;
    }

    return (
        <div>
            <Card>
                <div className={"flex items-center justify-end"}>
                    <Link to="/attendance/create"
                            className={"border px-3 py-1.5 rounded-md hover:bg-blue-200 text-blue-600 " +
                                "hover:text-blue-900"}>
                        Add Attendance
                    </Link>
                </div>
                <Table
                    header={(
                        <tr>
                            <Th first>Username</Th>
                            <Th>Description</Th>
                            <Th>Date</Th>
                            <Th>Coins</Th>
                            <Th>Approved</Th>
                            <Th>Delete</Th>
                        </tr>
                    )}
                    body={(attendance : Attendance) => (
                        <tr key={attendance.id + "-" + (attendance.approved ? "1" : "0")}>
                            <Td first>
                                <div className="font-semibold text-gray-900">{attendance.username}</div>
                            </Td>
                            <Td>{attendance.description}</Td>
                            <Td>{formatDateOnlyString(attendance.date)}</Td>
                            <Td>${attendance.coins}</Td>
                            <Td>
                                <If
                                    condition={! attendance.approved}
                                    replacement={(
                                        <div className="flex items-center justify-center">
                                            <div className="flex items-center justify-center space-x-1 bg-green-800 text-green-100 rounded-md px-3 py-1.5 text-sm/6">
                                                <span>Approved</span>
                                                <CheckCircleIcon className="w-6 h-6" />
                                            </div>
                                        </div>
                                    )}
                                >
                                    <div className="flex items-center justify-center">
                                        <Button width="w-auto" color="green" onClick={() => approveAttendance({attendanceId: attendance.id, username: attendance.username!})}>
                                            Approve
                                        </Button>
                                    </div>
                                </If>
                            </Td>

                            <Td>
                                <div  className="flex items-center justify-center">
                                    <Button width="w-auto" color="red" padding="p-2" onClick={() => deleteAttendance({attendanceId: attendance.id, username: attendance.username!})}>
                                        <TrashIcon className="w-5 h-5" />
                                    </Button>
                                </div>
                            </Td>
                        </tr>
                    )}
                    pagination={attendances}
                />
            </Card>
        </div>
    );
}
