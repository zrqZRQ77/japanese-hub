import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  desc: string
  linkLabel: string
  href: string
  color?: string
}

export default function ToolCard({ icon, title, desc, linkLabel, href, color = 'var(--color-primary)' }: Props) {
  const Icon = icon
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '20px',
      display: 'flex', flexDirection: 'column', gap: 8,
      boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        background: `${color}14`,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{title}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, flex: 1 }}>
        {desc}
      </div>
      <Link href={href} style={{
        fontSize: '0.82rem', fontWeight: 600,
        color, textDecoration: 'none',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {linkLabel} →
      </Link>
    </div>
  )
}
