import logo from '~/images/logo.webp';
import React from 'react';

interface LogoProps {
    className?: string;
    onClick?: React.MouseEventHandler<HTMLImageElement>;
}

export default function Logo(props: LogoProps) {
    return (
        <img
            src={logo}
            alt="Cup logo"
            className={props.className || "w-14 h-14"}
            onClick={props.onClick}
        />
    );
}