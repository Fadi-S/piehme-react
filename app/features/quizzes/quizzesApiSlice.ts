import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { ROOT_URL } from "~/base/consts";
import {defaultHeaders} from "~/base/helpers";
import type {QuizForm} from "~/routes/quizzes/quizzes-form";


interface Quiz {
  id: number
  name: string
  slug: string
  coins: number
  publishedAt: Date
  questions: Question[]
  responses: Response[]
}

interface Response {
  id: number
  username: string
  coins: number
  correctQuestionsCount: number
  answers: Map<number, Answer>
  submittedAt: Date
}

interface Answer {
    id: number
    answer: string[]|number[]|string
    isCorrect: boolean
    coins: number
}

interface Question {
  id: number
  title: string
  picture: string|undefined
  type: QuestionType
  options: Option[]
  coins: number
  answers: string[]|number[]|string
}

interface Option {
  id: number
  name: string
  order: number
  picture: string|undefined
}

enum QuestionType {
  Choice = "Choice",
  MultipleCorrectChoices = "MultipleCorrectChoices",
  Reorder = "Reorder",
  Written = "Written",
}

interface QuizApiResponse {
  quiz: Quiz
}

interface UploadUrlApiResponse {
  url: string
}

// Define a service using a base URL and expected endpoints
export const quizzesApiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: ROOT_URL,
    prepareHeaders: (headers, {}) => defaultHeaders(headers),
  }),
  reducerPath: "quizzesApi",
  tagTypes: ["Quizzes"],
  endpoints: build => ({
    getQuizzes: build.query<Quiz[], void>({
      query: () => `/ostaz/quizzes`,
      providesTags: ["Quizzes"],
      transformResponse: (response : Quiz[]) => {
        return response.map((quiz) => {
            return {
                ...quiz,
                publishedAt: new Date(quiz.publishedAt),
            };
        });
      },
    }),

    getQuiz: build.query<Quiz, { slug: string, withResponses: boolean }>({
      query: ({slug, withResponses }) => {
        let url = `/ostaz/quizzes/${slug}`;

        if(withResponses) {
            url += "?withResponses=1";
        }

        return url
      },
      providesTags: (result, error, {slug}) => [{ type: "Quizzes", slug }],
      transformResponse: (quiz : Quiz) => {
        quiz = {
          ...quiz,
          publishedAt: new Date(quiz.publishedAt),
        };

        if(!quiz.questions) {
          quiz.questions = [];
        }

        if(quiz.responses !== undefined) {
          if(! quiz.responses) {
            quiz.responses = [];
          }

            quiz.responses = quiz.responses.map((response) => {
              const answers = new Map();
              for (const [id, answer] of Object.entries(response.answers)) {
                answers.set(parseInt(id), answer);
              }
              response.answers = answers;
              response.submittedAt = new Date(response.submittedAt);
              return response;
            });
        }

        return quiz;
      },
    }),

    correctResponse: build.mutation<void, number>({
      query: (responseId) => ({
        url: `/ostaz/quizzes/responses/${responseId}/correct`,
        method: "PATCH",
      }),
    }),

    getUploadUrl: build.query<UploadUrlApiResponse, void>({
      query: () => `/ostaz/quizzes/upload`,
    }),

    createQuiz: build.mutation<QuizApiResponse, QuizForm>({
      query: (data) => ({
        url: "/ostaz/quizzes",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Quizzes"],
    }),

    updateQuiz: build.mutation<QuizApiResponse, { data: QuizForm, quizId: number }>({
      query: ({data, quizId}) => ({
        url: `/ostaz/quizzes/${quizId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Quizzes"],
    }),

  }),
})

export const { useGetQuizQuery, useCorrectResponseMutation, useUpdateQuizMutation, useGetUploadUrlQuery, useGetQuizzesQuery, useCreateQuizMutation} = quizzesApiSlice

export type { Quiz, Question, Option, Response, Answer };

export { QuestionType };