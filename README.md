# 資格合格ナビ

日商簿記3級、FP3級、ITパスポートの学習ガイド、練習問題、知識カードを提供する資格学習サイトです。

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Google Analytics / Search Console

`.env.example` を参考に、公開環境の環境変数へ次の値を設定します。

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: GA4の「G-」から始まる測定ID
- `GOOGLE_SITE_VERIFICATION`: Search ConsoleのHTMLタグ方式で発行された確認コード
- `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT`: AdSenseの `ca-pub-` から始まるクライアントID
- `NEXT_PUBLIC_ADSENSE_SLOT_EXAM_SECONDARY`: 学習ページ下部に表示するAdSense広告ユニットID
- `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG`: AmazonアソシエイトのトラッキングID（例: `example-22`）

GA4では次の学習・収益イベントを送信します。

- `practice_answer`
- `practice_chapter_complete`
- `guide_practice_click`
- `flashcard_status_change`
- `flashcard_chapter_complete`
- `affiliate_click`

GA4の管理画面では、次の3件を「キーイベント」として設定します。

- `practice_chapter_complete`: 練習問題を1章分完了
- `flashcard_chapter_complete`: 知識カードを1章分習得
- `affiliate_click`: 紹介先への送客

ローカルの開発モードでは、測定IDを設定してもイベントを送信しません。公開環境へ環境変数を追加した場合は、再ビルド・再デプロイが必要です。

Search Consoleでドメインプロパティを利用する場合は、環境変数ではなく、ドメイン管理画面でGoogle指定のDNS TXTレコードを設定します。
所有権の確認後、`https://japanese-hub.com/sitemap.xml` をSearch Consoleから送信します。

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
