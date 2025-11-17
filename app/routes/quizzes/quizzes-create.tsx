import {useCreateQuizMutation} from "~/features/quizzes/quizzesApiSlice";
import React from "react";
import type {Route} from "./+types/quizzes-create";
import QuizzesForm from "~/routes/quizzes/quizzes-form";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Create Quiz"},
    ];
}

export default function QuizzesCreate() {
    const [createQuiz, {isLoading: isCreateLoading, isSuccess: isCreateSuccess, error}] = useCreateQuizMutation();

    return (
        <div>
            <QuizzesForm
                onSubmit={createQuiz}
                isLoading={isCreateLoading}
                isSuccess={isCreateSuccess}
                onSuccess={() => window.location.href = "/quizzes"}
                title="Create Quiz"
                error={error}
            />
        </div>
    );
}