import { ExamMeta } from '@/lib/types'
import { ArrowUpRight, BookOpen, Check, MonitorPlay, ShieldCheck } from 'lucide-react'

interface AffiliateRecommendationsProps {
  exam: ExamMeta
}

export default function AffiliateRecommendations({ exam }: AffiliateRecommendationsProps) {
  const info = exam.info
  if (!info) return null

  const courses = info.courses.filter(course => course.isAffiliate).slice(0, 2)
  const books = info.books.slice(0, 2)

  if (courses.length === 0 && books.length === 0) return null

  return (
    <section className="affiliate-section" aria-labelledby="affiliate-heading">
      <div className="affiliate-section__heading">
        <div>
          <div className="affiliate-section__eyebrow">
            <span>PR</span>
            学習サービス・教材
          </div>
          <h2 id="affiliate-heading">学習をもう一段進めたい方へ</h2>
          <p>独学の補助として使いやすい講座と教材を、学習スタイル別にまとめました。</p>
        </div>
        <div className="affiliate-section__trust">
          <ShieldCheck size={17} />
          掲載基準を明示して紹介
        </div>
      </div>

      <div className="affiliate-grid">
        {courses.map((course, index) => (
          <a
            className="affiliate-card affiliate-card--course"
            href={course.url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            key={course.title}
          >
            <div className="affiliate-card__topline">
              <span className="affiliate-card__icon"><MonitorPlay size={19} /></span>
              <span className="affiliate-card__type">オンライン講座</span>
              {index === 0 && <span className="affiliate-card__pick">おすすめ</span>}
            </div>
            <div className="affiliate-card__provider">{course.provider}</div>
            <h3>{course.title}</h3>
            <p>{course.note}</p>
            <div className="affiliate-card__fit">
              <Check size={15} />
              {course.isFree ? 'まず無料で試したい方に' : '動画で効率よく学びたい方に'}
            </div>
            <span className="affiliate-card__action">
              公式サイトで確認 <ArrowUpRight size={16} />
            </span>
          </a>
        ))}

        {books.map(book => (
          <a
            className="affiliate-card affiliate-card--book"
            href={book.amazonUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            key={book.title}
          >
            <div className="affiliate-card__topline">
              <span className="affiliate-card__icon"><BookOpen size={19} /></span>
              <span className="affiliate-card__type">{book.type}</span>
            </div>
            <div className="affiliate-card__provider">Amazon</div>
            <h3>{book.title}</h3>
            <p>{book.note}</p>
            <div className="affiliate-card__fit">
              <Check size={15} />
              手元の教材でじっくり進めたい方に
            </div>
            <span className="affiliate-card__action">
              書籍を確認 <ArrowUpRight size={16} />
            </span>
          </a>
        ))}
      </div>

      <p className="affiliate-section__disclosure">
        当サイトはアフィリエイト広告を利用しています。リンク先で購入・申込みが成立した場合、当サイトが紹介料を受け取ることがあります。利用者の支払額に影響はありません。
      </p>
    </section>
  )
}
