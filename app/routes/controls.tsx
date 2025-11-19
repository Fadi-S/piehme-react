import {type Control, useChangeVisibiltyMutation, useGetAllControlsQuery} from "~/features/controls/controlsApiSlice";
import Loading from "~/components/loading";
import Card from "~/components/card";
import {Table, Td, Th} from "~/components/table";
import {createEmptyPagination} from "~/types/pagination";
import Toggle from "~/components/toggle";
import {useEffect} from "react";
import {getFromLocalStorage} from "~/base/helpers";
import If from "~/components/if";
import type {Route} from "./+types/controls";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Controls"},
    ];
}

export default function Controls() {

    const {data: controls, isLoading, refetch} = useGetAllControlsQuery();
    const [changeVisibilty, {isLoading: isVisibilityLoading, isSuccess}] = useChangeVisibiltyMutation();

    const isAdmin = getFromLocalStorage("role") === "ADMIN";

    useEffect(() => {
        if (isSuccess) refetch();
    }, [isVisibilityLoading]);

    if (isLoading || !controls) {
        return <Loading/>
    }

    return (
        <div>
            <Card>
                <Table
                    header={(
                        <tr>
                            <Th first>Name</Th>
                            <If condition={isAdmin}><Th>Role</Th></If>
                            <Th>Visible</Th>
                        </tr>
                    )}
                    body={(control: Control) => (
                        <tr key={control.id}>
                            <Td>
                                <div className="text-gray-800">{control.name}</div>
                            </Td>
                            <If condition={isAdmin}>
                                <Td>
                                    <div className="flex items-center justify-center">
                                        <div
                                            className={"rounded-lg px-2 py-1.5 font-bold " + (control.role === "ADMIN" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800")}>
                                            {control.role.toLowerCase()}
                                        </div>
                                    </div>
                                </Td>
                            </If>
                            <Td>
                                <Toggle
                                    enabled={control.visible}
                                    onChange={(enabled) => {
                                        changeVisibilty({name: control.name, visible: enabled});
                                    }}
                                />
                            </Td>
                        </tr>
                    )}
                    pagination={createEmptyPagination(controls)}
                />
            </Card>
        </div>
    );
}