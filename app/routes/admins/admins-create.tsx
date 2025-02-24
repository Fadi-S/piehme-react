import {useCreateAdminMutation} from "~/features/admins/adminsApiSlice";
import React from "react";
import type {Route} from "./+types/admins-create";
import AdminsForm from "~/routes/admins/admins-form";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Create Admin"},
    ];
}

export default function AdminsCreate() {

    const [createAdmin, {isLoading: isCreateLoading, isSuccess: isCreateSuccess, error}] = useCreateAdminMutation();

    return (
        <div>
            <AdminsForm
                onSubmit={createAdmin}
                isLoading={isCreateLoading}
                isSuccess={isCreateSuccess}
                onSuccess={() => window.location.href = "/admins"}
                title="Create Admin"
                error={error}
            />
        </div>
    );
}