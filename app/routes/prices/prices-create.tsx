import {useCreatePriceMutation} from "~/features/prices/pricesApiSlice";
import React from "react";
import type {Route} from "./+types/prices-create";
import PricesForm from "~/routes/prices/prices-form";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Create Price"},
    ];
}

export default function PricesCreate() {

    const [createPrice, {isLoading: isCreateLoading, isSuccess: isCreateSuccess, error}] = useCreatePriceMutation();

    return (
        <div>
            <PricesForm
                onSubmit={createPrice}
                isLoading={isCreateLoading}
                isSuccess={isCreateSuccess}
                onSuccess={() => window.location.href = "/prices"}
                title="Create Price"
                error={error}
            />
        </div>
    );
}