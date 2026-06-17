'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChapterMeta } from '@/lib/types'

interface Props {
  examId: string
  chapters: ChapterMeta[]
  currentChapterId: string
  currentSectionId?: string
  progress?: number
}

export default function GuideSidebar({ examId, chapters, currentChapterId, currentSectionId }: Props) {
  const [expanded, setExpanded] = useState<string>(currentChapterId)
  const base = `/exams/${examId}/guide`

  return (
    <aside style={{
      width: 'var(--guide-sidebar-width)',
      minWidth: 'var(--guide-sidebar-width)',
      borderRight: '1px solid var(--color-border)',
      background: '#fff',
      height: '100%',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 16,
    }}>
      <div style={{ padding: '20px 18px 0' }}>
        <Link href={`/exams/${examId}`} style={{
          fontSize: '0.75rem', color: 'var(--color-text-muted)',
          textDecoration: 'none', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 4,
          marginBottom: 10,
        }}>← ダッシュボード</Link>
        <div style={{
          fontWeight: 800, fontSize: '0.9rem',
          marginBottom: 14, color: 'var(--color-text)',
          lineHeight: 1.4,
        }}>学習ガイド</div>
      </div>

      <nav style={{ padding: '0 10px 8px', flex: 1 }}>
        {chapters.map(ch => {
          const isCurrentChapter = ch.id === currentChapterId
          const isExpanded = expanded === ch.id
          return (
            <div key={ch.id} style={{ marginBottom: 1 }}>
                  <button
                onClick={() => setExpanded(isExpanded ? '' : ch.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  display: 'flex', alignItems: 'flex-start',
                  justifyContent: 'space-between', gap: 6,
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: isCurrentChapter ? 'var(--color-primary-light)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  fontWeight: isCurrentChapter ? 700 : 500,
                  fontSize: '0.82rem',
                  color: isCurrentChapter ? 'var(--color-primary)' : 'var(--color-text)',
                  lineHeight: 1.4,
                }}
              >
                <span style={{ flex: 1 }}>第{ch.number}章 {ch.title}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0, marginTop: 2 }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {isExpanded && (
                <div style={{ paddingLeft: 6, marginBottom: 6 }}>
                  {ch.sections.map(sec => {
                    const isActiveSection = sec.id === currentSectionId
                    return (
                      <Link key={sec.id}
                        href={`${base}/${ch.id}?section=${sec.id}`}
                        style={{
                          display: 'block', padding: '7px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem',
                          color: isActiveSection ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                          textDecoration: 'none',
                          borderLeft: `2px solid ${isActiveSection ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          marginLeft: 8, marginBottom: 1,
                          background: isActiveSection ? 'var(--color-primary-light)' : 'transparent',
                          fontWeight: isActiveSection ? 600 : 400,
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
  )
}
