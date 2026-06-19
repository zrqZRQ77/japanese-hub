import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import SiteLogo, { BrandText } from '@/components/layout/SiteLogo'
import HoverCard from '@/components/ui/HoverCard'
import { getAvailableExams } from '@/lib/content/exams-loader'
import { Bot, BookOpen, CreditCard, PencilLine } from 'lucide-react'

const TOOLS = [
  { icon: PencilLine, title: '練習問題', desc: '章ごとの練習で知識を定着' },
  { icon: BookOpen, title: '学習ガイド', desc: 'やさしい解説で理解を深める' },
  { icon: CreditCard, title: '知識カード', desc: 'スキマ時間に効率よく暗記' },
  { icon: Bot, title: 'AI質問', desc: 'AIがいつでも質問に回答' },
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
          padding: 'clamp(56px, 8vw, 88px) 0 clamp(44px, 6vw, 68px)',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div className="container-page" style={{
            display: 'flex', gap: 'clamp(24px, 4vw, 56px)',
            alignItems: 'center', flexWrap: 'wrap',
          }}>
            {/* 左：テキスト */}
            <div style={{ flex: '1 1 min(100%, 360px)' }}>
              <div style={{
                display: 'inline-block',
                background: '#fff', color: 'var(--color-primary)',
                fontSize: '0.78rem', fontWeight: 800,
                padding: '5px 12px', borderRadius: 'var(--radius-sm)',
                marginBottom: 18,
                border: '1px solid var(--color-border)',
              }}>完全無料・AI解説・登録不要</div>

              <h1 style={{
                fontSize: 'clamp(2rem, 6vw, 3.7rem)',
                fontWeight: 900, lineHeight: 1.15, marginBottom: 14,
                color: 'var(--color-text)',
              }}>
                資格合格を、<br />
                <span style={{ color: 'var(--color-primary)' }}>無料で。</span>
              </h1>

              <p style={{
                color: 'var(--color-text-secondary)', fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                lineHeight: 1.8, marginBottom: 32, maxWidth: 420,
              }}>
                FP技能士・日商簿記・宅建士など、<br />
                日本の主要資格に特化した学習プラットフォーム。<br />
                練習問題・知識カード・学習ガイド・AI解説がすべて無料。
              </p>

              <Link href="/exams" style={{
                display: 'inline-block',
                padding: 'clamp(10px, 2vw, 14px) clamp(20px, 4vw, 32px)',
                background: 'var(--color-accent)', color: '#fff',
                borderRadius: 'var(--radius-sm)', fontWeight: 700,
                fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
                textDecoration: 'none',
                boxShadow: '0 12px 26px rgba(37,99,235,0.18)',
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
                  background: '#fff',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'clamp(16px, 3vw, 28px) clamp(12px, 2vw, 24px)',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-card)',
                }}>
                  <div style={{
                    fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                    fontWeight: 900, color: 'var(--color-text)', lineHeight: 1,
                  }}>{s.value}</div>
                  <div style={{
                    fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                    color: 'var(--color-text-secondary)', marginTop: 6,
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
            }}>4つの学習ツール、すべて無料</h2>
            <div style={{ maxWidth: 980, margin: '0 auto' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))',
                gap: 'clamp(10px, 2vw, 16px)',
                justifyContent: 'center',
              }}>
                {TOOLS.map(t => {
                  const Icon = t.icon
                  return (
                <HoverCard key={t.title} style={{
                  background: '#fff',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'clamp(16px, 3vw, 24px) clamp(12px, 2vw, 20px)',
                  textAlign: 'center', cursor: 'pointer',
                  boxShadow: 'var(--shadow-card)',
                }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    margin: '0 auto 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}><Icon size={20} strokeWidth={2.2} /></div>
                  <div style={{ fontWeight: 700, fontSize: 'clamp(0.875rem, 1.5vw, 0.95rem)', marginBottom: 6 }}>{t.title}</div>
                  <div style={{ fontSize: 'clamp(0.75rem, 1.2vw, 0.8rem)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{t.desc}</div>
                </HoverCard>
                  )
                })}
              </div>
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
                    boxShadow: 'var(--shadow-card)',
                  }}>
                    <div style={{
                      display: 'inline-block',
                      background: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      fontSize: '0.75rem', fontWeight: 700,
                      padding: '3px 10px', borderRadius: 'var(--radius-sm)', marginBottom: 12,
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
          background: 'var(--color-bg)', color: 'var(--color-text-muted)',
          padding: 'clamp(28px, 4vw, 40px) 0',
          textAlign: 'center', fontSize: '0.875rem',
        }}>
          <div className="container-page">
              <div style={{ marginBottom: 8 }}>
                  <SiteLogo />
                </div>
              <p>© 2026 <BrandText />. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  )
}
