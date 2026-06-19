import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import ExamSidebar from '@/components/layout/ExamSidebar'
import { getExamById } from '@/lib/types/exams-registry'
import { getChaptersByExam } from '@/lib/types/chapters-registry'
import { getCardSet } from '@/lib/content/card-loader'

export default async function Page({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params
  const exam = getExamById(examId)
  if (!exam) notFound()

  const chapters = getChaptersByExam(examId)
  const cardSets = chapters.flatMap(ch => {
    const set = getCardSet(examId, ch.id)
    return set && set.cards.length > 0 ? [{ chapter: ch, set }] : []
  })

  const totalCards = cardSets.reduce((sum, item) => sum + item.set.cards.length, 0)

  return (
    <>
      <Navbar />
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
      }}>
        <ExamSidebar exam={exam} />

        <main style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--color-bg-subtle)',
          padding: '32px',
        }}>
          <div style={{
            background: '#fff',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            marginBottom: 24,
          }}>
            <div style={{
              display: 'inline-block',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 99,
              marginBottom: 12,
            }}>知識カード</div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 8 }}>
              {exam.shortName} の知識カード
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 16 }}>
              章ごとに重要ポイントを整理しています。スキマ時間の暗記や復習に使ってください。
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700,
                color: 'var(--color-text-muted)',
                background: 'var(--color-bg-muted)',
                border: '1px solid var(--color-border)',
                padding: '3px 10px',
                borderRadius: 99,
              }}>対象章 {cardSets.length}章</span>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700,
                color: 'var(--color-text-muted)',
                background: 'var(--color-bg-muted)',
                border: '1px solid var(--color-border)',
                padding: '3px 10px',
                borderRadius: 99,
              }}>総カード数 {totalCards}枚</span>
            </div>
          </div>

          {cardSets.length > 0 ? cardSets.map(({ chapter, set }) => (
            <section key={chapter.id} style={{
              background: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              marginBottom: 18,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 12,
                marginBottom: 14,
                flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 4 }}>
                    第{chapter.number}章
                  </div>
                  <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text)' }}>
                    {chapter.title}
                  </h2>
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  background: 'var(--color-bg-muted)',
                  border: '1px solid var(--color-border)',
                  padding: '4px 8px',
                  borderRadius: 99,
                }}>{set.cards.length}枚</div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
                gap: 12,
              }}>
                {set.cards.map(card => (
                  <article key={card.id} style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-subtle)',
                    padding: 16,
                  }}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      marginBottom: 10,
                    }}>Q</div>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      marginBottom: 12,
                      color: 'var(--color-text)',
                    }}>{card.front}</div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.7,
                      paddingTop: 12,
                      borderTop: '1px solid var(--color-border)',
                    }}>
                      <span style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-success)',
                        marginBottom: 6,
                      }}>A</span>
                      {card.back}
                    </div>
                    {card.tags?.length ? (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                        {card.tags.map(tag => (
                          <span key={tag} style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: 'var(--color-text-muted)',
                            background: '#fff',
                            border: '1px solid var(--color-border)',
                            borderRadius: 99,
                            padding: '2px 8px',
                          }}>{tag}</span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          )) : (
            <div style={{
              background: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '36px 24px',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
            }}>
              この試験の知識カードはまだありません。
            </div>
          )}
        </main>
      </div>
    </>
  )
}
