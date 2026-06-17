import fs from 'fs'
import path from 'path'
import { EXAMS_REGISTRY } from '@/lib/types/exams-registry'
import { ExamMeta } from '@/lib/types'

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'exams')

export function getAvailableExams(): ExamMeta[] {
  if (!fs.existsSync(CONTENT_ROOT)) return []
  const dirs = fs.readdirSync(CONTENT_ROOT).filter(d => fs.statSync(path.join(CONTENT_ROOT, d)).isDirectory())
  const set = new Set(dirs)
  return EXAMS_REGISTRY.filter(e => set.has(e.id))
}
