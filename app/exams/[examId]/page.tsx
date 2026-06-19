// ============================================================
// 試験ダッシュボード  /exams/[examId]
// （从 page-new.tsx 提取，并包含 ExamInfoSection 的集成）
// ============================================================
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import ExamSidebar from '@/components/layout/ExamSidebar'
import DashboardProgress from '@/components/features/dashboard/DashboardProgress'
import ToolCard from '@/components/features/dashboard/ToolCard'
import ExamInfoSection from '@/components/features/dashboard/ExamInfoSection'
import { getExamById } from '@/lib/types/exams-registry'
import { getChaptersByExam } from '@/lib/types/chapters-registry'

const TOOLS = [
  {
    icon: '📖', title: '学習ガイド', color: 'var(--color-primary)',
    desc: '各章の解説を読んで基礎を理解する',
    linkLabel: '章一覧を見る', path: '/guide',
  },
  {
    icon: '✏️', title: '練習問題', color: '#7c3aed',
    desc: '章ごとの問題を解いて理解を確認する',
    linkLabel: '問題一覧を見る', path: '/questions',
  },
  {
    icon: '🃏', title: '知識カード', color: '#0891b2',
    desc: '重要ポイントをカードで覚える',
    linkLabel: 'カード一覧を見る', path: '/cards',
  },
  {
    icon: '📋', title: '模擬試験', color: '#d97706',
    desc: '本番形式の試験で実力を試す',
    linkLabel: '模擬試験を受ける', path: '/mock-exam',
  },
]

export default async function ExamDashboardPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const exam = getExamById(examId)
  if (!exam) notFound()

  const chapters = getChaptersByExam(examId)
  const base = `/exams/${examId}`

  return (
    <>
      <Navbar />
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 60px)',
        overflow: 'hidden',
      }}>
        <ExamSidebar exam={exam} />

        {/* メインコンテンツ */}
        <main style={{
          flex: 1, overflowY: 'auto',
          background: 'var(--color-bg-subtle)',
          padding: '32px',
        }}>
          {/* 試験概要セクション（ExamInfo） */}
          <ExamInfoSection exam={exam} />

          {/* 全体進捗ヘッダー */}
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 16 }}>
            全体の学習進捗
          </h2>
          <DashboardProgress
            examId={examId}
            chapters={chapters}
            totalChapters={exam.totalChapters}
          />

          {/* 学習コンテンツ 4グリッド */}
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 14, marginTop: 32 }}>学習コンテンツ</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 14, marginBottom: 32,
          }}>
            {TOOLS.map(t => (
              <ToolCard
                key={t.title}
                icon={t.icon}
                title={t.title}
                desc={t.desc}
                linkLabel={t.linkLabel}
                href={`${base}${t.path}`}
                color={t.color}
              />
            ))}
          </div>
        </main>
      </div>
    </>
  )
}
