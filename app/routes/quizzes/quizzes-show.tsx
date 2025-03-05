import {
    type Answer,
    type Option, type Question,
    QuestionType,
    useCorrectResponseMutation,
    useGetQuizQuery,
    useUpdateQuizMutation
} from "~/features/quizzes/quizzesApiSlice";
import React, {useEffect} from "react";
import type {Route} from "./+types/quizzes-edit";
import QuizzesForm, {type QuizForm} from "~/routes/quizzes/quizzes-form";
import {useParams} from "react-router";
import Loading from "~/components/loading";
import Card from "~/components/card";
import {CheckCircleIcon, CheckIcon, XCircleIcon, XMarkIcon} from "@heroicons/react/24/outline";
import If from "~/components/if";
import Button from "~/components/button";
import {formatDate} from "~/base/helpers";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Show Quiz"},
    ];
}

export default function QuizzesShow() {
    const slug: string = useParams().slug ?? "0";

    const {data: quiz, isLoading: isQuizLoading, refetch} = useGetQuizQuery({slug, withResponses: true});

    if (isQuizLoading || !quiz) {
        return <Loading/>;
    }

    function showAnswer(answer: Answer, question: Question) {
        if (question.type === QuestionType.Choice) {
            return (
                <div className="flex flex-col space-y-1">
                    {question.options.map((option) => {
                        const isSelected = option.order.toString() === answer.answer.toString();
                        const isCorrect = isSelected && answer.isCorrect;
                        return (
                            <div key={option.id} className="flex justify-between">
                                <span className={isSelected ? "font-bold underline" : ""}>{option.name}</span>
                                <span className={isSelected ? "font-bold" : ""}>
                                    {isCorrect && <CheckCircleIcon className="w-6 h-6 text-green-600"/>}

                                    {isSelected && !isCorrect && <XCircleIcon className="w-6 h-6 text-red-600"/>}
                                </span>
                            </div>
                        );
                    })}
                </div>
            );
        }

        if (question.type === QuestionType.Written) {
            return (
                <div className="flex justify-between">
                    <div className="flex flex-col space-y-1">
                        <span className="font-bold">{answer.answer}</span>
                        <span>{question.options.map((opt) => opt.name).join(", ")}</span>
                    </div>
                    <span>
                        {answer.isCorrect && <CheckCircleIcon className="w-6 h-6 text-green-600"/>}
                        {!answer.isCorrect && <XCircleIcon className="w-6 h-6 text-red-600"/>}
                    </span>
                </div>
            );
        }

        if (question.type === QuestionType.Reorder) {
            let userOrderWithNames: any[] = [];

            if(Array.isArray(answer.answer)) {
                const userOrder = answer.answer as number[];

                userOrderWithNames = userOrder.map((order) => {
                    const option = question.options.find((opt) => opt.order === order);
                    return option ? option.name : `Unknown Option (Order: ${order})`;
                });
            }

            const correctOrderWithNames = question.options
                .map((opt) => opt.name);

            return (
                <div className="space-y-2 flex items-center justify-between">
                    <div>
                        <ol className="list-decimal list-inside font-bold">
                            {correctOrderWithNames.map((name, index) => (
                                <li key={index}>{name}</li>
                            ))}
                        </ol>
                    </div>

                    <div>
                        <strong>Correct</strong>
                        <ol className="list-decimal list-inside">
                            {userOrderWithNames.map((name, index) => (
                                <li key={index}>{name}</li>
                            ))}
                        </ol>
                    </div>

                    <div className="flex items-center">
                        {answer.isCorrect ? (
                            <CheckCircleIcon className="w-6 h-6 text-green-600"/>
                        ) : (
                            <XCircleIcon className="w-6 h-6 text-red-600"/>
                        )}
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="space-y-4">
            <Card title={quiz.name}>
                <div className="space-y-3">
                    {quiz.questions.map((question) => (
                        <div key={question.id}>
                            {question.title}
                        </div>
                    ))}
                </div>
            </Card>

            <hr className="my-10"/>

            {quiz.responses.map((response) => (
                <Card
                    expandable
                    key={response.id}
                    title={`${response.username} (${response.correctQuestionsCount}/${quiz.questions.length} correct)`}
                >
                    {formatDate(response.submittedAt)}

                    <div className="space-y-3">
                        {quiz.questions.map((question) => {
                            const answer = response.answers.get(question.id);
                            if (!answer) {
                                return null;
                            }
                            return (
                                <div key={answer.id} className={
                                    "px-2 py-3 rounded-lg text-gray-800 " +
                                    (answer.isCorrect ? "bg-green-50" : "bg-red-50")
                                }>
                                    <div className="flex justify-between">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="font-medium text-lg">{question.title}</div>

                                            <If condition={! answer.isCorrect && question.type === QuestionType.Written}>
                                                <CorrectButton
                                                    onCorrect={refetch}
                                                    answerId={answer.id}
                                                />
                                            </If>
                                        </div>
                                        <span className={
                                        "font-bold " +
                                            (answer.isCorrect ? "text-green-700" : "text-red-700")
                                        }>
                                        ${answer.coins} / ${question.coins}
                                    </span>
                                    </div>

                                    <hr className="border-gray-800 mb-3"/>

                                    {showAnswer(answer, question)}
                                </div>
                            );
                        })}
                    </div>
                </Card>
            ))}
        </div>
    );
}

function CorrectButton({answerId, onCorrect}: {answerId: number, onCorrect: () => void}) {
    const [correctResponse, {isLoading, isSuccess}] = useCorrectResponseMutation();

    useEffect(() => {
        if (isSuccess) {
            onCorrect();
        }
    }, [isLoading]);

    return (
        <Button
            width="w-auto"
            padding="p-2"
            color="green"
            type="button"
            disabled={isLoading}
            onClick={() => correctResponse(answerId)}
        >
            <If
                replacement={<CheckIcon className="w-5 h-5"/>}
                condition={isLoading}>
                ...
            </If>
        </Button>
    );

}