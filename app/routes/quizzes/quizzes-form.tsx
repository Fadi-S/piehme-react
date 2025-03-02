import React, {useEffect, useRef, useState} from "react";
import Card from "~/components/card";
import Input from "~/components/input";
import Button from "~/components/button";
import DateInput from "~/components/date-input";
import {type Question, QuestionType} from "~/features/quizzes/quizzesApiSlice";
import {PlusIcon} from "@heroicons/react/24/solid";
import {TrashIcon} from "@heroicons/react/24/outline";

interface QuizzesFormProps {
    onSubmit: (quiz: FormData) => void;
    isLoading: boolean;
    isSuccess: boolean;
    onSuccess: () => void;
    title: string;
    error?: any;
    initialData?: any;
}

export default function QuizzesForm({
                                        onSubmit,
                                        isLoading,
                                        isSuccess,
                                        onSuccess,
                                        title,
                                        error,
                                        initialData
                                    }: QuizzesFormProps) {
    const [errorMessage, setErrorMessage] = React.useState<string>("");

    useEffect(() => {
        if (isSuccess) {
            onSuccess();
        } else if (error) {
            setErrorMessage(error.data.message);
        }
    }, [isLoading]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        const quiz : QuizForm = {
            name: formData.get("name") as string,
            published_at: formData.get("published_at") as string,
            questions: []
        };

        let i = 0;
        while (true) {
            if(formData.get(`questions[${i}][title]`) == null) {
                break;
            }

            const question : QuestionForm = {
                title: formData.get(`questions[${i}][title]`) as string,
                points: parseInt(formData.get(`questions[${i}][points]`) as string),
                type: QuestionType.Choice,
                correct_answers: JSON.parse(formData.get(`questions[${i}][correct_answers]`) as string),
                options: []
            };

            let j = 0;
            while (true) {
                if(formData.get(`questions[${i}][options][${j}][name]`) == null) {
                    break;
                }

                const option : OptionForm = {
                    name: formData.get(`questions[${i}][options][${j}][name]`) as string,
                    order: j
                };

                question.options.push(option);

                j++;
            }

            quiz.questions.push(question);

            i++;
        }

        console.log(quiz);

        // onSubmit(formData);
    }

    return (
        <div>
            <form onSubmit={submit}>
                <Card title={title}>

                    <div className="grid sm:grid-cols-2 gap-4 mb-8">
                        <Input required id="name" name="name" label="Name" defaultValue={initialData?.name}/>
                        <DateInput required id="published_at" name="published_at" label="Published At"
                                   defaultValue={initialData?.published_at}/>
                    </div>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save"}
                    </Button>
                    {errorMessage && <div className="text-red-600">{errorMessage}</div>}
                </Card>

                <Questions questions={initialData.questions}/>
            </form>
        </div>
    )
        ;
}

interface QuizForm {
    id?: number
    name: string
    published_at: string
    questions: QuestionForm[]
}

interface QuestionForm {
    id?: number
    title: string
    points: number
    type: QuestionType
    correct_answers: string[] | number[] | string
    options: OptionForm[]
}

interface OptionForm {
    id?: number
    name: string
    order: number
}

export type { QuizForm, QuestionForm, OptionForm };


interface QuestionsProps {
    questions?: QuestionForm[]
}

function Questions(props: QuestionsProps) {
    const emptyQuestion: QuestionForm = {
        title: "",
        points: 0,
        type: QuestionType.Choice,
        correct_answers: [],
        options: [
            {name: "", order: 1},
            {name: "", order: 2},
        ]
    }

    const [questions, setQuestions] = useState(
        props.questions ? props.questions : [emptyQuestion]
    );

    function addQuestion() {
        setQuestions([...questions, emptyQuestion]);
    }

    function removeQuestion(index : number) {
        setQuestions(questions.filter((_, i) => i !== index));
    }

    return (
        <div className="col-span-2 mt-4">
            <div className="flex items-center justify-center w-full mb-4">
                <Button color="green" onClick={addQuestion} width="w-auto">
                    <PlusIcon className="h-5 w-5 mr-2"/>
                    <div>Add Question</div>
                </Button>
            </div>

            <div className="space-y-3">
            {questions.map((question, index) => (
                <Card title={question.title} key={index}>
                    <Button
                        color="red"
                        onClick={() => removeQuestion(index)}
                        width="w-auto"
                    >
                        <TrashIcon className="h-5 w-5 mr-2"/>
                        <div>Remove</div>
                    </Button>

                    <div className="mt-4 grid sm:grid-cols-2 gap-4 mb-8">
                        <Input required id="title" name={`questions[${index}][title]`} label="Title" defaultValue={question.title} />
                        <Input required id="coins" name={`questions[${index}][points]`} type="number" label="Coins" defaultValue={question.points.toString()} />
                        <Input type="hidden" required id="correct_answers" name={`questions[${index}][correct_answers]`} defaultValue={JSON.stringify(question.correct_answers)} />

                        <div className="col-span-2">
                            <label className="mb-4 block text-sm/6 font-medium text-gray-900">
                                Options
                            </label>
                            {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="grid sm:grid-cols-2 gap-4">
                                    <Input required id="options" name={`questions[${index}][options][${optionIndex}][name]`} label="Name" defaultValue={option.name} />
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            ))}
            </div>
        </div>
    );
}