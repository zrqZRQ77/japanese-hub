// ============================================================
// 練習問題 クライアントコンポーネント（全インタラクション）
// 修改此文件 → 所有考试的练习题页面同步更新
// ============================================================
'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Question } from '@/lib/types'
import { useProgress } from '@/lib/hooks/useProgress'
import { trackEvent } from '@/lib/analytics'
import { answersToRecord, gradePracticeAnswers } from '@/lib/questions/practice-grading'
import NonChoiceQuestion from '@/components/features/questions/NonChoiceQuestion'
import AdSlot from '@/components/monetization/AdSlot'

interface Props {
  questions: Question[]
  chapterTitle: string
  examId: string
  chapterId: string
  initialQuestionId?: string
  reviewCardsByQuestion?: Record<string, { href: string; label: string; cardType?: string }>
}

export default function QuestionClient({ questions, chapterTitle, examId, chapterId, initialQuestionId, reviewCardsByQuestion = {} }: Props) {
  const initialQuestionIndex = Math.max(0, questions.findIndex(question => question.id === initialQuestionId))
  const [current, setCurrent] = useState(initialQuestionIndex)
  const [selected, setSelected] = useState<string | string[] | null>(null)
  const [answered, setAnswered] = useState<Record<number, string | string[]>>({})
  const [saved, setSaved] = useState(false)
  const { progress, recordQuestionAnswer } = useProgress(examId)

  const q = questions[current]
  const reviewCardLink = reviewCardsByQuestion[q?.id]
  const base = `/exams/${examId}`
  const chapterCardsPath = `${base}/cards?chapter=${chapterId}`

  const getStoredAnswer = (index: number) => {
    const stored = progress?.questionProgress[questions[index]?.id]?.selectedAnswer
    return typeof stored === 'string' || Array.isArray(stored) ? stored : null
  }

  const selectedAnswer = selected ?? getStoredAnswer(current)
  const selectedChoiceAnswer = typeof selectedAnswer === 'string' ? selectedAnswer : null
  const isAnswered = selectedAnswer !== null
  const answeredIds = useMemo(() => {
    const ids = new Set(progress?.chapterProgress[chapterId]?.answeredQuestionIds ?? [])
    Object.keys(answered).forEach(index => {
      const question = questions[Number(index)]
      if (question) ids.add(question.id)
    })
    return ids
  }, [answered, chapterId, progress, questions])

  function isCorrect(question: Question, answer: string | string[]) {
    if (question.practiceSheet) {
      return gradePracticeAnswers(
        question.practiceSheet.fields,
        answersToRecord(question.practiceSheet.fields, answer),
      ).isCorrect
    }
    if (Array.isArray(question.correctAnswer)) {
      const actual = Array.isArray(answer) ? answer : [answer]
      return question.correctAnswer.length === actual.length
        && question.correctAnswer.every(item => actual.includes(item))
    }
    return typeof answer === 'string' && question.correctAnswer === answer
  }

  function isCorrectOption(question: Question, label: string) {
    return Array.isArray(question.correctAnswer)
      ? question.correctAnswer.includes(label)
      : question.correctAnswer === label
  }

  function recordAnswer(answer: string | string[], answerIsCorrect: boolean) {
    const completesChapter = !answeredIds.has(q.id)
      && answeredIds.size + 1 >= questions.length
    const nextAnswered = { ...answered, [current]: answer }
    setSelected(answer)
    setAnswered(nextAnswered)
    recordQuestionAnswer(
      chapterId,
      chapterTitle,
      q,
      answer,
      answerIsCorrect,
      questions.length,
    )
    trackEvent('practice_answer', {
      exam_id: examId,
      chapter_id: chapterId,
      question_id: q.id,
      question_number: current + 1,
      question_type: q.practiceSheet ? 'non_choice' : 'choice',
      answer_result: answerIsCorrect ? 'correct' : 'incorrect',
    })
    if (completesChapter) {
      trackEvent('practice_chapter_complete', {
        exam_id: examId,
        chapter_id: chapterId,
        question_count: questions.length,
      })
    }
    setSaved(true)
  }

  function handleSelect(label: string) {
    if (isAnswered) return
    recordAnswer(label, isCorrect(q, label))
  }

  function handlePracticeSubmit(answer: string[], answerIsCorrect: boolean) {
    if (isAnswered) return
    recordAnswer(answer, answerIsCorrect)
  }

  function goTo(index: number) {
    setCurrent(index)
    setSelected(answered[index] ?? getStoredAnswer(index))
  }

  function handleNext() {
    if (current < questions.length - 1) goTo(current + 1)
  }

  function handlePrevious() {
    if (current > 0) goTo(current - 1)
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
      width: '100%', textAlign: 'left', fontFamily: 'inherit',
      padding: '15px 18px',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      cursor: isAnswered ? 'default' : 'pointer',
      marginBottom: 9,
      transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease',
      background: 'var(--color-bg)',
      boxShadow: '0 1px 0 rgba(26,29,41,0.02)',
    }
    if (!isAnswered) return { ...base }
    if (isCorrectOption(q, label)) return {
      ...base, background: 'var(--color-success-bg)',
      border: '1.5px solid var(--color-success)',
      boxShadow: '0 8px 24px rgba(47,107,95,0.08)',
    }
    if (label === selectedChoiceAnswer && !isCorrectOption(q, label)) return {
      ...base, background: 'var(--color-error-bg)',
      border: '1.5px solid var(--color-error)',
      boxShadow: '0 8px 24px rgba(184,74,58,0.08)',
    }
    return { ...base, opacity: 0.6 }
  }

  const circleStyle = (label: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: 34, height: 34, borderRadius: 'var(--radius-sm)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: '0.875rem', flexShrink: 0,
      background: 'var(--color-bg-muted)',
      color: 'var(--color-text-secondary)',
      border: '1.5px solid var(--color-border)',
    }
    if (!isAnswered) return base
    if (isCorrectOption(q, label)) return {
      ...base, background: 'var(--color-success)',
      color: 'var(--color-bg)', border: 'none',
    }
    if (label === selectedChoiceAnswer && !isCorrectOption(q, label)) return {
      ...base, background: 'var(--color-error)',
      color: 'var(--color-bg)', border: 'none',
    }
    return base
  }

  const statusDot = (i: number) => {
    const st = getQuestionStatus(i)
    if (st === 'correct') return { bg: 'var(--color-success)', label: '✓' }
    if (st === 'wrong')   return { bg: 'var(--color-error)',   label: '✗' }
    return { bg: i === current ? 'var(--color-primary)' : 'var(--color-border)', label: String(i + 1) }
  }

  const answeredCount = answeredIds.size
  const completionRate = questions.length === 0 ? 0 : (answeredCount / questions.length) * 100
  const currentAnswerState = selectedAnswer && q?.correctAnswer
    ? (isCorrect(q, selectedAnswer) ? 'correct' : 'wrong')
    : null
  const allAnswered = answeredCount >= questions.length

  return (
    <div className="question-layout" style={{
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
      height: '100%',
      width: '100%',
      background: 'var(--color-bg-subtle)',
    }}>

      {/* ===== 左：問題リスト ===== */}
      <div className="question-left-panel" style={{
        width: 'var(--guide-sidebar-width)', flexShrink: 0,
        borderRight: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        overflowY: 'auto',
        padding: '22px 14px 24px 18px',
        backdropFilter: 'blur(12px)',
        boxShadow: 'inset -1px 0 0 rgba(244,243,239,0.55)',
      }}>
        <div style={{
          padding: '4px 8px 20px',
          marginBottom: 14,
        }}>
          <Link href={`${base}/questions`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '0.78rem', color: 'var(--color-text-muted)',
            textDecoration: 'none', fontWeight: 700,
            padding: '6px 10px', borderRadius: 'var(--radius-sm)',
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
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
              borderColor: i === current ? 'rgba(201,162,75,0.35)' : 'transparent',
              borderRadius: 'var(--radius-sm)',
              background: i === current
                ? 'var(--color-primary-light)'
                : 'transparent',
              cursor: 'pointer', marginBottom: 6,
              color: 'var(--color-text)',
              fontWeight: i === current ? 700 : 400,
              fontSize: '0.92rem',
              boxShadow: i === current ? '0 12px 28px rgba(26,29,41,0.06)' : 'none',
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                background: dot.bg, color: 'var(--color-bg)',
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
      <main className="question-main" style={{
        flex: 1, overflowY: 'auto',
        background: 'transparent',
        padding: '28px 32px 36px',
      }}>
        {/* ヘッダー */}
        <div className="question-header" style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 16,
          maxWidth: 960, width: '100%', marginLeft: 'auto', marginRight: 'auto',
        }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-secondary)' }}>
            問題 {current + 1} / {questions.length}
          </div>
          <div className="question-chapter-badge" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 12px', borderRadius: 'var(--radius-sm)',
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
            fontSize: '0.8rem', fontWeight: 700,
          }}>{chapterTitle}</div>
        </div>

        {/* 問題カード */}
        <div className="question-card" style={{
          maxWidth: 960,
          width: '100%',
          margin: '0 auto',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '26px 32px',
          boxShadow: 'var(--shadow-elevated)',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            display: 'inline-block',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary-dark)',
            fontSize: '0.75rem', fontWeight: 800,
            padding: '5px 12px', borderRadius: 'var(--radius-sm)',
            marginBottom: 14,
          }}>{chapterTitle}</div>

          <p style={{
            fontSize: '1.06rem', fontWeight: 650,
            lineHeight: 1.8, marginBottom: 20,
            color: 'var(--color-text)',
          }}>{q.text}</p>

          {q.practiceSheet ? (
            <NonChoiceQuestion
              key={`${q.id}:${Array.isArray(selectedAnswer) ? selectedAnswer.join('|') : selectedAnswer ?? 'new'}`}
              question={q}
              storedAnswer={selectedAnswer}
              onSubmit={handlePracticeSubmit}
              reviewCardLink={reviewCardLink}
            />
          ) : (
            (q.options ?? []).map(opt => (
              <button key={opt.label}
                type="button"
                disabled={isAnswered}
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
                {isAnswered && opt.label === selectedChoiceAnswer && !isCorrectOption(q, opt.label) && (
                  <span style={{ marginLeft: 'auto', color: 'var(--color-error)', fontWeight: 700 }}>✗</span>
                )}
              </button>
            ))
          )}

          {isAnswered && !q.practiceSheet && (
            <div style={{
              marginTop: 20,
              background: 'var(--color-bg-muted)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
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
                    borderRadius: 'var(--radius-sm)',
                    background: currentAnswerState === 'correct' ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
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

          {isAnswered && currentAnswerState === 'wrong' && !q.practiceSheet && reviewCardLink && (
            <div style={{
              marginTop: 12,
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-success-bg)',
              fontSize: '0.86rem',
              lineHeight: 1.7,
            }}>
              <strong style={{ display: 'block', marginBottom: 7 }}>間違えた内容をカードで復習</strong>
              <Link href={reviewCardLink.href} style={{ color: 'var(--color-success)', fontWeight: 800, textDecoration: 'none' }}>
                {reviewCardLink.cardType ? `${reviewCardLink.cardType}カード：` : ''}{reviewCardLink.label} →
              </Link>
            </div>
          )}

          <div className="question-actions" style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginTop: 18,
            gap: 12,
            paddingTop: 14,
            borderTop: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {current > 0 && (
                <button type="button" onClick={handlePrevious} style={{
                  padding: '10px 20px',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                }}>前の問題へ</button>
              )}
            </div>

              {current < questions.length - 1 && (
                <button type="button" onClick={handleNext} style={{
                  padding: '10px 28px',
                  background: 'var(--color-primary)', color: 'var(--color-bg)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700, fontSize: '0.9rem',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 10px 24px rgba(201,162,75,0.20)',
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
                <Link href={chapterCardsPath} style={{
                  padding: '10px 28px',
                  background: 'var(--color-success)', color: 'var(--color-bg)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700, fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 10px 24px rgba(47,107,95,0.18)',
                }}>知識カードで復習する</Link>
              </div>
            )}
            {isAnswered && current === questions.length - 1 && !allAnswered && (
              <button
                onClick={() => {
                  const nextIndex = questions.findIndex(question => !answeredIds.has(question.id))
                  if (nextIndex >= 0) goTo(nextIndex)
                }}
                style={{
                  padding: '10px 22px', background: 'var(--color-primary)', color: 'var(--color-bg)',
                  border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer',
                }}
              >未回答の問題へ</button>
            )}
          </div>
        </div>
        <div style={{
          maxWidth: 960,
          width: '100%',
          margin: '24px auto 0',
        }}>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_EXAM_SECONDARY} />
        </div>
      </main>

    </div>
  )
}
