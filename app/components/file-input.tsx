import React from 'react';

interface FileInputProps {
    id: string;
    name?: string;
    className?: string;
    required?: boolean;
    label?: string;
    accept?: string;
    multiple?: boolean;
    onChange?: (file: any) => void;
}

export default function FileInput(props: FileInputProps) {
    const [preview, setPreview] = React.useState("");

    const handleImageChange = (files : FileList) => {
        if(props.onChange) {
            props.onChange(props.multiple ? files : files[0]);
        }

        const file = files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview("");
        }
    };

    return (
        <div className={props.className + " flex items-start justify-start space-x-6"}>
            <div>
                <div className="flex items-center justify-between">
                    <label htmlFor={props.id} className="block text-sm font-medium leading-6 text-gray-900">
                        {props.label}
                    </label>
                </div>
                <div className="relative">
                    <input
                        id={props.id}
                        type="file"
                        name={props.name}
                        accept={props.accept}
                        className={[
                            "block w-full rounded-md border-0 py-2 shadow-sm ring-1 focus:ring-2 focus:ring-inset ring-inset sm:text-sm sm:leading-6",
                            'text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600'
                        ].join(' ')}
                        onChange={({target}) => {
                            if(target.files === null) return;

                            handleImageChange(target.files);
                        }}
                    />
                </div>
            </div>

            <div>
                {preview && (
                    <div className="w-24">
                            <img
                                alt="Preview"
                                className="inset-0 w-full h-full object-cover rounded-lg transform transition-transform
                                        duration-200 group-hover:scale-110"
                                src={preview}
                            />
                    </div>
                )}
            </div>
        </div>
    );
}