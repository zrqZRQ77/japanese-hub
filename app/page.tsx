import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ArrowRight,
  Bot,
  BookOpen,
  Check,
  Clock3,
  Layers3,
  PencilLine,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import SiteFooter from '@/components/layout/SiteFooter'
import { getAvailableExams } from '@/lib/content/exams-loader'
import { createPageMetadata } from '@/lib/seo'
import styles from './home.module.css'

export const metadata: Metadata = createPageMetadata({
  title: '資格合格ナビ — 無料で学ぶ日本の資格',
  description: '日商簿記3級、FP3級、ITパスポートを無料で学べる資格学習サイト。学習ガイド、練習問題、知識カードで効率よく復習できます。',
  path: '/',
})

const TOOLS = [
  { icon: BookOpen, number: '01', title: '学習ガイド', desc: '試験範囲を章ごとに整理。基礎から順序よく理解できます。' },
  { icon: PencilLine, number: '02', title: '練習問題', desc: '学んだ内容をすぐに確認。回答結果は端末に保存されます。' },
  { icon: Layers3, number: '03', title: '知識カード', desc: '重要語句を短時間で反復。移動中の復習にも使えます。' },
  { icon: Bot, number: '04', title: 'AI質問', desc: '分からない点をその場で質問。学習の停滞を減らします。' },
]

const EXAM_MARKS: Record<string, string> = {
  boki3: 'BK',
  fp3: 'FP',
  itp: 'IT',
}

export default function HomePage() {
  const exams = getAvailableExams()

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={`container-page ${styles.heroInner}`}>
            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}>日本の資格を、ひとつずつ確実に。</div>
              <h1>
                <span className={styles.heroLead}>合格までの学びを、</span>
                <span className={styles.heroAccent}>静かに整える。</span>
              </h1>
              <p>
                日商簿記3級・FP3級・ITパスポートに対応。
                教材、練習問題、知識カードをひとつの場所で無料で利用できます。
              </p>
              <div className={styles.heroActions}>
                <Link className={styles.primaryAction} href="/exams">
                  学ぶ資格を選ぶ
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <Link className={styles.secondaryAction} href="/guide">
                  学習ガイドを見る
                </Link>
              </div>
              <div className={styles.heroNotes} aria-label="サービスの特徴">
                <span><Check size={14} />登録不要</span>
                <span><Check size={14} />全教材無料</span>
                <span><Check size={14} />進捗を端末に保存</span>
              </div>
            </div>

            <div className={styles.studyIndex} aria-label="対応資格一覧">
              <div className={styles.signatureLine} aria-hidden="true"><span /></div>
              <div className={styles.indexHeader}>
                <div>
                  <span>STUDY INDEX</span>
                  <h2>学習できる資格</h2>
                </div>
                <strong>{String(exams.length).padStart(2, '0')}</strong>
              </div>
              <div className={styles.indexList}>
                {exams.map((exam, index) => (
                  <Link href={`/exams/${exam.id}`} key={exam.id}>
                    <span className={styles.examMark}>{EXAM_MARKS[exam.id] ?? String(index + 1).padStart(2, '0')}</span>
                    <span className={styles.indexExamText}>
                      <strong>{exam.name}</strong>
                      <small>{exam.category}</small>
                    </span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <div className={styles.indexFooter}>
                <Clock3 size={15} aria-hidden="true" />
                好きな時間に、続きから学習できます
              </div>
            </div>
          </div>
        </section>

        <section className={styles.examsSection} aria-labelledby="exam-heading">
          <div className="container-page">
            <div className={styles.sectionHeading}>
              <div>
                <span>EXAMINATIONS</span>
                <h2 id="exam-heading">対応試験</h2>
              </div>
              <p>いま必要な資格を選び、章ごとの学習を始められます。</p>
            </div>

            <div className={styles.examGrid}>
              {exams.map((exam, index) => (
                <Link className={styles.examCard} key={exam.id} href={`/exams/${exam.id}`}>
                  <div className={styles.examCardTop}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <small>{exam.category}</small>
                  </div>
                  <div>
                    <h3>{exam.name}</h3>
                    <p>{exam.description}</p>
                  </div>
                  <div className={styles.examCardAction}>
                    学習を始める
                    <ArrowRight size={16} aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.toolsSection} aria-labelledby="tools-heading">
          <div className="container-page">
            <div className={styles.sectionHeading}>
              <div>
                <span>LEARNING TOOLS</span>
                <h2 id="tools-heading">学ぶ、解く、覚える</h2>
              </div>
              <p>理解と定着を往復できる、4つの学習機能を用意しています。</p>
            </div>

            <div className={styles.toolGrid}>
              {TOOLS.map(tool => {
                const Icon = tool.icon
                return (
                  <article className={styles.toolItem} key={tool.title}>
                    <div className={styles.toolMeta}>
                      <span>{tool.number}</span>
                      <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <h3>{tool.title}</h3>
                    <p>{tool.desc}</p>
                  </article>
                )
              })}
            </div>

            <div className={styles.closingBand}>
              <div>
                <span>START LEARNING</span>
                <h2>今日の一章から、始めよう。</h2>
              </div>
              <Link href="/exams">
                資格一覧へ
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  )
}
