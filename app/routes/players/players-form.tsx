import React, {useEffect, useState} from "react";
import Card from "~/components/card";
import Input from "~/components/input";
import Checkbox from "~/components/checkbox";
import Button from "~/components/button";
import FileInput from "~/components/file-input";
import type {PlayerUpload} from "~/features/players/playersApiSlice";
import Select from "~/components/select";

interface PlayersFormProps {
    onSubmit: (player: PlayerUpload) => void;
    isLoading: boolean;
    isSuccess: boolean;
    onSuccess: () => void;
    title: string;
    error?: any;
    initialData?: PlayerUpload;
}

export default function PlayersForm({onSubmit, isLoading, isSuccess, onSuccess, title, error, initialData}: PlayersFormProps) {
    const [image, setImage] = useState<File | null>(initialData?.image ?? null);

    const [errorMessage, setErrorMessage] = React.useState<string>("");

    const positions = ["GK", "LB", "CB", "RB", "CM", "CAM", "LW", "ST", "RW"];

    useEffect(() => {
        if( isSuccess ) {
            onSuccess();
        } else if (error && error.data) {
            setErrorMessage(error.data.message);
        }
    }, [isLoading]);

    function submit(e : React.FormEvent) {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        const clubValue = formData.get("club");
        const leagueValue = formData.get("league");
        const nationalityValue = formData.get("nationality");

        console.log("Form data:", {
            club: clubValue,
            league: leagueValue,
            nationality: nationalityValue
        });

        onSubmit({
            name: (formData.get("name") as string) || "",
            price: parseInt((formData.get("price") as string) || "0"),
            available: formData.get("available") === "1",
            rating: parseInt((formData.get("rating") as string) || "0"),
            position: (formData.get("position") as string) || "",
            club: (clubValue as string) || "",
            league: (leagueValue as string) || "",
            nationality: (nationalityValue as string) || "",
            image: image,
        });
    }

    return (
        <div>
            <Card title={title}>
                <form onSubmit={submit} encType="multipart/form-data">
                    <div className="grid sm:grid-cols-2 gap-4 mb-8">
                        <Input required id="name" name="name" label="Name" defaultValue={initialData?.name} />
                        <Input required id="price" name="price" label="Price" type="number" defaultValue={initialData?.price?.toString()} />
                        <Input required id="rating" name="rating" label="Rating" type="number" defaultValue={initialData?.rating?.toString()} />
                        <Select
                            required
                            id="position"
                            name="position"
                            label="Position"
                            placeholder="-- Choose Position --"
                            defaultValue={initialData?.position}
                            options={positions.map((position) => ({value: position, label: position}))}
                        />
                        <Input required id="club" name="club" label="Club" defaultValue={initialData?.club} />
                        <Input required id="league" name="league" label="League" defaultValue={initialData?.league} />
                        <Input required id="nationality" name="nationality" label="Nationality" defaultValue={initialData?.nationality} />
                        <Checkbox id="available" name="available" label="Available" value={1} defaultChecked={initialData?.available} />

                        <FileInput
                            id="image"
                            name="image"
                            accept={["image/*"]}
                            files={image ? [image] : []}
                            onChange={(files) => setImage(files[0].file)}
                        />
                    </div>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save"}
                    </Button>
                </form>
                {errorMessage && <div className="text-red-600">{errorMessage}</div>}
            </Card>
        </div>
    );
}