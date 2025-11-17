import React from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import If from "~/components/if";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    footer?: React.ReactNode;
    title?:String;
    children?: React.ReactNode;
}

export default function Modal({open, onClose, footer, title, children} : ModalProps) {
    return (
        <Dialog open={open} onClose={onClose} className="relative z-30">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            />

            <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
                <div className="flex min-h-full justify-center text-center items-center px-4">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg w-full
                        bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4
                        data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200
                         data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6
                          data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                    >
                        <div>
                            <div>
                                <If condition={!! title}>
                                    <DialogTitle as="h3" className="mb-2 text-base text-center font-semibold text-gray-900">
                                        {title}
                                    </DialogTitle>
                                </If>

                                <div>
                                    {children}
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6">
                            {footer}
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}
