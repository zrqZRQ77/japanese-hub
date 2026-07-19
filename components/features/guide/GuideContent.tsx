// ============================================================
// 学習ガイド 右側コンテンツエリア
// 修改此文件 → 所有教材内容页面的布局/颜色同步更新
// ============================================================
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Bookmark } from 'lucide-react'
import { ChapterMeta, GuideFrontmatter } from '@/lib/types'
import { useProgress } from '@/lib/hooks/useProgress'
import { trackEvent } from '@/lib/analytics'
import AdSlot from '@/components/monetization/AdSlot'

interface Props {
  frontmatter: GuideFrontmatter
  contentHtml: string
  chapter: ChapterMeta
  sections: ChapterMeta['sections']
  currentSectionId: string
  examId: string
  examShortName: string
  prevLink?: { href: string; label: string }
  nextLink?: { href: string; label: string }
}

export default function GuideContent({
  frontmatter, contentHtml, chapter, currentSectionId, examId, examShortName, prevLink, nextLink
}: Props) {
  const base = `/exams/${examId}`
  const { loaded, progress, recordActivity, toggleBookmark } = useProgress(examId)
  const sectionId = `${chapter.id}#${currentSectionId}`
  const isBookmarked = progress?.bookmarkedSectionIds.includes(sectionId) ?? false

  useEffect(() => {
    if (!loaded) return
    recordActivity(
      'guide',
      chapter.id,
      `${base}/guide/${chapter.id}/${currentSectionId}`,
      `${frontmatter.sectionNumber} ${frontmatter.sectionTitle}`,
    )
  }, [base, chapter.id, currentSectionId, frontmatter.sectionNumber, frontmatter.sectionTitle, loaded, recordActivity])

  return (
    <article className="guide-content" style={{
      flex: 1, overflowY: 'auto',
      background: 'var(--color-bg-subtle)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      minWidth: 0,
    }}>
      {/* トップバー：ブックマーク・お気に入り・共有 */}
      <div className="guide-content-toolbar" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        maxWidth: 920,
        padding: '18px 40px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-subtle)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        {/* アクションボタン */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            aria-label={isBookmarked ? 'ブックマークを解除' : 'ブックマークする'}
            aria-pressed={isBookmarked}
            title={isBookmarked ? 'ブックマークを解除' : 'ブックマークする'}
            onClick={() => {
              toggleBookmark(sectionId)
              trackEvent('guide_bookmark_toggle', {
                exam_id: examId,
                chapter_id: chapter.id,
                section_id: currentSectionId,
                bookmarked: !isBookmarked,
              })
            }}
            style={{
              padding: '6px 10px',
              background: isBookmarked ? 'var(--color-primary-light)' : 'none',
              border: `1px solid ${isBookmarked ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              color: isBookmarked ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bookmark size={17} strokeWidth={2} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* 本文 */}
      <div className="guide-content-body" style={{
        flex: 1,
        width: '100%',
        maxWidth: 920,
        padding: '42px 40px 36px',
      }}>
        <div className="guide-content-inner" style={{
          maxWidth: 760,
          margin: '0 auto',
        }}>
        <nav aria-label="パンくずリスト" style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 18,
          color: 'var(--color-text-muted)',
          fontSize: '0.78rem',
          fontWeight: 650,
        }}>
          <Link href={`${base}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {examShortName}
          </Link>
          <span aria-hidden="true">›</span>
          <Link href={`${base}/guide`} style={{ color: 'inherit', textDecoration: 'none' }}>
            学習ガイド
          </Link>
          <span aria-hidden="true">›</span>
          <span>{frontmatter.sectionNumber} {frontmatter.sectionTitle}</span>
        </nav>

        {/* セクションタイトル */}
        <h1 style={{
          fontSize: '2rem', fontWeight: 900,
          marginBottom: 24, color: 'var(--color-text)',
          lineHeight: 1.3,
        }}>
          {frontmatter.sectionNumber} {frontmatter.sectionTitle}
        </h1>

        {/* MDXレンダリングエリア */}
        <div
          className="mdx-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
        </div>
      </div>

      {/* 練習問題へのリンク */}
      <div className="guide-practice-cta" style={{
        width: '100%',
        maxWidth: 920,
        margin: '0 auto',
        padding: '0 40px 28px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          padding: '20px 24px',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          boxShadow: 'var(--shadow-card)',
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
              この章の理解を確認しよう
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              練習問題で知識を定着させましょう
            </div>
          </div>
          <Link
            href={`${base}/questions/${chapter.id}`}
            onClick={() => trackEvent('guide_practice_click', {
              exam_id: examId,
              chapter_id: chapter.id,
              section_id: currentSectionId,
            })}
            style={{
            padding: '9px 20px',
            background: 'var(--color-primary)', color: 'var(--color-bg)',
            borderRadius: 'var(--radius-sm)', fontWeight: 700,
            fontSize: '0.875rem', textDecoration: 'none', whiteSpace: 'nowrap',
          }}>練習問題を解く →</Link>
        </div>
      </div>

      <div style={{
        width: '100%',
        maxWidth: 920,
        padding: '0 40px 28px',
        boxSizing: 'border-box',
      }}>
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_EXAM_SECONDARY} />
      </div>

      {/* 前へ / 次へ ナビゲーション */}
      <div className="guide-content-pagination" style={{
        display: 'flex', justifyContent: 'space-between',
        width: '100%',
        maxWidth: 920,
        padding: '20px 40px',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-subtle)',
        gap: 12, flexWrap: 'wrap',
      }}>
        {prevLink ? (
          <Link className="guide-pagination-prev" href={prevLink.href} style={{
            padding: '10px 20px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem', fontWeight: 600,
            color: 'var(--color-text)', textDecoration: 'none',
            background: 'var(--color-bg)',
          }}>← 前へ</Link>
        ) : <div />}

        {nextLink ? (
          <Link className="guide-pagination-next" href={nextLink.href} style={{
            padding: '10px 20px',
            background: 'var(--color-primary)', color: 'var(--color-bg)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem', fontWeight: 700,
            textDecoration: 'none',
          }}>次へ →</Link>
        ) : <div />}
      </div>
    </article>
  )
}
