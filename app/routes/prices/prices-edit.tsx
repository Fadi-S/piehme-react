import {
    type PriceUpload,
    useGetPriceQuery,
    useUpdatePriceMutation
} from "~/features/prices/pricesApiSlice";
import React from "react";
import type {Route} from "./+types/prices-edit";
import PricesForm from "~/routes/prices/prices-form";
import {useParams} from "react-router";
import Loading from "~/components/loading";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Edit Price"},
    ];
}

export default function PricesEdit() {
    const id :number = parseInt(useParams().priceId ?? "0");

    const {data: price, isLoading: isPriceLoading} = useGetPriceQuery({id});
    const [updatePrice, {isLoading, isSuccess, error}] = useUpdatePriceMutation();

    const [showSuccess, setSuccess] = React.useState<boolean>(false);

    if (isPriceLoading || !price) {
        return <Loading />;
    }

    const initial : PriceUpload = {
        name: price.name,
        coins: price.coins,
    };

    return (
        <div>
            <PricesForm
                onSubmit={(price) => updatePrice({price, id})}
                isLoading={isLoading}
                isSuccess={isSuccess}
                onSuccess={() => setSuccess(true)}
                title="Update Price"
                error={error}
                initialData={initial}
            />

            {showSuccess && (
                <div className="mt-4 text-green-700">
                    Price updated successfully!
                </div>
            )}
        </div>
    );
}