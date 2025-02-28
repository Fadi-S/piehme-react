import Button from "~/components/button";
import React, {useEffect, useState} from "react";
import Modal from "~/components/modal";

interface DeleteButtonProps {
    useDeleteMutation: Function;
    onDelete?: Function;
    itemKey: string;
    itemValue: number|string;
    className?: string;
}

export default function DeleteButton(props: DeleteButtonProps) {
    const [ deleteItem, {isLoading, isSuccess} ] = props.useDeleteMutation();

    const [open, setOpen] = useState(false);

    function submitDelete() {
        const state: any = {};
        state[props.itemKey] = props.itemValue;
        deleteItem(state);
    }

    useEffect(() => {
        if(isSuccess) {
            setOpen(false);

            if(props.onDelete)
                props.onDelete();
        }
    }, [isLoading]);

    return (
        <div>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Delete Item"
                footer={(
                    <div className="w-full flex items-center justify-between space-x-2">
                        <Button
                            type="button"
                            disabled={isLoading}
                            color="heavy-red"
                            onClick={submitDelete}
                        >
                            {(isLoading) ? "Deleting..." : "Delete"}
                        </Button>
                        <Button type="button" onClick={() => setOpen(false)}
                                color="gray">
                            Cancel
                        </Button>
                    </div>
                )}
            >
                Are you sure you want to delete this item.
                It will be deleted permanently.
            </Modal>

            <button
                className={"text-red-600 hover:text-red-700 " + props.className}
                type="button"
                onClick={() => setOpen(true)}
            >
                Delete
            </button>
        </div>
    );
}