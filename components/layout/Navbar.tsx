// ============================================================
// グローバルナビバー — レスポンシブ対応版
// 修改此文件全站导航同步更新
// ============================================================
 'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { EXAMS_REGISTRY } from '@/lib/types/exams-registry'
import SearchModal from '@/components/features/search/SearchModal'
import SiteLogo from '@/components/layout/SiteLogo'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
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
        background: 'rgba(255,255,255,0.92)',
        borderBottom: '1px solid rgba(226,232,240,0.86)',
        boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
        backdropFilter: 'blur(14px)',
      }}>
        <div className="container-page" style={{
          display: 'flex', alignItems: 'center',
          height: 64, gap: 4,
        }}>
          {/* ロゴ */}
          <div style={{ marginRight: 24, flexShrink: 0 }}>
            <SiteLogo />
          </div>

          {/* デスクトップメニュー */}
          <div className="nav-desktop" style={{
            display: 'flex', alignItems: 'center',
            gap: 2, flex: 1,
          }}>
            {/* removed top '試験を選ぶ' dropdown per request */}

            <div style={{ flex: 1 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
              <NavLink href="/guide" active={isActive('/guide')} forceColor={'var(--color-text)'}>学習ガイド</NavLink>
              <NavLink href="/practice" active={isActive('/practice')} forceColor={'var(--color-text)'}>練習問題</NavLink>
              <NavLink href="/exams" active={isActive('/exams')} forceColor={'var(--color-text)'}>資格一覧</NavLink>
              <NavLink href="/ai-chat" active={isActive('/ai-chat')} forceColor={'var(--color-text)'}>AI質問</NavLink>
            </div>

            {/* 検索ボタン */}
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px',
                background: '#fff',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', color: 'var(--color-text-muted)',
                fontSize: '0.875rem', whiteSpace: 'nowrap', flexShrink: 0,
                boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            >
              <Search size={16} />
              検索
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
            background: 'rgba(255,255,255,0.96)',
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
                { href: '/exams', label: '資格一覧' },
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
      fontSize: '0.9rem', fontWeight: active ? 800 : 600,
      color,
      textDecoration: 'none', whiteSpace: 'nowrap',
      background: active ? 'var(--color-primary-light)' : 'transparent',
      border: active ? '1px solid rgba(37,99,235,0.10)' : '1px solid transparent',
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
