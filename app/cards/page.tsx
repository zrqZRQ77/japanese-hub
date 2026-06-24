import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import ExamToolCard from '@/components/features/exams/ExamToolCard'
import { EXAMS_REGISTRY } from '@/lib/types/exams-registry'
import { getChaptersByExam } from '@/lib/types/chapters-registry'
import { getCardSet } from '@/lib/content/card-loader'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: '知識カード',
  description: '日商簿記3級、FP3級、ITパスポートの知識カード一覧。重要語句を章ごとに反復して覚えられます。',
  path: '/cards',
})

export default function CardsPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--color-bg-subtle)', minHeight: 'calc(100vh - 64px)' }}>
        <section style={{
          background: 'var(--color-hero-bg)',
          padding: '34px 0 28px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div className="container-page">
            <div style={{
              fontSize: '0.8rem', fontWeight: 700,
              color: 'var(--color-primary)',
              marginBottom: 12,
            }}>知識カード</div>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 900, color: 'var(--color-text)',
              marginBottom: 12, lineHeight: 1.2,
            }}>
              重要語句を、短時間で反復する
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', maxWidth: 640 }}>
              試験ごとの章一覧とカード収録数をまとめています。移動中やスキマ時間の復習に、ここから直接カードを開けます。
            </p>
          </div>
        </section>

        <div className="container-page" style={{ padding: '28px 24px 40px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}>
            {EXAMS_REGISTRY.map(exam => {
              const chapters = getChaptersByExam(exam.id)
              const totalCards = chapters.reduce(
                (sum, ch) => sum + (getCardSet(exam.id, ch.id)?.cards.length ?? 0),
                0,
              )

              return (
                <ExamToolCard
                  key={exam.id}
                  category={exam.category}
                  title={exam.shortName}
                  countBadge={`${totalCards}枚`}
                  description={exam.description}
                  tags={[`章数 ${chapters.length}`, `収録 ${totalCards}枚`]}
                  primaryAction={{ href: `/exams/${exam.id}/cards`, label: 'カードで覚える' }}
                  secondaryAction={{ href: `/exams/${exam.id}`, label: 'ダッシュボードへ' }}
                />
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
