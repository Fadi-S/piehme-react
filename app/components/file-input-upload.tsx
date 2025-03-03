import FileInput from "~/components/file-input";
import React from "react";

interface FileInputUploadProps {
    id: string;
    name?: string;
    picture?: string;
    uploadUrl: string;
    onUpload: (path: string, url: string) => void;
    onDelete: () => void;
}

export default function FileInputUpload(props: FileInputUploadProps) {
    return (
        <div>
            <FileInput
                id={props.id}
                files={props.picture ? [
                    {
                        source: props.picture,
                        options: {
                            type: 'local',
                            metadata: {
                                poster: props.picture,
                            }
                        }
                    }
                ] : []}
                server={{
                    process: {
                        url: props.uploadUrl,
                        method: 'POST',
                        onload: (response) => {
                            const data = JSON.parse(response);
                            props.onUpload(data.path, data.url);
                            return data.url;
                        },
                        onerror: (error) => {
                            console.error('Upload error:', error);
                            return error.body;
                        }
                    },
                    revert: (uniqueFileId, load) => {
                        props.onDelete();
                        load();
                    },
                    load: (source, load) => {
                        fetch(source)
                            .then(response => response.blob())
                            .then(load);
                    }
                }}
                name="file"
                accept={["image/*"]}
                onChange={(files) => {
                    if (files.length === 0) {
                        props.onDelete();
                    }
                }}
            />
            <input
                type="hidden"
                name={props.name}
                value={props.picture || ""}
            />
        </div>
    )
}