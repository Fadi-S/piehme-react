import React from "react";
import { useNavigate } from "react-router";
import Input from "~/components/input";
import Button from "~/components/button";

const FLAG_VALUE = "VEFSTklNQSBIQUNLRVI=";
const COUNTDOWN_START = 5;

const RIDDLES: Array<{ question: string; answer: string }> = [
    {
        question: "حبة قش اتلموا اتلموا عملوا اجمل فرش و .......",
        answer: "عرش",
    },
    {
        question: "و خروف نونو قرب قرب جنب المذود .......",
        answer: "متحركش",
    },
    {
        question: "عايز بابا يسوع يتدفى بصوفه و نفسه ولا .......",
        answer: "يبردش",
    },
    {
        question: "ياللي تحب يسوع سلمله قلبك وإمشي معاه .......",
        answer: "متخافش",
    },
    {
        question: "لو قدمت بحب هايفرح حتى لو هاتقدم .......",
        answer: "قش",
    },
];

export function meta() {
    return [{ title: "Flag" }];
}

export default function FlagChallenge() {
    const navigate = useNavigate();
    const [userAnswer, setUserAnswer] = React.useState("");
    const [feedback, setFeedback] = React.useState<string | null>(null);
    const [solved, setSolved] = React.useState(false);
    const [secondsLeft, setSecondsLeft] = React.useState(COUNTDOWN_START);

    const [riddle] = React.useState(() => {
        const index = Math.floor(Math.random() * RIDDLES.length);
        return RIDDLES[index];
    });

    React.useEffect(() => {
        if (solved) {
            return;
        }

        if (secondsLeft <= 0) {
            navigate("/", { replace: true });
            return;
        }

        const timer = setTimeout(() => {
            setSecondsLeft(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [navigate, secondsLeft, solved]);

    function checkAnswer(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalized = userAnswer.trim().toLowerCase();
        if (normalized === riddle.answer.toLowerCase()) {
            setSolved(true);
            setFeedback(`Flag: ${FLAG_VALUE}`);
        } else {
            setFeedback("Incorrect. The clock is still ticking!");
            setUserAnswer("");
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
            <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-md">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">CTF Challenge</p>
                <h1 className="mt-2 text-3xl font-bold text-gray-900  text-right" dir="rtl">
                    اكمل الترنيمه في {secondsLeft}
                </h1>
                <p className="mt-3 text-right text-gray-700" dir="rtl">
                    {riddle.question}
                </p>

                <form onSubmit={checkAnswer} className="mt-6 space-y-4">
                    <Input
                        id="flag-answer"
                        label="Your answer"
                        value={userAnswer}
                        onChange={(event) => setUserAnswer(event.target.value)}
                        required
                    />
                    <Button type="submit">Submit</Button>
                </form>

                {feedback && (
                    <p className="mt-4 text-center text-sm font-medium text-gray-900">{feedback}</p>
                )}

                {solved && (
                    <p className="mt-2 text-center text-base font-semibold text-green-600">You got me :(</p>
                )}
            </div>
        </div>
    );
}
