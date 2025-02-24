import React, {useEffect} from "react";
import Card from "~/components/card";
import Input from "~/components/input";
import Button from "~/components/button";
import {type AdminForm, Role, type SchoolYear, useGetAllSchoolYearsQuery} from "~/features/admins/adminsApiSlice";
import Select from "~/components/select";
import Loading from "~/components/loading";

interface AdminsFormProps {
    onSubmit: (admin: AdminForm) => void;
    isLoading: boolean;
    isSuccess: boolean;
    onSuccess: () => void;
    title: string;
    error?: any;
    initialData?: AdminForm;
}

export default function AdminsForm({onSubmit, isLoading, isSuccess, onSuccess, title, error, initialData}: AdminsFormProps) {
    const [errorMessage, setErrorMessage] = React.useState<string>("");

    const {data: schoolYears, isLoading: isSchoolYearsLoading} = useGetAllSchoolYearsQuery();


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
            username: formData.get("username") as string,
            role: formData.get("role") === Role.ADMIN ? Role.ADMIN : Role.OSTAZ,
            password: formData.get("password") as string,
            schoolYear: parseInt(formData.get("schoolYear") as string),
        });
    }

    if(isSchoolYearsLoading || !schoolYears) {
        return <Loading />;
    }

    const schoolYearsOptions =
        schoolYears.map((sy) => ({value: sy.id.toString(), label: sy.name}));

    return (
        <div>
            <Card title={title}>
                <form onSubmit={submit} encType="multipart/form-data">
                    <div className="grid sm:grid-cols-2 gap-4 mb-8">
                        <Input required id="username" name="username" label="Username" defaultValue={initialData?.username} />

                        <Select id="role" name="role" placeholder="-- Choose Role --" options={[
                            {value: Role.ADMIN, label: "Admin"},
                            {value: Role.OSTAZ, label: "Ostaz"},
                        ]} label="Role" defaultValue={initialData?.role} />

                        <Select id="schoolYear"
                                name="schoolYear"
                                placeholder="-- Choose Osra --"
                                options={schoolYearsOptions}
                                label="Osra"
                                defaultValue={initialData?.schoolYear?.toString()}
                        />

                        <Input
                            id="password"
                            name="password"
                            label="Password"
                            type="password"
                        />
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