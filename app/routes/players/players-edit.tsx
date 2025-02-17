import React from "react";
import type {Route} from "./+types/players-edit";
import PlayersForm from "~/routes/players/players-form";
import {useParams} from "react-router";
import Loading from "~/components/loading";
import {type PlayerUpload, useGetPlayerQuery, useUpdatePlayerMutation} from "~/features/players/playersApiSlice";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Edit Icon"},
    ];
}

export default function PlayersEdit() {
    const id :number = parseInt(useParams().playerId ?? "0");

    const {data: player, isLoading: isIconLoading} = useGetPlayerQuery({id});
    const [updatePlayer, {isLoading, isSuccess, error}] = useUpdatePlayerMutation();

    const [showSuccess, setSuccess] = React.useState<boolean>(false);

    if (isIconLoading || !player) {
        return <Loading />;
    }

    const initial : PlayerUpload = {
        name: player.name,
        price: player.price,
        available: player.available,
        position: player.position,
        rating: player.rating,
        image: null,
    };

    return (
        <div>
            <PlayersForm
                onSubmit={(player) => updatePlayer({player, id})}
                isLoading={isLoading}
                isSuccess={isSuccess}
                onSuccess={() => setSuccess(true)}
                title="Update Icon"
                error={error}
                initialData={initial}
            />

            {showSuccess && (
                <div className="mt-4 text-green-700">
                    Player updated successfully!
                </div>
            )}
        </div>
    );
}