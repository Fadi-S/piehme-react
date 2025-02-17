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
}

const defaultProps: InputProps = {
    type: 'text',
    id: 'input-' + Math.random().toString(36).substring(7),
}


export default function Input(props: InputProps) {
    props = {...defaultProps, ...props};

    return (
        <div className={props.className}>
            <If condition={!! props.label}>
                <label htmlFor={props.id} className="block text-sm/6 font-medium text-gray-900">
                    {props.label}
                </label>
            </If>
            <div className="mt-2">
                <input
                    defaultValue={props.defaultValue}
                    placeholder={props.placeholder}
                    id={props.id}
                    name={props.name}
                    type={props.type}
                    required={props.required}
                    autoComplete={props.autoComplete}
                    value={props.value}
                    onChange={props.onChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                />
            </div>
        </div>
    );
}