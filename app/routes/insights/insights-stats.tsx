import React, { useEffect, useMemo, useState } from "react";
import type { Route } from "./+types/insights-stats";
import Card from "~/components/card";
import Button from "~/components/button";
import Modal from "~/components/modal";
import StatsBarChart from "~/components/stats-bar-chart";
import { Table, Td, Th } from "~/components/table";
import {
    useGetBestSellerPlayersQuery,
    useGetHardestQuestionsForQuizQuery,
    useGetHardestQuestionsQuery,
    useGetQuestionDistributionQuery,
    useGetQuizDifficultyQuery,
    useGetStatsSummaryQuery,
    useGetTopAttendanceUsersQuery,
    useGetTopEarnedCoinsUsersQuery,
    useGetTopOverallUsersQuery,
    useGetTopValueUsersQuery,
    useGetUsersAttemptedAllQuizzesQuery,
    type AttemptedAllQuizUser,
    type BestSeller,
    type ChartPoint,
    type ChoiceDistributionOption,
    type HardestQuestion,
    type QuestionDistribution,
    type QuizDifficulty,
    type ReorderPermutation,
    type UserMetricRow,
    type WrittenAnswerGroup,
} from "~/features/insights/insightsApiSlice";
import type { Pagination as PaginationType, PageRequest } from "~/types/pagination";

const PAGE_SIZE = 10;

type ModalSection =
    | "overall"
    | "coins"
    | "value"
    | "attendance"
    | "attemptedAll"
    | "quizDifficulty"
    | "hardestQuestions"
    | "hardestQuestionsByQuiz"
    | "bestSellers";

const modalTitles: Record<ModalSection, string> = {
    overall: "Top Overall Rating",
    coins: "Top Earned Coins",
    value: "Best Rating Per 1,000 Spent",
    attendance: "Most Approved Attendances",
    attemptedAll: "Users Who Attempted All Quizzes",
    quizDifficulty: "Quiz Difficulty",
    hardestQuestions: "Hardest Questions Global",
    hardestQuestionsByQuiz: "Hardest Questions By Quiz",
    bestSellers: "Best Seller Players",
};

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Admin Stats" },
    ];
}

function createStaticPagination<T>(data: T[]): PaginationType<T> {
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

function renderCardState(isLoading: boolean, hasError: boolean, emptyMessage = "No data available.") {
    if (isLoading) {
        return <div className="py-10 text-center text-sm text-gray-500">Loading...</div>;
    }

    if (hasError) {
        return <div className="py-10 text-center text-sm text-red-600">Could not load this section.</div>;
    }

    return <div className="py-10 text-center text-sm text-gray-500">{emptyMessage}</div>;
}

function getPageRequest(page = 1, size = PAGE_SIZE): PageRequest {
    return { page, size };
}

function shouldShowLoadingPlaceholder(isLoading: boolean, isFetching?: boolean, pendingSelection?: boolean) {
    return isLoading || !!isFetching || !!pendingSelection;
}

function supportsDistribution(questionType?: string | null) {
    return questionType === "Choice"
        || questionType === "MultipleCorrectChoices"
        || questionType === "Written"
        || questionType === "Reorder";
}

const MAX_WRITTEN_BARS = 6;
const MAX_REORDER_ROWS = 6;

function buildLeaderboardComparisonChart(
    topOverallUsers: UserMetricRow[],
    topEarnedCoinsUsers: UserMetricRow[],
    topValueUsers: UserMetricRow[],
) {
    const chart = new Map<string, ChartPoint>();

    topOverallUsers.slice(0, 5).forEach((user) => {
        chart.set(user.username, {
            label: user.username,
            value: user.metricValue,
            secondaryValue: null,
        });
    });

    topEarnedCoinsUsers.slice(0, 5).forEach((user) => {
        const existing = chart.get(user.username);
        if (existing) {
            existing.secondaryValue = user.metricValue;
            return;
        }

        chart.set(user.username, {
            label: user.username,
            value: null,
            secondaryValue: user.metricValue,
        });
    });

    topValueUsers.slice(0, 5).forEach((user) => {
        const existing = chart.get(user.username);
        if (existing) {
            if (existing.secondaryValue === null) {
                existing.secondaryValue = user.metricValue;
            }
            return;
        }

        chart.set(user.username, {
            label: user.username,
            value: null,
            secondaryValue: user.metricValue,
        });
    });

    return Array.from(chart.values());
}

function toUserMetricChart(users: UserMetricRow[]) {
    return users.map((user) => ({
        label: user.username,
        value: user.metricValue,
        secondaryValue: null,
    }));
}

function toBestSellerChart(players: BestSeller[]) {
    return players.map((player) => ({
        label: player.name,
        value: player.count,
        secondaryValue: null,
    }));
}

function renderUserCell(user: {
    username: string;
    imageUrl: string | null;
}) {
    return (
        <div className="flex items-center justify-center gap-3">
            {user.imageUrl && (
                <img src={user.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
            )}
            <div className="font-medium text-gray-900">{user.username}</div>
        </div>
    );
}

function UserMetricTable({
    pagination,
    title,
    metricLabel,
    secondaryLabel,
    isLoading,
    hasError,
    hidePagination = false,
    onPageChange,
    selectedUserId,
}: {
    pagination?: PaginationType<UserMetricRow>;
    title?: string;
    metricLabel: string;
    secondaryLabel: string;
    isLoading: boolean;
    hasError: boolean;
    hidePagination?: boolean;
    onPageChange?: (page: number) => void;
    selectedUserId?: number | null;
}) {
    const users = pagination?.data ?? [];

    if (isLoading || hasError || users.length === 0 || !pagination) {
        return renderCardState(isLoading, hasError);
    }

    return (
        <Table
            pagination={pagination}
            hidePagination={hidePagination}
            onPageChange={onPageChange}
            header={(
                <tr>
                    <Th>#</Th>
                    <Th>Name</Th>
                    <Th>{secondaryLabel}</Th>
                    <Th>{metricLabel}</Th>
                </tr>
            )}
            body={(user: UserMetricRow) => (
                <tr
                    key={`${title ?? metricLabel}-${user.userId}`}
                    className={selectedUserId === user.userId ? "bg-amber-50" : ""}
                >
                    <Td>{user.rank}</Td>
                    <Td>{renderUserCell(user)}</Td>
                    <Td>{secondaryLabel === "Earned Coins" ? user.totalCoinsEarned : formatMetric(user.overallScore)}</Td>
                    <Td className="font-semibold text-gray-700">{formatMetric(user.metricValue)}</Td>
                </tr>
            )}
        />
    );
}

function AttemptedAllTable({
    pagination,
    isLoading,
    hasError,
    hidePagination = false,
    onPageChange,
}: {
    pagination?: PaginationType<AttemptedAllQuizUser>;
    isLoading: boolean;
    hasError: boolean;
    hidePagination?: boolean;
    onPageChange?: (page: number) => void;
}) {
    const users = pagination?.data ?? [];

    if (isLoading || hasError || users.length === 0 || !pagination) {
        return renderCardState(isLoading, hasError);
    }

    return (
        <Table
            pagination={pagination}
            hidePagination={hidePagination}
            onPageChange={onPageChange}
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
                    <Td>{renderUserCell(user)}</Td>
                    <Td>{formatMetric(user.overallScore)}</Td>
                    <Td>{user.totalCoinsEarned}</Td>
                    <Td>{user.attemptedQuizzesCount} / {user.publishedQuizzesCount}</Td>
                </tr>
            )}
        />
    );
}

function HardestQuestionsTable({
    pagination,
    isLoading,
    hasError,
    hidePagination = false,
    onPageChange,
    selectedQuestionId,
    pendingQuestionId,
    onSelectQuestion,
}: {
    pagination?: PaginationType<HardestQuestion>;
    isLoading: boolean;
    hasError: boolean;
    hidePagination?: boolean;
    onPageChange?: (page: number) => void;
    selectedQuestionId: number | null;
    pendingQuestionId?: number | null;
    onSelectQuestion: (questionId: number) => void;
}) {
    const questions = pagination?.data ?? [];

    if (isLoading || hasError || questions.length === 0 || !pagination) {
        return renderCardState(isLoading, hasError);
    }

    return (
        <Table
            pagination={pagination}
            hidePagination={hidePagination}
            onPageChange={onPageChange}
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
                    className={`cursor-pointer ${selectedQuestionId === question.questionId ? "bg-amber-50" : ""} ${pendingQuestionId === question.questionId ? "opacity-60" : ""}`}
                    onClick={() => onSelectQuestion(question.questionId)}
                >
                    <Td>{question.quizName}</Td>
                    <Td className="max-w-xs truncate text-left text-gray-700" title={question.questionTitle}>{question.questionTitle}</Td>
                    <Td>{percentage(question.accuracy)}</Td>
                    <Td>{question.attempts}</Td>
                </tr>
            )}
        />
    );
}

function QuizQuestionsTable({
    pagination,
    isLoading,
    hasError,
    hidePagination = false,
    onPageChange,
    selectedQuestionId,
    pendingQuestionId,
    onSelectQuestion,
}: {
    pagination?: PaginationType<HardestQuestion>;
    isLoading: boolean;
    hasError: boolean;
    hidePagination?: boolean;
    onPageChange?: (page: number) => void;
    selectedQuestionId?: number | null;
    pendingQuestionId?: number | null;
    onSelectQuestion?: (questionId: number) => void;
}) {
    const questions = pagination?.data ?? [];

    if (isLoading || hasError || !pagination) {
        return renderCardState(isLoading, hasError);
    }

    if (questions.length === 0) {
        return renderCardState(false, false, "No question data available for this quiz yet.");
    }

    return (
        <Table
            pagination={pagination}
            hidePagination={hidePagination}
            onPageChange={onPageChange}
            header={(
                <tr>
                    <Th>Question</Th>
                    <Th>Accuracy</Th>
                    <Th>Attempts</Th>
                </tr>
            )}
            body={(question: HardestQuestion) => (
                <tr
                    key={`quiz-question-${question.questionId}`}
                    className={`${onSelectQuestion ? "cursor-pointer" : ""} ${selectedQuestionId === question.questionId ? "bg-amber-50" : ""} ${pendingQuestionId === question.questionId ? "opacity-60" : ""}`}
                    onClick={() => onSelectQuestion?.(question.questionId)}
                >
                    <Td className="max-w-xs truncate text-left text-gray-700" title={question.questionTitle}>{question.questionTitle}</Td>
                    <Td>{percentage(question.accuracy)}</Td>
                    <Td>{question.attempts}</Td>
                </tr>
            )}
        />
    );
}

function aggregateWrittenAnswers(answers: WrittenAnswerGroup[]) {
    if (answers.length <= MAX_WRITTEN_BARS) {
        return {
            visibleAnswers: answers,
            otherCount: 0,
            otherPercentage: 0,
            hiddenGroupsCount: 0,
        };
    }

    const visibleAnswers = answers.slice(0, MAX_WRITTEN_BARS - 1);
    const hiddenAnswers = answers.slice(MAX_WRITTEN_BARS - 1);

    return {
        visibleAnswers,
        otherCount: hiddenAnswers.reduce((sum, answer) => sum + answer.count, 0),
        otherPercentage: hiddenAnswers.reduce((sum, answer) => sum + answer.percentage, 0),
        hiddenGroupsCount: hiddenAnswers.length,
    };
}

function DistributionBar({
    label,
    count,
    percentageValue,
    tone = "amber",
}: {
    label: string;
    count: number;
    percentageValue: number;
    tone?: "amber" | "blue" | "green";
}) {
    const trackClass = tone === "blue" ? "bg-blue-100" : tone === "green" ? "bg-green-100" : "bg-amber-100";
    const fillClass = tone === "blue" ? "bg-blue-600" : tone === "green" ? "bg-green-600" : "bg-amber-700";

    return (
        <div className="rounded-lg border border-gray-200 p-3">
            <div className="mb-2 flex items-start justify-between gap-3 text-sm">
                <span className="font-medium text-gray-900">{label}</span>
                <span className="shrink-0 text-xs font-semibold text-gray-500">
                    {count} responses • {percentage(percentageValue)}
                </span>
            </div>
            <div className={`h-2 overflow-hidden rounded-full ${trackClass}`}>
                <div
                    className={`h-full rounded-full transition-all ${fillClass}`}
                    style={{ width: `${Math.max(0, Math.min(percentageValue * 100, 100))}%` }}
                />
            </div>
        </div>
    );
}

function BestSellerTable({
    pagination,
    isLoading,
    hasError,
    hidePagination = false,
    onPageChange,
}: {
    pagination?: PaginationType<BestSeller>;
    isLoading: boolean;
    hasError: boolean;
    hidePagination?: boolean;
    onPageChange?: (page: number) => void;
}) {
    const players = pagination?.data ?? [];

    if (isLoading || hasError || players.length === 0 || !pagination) {
        return renderCardState(isLoading, hasError);
    }

    return (
        <Table
            pagination={pagination}
            hidePagination={hidePagination}
            onPageChange={onPageChange}
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
    );
}

function DistributionPanel({
    distribution,
    isLoading,
    hasError,
    emptyMessage = "Select a question to inspect its answer distribution.",
}: {
    distribution?: QuestionDistribution | null;
    isLoading: boolean;
    hasError: boolean;
    emptyMessage?: string;
}) {
    if (isLoading) {
        return renderCardState(true, false);
    }

    if (hasError) {
        return renderCardState(false, true);
    }

    if (!distribution) {
        return <div className="py-6 text-sm text-gray-500">{emptyMessage}</div>;
    }

    const header = (
        <div>
            <div className="text-sm font-semibold text-amber-700">{distribution.quizName}</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">{distribution.questionTitle}</div>
            <div className="mt-1 text-sm text-gray-500">
                Responses: {distribution.totalResponses}
                {distribution.distributionType !== "choice"
                    ? ` • Distinct patterns: ${distribution.distinctAnswers}`
                    : ""}
            </div>
        </div>
    );

    if (distribution.distributionType === "choice") {
        return (
            <div className="space-y-4">
                {header}
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
                                    style={{ width: `${Math.max(0, Math.min(option.picksPercentage * 100, 100))}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (distribution.distributionType === "written") {
        const { visibleAnswers, otherCount, otherPercentage, hiddenGroupsCount } = aggregateWrittenAnswers(distribution.answers);

        return (
            <div className="space-y-4">
                {header}
                <div className="space-y-3">
                    {visibleAnswers.map((answer) => (
                        <DistributionBar
                            key={answer.normalizedAnswer}
                            label={answer.displayAnswer}
                            count={answer.count}
                            percentageValue={answer.percentage}
                            tone="blue"
                        />
                    ))}
                    {otherCount > 0 && (
                        <DistributionBar
                            label={`Other answers (${hiddenGroupsCount} groups)`}
                            count={otherCount}
                            percentageValue={otherPercentage}
                            tone="amber"
                        />
                    )}
                </div>
            </div>
        );
    }

    const visiblePermutations = distribution.permutations.slice(0, MAX_REORDER_ROWS);
    const hiddenPermutationsCount = Math.max(distribution.permutations.length - visiblePermutations.length, 0);

    return (
        <div className="space-y-4">
            {header}
            <div className="space-y-3">
                {visiblePermutations.map((permutation: ReorderPermutation) => (
                    <div key={permutation.optionOrders.join("-")} className="rounded-lg border border-gray-200 p-3">
                        <div className="mb-2 flex items-start justify-between gap-3 text-sm">
                            <span className="font-medium text-gray-900">{permutation.sequenceLabel}</span>
                            <span className={permutation.correct ? "font-semibold text-green-700" : "text-gray-500"}>
                                {permutation.count} responses • {percentage(permutation.percentage)}
                            </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                                className={`h-full rounded-full ${permutation.correct ? "bg-green-500" : "bg-blue-500"}`}
                                style={{ width: `${Math.max(0, Math.min(permutation.percentage * 100, 100))}%` }}
                            />
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            {permutation.correct ? "Correct order" : "Common submitted order"}
                        </div>
                    </div>
                ))}
                {hiddenPermutationsCount > 0 && (
                    <div className="text-xs text-gray-500">
                        {hiddenPermutationsCount} additional low-frequency permutations are hidden.
                    </div>
                )}
            </div>
        </div>
    );
}

function QuizSelector({
    quizzes,
    selectedQuizSlug,
    pendingQuizSlug,
    onSelect,
}: {
    quizzes: QuizDifficulty[];
    selectedQuizSlug: string;
    pendingQuizSlug?: string | null;
    onSelect: (slug: string) => void;
}) {
    if (quizzes.length === 0) {
        return <div className="text-sm text-gray-500">No quizzes available yet.</div>;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {quizzes.map((quiz) => (
                <Button
                    key={quiz.quizSlug}
                    color={selectedQuizSlug === quiz.quizSlug && pendingQuizSlug !== quiz.quizSlug ? "primary" : "gray"}
                    width="w-auto"
                    onClick={() => onSelect(quiz.quizSlug)}
                    className={pendingQuizSlug === quiz.quizSlug ? "opacity-70" : ""}
                >
                    {pendingQuizSlug === quiz.quizSlug ? `Loading ${quiz.quizName}...` : quiz.quizName}
                </Button>
            ))}
        </div>
    );
}

function ViewAllCard({
    title,
    onViewAll,
    children,
}: {
    title: string;
    onViewAll: () => void;
    children: React.ReactNode;
}) {
    return (
        <Card title={title} className="h-full">
            <div className="flex justify-end">
                <Button color="gray" width="w-auto mb-6" onClick={onViewAll}>
                    View all
                </Button>
            </div>
            {children}
        </Card>
    );
}

function FullscreenInsightsModal({
    open,
    title,
    onClose,
    children,
}: {
    open: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <Modal open={open} onClose={onClose} panelClassName="!p-0 h-[94vh] max-h-[94vh] sm:max-w-[94vw] xl:max-w-[90vw] overflow-y-auto">
            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    <Button color="gray" width="w-auto" onClick={onClose}>
                        Close
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {children}
                </div>
            </div>
        </Modal>
    );
}

export default function InsightsStats() {
    const [selectedQuizSlug, setSelectedQuizSlug] = useState("");
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
    const [pendingQuestionId, setPendingQuestionId] = useState<number | null>(null);
    const [pendingQuizSlug, setPendingQuizSlug] = useState<string | null>(null);
    const [selectedQuizQuestionId, setSelectedQuizQuestionId] = useState<number | null>(null);
    const [pendingQuizQuestionId, setPendingQuizQuestionId] = useState<number | null>(null);
    const [activeModal, setActiveModal] = useState<ModalSection | null>(null);
    const [modalPage, setModalPage] = useState(1);
    const [modalSelectedQuizSlug, setModalSelectedQuizSlug] = useState("");
    const [modalSelectedQuestionId, setModalSelectedQuestionId] = useState<number | null>(null);
    const [modalPendingQuestionId, setModalPendingQuestionId] = useState<number | null>(null);
    const [modalPendingQuizSlug, setModalPendingQuizSlug] = useState<string | null>(null);
    const [modalSelectedQuizQuestionId, setModalSelectedQuizQuestionId] = useState<number | null>(null);
    const [modalPendingQuizQuestionId, setModalPendingQuizQuestionId] = useState<number | null>(null);

    const previewRequest = useMemo(() => getPageRequest(), []);

    const { data: summary, isLoading: isSummaryLoading, error: summaryError } = useGetStatsSummaryQuery();
    const { data: overallPage, isLoading: isOverallLoading, error: overallError } = useGetTopOverallUsersQuery(previewRequest);
    const { data: earnedCoinsPage, isLoading: isCoinsLoading, error: coinsError } = useGetTopEarnedCoinsUsersQuery(previewRequest);
    const { data: valuePage, isLoading: isValueLoading, error: valueError } = useGetTopValueUsersQuery(previewRequest);
    const { data: attendancePage, isLoading: isAttendanceLoading, error: attendanceError } = useGetTopAttendanceUsersQuery(previewRequest);
    const { data: quizDifficulty = [], isLoading: isQuizDifficultyLoading, error: quizDifficultyError } = useGetQuizDifficultyQuery();
    const { data: hardestQuestionsPage, isLoading: isHardestQuestionsLoading, error: hardestQuestionsError } = useGetHardestQuestionsQuery(previewRequest);
    const selectedQuestion = hardestQuestionsPage?.data.find((question) => question.questionId === selectedQuestionId) ?? null;
    const { data: distribution, isLoading: isDistributionLoading, isFetching: isDistributionFetching, error: distributionError } = useGetQuestionDistributionQuery(selectedQuestionId ?? 0, {
        skip: selectedQuestionId === null || !supportsDistribution(selectedQuestion?.questionType),
    });
    const { data: bestSellerPage, isLoading: isBestSellerLoading, error: bestSellerError } = useGetBestSellerPlayersQuery(previewRequest);
    const { data: attemptedAllPage, isLoading: isAttemptedAllLoading, error: attemptedAllError } = useGetUsersAttemptedAllQuizzesQuery(previewRequest);
    const {
        data: hardestQuestionsByQuizPage,
        isLoading: isHardestQuestionsByQuizLoading,
        isFetching: isHardestQuestionsByQuizFetching,
        error: hardestQuestionsByQuizError,
    } = useGetHardestQuestionsForQuizQuery(
        { slug: selectedQuizSlug, ...previewRequest },
        { skip: !selectedQuizSlug },
    );
    const selectedQuizQuestion = hardestQuestionsByQuizPage?.data.find((question) => question.questionId === selectedQuizQuestionId) ?? null;
    const {
        data: quizDistribution,
        isLoading: isQuizDistributionLoading,
        isFetching: isQuizDistributionFetching,
        error: quizDistributionError,
    } = useGetQuestionDistributionQuery(selectedQuizQuestionId ?? 0, {
        skip: selectedQuizQuestionId === null || !supportsDistribution(selectedQuizQuestion?.questionType),
    });

    const modalRequest = useMemo(() => getPageRequest(modalPage, PAGE_SIZE), [modalPage]);
    const overallModalPage = useGetTopOverallUsersQuery(modalRequest, { skip: activeModal !== "overall" });
    const coinsModalPage = useGetTopEarnedCoinsUsersQuery(modalRequest, { skip: activeModal !== "coins" });
    const valueModalPage = useGetTopValueUsersQuery(modalRequest, { skip: activeModal !== "value" });
    const attendanceModalPage = useGetTopAttendanceUsersQuery(modalRequest, { skip: activeModal !== "attendance" });
    const attemptedAllModalPage = useGetUsersAttemptedAllQuizzesQuery(modalRequest, { skip: activeModal !== "attemptedAll" });
    const hardestQuestionsModalPage = useGetHardestQuestionsQuery(modalRequest, { skip: activeModal !== "hardestQuestions" });
    const bestSellerModalPage = useGetBestSellerPlayersQuery(modalRequest, { skip: activeModal !== "bestSellers" });
    const hardestQuestionsByQuizModalPage = useGetHardestQuestionsForQuizQuery(
        { slug: modalSelectedQuizSlug, ...modalRequest },
        { skip: activeModal !== "hardestQuestionsByQuiz" || !modalSelectedQuizSlug },
    );
    const modalSelectedQuizQuestion = hardestQuestionsByQuizModalPage.data?.data.find(
        (question) => question.questionId === modalSelectedQuizQuestionId,
    ) ?? null;
    const {
        data: modalDistribution,
        isLoading: isModalDistributionLoading,
        isFetching: isModalDistributionFetching,
        error: modalDistributionError,
    } = useGetQuestionDistributionQuery(modalSelectedQuestionId ?? 0, {
        skip: activeModal !== "hardestQuestions"
            || modalSelectedQuestionId === null
            || !supportsDistribution(
                hardestQuestionsModalPage.data?.data.find((question) => question.questionId === modalSelectedQuestionId)?.questionType,
            ),
    });
    const {
        data: modalQuizDistribution,
        isLoading: isModalQuizDistributionLoading,
        isFetching: isModalQuizDistributionFetching,
        error: modalQuizDistributionError,
    } = useGetQuestionDistributionQuery(modalSelectedQuizQuestionId ?? 0, {
        skip: activeModal !== "hardestQuestionsByQuiz"
            || modalSelectedQuizQuestionId === null
            || !supportsDistribution(modalSelectedQuizQuestion?.questionType),
    });

    useEffect(() => {
        if (!selectedQuizSlug && quizDifficulty.length > 0) {
            setSelectedQuizSlug(quizDifficulty[0].quizSlug);
        }
    }, [quizDifficulty, selectedQuizSlug]);

    useEffect(() => {
        if (!isHardestQuestionsByQuizFetching) {
            setPendingQuizSlug(null);
        }
    }, [isHardestQuestionsByQuizFetching, hardestQuestionsByQuizPage]);

    useEffect(() => {
        const firstQuestionId = hardestQuestionsByQuizPage?.data[0]?.questionId ?? null;
        if (firstQuestionId !== null && !hardestQuestionsByQuizPage?.data.some((question) => question.questionId === selectedQuizQuestionId)) {
            setSelectedQuizQuestionId(firstQuestionId);
        }
    }, [hardestQuestionsByQuizPage, selectedQuizQuestionId]);

    useEffect(() => {
        if (!isDistributionFetching) {
            setPendingQuestionId(null);
        }
    }, [isDistributionFetching, distribution]);

    useEffect(() => {
        if (!isQuizDistributionFetching) {
            setPendingQuizQuestionId(null);
        }
    }, [isQuizDistributionFetching, quizDistribution]);

    useEffect(() => {
        const firstQuestionId = hardestQuestionsPage?.data[0]?.questionId;
        if (selectedQuestionId === null && firstQuestionId) {
            setSelectedQuestionId(firstQuestionId);
        }
    }, [hardestQuestionsPage, selectedQuestionId]);

    useEffect(() => {
        if (!activeModal) {
            return;
        }

        setModalPage(1);
    }, [activeModal]);

    useEffect(() => {
        if (activeModal !== "hardestQuestions") {
            return;
        }

        const firstQuestionId = hardestQuestionsModalPage.data?.data[0]?.questionId ?? null;
        if (firstQuestionId !== null && modalSelectedQuestionId === null) {
            setModalSelectedQuestionId(firstQuestionId);
        }
    }, [activeModal, hardestQuestionsModalPage.data, modalSelectedQuestionId]);

    useEffect(() => {
        if (activeModal === "hardestQuestions") {
            setModalSelectedQuestionId(null);
        }
    }, [modalPage]);

    useEffect(() => {
        if (activeModal !== "hardestQuestionsByQuiz") {
            return;
        }

        const firstQuestionId = hardestQuestionsByQuizModalPage.data?.data[0]?.questionId ?? null;
        if (firstQuestionId !== null && !hardestQuestionsByQuizModalPage.data?.data.some((question) => question.questionId === modalSelectedQuizQuestionId)) {
            setModalSelectedQuizQuestionId(firstQuestionId);
        }
    }, [activeModal, hardestQuestionsByQuizModalPage.data, modalSelectedQuizQuestionId]);

    useEffect(() => {
        if (!hardestQuestionsModalPage.isFetching) {
            setModalPendingQuestionId(null);
        }
    }, [hardestQuestionsModalPage.isFetching, hardestQuestionsModalPage.data]);

    useEffect(() => {
        if (!hardestQuestionsByQuizModalPage.isFetching) {
            setModalPendingQuizSlug(null);
        }
    }, [hardestQuestionsByQuizModalPage.isFetching, hardestQuestionsByQuizModalPage.data]);

    useEffect(() => {
        if (!isModalDistributionFetching) {
            setModalPendingQuestionId(null);
        }
    }, [isModalDistributionFetching, modalDistribution]);

    useEffect(() => {
        if (!isModalQuizDistributionFetching) {
            setModalPendingQuizQuestionId(null);
        }
    }, [isModalQuizDistributionFetching, modalQuizDistribution]);

    const summaryCards = useMemo(() => {
        if (!summary) {
            return [];
        }

        return [
            { label: "Users", value: summary.usersCount },
            { label: "Quizzes", value: summary.quizzesCount },
            { label: "Questions", value: summary.questionsCount },
            { label: "Approved Attendances", value: summary.approvedAttendancesCount },
        ];
    }, [summary]);

    const overallUsers = overallPage?.data ?? [];
    const earnedCoinUsers = earnedCoinsPage?.data ?? [];
    const valueUsers = valuePage?.data ?? [];
    const attendanceUsers = attendancePage?.data ?? [];
    const hardestQuestions = hardestQuestionsPage?.data ?? [];
    const bestSellerPlayers = bestSellerPage?.data ?? [];

    const hardestQuizzes = useMemo(
        () => quizDifficulty.slice(0, 5),
        [quizDifficulty],
    );

    const easiestQuizzes = useMemo(
        () => [...quizDifficulty]
            .sort((left, right) => {
                if (right.accuracy !== left.accuracy) {
                    return right.accuracy - left.accuracy;
                }

                if (right.submissionsCount !== left.submissionsCount) {
                    return right.submissionsCount - left.submissionsCount;
                }

                return left.quizId - right.quizId;
            })
            .slice(0, 5),
        [quizDifficulty],
    );

    const quizDifficultyChart = useMemo(
        () => hardestQuizzes.map((quiz) => ({
            label: quiz.quizName,
            value: Number((quiz.accuracy * 100).toFixed(2)),
            secondaryValue: null,
        })),
        [hardestQuizzes],
    );

    const attendanceChart = useMemo(
        () => toUserMetricChart(attendanceUsers),
        [attendanceUsers],
    );

    const bestSellerChart = useMemo(
        () => toBestSellerChart(bestSellerPlayers),
        [bestSellerPlayers],
    );

    const leaderboardComparisonChart = useMemo(
        () => buildLeaderboardComparisonChart(overallUsers, earnedCoinUsers, valueUsers),
        [earnedCoinUsers, overallUsers, valueUsers],
    );

    function openModal(section: ModalSection) {
        setActiveModal(section);

        if (section === "hardestQuestions") {
            setModalSelectedQuestionId(selectedQuestionId);
        }

        if (section === "hardestQuestionsByQuiz") {
            setModalSelectedQuizSlug(selectedQuizSlug || quizDifficulty[0]?.quizSlug || "");
            setModalSelectedQuizQuestionId(selectedQuizQuestionId);
        }
    }

    function closeModal() {
        setActiveModal(null);
        setModalPendingQuestionId(null);
        setModalPendingQuizSlug(null);
        setModalPendingQuizQuestionId(null);
    }

    function renderModalBody() {
        if (!activeModal) {
            return null;
        }

        if (activeModal === "overall") {
            return (
                <div className="space-y-8">
                    <div>
                        <div className="mb-3 text-sm font-semibold text-gray-700">Leaderboard</div>
                        <UserMetricTable
                            pagination={overallModalPage.data}
                            metricLabel="Overall Score"
                            secondaryLabel="Earned Coins"
                            isLoading={overallModalPage.isLoading}
                            hasError={!!overallModalPage.error}
                            onPageChange={setModalPage}
                        />
                    </div>
                    <div>
                        <div className="mb-3 text-sm font-semibold text-gray-700">Chart</div>
                        <StatsBarChart data={toUserMetricChart(overallModalPage.data?.data ?? [])} />
                    </div>
                </div>
            );
        }

        if (activeModal === "coins") {
            return (
                <div className="space-y-8">
                    <div>
                        <div className="mb-3 text-sm font-semibold text-gray-700">Leaderboard</div>
                        <UserMetricTable
                            pagination={coinsModalPage.data}
                            metricLabel="Earned Coins"
                            secondaryLabel="Overall Rating"
                            isLoading={coinsModalPage.isLoading}
                            hasError={!!coinsModalPage.error}
                            onPageChange={setModalPage}
                        />
                    </div>
                    <div>
                        <div className="mb-3 text-sm font-semibold text-gray-700">Chart</div>
                        <StatsBarChart data={toUserMetricChart(coinsModalPage.data?.data ?? [])} />
                    </div>
                </div>
            );
        }

        if (activeModal === "value") {
            return (
                <div className="space-y-8">
                    <div>
                        <div className="mb-3 text-sm font-semibold text-gray-700">Leaderboard</div>
                        <UserMetricTable
                            pagination={valueModalPage.data}
                            metricLabel="Value Score"
                            secondaryLabel="Overall Rating"
                            isLoading={valueModalPage.isLoading}
                            hasError={!!valueModalPage.error}
                            onPageChange={setModalPage}
                        />
                    </div>
                    <div>
                        <div className="mb-3 text-sm font-semibold text-gray-700">Chart</div>
                        <StatsBarChart data={toUserMetricChart(valueModalPage.data?.data ?? [])} />
                    </div>
                </div>
            );
        }

        if (activeModal === "attendance") {
            return (
                <div className="space-y-8">
                    <div>
                        <div className="mb-3 text-sm font-semibold text-gray-700">Leaderboard</div>
                        <UserMetricTable
                            pagination={attendanceModalPage.data}
                            metricLabel="Approved Count"
                            secondaryLabel="Overall Rating"
                            isLoading={attendanceModalPage.isLoading}
                            hasError={!!attendanceModalPage.error}
                            onPageChange={setModalPage}
                        />
                    </div>
                    <div>
                        <div className="mb-3 text-sm font-semibold text-gray-700">Chart</div>
                        <StatsBarChart data={toUserMetricChart(attendanceModalPage.data?.data ?? [])} />
                    </div>
                </div>
            );
        }

        if (activeModal === "attemptedAll") {
            return (
                <AttemptedAllTable
                    pagination={attemptedAllModalPage.data}
                    isLoading={attemptedAllModalPage.isLoading}
                    hasError={!!attemptedAllModalPage.error}
                    onPageChange={setModalPage}
                />
            );
        }

        if (activeModal === "quizDifficulty") {
            return (
                <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                    <div className="space-y-8">
                        <div>
                            <div className="mb-3 text-sm font-semibold text-red-700">Hardest Quizzes</div>
                            {isQuizDifficultyLoading || quizDifficultyError || hardestQuizzes.length === 0 ? renderCardState(isQuizDifficultyLoading, !!quizDifficultyError) : (
                                <Table
                                    pagination={createStaticPagination(hardestQuizzes)}
                                    hidePagination
                                    header={(
                                        <tr>
                                            <Th>Quiz</Th>
                                            <Th>Accuracy</Th>
                                            <Th>Submissions</Th>
                                        </tr>
                                    )}
                                    body={(quiz: QuizDifficulty) => (
                                        <tr key={`modal-hard-${quiz.quizId}`}>
                                            <Td>{quiz.quizName}</Td>
                                            <Td>{percentage(quiz.accuracy)}</Td>
                                            <Td>{quiz.submissionsCount}</Td>
                                        </tr>
                                    )}
                                />
                            )}
                        </div>
                        <div>
                            <div className="mb-3 text-sm font-semibold text-green-700">Easiest Quizzes</div>
                            {isQuizDifficultyLoading || quizDifficultyError || easiestQuizzes.length === 0 ? renderCardState(isQuizDifficultyLoading, !!quizDifficultyError) : (
                                <Table
                                    pagination={createStaticPagination(easiestQuizzes)}
                                    hidePagination
                                    header={(
                                        <tr>
                                            <Th>Quiz</Th>
                                            <Th>Accuracy</Th>
                                            <Th>Submissions</Th>
                                        </tr>
                                    )}
                                    body={(quiz: QuizDifficulty) => (
                                        <tr key={`modal-easy-${quiz.quizId}`}>
                                            <Td>{quiz.quizName}</Td>
                                            <Td>{percentage(quiz.accuracy)}</Td>
                                            <Td>{quiz.submissionsCount}</Td>
                                        </tr>
                                    )}
                                />
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="mb-3 text-sm font-semibold text-gray-700">Chart</div>
                        {isQuizDifficultyLoading || quizDifficultyError ? renderCardState(isQuizDifficultyLoading, !!quizDifficultyError) : (
                            <StatsBarChart data={quizDifficultyChart} valueSuffix="%" />
                        )}
                    </div>
                </div>
            );
        }

        if (activeModal === "hardestQuestions") {
            return (
                <div className="grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
                    <div>
                        <HardestQuestionsTable
                            pagination={hardestQuestionsModalPage.data}
                            isLoading={hardestQuestionsModalPage.isLoading}
                            hasError={!!hardestQuestionsModalPage.error}
                            onPageChange={setModalPage}
                            selectedQuestionId={modalSelectedQuestionId}
                            pendingQuestionId={modalPendingQuestionId}
                            onSelectQuestion={(questionId) => {
                                if (questionId === modalSelectedQuestionId) {
                                    return;
                                }

                                setModalPendingQuestionId(questionId);
                                setModalSelectedQuestionId(questionId);
                            }}
                        />
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4">
                        <div className="mb-4 text-sm font-semibold text-amber-700">Question Distribution</div>
                        <DistributionPanel
                            distribution={modalPendingQuestionId ? null : modalDistribution}
                            isLoading={shouldShowLoadingPlaceholder(
                                isModalDistributionLoading,
                                isModalDistributionFetching,
                                !!modalPendingQuestionId,
                            )}
                            hasError={!!modalDistributionError}
                            emptyMessage={
                                (() => {
                                    const modalSelectedQuestion = hardestQuestionsModalPage.data?.data.find(
                                        (question) => question.questionId === modalSelectedQuestionId,
                                    );

                                    if (modalSelectedQuestion && !supportsDistribution(modalSelectedQuestion.questionType)) {
                                        return "Distribution is not available for this question.";
                                    }

                                    return undefined;
                                })()
                            }
                        />
                    </div>
                </div>
            );
        }

        if (activeModal === "hardestQuestionsByQuiz") {
            return (
                <div className="grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
                    <div className="space-y-6">
                        <QuizSelector
                            quizzes={quizDifficulty}
                            selectedQuizSlug={modalSelectedQuizSlug}
                            pendingQuizSlug={modalPendingQuizSlug}
                            onSelect={(slug) => {
                                if (slug === modalSelectedQuizSlug) {
                                    return;
                                }

                                setModalPendingQuizSlug(slug);
                                setModalSelectedQuizSlug(slug);
                                setModalSelectedQuizQuestionId(null);
                                setModalPage(1);
                            }}
                        />
                        <QuizQuestionsTable
                            pagination={modalPendingQuizSlug ? undefined : hardestQuestionsByQuizModalPage.data}
                            isLoading={shouldShowLoadingPlaceholder(
                                isHardestQuestionsByQuizLoading || hardestQuestionsByQuizModalPage.isLoading,
                                hardestQuestionsByQuizModalPage.isFetching,
                                !!modalPendingQuizSlug,
                            )}
                            hasError={!!hardestQuestionsByQuizError || !!hardestQuestionsByQuizModalPage.error}
                            onPageChange={setModalPage}
                            selectedQuestionId={modalSelectedQuizQuestionId}
                            pendingQuestionId={modalPendingQuizQuestionId}
                            onSelectQuestion={(questionId) => {
                                if (questionId === modalSelectedQuizQuestionId) {
                                    return;
                                }

                                setModalPendingQuizQuestionId(questionId);
                                setModalSelectedQuizQuestionId(questionId);
                            }}
                        />
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4">
                        <div className="mb-4 text-sm font-semibold text-amber-700">Question Distribution</div>
                        <DistributionPanel
                            distribution={modalPendingQuizQuestionId ? null : modalQuizDistribution}
                            isLoading={shouldShowLoadingPlaceholder(
                                isModalQuizDistributionLoading,
                                isModalQuizDistributionFetching,
                                !!modalPendingQuizQuestionId,
                            )}
                            hasError={!!modalQuizDistributionError}
                            emptyMessage={modalSelectedQuizQuestion && !supportsDistribution(modalSelectedQuizQuestion.questionType)
                                ? "Distribution is not available for this question."
                                : undefined}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                <div>
                    <div className="mb-3 text-sm font-semibold text-gray-700">Players</div>
                    <BestSellerTable
                        pagination={bestSellerModalPage.data}
                        isLoading={bestSellerModalPage.isLoading}
                        hasError={!!bestSellerModalPage.error}
                        onPageChange={setModalPage}
                    />
                </div>
                <div>
                    <div className="mb-3 text-sm font-semibold text-gray-700">Chart</div>
                    <StatsBarChart data={toBestSellerChart(bestSellerModalPage.data?.data ?? [])} />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-8">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <Card key={card.label} className="border border-amber-100 bg-gradient-to-br from-white to-amber-50">
                            <div className="text-sm font-semibold uppercase tracking-wide text-amber-700">{card.label}</div>
                            <div className="mt-3 text-3xl font-bold text-gray-900">{card.value}</div>
                        </Card>
                    ))}

                    {summaryCards.length === 0 && (
                        <Card className="border border-amber-100 bg-gradient-to-br from-white to-amber-50 sm:col-span-2 xl:col-span-4">
                            {renderCardState(isSummaryLoading, !!summaryError, "No summary data available.")}
                        </Card>
                    )}
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <ViewAllCard title="Top Overall Rating" onViewAll={() => openModal("overall")}>
                        <UserMetricTable
                            pagination={overallPage}
                            title="overall"
                            metricLabel="Overall Score"
                            secondaryLabel="Earned Coins"
                            isLoading={isOverallLoading}
                            hasError={!!overallError}
                            hidePagination
                        />
                    </ViewAllCard>
                    <ViewAllCard title="Top Earned Coins" onViewAll={() => openModal("coins")}>
                        <UserMetricTable
                            pagination={earnedCoinsPage}
                            title="coins"
                            metricLabel="Earned Coins"
                            secondaryLabel="Overall Rating"
                            isLoading={isCoinsLoading}
                            hasError={!!coinsError}
                            hidePagination
                        />
                    </ViewAllCard>
                    <ViewAllCard title="Best Rating Per 1,000 Spent" onViewAll={() => openModal("value")}>
                        <UserMetricTable
                            pagination={valuePage}
                            title="value"
                            metricLabel="Value Score"
                            secondaryLabel="Overall Rating"
                            isLoading={isValueLoading}
                            hasError={!!valueError}
                            hidePagination
                        />
                    </ViewAllCard>
                    <ViewAllCard title="Most Approved Attendances" onViewAll={() => openModal("attendance")}>
                        <UserMetricTable
                            pagination={attendancePage}
                            title="attendance"
                            metricLabel="Approved Count"
                            secondaryLabel="Overall Rating"
                            isLoading={isAttendanceLoading}
                            hasError={!!attendanceError}
                            hidePagination
                        />
                    </ViewAllCard>
                </div>

                <ViewAllCard title="Users Who Attempted All Quizzes" onViewAll={() => openModal("attemptedAll")}>
                    <AttemptedAllTable
                        pagination={attemptedAllPage}
                        isLoading={isAttemptedAllLoading}
                        hasError={!!attemptedAllError}
                        hidePagination
                    />
                </ViewAllCard>

                <div className="grid gap-6 xl:grid-cols-2">
                    <ViewAllCard title="Quiz Difficulty" onViewAll={() => openModal("quizDifficulty")}>
                        {(isQuizDifficultyLoading || quizDifficultyError || quizDifficulty.length === 0) ? renderCardState(isQuizDifficultyLoading, !!quizDifficultyError) : (
                            <div className="grid gap-6 lg:grid-cols-2">
                                <div>
                                    <h3 className="text-sm font-semibold text-red-700">Hardest Quizzes</h3>
                                    <Table
                                        pagination={createStaticPagination(hardestQuizzes)}
                                        hidePagination
                                        header={(
                                            <tr>
                                                <Th>Quiz</Th>
                                                <Th>Accuracy</Th>
                                                <Th>Submissions</Th>
                                            </tr>
                                        )}
                                        body={(quiz: QuizDifficulty) => (
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
                                        pagination={createStaticPagination(easiestQuizzes)}
                                        hidePagination
                                        header={(
                                            <tr>
                                                <Th>Quiz</Th>
                                                <Th>Accuracy</Th>
                                                <Th>Submissions</Th>
                                            </tr>
                                        )}
                                        body={(quiz: QuizDifficulty) => (
                                            <tr key={`easy-${quiz.quizId}`}>
                                                <Td>{quiz.quizName}</Td>
                                                <Td>{percentage(quiz.accuracy)}</Td>
                                                <Td>{quiz.submissionsCount}</Td>
                                            </tr>
                                        )}
                                    />
                                </div>
                            </div>
                        )}
                    </ViewAllCard>

                    <Card title="Quiz Difficulty Chart">
                        {(isQuizDifficultyLoading || quizDifficultyError) ? renderCardState(isQuizDifficultyLoading, !!quizDifficultyError) : (
                            <StatsBarChart data={quizDifficultyChart} valueSuffix="%" />
                        )}
                    </Card>
                </div>

                <ViewAllCard title="Hardest Questions Global" onViewAll={() => openModal("hardestQuestions")}>
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)]">
                        <HardestQuestionsTable
                            pagination={hardestQuestionsPage}
                            isLoading={isHardestQuestionsLoading}
                            hasError={!!hardestQuestionsError}
                            hidePagination
                            selectedQuestionId={selectedQuestionId}
                            pendingQuestionId={pendingQuestionId}
                            onSelectQuestion={(questionId) => {
                                if (questionId === selectedQuestionId) {
                                    return;
                                }

                                setPendingQuestionId(questionId);
                                setSelectedQuestionId(questionId);
                            }}
                        />
                        <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4">
                            <div className="mb-4 text-sm font-semibold text-amber-700">Question Distribution</div>
                            <DistributionPanel
                                distribution={pendingQuestionId ? null : distribution}
                                isLoading={shouldShowLoadingPlaceholder(
                                    isDistributionLoading,
                                    isDistributionFetching,
                                    !!pendingQuestionId,
                                )}
                                hasError={!!distributionError}
                                emptyMessage={selectedQuestion && !supportsDistribution(selectedQuestion.questionType)
                                    ? "Distribution is not available for this question."
                                    : undefined}
                            />
                        </div>
                    </div>
                </ViewAllCard>

                <ViewAllCard title="Hardest Questions By Quiz" onViewAll={() => openModal("hardestQuestionsByQuiz")}>
                    <div className="space-y-4">
                        <QuizSelector
                            quizzes={quizDifficulty}
                            selectedQuizSlug={selectedQuizSlug}
                            pendingQuizSlug={pendingQuizSlug}
                            onSelect={(slug) => {
                                if (slug === selectedQuizSlug) {
                                    return;
                                }

                                setPendingQuizSlug(slug);
                                setSelectedQuizSlug(slug);
                                setSelectedQuizQuestionId(null);
                            }}
                        />
                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)]">
                            <QuizQuestionsTable
                                pagination={pendingQuizSlug ? undefined : hardestQuestionsByQuizPage}
                                isLoading={shouldShowLoadingPlaceholder(
                                    isQuizDifficultyLoading || isHardestQuestionsByQuizLoading,
                                    isHardestQuestionsByQuizFetching,
                                    !!pendingQuizSlug,
                                )}
                                hasError={!!quizDifficultyError || !!hardestQuestionsByQuizError}
                                hidePagination
                                selectedQuestionId={selectedQuizQuestionId}
                                pendingQuestionId={pendingQuizQuestionId}
                                onSelectQuestion={(questionId) => {
                                    if (questionId === selectedQuizQuestionId) {
                                        return;
                                    }

                                    setPendingQuizQuestionId(questionId);
                                    setSelectedQuizQuestionId(questionId);
                                }}
                            />
                            <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4">
                                <div className="mb-4 text-sm font-semibold text-amber-700">Question Distribution</div>
                                <DistributionPanel
                                    distribution={pendingQuizQuestionId ? null : quizDistribution}
                                    isLoading={shouldShowLoadingPlaceholder(
                                        isQuizDistributionLoading,
                                        isQuizDistributionFetching,
                                        !!pendingQuizQuestionId,
                                    )}
                                    hasError={!!quizDistributionError}
                                    emptyMessage={selectedQuizQuestion && !supportsDistribution(selectedQuizQuestion.questionType)
                                        ? "Distribution is not available for this question."
                                        : undefined}
                                />
                            </div>
                        </div>
                    </div>
                </ViewAllCard>

                <div className="grid gap-6 xl:grid-cols-1">
                    <ViewAllCard title="Best Seller Players" onViewAll={() => openModal("bestSellers")}>
                        <BestSellerTable
                            pagination={bestSellerPage}
                            isLoading={isBestSellerLoading}
                            hasError={!!bestSellerError}
                            hidePagination
                        />
                    </ViewAllCard>
                </div>
            </div>

            <FullscreenInsightsModal
                open={activeModal !== null}
                title={activeModal ? modalTitles[activeModal] : ""}
                onClose={closeModal}
            >
                {renderModalBody()}
            </FullscreenInsightsModal>
        </>
    );
}
