import type { MetadataRoute } from 'next'
import { getChaptersByExam } from '@/lib/types/chapters-registry'
import { getAvailableExams } from '@/lib/content/exams-loader'
import { getGuideFrontmatter } from '@/lib/content/guide-loader'
import { isMockExamPublic } from '@/lib/types/exams-registry'
import { absoluteUrl } from '@/lib/seo'

const STATIC_PATHS = [
  '/',
  '/exams',
  '/guide',
  '/practice',
  '/cards',
  '/privacy',
  '/operator',
  '/contact',
  '/disclaimer',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const urls: MetadataRoute.Sitemap = STATIC_PATHS.map(path => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }))

  for (const exam of getAvailableExams()) {
    const examBase = `/exams/${exam.id}`
    urls.push(
      {
        url: absoluteUrl(examBase),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: absoluteUrl(`${examBase}/guide`),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.85,
      },
      {
        url: absoluteUrl(`${examBase}/questions`),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.85,
      },
      {
        url: absoluteUrl(`${examBase}/cards`),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.75,
      }
    )

    // 模擬試験は正式公開中の試験のみ掲載する
    if (isMockExamPublic(exam)) {
      urls.push({
        url: absoluteUrl(`${examBase}/mock-exam`),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.65,
      })
    }

    for (const chapter of getChaptersByExam(exam.id)) {
      for (const section of chapter.sections) {
        const frontmatter = getGuideFrontmatter(exam.id, chapter.id, section.id)
        const updatedAt = frontmatter?.updatedAt ? new Date(frontmatter.updatedAt) : now
        urls.push({
          url: absoluteUrl(`${examBase}/guide/${chapter.id}/${section.id}`),
          lastModified: updatedAt,
          changeFrequency: 'monthly',
          priority: 0.78,
        })
      }

      urls.push({
        url: absoluteUrl(`${examBase}/questions/${chapter.id}`),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.76,
      })
    }
  }

  return urls
}
