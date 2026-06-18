import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import QuestionClient from '@/components/features/questions/QuestionClient'
import { getExamById } from '@/lib/types/exams-registry'
import { getChapterById } from '@/lib/types/chapters-registry'
import { getQuestionSet } from '@/lib/content/question-loader'
import { BookOpen, PencilLine } from 'lucide-react'

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

  if (!questionSet || questionSet.questions.length === 0) {
    return (
      <>
        <Navbar />
        <main style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'linear-gradient(180deg, #f8fbff 0%, #f5f7fb 100%)',
        }}>
          <div style={{
            width: 'min(100%, 720px)',
            background: 'rgba(255,255,255,0.88)',
            border: '1px solid rgba(148,163,184,0.16)',
            borderRadius: 24,
            padding: '30px 28px',
            boxShadow: '0 24px 60px rgba(15,23,42,0.08)',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              width: 56, height: 56,
              margin: '0 auto 16px',
              borderRadius: 18,
              background: 'linear-gradient(180deg, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.06) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
            }}>
              <PencilLine size={24} />
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 999,
              background: 'rgba(148,163,184,0.08)',
              border: '1px solid rgba(148,163,184,0.14)',
              color: 'var(--color-text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: 14,
            }}>
              <BookOpen size={14} />
              練習問題
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.22rem', marginBottom: 10 }}>
              第{chapter.number}章 {chapter.title}
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
              この章の練習問題はまだ準備中です。
            </div>
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
