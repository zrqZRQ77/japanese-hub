import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { GuideFrontmatter } from '../types'

const CONTENT_ROOT = path.join(/*turbopackIgnore: true*/ process.cwd(), 'content', 'exams')

type HastNode = {
  type?: string
  tagName?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

function getTableColumnCount(node: HastNode): number {
  if (!node.children) return 0

  let max = 0
  const walk = (child: HastNode) => {
    if (child.type === 'element' && child.tagName === 'tr') {
      const count = child.children?.filter(cell =>
        cell.type === 'element' && (cell.tagName === 'th' || cell.tagName === 'td')
      ).length ?? 0
      max = Math.max(max, count)
    }
    child.children?.forEach(walk)
  }

  node.children.forEach(walk)
  return max
}

function getTextContent(node: HastNode): string {
  const value = (node as HastNode & { value?: string }).value
  if (typeof value === 'string') return value
  return node.children?.map(getTextContent).join('') ?? ''
}

function markSummaryRows(table: HastNode) {
  const walk = (node: HastNode) => {
    if (node.type === 'element' && node.tagName === 'tr') {
      const firstCell = node.children?.find(child =>
        child.type === 'element' && (child.tagName === 'th' || child.tagName === 'td')
      )
      const firstText = firstCell ? getTextContent(firstCell).trim() : ''

      if (firstText === '合計') {
        const className = node.properties?.className
        node.properties = {
          ...node.properties,
          className: Array.isArray(className) ? [...className, 'mdx-summary-row'] : ['mdx-summary-row'],
        }
      }
    }

    node.children?.forEach(walk)
  }

  walk(table)
}

const JOURNAL_TABLE_HEADERS = ['借方科目', '借方金額', '貸方科目', '貸方金額']

function isJournalTable(table: HastNode): boolean {
  const headerRow = table.children
    ?.find(c => c.type === 'element' && c.tagName === 'thead')
    ?.children?.find(c => c.type === 'element' && c.tagName === 'tr')
  if (!headerRow) return false

  const headerTexts = (headerRow.children ?? [])
    .filter(c => c.type === 'element' && c.tagName === 'th')
    .map(c => getTextContent(c).trim())

  return headerTexts.length === JOURNAL_TABLE_HEADERS.length
    && headerTexts.every((text, i) => text === JOURNAL_TABLE_HEADERS[i])
}

function rehypeTableFrames() {
  return (tree: HastNode) => {
    const visit = (node: HastNode) => {
      if (!node.children) return

      node.children = node.children.map(child => {
        if (child.type === 'element' && child.tagName === 'table') {
          const journalTable = isJournalTable(child)
          const className = journalTable ? ['mdx-table-frame', 'mdx-journal-table'] : ['mdx-table-frame']
          markSummaryRows(child)
          if (!journalTable && getTableColumnCount(child) >= 6) className.push('mdx-wide-table')

          return {
            type: 'element',
            tagName: 'div',
            properties: { className },
            children: [child],
          }
        }

        visit(child)
        return child
      })
    }

    visit(tree)
  }
}

export async function getGuideContent(examId: string, chapterId: string, sectionId: string) {
  const filePath = path.join(CONTENT_ROOT, examId, 'guide', chapterId, `${sectionId}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content: rawContent } = matter(raw)
  const content = rawContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeTableFrames)
    .use(rehypeStringify, { allowDangerousHtml: true })
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
