// ============================================================
// 練習問題ページ  /exams/[examId]/questions/[chapterId]
// JSONファイルから問題を動的に読み込んでレンダリング
// ============================================================
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import QuestionClient from '@/components/features/questions/QuestionClient'
import { getExamById } from '@/lib/types/exams-registry'
import { getChapterById } from '@/lib/types/chapters-registry'
import { getQuestionSet } from '@/lib/content/question-loader'

interface Props {
  params: Promise<{ examId: string; chapterId: string }>
}

export default async function QuestionsPage({ params }: Props) {
  const { examId, chapterId } = await params

  const exam = getExamById(examId)
  if (!exam) notFound()

  const chapter = getChapterById(examId, chapterId)
  if (!chapter) notFound()

  const questionSet = getQuestionSet(examId, chapterId)

  // 問題が存在しない場合のフォールバック
  if (!questionSet || questionSet.questions.length === 0) {
    return (
      <>
        <Navbar />
        <main style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          height: 'calc(100vh - 64px)',
          background: 'var(--color-bg-subtle)', gap: 12,
        }}>
          <div style={{ fontSize: '3rem' }}>✏️</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            第{chapter.number}章 {chapter.title}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            この章の練習問題は準備中です。
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        <QuestionClient
          questions={questionSet.questions}
          chapterTitle={questionSet.chapterTitle}
          examId={examId}
          chapterId={chapterId}
        />
      </div>
    </>
  )
}
