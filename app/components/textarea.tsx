import React from "react";
import If from "~/components/if";

interface TextAreaProps {
    id: string;
    name?: string;
    required?: boolean;
    label?: string;
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    placeholder?: string;
    className?: string;
    defaultValue?: string;
    rows?: number;
}

const defaultProps: TextAreaProps = {
    id: 'input-' + Math.random().toString(36).substring(7),
    rows: 3,
}


export default function Textarea(props: TextAreaProps) {
    props = {...defaultProps, ...props};

    return (
        <div className={props.className}>
            <If condition={!! props.label}>
                <label htmlFor={props.id} className="block text-sm/6 font-medium text-gray-900">
                    {props.label}
                </label>
            </If>
            <div className="mt-2">
                <textarea
                    defaultValue={props.defaultValue}
                    placeholder={props.placeholder}
                    id={props.id}
                    name={props.name}
                    required={props.required}
                    value={props.value}
                    onChange={props.onChange}
                    rows={props.rows}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                >
                    {props.value}
                </textarea>
            </div>
        </div>
    );
}