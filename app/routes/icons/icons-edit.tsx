import {useParams} from "react-router";

export default function IconsCreate() {
    const {name} = useParams();

    return (
        <div>
            <h1>Edit {name}</h1>
        </div>
    );
}