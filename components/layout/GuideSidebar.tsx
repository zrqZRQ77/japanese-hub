'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import { ChapterMeta } from '@/lib/types'
import { getExamById } from '@/lib/types/exams-registry'

interface Props {
  examId: string
  chapters: ChapterMeta[]
  currentChapterId: string
  currentSectionId?: string
  progress?: number
}

export default function GuideSidebar({ examId, chapters, currentChapterId, currentSectionId }: Props) {
  const [expanded, setExpanded] = useState<string>(currentChapterId)
  const router = useRouter()
  const base = `/exams/${examId}/guide`
  const exam = getExamById(examId)

  const currentChapter = chapters.find(chapter => chapter.id === currentChapterId)

  return (
    <>
    <div className="guide-mobile-nav">
      <Link href={`/exams/${examId}`} aria-label="ダッシュボードに戻る">←</Link>
      <label>
        <span>章</span>
        <select
          value={currentChapterId}
          onChange={event => {
            if (event.target.value) router.push(`${base}/${event.target.value}`)
          }}
        >
          <option value="">章を選択</option>
          {chapters.map(chapter => (
            <option value={chapter.id} key={chapter.id}>
              第{chapter.number}章 {chapter.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>節</span>
        <select
          value={currentSectionId ?? ''}
          disabled={!currentChapter}
          onChange={event => {
            if (currentChapter && event.target.value) {
              router.push(`${base}/${currentChapter.id}?section=${event.target.value}`)
            }
          }}
        >
          <option value="">節を選択</option>
          {currentChapter?.sections.map(section => (
            <option value={section.id} key={section.id}>
              {section.number} {section.title}
            </option>
          ))}
        </select>
      </label>
    </div>
    <aside className="guide-sidebar" style={{
      width: 'var(--guide-sidebar-width)',
      minWidth: 'var(--guide-sidebar-width)',
      borderRight: '1px solid var(--color-border)',
      background: 'var(--color-bg)',
      height: '100%',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 24,
    }}>
      <div style={{
        padding: '28px 28px 24px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <Link href={`/exams/${examId}`} style={{
          fontSize: '0.78rem', color: 'var(--color-text-muted)',
          textDecoration: 'none', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 4,
          marginBottom: 22,
        }}>← ダッシュボード</Link>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-brand)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}><BookOpen size={24} strokeWidth={2.2} /></div>
          <div>
            <div style={{
              fontWeight: 900,
              fontSize: '1.05rem',
              color: 'var(--color-text)',
              lineHeight: 1.35,
            }}>{exam?.shortName ?? '学習ガイド'}</div>
            <div style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.82rem',
              marginTop: 4,
              fontWeight: 600,
            }}>学習ガイド</div>
          </div>
        </div>
      </div>

      <nav style={{ padding: '18px 0 8px', flex: 1 }}>
        {chapters.map(ch => {
          const isCurrentChapter = ch.id === currentChapterId
          const isExpanded = expanded === ch.id
          return (
            <div key={ch.id} style={{ marginBottom: 2 }}>
              <button
                onClick={() => setExpanded(isExpanded ? '' : ch.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  display: 'grid',
                  gridTemplateColumns: '28px 1fr 16px',
                  alignItems: 'start',
                  gap: 12,
                  padding: '14px 28px',
                  background: 'transparent',
                  border: 'none', cursor: 'pointer',
                  fontWeight: isCurrentChapter ? 800 : 700,
                  fontSize: '0.92rem',
                  color: 'var(--color-text)',
                  lineHeight: 1.4,
                }}
              >
                <span style={{
                  width: 24,
                  height: 24,
                  borderRadius: 'var(--radius-sm)',
                  background: isCurrentChapter ? 'var(--color-primary)' : '#fef3c7',
                  color: isCurrentChapter ? 'var(--color-bg)' : 'var(--color-warning)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  marginTop: 1,
                }}>{ch.number}</span>
                <span>第{ch.number}章 {ch.title}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s', marginTop: 5 }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {isExpanded && (
                <div style={{ marginBottom: 10 }}>
                  {ch.sections.map(sec => {
                    const isActiveSection = sec.id === currentSectionId
                    return (
                      <Link key={sec.id}
                        href={`${base}/${ch.id}?section=${sec.id}`}
                        style={{
                          display: 'block',
                          padding: '10px 28px 10px 68px',
                          fontSize: '0.88rem',
                          color: isActiveSection ? 'var(--color-text)' : 'var(--color-text-secondary)',
                          textDecoration: 'none',
                          borderLeft: `3px solid ${isActiveSection ? 'var(--color-primary)' : 'transparent'}`,
                          background: isActiveSection ? 'var(--color-bg-subtle)' : 'transparent',
                          fontWeight: isActiveSection ? 700 : 500,
                          lineHeight: 1.45,
                        }}
                      >{sec.number} {sec.title}</Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
    </>
  )
}
