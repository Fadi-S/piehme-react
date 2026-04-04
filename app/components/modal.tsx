import React from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import If from "~/components/if";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    footer?: React.ReactNode;
    title?: string;
    children?: React.ReactNode;
    panelClassName?: string;
}

export default function Modal({open, onClose, footer, title, children, panelClassName} : ModalProps) {
    return (
        <Dialog open={open} onClose={onClose} className="relative z-30">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            />

            <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
                <div className="flex min-h-full items-start justify-center px-3 py-3 text-center sm:px-6 sm:py-6">
                    <DialogPanel
                        transition
                        className={`relative transform overflow-hidden rounded-lg w-full max-h-[calc(100vh-1.5rem)]
                        bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4
                        data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200
                         data-leave:ease-in sm:w-full sm:max-w-lg sm:p-6 sm:max-h-[calc(100vh-3rem)]
                          data-closed:sm:translate-y-0 data-closed:sm:scale-95 ${panelClassName ?? ""}`}
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
