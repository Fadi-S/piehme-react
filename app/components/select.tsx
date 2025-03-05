import React from "react";
import If from "~/components/if";
import {ChevronDownIcon} from "@heroicons/react/16/solid";

interface SelectProps {
    id: string;
    options: {value: string, label: string}[];
    name?: string;
    required?: boolean;
    label?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    placeholder?: string;
    className?: string;
    defaultValue?: string;
}


export default function Select(props: SelectProps) {
    return (
        <div className={props.className}>
            <If condition={!! props.label}>
                <label htmlFor={props.id} className="block text-sm/6 font-medium text-gray-900">
                    {props.label} {props.required && <span>*</span>}
                </label>
            </If>
            <div className="mt-2 grid grid-cols-1">
                <select
                    defaultValue={props.defaultValue}
                    id={props.id}
                    name={props.name}
                    required={props.required}
                    value={props.value}
                    onChange={props.onChange}
                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                >
                    <option>{props.placeholder}</option>
                    {props.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDownIcon
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                />
            </div>
        </div>
    );
}