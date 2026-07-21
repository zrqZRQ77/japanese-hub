import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import matter from 'gray-matter'
import { normalizePracticeAnswer } from '../lib/questions/practice-grading.ts'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(root, 'content/exams/boki3')
const guideRoot = path.join(contentRoot, 'guide')
const questionRoot = path.join(contentRoot, 'questions')
const cardRoot = path.join(contentRoot, 'cards')
const coverage = require('../content/exams/boki3/a-grade/final-coverage.js')
const baseline = require('../content/exams/boki3/a-grade/batch0-baseline.js')
const issues = []
const checks = []
const validatorResults = []

function assert(condition, label) {
  checks.push(label)
  if (!condition) issues.push(label)
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function getNumberField(question, fieldId) {
  const field = question?.practiceSheet?.fields?.find(item => item.id === fieldId)
  if (!field) return Number.NaN
  const normalized = normalizePracticeAnswer(field.correctAnswer, 'number')
  return /^-?\d+(?:\.\d+)?$/.test(normalized) ? Number(normalized) : Number.NaN
}

function journalAccountNet(question, account, rowLimit = Number.POSITIVE_INFINITY) {
  const fields = new Map((question.practiceSheet?.fields ?? []).map(field => [field.id, field]))
  let net = 0
  for (const row of (question.practiceSheet?.journalRows ?? []).slice(0, rowLimit)) {
    const debitAccount = fields.get(row.debitAccountFieldId)?.correctAnswer
    const debitAmount = Number(normalizePracticeAnswer(fields.get(row.debitAmountFieldId)?.correctAnswer ?? '', 'number'))
    const creditAccount = fields.get(row.creditAccountFieldId)?.correctAnswer
    const creditAmount = Number(normalizePracticeAnswer(fields.get(row.creditAmountFieldId)?.correctAnswer ?? '', 'number'))
    if (debitAccount === account) net += debitAmount
    if (creditAccount === account) net -= creditAmount
  }
  return net
}

function runValidator(name, args) {
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', env: process.env })
  validatorResults.push({ name, status: result.status, stdout: result.stdout.trim(), stderr: result.stderr.trim() })
  assert(result.status === 0, `sub-validator ${name} passes`)
}

const subValidators = [
  ['content', ['scripts/validate-boki3-content.js']],
  ['baseline', ['scripts/validate-boki3-a-baseline.js']],
  ['guides', ['scripts/validate-boki3-a-guides.js']],
  ['chapter12', ['scripts/validate-boki3-a-ch12.js']],
  ['nonchoice-model', ['--no-warnings', '--experimental-strip-types', 'scripts/validate-boki3-nonchoice-model.mjs']],
  ['capability-practice', ['--no-warnings', '--experimental-strip-types', 'scripts/validate-boki3-capability-practice.mjs']],
  ['learning-loop', ['--no-warnings', '--experimental-strip-types', 'scripts/validate-boki3-learning-loop.mjs']],
]
for (const [name, args] of subValidators) runValidator(name, args)

const guideFiles = fs.readdirSync(guideRoot)
  .filter(name => /^ch\d+$/.test(name))
  .flatMap(chapterId => fs.readdirSync(path.join(guideRoot, chapterId))
    .filter(name => name.endsWith('.mdx'))
    .map(name => path.join(guideRoot, chapterId, name)))
const guides = new Map()
for (const file of guideFiles) {
  const parsed = matter(fs.readFileSync(file, 'utf8'))
  const sectionId = path.basename(file, '.mdx')
  guides.set(sectionId, { file, data: parsed.data, body: parsed.content })
  assert(/^\d{4}-\d{2}-\d{2}$/.test(String(parsed.data.updatedAt)), `${sectionId}: valid annual updatedAt`)
  assert(String(parsed.data.updatedAt) <= coverage.confirmedAt, `${sectionId}: updatedAt is not after confirmedAt`)
}

const questionSets = fs.readdirSync(questionRoot)
  .filter(name => /^ch\d+\.json$/.test(name))
  .map(name => loadJson(path.join(questionRoot, name)))
const questions = questionSets.flatMap(set => set.questions)
const questionById = new Map(questions.map(question => [question.id, question]))
const nonChoiceQuestions = questions.filter(question => question.practiceSheet)
const choiceQuestions = questions.filter(question => !question.practiceSheet)

const cardSets = fs.readdirSync(cardRoot)
  .filter(name => /^ch\d+\.json$/.test(name))
  .map(name => loadJson(path.join(cardRoot, name)))
const cards = cardSets.flatMap(set => set.cards)
const cardById = new Map(cards.map(card => [card.id, card]))

assert(coverage.examId === 'boki3', 'coverage exam id is boki3')
assert(coverage.applicableYear === 2026, 'coverage year is 2026')
assert(coverage.confirmedAt === '2026-07-20', 'coverage confirmed date is fixed')
assert(coverage.officialScope.applicableRangeTable.includes('2022年度'), 'coverage references 2022 official range table')
for (const url of coverage.officialScope.sourceUrls) {
  assert(/^https:\/\/www\.kentei\.ne\.jp\//.test(url), `official source is JCCI: ${url}`)
}
assert(coverage.assessmentBoundary.mockExamIncluded === false, 'mock exam excluded from A-grade gate')
assert(coverage.assessmentBoundary.mockExamRouteStatus === 'draft-only', 'mock exam remains draft-only')

assert(choiceQuestions.length === 204, `choice baseline remains 204, got ${choiceQuestions.length}`)
assert(nonChoiceQuestions.length === 45, `non-choice practice count is 45, got ${nonChoiceQuestions.length}`)
assert(cards.length === 215, `card baseline remains 215, got ${cards.length}`)
assert(guideFiles.length === 45, `guide section count remains 45, got ${guideFiles.length}`)

const baselineAbilityIds = baseline.officialAbilityMap.map(item => item.id)
const coverageAbilityIds = coverage.abilityCoverage.map(item => item.id)
assert(coverageAbilityIds.length === 13, `ability coverage count is 13, got ${coverageAbilityIds.length}`)
assert(new Set(coverageAbilityIds).size === coverageAbilityIds.length, 'ability coverage ids are unique')
assert(baselineAbilityIds.every(id => coverageAbilityIds.includes(id)), 'all baseline ability ids are covered')

const coveredQuestionIds = []
for (const ability of coverage.abilityCoverage) {
  assert(Boolean(ability.label), `${ability.id}: label exists`)
  assert(ability.guideSectionIds.length > 0, `${ability.id}: guide coverage exists`)
  assert(ability.nonChoiceQuestionIds.length > 0, `${ability.id}: non-choice coverage exists`)
  assert(ability.cardIds.length > 0, `${ability.id}: card coverage exists`)
  for (const sectionId of ability.guideSectionIds) assert(guides.has(sectionId), `${ability.id}: guide ${sectionId} exists`)
  for (const questionId of ability.nonChoiceQuestionIds) {
    const question = questionById.get(questionId)
    assert(Boolean(question?.practiceSheet), `${ability.id}: non-choice ${questionId} exists`)
    coveredQuestionIds.push(questionId)
  }
  for (const cardId of ability.cardIds) assert(cardById.has(cardId), `${ability.id}: card ${cardId} exists`)
}
assert(new Set(coveredQuestionIds).size === coveredQuestionIds.length, 'non-choice questions are assigned to one core ability each')
assert(new Set(coveredQuestionIds).size === nonChoiceQuestions.length, 'all 45 non-choice questions are covered by the ability map')
for (const question of nonChoiceQuestions) assert(coveredQuestionIds.includes(question.id), `${question.id}: included in final ability coverage`)

let journalCount = 0
for (const question of nonChoiceQuestions) {
  const fields = question.practiceSheet.fields ?? []
  assert(Array.isArray(question.correctAnswer) && question.correctAnswer.length === fields.length, `${question.id}: canonical answer count matches fields`)
  fields.forEach((field, index) => {
    assert(normalizePracticeAnswer(question.correctAnswer[index], field.kind) === normalizePracticeAnswer(field.correctAnswer, field.kind), `${question.id}/${field.id}: canonical answer matches field`)
  })
  if (question.practiceSheet.kind !== 'journal') continue
  journalCount += 1
  const fieldById = new Map(fields.map(field => [field.id, field]))
  let debit = 0
  let credit = 0
  for (const row of question.practiceSheet.journalRows ?? []) {
    if (row.debitAmountFieldId) debit += Number(normalizePracticeAnswer(fieldById.get(row.debitAmountFieldId)?.correctAnswer ?? '', 'number'))
    if (row.creditAmountFieldId) credit += Number(normalizePracticeAnswer(fieldById.get(row.creditAmountFieldId)?.correctAnswer ?? '', 'number'))
  }
  assert(Number.isFinite(debit) && debit === credit, `${question.id}: journal debit ${debit} equals credit ${credit}`)
}
assert(journalCount >= 25, `at least 25 journal-layout questions, got ${journalCount}`)

const highRiskIds = coverage.highRiskAssertions.map(item => item.id)
assert(highRiskIds.length === 10, `high-risk assertion count is 10, got ${highRiskIds.length}`)
assert(new Set(highRiskIds).size === 10, 'high-risk assertion ids are unique')
for (let index = 1; index <= 10; index += 1) assert(highRiskIds.includes(`calc-${String(index).padStart(2, '0')}`), `calc-${String(index).padStart(2, '0')} is declared`)
for (const assertion of coverage.highRiskAssertions) {
  assert(assertion.evidenceIds.length > 0, `${assertion.id}: evidence exists`)
  for (const evidenceId of assertion.evidenceIds) {
    if (evidenceId === 'all-non-choice-journals') continue
    assert(questionById.has(evidenceId), `${assertion.id}: evidence ${evidenceId} exists`)
  }
}

const q = id => questionById.get(id)
assert(journalAccountNet(q('boki3-ch4-practice1'), '現金過不足', 3) === 3300, 'calc-02: cash shortage residual is 3,300')
assert(journalAccountNet(q('boki3-ch4-practice1'), '現金過不足') === 0, 'calc-02: cash over-short closes to zero')
assert(getNumberField(q('boki3-ch5-practice4'), 'cost-of-sales') === 90000 + 540000 - 110000, 'calc-03: cost of goods sold formula')
assert(getNumberField(q('boki3-ch5-practice5'), 'ending-inventory') === 70 * 900, 'calc-04: FIFO ending inventory')
assert(getNumberField(q('boki3-ch5-practice6'), 'average-unit-cost') === (100 * 800 + 100 * 1000) / 200, 'calc-04: moving-average unit cost')
assert(getNumberField(q('boki3-ch9-practice3'), 'current-depreciation') === 660000 / 5 * 9 / 12, 'calc-05: partial-year depreciation')
assert(getNumberField(q('boki3-ch9-practice5'), 'r3-debit-amount') === 132000 * 5 / 12, 'calc-05: sale-year depreciation')
assert(getNumberField(q('boki3-ch9-practice5'), 'r2-credit-amount') === 390000 - (660000 - 231000 - 55000), 'calc-05: fixed asset sale gain')
assert(getNumberField(q('boki3-ch11-practice2'), 'r1-debit-amount') === 240000 * 0.02 - 1800, 'calc-06: allowance difference adjustment')
assert(getNumberField(q('boki3-ch12-practice1'), 'debit-amount') === 240000 * 0.02, 'calc-06: allowance with no opening balance')
assert(getNumberField(q('boki3-ch10-practice1'), 'r1-debit-amount') === 600000 * 0.036 * 6 / 12, 'calc-07: accrued interest expense')
assert(getNumberField(q('boki3-ch10-practice3'), 'r1-debit-amount') === 300000 * 0.04 * 9 / 12, 'calc-07: accrued interest revenue')
assert(getNumberField(q('boki3-ch12-practice3'), 'adjusted-balance') === 720000 + 120000 - 150000, 'calc-08: worksheet horizontal calculation')
assert(getNumberField(q('boki3-ch12-practice6'), 'r2-debit-amount') === 1391800, 'calc-08: worksheet expense total closes')
assert(getNumberField(q('boki3-ch12-practice4'), 'net-income') === 1600000 - 1391800, 'calc-09: worksheet net income')
assert(getNumberField(q('boki3-ch13-practice1'), 'net-income') === 704000 - 624000, 'calc-09: income statement net income')
assert(getNumberField(q('boki3-ch13-practice2'), 'asset-total') === getNumberField(q('boki3-ch13-practice2'), 'liability-total') + getNumberField(q('boki3-ch13-practice2'), 'equity-total'), 'calc-09: balance sheet equation')
assert(getNumberField(q('boki3-ch13-practice3'), 'ending-retained-earnings') === 100000 + 208200 - 30000, 'calc-09: ending retained earnings')
const vatQuestion = q('boki3-ch8-q22')
const vatCorrectOption = vatQuestion.options.find(option => option.label === vatQuestion.correctAnswer)?.text ?? ''
assert(vatQuestion.correctAnswer === 'A', 'calc-10: VAT correct option is A')
assert(/仮受消費税\s*50,000/.test(vatCorrectOption) && /仮払消費税\s*30,000/.test(vatCorrectOption) && /未払消費税\s*20,000/.test(vatCorrectOption), 'calc-10: VAT settlement is 50,000 - 30,000 = 20,000')

for (const card of cards) {
  const guideMatch = card.guideLink?.href?.match(/^\/exams\/boki3\/guide\/(ch\d+)\/(ch\d+-s\d+)$/)
  const questionMatch = card.questionLink?.href?.match(/^\/exams\/boki3\/questions\/(ch\d+)\?question=([a-z0-9-]+)$/)
  assert(Boolean(guideMatch && guides.has(guideMatch[2])), `${card.id}: guide deep link resolves`)
  assert(Boolean(questionMatch && questionById.has(questionMatch[2])), `${card.id}: question deep link resolves`)
}

const examsRegistry = fs.readFileSync(path.join(root, 'lib/types/exams-registry.ts'), 'utf8')
assert(/id: 'boki3'[\s\S]*?mockExam:\s*\{[\s\S]*?status: 'draft'/.test(examsRegistry), 'boki3 mock exam remains draft in registry')
const tracked = spawnSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).stdout.split('\n').filter(Boolean)
for (const file of tracked) assert(!/(^|\/)\.DS_Store$|(^|\/)\._/.test(file), `tracked file is not OS metadata: ${file}`)

const result = {
  summary: {
    guides: guideFiles.length,
    choiceQuestions: choiceQuestions.length,
    nonChoiceQuestions: nonChoiceQuestions.length,
    journalQuestions: journalCount,
    cards: cards.length,
    abilities: coverage.abilityCoverage.length,
    highRiskAssertions: coverage.highRiskAssertions.length,
    subValidators: validatorResults.map(item => ({ name: item.name, passed: item.status === 0 })),
    checks: checks.length,
  },
  issueCount: issues.length,
  issues,
}

console.log(JSON.stringify(result, null, 2))
if (issues.length) process.exitCode = 1
