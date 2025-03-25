import {type Option, QuestionType, useGetQuizQuery, useUpdateQuizMutation} from "~/features/quizzes/quizzesApiSlice";
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

    const {data: quiz, isLoading: isQuizLoading} = useGetQuizQuery({slug, withResponses: false});
    const [updateQuiz, {isLoading, isSuccess, error}] = useUpdateQuizMutation();

    if (isQuizLoading || !quiz) {
        return <Loading />;
    }

    function isOptionCorrect(option: Option, qType: QuestionType, answers: number[]|string[]|string): boolean {
        if(qType === QuestionType.Choice || qType === QuestionType.MultipleCorrectChoices) {
            return (answers as number[]).includes(option.order);
        }

        return false;
    }

    const initial : QuizForm = {
        id: quiz.id,
        name: quiz.name,
        published_at: quiz.publishedAt.toISOString(),
        bonusBefore: quiz.bonusBefore?.toISOString(),
        bonus: quiz.bonus,
        questions: !quiz.questions ? [] : quiz.questions.map((question) => {
            return {
                id: question.id,
                title: question.title,
                points: question.coins,
                correct_answers: question.answers,
                picture: question.picture,
                type: question.type,
                options: question.options.map((option) => {
                    return {
                        id: option.id,
                        name: option.name,
                        order: option.order,
                        clientId: Math.random().toString(36).substring(7),
                        correct: isOptionCorrect(option, question.type, question.answers),
                        picture: option.picture,
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
                onSuccess={() => null}
                title="Update Quiz"
                error={error}
                initialData={initial}
            />
        </div>
    );
}