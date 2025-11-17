import FileInput from "~/components/file-input";
import React, {useState} from "react";

interface FileInputUploadProps {
    id: string;
    name?: string;
    picture?: string;
    uploadUrl: string;
    onUpload: (path: string, url: string) => void;
    onDelete: () => void;
    pictureDisplay?: string;
}

export default function FileInputUpload(props: FileInputUploadProps) {

    const [files, setFiles] = useState(props.pictureDisplay ? [{
        source: props.pictureDisplay,
        options: {
            type: 'local',
            metadata: {
                poster: props.pictureDisplay,
            }
        }
    }] : []);

    const handleUpload = (path: string, url: string) => {
        props.onUpload(path, url);
        setFiles([{
            source: url,
            options: {
                type: 'local',
                metadata: {
                    poster: url,
                }
            }
        }]);
    };


    const handleDelete = () => {
        props.onDelete();
        setFiles([]);
    };

    return (
        <div>
            <FileInput
                id={props.id}
                files={files}
                server={{
                    process: {
                        url: props.uploadUrl,
                        method: 'POST',
                        onload: (response) => {
                            const data = JSON.parse(response);
                            handleUpload(data.path, data.url);
                            return data.url;
                        },
                        onerror: (error) => {
                            console.error('Upload error:', error);
                            return error.body;
                        }
                    },
                    revert: (uniqueFileId, load) => {
                        handleDelete();
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
                        handleDelete();
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