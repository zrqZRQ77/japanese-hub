// ============================================================
// 学習ガイド 右側コンテンツエリア
// 修改此文件 → 所有教材内容页面的布局/颜色同步更新
// ============================================================
'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bookmark, Star, Trash2 } from 'lucide-react'
import { ChapterMeta, GuideFrontmatter } from '@/lib/types'
import { useProgress } from '@/lib/hooks/useProgress'
import { trackEvent } from '@/lib/analytics'

interface Props {
  frontmatter: GuideFrontmatter
  contentHtml: string
  chapter: ChapterMeta
  sections: ChapterMeta['sections']
  currentSectionId: string
  examId: string
  prevLink?: { href: string; label: string }
  nextLink?: { href: string; label: string }
}

export default function GuideContent({
  frontmatter, contentHtml, chapter, currentSectionId, examId, prevLink, nextLink
}: Props) {
  const articleRef = useRef<HTMLElement>(null)
  const base = `/exams/${examId}`
  const { loaded, recordActivity } = useProgress(examId)
  const actions = [
    { label: 'ブックマーク', icon: Bookmark },
    { label: 'お気に入り', icon: Star },
    { label: '削除', icon: Trash2 },
  ]

  useEffect(() => {
    articleRef.current?.scrollTo({ top: 0, left: 0 })
    if (!loaded) return
    recordActivity(
      'guide',
      chapter.id,
      `${base}/guide/${chapter.id}?section=${currentSectionId}`,
      `${frontmatter.sectionNumber} ${frontmatter.sectionTitle}`,
    )
  }, [base, chapter.id, currentSectionId, frontmatter.sectionNumber, frontmatter.sectionTitle, loaded, recordActivity])

  return (
    <article ref={articleRef} className="guide-content" style={{
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
          {actions.map(action => {
            const Icon = action.icon
            return (
            <button key={action.label} aria-label={action.label} title={action.label} style={{
              padding: '6px 10px', background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}><Icon size={17} strokeWidth={2} /></button>
            )
          })}
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

        {/* 練習問題へのリンク */}
        <div className="guide-practice-cta" style={{
          marginTop: 40, padding: '20px 24px',
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
            background: 'var(--color-primary)', color: '#fff',
            borderRadius: 'var(--radius-sm)', fontWeight: 700,
            fontSize: '0.875rem', textDecoration: 'none', whiteSpace: 'nowrap',
          }}>練習問題を解く →</Link>
        </div>
        </div>
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
            background: '#fff',
          }}>← {prevLink.label}</Link>
        ) : <div />}

        <Link className="guide-pagination-index" href={`${base}/guide`} style={{
          padding: '10px 20px',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.875rem', fontWeight: 600,
          color: 'var(--color-text-secondary)', textDecoration: 'none',
          background: '#fff',
        }}>章のトップに戻る</Link>

        {nextLink ? (
          <Link className="guide-pagination-next" href={nextLink.href} style={{
            padding: '10px 20px',
            background: 'var(--color-primary)', color: '#fff',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem', fontWeight: 700,
            textDecoration: 'none',
          }}>次の項目 → {nextLink.label}</Link>
        ) : <div />}
      </div>
    </article>
  )
}
