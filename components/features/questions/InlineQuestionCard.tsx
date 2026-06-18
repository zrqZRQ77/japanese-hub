'use client'
import { useState } from 'react'
import QuestionClient from './QuestionClient'
import { QuestionSet } from '@/lib/types'

interface Props {
  questionSet?: QuestionSet | null
  chapterTitle: string
  examId: string
  chapterId: string
}

export default function InlineQuestionCard({ questionSet, chapterTitle, examId, chapterId }: Props) {
  const [open, setOpen] = useState(false)

  const questions = questionSet?.questions ?? []

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <button onClick={() => setOpen(true)} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%)',
          color: '#fff',
          padding: '10px 16px',
          borderRadius: 999,
          border: 'none',
          fontWeight: 700,
          boxShadow: '0 10px 24px rgba(37,99,235,0.18)',
          cursor: 'pointer',
        }}>
          <span>開始する</span>
          <span style={{ fontSize: '0.78rem', opacity: 0.8 }}>{questions.length}問</span>
        </button>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>章ごとの練習へ</div>
      </div>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.62)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: 'min(98vw, 1500px)', height: 'min(94vh, 1100px)', background: '#fff', borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 80px rgba(15,23,42,0.35)', border: '1px solid rgba(255,255,255,0.18)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(180deg, #fff 0%, #f8fafc 100%)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 4 }}>練習問題</div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{chapterTitle}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: 999, fontSize: '0.9rem', cursor: 'pointer', fontWeight: 700 }}>閉じる</button>
              </div>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              <QuestionClient
                questions={questions}
                chapterTitle={chapterTitle}
                examId={examId}
                chapterId={chapterId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
