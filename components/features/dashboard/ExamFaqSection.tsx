// ============================================================
// 試験FAQ — ダッシュボード下部に表示
// exam.info の既存データから自動生成（試験追加時に文章を書く必要なし）
// FAQPage構造化データも併せて出力し、検索結果でのFAQ表示にも対応
// ============================================================
import { ExamMeta } from '@/lib/types'

interface Props {
  exam: ExamMeta
}

function buildFaqs(exam: ExamMeta): { q: string; a: string }[] {
  const info = exam.info
  if (!info) return []

  const stars = '★'.repeat(info.difficulty) + '☆'.repeat(5 - info.difficulty)
  const hasFreeCourse = info.courses.some(course => course.isFree)

  return [
    {
      q: `${exam.shortName}の難易度はどのくらいですか？`,
      a: `難易度は${stars}（${info.difficultyLabel}）です。${info.tagline}`,
    },
    {
      q: '合格率はどのくらいですか？',
      a: `合格率の目安は${info.passRate}です。試験形式は${info.examFormat}、試験時間は${info.examTime}です。`,
    },
    {
      q: 'どのくらいの学習時間が必要ですか？',
      a: `目安は${info.studyHours}（${info.studyMonths}）です。学習ガイドで基礎を理解し、練習問題で確認しながら、章ごとに無理なく進めるのがおすすめです。`,
    },
    {
      q: '受験料や申し込み方法は？',
      a: `受験料は${info.examFee}です。${info.registrationNote}。最新の情報は公式サイトでご確認ください。`,
    },
    {
      q: '独学でも合格できますか？',
      a: `はい。当サイトの学習ガイド・練習問題・知識カードはすべて無料で利用できます。${hasFreeCourse ? '無料で使える外部講座も紹介しているので、' : ''}独学でも十分に対応できます。`,
    },
    {
      q: '合格後にはどんなメリットがありますか？',
      a: `${info.valueAfterPass.join('。')}。`,
    },
  ]
}

export default function ExamFaqSection({ exam }: Props) {
  const faqs = buildFaqs(exam)
  if (faqs.length === 0) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }

  return (
    <section className="exam-faq-section" aria-labelledby="exam-faq-heading">
      <h2 id="exam-faq-heading">よくある質問</h2>
      <div className="exam-faq-list">
        {faqs.map(faq => (
          <details className="exam-faq-item" key={faq.q}>
            <summary>{faq.q}</summary>
            <p>{faq.a}</p>
          </details>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  )
}
