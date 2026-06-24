import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ArrowRight,
  BookOpen,
  Check,
  Layers3,
  PencilLine,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import SiteFooter from '@/components/layout/SiteFooter'
import { getAvailableExams } from '@/lib/content/exams-loader'
import { getAllQuestionSets } from '@/lib/content/question-loader'
import { getChaptersByExam } from '@/lib/types/chapters-registry'
import { createPageMetadata } from '@/lib/seo'
import styles from './home.module.css'

export const metadata: Metadata = createPageMetadata({
  title: '資格合格ナビ — 無料で学ぶ日本の資格',
  description: '日商簿記3級、FP3級、ITパスポートを無料で学べる資格学習サイト。学習ガイド、練習問題、知識カードで効率よく復習できます。',
  path: '/',
})

const TOOLS = [
  { icon: BookOpen, title: '学習ガイド', desc: '試験範囲を章ごとに整理。基礎から順序よく理解できます。' },
  { icon: PencilLine, title: '練習問題', desc: '学んだ内容をすぐに確認。回答結果は端末に保存されます。' },
  { icon: Layers3, title: '知識カード', desc: '重要語句を短時間で反復。移動中の復習にも使えます。' },
]

const EXAM_MARKS: Record<string, string> = {
  boki3: 'BK',
  fp3: 'FP',
  itp: 'IT',
}

export default function HomePage() {
  const exams = getAvailableExams()
  const examStats = exams.map(exam => {
    const chapters = getChaptersByExam(exam.id)
    const questionCount = getAllQuestionSets(exam.id)
      .reduce((sum, set) => sum + set.questions.length, 0)

    return {
      exam,
      chapterCount: chapters.length,
      sectionCount: chapters.reduce((sum, chapter) => sum + chapter.sections.length, 0),
      questionCount,
    }
  })
  const totalSections = examStats.reduce((sum, item) => sum + item.sectionCount, 0)
  const totalQuestions = examStats.reduce((sum, item) => sum + item.questionCount, 0)

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={`container-page ${styles.heroInner}`}>
            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}>日本の資格を、ひとつずつ確実に。</div>
              <h1>
                <span className={styles.heroLead}>3つの資格を、</span>
                <span className={styles.heroAccent}>深く学べる場所。</span>
              </h1>
              <p>
                日商簿記3級・FP3級・ITパスポートに絞り、学習ガイド・練習問題・知識カードを無料で公開しています。
                対象資格は、内容の質を保ちながら順次追加していきます。
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
                  <span>対応資格</span>
                  <h2>現在公開中の3資格</h2>
                </div>
                <strong>{exams.length}種</strong>
              </div>
              <div className={styles.indexList}>
                {examStats.map(({ exam, chapterCount, questionCount }) => (
                  <Link href={`/exams/${exam.id}`} key={exam.id}>
                    <span className={styles.examMark}>{EXAM_MARKS[exam.id] ?? exam.shortName.slice(0, 2)}</span>
                    <span className={styles.indexExamText}>
                      <strong>{exam.shortName}</strong>
                      <small>{chapterCount}章 / {questionCount}問</small>
                    </span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <div className={styles.indexFooter}>
                まずはこの3資格を、迷わず学べる形に整えています。
              </div>
            </div>
          </div>
        </section>

        <section className={styles.trustSection} aria-label="公開中の教材情報">
          <div className="container-page">
            <div className={styles.trustGrid}>
              <div>
                <span>対応資格</span>
                <strong>{exams.length}種</strong>
              </div>
              <div>
                <span>教材小節</span>
                <strong>{totalSections}節</strong>
              </div>
              <div>
                <span>練習問題</span>
                <strong>{totalQuestions}問</strong>
              </div>
              <div>
                <span>利用条件</span>
                <strong>無料</strong>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.toolsSection} aria-labelledby="tools-heading">
          <div className="container-page">
            <div className={styles.sectionHeading}>
              <div>
                <span>学習機能</span>
                <h2 id="tools-heading">読む・解く・覚えるを一つの流れに</h2>
              </div>
              <p>教材で理解し、問題で確認し、カードで復習する。資格学習に必要な基本動作をひとつにまとめています。</p>
            </div>

            <div className={styles.toolGrid}>
              {TOOLS.map(tool => {
                const Icon = tool.icon
                return (
                  <article className={styles.toolItem} key={tool.title}>
                    <div className={styles.toolMeta}>
                      <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <h3>{tool.title}</h3>
                    <p>{tool.desc}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  )
}
