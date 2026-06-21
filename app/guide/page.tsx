import Link from 'next/link'
import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import { EXAMS_REGISTRY } from '@/lib/types/exams-registry'
import { getChaptersByExam } from '@/lib/types/chapters-registry'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: '学習ガイド',
  description: '日商簿記3級、FP3級、ITパスポートの学習ガイド一覧。章ごとの教材で基礎から体系的に学べます。',
  path: '/guide',
})

export default function GuidePage() {
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
            }}>学習ガイド</div>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 900, color: 'var(--color-text)',
              marginBottom: 12, lineHeight: 1.2,
            }}>
              章ごとに、基礎から順番に学ぶ
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', maxWidth: 560 }}>
              更新済みの教材に合わせて、試験ごとの章一覧を確認できます。学習ガイドからそのまま各章へ進めます。
            </p>
          </div>
        </section>

        <div className="container-page" style={{ padding: '40px 24px 56px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {EXAMS_REGISTRY.map(exam => {
              const chapters = getChaptersByExam(exam.id)
              const sectionCount = chapters.reduce((sum, ch) => sum + ch.sections.length, 0)

              return (
                <div key={exam.id} style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 24,
                  boxShadow: 'var(--shadow-card)',
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', gap: 12, marginBottom: 14,
                  }}>
                    <div>
                      <div style={{
                        display: 'inline-block',
                        background: 'var(--color-primary-light)',
                        color: 'var(--color-primary-dark)',
                        fontSize: '0.75rem', fontWeight: 700,
                        padding: '3px 10px', borderRadius: 'var(--radius-sm)',
                        marginBottom: 10,
                      }}>{exam.category}</div>
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                        {exam.shortName}
                      </h2>
                    </div>
                    <div style={{
                      fontSize: '0.75rem', fontWeight: 700,
                      color: 'var(--color-text-secondary)',
                      background: 'var(--color-bg-muted)',
                      border: '1px solid var(--color-border)',
                      padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                    }}>{chapters.length}章</div>
                  </div>

                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}>{exam.description}</p>

                  <div style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    marginBottom: 16,
                  }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      background: 'var(--color-bg-muted)',
                      padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                    }}>総章数 {chapters.length}</span>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      background: 'var(--color-bg-muted)',
                      padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                    }}>総セクション {sectionCount}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Link href={`/exams/${exam.id}/guide`} style={{
                      display: 'inline-block',
                      padding: '9px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-primary)',
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                    }}>章一覧を見る</Link>
                    <Link href={`/exams/${exam.id}`} style={{
                      display: 'inline-block',
                      padding: '9px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-bg-subtle)',
                      color: 'var(--color-text)',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      border: '1px solid var(--color-border)',
                    }}>ダッシュボードへ</Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
