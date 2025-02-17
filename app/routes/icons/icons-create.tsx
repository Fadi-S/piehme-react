import {useCreateIconMutation} from "~/features/icons/iconsApiSlice";
import React, {useEffect, useState} from "react";
import Card from "~/components/card";
import Input from "~/components/input";
import Checkbox from "~/components/checkbox";
import Button from "~/components/button";
import FileInput from "~/components/file-input";
import type {Route} from "../../../.react-router/types/app/routes/+types/home";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Create Icon"},
    ];
}

export default function IconsCreate() {

    const [createIcon, {isLoading: isCreateLoading, isSuccess: isCreateSuccess, error}] = useCreateIconMutation();

    const [errorMessage, setErrorMessage] = React.useState<string>("");

    useEffect(() => {
        if( isCreateSuccess ) {
            window.location.href = "/icons";
        } else if (error) {
            // @ts-ignore
            setErrorMessage(error.data.message);
        }
    }, [isCreateLoading]);

    function submit(e : React.FormEvent) {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        createIcon({
            name: formData.get("name") as string,
            price: parseInt(formData.get("price") as string),
            available: formData.get("available") === "1",
            image: formData.get("image") as File,
        });
    }

    return (
        <div>
            <Card title="Create Icon">
                <form onSubmit={submit}>
                    <div className="grid sm:grid-cols-2 gap-4 mb-8">
                        <Input required id="name" name="name" label="Name" />
                        <Input required id="price" name="price" label="Price" type="number" />
                        <Checkbox id="available" name="available" label="Available" value={1} />

                        <FileInput
                            id="image"
                            name="image"
                            label="Image"
                            accept="image/*"
                        />
                    </div>

                    <Button type="submit" disabled={isCreateLoading}>
                        {isCreateLoading ? "Creating..." : "Create"}
                    </Button>
                </form>
                {errorMessage && <div className="text-red-600">{errorMessage}</div>}
            </Card>
        </div>
    );
}