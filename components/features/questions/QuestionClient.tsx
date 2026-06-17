// ============================================================
// 練習問題 クライアントコンポーネント（全インタラクション）
// 修改此文件 → 所有考试的练习题页面同步更新
// ============================================================
'use client'
import { useState } from 'react'
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
  const { completeChapter } = useProgress(examId)

  const q = questions[current]
  const isAnswered = selected !== null
  const base = `/exams/${examId}`

  function handleSelect(label: string) {
    if (isAnswered) return
    const nextAnswered = { ...answered, [current]: label }
    setSelected(label)
    setAnswered(nextAnswered)

    if (Object.keys(nextAnswered).length === questions.length && !saved) {
      const correctCount = Object.entries(nextAnswered)
        .filter(([i, ans]) => ans === questions[Number(i)].correctAnswer).length
      completeChapter(chapterId, questions.length, correctCount)
      setSaved(true)
    }
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
    if (!ans) return 'unanswered'
    return ans === questions[i].correctAnswer ? 'correct' : 'wrong'
  }

  const optionStyle = (label: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '16px 20px',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      cursor: isAnswered ? 'default' : 'pointer',
      marginBottom: 10,
      transition: 'all 0.15s',
      background: '#fff',
    }
    if (!isAnswered) return base
    if (label === q.correctAnswer) return {
      ...base, background: '#f0fdf4',
      border: '1.5px solid var(--color-success)',
    }
    if (label === selected && label !== q.correctAnswer) return {
      ...base, background: '#fef2f2',
      border: '1.5px solid var(--color-error)',
    }
    return { ...base, opacity: 0.5 }
  }

  const circleStyle = (label: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: 32, height: 32, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: '0.875rem', flexShrink: 0,
      background: 'var(--color-bg-muted)',
      color: 'var(--color-text-secondary)',
      border: '1.5px solid var(--color-border)',
    }
    if (!isAnswered) return base
    if (label === q.correctAnswer) return {
      ...base, background: 'var(--color-success)',
      color: '#fff', border: 'none',
    }
    if (label === selected && label !== q.correctAnswer) return {
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

  return (
    <div style={{
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
      height: '100%',
      width: '100%',
      maxWidth: 1440,
      margin: '0 auto',
      boxShadow: 'var(--shadow-card)',
      background: '#fff',
    }}>

      {/* ===== 左：問題リスト ===== */}
      <div style={{
        width: 240, flexShrink: 0,
        borderRight: '1px solid var(--color-border)',
        background: '#fff', overflowY: 'auto',
        padding: '20px 14px',
      }}>
        <div style={{ marginBottom: 16 }}>
          <Link href={`${base}`} style={{
            fontSize: '0.75rem', color: 'var(--color-text-muted)',
            textDecoration: 'none', fontWeight: 600,
          }}>← ダッシュボード</Link>
          <div style={{
            fontWeight: 700, fontSize: '0.875rem',
            marginTop: 10, marginBottom: 8, color: 'var(--color-text)',
            lineHeight: 1.5,
          }}>{chapterTitle}</div>
          <div className="progress-bar">
            <div className="progress-bar-fill"
              style={{ width: `${(Object.keys(answered).length / questions.length) * 100}%` }} />
          </div>
          <div style={{
            fontSize: '0.75rem', color: 'var(--color-text-muted)',
            marginTop: 4,
          }}>{Object.keys(answered).length}/{questions.length}問</div>
        </div>

        {questions.map((_, i) => {
          const dot = statusDot(i)
          return (
            <button key={i} onClick={() => goTo(i)} style={{
              width: '100%', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: i === current ? 'var(--color-primary-light)' : 'transparent',
              cursor: 'pointer', marginBottom: 2,
              color: i === current ? 'var(--color-primary)' : 'var(--color-text)',
              fontWeight: i === current ? 700 : 400,
              fontSize: '0.875rem',
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                background: dot.bg, color: '#fff',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.72rem',
                fontWeight: 700, flexShrink: 0,
              }}>{dot.label}</span>
              問題{i + 1}
            </button>
          )
        })}
      </div>

      {/* ===== 中央：問題本文 ===== */}
      <main style={{
        flex: 1, overflowY: 'auto',
        background: 'var(--color-bg-subtle)',
        padding: '32px clamp(20px, 3vw, 40px)',
      }}>
        {/* ヘッダー */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 24,
          maxWidth: 860, width: '100%', marginLeft: 'auto', marginRight: 'auto',
        }}>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>
            問題 {current + 1} / {questions.length}
          </div>
        </div>

        {/* 問題カード */}
        <div style={{
          maxWidth: 860,
          width: '100%',
          margin: '0 auto',
          background: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 32px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{
            display: 'inline-block',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            fontSize: '0.75rem', fontWeight: 700,
            padding: '3px 10px', borderRadius: 99,
            marginBottom: 16,
          }}>{chapterTitle}</div>

          <p style={{
            fontSize: '1.05rem', fontWeight: 600,
            lineHeight: 1.7, marginBottom: 28,
            color: 'var(--color-text)',
          }}>{q.text}</p>

          {(q.options ?? []).map(opt => (
            <div key={opt.label}
              style={optionStyle(opt.label)}
              onClick={() => handleSelect(opt.label)}
            >
              <span style={circleStyle(opt.label)}>{opt.label}</span>
              <span style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>
                {opt.text}
              </span>
              {isAnswered && opt.label === q.correctAnswer && (
                <span style={{ marginLeft: 'auto', color: 'var(--color-success)', fontWeight: 700 }}>✓</span>
              )}
              {isAnswered && opt.label === selected && opt.label !== q.correctAnswer && (
                <span style={{ marginLeft: 'auto', color: 'var(--color-error)', fontWeight: 700 }}>✗</span>
              )}
            </div>
          ))}

          {isAnswered && (
            <div style={{
              marginTop: 20,
              background: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontWeight: 700, fontSize: '0.875rem',
                marginBottom: 8, color: 'var(--color-text)',
              }}>
                💡 解説
              </div>
              <p style={{
                fontSize: '0.9rem', lineHeight: 1.7,
                color: 'var(--color-text)',
              }}>{q.explanation}</p>
            </div>
          )}

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginTop: 24,
            gap: 12,
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
                background: 'var(--color-primary)', color: '#fff',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700, fontSize: '0.9rem',
                border: 'none', cursor: 'pointer',
              }}>次の問題 →</button>
            )}
            {isAnswered && current === questions.length - 1 && (
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
                  background: 'var(--color-success)', color: '#fff',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700, fontSize: '0.9rem',
                  textDecoration: 'none',
                }}>完了 🎉 ダッシュボードへ</Link>
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  )
}
