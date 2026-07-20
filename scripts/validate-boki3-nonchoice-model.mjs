import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  gradePracticeAnswers,
  isPracticeFieldCorrect,
  normalizePracticeAnswer,
} from '../lib/questions/practice-grading.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const issues = []
const checks = []

function assert(condition, label) {
  checks.push(label)
  if (!condition) issues.push(label)
}

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8')
}

function validateReferences(question) {
  const sheet = question.practiceSheet
  const fields = sheet?.fields ?? []
  const fieldIds = new Set(fields.map(field => field.id))
  assert(fields.length > 0, `${question.id}: fields exist`)
  assert(fieldIds.size === fields.length, `${question.id}: field ids unique`)

  for (const row of sheet?.journalRows ?? []) {
    for (const fieldId of [row.debitAccountFieldId, row.debitAmountFieldId, row.creditAccountFieldId, row.creditAmountFieldId].filter(Boolean)) {
      assert(fieldIds.has(fieldId), `${question.id}: journal field ${fieldId} exists`)
    }
  }
  for (const row of sheet?.table?.rows ?? []) {
    for (const cell of row.cells ?? []) {
      if (cell.fieldId) assert(fieldIds.has(cell.fieldId), `${question.id}: table field ${cell.fieldId} exists`)
    }
  }
}

assert(normalizePracticeAnswer('１２，３４５ 円', 'number') === '12345', 'number normalization handles full-width digits and separators')
assert(normalizePracticeAnswer('4,800.0', 'number') === '4800', 'number normalization handles decimal zero')
assert(normalizePracticeAnswer(' 貸倒引当金 繰入 勘定 ', 'account') === '貸倒引当金繰入', 'account normalization handles spaces and 勘定 suffix')
assert(normalizePracticeAnswer('ｄｒ', 'side') === '借方', 'side normalization accepts debit alias')
assert(normalizePracticeAnswer('貸', 'side') === '貸方', 'side normalization accepts Japanese abbreviation')
assert(normalizePracticeAnswer('損益計算書', 'classification') === 'P/L', 'classification normalization accepts P/L name')
assert(normalizePracticeAnswer('Ｂ／Ｓ', 'classification') === 'B/S', 'classification normalization accepts full-width B/S')

const numberField = { id: 'amount', label: '金額', kind: 'number', correctAnswer: '4,800' }
assert(isPracticeFieldCorrect(numberField, '４，８００ 円'), 'formatted correct number is accepted')
assert(!isPracticeFieldCorrect(numberField, '4,801'), 'substantively wrong number is rejected')

const gradingFields = [
  { id: 'account', label: '科目', kind: 'account', correctAnswer: '貸倒引当金繰入', acceptedAnswers: ['貸倒引当金繰入勘定'] },
  { id: 'amount', label: '金額', kind: 'number', correctAnswer: '4,800' },
  { id: 'side', label: '側', kind: 'side', correctAnswer: '借方' },
  { id: 'class', label: '分類', kind: 'classification', correctAnswer: 'P/L' },
]
const correctGrade = gradePracticeAnswers(gradingFields, {
  account: '貸倒引当金 繰入 勘定',
  amount: '４，８００ 円',
  side: 'dr',
  class: '損益計算書',
})
assert(correctGrade.isCorrect && correctGrade.correctCount === 4, 'all normalized answers grade correct')
const wrongGrade = gradePracticeAnswers(gradingFields, {
  account: '貸倒引当金',
  amount: '4801',
  side: '貸方',
  class: 'B/S',
})
assert(!wrongGrade.isCorrect && wrongGrade.correctCount === 0, 'substantively wrong answers grade incorrect')

const layoutFixtures = [
  {
    id: 'fields-fixture',
    practiceSheet: {
      kind: 'fields',
      fields: [{ id: 'a', label: 'A', kind: 'text', correctAnswer: '答え' }],
    },
  },
  {
    id: 'journal-fixture',
    practiceSheet: {
      kind: 'journal',
      fields: [
        { id: 'da', label: '借方科目', kind: 'account', correctAnswer: '現金' },
        { id: 'dm', label: '借方金額', kind: 'number', correctAnswer: '1000' },
        { id: 'ca', label: '貸方科目', kind: 'account', correctAnswer: '売上' },
        { id: 'cm', label: '貸方金額', kind: 'number', correctAnswer: '1000' },
      ],
      journalRows: [{ id: 'r1', debitAccountFieldId: 'da', debitAmountFieldId: 'dm', creditAccountFieldId: 'ca', creditAmountFieldId: 'cm' }],
    },
  },
  {
    id: 'table-fixture',
    practiceSheet: {
      kind: 'table',
      fields: [{ id: 'cell1', label: '表の空欄', kind: 'number', correctAnswer: '1000' }],
      table: { headers: ['科目', '金額'], rows: [{ id: 'r1', cells: [{ text: '現金' }, { fieldId: 'cell1' }] }] },
    },
  },
]
for (const fixture of layoutFixtures) validateReferences(fixture)

const questionSet = JSON.parse(read('content/exams/boki3/questions/ch12.json'))
const pilot = questionSet.questions.find(question => question.id === 'boki3-ch12-practice1')
assert(Boolean(pilot), 'chapter 12 pilot question exists')
if (pilot) {
  validateReferences(pilot)
  assert(pilot.type === 'journal', 'pilot type is journal')
  assert(!pilot.options, 'pilot has no choices')
  assert(pilot.practiceSheet.kind === 'journal', 'pilot answer sheet is journal')
  assert(pilot.practiceSheet.fields.length === 4, 'pilot has four answer fields')
  assert(Array.isArray(pilot.correctAnswer) && pilot.correctAnswer.length === pilot.practiceSheet.fields.length, 'pilot canonical answers align with fields')
  const canonicalMatches = pilot.practiceSheet.fields.every((field, index) =>
    normalizePracticeAnswer(pilot.correctAnswer[index], field.kind) === normalizePracticeAnswer(field.correctAnswer, field.kind))
  assert(canonicalMatches, 'pilot canonical answers match field answers')
  assert(pilot.explanationSteps?.length >= 3, 'pilot has derivation steps')
  assert(pilot.commonMistakes?.length >= 2, 'pilot has error reasons')
  assert(pilot.guideLink?.href === '/exams/boki3/guide/ch12/ch12-s2', 'pilot has exact guide deep link')
  const pilotGrade = gradePracticeAnswers(pilot.practiceSheet.fields, {
    'debit-account': '貸倒引当金 繰入 勘定',
    'debit-amount': '４，８００ 円',
    'credit-account': '貸倒引当金勘定',
    'credit-amount': '4,800',
  })
  assert(pilotGrade.isCorrect, 'pilot accepts reasonable formatting variations')
  const pilotWrong = gradePracticeAnswers(pilot.practiceSheet.fields, {
    'debit-account': '貸倒引当金繰入',
    'debit-amount': '4801',
    'credit-account': '貸倒引当金',
    'credit-amount': '4800',
  })
  assert(!pilotWrong.isCorrect, 'pilot rejects substantive amount error')
}

const clientSource = read('components/features/questions/QuestionClient.tsx')
const nonChoiceSource = read('components/features/questions/NonChoiceQuestion.tsx')
for (const token of ["q.practiceSheet", 'NonChoiceQuestion', 'recordQuestionAnswer']) {
  assert(clientSource.includes(token), `QuestionClient contains ${token}`)
}
for (const token of ["sheet.kind === 'fields'", "sheet.kind === 'journal'", "sheet.kind === 'table'", '誤りの原因', '教材で復習']) {
  assert(nonChoiceSource.includes(token), `NonChoiceQuestion contains ${token}`)
}
for (const forbidden of ['durationMinutes', 'passRate', '合格ライン', '100点満点']) {
  assert(!nonChoiceSource.includes(forbidden), `non-choice component excludes ${forbidden}`)
}

const mockRegistry = read('lib/types/exams-registry.ts')
assert(/id: 'boki3'[\s\S]*?mockExam:\s*\{[\s\S]*?status: 'draft'/.test(mockRegistry), 'mock exam remains draft')

const result = {
  summary: {
    pilotQuestion: pilot?.id ?? null,
    supportedLayouts: layoutFixtures.map(item => item.practiceSheet.kind),
    checks: checks.length,
  },
  issueCount: issues.length,
  issues,
}

console.log(JSON.stringify(result, null, 2))
if (issues.length) process.exitCode = 1
