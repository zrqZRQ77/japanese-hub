import Link from 'next/link'
import SiteLogo, { BrandText } from '@/components/layout/SiteLogo'

const FOOTER_LINKS = [
  { href: '/privacy', label: 'プライバシーポリシー' },
  { href: '/operator', label: '運営者情報' },
  { href: '/contact', label: 'お問い合わせ' },
  { href: '/disclaimer', label: '免責事項' },
]

export default function SiteFooter() {
  return (
    <footer style={{
      background: 'var(--color-brand)',
      color: 'rgba(244,243,239,0.66)',
      padding: '34px 0',
      borderTop: '1px solid rgba(201,162,75,0.32)',
      fontSize: '0.875rem',
      ['--color-brand' as string]: 'var(--color-bg)',
    }}>
      <div className="container-page" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}>
        <SiteLogo />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 18,
          flexWrap: 'wrap',
        }}>
          <p style={{ margin: 0 }}>© 2026 <BrandText />. All rights reserved.</p>
          <nav aria-label="フッターリンク" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}>
            {FOOTER_LINKS.map(link => (
              <Link key={link.href} href={link.href} style={{
                color: 'rgba(244,243,239,0.74)',
                textDecoration: 'none',
                fontWeight: 700,
              }}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
