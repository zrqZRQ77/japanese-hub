import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizePracticeAnswer } from '../lib/questions/practice-grading.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const questionRoot = path.join(root, 'content/exams/boki3/questions')
const issues = []
const checks = []

function assert(condition, label) {
  checks.push(label)
  if (!condition) issues.push(label)
}

function loadChapter(chapterId) {
  return JSON.parse(fs.readFileSync(path.join(questionRoot, `${chapterId}.json`), 'utf8')).questions
}

function fieldMap(question) {
  return new Map((question.practiceSheet?.fields ?? []).map(field => [field.id, field]))
}

function numericAnswer(question, fieldId) {
  const field = fieldMap(question).get(fieldId)
  if (!field) return null
  const normalized = normalizePracticeAnswer(field.correctAnswer, 'number')
  return /^-?\d+(?:\.\d+)?$/.test(normalized) ? Number(normalized) : null
}

function assertField(question, fieldId, expected, label) {
  const actual = numericAnswer(question, fieldId)
  assert(actual === expected, `${question.id}: ${label} expected ${expected}, got ${actual}`)
}

const expectedDistribution = {
  ch3: 7,
  ch4: 1,
  ch5: 6,
  ch6: 1,
  ch7: 1,
  ch8: 1,
  ch9: 5,
  ch10: 5,
  ch11: 7,
  ch12: 7,
  ch13: 4,
}

const choiceQuestions = []
const capabilityQuestions = []
for (let chapter = 1; chapter <= 13; chapter += 1) {
  const chapterId = `ch${chapter}`
  for (const question of loadChapter(chapterId)) {
    if (question.practiceSheet) capabilityQuestions.push(question)
    else choiceQuestions.push(question)
  }
}

assert(choiceQuestions.length === 204, `choice question baseline remains 204, got ${choiceQuestions.length}`)
assert(capabilityQuestions.length === 45, `capability question total is 45, got ${capabilityQuestions.length}`)

for (const [chapterId, expected] of Object.entries(expectedDistribution)) {
  const actual = capabilityQuestions.filter(question => question.chapterId === chapterId).length
  assert(actual === expected, `${chapterId}: expected ${expected} capability questions, got ${actual}`)
}

const ids = new Set()
const texts = new Set()
const typeCounts = {}
const layoutCounts = {}
const inputKindCounts = {}
let multiLineJournalCount = 0
let largeIntegratedQuestionCount = 0

for (const question of capabilityQuestions) {
  assert(!ids.has(question.id), `${question.id}: id is unique`)
  ids.add(question.id)
  assert(!texts.has(question.text), `${question.id}: question text is unique`)
  texts.add(question.text)
  assert(/^boki3-ch(?:3|4|5|6|7|8|9|10|11|12|13)-practice\d+$/.test(question.id), `${question.id}: id format is valid`)
  assert(!question.options, `${question.id}: no multiple-choice options`)
  assert(Array.isArray(question.correctAnswer), `${question.id}: correctAnswer is an array`)
  assert(question.explanation?.length >= 30, `${question.id}: explanation is complete`)
  assert(question.explanationSteps?.length >= 3, `${question.id}: has at least three derivation steps`)
  assert(question.commonMistakes?.length >= 2, `${question.id}: has at least two error reasons`)
  assert(question.guideLink?.href?.startsWith('/exams/boki3/guide/'), `${question.id}: has a guide deep link`)
  assert(question.tags?.includes('能力型練習') && question.tags?.includes('非選択式'), `${question.id}: capability tags exist`)

  const guideMatch = question.guideLink?.href?.match(/^\/exams\/boki3\/guide\/(ch\d+)\/(ch\d+-s\d+)$/)
  if (guideMatch) {
    assert(guideMatch[1] === question.chapterId, `${question.id}: guide deep link stays within the question chapter`)
    assert(fs.existsSync(path.join(root, 'content/exams/boki3/guide', guideMatch[1], `${guideMatch[2]}.mdx`)), `${question.id}: guide deep link target exists`)
  } else {
    assert(false, `${question.id}: guide deep link has canonical section form`)
  }

  typeCounts[question.type] = (typeCounts[question.type] ?? 0) + 1
  const sheet = question.practiceSheet
  layoutCounts[sheet.kind] = (layoutCounts[sheet.kind] ?? 0) + 1
  const fields = sheet.fields ?? []
  const fieldsById = new Map(fields.map(field => [field.id, field]))
  assert(fields.length > 0, `${question.id}: fields exist`)
  assert(fieldsById.size === fields.length, `${question.id}: field ids are unique`)
  assert(question.correctAnswer.length === fields.length, `${question.id}: canonical answers align with field order`)

  fields.forEach((field, index) => {
    inputKindCounts[field.kind] = (inputKindCounts[field.kind] ?? 0) + 1
    assert(field.label && String(field.correctAnswer).trim() !== '', `${question.id}/${field.id}: field definition is complete`)
    const canonical = normalizePracticeAnswer(question.correctAnswer[index], field.kind)
    const fieldAnswer = normalizePracticeAnswer(field.correctAnswer, field.kind)
    assert(canonical === fieldAnswer, `${question.id}/${field.id}: canonical answer matches field answer`)
  })

  if (sheet.kind === 'journal') {
    const rows = sheet.journalRows ?? []
    assert(rows.length > 0, `${question.id}: journal rows exist`)
    if (rows.length > 1) multiLineJournalCount += 1
    if (fields.length >= 12) largeIntegratedQuestionCount += 1
    let debitTotal = 0
    let creditTotal = 0
    for (const row of rows) {
      if (row.debitAccountFieldId || row.debitAmountFieldId) {
        assert(fieldsById.has(row.debitAccountFieldId), `${question.id}/${row.id}: debit account field exists`)
        assert(fieldsById.has(row.debitAmountFieldId), `${question.id}/${row.id}: debit amount field exists`)
        debitTotal += numericAnswer(question, row.debitAmountFieldId) ?? Number.NaN
      }
      if (row.creditAccountFieldId || row.creditAmountFieldId) {
        assert(fieldsById.has(row.creditAccountFieldId), `${question.id}/${row.id}: credit account field exists`)
        assert(fieldsById.has(row.creditAmountFieldId), `${question.id}/${row.id}: credit amount field exists`)
        creditTotal += numericAnswer(question, row.creditAmountFieldId) ?? Number.NaN
      }
    }
    assert(Number.isFinite(debitTotal) && debitTotal === creditTotal, `${question.id}: journal debit ${debitTotal} equals credit ${creditTotal}`)
  }

  if (sheet.kind === 'table') {
    assert(sheet.table?.headers?.length > 0, `${question.id}: table headers exist`)
    assert(sheet.table?.rows?.length > 0, `${question.id}: table rows exist`)
    for (const row of sheet.table?.rows ?? []) {
      assert(row.cells.length === sheet.table.headers.length, `${question.id}/${row.id}: table cell count matches headers`)
      for (const cell of row.cells) {
        if (cell.fieldId) assert(fieldsById.has(cell.fieldId), `${question.id}/${row.id}: table field ${cell.fieldId} exists`)
      }
    }
  }
}

for (const type of ['journal', 'numeric', 'table', 'classification', 'correction']) {
  assert((typeCounts[type] ?? 0) > 0, `question type ${type} is represented`)
}
for (const layout of ['fields', 'journal', 'table']) {
  assert((layoutCounts[layout] ?? 0) > 0, `answer layout ${layout} is represented`)
}
for (const kind of ['account', 'number', 'side', 'classification', 'text']) {
  assert((inputKindCounts[kind] ?? 0) > 0, `input kind ${kind} is represented`)
}
assert(multiLineJournalCount >= 8, `at least 8 multi-line journal questions, got ${multiLineJournalCount}`)
assert(largeIntegratedQuestionCount >= 1, `at least one large integrated journal question, got ${largeIntegratedQuestionCount}`)
assert((typeCounts.correction ?? 0) >= 4, `at least 4 correction/diagnostic questions, got ${typeCounts.correction ?? 0}`)

const byId = new Map(capabilityQuestions.map(question => [question.id, question]))
const q = id => byId.get(id)

assertField(q('boki3-ch3-practice4'), 'ending-cash', 250000 + 80000 + 45000 - 60000 - 35000, 'ending cash')
assertField(q('boki3-ch3-practice6'), 'r1-c3', 500000 - 120000 + 200000, 'ordinary deposit balance')
assertField(q('boki3-ch4-practice1'), 'r4-debit-amount', 5500 - 3200 + 1000, 'unexplained cash shortage')
assertField(q('boki3-ch6-practice1'), 'r1-debit-amount', 120000 - 120000 * 0.03, 'credit card receivable')
assertField(q('boki3-ch6-practice1'), 'r2-debit-amount', 120000 * 0.03, 'credit card fee')
assertField(q('boki3-ch7-practice1'), 'r2-debit-amount', 200000 - 120000, 'electronic receivable portion')
assertField(q('boki3-ch8-practice1'), 'r4-credit-amount', 300000 - 20000 - 30000 - 10000, 'salary net payment')
assertField(q('boki3-ch5-practice4'), 'cost-of-sales', 90000 + 540000 - 110000, 'cost of goods sold')
assertField(q('boki3-ch5-practice5'), 'ending-inventory', 70 * 900, 'FIFO ending inventory')
assertField(q('boki3-ch5-practice5'), 'cost-of-sales', 100 * 800 + 80 * 900, 'FIFO cost of goods sold')
assertField(q('boki3-ch5-practice6'), 'average-unit-cost', (100 * 800 + 100 * 1000) / 200, 'moving average unit cost')
assertField(q('boki3-ch5-practice6'), 'cost-of-sales', 150 * 900, 'moving average cost of goods sold')
assertField(q('boki3-ch5-practice6'), 'ending-inventory', 50 * 900, 'moving average ending inventory')
assertField(q('boki3-ch9-practice3'), 'annual-depreciation', 660000 / 5, 'annual depreciation')
assertField(q('boki3-ch9-practice3'), 'current-depreciation', 660000 / 5 * 9 / 12, 'partial-year depreciation')
assertField(q('boki3-ch9-practice3'), 'book-value', 660000 - 99000, 'first-year book value')
assertField(q('boki3-ch9-practice5'), 'r3-debit-amount', 132000 * 5 / 12, 'sale-year depreciation')
assertField(q('boki3-ch9-practice5'), 'r2-credit-amount', 390000 - (660000 - 231000 - 55000), 'fixed asset sale gain')
assertField(q('boki3-ch10-practice1'), 'r1-debit-amount', 600000 * 0.036 * 6 / 12, 'accrued interest expense')
assertField(q('boki3-ch10-practice2'), 'prepaid-rent', 15000 * 2, 'prepaid rent')
assertField(q('boki3-ch10-practice2'), 'current-rent', 180000 - 30000, 'adjusted rent expense')
assertField(q('boki3-ch10-practice3'), 'r1-debit-amount', 300000 * 0.04 * 9 / 12, 'accrued interest revenue')
assertField(q('boki3-ch10-practice4'), 'r1-debit-amount', 600000 / 6 * 2, 'unearned rent')
assertField(q('boki3-ch11-practice2'), 'r1-debit-amount', 240000 * 0.02 - 1800, 'allowance difference adjustment')
assertField(q('boki3-ch11-practice3'), 'r1-debit-amount', 60000 - 18000, 'supplies used')
assertField(q('boki3-ch11-practice5'), 'ending-accumulated-depreciation', 120000 + 120000, 'ending accumulated depreciation')
assertField(q('boki3-ch11-practice5'), 'ending-book-value', 600000 - 240000, 'ending book value')
assertField(q('boki3-ch11-practice6'), 'r1-c2', 680000 + 90000 - 130000, 'adjusted purchases')
assertField(q('boki3-ch11-practice6'), 'r2-c2', 280000 + 20000, 'adjusted salaries')
assertField(q('boki3-ch11-practice6'), 'r3-c2', 168000 - 28000, 'adjusted rent expense')
assertField(q('boki3-ch11-practice6'), 'r4-c2', 45000 - 32000, 'adjusted supplies asset')
assertField(q('boki3-ch12-practice1'), 'debit-amount', 240000 * 0.02, 'pilot allowance')
assertField(q('boki3-ch12-practice2'), 'difference', 2950000 - 2860000, 'trial balance difference')
assertField(q('boki3-ch12-practice3'), 'adjusted-balance', 720000 + 120000 - 150000, 'worksheet adjusted purchases')
assertField(q('boki3-ch12-practice4'), 'net-income', 1600000 - 1391800, 'worksheet net income')
assertField(q('boki3-ch12-practice6'), 'r2-debit-amount', 690000 + 325000 + 150000 + 60000 + 120000 + 4800 + 42000, 'closing expense total')
assertField(q('boki3-ch12-practice7'), 'r2-debit-amount', 80000 - 30000, 'voucher credit-sale portion')
assertField(q('boki3-ch13-practice1'), 'revenue-total', 700000 + 4000, 'income statement revenue total')
assertField(q('boki3-ch13-practice1'), 'expense-total', 420000 + 100000 + 48000 + 20000 + 30000 + 6000, 'income statement expense total')
assertField(q('boki3-ch13-practice1'), 'net-income', 704000 - 624000, 'income statement net income')
assertField(q('boki3-ch13-practice2'), 'asset-total', 150000 + 340000 + 180000 + 120000 + 10000 + 24000 + 300000 - 60000, 'balance sheet assets')
assertField(q('boki3-ch13-practice2'), 'liability-total', 160000 + 300000 + 24000, 'balance sheet liabilities')
assertField(q('boki3-ch13-practice2'), 'equity-total', 500000 + 80000, 'balance sheet equity')
assertField(q('boki3-ch13-practice3'), 'ending-retained-earnings', 100000 + 208200 - 30000, 'ending retained earnings')
assertField(q('boki3-ch13-practice4'), 'r3-c3', 600000 - 240000, 'fixed asset book value')

const result = {
  summary: {
    total: capabilityQuestions.length,
    distribution: Object.fromEntries(Object.keys(expectedDistribution).map(chapterId => [chapterId, capabilityQuestions.filter(question => question.chapterId === chapterId).length])),
    typeCounts,
    layoutCounts,
    inputKindCounts,
    multiLineJournalCount,
    largeIntegratedQuestionCount,
    checks: checks.length,
  },
  issueCount: issues.length,
  issues,
}

console.log(JSON.stringify(result, null, 2))
if (issues.length) process.exitCode = 1
