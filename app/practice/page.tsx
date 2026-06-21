import Link from 'next/link'
import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
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
          padding: '48px 0 40px',
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

        <div className="container-page" style={{ padding: '40px 24px 56px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}>
            {EXAMS_REGISTRY.map(exam => {
              const chapters = getChaptersByExam(exam.id)
              const chapterStats = chapters.map(ch => {
                const set = getQuestionSet(exam.id, ch.id)
                return {
                  chapter: ch,
                  count: set?.questions.length ?? 0,
                }
              })
              const totalQuestions = chapterStats.reduce((sum, item) => sum + item.count, 0)

              return (
                <section key={exam.id} style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  boxShadow: 'var(--shadow-card)',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}>
                    <div>
                      <div style={{
                        display: 'inline-block',
                        background: 'var(--color-primary-light)',
                        color: 'var(--color-primary-dark)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: 10,
                      }}>{exam.category}</div>
                      <h2 style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: 'var(--color-text)',
                        margin: 0,
                      }}>{exam.shortName}</h2>
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--color-text-secondary)',
                      background: 'var(--color-bg-muted)',
                      border: '1px solid var(--color-border)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                    }}>{totalQuestions}問</div>
                  </div>

                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}>{exam.description}</p>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      background: 'var(--color-bg-muted)',
                      padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                    }}>章数 {chapters.length}</span>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      background: 'var(--color-bg-muted)',
                      padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                    }}>収録 {totalQuestions}問</span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(180px, 100%), 1fr))',
                    gap: 10,
                  }}>
                    {chapterStats.map(({ chapter, count }) => (
                      <Link
                        key={chapter.id}
                        href={`/exams/${exam.id}/questions/${chapter.id}`}
                        style={{
                          display: 'block',
                          textDecoration: 'none',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '12px 14px',
                          background: 'var(--color-bg-subtle)',
                        }}
                      >
                        <div style={{
                          fontSize: '0.72rem',
                          color: 'var(--color-text-muted)',
                          fontWeight: 700,
                          marginBottom: 4,
                        }}>第{chapter.number}章</div>
                        <div style={{
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: 'var(--color-text)',
                          lineHeight: 1.5,
                          marginBottom: 8,
                        }}>{chapter.title}</div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-primary)',
                          fontWeight: 700,
                        }}>{count > 0 ? `${count}問を解く →` : '未収録'}</div>
                      </Link>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
                    <Link href={`/exams/${exam.id}`} style={{
                      display: 'inline-block',
                      padding: '9px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-primary)',
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                    }}>ダッシュボードへ</Link>
                    <Link href={`/exams/${exam.id}/questions/${chapters[0]?.id ?? 'ch1'}`} style={{
                      display: 'inline-block',
                      padding: '9px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-bg-subtle)',
                      color: 'var(--color-text)',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      border: '1px solid var(--color-border)',
                    }}>最初の章から始める</Link>
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
