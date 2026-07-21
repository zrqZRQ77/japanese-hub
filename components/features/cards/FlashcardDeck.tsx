'use client'

import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Layers, RotateCcw, Shuffle } from 'lucide-react'
import type { CardLearningStatus, ChapterMeta, KnowledgeCard } from '@/lib/types'
import { useProgress } from '@/lib/hooks/useProgress'
import { trackEvent } from '@/lib/analytics'
import AdSlot from '@/components/monetization/AdSlot'

interface CardGroup {
  chapter: ChapterMeta
  cards: KnowledgeCard[]
}

interface Props {
  examId: string
  examShortName: string
  groups: CardGroup[]
  initialChapterId?: string
  initialCardId?: string
}

type ReviewMode = 'all' | 'learning' | 'mistakes' | 'random'

function shuffled<T>(items: T[]): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[target]] = [result[target], result[index]]
  }
  return result
}

export default function FlashcardDeck({
  examId,
  examShortName,
  groups,
  initialChapterId,
  initialCardId,
}: Props) {
  const initialGroup = groups.find(group => group.chapter.id === initialChapterId) ?? groups[0]
  const initialIndex = Math.max(0, initialGroup?.cards.findIndex(card => card.id === initialCardId) ?? 0)
  const [activeChapterId, setActiveChapterId] = useState(initialGroup?.chapter.id ?? '')
  const [activeCardIndex, setActiveCardIndex] = useState(initialIndex)
  const [flipped, setFlipped] = useState(false)
  const [reviewMode, setReviewMode] = useState<ReviewMode>('all')
  const [randomCardIds, setRandomCardIds] = useState<string[]>([])
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const { progress, recordActivity, setCardStatus } = useProgress(examId)

  const activeGroup = useMemo(
    () => groups.find(group => group.chapter.id === activeChapterId) ?? groups[0],
    [activeChapterId, groups],
  )
  const cards = useMemo(() => activeGroup?.cards ?? [], [activeGroup])
  const cardProgress = useMemo(() => progress?.cardProgress ?? {}, [progress?.cardProgress])
  const masteredCardIds = useMemo(
    () => new Set(progress?.rememberedCardIds ?? []),
    [progress?.rememberedCardIds],
  )
  const learningCardIds = useMemo(
    () => new Set(
      Object.values(cardProgress)
        .filter(item => item.status === 'learning')
        .map(item => item.cardId),
    ),
    [cardProgress],
  )
  const mistakeTags = useMemo(
    () => new Set(
      Object.values(progress?.questionProgress ?? {})
        .filter(result => !result.isCorrect)
        .flatMap(result => result.tags.length ? result.tags : [result.chapterId]),
    ),
    [progress?.questionProgress],
  )
  const learningCards = useMemo(
    () => cards.filter(card => learningCardIds.has(card.id)),
    [cards, learningCardIds],
  )
  const mistakeCards = useMemo(
    () => cards.filter(card => card.tags?.some(tag => mistakeTags.has(tag))),
    [cards, mistakeTags],
  )
  const randomCards = useMemo(() => {
    const idSet = new Set(randomCardIds)
    return randomCardIds
      .map(id => cards.find(card => card.id === id))
      .filter((card): card is KnowledgeCard => Boolean(card && idSet.has(card.id)))
  }, [cards, randomCardIds])
  const visibleCards = useMemo(() => {
    if (reviewMode === 'learning') return learningCards
    if (reviewMode === 'mistakes') return mistakeCards
    if (reviewMode === 'random') return randomCards
    return cards
  }, [cards, learningCards, mistakeCards, randomCards, reviewMode])
  const safeActiveCardIndex = visibleCards.length
    ? Math.min(activeCardIndex, visibleCards.length - 1)
    : 0
  const activeCard = visibleCards[safeActiveCardIndex]

  const allCards = useMemo(() => groups.flatMap(group => group.cards), [groups])
  const totalCards = allCards.length
  const masteredCount = allCards.filter(card => masteredCardIds.has(card.id)).length
  const learningCount = allCards.filter(card => learningCardIds.has(card.id)).length
  const chapterMasteredCount = cards.filter(card => masteredCardIds.has(card.id)).length
  const chapterLearningCount = cards.filter(card => learningCardIds.has(card.id)).length
  const visibleMasteredCount = visibleCards.filter(card => masteredCardIds.has(card.id)).length

  function recordCardActivity(card: KnowledgeCard) {
    if (!activeGroup) return
    recordActivity(
      'cards',
      activeGroup.chapter.id,
      `/exams/${examId}/cards?chapter=${activeGroup.chapter.id}&card=${card.id}`,
      `${activeGroup.chapter.title}の知識カード`,
    )
  }

  function selectChapter(chapterId: string) {
    setActiveChapterId(chapterId)
    setActiveCardIndex(0)
    setFlipped(false)
    setReviewMode('all')
    setRandomCardIds([])
    setShowResetConfirm(false)
    const group = groups.find(item => item.chapter.id === chapterId)
    const firstCard = group?.cards[0]
    if (firstCard) {
      recordActivity(
        'cards',
        chapterId,
        `/exams/${examId}/cards?chapter=${chapterId}&card=${firstCard.id}`,
        `${group.chapter.title}の知識カード`,
      )
    }
  }

  function moveCard(direction: 1 | -1) {
    if (!visibleCards.length) return
    const candidate = safeActiveCardIndex + direction
    const nextIndex = candidate < 0
      ? visibleCards.length - 1
      : candidate >= visibleCards.length ? 0 : candidate
    setActiveCardIndex(nextIndex)
    setFlipped(false)
    const nextCard = visibleCards[nextIndex]
    if (nextCard) recordCardActivity(nextCard)
  }

  function markCard(status: CardLearningStatus) {
    if (!activeCard || !activeGroup || !flipped) return
    const previousStatus = cardProgress[activeCard.id]?.status
    setCardStatus(activeCard.id, status, activeGroup.chapter.id, activeGroup.chapter.title)
    trackEvent('flashcard_status_change', {
      exam_id: examId,
      chapter_id: activeGroup.chapter.id,
      card_id: activeCard.id,
      status,
      previous_status: previousStatus ?? 'unseen',
    })
    if (status === 'mastered' && !masteredCardIds.has(activeCard.id) && chapterMasteredCount + 1 >= cards.length) {
      trackEvent('flashcard_chapter_complete', {
        exam_id: examId,
        chapter_id: activeGroup.chapter.id,
        card_count: cards.length,
      })
    }

    if (reviewMode === 'learning' && status === 'mastered') {
      const remainingCount = Math.max(0, visibleCards.length - 1)
      setActiveCardIndex(index => Math.min(index, Math.max(0, remainingCount - 1)))
      setFlipped(false)
      return
    }
    moveCard(1)
  }

  function resetChapter() {
    if (!activeGroup) return
    setShowResetConfirm(false)
    activeGroup.cards.forEach(card => {
      if (cardProgress[card.id]) {
        setCardStatus(card.id, null, activeGroup.chapter.id, activeGroup.chapter.title)
      }
    })
    setActiveCardIndex(0)
    setFlipped(false)
    setReviewMode('all')
    setRandomCardIds([])
  }

  function switchReviewMode(mode: Exclude<ReviewMode, 'random'>) {
    setReviewMode(mode)
    setActiveCardIndex(0)
    setFlipped(false)
    setShowResetConfirm(false)
  }

  function startRandomReview() {
    const notMastered = cards.filter(card => !masteredCardIds.has(card.id))
    const mastered = cards.filter(card => masteredCardIds.has(card.id))
    const selected = [...shuffled(notMastered), ...shuffled(mastered)]
      .slice(0, Math.min(10, cards.length))
      .map(card => card.id)
    setRandomCardIds(selected)
    setReviewMode('random')
    setActiveCardIndex(0)
    setFlipped(false)
    setShowResetConfirm(false)
    const first = cards.find(card => card.id === selected[0])
    if (first) recordCardActivity(first)
    trackEvent('flashcard_random_session_start', {
      exam_id: examId,
      chapter_id: activeGroup?.chapter.id,
      card_count: selected.length,
    })
  }

  function emptyMessage() {
    if (reviewMode === 'learning') return 'この章で「まだ不安」にしたカードはありません。'
    if (reviewMode === 'mistakes') return 'この章には、未解決の間違いと関連するカードはまだありません。'
    if (reviewMode === 'random') return 'ランダム復習を開始できませんでした。'
    return '表示できるカードがありません。'
  }

  if (!activeGroup || !cards.length) {
    return (
      <div style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 24px',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
      }}>
        この試験の知識カードはまだありません。
      </div>
    )
  }

  return (
    <div className="flashcard-page">
      <section className="flashcard-shell">
        <div className="flashcard-toolbar">
          <div>
            <div className="flashcard-eyebrow">
              <Layers size={14} />
              知識カード
            </div>
            <h1>{examShortName} の復習カード</h1>
          </div>

          <div className="flashcard-select-wrap">
            <label htmlFor="flashcard-chapter">章を選択</label>
            <select
              id="flashcard-chapter"
              value={activeGroup.chapter.id}
              onChange={event => selectChapter(event.target.value)}
              className="flashcard-chapter-select"
            >
              {groups.map(group => {
                const mastered = group.cards.filter(card => masteredCardIds.has(card.id)).length
                const learning = group.cards.filter(card => learningCardIds.has(card.id)).length
                return (
                  <option key={group.chapter.id} value={group.chapter.id}>
                    第{group.chapter.number}章 {group.chapter.title}（掌握{mastered}・不安{learning}）
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        <div className="flashcard-meta-row">
          <Metric label="総カード数" value={`${totalCards}枚`} />
          <Metric label="覚えた" value={`${masteredCount}枚`} />
          <Metric label="まだ不安" value={`${learningCount}枚`} />
          <Metric label="間違い関連" value={`${mistakeCards.length}枚`} />
        </div>

        <div className="flashcard-chapter-heading">
          <div>
            <span>第{activeGroup.chapter.number}章</span>
            <h2>{activeGroup.chapter.title}</h2>
            <p className="flashcard-chapter-status">覚えた {chapterMasteredCount}枚・まだ不安 {chapterLearningCount}枚</p>
          </div>
          <div className="flashcard-reset-wrap">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flashcard-reset-button"
            >
              <RotateCcw size={15} />
              この章をリセット
            </button>
            {showResetConfirm && (
              <div className="flashcard-reset-confirm">
                <strong>この章のカード進捗をリセットしますか？</strong>
                <span>「覚えた」「まだ不安」の判定が未判定に戻ります。教材や問題の進捗は消えません。</span>
                <div>
                  <button type="button" onClick={resetChapter}>リセット</button>
                  <button type="button" onClick={() => setShowResetConfirm(false)}>キャンセル</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flashcard-mode-tabs" aria-label="カード表示モード">
          <button
            type="button"
            className={reviewMode === 'all' ? 'is-active' : ''}
            onClick={() => switchReviewMode('all')}
          >
            すべて
          </button>
          <button
            type="button"
            className={reviewMode === 'learning' ? 'is-active' : ''}
            disabled={learningCards.length === 0}
            onClick={() => switchReviewMode('learning')}
          >
            まだ不安 {learningCards.length}
          </button>
          <button
            type="button"
            className={reviewMode === 'mistakes' ? 'is-active' : ''}
            disabled={mistakeCards.length === 0}
            onClick={() => switchReviewMode('mistakes')}
          >
            間違い関連 {mistakeCards.length}
          </button>
          <button
            type="button"
            className={reviewMode === 'random' ? 'is-active' : ''}
            onClick={startRandomReview}
          >
            <Shuffle size={14} />
            ランダム10
          </button>
        </div>

        {!visibleCards.length || !activeCard ? (
          <div className="flashcard-empty-filter">{emptyMessage()}</div>
        ) : (
          <>
            <div className="flashcard-stage">
              <button
                onClick={() => setFlipped(value => !value)}
                className={`flashcard ${flipped ? 'is-flipped' : ''}`}
                aria-label={flipped ? '問題面に戻る' : '答えを見る'}
              >
                <div className="flashcard-face flashcard-front">
                  <CardHeader
                    label="QUESTION"
                    current={safeActiveCardIndex + 1}
                    total={visibleCards.length}
                    status={cardProgress[activeCard.id]?.status}
                  />
                  <div className="flashcard-type-badge">{activeCard.cardType ?? '記憶'}</div>
                  <div className="flashcard-main-text">{activeCard.front}</div>
                  <div className="flashcard-hint">答えを思い出してからクリック</div>
                </div>
                <div className="flashcard-face flashcard-back">
                  <CardHeader
                    label="ANSWER"
                    current={safeActiveCardIndex + 1}
                    total={visibleCards.length}
                    status={cardProgress[activeCard.id]?.status}
                  />
                  <div className="flashcard-type-badge">{activeCard.cardType ?? '記憶'}</div>
                  <div className="flashcard-answer">{activeCard.back}</div>
                  <div className="flashcard-tags">
                    {activeCard.tags?.map(tag => <span key={tag}>{tag}</span>)}
                  </div>
                </div>
              </button>
            </div>

            <div className="flashcard-learning-links" aria-label="関連学習リンク">
              {activeCard.guideLink && <Link href={activeCard.guideLink.href}>教材：{activeCard.guideLink.label}</Link>}
              {activeCard.questionLink && <Link href={activeCard.questionLink.href}>{activeCard.questionLink.label}</Link>}
              {activeCard.relatedChapterLink && <Link href={activeCard.relatedChapterLink.href}>関連：{activeCard.relatedChapterLink.label}</Link>}
            </div>

            <p className="flashcard-rating-hint">
              {flipped ? '答えを確認して、現在の理解度を選んでください。' : '理解度の判定は答えを見た後に選べます。'}
            </p>
            <div className="flashcard-actions">
              <button onClick={() => moveCard(-1)} style={navButtonStyle}>前のカード</button>
              <button
                type="button"
                onClick={() => markCard('learning')}
                disabled={!flipped}
                className={`flashcard-status-button is-learning ${cardProgress[activeCard.id]?.status === 'learning' ? 'is-selected' : ''}`}
              >
                <AlertCircle size={16} />
                まだ不安
              </button>
              <button
                type="button"
                onClick={() => markCard('mastered')}
                disabled={!flipped}
                className={`flashcard-status-button is-mastered ${cardProgress[activeCard.id]?.status === 'mastered' ? 'is-selected' : ''}`}
              >
                <CheckCircle2 size={16} />
                覚えた
              </button>
              <button onClick={() => moveCard(1)} style={navButtonStyle}>次のカード</button>
            </div>

            <div className="flashcard-progress">
              <div>
                <span style={{
                  width: `${visibleCards.length ? (visibleMasteredCount / visibleCards.length) * 100 : 0}%`,
                }} />
              </div>
              <p>{reviewMode === 'all' ? 'この章' : '表示中'}の掌握度 {visibleMasteredCount}/{visibleCards.length}枚</p>
            </div>
          </>
        )}
      </section>
      <div style={{ marginTop: 48 }}>
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_EXAM_SECONDARY} />
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span style={{
      fontSize: '0.75rem',
      fontWeight: 800,
      color: 'var(--color-text-muted)',
      background: 'var(--color-bg-muted)',
      border: '1px solid var(--color-border)',
      padding: '4px 10px',
      borderRadius: 'var(--radius-sm)',
    }}>
      {label} {value}
    </span>
  )
}

function CardHeader({
  label, current, total, status,
}: {
  label: string
  current: number
  total: number
  status?: CardLearningStatus
}) {
  return (
    <div className="flashcard-header">
      <span>{label}</span>
      <span>{status === 'mastered' ? '覚えた' : status === 'learning' ? 'まだ不安' : `${current} / ${total}`}</span>
    </div>
  )
}

const navButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  minWidth: 118,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px 14px',
  fontSize: '0.86rem',
  fontWeight: 800,
  cursor: 'pointer',
  boxShadow: 'var(--shadow-card)',
}
