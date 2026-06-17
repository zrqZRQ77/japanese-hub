// ============================================================
// グローバルナビバー — レスポンシブ対応版
// 修改此文件全站导航同步更新
// ============================================================
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { EXAMS_REGISTRY } from '@/lib/types/exams-registry'
import SearchModal from '@/components/features/search/SearchModal'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [examMenuOpen, setExamMenuOpen] = useState(false)
  const [availableExams, setAvailableExams] = useState<typeof EXAMS_REGISTRY | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)

  // Cmd+K / Ctrl+K でサーチを開く
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(v => !v)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // fetch available exams from server (only exams with content)
  useEffect(() => {
    let mounted = true
    fetch('/api/available-exams')
      .then(r => r.json())
      .then(data => { if (mounted) setAvailableExams(data) })
      .catch(() => { if (mounted) setAvailableExams(null) })
    return () => { mounted = false }
  }, [])

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#fff',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div className="container-page" style={{
          display: 'flex', alignItems: 'center',
          height: 60, gap: 4,
        }}>
          {/* ロゴ */}
          <Link href="/" style={{
            fontWeight: 900, fontSize: '1.15rem',
            color: 'var(--color-text)', textDecoration: 'none',
            marginRight: 24, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            資格合格<span style={{ color: 'var(--color-primary)' }}>ナビ</span>
          </Link>

          {/* デスクトップメニュー */}
          <div className="nav-desktop" style={{
            display: 'flex', alignItems: 'center',
            gap: 2, flex: 1,
          }}>
            {/* 試験を選ぶ ドロップダウン */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setExamMenuOpen(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '7px 14px', borderRadius: 'var(--radius-sm)',
                  background: examMenuOpen ? 'var(--color-bg-subtle)' : 'none',
                  border: 'none', fontSize: '0.9rem', fontWeight: 600,
                  color: isActive('/exams') ? 'var(--color-primary)' : 'var(--color-text)',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                試験を選ぶ
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  style={{ transform: examMenuOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {examMenuOpen && (
                <>
                  <div onClick={() => setExamMenuOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-elevated)',
                    minWidth: 260, zIndex: 20, overflow: 'hidden',
                    padding: '8px',
                  }}>
                    {/* 学習できる試験 */}
                    <div style={{
                      fontSize: '0.72rem', fontWeight: 700,
                      color: 'var(--color-text-muted)',
                      padding: '4px 10px 6px',
                      letterSpacing: '0.06em',
                    }}>学習できる試験</div>
                    {(availableExams && availableExams.length ? availableExams : EXAMS_REGISTRY).map(exam => (
                      <Link key={exam.id} href={`/exams/${exam.id}`}
                        onClick={() => setExamMenuOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 10px',
                          borderRadius: 'var(--radius-sm)',
                          textDecoration: 'none',
                          color: 'var(--color-text)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-subtle)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{exam.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 1 }}>
                            {exam.category}
                          </div>
                        </div>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 700,
                          color: 'var(--color-success)',
                          background: '#f0fdf4',
                          padding: '2px 7px', borderRadius: 99,
                        }}>無料</span>
                      </Link>
                    ))}
                    {/* すべて見る */}
                    <div style={{
                      borderTop: '1px solid var(--color-border)',
                      marginTop: 6, paddingTop: 6,
                    }}>
                      <Link href="/exams"
                        onClick={() => setExamMenuOpen(false)}
                        style={{
                          display: 'block', padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          textDecoration: 'none',
                          fontSize: '0.85rem', fontWeight: 600,
                          color: 'var(--color-primary)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-light)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        すべての試験を見る →
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ flex: 1 }} />

            {/* 右侧主导航（靠近搜索） */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
              <NavLink href="/guide" active={isActive('/guide')} forceColor={'var(--color-text)'}>学習ガイド</NavLink>
              <NavLink href="/practice" active={isActive('/practice')} forceColor={'var(--color-text)'}>練習問題</NavLink>
              <NavLink href="/exams" active={isActive('/exams')} forceColor={'var(--color-text)'}>知識カード</NavLink>
              <NavLink href="/ai-chat" active={isActive('/ai-chat')} forceColor={'var(--color-text)'}>AI質問</NavLink>
            </div>

            {/* 検索ボタン */}
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 12px',
                background: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', color: 'var(--color-text-muted)',
                fontSize: '0.875rem', whiteSpace: 'nowrap', flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            >
              🔍 検索
              <kbd style={{
                fontSize: '0.68rem', color: 'var(--color-text-muted)',
                background: '#fff', border: '1px solid var(--color-border)',
                borderRadius: 4, padding: '1px 5px',
              }}>⌘K</kbd>
            </button>


          </div>

          {/* ハンバーガーボタン（モバイル） */}
          <div style={{ flex: 1 }} className="nav-mobile-spacer" />
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen(v => !v)}
            style={{
              display: 'none',
              padding: '8px', background: 'none',
              border: 'none', cursor: 'pointer',
              flexDirection: 'column', gap: 5,
            }}
            aria-label="メニュー"
          >
            <span style={{
              display: 'block', width: 22, height: 2,
              background: 'var(--color-text)', borderRadius: 2,
              transform: mobileOpen ? 'translateY(7px) rotate(45deg)' : 'none',
              transition: '0.2s',
            }} />
            <span style={{
              display: 'block', width: 22, height: 2,
              background: 'var(--color-text)', borderRadius: 2,
              opacity: mobileOpen ? 0 : 1, transition: '0.2s',
            }} />
            <span style={{
              display: 'block', width: 22, height: 2,
              background: 'var(--color-text)', borderRadius: 2,
              transform: mobileOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
              transition: '0.2s',
            }} />
          </button>
        </div>

        {/* モバイルメニュー */}
        {mobileOpen && (
          <div style={{
            borderTop: '1px solid var(--color-border)',
            background: '#fff',
            padding: '16px 20px 20px',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <MobileNavSection title="試験を選ぶ">
                {(availableExams && availableExams.length ? availableExams : EXAMS_REGISTRY).map(exam => (
                  <Link key={exam.id} href={`/exams/${exam.id}`}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none', color: 'var(--color-text)',
                      fontWeight: 600, fontSize: '0.9rem',
                      background: 'var(--color-bg-subtle)',
                    }}>
                    {exam.name}
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontWeight: 700 }}>無料</span>
                  </Link>
                ))}
                <Link href="/exams" onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'block', padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    color: 'var(--color-primary)',
                    fontWeight: 600, fontSize: '0.875rem',
                  }}>すべての試験を見る →</Link>
              </MobileNavSection>

              {[
                { href: '/guide', label: '学習ガイド' },
                { href: '/practice', label: '練習問題' },
                { href: '/exams', label: '知識カード' },
                { href: '/ai-chat', label: 'AI質問' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'block', padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none', color: 'var(--color-text)',
                    fontWeight: 600, fontSize: '0.95rem',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >{item.label}</Link>
              ))}

              
            </div>
          </div>
        )}
      </nav>

      {/* レスポンシブCSS */}
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-mobile-spacer { display: block !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-spacer { display: none !important; }
        }
      `}</style>

      {/* 検索モーダル */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

function NavLink({ href, children, active, highlight, forceColor }: {
  href: string; children: React.ReactNode; active?: boolean; highlight?: boolean; forceColor?: string
}) {
  const color = forceColor ?? (highlight ? 'var(--color-primary)'
    : active ? 'var(--color-primary)'
    : 'var(--color-text)')
  return (
    <Link href={href} style={{
      padding: '7px 14px', borderRadius: 'var(--radius-sm)',
      fontSize: '0.9rem', fontWeight: active ? 700 : 500,
      color,
      textDecoration: 'none', whiteSpace: 'nowrap',
      background: active ? 'var(--color-primary-light)' : 'transparent',
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--color-bg-subtle)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </Link>
  )
}

function MobileNavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        fontSize: '0.72rem', fontWeight: 700,
        color: 'var(--color-text-muted)',
        letterSpacing: '0.06em', marginBottom: 6, paddingLeft: 4,
      }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {children}
      </div>
    </div>
  )
}
