import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPage from '@/components/layout/LegalPage'
import { createPageMetadata } from '@/lib/seo'

const externalLinkStyle = { color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline' } as const

export const metadata: Metadata = createPageMetadata({
  title: 'プライバシーポリシー',
  description: '資格合格ナビの個人情報、Cookie、アクセス解析、広告、外部サービスの取扱いについて。',
  path: '/privacy',
})

export default function PrivacyPage() {
  return (
    <LegalPage
      title="プライバシーポリシー"
      description="資格合格ナビは、利用者が安心して学習できるよう、個人情報および関連情報を適切に取り扱います。"
      updatedAt="2026年6月20日"
      sections={[
        {
          title: '取得する情報',
          body: [
            '当サイトでは、お問い合わせ時に入力されたメールアドレス、問い合わせ内容など、利用者が任意で提供した情報を取得する場合があります。',
            'また、学習進捗や回答状況などは、利用者の端末内のローカルストレージに保存される場合があります。これらは原則として当サイトのサーバへ送信されません。',
          ],
        },
        {
          title: '利用目的',
          body: [
            '取得した情報は、お問い合わせへの回答、サイト改善、不正利用防止、学習体験の向上のために利用します。',
            '法令に基づく場合を除き、利用者の同意なく目的外利用を行いません。',
          ],
        },
        {
          title: 'Cookie・アクセス解析・広告',
          body: [
            '当サイトでは、サイトの利用状況を把握し、内容を改善するためにGoogle Analyticsを利用します。Google AnalyticsはCookie等を使用し、閲覧ページ、利用環境、操作状況などの情報を収集します。',
            <>
              収集されたデータは
              <Link href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={externalLinkStyle}>Googleのプライバシーポリシー</Link>
              および
              <Link href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={externalLinkStyle}>利用規約</Link>
              に基づいて管理されます。Cookieの利用はブラウザ設定により拒否できます。
            </>,
            '広告配信サービスを利用する場合、利用者の興味に応じた広告が表示されることがあります。Cookieの利用はブラウザ設定により拒否できます。',
          ],
        },
        {
          title: '第三者提供',
          body: [
            '当サイトは、法令に基づく場合を除き、取得した個人情報を本人の同意なく第三者へ提供しません。',
            '外部リンク先のWebサイトにおける情報管理については、リンク先サイトの規約およびプライバシーポリシーをご確認ください。',
          ],
        },
        {
          title: 'お問い合わせ',
          body: [
            <>個人情報の開示、訂正、削除、利用停止等を希望される場合は、<Link href="/contact" style={externalLinkStyle}>お問い合わせページ</Link>よりご連絡ください。</>,
          ],
        },
      ]}
    />
  )
}
