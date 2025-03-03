import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { ROOT_URL } from "~/base/consts";
import {getFromLocalStorage} from "~/base/helpers";
import type {QuizForm} from "~/routes/quizzes/quizzes-form";


interface Quiz {
  id: number
  name: string
  slug: string
  coins: number
  publishedAt: Date
  questions: Question[]
}

interface Question {
  id: number
  title: string
  picture: string|null
  type: QuestionType
  options: Option[]
  coins: number
  answers: string[]|number[]|string
}

interface Option {
  id: number
  name: string
  order: number
  picture: string|null
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
    prepareHeaders: (headers, {}) => {
      headers.set("Content-Type", "application/json");

      const token = getFromLocalStorage("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
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

    getQuiz: build.query<Quiz, string>({
      query: (slug) => `/ostaz/quizzes/${slug}`,
      providesTags: (result, error, id) => [{ type: "Quizzes", id }],
      transformResponse: (quiz : Quiz) => {
        return {
          ...quiz,
          publishedAt: new Date(quiz.publishedAt),
        };
      },
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

export const { useGetQuizQuery, useUpdateQuizMutation, useGetUploadUrlQuery, useGetQuizzesQuery, useCreateQuizMutation} = quizzesApiSlice

export type { Quiz, Question, Option };

export { QuestionType };