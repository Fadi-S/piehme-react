import React from "react";
import If from "~/components/if";
import {ChevronRightIcon} from "@heroicons/react/20/solid";
import {Transition} from "@headlessui/react";

export default function Card({children, title, className, expandable, expanded} : {
    children: React.ReactNode,
    title?: string,
    className?: string,
    expandable?: boolean,
    expanded?: boolean,
}) {

    const [expand, setExpand] = React.useState<boolean>(expanded ?? true);
    expandable = expandable ?? false;

    return (
        <div className={"bg-white overflow-hidden sm:rounded-lg py-6 px-4 sm:px-6 lg:px-8 " + className}>
            <div className="flex items-center justify-between">
                <If condition={!! title}>
                    <h2 className={"text-xl font-semibold text-gray-900"}>{title}</h2>
                </If>
                <If condition={expandable}>
                    <div></div>
                    <div className="flex justify-end">
                        <button onClick={() => setExpand(!expand)} className="cursor-pointer">
                            <ChevronRightIcon className={"w-7 h-7 transition-transform " + (expand ? " rotate-90" : "")}/>
                        </button>
                    </div>
                </If>
            </div>

            <Transition show={expand}>
                <div className="mt-4 transition duration-300 data-[closed]:opacity-0">
                    {children}
                </div>
            </Transition>
        </div>
    );
}