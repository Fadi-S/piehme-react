import {useCreateIconMutation} from "~/features/icons/iconsApiSlice";
import React from "react";
import type {Route} from "./+types/icons-create";
import IconsForm from "~/routes/icons/icons-form";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Create Icon"},
    ];
}

export default function IconsCreate() {

    const [createIcon, {isLoading: isCreateLoading, isSuccess: isCreateSuccess, error}] = useCreateIconMutation();

    return (
        <div>
            <IconsForm
                onSubmit={createIcon}
                isLoading={isCreateLoading}
                isSuccess={isCreateSuccess}
                onSuccess={() => window.location.href = "/icons"}
                title="Create Icon"
                error={error}
            />
        </div>
    );
}