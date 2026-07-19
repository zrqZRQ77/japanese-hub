// ============================================================
// 試験ダッシュボード — 進捗表示クライアントコンポーネント
// localStorageから進捗を読み込んで表示する
// ============================================================
'use client'
import { useState } from 'react'
import Link from 'next/link'
import ProgressRing from '@/components/features/dashboard/ProgressRing'
import StatCard from '@/components/features/dashboard/StatCard'
import { useProgress } from '@/lib/hooks/useProgress'
import { ChapterMeta } from '@/lib/types'
import { getChapterById } from '@/lib/types/chapters-registry'
import { AlertCircle, ArrowRight, BarChart3, Bookmark, X } from 'lucide-react'

interface Props {
  examId: string
  chapters: ChapterMeta[]
  totalChapters: number
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}分`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}時間${m}分` : `${h}時間`
}

export default function DashboardProgress({ examId, chapters, totalChapters }: Props) {
  const { progress, loaded, resetProgress, toggleBookmark } = useProgress(examId)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  if (!loaded) {
    return (
      <div style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '32px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flex: '1 1 320px', boxShadow: 'var(--shadow-card)',
        color: 'var(--color-text-muted)', fontSize: '0.9rem',
      }}>
        読み込み中...
      </div>
    )
  }

  const completed = progress?.completedChapters ?? []
  const percent = totalChapters > 0
    ? Math.round((completed.length / totalChapters) * 100)
    : 0

  // 前回の実際の学習行動を優先し、なければ完了状況から次の章を推定する。
  const currentChapterId = (() => {
    if (progress?.lastActivity?.chapterId) return progress.lastActivity.chapterId
    if (progress?.currentChapterId) return progress.currentChapterId
    if (completed.length < chapters.length) {
      return chapters[completed.length]?.id ?? chapters[0]?.id ?? 'ch1'
    }
    return chapters[chapters.length - 1]?.id ?? 'ch1'
  })()

  const currentChapter = chapters.find(c => c.id === currentChapterId)
    ?? chapters[0]

  const base = `/exams/${examId}`
  const continuePath = progress?.lastActivity?.path ?? `${base}/guide/${currentChapterId}`
  const continueLabel = progress?.lastActivity?.label ?? `第${currentChapter?.number}章 ${currentChapter?.title}`

  const chapterResults = chapters.flatMap(chapter => {
    const result = progress?.chapterProgress[chapter.id]
    if (!result || result.answeredQuestionIds.length === 0) return []
    const answered = result.answeredQuestionIds.length
    const correct = result.correctQuestionIds.length
    return [{
      chapter,
      answered,
      correct,
      accuracy: Math.round((correct / answered) * 100),
    }]
  }).sort((a, b) => a.accuracy - b.accuracy || b.answered - a.answered)

  const weakChapters = chapterResults.filter(result => result.accuracy < 80).slice(0, 4)
  const wrongQuestions = Object.values(progress?.questionProgress ?? {})
    .filter(result => !result.isCorrect)
    .sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))

  const bookmarkedSections = (progress?.bookmarkedSectionIds ?? []).flatMap(entry => {
    const [chapterId, sectionId] = entry.split('#')
    const chapter = getChapterById(examId, chapterId)
    const section = chapter?.sections.find(s => s.id === sectionId)
    if (!chapter || !section) return []
    return [{ chapter, section, entry }]
  })

  const chapterStatus = (chId: string): 'done' | 'active' | 'none' => {
    if (completed.includes(chId)) return 'done'
    if (chId === currentChapterId) return 'active'
    return 'none'
  }

  const STATUS_STYLE = {
    done: {
      bg: 'var(--color-success-bg)',
      border: 'var(--color-success-border)',
      label: '✓ 完了',
      labelColor: 'var(--color-success)',
    },
    active: {
      bg: 'var(--color-warning-bg)',
      border: 'var(--color-warning-border)',
      label: '学習中',
      labelColor: 'var(--color-warning)',
    },
    none: {
      bg: 'var(--color-bg)',
      border: 'var(--color-border)',
      label: '未学習',
      labelColor: 'var(--color-text-muted)',
    },
  }

  return (
    <>
      {/* 上段：進捗カード + 統計 */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>

        {/* 進捗リング＋現在の章 */}
        <div style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '24px 28px',
          display: 'flex', alignItems: 'center', gap: 24,
          flex: '1 1 320px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <ProgressRing percent={percent} size={100} stroke={9} />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '1.2rem',
              color: 'var(--color-primary)',
            }}>
              {percent}%
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '0.75rem', color: 'var(--color-text-muted)',
              fontWeight: 600, marginBottom: 4,
            }}>{progress?.lastActivity ? '前回の続き' : '学習中の章'}</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 2 }}>
              {continueLabel}
            </div>
            <div style={{
              fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 14,
            }}>完了 {completed.length}/{totalChapters}章</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Link href={continuePath} style={{
                display: 'inline-block',
                padding: '8px 18px',
                background: 'var(--color-primary)', color: 'var(--color-bg)',
                borderRadius: 'var(--radius-sm)', fontWeight: 700,
                fontSize: '0.875rem', textDecoration: 'none',
              }}>続きから学習する</Link>
              {completed.length > 0 && (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  style={{
                    background: 'none', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '7px 12px', cursor: 'pointer',
                    fontSize: '0.8rem', color: 'var(--color-text-muted)',
                  }}
                >
                  リセット
                </button>
              )}
            </div>
            {showResetConfirm && (
              <div style={{
                marginTop: 12, padding: '10px 14px',
                background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)',
                borderRadius: 'var(--radius-sm)', fontSize: '0.8rem',
              }}>
                <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--color-error)' }}>
                  進捗をリセットしますか？
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { resetProgress(); setShowResetConfirm(false) }}
                    style={{
                      background: 'var(--color-error)', color: 'var(--color-bg)',
                      border: 'none', borderRadius: 4,
                      padding: '4px 12px', cursor: 'pointer',
                      fontSize: '0.8rem', fontWeight: 700,
                    }}
                  >リセット</button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    style={{
                      background: 'none', border: '1px solid var(--color-border)',
                      borderRadius: 4, padding: '4px 12px', cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >キャンセル</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 統計4項目 */}
        <div style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 24px',
          flex: '1 1 240px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <StatCard label="学習時間" value={formatMinutes(progress?.studyMinutes ?? 0)} />
          <StatCard label="解いた問題数" value={`${progress?.questionsAnswered ?? 0}問`} />
          <StatCard label="正答率" value={progress?.questionsAnswered ? `${progress.correctRate}%` : '—'} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>連続学習日数</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-warning)' }}>
              🔥 {progress?.streakDays ?? 0}日
            </span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        margin: '30px 0 14px',
      }}>
        <BarChart3 size={19} color="var(--color-primary)" />
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>学習フィードバック</h2>
      </div>

      <div className="learning-feedback-grid">
        <section className="learning-feedback-panel" aria-labelledby="weak-chapters-heading">
          <div className="learning-feedback-panel__heading">
            <div>
              <h3 id="weak-chapters-heading">復習を優先したい章</h3>
              <p>正答率80%未満の章を表示しています</p>
            </div>
            <span>{weakChapters.length}章</span>
          </div>

          {weakChapters.length > 0 ? (
            <div className="weak-chapter-list">
              {weakChapters.map(({ chapter, answered, correct, accuracy }) => (
                <Link href={`${base}/questions/${chapter.id}`} key={chapter.id}>
                  <div className="weak-chapter-list__row">
                    <div>
                      <strong>第{chapter.number}章 {chapter.title}</strong>
                      <span>{correct}/{answered}問正解</span>
                    </div>
                    <b className={accuracy < 60 ? 'is-low' : ''}>{accuracy}%</b>
                  </div>
                  <div className="weak-chapter-list__bar">
                    <span style={{ width: `${accuracy}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="learning-feedback-empty">
              <BarChart3 size={22} />
              <div>
                <strong>{chapterResults.length ? '現在、正答率80%未満の章はありません' : '問題を解くと分析が始まります'}</strong>
                <span>章ごとの正答率から復習順を自動で整理します。</span>
              </div>
            </div>
          )}
        </section>

        <section className="learning-feedback-panel" aria-labelledby="wrong-questions-heading">
          <div className="learning-feedback-panel__heading">
            <div>
              <h3 id="wrong-questions-heading">未解決の間違い</h3>
              <p>正解するとこの一覧から外れます</p>
            </div>
            <span>{wrongQuestions.length}問</span>
          </div>

          {wrongQuestions.length > 0 ? (
            <div className="wrong-question-list">
              {wrongQuestions.map(result => {
                const chapter = chapters.find(item => item.id === result.chapterId)
                return (
                  <Link
                    href={`${base}/questions/${result.chapterId}?question=${result.questionId}`}
                    key={result.questionId}
                  >
                    <AlertCircle size={17} />
                    <div>
                      <span>第{chapter?.number ?? '-'}章 {chapter?.title ?? ''}</span>
                      <strong>{result.questionText}</strong>
                    </div>
                    <ArrowRight size={16} />
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="learning-feedback-empty">
              <AlertCircle size={22} />
              <div>
                <strong>未解決の間違いはありません</strong>
                <span>間違えた問題はここからすぐに解き直せます。</span>
              </div>
            </div>
          )}
        </section>

        <section className="learning-feedback-panel" aria-labelledby="bookmarked-sections-heading">
          <div className="learning-feedback-panel__heading">
            <div>
              <h3 id="bookmarked-sections-heading">ブックマーク済みセクション</h3>
              <p>学習ガイドで保存したセクションです</p>
            </div>
            <span>{bookmarkedSections.length}件</span>
          </div>

          {bookmarkedSections.length > 0 ? (
            <div className="wrong-question-list">
              {bookmarkedSections.map(({ chapter, section, entry }) => (
                <div key={entry} style={{
                  minWidth: 0,
                  padding: '10px 11px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 7,
                  background: 'var(--color-bg)',
                  display: 'grid',
                  gridTemplateColumns: 'auto minmax(0, 1fr) auto auto',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <Bookmark size={17} style={{ color: 'var(--color-primary)' }} />
                  <Link
                    href={`${base}/guide/${chapter.id}/${section.id}`}
                    style={{ minWidth: 0, display: 'grid', gap: 2, textDecoration: 'none', color: 'inherit' }}
                  >
                    <span>第{chapter.number}章 {chapter.title}</span>
                    <strong>{section.number} {section.title}</strong>
                  </Link>
                  <Link
                    href={`${base}/guide/${chapter.id}/${section.id}`}
                    aria-label="このセクションを開く"
                    style={{ color: 'var(--color-text-muted)', display: 'flex' }}
                  >
                    <ArrowRight size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(entry)}
                    aria-label="ブックマークを解除"
                    title="ブックマークを解除"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 26, height: 26,
                      border: 'none', borderLeft: '1px solid var(--color-border)',
                      paddingLeft: 12, marginLeft: 2,
                      background: 'transparent',
                      color: 'var(--color-text-muted)', cursor: 'pointer',
                      borderRadius: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-error)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)' }}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="learning-feedback-empty">
              <Bookmark size={22} />
              <div>
                <strong>ブックマークしたセクションはありません</strong>
                <span>学習ガイドのブックマークボタンから後で見直したいセクションを保存できます。</span>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 章一覧 */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginTop: 30, marginBottom: 14,
      }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>章一覧（学習ガイド）</h2>
        <Link href={`${base}/guide`} style={{
          fontSize: '0.85rem', color: 'var(--color-primary)',
          fontWeight: 600, textDecoration: 'none',
        }}>すべて見る →</Link>
      </div>

      <div style={{
        display: 'flex', gap: 12, overflowX: 'auto',
        paddingBottom: 8,
      }}>
        {chapters.map(ch => {
          const status = chapterStatus(ch.id)
          const s = STATUS_STYLE[status]
          return (
            <Link key={ch.id} href={`${base}/guide/${ch.id}/${ch.sections[0]?.id ?? ''}`}
              style={{ textDecoration: 'none', flexShrink: 0 }}
            >
              <div style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                minWidth: 140,
                cursor: 'pointer',
              }}>
                <div style={{
                  fontSize: '0.72rem', color: 'var(--color-text-muted)',
                  marginBottom: 4,
                }}>第{ch.number}章</div>
                <div style={{
                  fontWeight: 700, fontSize: '0.875rem',
                  color: 'var(--color-text)', marginBottom: 8,
                }}>{ch.title}</div>
                <div style={{
                  fontSize: '0.75rem', fontWeight: 700,
                  color: s.labelColor,
                }}>{s.label}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
