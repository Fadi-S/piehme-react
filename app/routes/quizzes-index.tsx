import {useSearchParams} from "react-router";
import React, {useEffect} from "react";

export default function QuizzesIndex() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get("page") ?? "1");

    useEffect(() => {
        console.log(searchParams.get("search"));
    }, []);

    return (
        <div>

        </div>
    );
}