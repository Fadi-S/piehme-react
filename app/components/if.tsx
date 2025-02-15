import React from "react";

interface IfProps {
    condition: boolean;
    children: React.ReactNode;
    replacement?: React.ReactNode;
}

export default function If({condition, children, replacement} : IfProps) {
    if (condition) {
        return children;
    }
    return replacement;
}