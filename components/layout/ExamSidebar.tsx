// ============================================================
// 試験ページ共通左サイドバー
// 修改此文件 → 所有考试页面左侧导航同步更新
// ============================================================
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExamMeta } from '@/lib/types'
import { LayoutGrid, BookOpen, PencilLine, LibraryBig } from 'lucide-react'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'ダッシュボード', icon: LayoutGrid, path: '' },
  { key: 'guide',     label: '学習ガイド',     icon: BookOpen, path: '/guide' },
  { key: 'questions', label: '練習問題',        icon: PencilLine, path: '/questions' },
  { key: 'cards',     label: '知識カード',      icon: LibraryBig, path: '/cards' },
]

interface Props {
  exam: ExamMeta
}

export default function ExamSidebar({ exam }: Props) {
  const pathname = usePathname()
  const base = `/exams/${exam.id}`

  return (
    <>
    <nav className="exam-mobile-nav" aria-label={`${exam.shortName} メニュー`}>
      {NAV_ITEMS.map(item => {
        const href = `${base}${item.path}`
        const isActive = item.path === ''
          ? pathname === base || pathname === `${base}/`
          : pathname.startsWith(href)
        const Icon = item.icon
        return (
          <Link key={item.key} href={href} className={isActive ? 'is-active' : ''}>
            <Icon size={17} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
    <aside className="exam-sidebar" style={{
      width: 'var(--sidebar-width)',
      minWidth: 'var(--sidebar-width)',
      borderRight: '1px solid var(--color-border)',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backdropFilter: 'blur(10px)',
    }}>
      {/* 試験名ヘッダー */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{
          fontSize: '0.75rem', fontWeight: 700,
          color: 'var(--color-text-muted)',
          letterSpacing: '0.06em', marginBottom: 4,
        }}>現在の試験</div>
        <div style={{
          fontWeight: 800, fontSize: '1.05rem',
          color: 'var(--color-text)',
        }}>{exam.shortName}</div>
      </div>

      {/* ナビメニュー */}
      <nav style={{ padding: '12px 12px', flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const href = `${base}${item.path}`
          const isActive = item.path === ''
            ? pathname === base || pathname === `${base}/`
            : pathname.startsWith(`${base}${item.path}`)
          const Icon = item.icon

          return (
            <Link key={item.key} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px', borderRadius: 'var(--radius-sm)',
              marginBottom: 4,
              textDecoration: 'none',
              fontWeight: isActive ? 700 : 600,
              fontSize: '0.92rem',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
              background: isActive
                ? 'var(--color-primary-light)'
                : 'transparent',
              border: '1px solid',
              borderColor: isActive ? 'rgba(201,162,75,0.34)' : 'transparent',
              boxShadow: isActive ? '0 10px 24px rgba(26,29,41,0.05)' : 'none',
              transition: 'background 0.15s ease, transform 0.15s ease',
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? 'rgba(201,162,75,0.20)' : 'rgba(170,163,148,0.14)',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                flexShrink: 0,
              }}>
                <Icon size={16} strokeWidth={2.2} />
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* 学習ヒント（已移除应客户要求） */}
    </aside>
    </>
  )
}
