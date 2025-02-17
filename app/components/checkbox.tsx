import React from "react";

interface CheckboxProps {
    id: string;
    label: string;
    name?: string;
    defaultChecked?: boolean;
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string|number|string[];
}

export default function Checkbox(props: CheckboxProps) {
    return (
        <div className="flex h-6 shrink-0 items-center gap-2">
            {/* Checkbox Input */}
            <div className="group grid size-4 grid-cols-1">
                <input
                    defaultChecked={props.defaultChecked}
                    id={props.id}
                    name={props.name}
                    checked={props.checked}
                    onChange={props.onChange}
                    value={props.value}
                    type="checkbox"
                    className="col-start-1 row-start-1 appearance-none rounded-sm border
                    border-gray-300 bg-white checked:border-blue-600 checked:bg-blue-600
                    indeterminate:border-blue-600 indeterminate:bg-blue-600 focus-visible:outline-2
                     focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-gray-300
                      disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
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

            {/* Label */}
            <label htmlFor={props.id} className="text-sm font-medium text-gray-700">
                {props.label}
            </label>
        </div>
    );
}