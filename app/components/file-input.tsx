import React from 'react';

import { FilePond, registerPlugin } from 'react-filepond'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import type {
    FetchServerConfigFunction,
    LoadServerConfigFunction,
    ProcessServerConfigFunction, RemoveServerConfigFunction, RestoreServerConfigFunction,
    RevertServerConfigFunction,
    ServerUrl
} from "filepond";


interface FileInputProps {
    id: string;
    name?: string;
    className?: string;
    required?: boolean;
    label?: string;
    accept?: string[];
    multiple?: boolean;
    maxFiles?: number;
    server?: {
        url?: string;
        timeout?: number;
        headers?: { [key: string]: string | boolean | number };
        process?: string | ServerUrl | ProcessServerConfigFunction | null;
        revert?: string | ServerUrl | RevertServerConfigFunction | null;
        restore?: string | ServerUrl | RestoreServerConfigFunction | null;
        load?: string | ServerUrl | LoadServerConfigFunction | null;
        fetch?: string | ServerUrl | FetchServerConfigFunction | null;
        patch?: string | ServerUrl | null;
        remove?: RemoveServerConfigFunction | null;
    } | string;

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
                server={props.server}
                labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
            />
        </div>
    );
}