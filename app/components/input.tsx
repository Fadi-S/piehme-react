import React from "react";
import If from "~/components/if";

interface InputProps {
    id: string;
    name?: string;
    type?: string;
    required?: boolean;
    autoComplete?: string;
    label?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    defaultValue?: string;
    dir?: string;
    checked?: boolean;
}

const defaultProps: InputProps = {
    type: 'text',
    id: 'input-' + Math.random().toString(36).substring(7),
    dir: 'auto',
}


export default function Input(props: InputProps) {
    props = {...defaultProps, ...props};

    if (props.type === "hidden") {
        return (
            <input
                defaultValue={props.defaultValue}
                id={props.id}
                name={props.name}
                type={props.type}
                value={props.value}
                onChange={props.onChange}
            />
        );
    }

    return (
        <div className={props.className}>
            <If condition={!! props.label}>
                <label htmlFor={props.id} className="block text-sm/6 font-medium text-gray-900">
                    {props.label} {props.required && props.type !== "checkbox" && <span>*</span>}
                </label>
            </If>
            <div className="mt-2">
                <If condition={props.type === "checkbox"}>
                    <div className="flex h-6 shrink-0 items-center">
                        <div className="group grid size-4 grid-cols-1">
                            <input
                                checked={props.checked}
                                dir={props.dir}
                                defaultChecked={props.defaultValue === undefined ? undefined : !!props.defaultValue}
                                id={props.id}
                                name={props.name}
                                type={props.type}
                                value={props.value}
                                onChange={props.onChange}
                                className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white
                        checked:border-blue-600 checked:bg-blue-600 indeterminate:border-blue-600 indeterminate:bg-blue-600
                         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600
                         disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                            />
                            <svg
                                fill="none"
                                viewBox="0 0 14 14"
                                className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                            >
                                <path
                                    d="M3 8L6 11L11 3.5"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="opacity-0 group-has-checked:opacity-100"
                                />
                                <path
                                    d="M3 7H11"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="opacity-0 group-has-indeterminate:opacity-100"
                                />
                            </svg>
                        </div>
                    </div>
                </If>

                <If condition={props.type !== "checkbox"}>
                    <input
                        defaultValue={props.defaultValue}
                        placeholder={props.placeholder}
                        id={props.id}
                        name={props.name}
                        dir={props.dir}
                        type={props.type}
                        required={props.required}
                        autoComplete={props.autoComplete}
                        value={props.value}
                        onChange={props.onChange}
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                    />
                </If>
            </div>
        </div>
    );
}