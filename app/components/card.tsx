import React from "react";

export default function Card({children} : {children: React.ReactNode}) {
    return (
        <div className="bg-white overflow-hidden sm:rounded-lg py-6 px-4 sm:px-6 lg:px-8">
            {children}
        </div>
    );
}