import React from 'react';

import { FilePond, registerPlugin } from 'react-filepond'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'


interface FileInputProps {
    id: string;
    name?: string;
    className?: string;
    required?: boolean;
    label?: string;
    accept?: string[];
    multiple?: boolean;
    maxFiles?: number;

    onChange?: (files: any[]) => void;
    files?: any[];
}

export default function FileInput(props: FileInputProps) {
    registerPlugin(FilePondPluginImagePreview);

    return (
        <div>
            <FilePond
                files={props.files}
                onupdatefiles={props.onChange}
                allowMultiple={props.multiple}
                maxFiles={props.maxFiles}
                name={props.name}
                acceptedFileTypes={props.accept}
                labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
            />
        </div>
    );
}