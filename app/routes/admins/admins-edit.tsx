import {
    type AdminForm,
    useGetAdminQuery,
    useUpdateAdminMutation
} from "~/features/admins/adminsApiSlice";
import React from "react";
import type {Route} from "./+types/admins-edit";
import AdminsForm from "~/routes/admins/admins-form";
import {useParams} from "react-router";
import Loading from "~/components/loading";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Edit Admin"},
    ];
}

export default function AdminsEdit() {
    const id :number = parseInt(useParams().adminId ?? "0");

    const {data: admin, isLoading: isAdminLoading} = useGetAdminQuery({id});
    const [updateAdmin, {isLoading, isSuccess, error}] = useUpdateAdminMutation();

    const [showSuccess, setSuccess] = React.useState<boolean>(false);

    if (isAdminLoading || !admin) {
        return <Loading />;
    }

    const initial : AdminForm = {
        username: admin.username,
        role: admin.role,
        password: "",
    };

    return (
        <div>
            <AdminsForm
                onSubmit={(admin) => updateAdmin({admin, id})}
                isLoading={isLoading}
                isSuccess={isSuccess}
                onSuccess={() => setSuccess(true)}
                title="Update Admin"
                error={error}
                initialData={initial}
            />

            {showSuccess && (
                <div className="mt-4 text-green-700">
                    Admin updated successfully!
                </div>
            )}
        </div>
    );
}