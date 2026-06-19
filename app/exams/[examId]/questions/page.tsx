import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import ExamSidebar from '@/components/layout/ExamSidebar'
import { getExamById } from '@/lib/types/exams-registry'
import { getChaptersByExam } from '@/lib/types/chapters-registry'
import { getAllQuestionSets } from '@/lib/content/question-loader'
import { getAllCardSets } from '@/lib/content/card-loader'
import { ArrowRight, BookOpen, CheckCircle2, PencilLine } from 'lucide-react'

interface Props {
  params: Promise<{ examId: string }>
}

function accentColor(colorKey?: string) {
  switch (colorKey) {
    case 'green': return '#10b981'
    case 'blue': return '#3b82f6'
    case 'purple': return '#7c3aed'
    default: return '#f59e0b'
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
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #f8fbff 0%, #f5f7fb 100%)',
      }}>
        <ExamSidebar exam={exam} />

        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 42px' }}>
          <div style={{
            maxWidth: 1120,
            margin: '0 auto',
          }}>
            <div style={{
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

            <div style={{
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
                  background: 'rgba(255,255,255,0.86)',
                  border: '1px solid rgba(148,163,184,0.18)',
                  borderRadius: 8,
                  padding: '14px 16px',
                  boxShadow: '0 10px 24px rgba(15,23,42,0.04)',
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
              background: 'rgba(255,255,255,0.92)',
              border: '1px solid rgba(148,163,184,0.18)',
              borderRadius: 8,
              boxShadow: '0 18px 38px rgba(15,23,42,0.06)',
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
                  <Link key={ch.id} href={href} aria-disabled={!ready} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      justifyContent: 'space-between',
                      padding: '18px 20px',
                      borderBottom: '1px solid rgba(148,163,184,0.14)',
                      color: 'inherit',
                      textDecoration: 'none',
                      opacity: ready ? 1 : 0.58,
                      pointerEvents: ready ? 'auto' : 'none',
                    }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
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
