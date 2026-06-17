// ============================================================
// 試験一覧ページ  /exams
// 「試験を選ぶ」ボタンからここに遷移
// ============================================================
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import HoverCard from '@/components/ui/HoverCard'
import { EXAMS_REGISTRY } from '@/lib/types/exams-registry'
import { getAvailableExams } from '@/lib/content/exams-loader'

const COMING_SOON = [
  { name: '社会保険労務士', category: '労務', desc: '労働・社会保険の専門家。' },
]

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  '会計・経理': { bg: '#eff6ff', text: '#1d4ed8' },
  'ファイナンシャル': { bg: '#f0fdf4', text: '#15803d' },
  '不動産': { bg: '#fff7ed', text: '#c2410c' },
  '法律': { bg: '#faf5ff', text: '#7e22ce' },
  'IT': { bg: '#ecfdf5', text: '#065f46' },
  '労務': { bg: '#fef2f2', text: '#991b1b' },
}

export default function ExamsPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--color-bg-subtle)', minHeight: 'calc(100vh - 64px)' }}>
        {/* ヘッダー */}
        <div style={{
          background: 'var(--color-hero-bg)',
          padding: '48px 0 40px',
        }}>
          <div className="container-page">
            <div style={{
              fontSize: '0.8rem', fontWeight: 700,
              color: '#60a5fa', letterSpacing: '0.08em',
              marginBottom: 12,
            }}>試験を選ぶ</div>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 900, color: '#fff',
              marginBottom: 12, lineHeight: 1.2,
            }}>
              どの資格を目指しますか？
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 480 }}>
              すべての学習コンテンツが無料。練習問題・学習ガイド・AI解説で合格を目指しましょう。
            </p>
          </div>
        </div>

        <div className="container-page" style={{ padding: '40px 24px' }}>

          {/* 対応中の試験 */}
          <h2 style={{
            fontSize: '1.1rem', fontWeight: 800,
            marginBottom: 6, color: 'var(--color-text)',
          }}>学習できる試験</h2>
          <p style={{
            fontSize: '0.875rem', color: 'var(--color-text-secondary)',
            marginBottom: 20,
          }}>すべて無料で学習できます</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16, marginBottom: 48,
          }}>
            {getAvailableExams().map(exam => {
              const cat = CATEGORY_COLORS[exam.category] ?? { bg: '#f3f4f6', text: '#374151' }
              return (
                <Link key={exam.id} href={`/exams/${exam.id}`} style={{ textDecoration: 'none' }}>
                  <HoverCard style={{
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px',
                    cursor: 'pointer',
                    height: '100%',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <span style={{
                        display: 'inline-block',
                        background: cat.bg, color: cat.text,
                        fontSize: '0.75rem', fontWeight: 700,
                        padding: '3px 10px', borderRadius: 99,
                      }}>{exam.category}</span>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 600,
                        color: 'var(--color-success)',
                        background: '#f0fdf4',
                        padding: '3px 8px', borderRadius: 99,
                      }}>無料</span>
                    </div>
                    <div style={{
                      fontWeight: 900, fontSize: '1.2rem',
                      marginBottom: 8, color: 'var(--color-text)',
                    }}>{exam.name}</div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6, marginBottom: 20,
                    }}>{exam.description}</div>

                    {/* ツールバッジ */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                      {['学習ガイド', '練習問題', '知識カード', '模擬試験', 'AI質問'].map(t => (
                        <span key={t} style={{
                          fontSize: '0.72rem', fontWeight: 600,
                          color: 'var(--color-text-muted)',
                          background: 'var(--color-bg-muted)',
                          padding: '2px 8px', borderRadius: 99,
                          border: '1px solid var(--color-border)',
                        }}>{t}</span>
                      ))}
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 16,
                      borderTop: '1px solid var(--color-border)',
                    }}>
                      <span style={{
                        fontSize: '0.8rem',
                        color: 'var(--color-text-muted)',
                      }}>全{exam.totalChapters}章</span>
                      <span style={{
                        fontSize: '0.875rem', fontWeight: 700,
                        color: 'var(--color-primary)',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>学習を始める →</span>
                    </div>
                  </HoverCard>
                </Link>
              )
            })}
          </div>

          {/* 近日公開 */}
          <h2 style={{
            fontSize: '1.1rem', fontWeight: 800,
            marginBottom: 6, color: 'var(--color-text)',
          }}>近日公開予定</h2>
          <p style={{
            fontSize: '0.875rem', color: 'var(--color-text-secondary)',
            marginBottom: 20,
          }}>準備中の試験です。公開をお待ちください。</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 14,
          }}>
            {COMING_SOON.map(item => {
              const cat = CATEGORY_COLORS[item.category] ?? { bg: '#f3f4f6', text: '#374151' }
              return (
                <div key={item.name} style={{
                  background: '#fff',
                  border: '1px dashed var(--color-border-strong)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 22px',
                  opacity: 0.65,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{
                      display: 'inline-block',
                      background: cat.bg, color: cat.text,
                      fontSize: '0.72rem', fontWeight: 700,
                      padding: '3px 8px', borderRadius: 99,
                    }}>{item.category}</span>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      background: 'var(--color-bg-muted)',
                      padding: '3px 8px', borderRadius: 99,
                    }}>近日公開</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 6, color: 'var(--color-text-secondary)' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    {item.desc}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
