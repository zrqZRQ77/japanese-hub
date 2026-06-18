import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import ExamSidebar from '@/components/layout/ExamSidebar'
import { getExamById } from '@/lib/types/exams-registry'
import { getChaptersByExam } from '@/lib/types/chapters-registry'
import { getAllQuestionSets } from '@/lib/content/question-loader'
import { getAllCardSets } from '@/lib/content/card-loader'
import InlineQuestionCard from '@/components/features/questions/InlineQuestionCard'
import { BookOpen, PencilLine, Sparkles } from 'lucide-react'

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

        <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          <div style={{
            maxWidth: 1240,
            margin: '0 auto',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: 24,
              marginBottom: 22,
              padding: '18px 20px',
              borderRadius: 22,
              background: 'rgba(255,255,255,0.80)',
              border: '1px solid rgba(148,163,184,0.16)',
              boxShadow: '0 18px 40px rgba(15,23,42,0.05)',
              backdropFilter: 'blur(10px)',
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: 'var(--color-primary)',
                  marginBottom: 10,
                }}>
                  <Sparkles size={14} />
                  練習問題
                </div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 900, lineHeight: 1.4, margin: 0 }}>{exam.name}</h1>
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
                章ごとに演習を開く
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 18,
            }}>
              {chapters.map(ch => {
                const qs = qMap.get(ch.id)
                const cardSet = cardMap.get(ch.id)
                const cardCount = cardSet ? cardSet.cards.length : 0
                const questionCount = qs?.questions.length ?? 0

                return (
                  <article key={ch.id} style={{
                    background: 'rgba(255,255,255,0.92)',
                    borderRadius: 22,
                    overflow: 'hidden',
                    border: '1px solid rgba(148,163,184,0.16)',
                    boxShadow: '0 18px 40px rgba(15,23,42,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    backdropFilter: 'blur(8px)',
                  }}>
                    <div style={{ height: 6, background: accent }} />

                    <div style={{
                      padding: 18,
                      display: 'flex',
                      gap: 14,
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 10px',
                          borderRadius: 999,
                          background: 'rgba(59,130,246,0.08)',
                          color: 'var(--color-primary)',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          marginBottom: 12,
                        }}>
                          第{ch.number}章
                        </div>
                        <div style={{
                          fontWeight: 900,
                          fontSize: '1.03rem',
                          lineHeight: 1.55,
                          color: 'var(--color-text)',
                          marginBottom: 10,
                          minHeight: 54,
                        }}>{ch.title}</div>
                        <div style={{
                          display: 'flex',
                          gap: 8,
                          flexWrap: 'wrap',
                          color: 'var(--color-text-secondary)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                        }}>
                          <span style={{
                            padding: '6px 10px',
                            borderRadius: 999,
                            background: 'rgba(148,163,184,0.08)',
                            border: '1px solid rgba(148,163,184,0.14)',
                          }}>{questionCount} 問</span>
                          <span style={{
                            padding: '6px 10px',
                            borderRadius: 999,
                            background: 'rgba(148,163,184,0.08)',
                            border: '1px solid rgba(148,163,184,0.14)',
                          }}>{cardCount} 枚の知識カード</span>
                        </div>
                      </div>

                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 16,
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.92) 100%)',
                        border: '1px solid rgba(148,163,184,0.16)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: accent,
                        flexShrink: 0,
                        boxShadow: '0 10px 20px rgba(15,23,42,0.04)',
                      }}>
                        <PencilLine size={20} strokeWidth={2.2} />
                      </div>
                    </div>

                    <div style={{
                      padding: '0 18px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}>
                      <div style={{
                        fontSize: '0.84rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.6,
                        maxWidth: 180,
                      }}>
                        章の流れに沿って、そのまま演習を開始できます。
                      </div>
                      <div style={{ marginLeft: 'auto' }}>
                        <InlineQuestionCard questionSet={qs} chapterTitle={ch.title} examId={examId} chapterId={ch.id} />
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
