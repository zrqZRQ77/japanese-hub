import type { PracticeField, PracticeInputKind } from '@/lib/types'

export interface PracticeFieldResult {
  id: string
  value: string
  normalizedValue: string
  correctAnswer: string
  isCorrect: boolean
}

export interface PracticeGradeResult {
  isCorrect: boolean
  correctCount: number
  totalCount: number
  fields: PracticeFieldResult[]
}

function normalizeBase(value: string) {
  return value
    .normalize('NFKC')
    .trim()
    .replace(/[\s　]+/g, '')
    .replace(/[‐‑‒–—―−]/g, '-')
}

function normalizeNumber(value: string) {
  const normalized = normalizeBase(value)
    .replace(/[，,]/g, '')
    .replace(/[¥￥円]/g, '')
    .replace(/^\+/, '')

  if (/^-?\d+(?:\.0+)?$/.test(normalized)) {
    return String(Number(normalized))
  }
  return normalized
}

function normalizeAccount(value: string) {
  return normalizeBase(value)
    .replace(/[・･]/g, '')
    .replace(/勘定$/, '')
}

function normalizeSide(value: string) {
  const normalized = normalizeBase(value).toLowerCase()
  if (['借', '借方', 'debit', 'dr', 'd'].includes(normalized)) return '借方'
  if (['貸', '貸方', 'credit', 'cr', 'c'].includes(normalized)) return '貸方'
  return normalized
}

function normalizeClassification(value: string) {
  const normalized = normalizeBase(value).toUpperCase().replace(/[／/・･]/g, '')
  if (['PL', '損益計算書', '損益'].includes(normalized)) return 'P/L'
  if (['BS', '貸借対照表', '貸借'].includes(normalized)) return 'B/S'
  return normalized
}

export function normalizePracticeAnswer(value: string, kind: PracticeInputKind) {
  if (kind === 'number') return normalizeNumber(value)
  if (kind === 'account') return normalizeAccount(value)
  if (kind === 'side') return normalizeSide(value)
  if (kind === 'classification') return normalizeClassification(value)
  return normalizeBase(value)
}

export function getAcceptedPracticeAnswers(field: PracticeField) {
  return Array.from(new Set([
    field.correctAnswer,
    ...(field.acceptedAnswers ?? []),
  ].map(answer => normalizePracticeAnswer(answer, field.kind))))
}

export function isPracticeFieldCorrect(field: PracticeField, value: string) {
  const normalizedValue = normalizePracticeAnswer(value, field.kind)
  return normalizedValue !== '' && getAcceptedPracticeAnswers(field).includes(normalizedValue)
}

export function gradePracticeAnswers(fields: PracticeField[], values: Record<string, string>): PracticeGradeResult {
  const fieldResults = fields.map(field => {
    const value = values[field.id] ?? ''
    return {
      id: field.id,
      value,
      normalizedValue: normalizePracticeAnswer(value, field.kind),
      correctAnswer: field.correctAnswer,
      isCorrect: isPracticeFieldCorrect(field, value),
    }
  })
  const correctCount = fieldResults.filter(result => result.isCorrect).length
  return {
    isCorrect: fieldResults.length > 0 && correctCount === fieldResults.length,
    correctCount,
    totalCount: fieldResults.length,
    fields: fieldResults,
  }
}

export function answersToRecord(fields: PracticeField[], answers: string | string[] | null | undefined) {
  const values = Array.isArray(answers) ? answers : answers == null ? [] : [answers]
  return Object.fromEntries(fields.map((field, index) => [field.id, values[index] ?? '']))
}

export function recordToAnswers(fields: PracticeField[], values: Record<string, string>) {
  return fields.map(field => values[field.id] ?? '')
}
