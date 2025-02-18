import React, {useEffect} from "react";
import Card from "~/components/card";
import Input from "~/components/input";
import Button from "~/components/button";
import type {PriceUpload} from "~/features/prices/pricesApiSlice";

interface PricesFormProps {
    onSubmit: (price: PriceUpload) => void;
    isLoading: boolean;
    isSuccess: boolean;
    onSuccess: () => void;
    title: string;
    error?: any;
    initialData?: PriceUpload;
}

export default function PricesForm({onSubmit, isLoading, isSuccess, onSuccess, title, error, initialData}: PricesFormProps) {
    const [errorMessage, setErrorMessage] = React.useState<string>("");

    useEffect(() => {
        if( isSuccess ) {
            onSuccess();
        } else if (error) {
            setErrorMessage(error.data.message);
        }
    }, [isLoading]);

    function submit(e : React.FormEvent) {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        onSubmit({
            name: formData.get("name") as string,
            coins: parseInt(formData.get("coins") as string),
        });
    }

    return (
        <div>
            <Card title={title}>
                <form onSubmit={submit}>
                    <div className="grid sm:grid-cols-2 gap-4 mb-8">
                        <Input required id="name" name="name" label="Name" defaultValue={initialData?.name} />
                        <Input required id="coins" name="coins" label="Price" type="number" defaultValue={initialData?.coins?.toString()} />
                    </div>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create"}
                    </Button>
                </form>
                {errorMessage && <div className="text-red-600">{errorMessage}</div>}
            </Card>
        </div>
    );
}