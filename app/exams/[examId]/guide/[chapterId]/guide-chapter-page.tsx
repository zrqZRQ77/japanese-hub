// ============================================================
// 学習ガイド 章ページ  /exams/[examId]/guide/[chapterId]
// MDXファイルを読み込んで動的レンダリング
// ============================================================
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import GuideSidebar from '@/components/layout/GuideSidebar'
import GuideContent from '@/components/features/guide/GuideContent'
import { getExamById } from '@/lib/types/exams-registry'
import { getChaptersByExam, getChapterById } from '@/lib/types/chapters-registry'
import { getGuideContent, getAllGuideSections } from '@/lib/content/guide-loader'

interface Props {
  params: Promise<{ examId: string; chapterId: string }>
  searchParams: Promise<{ section?: string }>
}

export default async function GuideChapterPage({ params, searchParams }: Props) {
  const { examId, chapterId } = await params
  const { section: sectionParam } = await searchParams

  const exam = getExamById(examId)
  if (!exam) notFound()

  const chapters = getChaptersByExam(examId)
  const chapter = getChapterById(examId, chapterId)
  if (!chapter) notFound()

  // URLパラメータ ?section=ch1-s2 に対応、なければ最初のセクション
  const sections = getAllGuideSections(examId, chapterId)
  const firstSection = sections[0]
  const activeSection = (sectionParam && sections.includes(sectionParam))
    ? sectionParam
    : firstSection

  const guideData = activeSection
    ? await getGuideContent(examId, chapterId, activeSection)
    : null

  // 前後章リンク
  const chapterIndex = chapters.findIndex(c => c.id === chapterId)
  const prevChapter = chapters[chapterIndex - 1]
  const nextChapter = chapters[chapterIndex + 1]

  const base = `/exams/${examId}`

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        {/* 学習ガイド内では ExamSidebar を非表示 */}

        {/* ガイドコンテンツエリア */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <GuideSidebar
            examId={examId}
            chapters={chapters}
            currentChapterId={chapterId}
            currentSectionId={activeSection}
            progress={25}
          />

          {guideData ? (
            <GuideContent
              frontmatter={guideData.frontmatter}
              contentHtml={guideData.contentHtml}
              chapter={chapter}
              sections={chapter.sections}
              currentSectionId={activeSection ?? firstSection ?? chapter.sections[0]?.id ?? ''}
              examId={examId}
              prevLink={prevChapter
                ? { href: `${base}/guide/${prevChapter.id}`, label: `第${prevChapter.number}章` }
                : undefined}
              nextLink={nextChapter
                ? { href: `${base}/guide/${nextChapter.id}`, label: `第${nextChapter.number}章 ${nextChapter.title}` }
                : undefined}
            />
          ) : (
            /* コンテンツ未作成時のフォールバック */
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: '#fff', color: 'var(--color-text-secondary)',
              gap: 12,
            }}>
              <div style={{ fontSize: '3rem' }}>📖</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                第{chapter.number}章 {chapter.title}
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                このチャプターのコンテンツは準備中です。
              </div>
              {nextChapter && (
                <a href={`${base}/guide/${nextChapter.id}`} style={{
                  marginTop: 8, padding: '9px 20px',
                  background: 'var(--color-primary)', color: '#fff',
                  borderRadius: 'var(--radius-sm)', fontWeight: 700,
                  fontSize: '0.875rem', textDecoration: 'none',
                }}>次の章へ →</a>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
