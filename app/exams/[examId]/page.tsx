// ============================================================
// 試験ダッシュボード  /exams/[examId]
// （从 page-new.tsx 提取，并包含 ExamInfoSection 的集成）
// ============================================================
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import ExamSidebar from '@/components/layout/ExamSidebar'
import DashboardProgress from '@/components/features/dashboard/DashboardProgress'
import ExamInfoSection from '@/components/features/dashboard/ExamInfoSection'
import ExamFaqSection from '@/components/features/dashboard/ExamFaqSection'
import AdSlot from '@/components/monetization/AdSlot'
import AffiliateRecommendations from '@/components/monetization/AffiliateRecommendations'
import { getExamById, isMockExamPublic } from '@/lib/types/exams-registry'
import { getChaptersByExam } from '@/lib/types/chapters-registry'
import { createPageMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ examId: string }>
}): Promise<Metadata> {
  const { examId } = await params
  const exam = getExamById(examId)
  if (!exam) return createPageMetadata({ title: '資格ページ', path: `/exams/${examId}`, noIndex: true })

  return createPageMetadata({
    title: `${exam.shortName} 学習ダッシュボード`,
    description: `${exam.name}の学習ガイド、練習問題、知識カード${isMockExamPublic(exam) ? '、模擬試験' : ''}を無料で利用できます。${exam.description}`,
    path: `/exams/${examId}`,
  })
}

export default async function ExamDashboardPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const exam = getExamById(examId)
  if (!exam) notFound()

  const chapters = getChaptersByExam(examId)

  return (
    <>
      <Navbar />
      <div className="exam-shell" style={{
        display: 'flex',
        height: 'calc(100vh - 60px)',
        overflow: 'hidden',
      }}>
        <ExamSidebar exam={exam} />

        {/* メインコンテンツ */}
        <main className="exam-dashboard-main" style={{
          flex: 1, overflowY: 'auto',
          background: 'var(--color-bg-subtle)',
          padding: '32px',
        }}>
          {/* 全体進捗ヘッダー（個人の学習状況を最優先で表示） */}
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 16 }}>
            全体の学習進捗
          </h2>
          <DashboardProgress
            examId={examId}
            chapters={chapters}
            totalChapters={exam.totalChapters}
          />

          {/* 試験概要セクション（ExamInfo、自身のヘッダーで見出しを表示） */}
          <div style={{ marginTop: 32 }}>
            <ExamInfoSection exam={exam} />
          </div>

          {/* よくある質問（難易度・合格率などをQ&A形式で補足） */}
          <ExamFaqSection exam={exam} />

          <AffiliateRecommendations exam={exam} />
          <AdSlot
            slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_EXAM_SECONDARY}
            label="広告"
          />
        </main>
      </div>
    </>
  )
}
