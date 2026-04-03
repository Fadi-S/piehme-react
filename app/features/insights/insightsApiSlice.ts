import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ROOT_URL } from "~/base/consts";
import { defaultHeaders } from "~/base/helpers";

interface UserMetricRow {
    rank: number;
    userId: number;
    username: string;
    imageUrl: string | null;
    imageKey: string | null;
    lineupRating: number;
    chemistry: number;
    overallScore: number;
    currentCoins: number;
    totalCoinsEarned: number;
    metricValue: number;
}

interface QuizDifficulty {
    quizId: number;
    quizSlug: string;
    quizName: string;
    submissionsCount: number;
    totalAnswers: number;
    correctAnswers: number;
    accuracy: number;
}

interface HardestQuestion {
    quizId: number;
    quizSlug: string;
    quizName: string;
    questionId: number;
    questionTitle: string;
    questionType: string;
    attempts: number;
    correctAnswers: number;
    accuracy: number;
}

interface HardestQuestionsByQuiz {
    quizId: number;
    quizSlug: string;
    quizName: string;
    questions: HardestQuestion[];
}

interface BestSeller {
    count: number;
    name: string;
}

interface ChoiceDistributionOption {
    optionId: number;
    optionName: string;
    optionOrder: number;
    picksCount: number;
    picksPercentage: number;
    correct: boolean;
}

interface ChoiceDistribution {
    quizId: number;
    quizSlug: string;
    quizName: string;
    questionId: number;
    questionTitle: string;
    totalResponses: number;
    options: ChoiceDistributionOption[];
}

interface ChartPoint {
    label: string;
    value: number | null;
    secondaryValue: number | null;
}

interface StatsSummary {
    usersCount: number;
    quizzesCount: number;
    questionsCount: number;
    approvedAttendancesCount: number;
}

interface AdminStatsPage {
    summary: StatsSummary;
    topOverallUsers: UserMetricRow[];
    topEarnedCoinsUsers: UserMetricRow[];
    topValueUsers: UserMetricRow[];
    topAttendanceUsers: UserMetricRow[];
    hardestQuizzes: QuizDifficulty[];
    easiestQuizzes: QuizDifficulty[];
    hardestQuestions: HardestQuestion[];
    hardestQuestionsByQuiz: HardestQuestionsByQuiz[];
    bestSellerPlayers: BestSeller[];
    mcqDistribution: ChoiceDistribution | null;
    quizDifficultyChart: ChartPoint[];
    bestSellerChart: ChartPoint[];
    attendanceChart: ChartPoint[];
    leaderboardComparisonChart: ChartPoint[];
}

function withLimit(limit: number) {
    return limit > 10 ? 20 : 10;
}

export const insightsApiSlice = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: ROOT_URL,
        prepareHeaders: (headers, { }) => defaultHeaders(headers),
    }),
    reducerPath: "insightsApi",
    tagTypes: ["Insights"],
    endpoints: build => ({
        getAdminStatsPage: build.query<AdminStatsPage, { levelId?: number } | void>({
            query: (args) => {
                const levelId = args && "levelId" in args ? args.levelId : undefined;
                return levelId ? `ostaz/insights/stats?levelId=${levelId}` : "ostaz/insights/stats";
            },
            providesTags: ["Insights"],
        }),

        getTopOverallUsers: build.query<UserMetricRow[], number | void>({
            query: (limit) => `ostaz/insights/stats/users/overall?limit=${withLimit(limit ?? 10)}`,
        }),

        getTopEarnedCoinsUsers: build.query<UserMetricRow[], number | void>({
            query: (limit) => `ostaz/insights/stats/users/coins?limit=${withLimit(limit ?? 10)}`,
        }),

        getTopValueUsers: build.query<UserMetricRow[], number | void>({
            query: (limit) => `ostaz/insights/stats/users/value?limit=${withLimit(limit ?? 10)}`,
        }),

        getTopAttendanceUsers: build.query<UserMetricRow[], number | void>({
            query: (limit) => `ostaz/insights/stats/attendance?limit=${withLimit(limit ?? 10)}`,
        }),

        getHardestQuestions: build.query<HardestQuestion[], number | void>({
            query: (limit) => `ostaz/insights/stats/questions/hardest?limit=${withLimit(limit ?? 10)}`,
        }),

        getHardestQuestionsForQuiz: build.query<HardestQuestion[], { slug: string, limit?: number }>({
            query: ({ slug, limit }) => `ostaz/insights/stats/quizzes/${slug}/questions/hardest?limit=${withLimit(limit ?? 10)}`,
        }),

        getQuestionDistribution: build.query<ChoiceDistribution | null, number>({
            query: (questionId) => `ostaz/insights/stats/questions/${questionId}/distribution`,
        }),
    }),
});

export const {
    useGetAdminStatsPageQuery,
    useGetTopOverallUsersQuery,
    useGetTopEarnedCoinsUsersQuery,
    useGetTopValueUsersQuery,
    useGetTopAttendanceUsersQuery,
    useGetHardestQuestionsQuery,
    useGetHardestQuestionsForQuizQuery,
    useGetQuestionDistributionQuery,
} = insightsApiSlice;

export type {
    AdminStatsPage,
    StatsSummary,
    UserMetricRow,
    QuizDifficulty,
    HardestQuestion,
    HardestQuestionsByQuiz,
    BestSeller,
    ChoiceDistribution,
    ChoiceDistributionOption,
    ChartPoint,
};
