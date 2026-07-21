const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { spawnSync } = require('child_process')
const matter = require('gray-matter')

const root = path.resolve(__dirname, '..')
const guideRoot = path.join(root, 'content/exams/fp3/guide/ch4')
const questionPath = path.join(root, 'content/exams/fp3/questions/ch4.json')
const bodyHashes = require('../content/exams/fp3/a-grade/ch4-tax-body-hashes.js')
const taxCase = require('../content/exams/fp3/a-grade/ch4-tax-case-2026.js')
const coverage = require('../content/exams/fp3/a-grade/ch4-tax-coverage.js')
const protectedItems = require('../content/exams/fp3/annual/2026-protected-item-hashes.js')

const issues = []
const checks = []
const childValidators = []

function assert(condition, label) {
  checks.push(label)
  if (!condition) issues.push(label)
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function runValidator(name, script) {
  const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' })
  childValidators.push({ name, passed: result.status === 0 })
  assert(result.status === 0, `sub-validator ${name} passes`)
}

runValidator('fp3-content', 'scripts/validate-fp3-content.js')
runValidator('fp3-batch0-baseline', 'scripts/validate-fp3-a-baseline.js')
runValidator('fp3-batch1-official-annual', 'scripts/validate-fp3-a-batch1.js')

const guideFiles = fs.readdirSync(guideRoot).filter(name => name.endsWith('.mdx')).sort()
assert(guideFiles.length === 6, 'tax chapter contains six guide sections')
assert(Object.keys(bodyHashes).length === 6, 'six tax guide body hashes are frozen')

const guideMetrics = []
for (const file of guideFiles) {
  const raw = fs.readFileSync(path.join(guideRoot, file), 'utf8')
  const parsed = matter(raw)
  const sectionId = path.basename(file, '.mdx')
  const content = parsed.content
  const normalizedBody = content.replace(/\r\n/g, '\n').replace(/^\n+/, '')
  const chars = content.replace(/\s+/g, '').length
  const links = (content.match(/\]\(\/exams\/fp3\//g) || []).length

  assert(parsed.data.examId === 'fp3' && parsed.data.chapterId === 'ch4', `${sectionId}: metadata identifies fp3 ch4`)
  assert(parsed.data.lawReferenceDate === '2026-04-01', `${sectionId}: law reference date is 2026-04-01`)
  assert(parsed.data.dataAsOf === '2026-04-01', `${sectionId}: data date is 2026-04-01`)
  assert(parsed.data.annualReviewStatus === 'content-verified', `${sectionId}: content is marked verified`)
  assert(parsed.data.annualMetadataReviewedAt === '2026-07-21', `${sectionId}: review date is recorded`)
  assert(chars >= 1400, `${sectionId}: guide has at least 1,400 non-space characters`)
  assert(/^## この節でできるようになること/m.test(content), `${sectionId}: learning objectives exist`)
  assert(/青葉直人/.test(content), `${sectionId}: continuous case is connected`)
  assert(/誤り|間違いやすい/.test(content), `${sectionId}: error diagnosis exists`)
  assert(/自己点検/.test(content), `${sectionId}: self-check exists`)
  assert(links >= 1, `${sectionId}: internal learning link exists`)
  assert(sha256(normalizedBody) === bodyHashes[sectionId], `${sectionId}: verified guide body hash matches`)

  guideMetrics.push({ sectionId, chars, links })
}

assert(guideMetrics.reduce((sum, item) => sum + item.links, 0) >= 9, 'tax guides contain at least nine internal learning links')

const questionSet = JSON.parse(fs.readFileSync(questionPath, 'utf8'))
const choices = questionSet.questions.filter(question => !question.practiceSheet)
const practices = questionSet.questions.filter(question => question.practiceSheet)
const questionById = new Map(questionSet.questions.map(question => [question.id, question]))

assert(choices.length === coverage.protectedChoiceQuestions, '20 original tax choice questions remain')
assert(practices.length === coverage.addedNonChoiceQuestions, 'eight tax non-choice questions exist')
assert(practices.filter(question => question.type === 'numeric').length === 6, 'six numeric tax practices exist')
assert(practices.filter(question => question.type === 'classification').length === 2, 'two classification tax practices exist')

for (const choice of choices) {
  const expectedHash = protectedItems.questions[choice.id]
  assert(Boolean(expectedHash), `${choice.id}: original choice hash is registered`)
  assert(sha256(JSON.stringify(choice)) === expectedHash, `${choice.id}: original choice remains unchanged`)
}

const expectedPracticeIds = Array.from({ length: 8 }, (_, index) => `fp3-ch4-practice${index + 1}`)
assert(JSON.stringify(practices.map(question => question.id)) === JSON.stringify(expectedPracticeIds), 'practice ids are ordered from 1 to 8')

for (const question of practices) {
  const fields = question.practiceSheet.fields
  assert(Array.isArray(question.correctAnswer) && question.correctAnswer.length === fields.length, `${question.id}: top-level answers match fields`)
  assert(question.correctAnswer.every((answer, index) => String(answer) === String(fields[index].correctAnswer)), `${question.id}: answer order is deterministic`)
  assert(question.explanationSteps.length >= 2, `${question.id}: explanation steps exist`)
  assert(question.commonMistakes.length >= 2, `${question.id}: common mistakes exist`)
  assert(question.guideLink.href.startsWith('/exams/fp3/guide/ch4/'), `${question.id}: guide deep link targets ch4`)
  assert(question.tags.includes('非選択式'), `${question.id}: non-choice tag exists`)
}

assert(coverage.examId === 'fp3' && coverage.chapterId === 'ch4' && coverage.batch === 2, 'coverage metadata is valid')
assert(coverage.lawReferenceDate === taxCase.lawReferenceDate, 'coverage and case use the same law reference date')
assert(coverage.abilityCoverage.length === 2, 'tax coverage maps two core abilities')
assert(new Set(coverage.abilityCoverage.map(item => item.abilityId)).size === 2, 'tax ability ids are unique')
assert(coverage.calculationAssertions.length === 6, 'six new tax calculation assertions are registered')
for (const assertion of coverage.calculationAssertions) {
  assert(questionById.has(assertion.questionId), `${assertion.id}: evidence question exists`)
}
assert(coverage.boundaries.usesOnlyLawEffectiveAtReferenceDate, 'coverage enforces effective-law boundary')
assert(coverage.boundaries.excludesReformEffectiveAfterReferenceDate, 'post-reference-date reform is excluded')
assert(coverage.boundaries.officialQuestionTextCopied === false, 'official question text is not copied')
assert(coverage.boundaries.mockExamIncluded === false, 'mock exam remains excluded')

const f = taxCase.facts
const c = taxCase.calculations
const salaryDeduction = f.salaryRevenue * 0.2 + 440000
const salaryIncome = f.salaryRevenue - salaryDeduction
const rentalIncome = f.rentalRevenue - f.rentalExpenses
const rentalLossEligibleForOffset = Math.max(0, -rentalIncome - f.landAcquisitionInterest)
const temporaryIncome = Math.max(0, f.temporaryRevenue - f.temporaryDirectCost - 500000)
const temporaryIncludedAmount = temporaryIncome / 2
const aggregateIncome = salaryIncome - rentalLossEligibleForOffset + temporaryIncludedAmount + f.miscIncome
const medicalExpenseDeduction = Math.max(0, f.medicalExpensePaid - f.medicalReimbursement - 100000)
const basicDeduction = aggregateIncome <= 3360000 ? 880000 : aggregateIncome <= 4890000 ? 680000 : aggregateIncome <= 6550000 ? 630000 : 580000
const totalIncomeDeductions = f.socialInsuranceDeduction + medicalExpenseDeduction + f.idecoDeduction + f.lifeInsuranceDeduction + basicDeduction
const taxableIncome = Math.floor((aggregateIncome - totalIncomeDeductions) / 1000) * 1000
const calculatedIncomeTax = taxableIncome * 0.1 - 97500
const incomeTaxAfterCredit = Math.max(0, calculatedIncomeTax - f.housingLoanTaxCredit)
const reconstructionSpecialIncomeTax = Math.floor(incomeTaxAfterCredit * 0.021)
const incomeAndReconstructionTax = incomeTaxAfterCredit + reconstructionSpecialIncomeTax

const recomputed = {
  salaryDeduction,
  salaryIncome,
  rentalIncome,
  rentalLossEligibleForOffset,
  temporaryIncome,
  temporaryIncludedAmount,
  aggregateIncome,
  medicalExpenseDeduction,
  basicDeduction,
  totalIncomeDeductions,
  taxableIncome,
  calculatedIncomeTax,
  incomeTaxAfterCredit,
  reconstructionSpecialIncomeTax,
  incomeAndReconstructionTax,
}
for (const [key, value] of Object.entries(recomputed)) {
  assert(c[key] === value, `continuous tax case ${key} recalculates to ${value}`)
}

const expectedAnswers = {
  'fp3-ch4-practice2': ['1640000', '4360000'],
  'fp3-ch4-practice3': ['11500000', '1750000'],
  'fp3-ch4-practice4': ['300000', '150000'],
  'fp3-ch4-practice5': ['200000', '4510000'],
  'fp3-ch4-practice6': ['150000', '1850000', '2660000'],
  'fp3-ch4-practice7': ['168500', '68500', '1438', '69938'],
}
for (const [questionId, answers] of Object.entries(expectedAnswers)) {
  assert(JSON.stringify(questionById.get(questionId).correctAnswer) === JSON.stringify(answers), `${questionId}: calculation answers match verified case`)
}

assert(taxCase.officialSources.length >= 10, 'continuous case records at least ten official sources')
assert(taxCase.officialSources.every(url => /^https:\/\/(www\.)?(nta\.go\.jp|kinzai\.or\.jp)\//.test(url)), 'continuous case sources are NTA or Kinzai')

const ch4Text = guideFiles.map(file => fs.readFileSync(path.join(guideRoot, file), 'utf8')).join('\n')
assert(/2026年12月1日施行/.test(ch4Text), 'post-reference-date reform effective date is explained')
assert(/本教材の現行試験計算には使用しません/.test(ch4Text), 'post-reference-date reform exclusion is explicit')
assert(!/2026年12月1日施行[^。]*使用します/.test(ch4Text), 'post-reference-date reform is not used')

const result = {
  summary: {
    guides: guideMetrics.length,
    minimumGuideChars: Math.min(...guideMetrics.map(item => item.chars)),
    guideLinks: guideMetrics.reduce((sum, item) => sum + item.links, 0),
    protectedChoiceQuestions: choices.length,
    nonChoiceQuestions: practices.length,
    numericPractices: practices.filter(question => question.type === 'numeric').length,
    classificationPractices: practices.filter(question => question.type === 'classification').length,
    calculationAssertions: coverage.calculationAssertions.length,
    abilitiesCovered: coverage.abilityCoverage.length,
    childValidators,
    checks: checks.length,
  },
  issueCount: issues.length,
  issues,
}

console.log(JSON.stringify(result, null, 2))
if (issues.length) process.exitCode = 1
