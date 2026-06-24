import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import ExamToolCard from '@/components/features/exams/ExamToolCard'
import { EXAMS_REGISTRY } from '@/lib/types/exams-registry'
import { getChaptersByExam } from '@/lib/types/chapters-registry'
import { getQuestionSet } from '@/lib/content/question-loader'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: '練習問題',
  description: '日商簿記3級、FP3級、ITパスポートの練習問題一覧。章ごとの問題で理解度を確認できます。',
  path: '/practice',
})

export default function PracticePage() {
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
            }}>練習問題</div>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 900, color: 'var(--color-text)',
              marginBottom: 12, lineHeight: 1.2,
            }}>
              試験ごとの問題を、章単位で確認する
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', maxWidth: 640 }}>
              更新済みの教材に合わせて、各試験の章一覧と出題数をまとめています。ここから直接、問題ページへ進めます。
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
              const totalQuestions = chapters.reduce(
                (sum, ch) => sum + (getQuestionSet(exam.id, ch.id)?.questions.length ?? 0),
                0,
              )

              return (
                <ExamToolCard
                  key={exam.id}
                  category={exam.category}
                  title={exam.shortName}
                  countBadge={`${totalQuestions}問`}
                  description={exam.description}
                  tags={[`章数 ${chapters.length}`, `収録 ${totalQuestions}問`]}
                  primaryAction={{ href: `/exams/${exam.id}/questions`, label: '章一覧を見る' }}
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
