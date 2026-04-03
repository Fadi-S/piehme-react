import React, { useEffect, useMemo, useState } from "react";
import type { Route } from "./+types/insights-stats";
import { useSearchParams } from "react-router";
import Card from "~/components/card";
import Loading from "~/components/loading";
import Button from "~/components/button";
import StatsBarChart from "~/components/stats-bar-chart";
import { Table, Td, Th } from "~/components/table";
import {
    useGetAdminStatsPageQuery,
    useGetHardestQuestionsForQuizQuery,
    useGetHardestQuestionsQuery,
    useGetQuestionDistributionQuery,
    useGetTopAttendanceUsersQuery,
    useGetTopEarnedCoinsUsersQuery,
    useGetTopOverallUsersQuery,
    useGetTopValueUsersQuery,
    useGetUsersAttemptedAllQuizzesQuery,
    type AttemptedAllQuizUser,
    type BestSeller,
    type ChoiceDistributionOption,
    type HardestQuestion,
    type UserMetricRow,
} from "~/features/insights/insightsApiSlice";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Admin Stats" },
    ];
}

function createStaticPagination<T>(data: T[]) {
    return {
        data,
        page: 0,
        size: data.length,
        totalElements: data.length,
        totalPages: 1,
    };
}

function formatMetric(value: number, digits = 2) {
    return Number.isInteger(value) ? value.toString() : value.toFixed(digits);
}

function percentage(value: number) {
    return `${(value * 100).toFixed(2)}%`;
}

function LeaderboardTable({
    title,
    metricLabel,
    secondaryLabel,
    users,
    expanded,
    onToggle,
}: {
    title: string;
    metricLabel: string;
    secondaryLabel: string;
    users: UserMetricRow[];
    expanded: boolean;
    onToggle: () => void;
}) {
    return (
        <Card title={title} className="h-full">
            <div className="flex justify-end">
                <Button color="gray" width="w-auto" onClick={onToggle}>
                    {expanded ? "Show 10" : "Show 20"}
                </Button>
            </div>

            <Table
                pagination={createStaticPagination(users)}
                header={(
                    <tr>
                        <Th>#</Th>
                        <Th>Name</Th>
                        <Th>{secondaryLabel}</Th>
                        <Th>{metricLabel}</Th>
                    </tr>
                )}
                body={(user: UserMetricRow) => (
                    <tr key={`${title}-${user.userId}`}>
                        <Td>{user.rank}</Td>
                        <Td>
                            <div className="flex items-center justify-center gap-3">
                                {user.imageUrl && (
                                    <img src={user.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                                )}
                                <div className="font-medium text-gray-900">{user.username}</div>
                            </div>
                        </Td>
                        <Td>{secondaryLabel === "Earned Coins" ? user.totalCoinsEarned : formatMetric(user.overallScore)}</Td>
                        <Td className="font-semibold text-gray-700">{formatMetric(user.metricValue)}</Td>
                    </tr>
                )}
            />
        </Card>
    );
}

export default function InsightsStats() {
    const [searchParams] = useSearchParams();
    const { data, isLoading } = useGetAdminStatsPageQuery();
    const [overallExpanded, setOverallExpanded] = useState(false);
    const [coinsExpanded, setCoinsExpanded] = useState(false);
    const [valueExpanded, setValueExpanded] = useState(false);
    const [attendanceExpanded, setAttendanceExpanded] = useState(false);
    const [questionsExpanded, setQuestionsExpanded] = useState(false);
    const [selectedQuizSlug, setSelectedQuizSlug] = useState<string>("");
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
    const attemptedAllPage = Math.max(Number(searchParams.get("page") ?? "1") || 1, 1);

    const { data: overallUsers = [] } = useGetTopOverallUsersQuery(overallExpanded ? 20 : 10);
    const { data: earnedCoinUsers = [] } = useGetTopEarnedCoinsUsersQuery(coinsExpanded ? 20 : 10);
    const { data: valueUsers = [] } = useGetTopValueUsersQuery(valueExpanded ? 20 : 10);
    const { data: attendanceUsers = [] } = useGetTopAttendanceUsersQuery(attendanceExpanded ? 20 : 10);
    const { data: hardestQuestions = [] } = useGetHardestQuestionsQuery(questionsExpanded ? 20 : 10);
    const { data: quizQuestions = [] } = useGetHardestQuestionsForQuizQuery(
        { slug: selectedQuizSlug, limit: 10 },
        { skip: !selectedQuizSlug },
    );
    const { data: distribution } = useGetQuestionDistributionQuery(selectedQuestionId ?? 0, {
        skip: selectedQuestionId === null,
    });
    const { data: attemptedAllUsers } = useGetUsersAttemptedAllQuizzesQuery({ page: attemptedAllPage, size: 10 });

    useEffect(() => {
        if (!data) {
            return;
        }

        if (!selectedQuizSlug && data.hardestQuestionsByQuiz.length > 0) {
            setSelectedQuizSlug(data.hardestQuestionsByQuiz[0].quizSlug);
        }

        if (selectedQuestionId === null && data.hardestQuestions.length > 0) {
            setSelectedQuestionId(data.hardestQuestions[0].questionId);
        }
    }, [data, selectedQuizSlug, selectedQuestionId]);

    const summaryCards = useMemo(() => {
        if (!data) {
            return [];
        }

        return [
            { label: "Users", value: data.summary.usersCount },
            { label: "Quizzes", value: data.summary.quizzesCount },
            { label: "Questions", value: data.summary.questionsCount },
            { label: "Approved Attendances", value: data.summary.approvedAttendancesCount },
        ];
    }, [data]);

    if (isLoading || !data) {
        return <Loading />;
    }

    return (
        <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => (
                    <Card key={card.label} className="border border-amber-100 bg-gradient-to-br from-white to-amber-50">
                        <div className="text-sm font-semibold uppercase tracking-wide text-amber-700">{card.label}</div>
                        <div className="mt-3 text-3xl font-bold text-gray-900">{card.value}</div>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <LeaderboardTable
                    title="Top Overall Rating"
                    metricLabel="Overall Score"
                    secondaryLabel="Earned Coins"
                    users={overallUsers}
                    expanded={overallExpanded}
                    onToggle={() => setOverallExpanded((current) => !current)}
                />
                <LeaderboardTable
                    title="Top Earned Coins"
                    metricLabel="Earned Coins"
                    secondaryLabel="Overall Rating"
                    users={earnedCoinUsers}
                    expanded={coinsExpanded}
                    onToggle={() => setCoinsExpanded((current) => !current)}
                />
                <LeaderboardTable
                    title="Best Rating Per 1,000 Spent"
                    metricLabel="Value Score"
                    secondaryLabel="Overall Rating"
                    users={valueUsers}
                    expanded={valueExpanded}
                    onToggle={() => setValueExpanded((current) => !current)}
                />
                <LeaderboardTable
                    title="Most Approved Attendances"
                    metricLabel="Approved Count"
                    secondaryLabel="Overall Rating"
                    users={attendanceUsers}
                    expanded={attendanceExpanded}
                    onToggle={() => setAttendanceExpanded((current) => !current)}
                />
            </div>

            <Card title="Users Who Attempted All Quizzes">
                <Table
                    pagination={attemptedAllUsers ?? createStaticPagination<AttemptedAllQuizUser>([])}
                    header={(
                        <tr>
                            <Th>Name</Th>
                            <Th>Overall</Th>
                            <Th>Earned Coins</Th>
                            <Th>Attempts</Th>
                        </tr>
                    )}
                    body={(user: AttemptedAllQuizUser) => (
                        <tr key={`attempted-all-${user.userId}`}>
                            <Td>
                                <div className="flex items-center justify-center gap-3">
                                    {user.imageUrl && (
                                        <img src={user.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                                    )}
                                    <div className="font-medium text-gray-900">{user.username}</div>
                                </div>
                            </Td>
                            <Td>{formatMetric(user.overallScore)}</Td>
                            <Td>{user.totalCoinsEarned}</Td>
                            <Td>{user.attemptedQuizzesCount} / {user.publishedQuizzesCount}</Td>
                        </tr>
                    )}
                />
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
                <Card title="Quiz Difficulty">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                            <h3 className="text-sm font-semibold text-red-700">Hardest Quizzes</h3>
                            <Table
                                pagination={createStaticPagination(data.hardestQuizzes)}
                                header={(
                                    <tr>
                                        <Th>Quiz</Th>
                                        <Th>Accuracy</Th>
                                        <Th>Submissions</Th>
                                    </tr>
                                )}
                                body={(quiz) => (
                                    <tr key={`hard-${quiz.quizId}`}>
                                        <Td>{quiz.quizName}</Td>
                                        <Td>{percentage(quiz.accuracy)}</Td>
                                        <Td>{quiz.submissionsCount}</Td>
                                    </tr>
                                )}
                            />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-green-700">Easiest Quizzes</h3>
                            <Table
                                pagination={createStaticPagination(data.easiestQuizzes)}
                                header={(
                                    <tr>
                                        <Th>Quiz</Th>
                                        <Th>Accuracy</Th>
                                        <Th>Submissions</Th>
                                    </tr>
                                )}
                                body={(quiz) => (
                                    <tr key={`easy-${quiz.quizId}`}>
                                        <Td>{quiz.quizName}</Td>
                                        <Td>{percentage(quiz.accuracy)}</Td>
                                        <Td>{quiz.submissionsCount}</Td>
                                    </tr>
                                )}
                            />
                        </div>
                    </div>
                </Card>

                <Card title="Quiz Difficulty Chart">
                    <StatsBarChart data={data.quizDifficultyChart} valueSuffix="%" />
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <Card title="Hardest Questions Global">
                    <div className="flex justify-end">
                        <Button color="gray" width="w-auto" onClick={() => setQuestionsExpanded((current) => !current)}>
                            {questionsExpanded ? "Show 10" : "Show 20"}
                        </Button>
                    </div>

                    <Table
                        pagination={createStaticPagination(hardestQuestions)}
                        header={(
                            <tr>
                                <Th>Quiz</Th>
                                <Th>Question</Th>
                                <Th>Accuracy</Th>
                                <Th>Attempts</Th>
                            </tr>
                        )}
                        body={(question: HardestQuestion) => (
                            <tr
                                key={`question-${question.questionId}`}
                                className={`cursor-pointer ${selectedQuestionId === question.questionId ? "bg-amber-50" : ""}`}
                                onClick={() => setSelectedQuestionId(question.questionId)}
                            >
                                <Td>{question.quizName}</Td>
                                <Td className="max-w-xs whitespace-normal text-left text-gray-700">{question.questionTitle}</Td>
                                <Td>{percentage(question.accuracy)}</Td>
                                <Td>{question.attempts}</Td>
                            </tr>
                        )}
                    />
                </Card>

                <Card title="Hardest Questions By Quiz">
                    <div className="mb-4 flex flex-wrap gap-2">
                        {data.hardestQuestionsByQuiz.map((quiz) => (
                            <Button
                                key={quiz.quizSlug}
                                color={selectedQuizSlug === quiz.quizSlug ? "primary" : "gray"}
                                width="w-auto"
                                onClick={() => setSelectedQuizSlug(quiz.quizSlug)}
                            >
                                {quiz.quizName}
                            </Button>
                        ))}
                    </div>

                    <Table
                        pagination={createStaticPagination(quizQuestions)}
                        header={(
                            <tr>
                                <Th>Question</Th>
                                <Th>Accuracy</Th>
                                <Th>Attempts</Th>
                            </tr>
                        )}
                        body={(question: HardestQuestion) => (
                            <tr key={`quiz-question-${question.questionId}`}>
                                <Td className="max-w-xs whitespace-normal text-left text-gray-700">{question.questionTitle}</Td>
                                <Td>{percentage(question.accuracy)}</Td>
                                <Td>{question.attempts}</Td>
                            </tr>
                        )}
                    />
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <Card title="Best Seller Players">
                    <Table
                        pagination={createStaticPagination(data.bestSellerPlayers)}
                        header={(
                            <tr>
                                <Th>Player</Th>
                                <Th>Owners</Th>
                            </tr>
                        )}
                        body={(player: BestSeller) => (
                            <tr key={player.name}>
                                <Td>{player.name}</Td>
                                <Td>{player.count}</Td>
                            </tr>
                        )}
                    />
                </Card>

                <Card title="Best Seller Chart">
                    <StatsBarChart data={data.bestSellerChart} />
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <Card title="MCQ Answer Distribution">
                    {distribution ? (
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm font-semibold text-amber-700">{distribution.quizName}</div>
                                <div className="mt-1 text-lg font-semibold text-gray-900">{distribution.questionTitle}</div>
                                <div className="mt-1 text-sm text-gray-500">Responses: {distribution.totalResponses}</div>
                            </div>

                            <div className="space-y-3">
                                {distribution.options.map((option: ChoiceDistributionOption) => (
                                    <div key={option.optionId} className="rounded-lg border border-gray-200 p-3">
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="font-medium text-gray-900">
                                                {option.optionOrder}. {option.optionName}
                                            </span>
                                            <span className={option.correct ? "font-semibold text-green-700" : "text-gray-500"}>
                                                {option.picksCount} picks • {percentage(option.picksPercentage)}
                                            </span>
                                        </div>
                                        <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className={`h-full rounded-full ${option.correct ? "bg-green-500" : "bg-blue-500"}`}
                                                style={{ width: `${option.picksPercentage * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">Select a question to inspect its answer distribution.</div>
                    )}
                </Card>

                <Card title="Attendance And Leaderboard Charts">
                    <div className="space-y-8">
                        <div>
                            <div className="mb-3 text-sm font-semibold text-gray-700">Attendance</div>
                            <StatsBarChart data={data.attendanceChart} />
                        </div>
                        <div>
                            <div className="mb-3 text-sm font-semibold text-gray-700">Leaderboard Comparison</div>
                            <StatsBarChart data={data.leaderboardComparisonChart} />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
