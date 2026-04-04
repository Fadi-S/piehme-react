import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ROOT_URL } from "~/base/consts";
import { defaultHeaders } from "~/base/helpers";
import { type PageRequest, type Pagination, queryParamsFromRequest } from "~/types/pagination";

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

interface AttemptedAllQuizUser {
    userId: number;
    username: string;
    imageUrl: string | null;
    imageKey: string | null;
    overallScore: number;
    totalCoinsEarned: number;
    attemptedQuizzesCount: number;
    publishedQuizzesCount: number;
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

        getStatsSummary: build.query<StatsSummary, void>({
            query: () => "ostaz/insights/stats/summary",
            providesTags: ["Insights"],
        }),

        getTopOverallUsers: build.query<Pagination<UserMetricRow>, PageRequest | void>({
            query: (req) => `ostaz/insights/stats/users/overall${queryParamsFromRequest(req ?? { page: 1, size: 10 })}`,
        }),

        getTopEarnedCoinsUsers: build.query<Pagination<UserMetricRow>, PageRequest | void>({
            query: (req) => `ostaz/insights/stats/users/coins${queryParamsFromRequest(req ?? { page: 1, size: 10 })}`,
        }),

        getTopValueUsers: build.query<Pagination<UserMetricRow>, PageRequest | void>({
            query: (req) => `ostaz/insights/stats/users/value${queryParamsFromRequest(req ?? { page: 1, size: 10 })}`,
        }),

        getTopAttendanceUsers: build.query<Pagination<UserMetricRow>, PageRequest | void>({
            query: (req) => `ostaz/insights/stats/attendance${queryParamsFromRequest(req ?? { page: 1, size: 10 })}`,
        }),

        getQuizDifficulty: build.query<QuizDifficulty[], void>({
            query: () => "ostaz/insights/stats/quizzes/difficulty",
        }),

        getHardestQuestions: build.query<Pagination<HardestQuestion>, PageRequest | void>({
            query: (req) => `ostaz/insights/stats/questions/hardest${queryParamsFromRequest(req ?? { page: 1, size: 10 })}`,
        }),

        getHardestQuestionsByQuiz: build.query<HardestQuestionsByQuiz[], number | void>({
            query: (limit) => `ostaz/insights/stats/questions/by-quiz?limit=${Math.min(limit ?? 3, 10)}`,
        }),

        getHardestQuestionsForQuiz: build.query<Pagination<HardestQuestion>, { slug: string } & PageRequest>({
            query: ({ slug, ...req }) => `ostaz/insights/stats/quizzes/${slug}/questions/hardest${queryParamsFromRequest(req)}`,
        }),

        getQuestionDistribution: build.query<ChoiceDistribution | null, number>({
            query: (questionId) => `ostaz/insights/stats/questions/${questionId}/distribution`,
        }),

        getBestSellerPlayers: build.query<Pagination<BestSeller>, ({ levelId?: number } & PageRequest) | void>({
            query: (args) => {
                const levelId = args && "levelId" in args ? args.levelId : undefined;
                const params = queryParamsFromRequest({
                    page: args && "page" in args ? args.page : 1,
                    size: args && "size" in args ? args.size : 10,
                });

                if (levelId) {
                    return `ostaz/insights/stats/players/best-sellers${params}${params ? "&" : "?"}levelId=${levelId}`;
                }

                return `ostaz/insights/stats/players/best-sellers${params}`;
            },
        }),

        getUsersAttemptedAllQuizzes: build.query<Pagination<AttemptedAllQuizUser>, PageRequest>({
            query: (req) => `ostaz/insights/stats/users/attempted-all${queryParamsFromRequest(req)}`,
        }),
    }),
});

export const {
    useGetAdminStatsPageQuery,
    useGetStatsSummaryQuery,
    useGetTopOverallUsersQuery,
    useGetTopEarnedCoinsUsersQuery,
    useGetTopValueUsersQuery,
    useGetTopAttendanceUsersQuery,
    useGetQuizDifficultyQuery,
    useGetHardestQuestionsQuery,
    useGetHardestQuestionsByQuizQuery,
    useGetHardestQuestionsForQuizQuery,
    useGetQuestionDistributionQuery,
    useGetBestSellerPlayersQuery,
    useGetUsersAttemptedAllQuizzesQuery,
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
    AttemptedAllQuizUser,
};
