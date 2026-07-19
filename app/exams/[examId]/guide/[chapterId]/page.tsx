import { notFound, permanentRedirect } from 'next/navigation'
import { getExamById } from '@/lib/types/exams-registry'
import { getChapterById } from '@/lib/types/chapters-registry'
import { getAllGuideSections } from '@/lib/content/guide-loader'

interface Props {
  params: Promise<{ examId: string; chapterId: string }>
  searchParams: Promise<{ section?: string }>
}

export default async function LegacyGuideChapterPage({ params, searchParams }: Props) {
  const { examId, chapterId } = await params
  const { section } = await searchParams
  const exam = getExamById(examId)
  const chapter = getChapterById(examId, chapterId)
  if (!exam || !chapter) notFound()

  const sections = getAllGuideSections(examId, chapterId)
  const targetSection = section && sections.includes(section) ? section : sections[0]
  if (!targetSection) notFound()

  permanentRedirect(`/exams/${examId}/guide/${chapterId}/${targetSection}`)
}
