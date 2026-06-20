import type { Metadata } from 'next'
import LegalPage from '@/components/layout/LegalPage'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: '運営者情報',
  description: '資格合格ナビの運営者情報、サイト目的、連絡先について。',
  path: '/operator',
})

export default function OperatorPage() {
  return (
    <LegalPage
      title="運営者情報"
      description="資格合格ナビは、日本の資格学習をわかりやすく、継続しやすくすることを目的に運営しています。"
      updatedAt="2026年6月20日"
      sections={[
        {
          title: 'サイト名',
          body: ['資格合格ナビ'],
        },
        {
          title: '運営者',
          body: ['資格合格ナビ運営事務局'],
        },
        {
          title: 'サイトURL',
          body: ['https://japanese-hub.com/'],
        },
        {
          title: '運営目的',
          body: [
            '日商簿記、FP技能士、ITパスポートなど、日本の主要資格について、学習ガイド、練習問題、知識カードを提供し、初学者の学習を支援することを目的としています。',
            '掲載内容は可能な限り正確性に配慮していますが、試験制度や法令、公式情報は変更される場合があります。受験申込や制度確認の際は、必ず各試験の公式情報をご確認ください。',
          ],
        },
        {
          title: '連絡先',
          body: ['お問い合わせは、当サイトのお問い合わせページよりご連絡ください。'],
        },
      ]}
    />
  )
}
