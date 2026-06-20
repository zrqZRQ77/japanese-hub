import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPage from '@/components/layout/LegalPage'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: 'お問い合わせ',
  description: '資格合格ナビへのお問い合わせ、掲載内容の修正依頼、広告・提携に関する連絡先。',
  path: '/contact',
})

export default function ContactPage() {
  return (
    <LegalPage
      title="お問い合わせ"
      description="掲載内容の修正依頼、広告・提携、その他のお問い合わせはこちらをご確認ください。"
      updatedAt="2026年6月20日"
      sections={[
        {
          title: 'お問い合わせ先',
          body: [
            'メール：contact@japanese-hub.com',
            '内容を確認のうえ、必要に応じて返信いたします。返信までお時間をいただく場合があります。',
          ],
        },
        {
          title: '掲載内容の修正依頼',
          body: [
            '教材内容、試験情報、リンク先などに誤りや古い情報がある場合は、該当ページのURLと修正内容を添えてご連絡ください。',
            '試験制度、受験料、出題範囲などは変更される場合があるため、公式情報と照合したうえで修正します。',
          ],
        },
        {
          title: '広告・提携について',
          body: [
            '資格学習、教材、通信講座、学習支援サービスに関する広告・提携のご相談を受け付けています。',
            '利用者の学習体験を損なう広告掲載や、内容と関連性の低い提携はお受けできない場合があります。',
          ],
        },
        {
          title: '関連ページ',
          body: [
            'お問い合わせの前に、プライバシーポリシー、免責事項、運営者情報もあわせてご確認ください。',
          ],
        },
      ]}
    />
  )
}

export function ContactMailLink() {
  return <Link href="mailto:contact@japanese-hub.com">contact@japanese-hub.com</Link>
}
