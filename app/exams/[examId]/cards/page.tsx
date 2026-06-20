import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import FlashcardDeck from '@/components/features/cards/FlashcardDeck'
import { getExamById } from '@/lib/types/exams-registry'
import { getChaptersByExam } from '@/lib/types/chapters-registry'
import { getCardSet } from '@/lib/content/card-loader'
import { createPageMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ examId: string }>
}): Promise<Metadata> {
  const { examId } = await params
  const exam = getExamById(examId)
  if (!exam) return createPageMetadata({ title: '知識カード', path: `/exams/${examId}/cards`, noIndex: true })

  return createPageMetadata({
    title: `${exam.shortName} 知識カード`,
    description: `${exam.name}の重要語句をカード形式で復習できます。スキマ時間の暗記に使える無料の知識カードです。`,
    path: `/exams/${examId}/cards`,
  })
}

export default async function Page({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params
  const exam = getExamById(examId)
  if (!exam) notFound()

  const chapters = getChaptersByExam(examId)
  const cardSets = chapters.flatMap(ch => {
    const set = getCardSet(examId, ch.id)
    return set && set.cards.length > 0 ? [{ chapter: ch, set }] : []
  })
  const groups = cardSets.map(({ chapter, set }) => ({ chapter, cards: set.cards }))

  return (
    <>
      <Navbar />
      <div style={{
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
      }}>
        <main style={{
          height: '100%',
          overflowY: 'auto',
          background: 'var(--color-bg-subtle)',
          padding: '28px 32px',
        }}>
          <FlashcardDeck examId={examId} examShortName={exam.shortName} groups={groups} />
        </main>
      </div>
    </>
  )
}
