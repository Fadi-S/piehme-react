import {useCreateIconMutation} from "~/features/icons/iconsApiSlice";
import React from "react";
import type {Route} from "./+types/players-create";
import PlayersForm from "~/routes/players/players-form";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Create Player"},
    ];
}

export default function PlayersCreate() {

    const [createIcon, {isLoading: isCreateLoading, isSuccess: isCreateSuccess, error}] = useCreateIconMutation();

    return (
        <div>
            <PlayersForm
                onSubmit={createIcon}
                isLoading={isCreateLoading}
                isSuccess={isCreateSuccess}
                onSuccess={() => window.location.href = "/players"}
                title="Create Player"
                error={error}
            />
        </div>
    );
}