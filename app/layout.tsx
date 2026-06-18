import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: '資格合格ナビ — 無料で学ぶ日本の資格',
  description: 'FP・簿記・宅建など日本の主要資格に特化した学習プラットフォーム。練習問題・知識カード・模擬試験・AI解説がすべて無料。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
