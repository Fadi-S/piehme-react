import React from "react";
import If from "~/components/if";

export default function Card({children, title, className} : {children: React.ReactNode, title?: string, className?: string}) {
    return (
        <div className={"bg-white overflow-hidden sm:rounded-lg py-6 px-4 sm:px-6 lg:px-8 " + className}>
            <If condition={!! title}>
                <h3 className="text-base/7 font-semibold text-gray-900 mb-3">{title}</h3>
            </If>

            {children}
        </div>
    );
}