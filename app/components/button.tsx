import {Outlet} from "react-router";
import React from "react";

interface ButtonProps {
    type?: 'button' | 'submit' | 'reset';
    children?: React.ReactNode;
}

const defaultProps: ButtonProps = {
    type: 'button',
}

export default function Button(props: ButtonProps) {

    props = {...defaultProps, ...props};

    return (
        <button
            type={props.type}
            className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
            {props.children}
        </button>
    );
}