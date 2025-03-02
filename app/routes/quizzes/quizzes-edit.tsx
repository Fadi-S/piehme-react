import {
    useGetQuizQuery,
    useUpdateQuizMutation
} from "~/features/quizzes/quizzesApiSlice";
import React from "react";
import type {Route} from "./+types/quizzes-edit";
import QuizzesForm, {type QuizForm} from "~/routes/quizzes/quizzes-form";
import {useParams} from "react-router";
import Loading from "~/components/loading";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Edit Quiz"},
    ];
}

export default function QuizzesEdit() {
    const slug :string = useParams().slug ?? "0";

    const {data: quiz, isLoading: isQuizLoading} = useGetQuizQuery(slug);
    const [updateQuiz, {isLoading, isSuccess, error}] = useUpdateQuizMutation();

    const [showSuccess, setSuccess] = React.useState<boolean>(false);

    if (isQuizLoading || !quiz) {
        return <Loading />;
    }

    const initial : QuizForm = {
        id: quiz.id,
        name: quiz.name,
        published_at: quiz.publishedAt.toISOString(),
        questions: quiz.questions.map((question) => {
            return {
                title: question.title,
                points: question.coins,
                correct_answers: question.answers,
                type: question.type,
                options: question.options.map((option) => {
                    return {
                        id: option.id,
                        name: option.name,
                        order: option.order,
                    };
                }),
            };
        }),
    };

    return (
        <div>
            <QuizzesForm
                onSubmit={(quizData) => updateQuiz({data:quizData, quizId: quiz.id})}
                isLoading={isLoading}
                isSuccess={isSuccess}
                onSuccess={() => setSuccess(true)}
                title="Update Quiz"
                error={error}
                initialData={initial}
            />

            {showSuccess && (
                <div className="mt-4 text-green-700">
                    Quiz updated successfully!
                </div>
            )}
        </div>
    );
}