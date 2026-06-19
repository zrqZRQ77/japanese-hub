import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { getExamById } from '@/lib/types/exams-registry'
import { Bot } from 'lucide-react'

export default async function Page({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params
  const exam = getExamById(examId)
  if (!exam) notFound()
  return (
    <>
      <Navbar />
      <main style={{
        height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg-subtle)', gap: 16,
      }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 8,
          background: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Bot size={24} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>{exam.shortName} AI質問</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>このページは準備中です。</p>
      </main>
    </>
  )
}
