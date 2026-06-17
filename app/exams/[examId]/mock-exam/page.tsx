import React from 'react'
import MockExam from '../../../../components/MockExam/MockExam'
import { getAllQuestionSets } from '../../../../lib/content/question-loader'
import type { Question } from '../../../../lib/types'

interface Props {
  params: Promise<{ examId: string }>
}

export default async function MockExamPage({ params }: Props) {
  const { examId } = await params
  const sets = getAllQuestionSets(examId)
  const questions: Question[] = sets.flatMap(s => s.questions)
  // serialize to plain JSON-compatible object for client
  const serialized = JSON.parse(JSON.stringify(questions)) as Question[]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">模拟考试 — {examId}</h1>
        <MockExam initialQuestions={serialized} questionsCount={10} durationMinutes={30} />
      </div>
    </div>
  )
}

