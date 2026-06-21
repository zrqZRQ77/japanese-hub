import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import ExamSidebar from '@/components/layout/ExamSidebar'
import { getExamById } from '@/lib/types/exams-registry'
import { getChaptersByExam } from '@/lib/types/chapters-registry'
import { getAllQuestionSets } from '@/lib/content/question-loader'
import { getAllCardSets } from '@/lib/content/card-loader'
import { ArrowRight, BookOpen, CheckCircle2, PencilLine } from 'lucide-react'
import { createPageMetadata } from '@/lib/seo'

interface Props {
  params: Promise<{ examId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { examId } = await params
  const exam = getExamById(examId)
  if (!exam) return createPageMetadata({ title: '練習問題', path: `/exams/${examId}/questions`, noIndex: true })

  return createPageMetadata({
    title: `${exam.shortName} 練習問題`,
    description: `${exam.name}の章別練習問題。学習ガイドに対応した問題で理解度を確認できます。`,
    path: `/exams/${examId}/questions`,
  })
}

function accentColor(colorKey?: string) {
  switch (colorKey) {
    case 'green': return 'var(--color-success)'
    case 'blue': return 'var(--color-primary)'
    case 'purple': return 'var(--color-warning)'
    default: return 'var(--color-primary)'
  }
}

export default async function QuestionsIndexPage({ params }: Props) {
  const { examId } = await params
  const exam = getExamById(examId)
  if (!exam) notFound()

  const chapters = getChaptersByExam(examId)
  const questionSets = getAllQuestionSets(examId)
  const qMap = new Map(questionSets.map(q => [q.chapterId, q]))
  const cardSets = getAllCardSets(examId)
  const cardMap = new Map(cardSets.map(c => [c.chapterId, c]))

  const accent = accentColor(exam.color)
  const totalQuestions = questionSets.reduce((sum, qs) => sum + qs.questions.length, 0)
  const availableChapters = chapters.filter(ch => qMap.get(ch.id)?.questions.length).length

  return (
    <>
      <Navbar />
      <div className="exam-shell" style={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
        background: 'var(--color-bg-subtle)',
      }}>
        <ExamSidebar exam={exam} />

        <main className="questions-index-main" style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 42px' }}>
          <div style={{
            maxWidth: 1120,
            margin: '0 auto',
          }}>
            <div className="questions-index-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 24,
              marginBottom: 20,
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: accent,
                  marginBottom: 8,
                }}>
                  <PencilLine size={14} />
                  練習問題
                </div>
                <h1 style={{
                  fontSize: '1.55rem',
                  fontWeight: 900,
                  lineHeight: 1.35,
                  margin: 0,
                  color: 'var(--color-text)',
                }}>{exam.name}</h1>
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--color-text-secondary)',
                fontSize: '0.92rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                <BookOpen size={16} />
                章を選んで演習へ
              </div>
            </div>

            <div className="questions-index-stats" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 12,
              marginBottom: 18,
            }}>
              {[
                { label: '収録章', value: `${availableChapters}/${chapters.length}` },
                { label: '練習問題', value: `${totalQuestions}問` },
                { label: '形式', value: '章別演習' },
              ].map(item => (
                <div key={item.label} style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  boxShadow: 'var(--shadow-card)',
                }}>
                  <div style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    marginBottom: 4,
                  }}>{item.label}</div>
                  <div style={{
                    color: 'var(--color-text)',
                    fontSize: '1.22rem',
                    fontWeight: 900,
                    lineHeight: 1.25,
                  }}>{item.value}</div>
                </div>
              ))}
            </div>

            <section style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden',
            }}>
              {chapters.map(ch => {
                const qs = qMap.get(ch.id)
                const cardSet = cardMap.get(ch.id)
                const cardCount = cardSet ? cardSet.cards.length : 0
                const questionCount = qs?.questions.length ?? 0
                const href = `/exams/${examId}/questions/${ch.id}`
                const ready = questionCount > 0

                return (
                  <Link className="questions-index-row" key={ch.id} href={href} aria-disabled={!ready} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      justifyContent: 'space-between',
                      padding: '18px 20px',
                      borderBottom: '1px solid var(--color-border)',
                      color: 'inherit',
                      textDecoration: 'none',
                      opacity: ready ? 1 : 0.58,
                      pointerEvents: ready ? 'auto' : 'none',
                    }}>
                      <div className="questions-index-action" style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-sm)',
                        background: ready ? `${accent}12` : 'rgba(148,163,184,0.10)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: ready ? accent : 'var(--color-text-muted)',
                        flexShrink: 0,
                      }}>
                        {ready ? <CheckCircle2 size={20} strokeWidth={2.2} /> : <PencilLine size={20} strokeWidth={2.2} />}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          marginBottom: 5,
                        }}>
                          <span style={{
                            color: accent,
                            fontSize: '0.78rem',
                            fontWeight: 900,
                            whiteSpace: 'nowrap',
                          }}>第{ch.number}章</span>
                          <strong style={{
                            color: 'var(--color-text)',
                            fontSize: '1rem',
                            lineHeight: 1.45,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>{ch.title}</strong>
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: 12,
                          flexWrap: 'wrap',
                          color: 'var(--color-text-secondary)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                        }}>
                          <span>{ready ? `${questionCount}問` : '準備中'}</span>
                          <span>{cardCount}枚の知識カード</span>
                        </div>
                      </div>

                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        color: ready ? accent : 'var(--color-text-muted)',
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                      }}>
                        {ready ? '演習を開く' : '未公開'}
                        <ArrowRight size={16} />
                      </div>
                  </Link>
                )
              })}
            </section>
          </div>
        </main>
      </div>
    </>
  )
}
