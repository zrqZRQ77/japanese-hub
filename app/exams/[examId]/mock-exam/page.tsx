import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import MockExam from '@/components/MockExam/MockExam'
import { getAllQuestionSets } from '@/lib/content/question-loader'
import { getExamById } from '@/lib/types/exams-registry'
import type { Question } from '@/lib/types'

interface Props {
  params: Promise<{ examId: string }>
}

export default async function MockExamPage({ params }: Props) {
  const { examId } = await params
  const exam = getExamById(examId)
  if (!exam) notFound()

  const sets = getAllQuestionSets(examId)
  const questions: Question[] = sets.flatMap(s => s.questions)
  const serialized = JSON.parse(JSON.stringify(questions)) as Question[]

  return (
    <>
      <Navbar />
      <MockExam
        initialQuestions={serialized}
        examId={examId}
        examName={exam.name}
        durationMinutes={examId === 'boki3' ? 60 : 30}
        passRate={examId === 'boki3' ? 70 : 60}
      />
    </>
  )
}
