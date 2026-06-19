import Navbar from '@/components/layout/Navbar'
import { Bot } from 'lucide-react'

export default function AiChatPage() {
  return (
    <>
      <Navbar />
      <main style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--color-bg-subtle)',
      }}>
        <div style={{
          width: 'min(100%, 640px)',
          background: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '36px 32px',
          textAlign: 'center',
        }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 8,
            margin: '0 auto 16px',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Bot size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8 }}>AI質問</h1>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
            このページは準備中です。各試験ページから学習ガイドと練習問題を利用できます。
          </p>
        </div>
      </main>
    </>
  )
}
