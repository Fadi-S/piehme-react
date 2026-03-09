import {
    type Answer,
    type Question,
    QuestionType,
    useCorrectResponseMutation, useDeleteResponseMutation,
    useGetQuizQuery
} from "~/features/quizzes/quizzesApiSlice";
import React, { useEffect, useState } from "react";
import type { Route } from "./+types/quizzes-edit";
import { useParams } from "react-router";
import Loading from "~/components/loading";
import Card from "~/components/card";
import { CheckCircleIcon, CheckIcon, PencilSquareIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import If from "~/components/if";
import Button from "~/components/button";
import { formatDate } from "~/base/helpers";
import DeleteButton from "~/components/delete-button";
import { useUpdateResponseMutation } from "~/features/quizzes/quizzesApiSlice";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Show Quiz" },
    ];
}

export default function QuizzesShow() {
    const slug: string = useParams().slug ?? "0";

    const { data: quiz, isLoading: isQuizLoading, refetch } = useGetQuizQuery({ slug, withResponses: true });

    if (isQuizLoading || !quiz) {
        return <Loading />;
    }

    function showAnswer(answer: Answer, question: Question) {
        if (question.type === QuestionType.Choice || question.type === QuestionType.MultipleCorrectChoices) {
            return (
                <div className="flex flex-col space-y-1">
                    {question.options.map((option) => {
                        const selectedAnswers = Array.isArray(answer.answer)
                            ? answer.answer.map((selected) => selected.toString())
                            : [answer.answer.toString()];
                        const isSelected = selectedAnswers.includes(option.order.toString());
                        const isCorrect = isSelected && answer.isCorrect;
                        return (
                            <div key={option.id} className="flex justify-between">
                                <span className={isSelected ? "font-bold underline" : ""}>{option.name}</span>
                                <span className={isSelected ? "font-bold" : ""}>
                                    {isCorrect && <CheckCircleIcon className="w-6 h-6 text-green-600" />}

                                    {isSelected && !isCorrect && <XCircleIcon className="w-6 h-6 text-red-600" />}
                                </span>
                            </div>
                        );
                    })}

                    <div className="mt-4 text-green-800 font-bold">{question.options
                        .filter((opt) => {
                            if (Array.isArray(question.answers)) {
                                return (question.answers as number[]).includes(opt.order);
                            }

                            return question.answers.toString() === opt.order.toString();
                        })
                        .map((opt) => opt.name)
                        .join(", ")}
                    </div>
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
                        {answer.isCorrect && <CheckCircleIcon className="w-6 h-6 text-green-600" />}
                        {!answer.isCorrect && <XCircleIcon className="w-6 h-6 text-red-600" />}
                    </span>
                </div>
            );
        }

        if (question.type === QuestionType.Reorder) {
            let userOrderWithNames: any[] = [];

            if (Array.isArray(answer.answer)) {
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
                            {userOrderWithNames.map((name, index) => (
                                <li key={index}>{name}</li>
                            ))}
                        </ol>
                    </div>

                    <div>
                        <strong>Correct</strong>
                        <ol className="list-decimal list-inside">
                            {correctOrderWithNames.map((name, index) => (
                                <li key={index}>{name}</li>
                            ))}
                        </ol>
                    </div>

                    <div className="flex items-center">
                        {answer.isCorrect ? (
                            <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        ) : (
                            <XCircleIcon className="w-6 h-6 text-red-600" />
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

            <hr className="my-10" />

            {quiz.responses.map((response) => (
                <Card
                    expandable
                    expanded={false}
                    key={response.id}
                    title={
                        <div className="flex items-center justify-between space-x-4">
                            <div>
                                {response.username} ({response.correctQuestionsCount}/{quiz.questions.length} correct)
                            </div>
                            <DeleteButton
                                useDeleteMutation={useDeleteResponseMutation}
                                itemKey="id"
                                itemValue={response.id}
                                onDelete={refetch}
                                className="text-sm border border-red-600 text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg"
                            />
                        </div>
                    }
                >
                    <div className="my-4 text-sm text-gray-500 font-semibold">
                        {formatDate(response.submittedAt)}
                    </div>

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

                                            <If condition={!answer.isCorrect && question.type === QuestionType.Written}>
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

                                    <hr className="border-gray-800 mb-3" />

                                    <div className="space-y-3">
                                        {showAnswer(answer, question)}

                                        <EditResponseForm
                                            answer={answer}
                                            question={question}
                                            onUpdated={refetch}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            ))}
        </div>
    );
}

function CorrectButton({ answerId, onCorrect }: { answerId: number, onCorrect: () => void }) {
    const [correctResponse, { isLoading, isSuccess }] = useCorrectResponseMutation();

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
                replacement={<CheckIcon className="w-5 h-5" />}
                condition={isLoading}>
                ...
            </If>
        </Button>
    );
}

function EditResponseForm({ answer, question, onUpdated }: { answer: Answer, question: Question, onUpdated: () => void }) {
    const [updateResponse, { isLoading }] = useUpdateResponseMutation();
    const [isEditing, setIsEditing] = useState(false);
    const [writtenAnswer, setWrittenAnswer] = useState(typeof answer.answer === "string" ? answer.answer : "");
    const [selectedChoice, setSelectedChoice] = useState(Array.isArray(answer.answer) ? answer.answer[0]?.toString() ?? "" : answer.answer.toString());
    const [selectedMultiple, setSelectedMultiple] = useState<string[]>(Array.isArray(answer.answer) ? answer.answer.map((value) => value.toString()) : [answer.answer.toString()]);
    const [reorderPositions, setReorderPositions] = useState<Record<number, string>>(() => {
        const orderValues = Array.isArray(answer.answer) ? answer.answer.map((value) => value.toString()) : [];
        return question.options.reduce((positions, option) => {
            const index = orderValues.findIndex((value) => value === option.order.toString());
            positions[option.order] = index >= 0 ? (index + 1).toString() : "";
            return positions;
        }, {} as Record<number, string>);
    });
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!isEditing) {
            setWrittenAnswer(typeof answer.answer === "string" ? answer.answer : "");
            setSelectedChoice(Array.isArray(answer.answer) ? answer.answer[0]?.toString() ?? "" : answer.answer.toString());
            setSelectedMultiple(Array.isArray(answer.answer) ? answer.answer.map((value) => value.toString()) : [answer.answer.toString()]);
            setReorderPositions(question.options.reduce((positions, option) => {
                const orderValues = Array.isArray(answer.answer) ? answer.answer.map((value) => value.toString()) : [];
                const index = orderValues.findIndex((value) => value === option.order.toString());
                positions[option.order] = index >= 0 ? (index + 1).toString() : "";
                return positions;
            }, {} as Record<number, string>));
            setErrorMessage("");
        }
    }, [answer, isEditing, question.options]);

    function toggleMultipleChoice(order: string, checked: boolean) {
        if (checked) {
            setSelectedMultiple((current) => Array.from(new Set([...current, order])));
            return;
        }

        setSelectedMultiple((current) => current.filter((value) => value !== order));
    }

    function updateReorderPosition(optionOrder: number, value: string) {
        setReorderPositions((current) => ({
            ...current,
            [optionOrder]: value,
        }));
    }

    function buildAnswerPayload(): string | number | number[] | string[] | null {
        if (question.type === QuestionType.Written) {
            return writtenAnswer;
        }

        if (question.type === QuestionType.Choice) {
            if (selectedChoice === "") {
                return null;
            }

            return Number(selectedChoice);
        }

        if (question.type === QuestionType.MultipleCorrectChoices) {
            if (selectedMultiple.length === 0) {
                return null;
            }

            return selectedMultiple.map((value) => Number(value));
        }

        if (question.type === QuestionType.Reorder) {
            const entries = question.options.map((option) => ({
                optionOrder: option.order,
                position: reorderPositions[option.order],
            }));

            if (entries.some((entry) => entry.position === "")) {
                return null;
            }

            const normalized = entries.map((entry) => Number(entry.position));
            const expected = Array.from({ length: question.options.length }, (_, index) => index + 1);
            const isValid = normalized.every((value) => Number.isInteger(value) && value >= 1 && value <= question.options.length)
                && new Set(normalized).size === normalized.length
                && expected.every((value) => normalized.includes(value));

            if (!isValid) {
                return null;
            }

            return entries
                .sort((first, second) => Number(first.position) - Number(second.position))
                .map((entry) => entry.optionOrder);
        }

        return null;
    }

    async function submit() {
        const payload = buildAnswerPayload();

        if (payload === null) {
            setErrorMessage("Please enter a valid answer.");
            return;
        }

        setErrorMessage("");

        try {
            await updateResponse({
                id: answer.id,
                body: { answer: payload },
            }).unwrap();
            setIsEditing(false);
            onUpdated();
        } catch (error: any) {
            setErrorMessage(error?.data?.message ?? "Could not update response.");
        }
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-3">
            <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-700">Edit response</div>

                <If condition={isEditing} replacement={
                    <Button
                        width="w-auto"
                        padding="px-2 py-1"
                        color="gray"
                        type="button"
                        onClick={() => setIsEditing(true)}
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                    </Button>
                }>
                    <Button
                        width="w-auto"
                        padding="px-2 py-1"
                        color="red"
                        type="button"
                        onClick={() => setIsEditing(false)}
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </Button>
                </If>
            </div>

            <If condition={isEditing}>
                <div className="space-y-3">
                    <If condition={question.type === QuestionType.Written}>
                        <input
                            value={writtenAnswer}
                            onChange={(event) => setWrittenAnswer(event.target.value)}
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                        />
                    </If>

                    <If condition={question.type === QuestionType.Choice}>
                        <div className="space-y-2">
                            {question.options.map((option) => (
                                <label key={option.id} className="flex items-center space-x-2 text-sm text-gray-700">
                                    <input
                                        type="radio"
                                        name={`answer-${answer.id}`}
                                        checked={selectedChoice === option.order.toString()}
                                        onChange={() => setSelectedChoice(option.order.toString())}
                                    />
                                    <span>{option.name}</span>
                                </label>
                            ))}
                        </div>
                    </If>

                    <If condition={question.type === QuestionType.MultipleCorrectChoices}>
                        <div className="space-y-2">
                            {question.options.map((option) => (
                                <label key={option.id} className="flex items-center space-x-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={selectedMultiple.includes(option.order.toString())}
                                        onChange={(event) => toggleMultipleChoice(option.order.toString(), event.target.checked)}
                                    />
                                    <span>{option.name}</span>
                                </label>
                            ))}
                        </div>
                    </If>

                    <If condition={question.type === QuestionType.Reorder}>
                        <div className="space-y-2">
                            {question.options.map((option) => (
                                <div key={option.id} className="flex items-center justify-between gap-3 text-sm text-gray-700">
                                    <span>{option.name}</span>
                                    <select
                                        value={reorderPositions[option.order] ?? ""}
                                        onChange={(event) => updateReorderPosition(option.order, event.target.value)}
                                        className="rounded-md border border-gray-300 px-2 py-1"
                                    >
                                        <option value="">Position</option>
                                        {question.options.map((_, index) => (
                                            <option key={`${option.id}-${index + 1}`} value={(index + 1).toString()}>{index + 1}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </If>

                    <If condition={errorMessage !== ""}>
                        <div className="text-sm font-medium text-red-600">{errorMessage}</div>
                    </If>

                    <Button
                        width="w-auto"
                        padding="px-3 py-1.5"
                        color="primary"
                        type="button"
                        disabled={isLoading}
                        onClick={submit}
                    >
                        {isLoading ? "Saving..." : "Save response"}
                    </Button>
                </div>
            </If>
        </div>
    );
}