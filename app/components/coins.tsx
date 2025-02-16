import Button from "~/components/button";
import {useAddCoinsMutation, useRemoveCoinsMutation} from "~/features/users/usersApiSlice";
import React, {useEffect} from "react";
import Modal from "~/components/modal";
import {MinusIcon, PlusIcon} from "@heroicons/react/24/solid";
import Input from "~/components/input";

interface CoinsButtonProps {
    mode: "add" | "remove";
    username: string;
    onFinished?: () => void;
}

export default function CoinsButton({mode, username, onFinished} : CoinsButtonProps) {
    const [addCoins, {isLoading: isAddLoading, isSuccess: isAddSuccess, error: addError}] = useAddCoinsMutation();
    const [removeCoins, {isLoading: isRemoveLoading, isSuccess: isRemoveSuccess, error: removeError }] = useRemoveCoinsMutation();

    const [open, setOpen] = React.useState(false);
    const [coins, setCoins] = React.useState(0);

    const text = mode === "add" ? "Add coins to" : "Remove coins from";
    const verb = mode === "add" ? "Add" : "Remove";

    const [errorMessage, setErrorMessage] = React.useState("");

    function submit(e : React.FormEvent) {
        e.preventDefault();

        if (mode === "add") {
            addCoins({username, coins});
        } else {
            removeCoins({username, coins});
        }
    }


    useEffect(() => {
        const isSuccess = mode === "add" ? isAddSuccess && !isAddLoading : isRemoveSuccess && !isRemoveLoading;
        const error = mode === "add" ? addError : removeError;

        if (isSuccess) {
            setOpen(false);

            if (onFinished) {
                onFinished();
            }
        }

        if (error) {
            // @ts-ignore
            setErrorMessage(error.data.message);
        }
    }, [isAddLoading, isRemoveLoading]);

    return (
        <div>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title={`${text} ${username}`}
                footer={(
                    <div className="w-full flex items-center justify-between space-x-2">
                        <Button
                            form={`${username}-${mode}-form`}
                            type="submit"
                            disabled={isAddLoading || isRemoveLoading}
                            color={mode === "add" ? 'heavy-green' : 'heavy-red'}
                        >
                            {(isAddLoading || isRemoveLoading) ? "Loading..." : verb}
                        </Button>
                        <Button type="button" onClick={() => setOpen(false)} color="gray">Cancel</Button>
                    </div>
                )}
            >
                <form id={`${username}-${mode}-form`} onSubmit={submit}>
                    <div className="text-start">
                        <Input
                            value={coins.toString()}
                            onChange={e => setCoins(parseInt(e.target.value))}
                            id={`${username}-${mode}-coins`}
                            type="number"
                            label="Coins"
                        />
                    </div>

                    {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}
                </form>
            </Modal>
            <Button
                type="button"
                color={mode === "add" ? "green" : "red"}
                onClick={() => setOpen(true)}
            >
                {mode === "add" ? <PlusIcon className="w-6 h-6" /> : <MinusIcon className="w-6 h-6" />}
            </Button>
        </div>
    );
}