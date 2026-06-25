'use client'

import { ExamMeta } from '@/lib/types'
import { ArrowUpRight, BookOpen, Check, MonitorPlay, ShieldCheck } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

interface AffiliateRecommendationsProps {
  exam: ExamMeta
}

const amazonAssociateTag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim()

function withAmazonAssociateTag(url: string): string {
  if (!amazonAssociateTag) return url

  try {
    const parsed = new URL(url)
    if (!parsed.hostname.endsWith('amazon.co.jp')) return url
    parsed.searchParams.set('tag', amazonAssociateTag)
    return parsed.toString()
  } catch {
    return url
  }
}

export default function AffiliateRecommendations({ exam }: AffiliateRecommendationsProps) {
  const info = exam.info
  if (!info) return null

  const freeCourses = info.courses.filter(course => course.isFree && !course.isAffiliate)
  const affiliateCourses = info.courses.filter(course => course.isAffiliate).slice(0, 2)
  const books = info.books.slice(0, 2)
  const hasAmazonAffiliateLinks = Boolean(amazonAssociateTag) && books.length > 0
  const hasSponsoredItems = affiliateCourses.length > 0 || hasAmazonAffiliateLinks

  if (freeCourses.length === 0 && affiliateCourses.length === 0 && books.length === 0) return null

  return (
    <section className="affiliate-section" aria-labelledby="affiliate-heading">
      <div className="affiliate-section__heading">
        <div>
          <div className="affiliate-section__eyebrow">
            学習サービス・教材
          </div>
          <h2 id="affiliate-heading">学習をもう一段進めたい方へ</h2>
          <p>無料サービスから、独学の補助に使いやすい講座・教材まで、学習スタイル別にまとめました。</p>
        </div>
        <div className="affiliate-section__trust">
          <ShieldCheck size={17} />
          掲載基準を明示して紹介
        </div>
      </div>

      <div className="affiliate-grid">
        {freeCourses.map(course => (
          <a
            className="affiliate-card affiliate-card--course"
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            key={course.title}
            onClick={() => trackEvent('affiliate_click', {
              exam_id: exam.id,
              content_type: 'course',
              provider: course.provider,
              item_name: course.title,
            })}
          >
            <div className="affiliate-card__topline">
              <span className="affiliate-card__icon"><MonitorPlay size={19} /></span>
              <span className="affiliate-card__type">オンライン講座</span>
              <span className="affiliate-card__pick affiliate-card__pick--free">無料</span>
            </div>
            <div className="affiliate-card__provider">{course.provider}</div>
            <h3>{course.title}</h3>
            <p>{course.note}</p>
            <div className="affiliate-card__fit">
              <Check size={15} />
              まず無料で試したい方に
            </div>
            <span className="affiliate-card__action">
              公式サイトで確認 <ArrowUpRight size={16} />
            </span>
          </a>
        ))}

        {affiliateCourses.map(course => (
          <a
            className="affiliate-card affiliate-card--course"
            href={course.url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            key={course.title}
            onClick={() => trackEvent('affiliate_click', {
              exam_id: exam.id,
              content_type: 'course',
              provider: course.provider,
              item_name: course.title,
            })}
          >
            <div className="affiliate-card__topline">
              <span className="affiliate-card__icon"><MonitorPlay size={19} /></span>
              <span className="affiliate-card__type">オンライン講座</span>
              <span className="affiliate-card__pick">PR</span>
            </div>
            <div className="affiliate-card__provider">{course.provider}</div>
            <h3>{course.title}</h3>
            <p>{course.note}</p>
            <div className="affiliate-card__fit">
              <Check size={15} />
              動画で効率よく学びたい方に
            </div>
            <span className="affiliate-card__action">
              公式サイトで確認 <ArrowUpRight size={16} />
            </span>
          </a>
        ))}

        {books.map(book => (
          <a
            className="affiliate-card affiliate-card--book"
            href={withAmazonAssociateTag(book.amazonUrl)}
            target="_blank"
            rel={hasAmazonAffiliateLinks ? 'sponsored noopener noreferrer' : 'noopener noreferrer'}
            key={book.title}
            onClick={() => trackEvent('affiliate_click', {
              exam_id: exam.id,
              content_type: 'book',
              provider: 'Amazon',
              item_name: book.title,
            })}
          >
            <div className="affiliate-card__topline">
              <span className="affiliate-card__icon"><BookOpen size={19} /></span>
              <span className="affiliate-card__type">{book.type}</span>
              <span className="affiliate-card__pick">{hasAmazonAffiliateLinks ? 'PR' : '教材'}</span>
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

      {hasSponsoredItems && (
        <p className="affiliate-section__disclosure">
          ※「PR」表示の項目は成果報酬型広告を含みます。Amazonのアソシエイトとして、資格合格ナビは適格販売により収入を得ています。
        </p>
      )}
    </section>
  )
}
