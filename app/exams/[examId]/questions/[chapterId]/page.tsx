import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import QuestionClient from '@/components/features/questions/QuestionClient'
import { getExamById } from '@/lib/types/exams-registry'
import { getChapterById } from '@/lib/types/chapters-registry'
import { getQuestionSet } from '@/lib/content/question-loader'
import { getCardSet } from '@/lib/content/card-loader'
import { createReviewCardMap } from '@/lib/questions/review-card'
import { BookOpen, PencilLine } from 'lucide-react'
import { absoluteUrl, createPageMetadata } from '@/lib/seo'

interface Props {
  params: Promise<{ examId: string; chapterId: string }>
  searchParams: Promise<{ question?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { examId, chapterId } = await params
  const exam = getExamById(examId)
  const chapter = getChapterById(examId, chapterId)
  const questionSet = getQuestionSet(examId, chapterId)

  if (!exam || !chapter) {
    return createPageMetadata({
      title: '練習問題',
      path: `/exams/${examId}/questions/${chapterId}`,
      noIndex: true,
    })
  }

  return createPageMetadata({
    title: `${exam.shortName} 第${chapter.number}章 練習問題`,
    description: `${exam.name}の第${chapter.number}章「${chapter.title}」に対応した練習問題${questionSet ? `（${questionSet.questions.length}問）` : ''}。理解度を確認しながら学習できます。`,
    path: `/exams/${examId}/questions/${chapterId}`,
  })
}

export default async function QuestionsPage({ params, searchParams }: Props) {
  const { examId, chapterId } = await params
  const { question: initialQuestionId } = await searchParams
  const exam = getExamById(examId)
  if (!exam) notFound()
  const chapter = getChapterById(examId, chapterId)
  if (!chapter) notFound()
  const questionSet = getQuestionSet(examId, chapterId)
  const cardSet = getCardSet(examId, chapterId)

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
          background: 'var(--color-bg-subtle)',
        }}>
          <div style={{
            width: 'min(100%, 720px)',
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '30px 28px',
            boxShadow: 'var(--shadow-elevated)',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              width: 56, height: 56,
              margin: '0 auto 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-light)',
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
              borderRadius: 'var(--radius-sm)',
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

  const base = `/exams/${examId}`
  const currentPath = `${base}/questions/${chapterId}`
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '資格合格ナビ', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: exam.shortName, item: absoluteUrl(base) },
      { '@type': 'ListItem', position: 3, name: '練習問題', item: absoluteUrl(`${base}/questions`) },
      { '@type': 'ListItem', position: 4, name: `第${chapter.number}章 ${chapter.title}`, item: absoluteUrl(currentPath) },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />
      <Navbar />
      <div className="question-page-shell" style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        <QuestionClient
          questions={questionSet.questions}
          chapterTitle={questionSet.chapterTitle}
          examId={examId}
          chapterId={chapterId}
          initialQuestionId={initialQuestionId}
          reviewCardsByQuestion={createReviewCardMap(questionSet.questions, cardSet?.cards ?? [])}
        />
      </div>
    </>
  )
}
