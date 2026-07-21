const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { spawnSync } = require('child_process')
const matter = require('gray-matter')

const root = path.resolve(__dirname, '..')
const guideRoot = path.join(root, 'content/exams/fp3/guide/ch2')
const questionPath = path.join(root, 'content/exams/fp3/questions/ch2.json')
const cardPath = path.join(root, 'content/exams/fp3/cards/ch2.json')
const bodyHashes = require('../content/exams/fp3/a-grade/ch2-risk-management-body-hashes.js')
const riskCase = require('../content/exams/fp3/a-grade/ch2-risk-management-case-2026.js')
const coverage = require('../content/exams/fp3/a-grade/ch2-risk-management-coverage.js')
const protectedItems = require('../content/exams/fp3/annual/2026-protected-item-hashes.js')
const cardCurrentHashes = require('../content/exams/fp3/a-grade/card-learning-loop-current-hashes.js')

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

function cardCore(card) {
  return { id: card.id, front: card.front, back: card.back, tags: card.tags ?? [] }
}

function runValidator(name, script) {
  const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', env: process.env })
  childValidators.push({ name, passed: result.status === 0 })
  assert(result.status === 0, `sub-validator ${name} passes`)
}

runValidator('fp3-content', 'scripts/validate-fp3-content.js')
runValidator('fp3-batch0-baseline', 'scripts/validate-fp3-a-baseline.js')
runValidator('fp3-batch1-official-annual', 'scripts/validate-fp3-a-batch1.js')
runValidator('fp3-batch2-tax', 'scripts/validate-fp3-a-batch2.js')
runValidator('fp3-batch3-realestate-inheritance', 'scripts/validate-fp3-a-batch3.js')
runValidator('fp3-batch4-lifeplanning', 'scripts/validate-fp3-a-batch4.js')
runValidator('fp3-batch5-financial-assets', 'scripts/validate-fp3-a-batch5.js')
runValidator('fp3-batch7-card-learning-loop', 'scripts/validate-fp3-a-batch7.js')

const guideFiles = fs.readdirSync(guideRoot).filter(name => name.endsWith('.mdx')).sort()
assert(guideFiles.length === 4, 'risk-management chapter contains four guides')
assert(Object.keys(bodyHashes).length === 4, 'four risk-management body hashes are frozen')
const guideMetrics = []
for (const file of guideFiles) {
  const raw = fs.readFileSync(path.join(guideRoot, file), 'utf8')
  const parsed = matter(raw)
  const sectionId = path.basename(file, '.mdx')
  const body = parsed.content.replace(/\r\n/g, '\n').replace(/^\n+/, '')
  const chars = parsed.content.replace(/\s+/g, '').length
  const links = (parsed.content.match(/\]\(\/exams\/fp3\//g) || []).length
  assert(parsed.data.examId === 'fp3' && parsed.data.chapterId === 'ch2', `${sectionId}: metadata identifies fp3 ch2`)
  assert(parsed.data.lawReferenceDate === '2026-04-01', `${sectionId}: law reference date is 2026-04-01`)
  assert(parsed.data.dataAsOf === '2026-04-01', `${sectionId}: data date is 2026-04-01`)
  assert(parsed.data.annualReviewStatus === 'content-verified', `${sectionId}: content is marked verified`)
  assert(parsed.data.annualMetadataReviewedAt === '2026-07-21', `${sectionId}: review date is recorded`)
  assert(chars >= 1400, `${sectionId}: guide has at least 1,400 non-space characters`)
  assert(/^## この節でできるようになること/m.test(parsed.content), `${sectionId}: learning objectives exist`)
  assert(/よくある誤り/.test(parsed.content), `${sectionId}: error diagnosis exists`)
  assert(/自己点検/.test(parsed.content), `${sectionId}: self-check exists`)
  assert(links >= 3, `${sectionId}: at least three practice links exist`)
  assert(sha256(body) === bodyHashes[sectionId], `${sectionId}: body hash matches`)
  guideMetrics.push({ sectionId, chars, links })
}

const guideText = guideFiles.map(file => fs.readFileSync(path.join(guideRoot, file), 'utf8')).join('\n')
for (const token of [
  '必要保障額＝遺族の将来支出－遺族の将来収入－現在の金融資産',
  '一時所得＝800万円－500万円－特別控除50万円＝250万円',
  '500万円×法定相続人の数',
  '30％～50％',
  '建物5,000万円、家財1,000万円',
  '傷害：120万円',
  '死亡：3,000万円',
  '75万円～4,000万円',
  '急激・偶然・外来',
]) assert(guideText.includes(token), `guide content contains ${token}`)

const questionSet = JSON.parse(fs.readFileSync(questionPath, 'utf8'))
const choices = questionSet.questions.filter(question => !question.practiceSheet)
const practices = questionSet.questions.filter(question => question.practiceSheet)
const questionById = new Map(questionSet.questions.map(question => [question.id, question]))
const cardSet = JSON.parse(fs.readFileSync(cardPath, 'utf8'))

assert(choices.length === coverage.protectedChoiceQuestions, '20 original risk-management choice questions remain')
assert(practices.length === coverage.addedNonChoiceQuestions, '12 risk-management non-choice questions exist')
assert(practices.filter(question => question.type === 'numeric').length === 7, 'seven numeric risk-management practices exist')
assert(practices.filter(question => question.type === 'classification').length === 5, 'five classification risk-management practices exist')
assert(practices.reduce((sum, question) => sum + question.practiceSheet.fields.length, 0) === 38, '38 risk-management input fields exist')
assert(cardSet.cards.length === coverage.protectedCards, '20 risk-management cards remain')

for (const choice of choices) {
  const expectedHash = protectedItems.questions[choice.id]
  assert(Boolean(expectedHash), `${choice.id}: protected question hash exists`)
  assert(sha256(JSON.stringify(choice)) === expectedHash, `${choice.id}: original choice remains unchanged`)
}
for (const card of cardSet.cards) {
  assert(Boolean(cardCurrentHashes[card.id]), `${card.id}: Batch7 card hash exists`)
  assert(sha256(JSON.stringify(cardCore(card))) === cardCurrentHashes[card.id], `${card.id}: card core remains unchanged`)
  assert(Boolean(card.cardType && card.guideLink && card.questionLink), `${card.id}: card learning-loop metadata remains complete`)
}

const expectedPracticeIds = Array.from({ length: 12 }, (_, index) => `fp3-ch2-practice${index + 1}`)
assert(JSON.stringify(practices.map(question => question.id)) === JSON.stringify(expectedPracticeIds), 'practice ids are ordered from 1 through 12')
for (const question of practices) {
  const fields = question.practiceSheet.fields
  assert(Array.isArray(question.correctAnswer) && question.correctAnswer.length === fields.length, `${question.id}: answers match field count`)
  assert(question.correctAnswer.every((answer, index) => String(answer) === String(fields[index].correctAnswer)), `${question.id}: answer order is deterministic`)
  assert(Array.isArray(question.explanationSteps) && question.explanationSteps.length >= 2, `${question.id}: explanation steps exist`)
  assert(Array.isArray(question.commonMistakes) && question.commonMistakes.length >= 2, `${question.id}: common mistakes exist`)
  assert(question.guideLink.href.startsWith('/exams/fp3/guide/ch2/'), `${question.id}: guide link targets ch2`)
  assert(question.tags.includes('非選択式'), `${question.id}: non-choice tag exists`)
}

assert(coverage.examId === 'fp3' && coverage.chapterId === 'ch2' && coverage.batch === 6, 'coverage identifies FP3 Batch6')
assert(coverage.verifiedAt === '2026-07-21', 'coverage verification date is recorded')
assert(coverage.lawReferenceDate === '2026-04-01', 'coverage uses current law date')
assert(coverage.abilityCoverage.length === 2, 'two risk-management abilities are covered')
assert(JSON.stringify(coverage.abilityCoverage.map(item => item.abilityId)) === JSON.stringify(['fp3-ability-07', 'fp3-ability-08']), 'ability coverage is exactly 07 and 08')
const mappedPracticeIds = new Set(coverage.abilityCoverage.flatMap(item => item.practiceQuestionIds))
for (const question of practices) assert(mappedPracticeIds.has(question.id), `${question.id}: practice is mapped to an ability`)
assert(coverage.calculationAssertions.length === 8, 'eight Batch6 calculation assertions are registered')
for (const item of coverage.calculationAssertions) assert(questionById.has(item.questionId), `${item.id}: evidence question exists`)
assert(coverage.calculationAssertions.filter(item => item.baselineCalculationId === 'fp3-calc-05').length === 3, 'baseline insurance calculation gap has three evidence types')
for (const [key, value] of Object.entries(coverage.boundaries)) assert(value === true || value === false, `coverage boundary ${key} is explicit`)
assert(coverage.boundaries.existingChoiceQuestionsPreserved, 'coverage requires choice preservation')
assert(coverage.boundaries.existingCardsPreserved, 'coverage requires card preservation')
assert(coverage.boundaries.officialQuestionTextCopied === false, 'official question text is not copied')
assert(coverage.boundaries.mockExamIncluded === false, 'mock exam remains excluded')

const f = riskCase.facts
const c = riskCase.calculations
const recomputed = {
  requiredCoverage: f.futureExpenses - f.futureIncome - f.currentAssets,
  temporaryIncome: f.maturityBenefit - f.paidPremiums - f.temporaryIncomeDeduction,
  temporaryIncomeInclusion: (f.maturityBenefit - f.paidPremiums - f.temporaryIncomeDeduction) / 2,
  deathBenefitExemption: f.legalHeirs * f.deathBenefitExemptionPerHeir,
  deathBenefitTaxable: Math.max(0, f.deathBenefitReceived - f.legalHeirs * f.deathBenefitExemptionPerHeir),
  earthquakeBuildingAmount: Math.min(f.fireBuildingAmount * f.earthquakeRatio, f.earthquakeBuildingCap),
  earthquakeHouseholdAmount: Math.min(f.fireHouseholdAmount * f.earthquakeRatio, f.earthquakeHouseholdCap),
  compulsoryDeathPayment: Math.min(f.autoDeathDamage, f.compulsoryDeathLimit),
  voluntaryExcess: Math.max(0, f.autoDeathDamage - f.compulsoryDeathLimit),
  hospitalBenefit: f.hospitalDailyBenefit * f.hospitalDays,
  medicalBenefitTotal: f.hospitalDailyBenefit * f.hospitalDays + f.surgeryBenefit,
  incomePaymentMonths: Math.max(0, f.disabilityMonths - f.waitingMonths),
  incomeBenefitTotal: f.incomeMonthlyBenefit * Math.max(0, f.disabilityMonths - f.waitingMonths),
}
for (const [key, value] of Object.entries(recomputed)) assert(c[key] === value, `risk case ${key} recalculates to ${value}`)

const expectedAnswers = {
  'fp3-ch2-practice1': ['15000000'],
  'fp3-ch2-practice4': ['相続税', '所得税', '贈与税'],
  'fp3-ch2-practice5': ['2500000', '1250000'],
  'fp3-ch2-practice6': ['20000000', '10000000'],
  'fp3-ch2-practice7': ['20000000', '6000000'],
  'fp3-ch2-practice9': ['30000000', '8000000', '対象外'],
  'fp3-ch2-practice10': ['100000', '300000'],
  'fp3-ch2-practice12': ['5', '1250000', '契約者・被保険者・受取人'],
}
for (const [questionId, answers] of Object.entries(expectedAnswers)) assert(JSON.stringify(questionById.get(questionId).correctAnswer) === JSON.stringify(answers), `${questionId}: answers match verified case`)

assert(riskCase.lawReferenceDate === coverage.lawReferenceDate, 'case and coverage use same law date')
assert(riskCase.officialSources.length >= 10, 'risk case records at least ten official sources')
assert(riskCase.officialSources.every(url => /^https:\/\/(www\.)?(nta\.go\.jp|jili\.or\.jp|soudanguide\.sonpo\.or\.jp|mlit\.go\.jp|seihohogo\.jp)\//.test(url)), 'risk sources use official or authoritative domains')

const result = {
  summary: {
    guides: guideMetrics.length,
    minimumGuideChars: Math.min(...guideMetrics.map(item => item.chars)),
    guideLinks: guideMetrics.reduce((sum, item) => sum + item.links, 0),
    protectedChoiceQuestions: choices.length,
    protectedCards: cardSet.cards.length,
    nonChoiceQuestions: practices.length,
    numericPractices: practices.filter(question => question.type === 'numeric').length,
    classificationPractices: practices.filter(question => question.type === 'classification').length,
    inputFields: practices.reduce((sum, question) => sum + question.practiceSheet.fields.length, 0),
    calculationAssertions: coverage.calculationAssertions.length,
    abilitiesCovered: coverage.abilityCoverage.length,
    recomputations: Object.keys(recomputed).length,
    childValidators,
    checks: checks.length,
  },
  issueCount: issues.length,
  issues,
}
console.log(JSON.stringify(result, null, 2))
if (issues.length) process.exitCode = 1
