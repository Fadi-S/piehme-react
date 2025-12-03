import type { Route } from "./+types/attendance-create";
import Card from "~/components/card";
import Select from "~/components/select";
import Button from "~/components/button";
import { Table, Td, Th } from "~/components/table";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useGetUsersQuery, type User } from "~/features/users/usersApiSlice";
import { useCreateAttendanceMutation } from "~/features/attendance/attendanceApiSlice";
import { useGetAllPricesQuery, type Price } from "~/features/prices/pricesApiSlice";
import Loading from "~/components/loading";
import Modal from "~/components/modal";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Create Attendance" },
    ];
}

export default function AttendanceCreate() {
    const navigate = useNavigate();
    const [liturgyName, setLiturgyName] = useState("");
    const [date, setDate] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState<{ failedUsers: string[], approvedUsers: string[] } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const { data: usersData, isLoading: isLoadingUsers, isFetching } = useGetUsersQuery({ page: currentPage, search: "" });
    const { data: prices, isLoading: isLoadingPrices } = useGetAllPricesQuery({ page: 1 });
    const [createAttendance, { isLoading: isSubmitting, isSuccess, data: responseData }] = useCreateAttendanceMutation();

    const today = new Date().toISOString().split('T')[0];

    // Accumulate users from pagination
    useEffect(() => {
        if (usersData?.data) {
            setAllUsers(prev => {
                const existingIds = new Set(prev.map(u => u.id));
                const newUsers = usersData.data.filter((u: User) => !existingIds.has(u.id));
                return [...prev, ...newUsers];
            });
            if (usersData.totalElements) {
                setTotalUsers(usersData.totalElements);
            }
        }
    }, [usersData]);

    useEffect(() => {
        if (isSuccess && responseData) {
            setModalContent(responseData);
            setShowModal(true);
        }
    }, [isSuccess, responseData]);

    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        const container = tableContainerRef.current;
        if (!container || isFetching) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const hasMore = allUsers.length < totalUsers;

        if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore) {
            setCurrentPage(prev => prev + 1);
        }
    }, [isFetching, allUsers.length, totalUsers]);

    useEffect(() => {
        const container = tableContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    function handleUserToggle(userId: number) {
        setSelectedUserIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    }

    function handleSelectAll() {
        if (allUsers.length > 0) {
            if (selectedUserIds.size === allUsers.length) {
                setSelectedUserIds(new Set());
            } else {
                setSelectedUserIds(new Set(allUsers.map(user => user.id)));
            }
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!liturgyName || !date || selectedUserIds.size === 0) {
            alert("Please fill in all fields and select at least one user");
            return;
        }

        createAttendance({
            date,
            liturgyName,
            userIds: Array.from(selectedUserIds),
        });
    }

    function handleCloseModal() {
        setShowModal(false);
        setModalContent(null);
        setLiturgyName("");
        setDate("");
        setSelectedUserIds(new Set());
        navigate("/attendance");
    }

    if ((isLoadingUsers && currentPage === 1) || isLoadingPrices || !prices) {
        return <Loading />;
    }

    return (
        <div>
            <Card title="Create Attendance Record">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Select
                            required
                            id="liturgyName"
                            name="liturgyName"
                            label="Liturgy Name"
                            placeholder="-- Choose Liturgy --"
                            value={liturgyName}
                            onChange={(e) => setLiturgyName(e.target.value)}
                            options={prices.data
                                .filter((price: Price) => price.name !== "Rating Price")
                                .map((price: Price) => ({ value: price.name, label: price.name }))}
                        />

                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                Date
                            </label>
                            <input
                                required
                                type="date"
                                id="date"
                                name="date"
                                max={today}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Select Users ({selectedUserIds.size} of {totalUsers} selected)
                            </h3>
                            <Button
                                type="button"
                                color="gray"
                                onClick={handleSelectAll}
                                className="w-auto px-4"
                            >
                                {selectedUserIds.size === allUsers.length ? "Deselect All" : "Select All"}
                            </Button>
                        </div>

                        <div 
                            ref={tableContainerRef}
                            className="border rounded-lg overflow-auto max-h-96"
                        >
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <Th first>
                                            <input
                                                type="checkbox"
                                                checked={selectedUserIds.size === allUsers.length && allUsers.length > 0}
                                                onChange={handleSelectAll}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </Th>
                                        <Th>ID</Th>
                                        <Th>Name</Th>
                                        <Th last>Current Coins</Th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {allUsers.map((user: User) => (
                                        <tr
                                            key={user.id}
                                            onClick={() => handleUserToggle(user.id)}
                                            className={`cursor-pointer hover:bg-gray-50 ${
                                                selectedUserIds.has(user.id) ? "bg-blue-50" : ""
                                            }`}
                                        >
                                            <Td first>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUserIds.has(user.id)}
                                                    onChange={() => handleUserToggle(user.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </Td>
                                            <Td>{user.id}</Td>
                                            <Td>
                                                <div className="flex items-center justify-center">
                                                    <div className="size-10 shrink-0">
                                                        <img
                                                            alt=""
                                                            src={user.imageUrl}
                                                            className="size-10 rounded-full"
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-gray-900">
                                                            {user.username}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Td>
                                            <Td last className="text-gray-700 font-semibold">
                                                ${user.coins}
                                            </Td>
                                        </tr>
                                    ))}
                                    {isFetching && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-4 text-gray-500">
                                                Loading more users...
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            color="gray"
                            onClick={() => navigate("/attendance")}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit Attendance"}
                        </Button>
                    </div>
                </form>
            </Card>

            <Modal
                open={showModal}
                onClose={handleCloseModal}
                title="Attendance Submission Result"
                footer={
                    <Button onClick={handleCloseModal}>
                        Close
                    </Button>
                }
            >
                <div className="space-y-4">
                    {modalContent?.approvedUsers && modalContent.approvedUsers.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-semibold text-green-900 mb-2">
                                Unapproved Requests that have been accepted by you:
                            </h4>
                            <ul className="list-disc list-inside text-green-800">
                                {modalContent.approvedUsers.map((username, idx) => (
                                    <li key={idx}>{username}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {modalContent?.failedUsers && modalContent.failedUsers.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-semibold text-red-900 mb-2">
                                Requests that already had been approved:
                            </h4>
                            <ul className="list-disc list-inside text-red-800">
                                {modalContent.failedUsers.map((username, idx) => (
                                    <li key={idx}>{username}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {(!modalContent?.approvedUsers || modalContent.approvedUsers.length === 0) &&
                     (!modalContent?.failedUsers || modalContent.failedUsers.length === 0) && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-900">All attendance records were created successfully!</p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
