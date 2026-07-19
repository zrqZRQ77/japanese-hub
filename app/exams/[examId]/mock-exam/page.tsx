import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import MockExam from '@/components/MockExam/MockExam'
import { getMockQuestionSet } from '@/lib/content/mock-exam-loader'
import { getAllQuestionSets } from '@/lib/content/question-loader'
import { getExamById, isMockExamPublic } from '@/lib/types/exams-registry'
import type { ExamMeta, MockExamQuestion } from '@/lib/types'
import { createPageMetadata } from '@/lib/seo'

interface Props {
  params: Promise<{ examId: string }>
}

function canAccessMockExam(exam: ExamMeta): boolean {
  return isMockExamPublic(exam)
    || (process.env.ENABLE_DRAFT_MOCK_EXAM === 'true' && Boolean(exam.mockExam?.sectionBlueprints))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { examId } = await params
  const exam = getExamById(examId)
  if (!exam) return createPageMetadata({ title: '模擬試験', path: `/exams/${examId}/mock-exam`, noIndex: true })
  if (!canAccessMockExam(exam)) return createPageMetadata({ title: '模擬試験', path: `/exams/${examId}/mock-exam`, noIndex: true })

  const mockQuestionSet = getMockQuestionSet(examId)
  const questionCount = mockQuestionSet?.questions.length ?? 0

  return createPageMetadata({
    title: `${exam.shortName} 模擬試験（${exam.mockExam?.durationMinutes ?? 60}分）`,
    description: `${exam.name}の本番形式模擬試験。3大問・${questionCount}小問を${exam.mockExam?.durationMinutes ?? 60}分で解き、${exam.mockExam?.passRate ?? 70}点の合格ラインを確認できます。`,
    path: `/exams/${examId}/mock-exam`,
    noIndex: !isMockExamPublic(exam),
  })
}

export default async function MockExamPage({ params }: Props) {
  const { examId } = await params
  const exam = getExamById(examId)
  if (!exam) notFound()

  // 未完成の模擬試験は機能を残したまま公開サイトから隠す
  if (!canAccessMockExam(exam)) notFound()

  const mockQuestionSet = getMockQuestionSet(examId)
  const questions: MockExamQuestion[] = mockQuestionSet?.questions
    ?? getAllQuestionSets(examId).flatMap(s => s.questions)
  const serialized = JSON.parse(JSON.stringify(questions)) as MockExamQuestion[]

  return (
    <>
      <Navbar />
      <MockExam
        initialQuestions={serialized}
        examId={examId}
        examName={exam.name}
        durationMinutes={exam.mockExam?.durationMinutes ?? 30}
        passRate={exam.mockExam?.passRate ?? 60}
        sectionBlueprints={exam.mockExam?.sectionBlueprints}
      />
    </>
  )
}
