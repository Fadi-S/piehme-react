import React from "react";

interface ButtonProps {
    type?: 'button' | 'submit' | 'reset';
    children?: React.ReactNode;
    disabled?: boolean;
    color?: 'primary' | 'red' | 'green' | 'yellow' | 'gray' | 'heavy-green' | 'heavy-red' | 'light-blue';
    onClick?: () => void;
    width?: string;
    form?: string;
    className?: string;
    padding?: string;
    unsavedChanges?: boolean;
}

const defaultProps: ButtonProps = {
    type: 'button',
    disabled: false,
    color: 'primary',
    width: 'w-full',
    padding: 'px-3 py-1.5',
}

export default function Button(props: ButtonProps) {

    props = {...defaultProps, ...props};

    const colorClass = {
        'primary': 'bg-blue-600 hover:bg-blue-500 focus-visible:outline-blue-600 text-white',
        'red': 'bg-red-200 hover:bg-red-300 focus-visible:outline-red-200 text-red-900',
        'green': 'bg-green-200 hover:bg-green-300 focus-visible:outline-green-200 text-green-900',
        'yellow': 'bg-yellow-600 hover:bg-yellow-500 focus-visible:outline-yellow-600 text-white',
        'gray': 'bg-gray-200 hover:bg-gray-300 focus-visible:outline-gray-200 text-gray-800',

        'heavy-green': 'bg-green-600 hover:bg-green-700 focus-visible:outline-green-600 text-white',
        'heavy-red': 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-600 text-white',

        'light-blue': 'bg-blue-200 hover:bg-blue-300 focus-visible:outline-blue-200 text-blue-900',
    }[props.color!];

    const disabledClass = props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return (
        <button
            form={props.form}
            type={props.type}
            disabled={props.disabled}
            onClick={props.onClick}
            className={"flex justify-center rounded-md text-sm/6 font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 " + colorClass + " " + props.width + " " + disabledClass + " " + props.className + " " + props.padding}
        >
            {props.children} {props.unsavedChanges === true && <span className="text-red-500">*</span>}
        </button>
    );
}