import React from "react";
import type {Route} from "./+types/players-create";
import PlayersForm from "~/routes/players/players-form";
import {useCreatePlayerMutation} from "~/features/players/playersApiSlice";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Create Player"},
    ];
}

export default function PlayersCreate() {

    const [createPlayer, {isLoading, isSuccess, error}] = useCreatePlayerMutation();

    return (
        <div>
            <PlayersForm
                onSubmit={createPlayer}
                isLoading={isLoading}
                isSuccess={isSuccess}
                onSuccess={() => window.location.href = "/players"}
                title="Create Player"
                error={error}
            />
        </div>
    );
}