"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  RotateCcw,
  Send,
  X,
} from 'lucide-react'
import type {
  ExamMaterial,
  MockExamQuestion,
  MockExamSectionBlueprint,
} from '../../lib/types'

interface Props {
  initialQuestions: MockExamQuestion[]
  examId?: string
  examName?: string
  durationMinutes?: number
  passRate?: number
  sectionBlueprints?: MockExamSectionBlueprint[]
}

type AnswerValue = string | string[] | Record<string, string>

interface ExamSection {
  id: string
  title: string
  focus: string
  points: number
  questions: MockExamQuestion[]
}

const DEFAULT_SECTION_BLUEPRINTS: MockExamSectionBlueprint[] = [
  { id: 'section-1', title: '第1問', focus: '仕訳問題', points: 45, count: 9 },
  { id: 'section-2', title: '第2問', focus: '補助簿・伝票・試算表', points: 20, count: 4 },
  { id: 'section-3', title: '第3問', focus: '決算整理・精算表', points: 35, count: 7 },
]

function stableShuffle<T>(items: T[]) {
  return items
    .map((item, index) => {
      const key = JSON.stringify(item).length + index * 37
      return { item, key: (key * 9301 + 49297) % 233280 }
    })
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item)
}

function buildSections(
  questions: MockExamQuestion[],
  blueprints: MockExamSectionBlueprint[],
): ExamSection[] {
  // 章別に作問された専用データ(chapterId: "mock-s1"など)がある場合は、
  // 大問ごとに対応するchapterIdの問題だけを抽出する（シャッフルで他の大問の問題が混ざらないようにする）
  const hasCuratedChapters = questions.some(q => /^mock-s\d+$/.test(q.chapterId))

  if (hasCuratedChapters) {
    return blueprints.map((section, index) => {
      const expectedChapterId = `mock-s${index + 1}`
      const matching = questions.filter(q => q.chapterId === expectedChapterId)
      return {
        id: section.id,
        title: section.title,
        focus: section.focus,
        points: section.points,
        questions: stableShuffle(matching).slice(0, section.count),
      }
    }).filter(section => section.questions.length > 0)
  }

  // フォールバック：大問別の専用データがない試験は、全問題プールから人数分を割り振る
  const pool = stableShuffle(questions)
  let cursor = 0

  return blueprints.map((section, index) => {
    const nextCursor = Math.min(pool.length, cursor + section.count)
    let sectionQuestions = pool.slice(cursor, nextCursor)
    cursor = nextCursor

    if (sectionQuestions.length === 0 && pool.length > 0) {
      sectionQuestions = pool.slice(index, index + 1)
    }

    return {
      id: section.id,
      title: section.title,
      focus: section.focus,
      points: section.points,
      questions: sectionQuestions,
    }
  }).filter(section => section.questions.length > 0)
}

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function normalizeAnswer(value: string) {
  return value
    .replace(/[,\s　円]/g, '')
    .replace(/[（(].*?[）)]/g, '')
    .trim()
}

function isAnswerRecord(answer: AnswerValue | undefined): answer is Record<string, string> {
  return Boolean(answer) && !Array.isArray(answer) && typeof answer === 'object'
}

function expectedBlankEntries(q: MockExamQuestion) {
  if (!q.answerSheet) return []
  if (q.answerSheet.kind === 'journal') {
    return (q.answerSheet.lines ?? []).flatMap(line => [
      [`${line.id}-account`, line.account] as const,
      [`${line.id}-amount`, line.amount] as const,
    ])
  }
  return (q.answerSheet.blanks ?? []).map(blank => [blank.id, blank.answer] as const)
}

function hasAnswer(q: MockExamQuestion, answer: AnswerValue | undefined) {
  if (q.answerSheet) {
    if (!isAnswerRecord(answer)) return false
    const entries = expectedBlankEntries(q)
    return entries.length > 0 && entries.every(([id]) => Boolean(answer[id]?.trim()))
  }
  if (!answer) return false
  return Array.isArray(answer) ? answer.length > 0 : Boolean(String(answer).trim())
}

function isCorrect(q: MockExamQuestion, answer: AnswerValue | undefined) {
  if (!answer) return false
  if (q.answerSheet) {
    if (!isAnswerRecord(answer)) return false
    return expectedBlankEntries(q).every(([id, expected]) => {
      const actual = answer[id] ?? ''
      return normalizeAnswer(actual) === normalizeAnswer(expected)
    })
  }
  if (q.type === 'multiple') {
    const expected = Array.isArray(q.correctAnswer) ? q.correctAnswer : [String(q.correctAnswer)]
    const selected = Array.isArray(answer) ? answer : [String(answer)]
    return expected.slice().sort().join(',') === selected.slice().sort().join(',')
  }
  return String(q.correctAnswer) === String(answer)
}

function answerLabel(answer: AnswerValue | undefined) {
  if (!answer) return '未回答'
  if (isAnswerRecord(answer)) return '解答欄に入力済み'
  return Array.isArray(answer) ? answer.join(', ') : answer
}

function scoreRatio(q: MockExamQuestion, answer: AnswerValue | undefined) {
  if (!answer) return 0
  if (q.answerSheet) {
    if (!isAnswerRecord(answer)) return 0
    const entries = expectedBlankEntries(q)
    if (entries.length === 0) return 0
    const correctEntries = entries.filter(([id, expected]) => {
      const actual = answer[id] ?? ''
      return normalizeAnswer(actual) === normalizeAnswer(expected)
    }).length
    return correctEntries / entries.length
  }
  return isCorrect(q, answer) ? 1 : 0
}

function sectionInstruction(sectionIndex: number) {
  if (sectionIndex === 0) {
    return '次の各取引について、答案用紙の借方・貸方に勘定科目と金額を記入しなさい。なお、消費税は指示がある場合のみ考慮する。'
  }
  if (sectionIndex === 1) {
    return '次の資料にもとづいて、商品有高帳・補助簿・勘定記入に関する空欄へ答えを入力しなさい。'
  }
  return '次の決算整理事項および試算表にもとづいて、決算整理後の金額を計算し、空欄へ入力しなさい。'
}

function promptText(q: MockExamQuestion) {
  if (!q.answerSheet) return q.prompt ?? '解答としてもっとも適切なものを選びなさい。'
  if (q.answerSheet.kind === 'journal') {
    return '答案用紙に借方・貸方の勘定科目と金額を入力しなさい。'
  }
  return '資料を整理し、答案用紙の空欄に入る金額または語句を入力しなさい。'
}

function buildExamMaterial(sectionIndex: number, questionIndex: number, question: MockExamQuestion): ExamMaterial {
  if (question.material) return question.material

  const amount = 8000 + ((sectionIndex + 2) * (questionIndex + 3) * 1000)

  if (sectionIndex === 0) {
    return {
      kind: 'transaction',
      title: `取引 ${questionIndex + 1}`,
      lead: question.text,
      rows: [
        ['日付', `${questionIndex + 4}月${questionIndex + 10}日`],
        ['取引内容', question.text],
        ['参考金額', `${amount.toLocaleString()}円`],
      ],
    }
  }

  if (sectionIndex === 1) {
    return {
      kind: 'table',
      title: '資料',
      lead: '当月中の取引記録の一部は次のとおりである。',
      rows: [
        ['摘要', '金額'],
        ['商品を掛けで仕入れた', `${(amount * 3).toLocaleString()}円`],
        ['売掛金を現金で回収した', `${(amount * 2).toLocaleString()}円`],
        ['小切手を振り出して買掛金を支払った', `${amount.toLocaleString()}円`],
      ],
      note: question.text,
    }
  }

  return {
    kind: 'table',
    title: '決算整理事項',
    lead: '会計期間は1年、決算日は3月31日である。決算整理前残高試算表の一部と整理事項は次のとおりである。',
    rows: [
      ['借方残高', '勘定科目', '貸方残高'],
      [`${(amount * 4).toLocaleString()}円`, '現金', ''],
      [`${(amount * 6).toLocaleString()}円`, '売掛金', ''],
      [`${(amount * 12).toLocaleString()}円`, '備品', ''],
      ['', '買掛金', `${(amount * 5).toLocaleString()}円`],
      ['', '売上', `${(amount * 15).toLocaleString()}円`],
    ],
    note: question.text,
  }
}

const buttonBase: React.CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  minHeight: 42,
  padding: '9px 14px',
}

export default function MockExam({
  initialQuestions,
  examId = 'exam',
  examName = '模擬試験',
  durationMinutes = 60,
  passRate = 70,
  sectionBlueprints = DEFAULT_SECTION_BLUEPRINTS,
}: Props) {
  const [started, setStarted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60)
  const [currentSection, setCurrentSection] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [showRestartConfirm, setShowRestartConfirm] = useState(false)

  const examQuestions = useMemo<MockExamQuestion[]>(
    () => initialQuestions,
    [initialQuestions],
  )
  const sections = useMemo(
    () => buildSections(examQuestions, sectionBlueprints),
    [examQuestions, sectionBlueprints],
  )
  const activeSection = sections[currentSection] ?? sections[0]
  const activeQuestion = activeSection?.questions[currentQuestion] ?? activeSection?.questions[0]
  const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0)
  const answeredCount = sections
    .flatMap(section => section.questions)
    .filter(q => hasAnswer(q, answers[q.id]))
    .length

  useEffect(() => {
    if (!started || submitted) return
    const timer = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          window.clearInterval(timer)
          setSubmitted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [started, submitted])

  const result = useMemo(() => {
    const sectionResults = sections.map(section => {
      const questionPoint = section.points / section.questions.length
      const ratios = section.questions.map(question => scoreRatio(question, answers[question.id]))
      const correctCount = ratios.filter(ratio => ratio === 1).length
      const sectionScore = Math.round(
        ratios.reduce((sum, ratio) => sum + ratio * questionPoint, 0) * 10
      ) / 10
      return { ...section, correctCount, sectionScore }
    })

    const score = sectionResults.reduce((sum, section) => sum + section.sectionScore, 0)
    const roundedScore = Math.round(score)
    const weakTags = sections
      .flatMap(section => section.questions)
      .filter(q => hasAnswer(q, answers[q.id]) && !isCorrect(q, answers[q.id]))
      .flatMap(q => q.tags ?? [q.chapterId])
      .reduce<Record<string, number>>((acc, tag) => {
        acc[tag] = (acc[tag] ?? 0) + 1
        return acc
      }, {})

    return {
      score: roundedScore,
      rate: roundedScore,
      passed: roundedScore >= passRate,
      sectionResults,
      weakTags: Object.entries(weakTags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    }
  }, [answers, passRate, sections])

  function selectOption(q: MockExamQuestion, label: string, checked?: boolean) {
    if (submitted) return
    setAnswers(prev => {
      if (q.type === 'multiple') {
        const current = Array.isArray(prev[q.id]) ? prev[q.id] as string[] : []
        const next = checked
          ? Array.from(new Set([...current, label]))
          : current.filter(item => item !== label)
        return { ...prev, [q.id]: next }
      }
      return { ...prev, [q.id]: label }
    })
  }

  function updateBlankAnswer(q: MockExamQuestion, fieldId: string, value: string) {
    if (submitted) return
    setAnswers(prev => {
      const existing = prev[q.id]
      const current: Record<string, string> = isAnswerRecord(existing) ? existing : {}
      return { ...prev, [q.id]: { ...current, [fieldId]: value } }
    })
  }

  function goTo(sectionIndex: number, questionIndex = 0) {
    setCurrentSection(sectionIndex)
    setCurrentQuestion(questionIndex)
  }

  function goNext() {
    if (!activeSection) return
    if (currentQuestion < activeSection.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      return
    }
    if (currentSection < sections.length - 1) {
      goTo(currentSection + 1, 0)
    }
  }

  function goPrev() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      return
    }
    if (currentSection > 0) {
      const prevSection = sections[currentSection - 1]
      goTo(currentSection - 1, Math.max(0, prevSection.questions.length - 1))
    }
  }

  function resetExam() {
    setShowRestartConfirm(false)
    setStarted(false)
    setSubmitted(false)
    setTimeLeft(durationMinutes * 60)
    setCurrentSection(0)
    setCurrentQuestion(0)
    setAnswers({})
  }

  function submitExam() {
    if (answeredCount < totalQuestions && !window.confirm('未回答の問題があります。このまま採点しますか？')) {
      return
    }
    setSubmitted(true)
  }

  if (!activeSection || !activeQuestion) {
    return (
      <div className="boki-exam-shell">
        <div className="boki-empty">
          <AlertCircle size={28} />
          <h1>模擬試験の問題がまだありません</h1>
          <p>問題データを追加すると、このページで本番形式の演習ができます。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="boki-exam-shell">
      {!started ? (
        <>
          <section className="boki-hero">
            <div>
              <div className="boki-kicker">
                <FileText size={16} />
                模擬試験
              </div>
              <h1>{examName} 模擬試験</h1>
              <p>
                3つの大問で、仕訳・補助簿・決算整理を横断して確認します。
                試験中は左の大問リストから自由に見直せます。
              </p>
            </div>
          </section>

          <section className="boki-start">
            <div>
              <h2>本番前の最終確認</h2>
              <p>
                途中保存なしで60分を測ります。第1問から第3問まで順番に進めても、
                左の大問リストから戻って見直しても構いません。
              </p>
              <div className="boki-start-actions">
                <button
                  type="button"
                  onClick={() => setStarted(true)}
                  style={{ ...buttonBase, background: 'var(--color-primary)', color: 'var(--color-bg)', borderColor: 'var(--color-primary)' }}
                >
                  <Clock3 size={18} />
                  試験を開始
                </button>
                <Link href={`/exams/${examId}`} style={buttonBase}>
                  <BookOpen size={18} />
                  学習ページへ戻る
                </Link>
              </div>
            </div>
            <div className="boki-start-panel">
              <h3>この模試の構成</h3>
              <div className="boki-start-stats">
                <div>
                  <Clock3 size={16} />
                  <strong>{durationMinutes}分</strong>
                  <span>試験時間</span>
                </div>
                <div>
                  <BadgeCheck size={16} />
                  <strong>{passRate}点</strong>
                  <span>合格基準</span>
                </div>
                <div>
                  <ClipboardList size={16} />
                  <strong>{totalQuestions}問</strong>
                  <span>出題数</span>
                </div>
              </div>
              {sections.map(section => (
                <div key={section.id} className="boki-plan-row">
                  <span>{section.title}</span>
                  <strong>{section.focus}</strong>
                  <em>{section.questions.length}問</em>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="boki-exam-topbar">
            <div className={timeLeft <= 300 && !submitted ? 'boki-timer danger' : 'boki-timer'}>
              <Clock3 size={18} />
              <span>残り時間</span>
              <strong>{formatTime(timeLeft)}</strong>
            </div>
            <div className="boki-progress-inline">
              <span>回答 {answeredCount}/{totalQuestions}</span>
              <div className="boki-progress-track">
                <div style={{ width: `${totalQuestions ? (answeredCount / totalQuestions) * 100 : 0}%` }} />
              </div>
            </div>
            {!submitted && (
              <button
                type="button"
                onClick={submitExam}
                style={{ ...buttonBase, background: 'var(--color-success)', color: 'var(--color-bg)', borderColor: 'var(--color-success)' }}
              >
                <Send size={17} />
                採点する
              </button>
            )}
          </div>

          <div className="boki-exam-grid">
            <main className="boki-question-panel">
              <nav className="boki-nav-panel" aria-label="大問ナビ">
                <div className="boki-panel-title">
                  <ClipboardList size={18} />
                  大問
                </div>
                <div className="boki-nav-strip">
                  {sections.map((section, sectionIndex) => {
                    const sectionAnswered = section.questions.filter(q => hasAnswer(q, answers[q.id])).length
                    const active = sectionIndex === currentSection
                    return (
                      <button
                        key={section.id}
                        type="button"
                        className={active ? 'active' : ''}
                        onClick={() => goTo(sectionIndex)}
                      >
                        <span>{section.title}</span>
                        <strong>{section.focus}</strong>
                        <em>{sectionAnswered}/{section.questions.length}問</em>
                      </button>
                    )
                  })}
                </div>
              </nav>

              {submitted && (
                <section className={result.passed ? 'boki-result passed' : 'boki-result'}>
                  <div>
                    {result.passed ? <BadgeCheck size={30} /> : <AlertCircle size={30} />}
                    <div>
                      <h2>{result.passed ? '合格ライン到達' : 'もう一歩で合格ライン'}</h2>
                      <p>{result.score}点 / 100点・合格基準 {passRate}点</p>
                    </div>
                  </div>
                  <div className="boki-result-actions">
                    <div style={{ position: 'relative', display: 'inline-flex' }}>
                      <button type="button" onClick={() => setShowRestartConfirm(true)} style={buttonBase}>
                        <RotateCcw size={17} />
                        もう一度
                      </button>
                      {showRestartConfirm && (
                        <div className="boki-restart-confirm">
                          <strong>模試を最初からやり直しますか？</strong>
                          <span>現在の解答と採点結果は画面から消えます。</span>
                          <div>
                            <button type="button" onClick={resetExam}>やり直す</button>
                            <button type="button" onClick={() => setShowRestartConfirm(false)}>キャンセル</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <Link href={`/exams/${examId}/guide`} style={buttonBase}>
                      <BookOpen size={17} />
                      復習する
                    </Link>
                  </div>
                </section>
              )}

              <section className="boki-question-card">
                <div className="boki-question-head">
                  <div>
                    <span>{activeSection.title}</span>
                    <h2>{activeSection.focus}</h2>
                  </div>
                </div>

                <div className="boki-content-wrap">
                  <p className="boki-instruction">{sectionInstruction(currentSection)}</p>

                  {(() => {
                    const material = buildExamMaterial(currentSection, currentQuestion, activeQuestion)
                    return (
                      <div className={`boki-material ${material.kind === 'transaction' ? 'transaction' : ''}`}>
                        <div className="boki-material-title">{material.title}</div>
                        {material.lead && <p>{material.lead}</p>}
                        {material.kind === 'transaction' ? (
                          <div className="boki-transaction-rows">
                            {material.rows.map((row, rowIndex) => (
                              <div key={`${row[0]}-${rowIndex}`} className="boki-transaction-row">
                                <span>{row[0]}</span>
                                <strong>{row[1]}</strong>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="boki-table-wrap">
                            <table>
                              <tbody>
                                {material.rows.map((row, rowIndex) => (
                                  <tr key={`${row[0]}-${rowIndex}`}>
                                    {row.map((cell, cellIndex) => (
                                      <td key={`${cell}-${cellIndex}`}>{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {'note' in material && material.note && <p className="boki-material-note">{material.note}</p>}
                      </div>
                    )
                  })()}

                  <div className="boki-question-meta">
                    問{currentQuestion + 1} / {activeSection.questions.length}
                    <span>{activeQuestion.tags?.slice(0, 2).join(' / ') || activeQuestion.chapterId}</span>
                  </div>

                  <p className="boki-question-text">{promptText(activeQuestion)}</p>

                  {activeQuestion.answerSheet ? (
                    activeQuestion.answerSheet.kind === 'journal' ? (
                      <div className="boki-answer-sheet">
                        <div className="boki-answer-title">解答欄</div>
                        <div className="boki-journal-grid">
                          <div>借方・貸方</div>
                          <div>勘定科目</div>
                          <div>金額</div>
                          {(activeQuestion.answerSheet.lines ?? []).map(line => {
                            const existingAnswer = answers[activeQuestion.id]
                            const answer: Record<string, string> = isAnswerRecord(existingAnswer) ? existingAnswer : {}
                            const accountId = `${line.id}-account`
                            const amountId = `${line.id}-amount`
                            const accountCorrect = submitted && normalizeAnswer(answer[accountId] ?? '') === normalizeAnswer(line.account)
                            const amountCorrect = submitted && normalizeAnswer(answer[amountId] ?? '') === normalizeAnswer(line.amount)

                            return (
                              <div key={line.id} className="boki-journal-row">
                                <strong>{line.side}</strong>
                                <label className={submitted ? (accountCorrect ? 'correct' : 'wrong') : ''}>
                                  <span>科目</span>
                                  <input
                                    value={answer[accountId] ?? ''}
                                    disabled={submitted}
                                    onChange={e => updateBlankAnswer(activeQuestion, accountId, e.target.value)}
                                    placeholder="例：現金"
                                  />
                                  {submitted && <em>{line.account}</em>}
                                </label>
                                <label className={submitted ? (amountCorrect ? 'correct' : 'wrong') : ''}>
                                  <span>金額</span>
                                  <input
                                    inputMode="numeric"
                                    value={answer[amountId] ?? ''}
                                    disabled={submitted}
                                    onChange={e => updateBlankAnswer(activeQuestion, amountId, e.target.value)}
                                    placeholder="円"
                                  />
                                  {submitted && <em>{Number(line.amount).toLocaleString()}円</em>}
                                </label>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="boki-answer-sheet">
                        <div className="boki-answer-title">解答欄</div>
                        <div className="boki-blank-grid">
                          {(activeQuestion.answerSheet.blanks ?? []).map(blank => {
                            const existingAnswer = answers[activeQuestion.id]
                            const answer: Record<string, string> = isAnswerRecord(existingAnswer) ? existingAnswer : {}
                            const correct = submitted && normalizeAnswer(answer[blank.id] ?? '') === normalizeAnswer(blank.answer)

                            return (
                              <label key={blank.id} className={submitted ? (correct ? 'correct' : 'wrong') : ''}>
                                <span>{blank.label}</span>
                                <div>
                                  <input
                                    value={answer[blank.id] ?? ''}
                                    disabled={submitted}
                                    onChange={e => updateBlankAnswer(activeQuestion, blank.id, e.target.value)}
                                    placeholder="解答を入力"
                                  />
                                  {blank.suffix && <strong>{blank.suffix}</strong>}
                                </div>
                                {submitted && <em>正解: {Number.isNaN(Number(blank.answer)) ? blank.answer : Number(blank.answer).toLocaleString()}{blank.suffix ?? ''}</em>}
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="boki-options">
                      {(activeQuestion.options ?? []).map(option => {
                        const selected = activeQuestion.type === 'multiple'
                          ? Array.isArray(answers[activeQuestion.id]) && (answers[activeQuestion.id] as string[]).includes(option.label)
                          : answers[activeQuestion.id] === option.label
                        const correct = submitted && option.label === activeQuestion.correctAnswer
                        const wrong = submitted && selected && !correct

                        return (
                          <label key={option.label} className={`${selected ? 'selected' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`}>
                            {activeQuestion.type === 'multiple' ? (
                              <input
                                type="checkbox"
                                checked={selected}
                                disabled={submitted}
                                onChange={e => selectOption(activeQuestion, option.label, e.target.checked)}
                              />
                            ) : (
                              <input
                                type="radio"
                                name={activeQuestion.id}
                                checked={selected}
                                disabled={submitted}
                                onChange={() => selectOption(activeQuestion, option.label)}
                              />
                            )}
                            <span className="boki-option-label">{option.label}</span>
                            <span>{option.text}</span>
                            {correct && <CheckCircle2 size={18} />}
                            {wrong && <X size={18} />}
                          </label>
                        )
                      })}
                    </div>
                  )}

                  {submitted && (
                    <div className="boki-explanation">
                      <div>
                        <strong>あなたの回答</strong>
                        <span>{answerLabel(answers[activeQuestion.id])}</span>
                      </div>
                      <div>
                        <strong>正解</strong>
                        <span>{activeQuestion.answerSheet ? '各解答欄に表示' : String(activeQuestion.correctAnswer)}</span>
                      </div>
                      <p>{activeQuestion.explanation}</p>
                    </div>
                  )}

                  <div className="boki-question-actions">
                    <button type="button" onClick={goPrev} disabled={currentSection === 0 && currentQuestion === 0} style={buttonBase}>
                      <ArrowLeft size={17} />
                      前へ
                    </button>
                    <button type="button" onClick={goNext} disabled={currentSection === sections.length - 1 && currentQuestion === activeSection.questions.length - 1} style={buttonBase}>
                      次へ
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              </section>

              {submitted && (
                <section className="boki-weakness">
                  <h3>優先して復習</h3>
                  {result.weakTags.length > 0 ? result.weakTags.map(([tag, count]) => (
                    <div key={tag}>
                      <span>{tag}</span>
                      <strong>{count}問</strong>
                    </div>
                  )) : (
                    <p>大きな弱点はありません。この調子です。</p>
                  )}
                </section>
              )}
            </main>
          </div>
        </>
      )}

      <style>{`
        .boki-exam-shell {
          background: var(--color-bg-subtle);
          min-height: calc(100vh - 60px);
          padding: 28px 0 44px;
        }

        .boki-hero,
        .boki-start,
        .boki-exam-topbar,
        .boki-exam-grid {
          max-width: var(--content-max-width);
          margin: 0 auto;
          padding-left: 24px;
          padding-right: 24px;
        }

        .boki-hero {
          margin-bottom: 28px;
          padding-top: 12px;
        }

        .boki-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--color-primary);
          font-size: 0.78rem;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .boki-hero h1 {
          font-size: clamp(1.55rem, 3vw, 2.25rem);
          line-height: 1.2;
          margin: 0 0 10px;
          font-weight: 900;
          color: var(--color-text);
        }

        .boki-hero p,
        .boki-start p {
          color: var(--color-text-secondary);
          line-height: 1.75;
          margin: 0;
          max-width: 760px;
        }

        .boki-start,
        .boki-start-panel,
        .boki-nav-panel,
        .boki-question-card,
        .boki-weakness,
        .boki-result,
        .boki-empty {
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-card);
        }

        .boki-question-meta,
        .boki-timer span,
        .boki-progress-inline span {
          color: var(--color-text-muted);
          font-size: 0.76rem;
          font-weight: 700;
        }

        .boki-start {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
          gap: 24px;
          padding-top: 28px;
          padding-bottom: 28px;
        }

        .boki-start h2,
        .boki-start-panel h3,
        .boki-weakness h3 {
          margin: 0 0 12px;
          font-size: 1.05rem;
          font-weight: 900;
          color: var(--color-text);
        }

        .boki-start-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 22px;
        }

        .boki-start-panel {
          padding: 20px;
        }

        .boki-start-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 14px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--color-border);
        }

        .boki-start-stats > div {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 6px;
          border-radius: var(--radius-sm);
          background: var(--color-bg-subtle);
          text-align: center;
        }

        .boki-start-stats svg {
          color: var(--color-primary);
        }

        .boki-start-stats strong {
          font-size: 1rem;
          font-weight: 900;
          color: var(--color-text);
        }

        .boki-start-stats span {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--color-text-muted);
        }

        .boki-plan-row,
        .boki-weakness div {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 10px;
          align-items: center;
          padding: 10px 0;
          border-top: 1px solid var(--color-border);
        }

        .boki-plan-row span {
          font-weight: 900;
          color: var(--color-primary);
        }

        .boki-plan-row strong {
          font-size: 0.87rem;
          color: var(--color-text);
        }

        .boki-plan-row em {
          font-style: normal;
          color: var(--color-text-secondary);
          font-size: 0.78rem;
          font-weight: 700;
        }

        .boki-exam-topbar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          margin-bottom: 16px;
          position: sticky;
          top: 60px;
          z-index: 10;
          background: color-mix(in srgb, var(--color-bg-subtle) 88%, transparent);
          backdrop-filter: blur(8px);
          padding-top: 10px;
          padding-bottom: 10px;
        }

        .boki-progress-inline {
          display: grid;
          grid-template-columns: auto minmax(90px, 140px);
          gap: 10px;
          align-items: center;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 9px 12px;
        }

        .boki-exam-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 14px;
          align-items: start;
        }

        .boki-nav-panel {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 12px;
          align-items: start;
          padding: 12px;
          position: static;
          margin: 0 auto 8px;
          width: min(100%, 980px);
        }

        .boki-panel-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 900;
          padding: 0 8px;
          white-space: nowrap;
        }

        .boki-nav-strip {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .boki-nav-strip button {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 5px;
          width: 100%;
          min-width: 0;
          border: 1px solid var(--color-border);
          background: var(--color-bg);
          text-align: left;
          cursor: pointer;
          padding: 12px 14px;
          border-radius: var(--radius-md);
          transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease, transform 160ms ease;
        }

        .boki-nav-strip button:hover {
          border-color: rgba(201, 162, 75, 0.45);
          transform: translateY(-1px);
        }

        .boki-nav-strip button.active {
          background: var(--color-primary-light);
          border-color: var(--color-primary);
          box-shadow: 0 10px 22px rgba(201, 162, 75, 0.16);
        }

        .boki-nav-strip button span {
          color: var(--color-primary);
          font-weight: 900;
          font-size: 0.78rem;
          letter-spacing: 0.02em;
        }

        .boki-nav-strip button strong {
          display: block;
          color: var(--color-text);
          font-size: 0.88rem;
          font-weight: 800;
          line-height: 1.35;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .boki-nav-strip button em {
          color: var(--color-text-muted);
          font-style: normal;
          font-size: 0.76rem;
          font-weight: 700;
        }

        .boki-nav-strip button.active em {
          color: var(--color-primary-dark);
        }

        .boki-question-dots {
          display: flex;
          gap: 5px;
          margin-top: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .boki-question-dots button {
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-bg);
          color: var(--color-text-secondary);
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
        }

        .boki-question-dots button.answered {
          border-color: var(--color-primary);
          color: var(--color-primary);
          background: var(--color-primary-light);
        }

        .boki-question-dots button.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: var(--color-bg);
        }

        .boki-result {
          padding: 18px;
          margin-bottom: 16px;
          border-color: var(--color-error-border);
          background: var(--color-error-bg);
        }

        .boki-result.passed {
          border-color: var(--color-success-border);
          background: var(--color-success-bg);
        }

        .boki-result,
        .boki-result > div,
        .boki-result-actions,
        .boki-question-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
        }

        .boki-result h2 {
          margin: 0 0 3px;
          font-size: 1.08rem;
          font-weight: 900;
        }

        .boki-result p {
          margin: 0;
          color: var(--color-text-secondary);
          font-size: 0.88rem;
        }

        .boki-restart-confirm {
          position: absolute;
          z-index: 5;
          top: calc(100% + 8px);
          right: 0;
          width: min(280px, 72vw);
          padding: 12px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-bg);
          box-shadow: var(--shadow-elevated);
          display: grid;
          gap: 8px;
        }

        .boki-restart-confirm strong {
          color: var(--color-text);
          font-size: 0.84rem;
        }

        .boki-restart-confirm span {
          color: var(--color-text-secondary);
          font-size: 0.75rem;
          line-height: 1.55;
        }

        .boki-restart-confirm div {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .boki-restart-confirm button {
          min-height: 32px;
          padding: 5px 10px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
          background: var(--color-bg);
          color: var(--color-text-secondary);
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
        }

        .boki-restart-confirm button:first-child {
          border-color: var(--color-error);
          background: var(--color-error);
          color: var(--color-bg);
        }

        .boki-question-card {
          padding: clamp(20px, 3vw, 32px);
        }

        .boki-question-panel {
          width: min(100%, 980px);
          margin: 0 auto;
        }

        .boki-content-wrap {
          max-width: 860px;
          margin: 0 auto;
        }

        .boki-question-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .boki-question-head span {
          color: var(--color-primary);
          font-size: 0.78rem;
          font-weight: 900;
        }

        .boki-question-head h2 {
          margin: 4px 0 0;
          font-size: 1.2rem;
          line-height: 1.35;
          color: var(--color-text);
        }

        .boki-question-meta {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .boki-instruction {
          margin: 0 0 18px;
          color: var(--color-text);
          line-height: 1.75;
          font-weight: 700;
        }

        .boki-material {
          border: 1px solid var(--color-border-strong);
          border-radius: var(--radius-sm);
          padding: 18px;
          margin-bottom: 18px;
          max-width: 100%;
          background: var(--color-bg);
        }

        .boki-material-title {
          font-weight: 900;
          color: var(--color-text);
          margin-bottom: 8px;
        }

        .boki-material p {
          margin: 0 0 12px;
          line-height: 1.75;
          color: var(--color-text);
        }

        .boki-material.transaction {
          background: var(--color-bg);
        }

        .boki-transaction-rows {
          display: grid;
          gap: 0;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: var(--color-bg);
        }

        .boki-transaction-row {
          display: grid;
          grid-template-columns: 112px minmax(0, 1fr);
          border-top: 1px solid var(--color-border);
        }

        .boki-transaction-row:first-child {
          border-top: 0;
        }

        .boki-transaction-row span,
        .boki-transaction-row strong {
          padding: 12px 14px;
          line-height: 1.65;
        }

        .boki-transaction-row span {
          background: var(--color-bg-muted);
          color: var(--color-text);
          font-weight: 900;
          white-space: nowrap;
        }

        .boki-transaction-row strong {
          color: var(--color-text);
          font-weight: 700;
        }

        .boki-table-wrap {
          width: 100%;
          overflow-x: auto;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          max-width: 100%;
        }

        .boki-material table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          min-width: 100%;
        }

        .boki-material td {
          border: 1px solid var(--color-border);
          padding: 10px 12px;
          vertical-align: top;
          line-height: 1.65;
        }

        .boki-material tr:first-child td {
          background: var(--color-bg-muted);
          font-weight: 800;
          white-space: nowrap;
        }

        .boki-material-note {
          margin-top: 12px !important;
          padding-top: 12px;
          border-top: 1px solid var(--color-border);
          font-weight: 700;
        }

        .boki-question-text {
          color: var(--color-text);
          font-weight: 700;
          font-size: 1.02rem;
          line-height: 1.8;
          margin: 0 0 20px;
        }

        .boki-options {
          display: grid;
          gap: 10px;
        }

        .boki-options label {
          display: grid;
          grid-template-columns: auto 34px minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-bg);
          padding: 14px 16px;
          cursor: pointer;
          min-height: 62px;
        }

        .boki-options label > span:not(.boki-option-label) {
          white-space: pre-wrap;
          line-height: 1.65;
        }

        .boki-options label.selected {
          border-color: var(--color-primary);
          background: var(--color-primary-light);
        }

        .boki-options label.correct {
          border-color: var(--color-success);
          background: var(--color-success-bg);
        }

        .boki-options label.wrong {
          border-color: var(--color-error);
          background: var(--color-error-bg);
        }

        .boki-answer-sheet {
          border: 1px solid var(--color-border-strong);
          border-radius: var(--radius-sm);
          background: var(--color-bg);
          overflow: hidden;
          max-width: 100%;
        }

        .boki-answer-title {
          padding: 10px 14px;
          background: var(--color-bg-muted);
          border-bottom: 1px solid var(--color-border);
          font-weight: 900;
          color: var(--color-text);
        }

        .boki-journal-grid {
          display: grid;
          grid-template-columns: 96px minmax(180px, 1fr) minmax(150px, 0.55fr);
          overflow-x: auto;
          max-width: 100%;
        }

        .boki-journal-grid > div:not(.boki-journal-row) {
          padding: 10px 12px;
          background: var(--color-bg-subtle);
          border-bottom: 1px solid var(--color-border);
          font-size: 0.78rem;
          font-weight: 900;
          color: var(--color-text-secondary);
          white-space: nowrap;
        }

        .boki-journal-row {
          display: contents;
        }

        .boki-journal-row > strong,
        .boki-journal-row label {
          border-bottom: 1px solid var(--color-border);
          padding: 12px;
          min-width: 0;
        }

        .boki-journal-row > strong {
          color: var(--color-primary);
          background: var(--color-bg);
          font-size: 0.86rem;
        }

        .boki-journal-row label,
        .boki-blank-grid label {
          display: grid;
          gap: 6px;
        }

        .boki-journal-row label > span,
        .boki-blank-grid label > span {
          color: var(--color-text-muted);
          font-size: 0.72rem;
          font-weight: 800;
        }

        .boki-journal-row input,
        .boki-blank-grid input {
          width: 100%;
          min-height: 40px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 8px 10px;
          color: var(--color-text);
          background: var(--color-bg);
          font: inherit;
        }

        .boki-journal-row label.correct input,
        .boki-blank-grid label.correct input {
          border-color: var(--color-success);
          background: var(--color-success-bg);
        }

        .boki-journal-row label.wrong input,
        .boki-blank-grid label.wrong input {
          border-color: var(--color-error);
          background: var(--color-error-bg);
        }

        .boki-journal-row em,
        .boki-blank-grid em {
          color: var(--color-text-secondary);
          font-size: 0.76rem;
          font-style: normal;
          font-weight: 700;
        }

        .boki-blank-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          padding: 14px;
          max-width: 100%;
        }

        .boki-blank-grid label {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 12px;
          background: var(--color-bg);
        }

        .boki-blank-grid label > div {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 8px;
          align-items: center;
        }

        .boki-blank-grid strong {
          color: var(--color-text-secondary);
          font-size: 0.8rem;
        }

        .boki-option-label {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          color: var(--color-primary);
          background: var(--color-bg);
          border: 1px solid var(--color-border);
        }

        .boki-explanation {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 18px;
          padding: 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          background: var(--color-bg-subtle);
        }

        .boki-explanation div {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 0.86rem;
        }

        .boki-explanation p {
          grid-column: 1 / -1;
          margin: 4px 0 0;
          color: var(--color-text);
          line-height: 1.7;
          font-size: 0.9rem;
        }

        .boki-question-actions {
          margin-top: 22px;
        }

        .boki-question-actions button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .boki-timer {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border-radius: var(--radius-sm);
          background: var(--color-primary-light);
          color: var(--color-primary);
          border: 1px solid var(--color-primary-light);
        }

        .boki-timer.danger {
          background: var(--color-error-bg);
          color: var(--color-error);
        }

        .boki-timer strong {
          display: block;
          font-size: 1.15rem;
          line-height: 1.1;
          letter-spacing: 0;
        }

        .boki-weakness {
          padding: 18px;
          margin-top: 16px;
          max-width: 860px;
          margin-left: auto;
          margin-right: auto;
        }

        .boki-progress-track {
          height: 8px;
          border-radius: var(--radius-sm);
          background: var(--color-bg-muted);
          overflow: hidden;
        }

        .boki-progress-track div {
          height: 100%;
          background: var(--color-primary);
        }

        .boki-weakness div {
          grid-template-columns: 1fr auto;
        }

        .boki-empty {
          max-width: 720px;
          margin: 40px auto;
          padding: 36px 24px;
          text-align: center;
          color: var(--color-text-secondary);
        }

        .boki-empty h1 {
          color: var(--color-text);
          font-size: 1.35rem;
        }

        @media (max-width: 1050px) {
          .boki-hero,
          .boki-start,
          .boki-exam-grid {
            grid-template-columns: 1fr;
          }

          .boki-nav-panel {
            grid-template-columns: 1fr;
          }

          .boki-nav-strip {
            grid-template-columns: 1fr;
          }

          .boki-nav-panel,
          .boki-exam-topbar {
            position: static;
          }
        }

        @media (max-width: 640px) {
          .boki-hero,
          .boki-start,
          .boki-exam-topbar,
          .boki-exam-grid {
            padding-left: 16px;
            padding-right: 16px;
          }

          .boki-exam-topbar,
          .boki-progress-inline,
          .boki-explanation {
            grid-template-columns: 1fr;
          }

          .boki-exam-topbar {
            align-items: stretch;
          }

          .boki-question-panel,
          .boki-nav-panel,
          .boki-weakness {
            width: 100%;
          }

          .boki-options label {
            grid-template-columns: auto 30px minmax(0, 1fr);
          }

          .boki-blank-grid {
            grid-template-columns: 1fr;
          }

          .boki-journal-grid {
            grid-template-columns: 72px minmax(160px, 1fr) minmax(130px, 0.6fr);
          }

          .boki-transaction-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
