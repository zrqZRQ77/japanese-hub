import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import HoverCard from '@/components/ui/HoverCard'
import { EXAMS_REGISTRY } from '@/lib/types/exams-registry'
import { getAvailableExams } from '@/lib/content/exams-loader'

const TOOLS = [
  { icon: '📝', title: '練習問題', desc: '章ごとの練習で知識を定着' },
  { icon: '🎓', title: '学習ガイド', desc: 'やさしい解説で理解を深める' },
  { icon: '📋', title: '模擬試験', desc: '本番形式で実力をチェック' },
  { icon: '🃏', title: '知識カード', desc: 'スキマ時間に効率よく暗記' },
  { icon: '🤖', title: 'AI質問', desc: 'AIがいつでも質問に回答' },
]

const STATS = [
  { value: '100+', label: '練習問題' },
  { value: '5種', label: '学習ツール' },
  { value: '無料', label: '全コンテンツ' },
  { value: 'AI', label: '即時解説' },
]

// No coming-soon items — only show exams that have content

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ===== Hero ===== */}
        <section style={{
          background: 'var(--color-hero-bg)',
          color: 'var(--color-hero-text)',
          padding: 'clamp(48px, 8vw, 80px) 0 clamp(40px, 6vw, 64px)',
        }}>
          <div className="container-page" style={{
            display: 'flex', gap: 'clamp(24px, 4vw, 56px)',
            alignItems: 'center', flexWrap: 'wrap',
          }}>
            {/* 左：テキスト */}
            <div style={{ flex: '1 1 min(100%, 360px)' }}>
              <div style={{
                display: 'inline-block',
                background: '#1e3a5f', color: '#93c5fd',
                fontSize: '0.78rem', fontWeight: 700,
                padding: '4px 14px', borderRadius: 99,
                marginBottom: 20, letterSpacing: '0.05em',
              }}>完全無料・AI解説・登録不要</div>

              <h1 style={{
                fontSize: 'clamp(2rem, 6vw, 3.6rem)',
                fontWeight: 900, lineHeight: 1.15, marginBottom: 14,
              }}>
                資格合格を、<br />
                <span style={{ color: '#facc15' }}>無料で。</span>
              </h1>

              <p style={{
                color: '#94a3b8', fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                lineHeight: 1.8, marginBottom: 32, maxWidth: 420,
              }}>
                FP技能士・日商簿記・宅建士など、<br />
                日本の主要資格に特化した学習プラットフォーム。<br />
                練習問題・知識カード・模擬試験・AI解説がすべて無料。
              </p>

              <Link href="/exams" style={{
                display: 'inline-block',
                padding: 'clamp(10px, 2vw, 14px) clamp(20px, 4vw, 32px)',
                background: 'var(--color-accent)', color: '#fff',
                borderRadius: 'var(--radius-sm)', fontWeight: 700,
                fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
                textDecoration: 'none',
              }}>試験を選ぶ →</Link>
            </div>

            {/* 右：統計カード 2×2 */}
            <div style={{
              flex: '0 0 auto',
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 'clamp(10px, 2vw, 16px)',
              width: 'min(100%, 300px)',
            }}>
              {STATS.map(s => (
                <div key={s.label} style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'clamp(16px, 3vw, 28px) clamp(12px, 2vw, 24px)',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                    fontWeight: 900, color: '#facc15', lineHeight: 1,
                  }}>{s.value}</div>
                  <div style={{
                    fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                    color: '#94a3b8', marginTop: 6,
                  }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 5つの学習ツール ===== */}
        <section style={{
          padding: 'clamp(40px, 6vw, 64px) 0',
          background: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div className="container-page">
            <h2 style={{
              textAlign: 'center',
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
              fontWeight: 800, marginBottom: 'clamp(24px, 4vw, 40px)',
            }}>5つの学習ツール、すべて無料</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))',
              gap: 'clamp(10px, 2vw, 16px)',
            }}>
              {TOOLS.map(t => (
                <HoverCard key={t.title} style={{
                  background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'clamp(16px, 3vw, 24px) clamp(12px, 2vw, 20px)',
                  textAlign: 'center', cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', marginBottom: 10 }}>{t.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 'clamp(0.875rem, 1.5vw, 0.95rem)', marginBottom: 6 }}>{t.title}</div>
                  <div style={{ fontSize: 'clamp(0.75rem, 1.2vw, 0.8rem)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{t.desc}</div>
                </HoverCard>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 試験一覧 ===== */}
        <section style={{
          padding: 'clamp(40px, 6vw, 64px) 0',
          background: 'var(--color-bg-subtle)',
        }}>
          <div className="container-page">
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'baseline', marginBottom: 6, flexWrap: 'wrap', gap: 8,
            }}>
              <h2 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 800 }}>対応試験</h2>
              <Link href="/exams" style={{
                fontSize: '0.875rem', color: 'var(--color-primary)',
                fontWeight: 600, textDecoration: 'none',
              }}>すべて見る →</Link>
            </div>
            <p style={{
              color: 'var(--color-text-secondary)', marginBottom: 24,
              fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)',
            }}>随時追加予定。すべて無料で学習できます。</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
              gap: 'clamp(12px, 2vw, 20px)',
            }}>
              {getAvailableExams().map(exam => (
                <Link key={exam.id} href={`/exams/${exam.id}`} style={{ textDecoration: 'none' }}>
                  <HoverCard style={{
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'clamp(16px, 3vw, 24px)',
                    cursor: 'pointer', height: '100%',
                  }}>
                    <div style={{
                      display: 'inline-block',
                      background: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      fontSize: '0.75rem', fontWeight: 700,
                      padding: '3px 10px', borderRadius: 99, marginBottom: 12,
                    }}>{exam.category}</div>
                    <div style={{
                      fontWeight: 800,
                      fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                      marginBottom: 6, color: 'var(--color-text)',
                    }}>{exam.name}</div>
                    <div style={{
                      fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)',
                      color: 'var(--color-text-secondary)', lineHeight: 1.6,
                    }}>{exam.description}</div>
                    <div style={{
                      marginTop: 16, color: 'var(--color-primary)',
                      fontSize: '0.875rem', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>学習を始める →</div>
                  </HoverCard>
                </Link>
              ))}
              {/* No coming-soon items to display */}
            </div>
          </div>
        </section>

        {/* ===== フッター ===== */}
        <footer style={{
          background: 'var(--color-hero-bg)', color: '#64748b',
          padding: 'clamp(28px, 4vw, 40px) 0',
          textAlign: 'center', fontSize: '0.875rem',
        }}>
          <div className="container-page">
            <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fff', marginBottom: 8 }}>
              資格合格<span style={{ color: '#60a5fa' }}>ナビ</span>
            </div>
            <p>© 2026 資格合格ナビ. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  )
}
