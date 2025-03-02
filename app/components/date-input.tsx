import React, {useCallback, useRef} from "react";
import If from "~/components/if";
import flatpickr from "flatpickr";
import 'flatpickr/dist/flatpickr.css';

interface DateInputProps {
    id: string;
    name?: string;
    required?: boolean;
    label?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    defaultValue?: string;
}

const defaultProps: DateInputProps = {
    id: 'input-' + Math.random().toString(36).substring(7),
}


export default function DateInput(props: DateInputProps) {
    props = {...defaultProps, ...props};

    const fp = useRef<flatpickr.Instance>(null);

    const inputRef = useCallback((node: Node | null) => {
        if (node !== null) {
            fp.current = flatpickr(node, {
                enableTime: true,
                dateFormat: "Y-m-d H:i",
                defaultDate: props.defaultValue,
                altInput: true,
                altFormat: "F j, Y h:i K",
            });
        }
    }, []);

    return (
        <div className={props.className}>
            <If condition={!! props.label}>
                <label htmlFor={props.id} className="block text-sm/6 font-medium text-gray-900">
                    {props.label}
                </label>
            </If>
            <div className="mt-2">
                <input
                    ref={inputRef}
                    defaultValue={props.defaultValue}
                    id={props.id}
                    name={props.name}
                    required={props.required}
                    value={props.value}
                    onChange={props.onChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                />
            </div>
        </div>
    );
}