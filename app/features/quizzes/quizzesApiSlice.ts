import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { ROOT_URL } from "~/base/consts";

interface Group {
  id: number
  slug: string
  name: string
  quizzes: Quiz[]|null
}

interface Quiz {
  id: number
  name: string
  slug: string
  group: Group
  questions: Question[]
}

interface Question {
  id: number
  title: string
  picture: string|null
  type: QuestionType
  options: Option[]
  answers: string[]|number[]
}

interface Option {
  id: number
  name: string
  order: number
  picture: string|null
}

enum QuestionType {
  Choose = 1,
  Written = 2,
}

interface GroupsApiResponse {
  groups: Group[]
}

interface GroupApiResponse {
  group: Group
}

interface QuizApiResponse {
  quiz: Quiz
}

// Define a service using a base URL and expected endpoints
export const quizzesApiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: ROOT_URL,
    prepareHeaders: (headers, {}) => {
      const key = "";
      headers.set("Authorization", `Basic ${key}`);

      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  reducerPath: "quizzesApi",
  tagTypes: ["Quizzes"],
  endpoints: build => ({
    getGroups: build.query<GroupsApiResponse, number>({
      query: () => `/groups`,
      providesTags: (result, error, id) => [{ type: "Quizzes", id }],
    }),

    getGroup: build.query<GroupApiResponse, string>({
      query: (slug) => `/groups/${slug}?withQuestions&withAnswers`,
      providesTags: (result, error, id) => [{ type: "Quizzes", id }],
    }),
  }),
})

export const { useGetGroupsQuery, useGetGroupQuery} = quizzesApiSlice

export type { Quiz, Question, Option };

export { QuestionType };