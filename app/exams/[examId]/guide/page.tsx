import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import GuideSidebar from '@/components/layout/GuideSidebar'
import { getExamById } from '@/lib/types/exams-registry'
import { getChaptersByExam } from '@/lib/types/chapters-registry'
import { BookOpen } from 'lucide-react'
import { createPageMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ examId: string }>
}): Promise<Metadata> {
  const { examId } = await params
  const exam = getExamById(examId)
  if (!exam) return createPageMetadata({ title: '学習ガイド', path: `/exams/${examId}/guide`, noIndex: true })

  return createPageMetadata({
    title: `${exam.shortName} 学習ガイド`,
    description: `${exam.name}の学習ガイド。章ごとの教材で基礎から体系的に学べます。`,
    path: `/exams/${examId}/guide`,
  })
}

export default async function GuideIndexPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params
  const exam = getExamById(examId)
  if (!exam) notFound()
  const chapters = getChaptersByExam(examId)
  const base = `/exams/${examId}`

  return (
    <>
      <Navbar />
      <div className="guide-page-shell" style={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
        background: 'var(--color-bg-subtle)',
      }}>
        <div className="guide-layout" style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          minWidth: 0,
          overflow: 'hidden',
        }}>
          <GuideSidebar examId={examId} chapters={chapters} currentChapterId="" progress={0} />
          <main className="guide-index-main" style={{
            flex: 1, overflowY: 'auto',
            background: 'var(--color-bg-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '72px 48px',
          }}>
            <div style={{ maxWidth: 860, width: '100%' }}>
              <div style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '64px 48px',
                textAlign: 'center',
                marginBottom: 28,
                boxShadow: 'var(--shadow-card)',
              }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-sm)',
                  margin: '0 auto 26px',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <BookOpen size={26} />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: 18 }}>
                  {exam.shortName} 学習ガイド
                </h1>
                <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                  全{chapters.length}章構成で、基礎から体系的に学べます。<br />
                  章を選んで学習を始めましょう。
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 16,
                marginBottom: 32,
              }}>
                {[
                  { label: '総章数', value: `${chapters.length}章` },
                  { label: '総セクション', value: `${chapters.reduce((s, c) => s + c.sections.length, 0)}節` },
                  { label: '学習状況', value: '公開中' },
                ].map(item => (
                  <div key={item.label} style={{
                    background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)', padding: '24px 16px',
                    textAlign: 'center', boxShadow: 'var(--shadow-card)',
                  }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-primary)', marginBottom: 4 }}>{item.value}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{item.label}</div>
                  </div>
                ))}
              </div>

              {chapters[0] && (
                <div style={{ textAlign: 'center' }}>
                  <Link href={`${base}/guide/${chapters[0].id}`} style={{
                    display: 'inline-block', padding: '14px 40px',
                    background: 'var(--color-primary)', color: '#fff',
                    borderRadius: 'var(--radius-sm)', fontWeight: 700,
                    fontSize: '1rem', textDecoration: 'none',
                  }}>第1章から始める →</Link>
                  <div style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    または章メニューから任意の章を選択
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
