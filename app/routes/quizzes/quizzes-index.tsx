import Loading from "~/components/loading";
import Card from "~/components/card";
import {Table, Td, Th} from "~/components/table";
import {type Quiz, useGetQuizzesQuery} from "~/features/quizzes/quizzesApiSlice";
import {Link} from "react-router";
import React from "react";
import type {Route} from "./+types/quizzes-index";
import {createEmptyPagination} from "~/types/pagination";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "All Quizzes"},
    ];
}

export default function QuizzesIndex() {
    const {data: quizzes, isLoading, refetch} = useGetQuizzesQuery();

    if (isLoading || !quizzes) {
        return <Loading/>
    }

    function isPast(date : Date): boolean {
        return date <= new Date();
    }

    return (
        <div>
            <Card>
                <div className={"flex items-center justify-end"}>
                    <Link to="/quizzes/create"
                          className={"border px-3 py-1.5 rounded-md hover:bg-blue-200 text-blue-600 " +
                              "hover:text-blue-900"}>
                        Create Quiz
                    </Link>
                </div>
                <Table
                    header={(
                        <tr>
                            <Th first>ID</Th>
                            <Th>Name</Th>
                            <Th>Coins</Th>
                            <Th>Published</Th>
                            <Th></Th>
                        </tr>
                    )}
                    body={(quiz: Quiz) => (
                        <tr key={quiz.id}>
                            <Td first>
                                <div className="text-black">#{quiz.id}</div>
                            </Td>
                            <Td>
                                <div className="text-gray-800">{quiz.name}</div>
                            </Td>
                            <Td>
                                <div className="text-green-800 font-bold">+{quiz.coins}</div>
                            </Td>
                            <Td>
                                <div
                                    className={"text-gray-800 " + (isPast(quiz.publishedAt) ? "text-green-600" : "text-red-600")}
                                >{quiz.publishedAt.toLocaleString()}</div>
                            </Td>
                            <Td>
                                <a href={`/quizzes/${quiz.slug}/edit`} className="text-blue-600 hover:text-blue-900">
                                    Edit<span className="sr-only">, {quiz.name}</span>
                                </a>
                            </Td>
                        </tr>
                    )}
                    pagination={createEmptyPagination(quizzes)}
                />
            </Card>
        </div>
    );
}