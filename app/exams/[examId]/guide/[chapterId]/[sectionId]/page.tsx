import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import GuideSidebar from '@/components/layout/GuideSidebar'
import GuideContent from '@/components/features/guide/GuideContent'
import { getExamById } from '@/lib/types/exams-registry'
import { getChaptersByExam, getChapterById } from '@/lib/types/chapters-registry'
import { getGuideContent, getAllGuideSections } from '@/lib/content/guide-loader'
import { absoluteUrl, createPageMetadata } from '@/lib/seo'

interface Props {
  params: Promise<{ examId: string; chapterId: string; sectionId: string }>
}

function createDescription(content: string, fallback: string) {
  const plain = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[>*_|~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!plain) return fallback
  return plain.length > 155 ? `${plain.slice(0, 154)}…` : plain
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { examId, chapterId, sectionId } = await params
  const exam = getExamById(examId)
  const chapter = getChapterById(examId, chapterId)
  const guideData = exam && chapter
    ? await getGuideContent(examId, chapterId, sectionId)
    : null
  const path = `/exams/${examId}/guide/${chapterId}/${sectionId}`

  if (!exam || !chapter || !guideData) {
    return createPageMetadata({ title: '学習ガイド', path, noIndex: true })
  }

  const title = `${guideData.frontmatter.sectionTitle}｜${exam.shortName} 第${chapter.number}章`
  const fallback = `${exam.name}の第${chapter.number}章「${chapter.title}」にある「${guideData.frontmatter.sectionTitle}」を、例題と仕訳・計算手順で学べる無料教材です。`

  return createPageMetadata({
    title,
    description: createDescription(guideData.content, fallback),
    path,
  })
}

export default async function GuideSectionPage({ params }: Props) {
  const { examId, chapterId, sectionId } = await params
  const exam = getExamById(examId)
  const chapter = getChapterById(examId, chapterId)
  if (!exam || !chapter) notFound()

  const sections = getAllGuideSections(examId, chapterId)
  if (!sections.includes(sectionId)) notFound()

  const guideData = await getGuideContent(examId, chapterId, sectionId)
  if (!guideData) notFound()

  const chapters = getChaptersByExam(examId)
  const flatSections = chapters.flatMap(currentChapter =>
    getAllGuideSections(examId, currentChapter.id).map(currentSectionId => {
      const sectionMeta = currentChapter.sections.find(section => section.id === currentSectionId)
      return {
        chapterId: currentChapter.id,
        sectionId: currentSectionId,
        label: sectionMeta ? `${sectionMeta.number} ${sectionMeta.title}` : currentSectionId,
      }
    })
  )
  const currentIndex = flatSections.findIndex(
    section => section.chapterId === chapterId && section.sectionId === sectionId
  )
  const prevSection = currentIndex > 0 ? flatSections[currentIndex - 1] : undefined
  const nextSection = currentIndex >= 0 && currentIndex < flatSections.length - 1
    ? flatSections[currentIndex + 1]
    : undefined
  const base = `/exams/${examId}`
  const currentPath = `${base}/guide/${chapterId}/${sectionId}`

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '資格合格ナビ',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: exam.shortName,
        item: absoluteUrl(base),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: '学習ガイド',
        item: absoluteUrl(`${base}/guide`),
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: `${guideData.frontmatter.sectionNumber} ${guideData.frontmatter.sectionTitle}`,
        item: absoluteUrl(currentPath),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <Navbar />
      <div className="guide-page-shell" style={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
        background: 'var(--color-bg-subtle)',
      }}>
        <div className="guide-layout" style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          minWidth: 0,
          overflow: 'hidden',
        }}>
          <GuideSidebar
            key={chapterId}
            examId={examId}
            chapters={chapters}
            currentChapterId={chapterId}
            currentSectionId={sectionId}
          />
          <GuideContent
            key={`${chapterId}-${sectionId}`}
            frontmatter={guideData.frontmatter}
            contentHtml={guideData.contentHtml}
            chapter={chapter}
            sections={chapter.sections}
            currentSectionId={sectionId}
            examId={examId}
            examShortName={exam.shortName}
            prevLink={prevSection
              ? {
                  href: `${base}/guide/${prevSection.chapterId}/${prevSection.sectionId}`,
                  label: prevSection.label,
                }
              : undefined}
            nextLink={nextSection
              ? {
                  href: `${base}/guide/${nextSection.chapterId}/${nextSection.sectionId}`,
                  label: nextSection.label,
                }
              : undefined}
          />
        </div>
      </div>
    </>
  )
}
