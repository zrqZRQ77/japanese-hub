import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { GuideFrontmatter } from '../types'

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'exams')

export async function getGuideContent(examId: string, chapterId: string, sectionId: string) {
  const filePath = path.join(CONTENT_ROOT, examId, 'guide', chapterId, `${sectionId}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(content)
  return {
    frontmatter: data as GuideFrontmatter,
    content,
    contentHtml: processed.toString(),
  }
}

export function getAllGuideSections(examId: string, chapterId: string): string[] {
  const dir = path.join(CONTENT_ROOT, examId, 'guide', chapterId)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace('.mdx', ''))
    .sort()
}

export function getFirstSection(examId: string, chapterId: string): string | null {
  const sections = getAllGuideSections(examId, chapterId)
  return sections[0] ?? null
}