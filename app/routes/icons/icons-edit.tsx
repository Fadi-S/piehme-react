import {
    type IconUpload,
    useGetIconQuery,
    useUpdateIconMutation
} from "~/features/icons/iconsApiSlice";
import React from "react";
import type {Route} from "./+types/icons-edit";
import IconsForm from "~/routes/icons/icons-form";
import {useParams} from "react-router";
import Loading from "~/components/loading";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Edit Icon"},
    ];
}

export default function IconsEdit() {
    const id :number = parseInt(useParams().iconId ?? "0");

    const {data: icon, isLoading: isIconLoading} = useGetIconQuery({id});
    const [updateIcon, {isLoading, isSuccess, error}] = useUpdateIconMutation();

    const [showSuccess, setSuccess] = React.useState<boolean>(false);

    if (isIconLoading || !icon) {
        return <Loading />;
    }

    const initial : IconUpload = {
        name: icon.name,
        price: icon.price,
        available: icon.available,
        image: null,
    };

    return (
        <div>
            <IconsForm
                onSubmit={(icon) => updateIcon({icon, id})}
                isLoading={isLoading}
                isSuccess={isSuccess}
                onSuccess={() => setSuccess(true)}
                title="Update Icon"
                error={error}
                initialData={initial}
            />

            {showSuccess && (
                <div className="mt-4 text-green-700">
                    Icon updated successfully!
                </div>
            )}
        </div>
    );
}