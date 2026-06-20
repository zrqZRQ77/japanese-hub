// ============================================================
// 練習問題 クライアントコンポーネント（全インタラクション）
// 修改此文件 → 所有考试的练习题页面同步更新
// ============================================================
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Question } from '@/lib/types'
import { useProgress } from '@/lib/hooks/useProgress'

interface Props {
  questions: Question[]
  chapterTitle: string
  examId: string
  chapterId: string
}

export default function QuestionClient({ questions, chapterTitle, examId, chapterId }: Props) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState<Record<number, string>>({})
  const [reviewLater, setReviewLater] = useState(false)
  const [saved, setSaved] = useState(false)
  const { progress, recordQuestionAnswer } = useProgress(examId)

  const q = questions[current]
  const isAnswered = selected !== null
  const base = `/exams/${examId}`

  useEffect(() => {
    const questionId = window.location.hash.slice(1)
    if (!questionId) return
    const index = questions.findIndex(question => question.id === questionId)
    if (index >= 0) setCurrent(index)
  }, [questions])

  function isCorrect(question: Question, answer: string) {
    return Array.isArray(question.correctAnswer)
      ? question.correctAnswer.length === 1 && question.correctAnswer[0] === answer
      : question.correctAnswer === answer
  }

  function isCorrectOption(question: Question, label: string) {
    return Array.isArray(question.correctAnswer)
      ? question.correctAnswer.includes(label)
      : question.correctAnswer === label
  }

  function handleSelect(label: string) {
    if (isAnswered) return
    const nextAnswered = { ...answered, [current]: label }
    setSelected(label)
    setAnswered(nextAnswered)
    recordQuestionAnswer(
      chapterId,
      chapterTitle,
      q,
      label,
      isCorrect(q, label),
      questions.length,
    )
    setSaved(true)
  }

  function goTo(index: number) {
    setCurrent(index)
    setSelected(answered[index] ?? null)
    setReviewLater(false)
  }

  function handleNext() {
    if (current < questions.length - 1) goTo(current + 1)
  }

  function getQuestionStatus(i: number) {
    const ans = answered[i]
    if (ans) return isCorrect(questions[i], ans) ? 'correct' : 'wrong'
    const stored = progress?.questionProgress[questions[i].id]
    if (!stored) return 'unanswered'
    return stored.isCorrect ? 'correct' : 'wrong'
  }

  const optionStyle = (label: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '18px 20px',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      cursor: isAnswered ? 'default' : 'pointer',
      marginBottom: 12,
      transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease',
      background: '#fff',
      boxShadow: '0 1px 0 rgba(15,23,42,0.02)',
    }
    if (!isAnswered) return { ...base }
    if (isCorrectOption(q, label)) return {
      ...base, background: '#f0fdf4',
      border: '1.5px solid var(--color-success)',
      boxShadow: '0 8px 24px rgba(22,163,74,0.08)',
    }
    if (label === selected && !isCorrectOption(q, label)) return {
      ...base, background: '#fef2f2',
      border: '1.5px solid var(--color-error)',
      boxShadow: '0 8px 24px rgba(220,38,38,0.08)',
    }
    return { ...base, opacity: 0.6 }
  }

  const circleStyle = (label: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: 34, height: 34, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: '0.875rem', flexShrink: 0,
      background: 'var(--color-bg-muted)',
      color: 'var(--color-text-secondary)',
      border: '1.5px solid var(--color-border)',
    }
    if (!isAnswered) return base
    if (isCorrectOption(q, label)) return {
      ...base, background: 'var(--color-success)',
      color: '#fff', border: 'none',
    }
    if (label === selected && !isCorrectOption(q, label)) return {
      ...base, background: 'var(--color-error)',
      color: '#fff', border: 'none',
    }
    return base
  }

  const statusDot = (i: number) => {
    const st = getQuestionStatus(i)
    if (st === 'correct') return { bg: 'var(--color-success)', label: '✓' }
    if (st === 'wrong')   return { bg: 'var(--color-error)',   label: '✗' }
    return { bg: i === current ? 'var(--color-primary)' : 'var(--color-border)', label: String(i + 1) }
  }

  const persistedAnsweredIds = progress?.chapterProgress[chapterId]?.answeredQuestionIds ?? []
  const answeredIds = new Set(persistedAnsweredIds)
  Object.keys(answered).forEach(index => answeredIds.add(questions[Number(index)].id))
  const answeredCount = answeredIds.size
  const completionRate = questions.length === 0 ? 0 : (answeredCount / questions.length) * 100
  const currentAnswerState = selected && q?.correctAnswer
    ? (isCorrect(q, selected) ? 'correct' : 'wrong')
    : null
  const allAnswered = answeredCount >= questions.length

  return (
    <div className="question-layout" style={{
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
      height: '100%',
      width: '100%',
      background: 'linear-gradient(180deg, #f8fbff 0%, #f5f7fb 100%)',
    }}>

      {/* ===== 左：問題リスト ===== */}
      <div className="question-left-panel" style={{
        width: 'var(--guide-sidebar-width)', flexShrink: 0,
        borderRight: '1px solid rgba(148,163,184,0.16)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(248,250,252,0.98) 100%)',
        overflowY: 'auto',
        padding: '22px 14px 24px 18px',
        backdropFilter: 'blur(12px)',
        boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.55)',
      }}>
        <div style={{
          padding: '4px 8px 20px',
          marginBottom: 14,
        }}>
          <Link href={`${base}/questions`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '0.78rem', color: 'var(--color-text-muted)',
            textDecoration: 'none', fontWeight: 700,
            padding: '6px 10px', borderRadius: 8,
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(148,163,184,0.16)',
          }}>← 練習問題一覧</Link>
          <div style={{
            fontWeight: 900, fontSize: '1.02rem',
            marginTop: 16, marginBottom: 10, color: 'var(--color-text)',
            lineHeight: 1.55,
          }}>{chapterTitle}</div>
          <div style={{
            fontSize: '0.76rem',
            color: 'var(--color-text-secondary)',
            marginBottom: 10,
          }}>{questions.length} 問の練習問題</div>
          <div className="progress-bar">
            <div className="progress-bar-fill"
              style={{ width: `${completionRate}%` }} />
          </div>
          <div style={{
            fontSize: '0.78rem', color: 'var(--color-text-muted)',
            marginTop: 8, fontWeight: 600,
          }}>{answeredCount}/{questions.length}問</div>
        </div>

        {questions.map((_, i) => {
          const dot = statusDot(i)
          return (
            <button key={i} onClick={() => goTo(i)} style={{
              width: '100%', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 12px',
              border: '1px solid',
              borderColor: i === current ? 'rgba(59,130,246,0.20)' : 'transparent',
              borderRadius: 8,
              background: i === current
                ? 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.96) 100%)'
                : 'transparent',
              cursor: 'pointer', marginBottom: 6,
              color: 'var(--color-text)',
              fontWeight: i === current ? 700 : 400,
              fontSize: '0.92rem',
              boxShadow: i === current ? '0 12px 28px rgba(15,23,42,0.06)' : 'none',
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: dot.bg, color: '#fff',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.75rem',
                fontWeight: 700, flexShrink: 0,
              }}>{dot.label}</span>
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>問題{i + 1}</span>
            </button>
          )
        })}
      </div>

      {/* ===== 中央：問題本文 ===== */}
      <main style={{
        flex: 1, overflowY: 'auto',
        background: 'transparent',
        padding: '40px 32px 48px',
      }}>
        {/* ヘッダー */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 24,
          maxWidth: 960, width: '100%', marginLeft: 'auto', marginRight: 'auto',
        }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-secondary)' }}>
            問題 {current + 1} / {questions.length}
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,0.82)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
            fontSize: '0.8rem', fontWeight: 700,
          }}>{chapterTitle}</div>
        </div>

        {/* 問題カード */}
        <div style={{
          maxWidth: 960,
          width: '100%',
          margin: '0 auto',
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid rgba(148,163,184,0.2)',
          borderRadius: 10,
          padding: '34px 38px',
          boxShadow: '0 24px 60px rgba(15,23,42,0.08)',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(59,130,246,0.08)',
            color: 'var(--color-primary)',
            fontSize: '0.75rem', fontWeight: 800,
            padding: '5px 12px', borderRadius: 8,
            marginBottom: 18,
          }}>{chapterTitle}</div>

          <p style={{
            fontSize: '1.06rem', fontWeight: 650,
            lineHeight: 1.8, marginBottom: 28,
            color: 'var(--color-text)',
          }}>{q.text}</p>

          {(q.options ?? []).map(opt => (
            <div key={opt.label}
              style={optionStyle(opt.label)}
              onClick={() => handleSelect(opt.label)}
            >
              <span style={circleStyle(opt.label)}>{opt.label}</span>
              <span style={{ fontSize: '0.96rem', lineHeight: 1.7, color: 'var(--color-text)' }}>
                {opt.text}
              </span>
              {isAnswered && isCorrectOption(q, opt.label) && (
                <span style={{ marginLeft: 'auto', color: 'var(--color-success)', fontWeight: 700 }}>✓</span>
              )}
              {isAnswered && opt.label === selected && !isCorrectOption(q, opt.label) && (
                <span style={{ marginLeft: 'auto', color: 'var(--color-error)', fontWeight: 700 }}>✗</span>
              )}
            </div>
          ))}

          {isAnswered && (
            <div style={{
              marginTop: 20,
              background: 'linear-gradient(180deg, #fbfdff 0%, #f7fafc 100%)',
              border: '1px solid rgba(148,163,184,0.18)',
              borderRadius: 8,
              padding: '18px 20px',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontWeight: 800, fontSize: '0.875rem',
                marginBottom: 10, color: 'var(--color-text)',
              }}>
                解説
                {currentAnswerState && (
                  <span style={{
                    marginLeft: 4,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: 8,
                    background: currentAnswerState === 'correct' ? 'rgba(22,163,74,0.10)' : 'rgba(220,38,38,0.10)',
                    color: currentAnswerState === 'correct' ? 'var(--color-success)' : 'var(--color-error)',
                  }}>
                    {currentAnswerState === 'correct' ? '正解' : '不正解'}
                  </span>
                )}
              </div>
              <p style={{
                fontSize: '0.93rem', lineHeight: 1.85,
                color: 'var(--color-text)',
              }}>{q.explanation}</p>
            </div>
          )}

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginTop: 24,
            gap: 12,
            paddingTop: 18,
            borderTop: '1px solid rgba(148,163,184,0.2)',
          }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: '0.875rem', color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}>
              <input type="checkbox"
                checked={reviewLater}
                onChange={e => setReviewLater(e.target.checked)}
                style={{ width: 16, height: 16 }}
              />
              後で見直す
            </label>

              {isAnswered && current < questions.length - 1 && (
                <button onClick={handleNext} style={{
                  padding: '10px 28px',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%)', color: '#fff',
                  borderRadius: 8,
                  fontWeight: 700, fontSize: '0.9rem',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 10px 24px rgba(37,99,235,0.22)',
                }}>次の問題へ</button>
              )}
            {isAnswered && current === questions.length - 1 && allAnswered && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                {saved && (
                  <div style={{
                    fontSize: '0.8rem', color: 'var(--color-success)',
                    fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    ✓ 進捗を保存しました
                  </div>
                )}
                <Link href={`${base}`} style={{
                  padding: '10px 28px',
                  background: 'linear-gradient(135deg, var(--color-success) 0%, #15803d 100%)', color: '#fff',
                  borderRadius: 8,
                  fontWeight: 700, fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 10px 24px rgba(22,163,74,0.18)',
                }}>学習を完了して戻る</Link>
              </div>
            )}
            {isAnswered && current === questions.length - 1 && !allAnswered && (
              <button
                onClick={() => {
                  const nextIndex = questions.findIndex(question => !answeredIds.has(question.id))
                  if (nextIndex >= 0) goTo(nextIndex)
                }}
                style={{
                  padding: '10px 22px', background: 'var(--color-primary)', color: '#fff',
                  border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer',
                }}
              >未回答の問題へ</button>
            )}
          </div>
        </div>
      </main>

    </div>
  )
}
