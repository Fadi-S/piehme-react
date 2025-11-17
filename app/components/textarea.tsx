import React, {useEffect, useRef} from "react";
import If from "~/components/if";

interface TextAreaProps {
    id: string;
    name?: string;
    required?: boolean;
    label?: string;
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    placeholder?: string;
    className?: string;
    defaultValue?: string;
    rows?: number;
    dir?: string;
    maxLength?: number;
}

const defaultProps: TextAreaProps = {
    id: 'input-' + Math.random().toString(36).substring(7),
    rows: 3,
    dir: 'auto',
}


export default function Textarea(props: TextAreaProps) {
    props = {...defaultProps, ...props};

    function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        if(props.maxLength) {
            if(event.target.value.length > props.maxLength) {
                event.target.value = event.target.value.slice(0, props.maxLength);
            }
        }
        props.onChange && props.onChange(event);
    }

    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            // @ts-ignore
            textareaRef.current.rows = props.rows;

            // @ts-ignore
            const scrollHeight = textareaRef.current.scrollHeight;
            const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight);
            // @ts-ignore
            textareaRef.current.rows = Math.max(props.rows!, Math.ceil(scrollHeight / lineHeight));
        }
    }, [props.value, props.rows]);

    return (
        <div className={props.className}>
            <If condition={!! props.label}>
                <label htmlFor={props.id} className="block text-sm/6 font-medium text-gray-900">
                    {props.label} {props.required && <span>*</span>}
                </label>
            </If>
            <div className="mt-2">
                <textarea
                    ref={textareaRef}
                    dir={props.dir}
                    defaultValue={props.defaultValue}
                    placeholder={props.placeholder}
                    id={props.id}
                    name={props.name}
                    required={props.required}
                    value={props.value}
                    onChange={handleChange}
                    rows={props.rows}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                >
                    {props.value}
                </textarea>

                <If condition={props.maxLength !== undefined}>
                    <div className="flex justify-end text-sm/6 text-gray-500">
                        <span>{(props.value ? props.value.length : 0)} / {props.maxLength!}</span>
                    </div>
                </If>
            </div>
        </div>
    );
}