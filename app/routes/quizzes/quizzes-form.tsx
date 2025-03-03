import React, {useEffect, useState} from "react";
import Card from "~/components/card";
import Input from "~/components/input";
import Button from "~/components/button";
import DateInput from "~/components/date-input";
import {QuestionType} from "~/features/quizzes/quizzesApiSlice";
import {PlusIcon} from "@heroicons/react/24/solid";
import {Bars2Icon, TrashIcon} from "@heroicons/react/24/outline";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import {closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {restrictToVerticalAxis} from "@dnd-kit/modifiers";
import {CSS} from "@dnd-kit/utilities";
import Textarea from "~/components/textarea";
import If from "~/components/if";

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
                    order: j,
                    clientId: ""
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

                <Questions questions={initialData?.questions}/>
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
    picture?: string
    options: OptionForm[]
}

interface OptionForm {
    id?: number
    name: string
    order: number
    picture?: string
    clientId: string
}

export type { QuizForm, QuestionForm, OptionForm };


interface QuestionsProps {
    questions?: QuestionForm[]
}

function Questions(props: QuestionsProps) {
    const generateClientId = () => Math.random().toString(36).substring(2, 11);

    const emptyQuestion: QuestionForm = {
        title: "",
        points: 0,
        type: QuestionType.Choice,
        correct_answers: [],
        options: [
            { name: "", order: 1, clientId: generateClientId() },
            { name: "", order: 2, clientId: generateClientId() },
        ]
    }

    const [questions, setQuestions] = useState(() => {
        if (!props.questions) return [emptyQuestion];
        return props.questions.map(question => ({
            ...question,
            options: question.options.map(opt => ({
                ...opt,
                clientId: opt.clientId || generateClientId(),
            }))
        }));
    });

    function addQuestion() {
        setQuestions([...questions, emptyQuestion]);
    }

    function removeQuestion(index : number) {
        setQuestions(questions.filter((_, i) => i !== index));
    }

    // Add option to specific question
    function addOption(qIndex: number) {
        const newQuestions = [...questions];
        const options = [...newQuestions[qIndex].options];
        const newOrder = options.length + 1;
        options.push({
            name: "",
            order: newOrder,
            clientId: generateClientId()
        });
        newQuestions[qIndex].options = options;

        setQuestions(newQuestions);
    }

    // Remove option from specific question
    function removeOption(qIndex: number, oIndex: number) {
        const newQuestions = [...questions];
        const filtered = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
        newQuestions[qIndex].options = filtered.map((opt, index) => ({
            ...opt,
            order: index + 1
        }));

        setQuestions(newQuestions);
    }

    function changeState(index : number, key : string, value : string)
    {
        let state = {};
        // @ts-ignore
        state[key] = value;
        const newQuestions = [...questions];

        newQuestions[index] = {...newQuestions[index], ...state};

        setQuestions(newQuestions);
    }

    function changeStateOptions(qIndex : number, oIndex : number, key : string, value : string)
    {
        const newQuestions = [...questions];

        let state = {};
        // @ts-ignore
        state[key] = value;

        const newOptions = [...newQuestions[qIndex]["options"]];
        newOptions[oIndex] = {...newOptions[oIndex], ...state};
        newQuestions[qIndex] = {...newQuestions[qIndex], options: newOptions};

        setQuestions(newQuestions);
    }

    function handleDragEnd(event: any, qIndex: number) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const newQuestions = [...questions];
        const options = [...newQuestions[qIndex].options];

        const oldIndex = options.findIndex(opt => opt.clientId === active.id);
        const newIndex = options.findIndex(opt => opt.clientId === over.id);

        const newOptions = arrayMove(options, oldIndex, newIndex);
        newQuestions[qIndex].options = newOptions.map((opt, index) => ({
            ...opt,
            order: index + 1
        }));

        setQuestions(newQuestions);
    }

    // Sensors for drag-and-drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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
                <Card title={`Question ${index + 1}`} key={index}>
                    <Button
                        color="red"
                        onClick={() => removeQuestion(index)}
                        width="w-auto"
                    >
                        <TrashIcon className="h-5 w-5 mr-2"/>
                        <div>Remove</div>
                    </Button>

                    <div className="mt-4 grid sm:grid-cols-2 gap-4 mb-8">
                        <Textarea
                            className="col-span-2"
                            required
                            rows={2}
                            id="title"
                            name={`questions[${index}][title]`}
                            label="Title"
                            value={question.title}
                            onChange={(e) => changeState(index, "title", e.target.value)}
                        />
                        <Input
                            required
                            id="coins"
                            name={`questions[${index}][points]`}
                            type="number"
                            label="Coins"
                            value={question.points.toString()}
                            onChange={(e) => changeState(index, "points", e.target.value)}
                        />
                        <Input type="hidden" required id="correct_answers" name={`questions[${index}][correct_answers]`} defaultValue={JSON.stringify(question.correct_answers)} />

                        <div className="col-span-2">
                            <label className="mb-4 block text-sm/6 font-medium text-gray-900">
                                Options
                            </label>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={(e) => handleDragEnd(e, index)}
                                modifiers={[restrictToVerticalAxis]}
                            >
                                <SortableContext
                                    items={question.options.map(o => o.clientId)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {question.options.map((option, oIndex) => (
                                        <OptionItem
                                            key={option.clientId}
                                            option={option}
                                            qIndex={index}
                                            oIndex={oIndex}
                                            onRemove={() => removeOption(index, oIndex)}
                                            onChange={changeStateOptions}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                            <Button
                                type="button"
                                color="light-blue"
                                onClick={() => addOption(index)}
                                className="mt-2"
                                width="w-auto mx-auto"
                            >
                                <div className="flex items-center">
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    <span>Add Option</span>
                                </div>
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
            </div>
        </div>
    );
}

interface OptionItemProps {
    option: OptionForm;
    qIndex: number;
    oIndex: number;
    onRemove: () => void;
    onChange: (qIndex:number, oIndex:number, key:string, value:string) => void;
}

function OptionItem({option, qIndex, oIndex, onRemove, onChange}: OptionItemProps) {
    const {attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: option.clientId,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-2">
            <div className="grid grid-cols-12 gap-3">
                <div className="col-span-1 self-center">
                    <Bars2Icon className="h-5 w-5 cursor-move" />
                </div>
                <Input
                    required
                    id={`questions[${qIndex}][options][${oIndex}][name]`}
                    name={`questions[${qIndex}][options][${oIndex}][name]`}
                    value={option.name}
                    placeholder={`Option ${oIndex + 1}`}
                    onChange={(e) => onChange(qIndex, oIndex, "name", e.target.value)}
                    className="flex-grow col-span-11 sm:col-span-8"
                />
                <div className="col-span-8 sm:col-span-2">
                    <If condition={true}>
                        <Input
                            required
                            id={`questions[${qIndex}][options][${oIndex}][correct]`}
                            type="checkbox"
                            value="1"
                            label="Is Correct"
                            onChange={(e) => onChange(qIndex, oIndex, "checked", e.target.value)}
                        />
                    </If>
                </div>
                <div className="col-span-4 sm:col-span-1 self-center">
                    <Button
                        type="button"
                        onClick={onRemove}
                        color="red"
                        width="w-auto"
                        padding="p-2"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </Button>
                </div>
            </div>
            <hr className="my-5 border-gray-200" />
        </div>
    );
}
